<?php

namespace App\Services;

use App\Models\Tenant\Member;
use App\Models\Tenant\MembershipPlan;

class MidtransService
{
    public function __construct()
    {
        \Midtrans\Config::$serverKey    = config('midtrans.server_key');
        \Midtrans\Config::$isProduction = config('midtrans.is_production', false);
        \Midtrans\Config::$isSanitized  = true;
        \Midtrans\Config::$is3ds        = true;
    }

    /**
     * Ambil Snap Token dari Midtrans untuk pembayaran membership baru.
     */
    public function getSnapToken(
        string $orderId,
        int $grossAmount,
        Member $member,  
        mixed $plan
    ): string {
        $params = [
            'transaction_details' => [
                'order_id'     => $orderId,
                'gross_amount' => $grossAmount,
            ],
            'customer_details' => [
                'first_name' => $member->name,
                'email'      => $member->email,
                'phone'      => $member->phone,
            ],
            'item_details' => [
                [
                    'id'       => $plan->id,
                    'price'    => $grossAmount,
                    'quantity' => 1,
                    'name'     => substr($plan->name, 0, 50), // Midtrans max 50 char
                ],
            ],
        ];

        \Illuminate\Support\Facades\Log::info('Payload Midtrans:', $params);

        return \Midtrans\Snap::getSnapToken($params);
    }

    /**
     * Validasi signature key dari webhook Midtrans.
     */
    public function validateSignature(
        string $orderId,
        string $statusCode,
        string $grossAmount,
        string $incomingSignature
    ): bool {
        $serverKey = config('midtrans.server_key');
        $expected  = hash('sha512', $orderId . $statusCode . $grossAmount . $serverKey);

        return hash_equals($expected, $incomingSignature);
    }
}