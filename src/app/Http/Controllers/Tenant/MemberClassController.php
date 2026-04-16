<?php

namespace App\Http\Controllers\Tenant;

use App\Http\Controllers\Controller;
use App\Http\Resources\Tenant\ClassScheduleResource;
use App\Http\Resources\Tenant\ClassAttendanceResource;
use App\Http\Responses\ApiResponse;
use App\Models\Tenant\ClassSchedule;
use App\Models\Tenant\ClassAttendance;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class MemberClassController extends Controller
{
    // GET /member/class-schedules
    // Member lihat jadwal yang tersedia
    public function index(Request $request)
    {
        $member   = $request->user('member');
        $branchId = $request->header('X-Branch-Id');

        $query = ClassSchedule::with(['classPlan', 'instructor', 'branch'])
            ->where('status', 'scheduled')
            ->where('date', '>=', now()->toDateString());

        if ($branchId) {
            $query->where('branch_id', $branchId);
        }

        if ($request->filled('date')) {
            $query->whereDate('date', $request->date);
        }

        if ($request->filled('class_plan_id')) {
            $query->where('class_plan_id', $request->class_plan_id);
        }

        $data = $query->orderBy('date')->orderBy('start_at')
            ->paginate($request->per_page ?? 15);

        // Tandai jadwal mana yang sudah di-booking member ini
        $bookedIds = ClassAttendance::where('member_id', $member->id)
            ->whereIn('class_schedule_id', collect($data->items())->pluck('id'))
            ->whereNotIn('status', ['cancelled'])
            ->pluck('class_schedule_id')
            ->toArray();

        $items = collect($data->items())->map(function ($schedule) use ($bookedIds) {
            $schedule->is_booked_by_me = in_array($schedule->id, $bookedIds);
            return $schedule;
        });

        return ApiResponse::success([
            'data' => ClassScheduleResource::collection($items),
            'meta' => [
                'total'        => $data->total(),
                'per_page'     => $data->perPage(),
                'current_page' => $data->currentPage(),
                'next_page_url'=> $data->nextPageUrl(),
                'prev_page_url'=> $data->previousPageUrl(),
            ],
        ]);
    }

    // POST /member/class-schedules/:id/book
    // Member booking kelas sendiri
    public function book(Request $request, string $id)
    {
        $member   = $request->user('member');
        $schedule = ClassSchedule::with('classPlan')->findOrFail($id);

        if ($schedule->isCancelled()) {
            return ApiResponse::error('Jadwal sudah dibatalkan.', null, 422);
        }

        if (!$schedule->hasAvailableSlot()) {
            return ApiResponse::error('Kelas sudah penuh.', null, 422);
        }

        $alreadyBooked = ClassAttendance::where('class_schedule_id', $id)
            ->where('member_id', $member->id)
            ->whereNotIn('status', ['cancelled'])
            ->exists();

        if ($alreadyBooked) {
            return ApiResponse::error('Anda sudah terdaftar di kelas ini.', null, 422);
        }

        try {
            DB::beginTransaction();

            $attendance = ClassAttendance::create([
                'class_schedule_id' => $id,
                'member_id'         => $member->id,
                'checked_in_by'     => null, // self booking
                'status'            => 'booked',
                'booked_at'         => now(),
            ]);

            $schedule->increment('total_booked');

            DB::commit();

            $attendance->load(['schedule.classPlan', 'schedule.instructor']);
            return ApiResponse::success(
                new ClassAttendanceResource($attendance),
                'Berhasil booking kelas. Sampai jumpa!',
                201
            );
        } catch (\Exception $e) {
            DB::rollBack();
            return ApiResponse::error('Gagal booking kelas.', null, 500);
        }
    }

    // DELETE /member/class-schedules/:id/book
    // Member cancel booking sendiri
    public function cancelBook(Request $request, string $id)
    {
        $member = $request->user('member');

        $attendance = ClassAttendance::where('class_schedule_id', $id)
            ->where('member_id', $member->id)
            ->whereNotIn('status', ['cancelled'])
            ->firstOrFail();

        if ($attendance->status === 'attended') {
            return ApiResponse::error('Tidak bisa cancel — sudah hadir.', null, 422);
        }

        try {
            DB::beginTransaction();

            $attendance->update([
                'status'       => 'cancelled',
                'cancelled_at' => now(),
            ]);

            $attendance->schedule->decrement('total_booked');

            DB::commit();

            return ApiResponse::success(null, 'Booking berhasil dibatalkan');
        } catch (\Exception $e) {
            DB::rollBack();
            return ApiResponse::error('Gagal membatalkan booking.', null, 500);
        }
    }

    // GET /member/my-classes
    // Riwayat kelas member
    public function myClasses(Request $request)
    {
        $member = $request->user('member');

        $attendances = ClassAttendance::with([
            'schedule.classPlan',
            'schedule.instructor',
            'schedule.branch',
        ])
        ->where('member_id', $member->id)
        ->when($request->status, fn($q) => $q->where('status', $request->status))
        ->orderByDesc('created_at')
        ->paginate($request->per_page ?? 15);

        return ApiResponse::success([
            'data' => ClassAttendanceResource::collection($attendances->items()),
            'meta' => [
                'total'        => $attendances->total(),
                'per_page'     => $attendances->perPage(),
                'current_page' => $attendances->currentPage(),
                'next_page_url'=> $attendances->nextPageUrl(),
                'prev_page_url'=> $attendances->previousPageUrl(),
            ],
        ]);
    }
}