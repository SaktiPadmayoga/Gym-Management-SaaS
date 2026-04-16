<?php

namespace App\Http\Controllers\Tenant;

use App\Http\Controllers\Controller;
use App\Models\Tenant\Member;
use App\Models\Tenant\Membership;
use App\Models\Tenant\MembershipPlan;
use App\Http\Responses\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class MemberRegistrationController extends Controller
{
    public function register(Request $request)
    {
        $request->validate([
            'plan_id'  => ['required', 'uuid', 'exists:membership_plans,id'],
            'name'     => ['required', 'string', 'max:255'],
            'email'    => ['required', 'email', 'unique:members,email'],
            'password' => ['required', 'min:8', 'confirmed'],
            'phone'    => ['required', 'string', 'max:20'],
        ]);

        $plan = MembershipPlan::findOrFail($request->plan_id);

        try {
            DB::beginTransaction();

            // 1. Buat Data Member (Inactive)
            $member = Member::create([
                'name'         => $request->name,
                'email'        => $request->email,
                'password'     => Hash::make($request->password),
                'phone'        => $request->phone,
                'status'       => 'inactive',
                'is_active'    => false,
                'member_since' => null, 
                'qr_token'     => (string) Str::uuid(),
                // Ambil branch_id dari header X-Branch-Id jika ada (opsional untuk pendaftaran online)
                'home_branch_id'    => $request->header('X-Branch-Id') ?? $plan->branch_id,
            ]);

            // 2. Buat Record Membership (Pending)
            // Order ID unik untuk membedakan transaksi ini di Midtrans
            $orderId = 'MEM-' . strtoupper(Str::random(8)) . '-' . time();

            $membership = Membership::create([
                'member_id'               => $member->id,
                'membership_plan_id'      => $plan->id,
                'branch_id'               => $member->branch_id,
                'start_date'              => now()->toDateString(),
                'status'                  => 'pending', // Menunggu pembayaran
                'unlimited_checkin'       => $plan->unlimited_checkin,
                'remaining_checkin_quota' => $plan->checkin_quota_per_month,
                'notes'                   => 'Order ID: ' . $orderId,
            ]);

            // 3. Konfigurasi Midtrans
            // CATATAN: Di sistem SaaS, idealnya ServerKey diambil dari settingan tiap Tenant. 
            // Jika Anda menggunakan 1 akun Midtrans master, gunakan config bawaan.
            \Midtrans\Config::$serverKey = config('midtrans.server_key'); // Sesuaikan pemanggilan key Anda
            \Midtrans\Config::$isProduction = config('midtrans.is_production', false);
            \Midtrans\Config::$isSanitized = true;
            \Midtrans\Config::$is3ds = true;

            $params = [
                'transaction_details' => [
                    'order_id'     => $orderId,
                    'gross_amount' => (int) $plan->price,
                ],
                'customer_details' => [
                    'first_name' => $member->name,
                    'email'      => $member->email,
                    'phone'      => $member->phone,
                ],
                'item_details' => [
                    [
                        'id'       => $plan->id,
                        'price'    => (int) $plan->price,
                        'quantity' => 1,
                        'name'     => substr($plan->name, 0, 50), // Midtrans membatasi panjang nama item
                    ]
                ]
            ];

            $snapToken = \Midtrans\Snap::getSnapToken($params);

            DB::commit();

            return ApiResponse::success([
                'member'     => $member,
                'order_id'   => $orderId,
                'snap_token' => $snapToken,
            ], 'Pendaftaran berhasil. Silakan selesaikan pembayaran.', 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return ApiResponse::error('Gagal memproses pendaftaran.', config('app.debug') ? $e->getMessage() : null, 500);
        }
    }

    /**
     * Webhook Handler khusus untuk pembayaran member (Berada di rute Tenant)
     */
    public function webhook(Request $request)
    {
        $serverKey = config('midtrans.server_key');
        $hashed = hash("sha512", $request->order_id . $request->status_code . $request->gross_amount . $serverKey);
        
        if ($hashed == $request->signature_key) {
            if ($request->transaction_status == 'capture' || $request->transaction_status == 'settlement') {
                
                // Cari membership berdasarkan Order ID di kolom notes (atau buat kolom khusus order_id)
                $membership = Membership::where('notes', 'like', "%{$request->order_id}%")->first();
                
                if ($membership && $membership->status === 'pending') {
                    DB::transaction(function () use ($membership) {
                        $plan = $membership->plan;

                        // Aktifkan Membership
                        $membership->update([
                            'status'     => 'active',
                            'start_date' => now(),
                            'end_date'   => now()->addDays($plan->duration_days ?? 30), // Sesuaikan dengan logika durasi plan Anda
                        ]);

                        // Aktifkan Member
                        $membership->member->update([
                            'status'       => 'active',
                            'is_active'    => true,
                            'member_since' => now(),
                        ]);
                    });
                }
            }
        }
        return response()->json(['status' => 'success']);
    }
}