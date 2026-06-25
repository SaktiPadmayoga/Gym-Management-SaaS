<?php

namespace App\Http\Controllers\Tenant;

use App\Http\Controllers\Controller;
use App\Http\Resources\Tenant\ClassAttendanceResource;
use App\Http\Responses\ApiResponse;
use App\Models\Tenant\ClassAttendance;
use App\Models\Tenant\ClassSchedule;
use App\Services\ClassBookingService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class MemberClassBookingController extends Controller
{
    public function __construct(
        protected ClassBookingService $bookingService
    ) {}

    public function book(Request $request, string $scheduleId)
    {
        $schedule = ClassSchedule::with('classPlan')->findOrFail($scheduleId);
        $member   = $request->user('member');

        try {
            $result = $this->bookingService->book(
                schedule: $schedule,
                member:   $member,
                staffId:  null,
                notes:    $request->notes,
            );
        } catch (\InvalidArgumentException $e) {
            return ApiResponse::error($e->getMessage(), null, 422);
        } catch (\Exception $e) {
            Log::error('[MemberBooking] Exception', [
                'message' => $e->getMessage(),
                'file'    => $e->getFile(),
                'line'    => $e->getLine(),
            ]);
            return ApiResponse::error('Gagal melakukan booking.', null, 500);
        }

        return ApiResponse::success(
            [
                'attendance' => new ClassAttendanceResource($result['attendance']),
                'invoice'    => $result['invoice'] ? [
                    'id'             => $result['invoice']->id,
                    'invoice_number' => $result['invoice']->invoice_number,
                    'total_amount'   => $result['invoice']->total_amount,
                    'due_date'       => $result['invoice']->due_date,
                ] : null,
                'snap_token' => $result['snap_token'], 
            ],
            $result['snap_token']
                ? 'Silakan selesaikan pembayaran.'
                : 'Berhasil booking kelas. Sampai jumpa!',
            201
        );
    }

    public function cancel(Request $request, string $scheduleId)
    {
        $member = $request->user('member');

        $attendance = ClassAttendance::where('class_schedule_id', $scheduleId)
            ->where('member_id', $member->id)
            ->whereNotIn('status', ['cancelled'])
            ->firstOrFail();

        if ($attendance->payment_status === 'paid') {
            return ApiResponse::error(
                'Kelas berbayar tidak bisa dibatalkan langsung. Hubungi staff.',
                null,
                422
            );
        }

        $attendance->update([
            'status'       => 'cancelled',
            'cancelled_at' => now(),
        ]);

        $attendance->classSchedule()->decrement('total_booked');

        return ApiResponse::success(null, 'Booking berhasil dibatalkan.');
    }
}