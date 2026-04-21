<?php

namespace App\Http\Controllers\Tenant;

use App\Http\Controllers\Controller;
use App\Http\Requests\Tenant\StoreClassScheduleRequest;
use App\Http\Requests\Tenant\UpdateClassScheduleRequest;
use App\Http\Resources\Tenant\ClassScheduleResource;
use App\Http\Resources\Tenant\ClassAttendanceResource;
use App\Http\Requests\Tenant\StoreClassAttendanceRequest;
use App\Http\Responses\ApiResponse;
use App\Models\Tenant\ClassSchedule;
use App\Models\Tenant\ClassAttendance;
use App\Services\ClassBookingService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ClassScheduleController extends Controller
{
    public function __construct(
        protected ClassBookingService $bookingService
    ) {}

    // GET /class-schedules
    public function index(Request $request)
    {
        $query = ClassSchedule::with(['classPlan', 'instructor', 'branch'])
            ->latest('date');

        if ($request->filled('branch_id')) {
            $query->where('branch_id', $request->branch_id);
        } elseif ($branchId = $request->header('X-Branch-Id')) {
            $query->where('branch_id', $branchId);
        }

        if ($request->filled('date')) {
            $query->whereDate('date', $request->date);
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('class_plan_id')) {
            $query->where('class_plan_id', $request->class_plan_id);
        }

        if ($request->filled('instructor_id')) {
            $query->where('instructor_id', $request->instructor_id);
        }

        if ($request->filled('date_from') && $request->filled('date_to')) {
            $query->whereBetween('date', [$request->date_from, $request->date_to]);
        }

        $data = $query->paginate($request->per_page ?? 15);

        return ApiResponse::success([
            'data' => ClassScheduleResource::collection($data->items()),
            'meta' => [
                'total'        => $data->total(),
                'per_page'     => $data->perPage(),
                'current_page' => $data->currentPage(),
                'next_page_url'=> $data->nextPageUrl(),
                'prev_page_url'=> $data->previousPageUrl(),
            ],
        ]);
    }

    // GET /class-schedules/:id
    public function show(string $id)
    {
        $schedule = ClassSchedule::with([
            'classPlan', 'instructor', 'branch',
            'attendances.member', 'attendances.checkedInBy',
        ])->findOrFail($id);

        return ApiResponse::success(new ClassScheduleResource($schedule));
    }

    // POST /class-schedules
    public function store(StoreClassScheduleRequest $request)
    {
        $data = $request->validated();
        $data['branch_id'] = $request->header('X-Branch-Id');

        $schedule = ClassSchedule::create($data);
        $schedule->load(['classPlan', 'instructor', 'branch']);

        return ApiResponse::success(
            new ClassScheduleResource($schedule),
            'Jadwal kelas berhasil dibuat',
            201
        );
    }

    // PUT /class-schedules/:id
    public function update(UpdateClassScheduleRequest $request, string $id)
    {
        $schedule = ClassSchedule::findOrFail($id);
        $schedule->update($request->validated());
        $schedule->load(['classPlan', 'instructor', 'branch']);

        return ApiResponse::success(
            new ClassScheduleResource($schedule),
            'Jadwal kelas berhasil diperbarui'
        );
    }

    // DELETE /class-schedules/:id
    public function destroy(string $id)
    {
        $schedule = ClassSchedule::findOrFail($id);

        if ($schedule->total_booked > 0) {
            return ApiResponse::error(
                'Tidak bisa menghapus jadwal yang sudah ada peserta.',
                null, 422
            );
        }

        $schedule->delete();
        return ApiResponse::success(null, 'Jadwal kelas berhasil dihapus');
    }

    // PATCH /class-schedules/:id/cancel
    public function cancel(Request $request, string $id)
    {
        $request->validate([
            'cancelled_reason' => ['nullable', 'string'],
        ]);

        $schedule = ClassSchedule::findOrFail($id);

        if ($schedule->status === 'cancelled') {
            return ApiResponse::error('Jadwal sudah dibatalkan.', null, 422);
        }

        $schedule->update([
            'status'           => 'cancelled',
            'cancelled_reason' => $request->cancelled_reason,
        ]);

        return ApiResponse::success(
            new ClassScheduleResource($schedule),
            'Jadwal kelas dibatalkan'
        );
    }

    // =============================================
    // ATTENDANCE — dipakai staff (manual check-in)
    // =============================================

    // GET /class-schedules/:id/attendances
    public function attendances(string $id)
    {
        $schedule = ClassSchedule::findOrFail($id);
        $attendances = $schedule->attendances()
            ->with(['member', 'checkedInBy'])
            ->get();

        return ApiResponse::success(
            ClassAttendanceResource::collection($attendances)
        );
    }

    // POST /class-schedules/:id/attendances
    // Staff menambahkan member ke jadwal (manual booking)
    public function addAttendance(StoreClassAttendanceRequest $request, string $id)
    {
        $schedule = ClassSchedule::with('classPlan')->findOrFail($id);

        // Lazy-load member dari request
        $member = \App\Models\Tenant\Member::findOrFail($request->member_id);

        try {
            $result = $this->bookingService->book(
                schedule: $schedule,
                member:   $member,
                staffId:  $request->user('staff')?->id,
                notes:    $request->notes,
            );
        } catch (\InvalidArgumentException $e) {
            return ApiResponse::error($e->getMessage(), null, 422);
        } catch (\Exception $e) {
            return ApiResponse::error('Gagal mendaftarkan member.', null, 500);
        }

        // Kelas gratis — attendance langsung confirmed
        if ($result['snap_token'] === null) {
            return ApiResponse::success(
                new ClassAttendanceResource($result['attendance']),
                'Member berhasil didaftarkan ke kelas',
                201
            );
        }

        // Kelas berbayar — kembalikan snap_token untuk pembayaran
        return ApiResponse::success(
            [
                'attendance' => new ClassAttendanceResource($result['attendance']),
                'invoice'    => [
                    'id'             => $result['invoice']->id,
                    'invoice_number' => $result['invoice']->invoice_number,
                    'total_amount'   => $result['invoice']->total_amount,
                    'due_date'       => $result['invoice']->due_date,
                ],
                'snap_token' => $result['snap_token'],
            ],
            'Silakan selesaikan pembayaran',
            201
        );
    }

    // PATCH /class-schedules/:id/attendances/:attendanceId/checkin
    // Staff mark member sebagai hadir
    public function markAttended(Request $request, string $id, string $attendanceId)
    {
        $attendance = ClassAttendance::where('class_schedule_id', $id)
            ->findOrFail($attendanceId);

        if ($attendance->status === 'attended') {
            return ApiResponse::error('Member sudah di-mark hadir.', null, 422);
        }

        if ($attendance->status === 'cancelled') {
            return ApiResponse::error('Attendance sudah dibatalkan.', null, 422);
        }

        // Untuk kelas berbayar, pastikan pembayaran sudah confirmed
        if ($attendance->payment_status === 'pending') {
            return ApiResponse::error('Pembayaran belum dikonfirmasi.', null, 422);
        }

        try {
            DB::beginTransaction();

            $attendance->update([
                'status'        => 'attended',
                'attended_at'   => now(),
                'checked_in_by' => $request->user('staff')?->id,
            ]);

            $attendance->schedule->increment('total_attended');

            DB::commit();

            $attendance->load(['member', 'checkedInBy']);
            return ApiResponse::success(
                new ClassAttendanceResource($attendance),
                'Member berhasil di-mark hadir'
            );
        } catch (\Exception $e) {
            DB::rollBack();
            return ApiResponse::error('Gagal update kehadiran.', null, 500);
        }
    }

    // PATCH /class-schedules/:id/attendances/:attendanceId/cancel
    public function cancelAttendance(Request $request, string $id, string $attendanceId)
    {
        $attendance = ClassAttendance::where('class_schedule_id', $id)
            ->findOrFail($attendanceId);

        if ($attendance->status === 'cancelled') {
            return ApiResponse::error('Attendance sudah dibatalkan.', null, 422);
        }

        try {
            DB::beginTransaction();

            $attendance->update([
                'status'       => 'cancelled',
                'cancelled_at' => now(),
            ]);

            // Kembalikan slot HANYA jika sudah paid/free (sudah dihitung ke total_booked)
            if ($attendance->payment_status !== 'pending') {
                $attendance->schedule->decrement('total_booked');
            }

            DB::commit();

            return ApiResponse::success(null, 'Attendance dibatalkan');
        } catch (\Exception $e) {
            DB::rollBack();
            return ApiResponse::error('Gagal membatalkan attendance.', null, 500);
        }
    }

    /**
     * POST /api/class-schedules/{id}/book-by-staff
     * Endpoint khusus Staff/POS untuk mendaftarkan member dan bayar di tempat.
     */
    public function bookByStaff(Request $request, $id, \App\Services\ClassBookingService $bookingService)
    {
        $request->validate([
            'member_id'      => 'required|uuid|exists:members,id',
            'payment_method' => 'nullable|in:cash,midtrans', // Frontend kirim ini
        ]);

        try {
            $schedule = \App\Models\Tenant\ClassSchedule::with('classPlan')->findOrFail($id);
            $member   = \App\Models\Tenant\Member::findOrFail($request->member_id);
            
            // Ambil ID staff yang sedang login (sesuaikan dengan guard auth kamu)
            $staffId  = auth('staff')->id(); 
            
            $paymentMethod = $request->payment_method ?? 'cash';

            // Panggil service yang sudah kita update
            $result = $bookingService->book($schedule, $member, $staffId, 'Booked via Staff POS', $paymentMethod);

            return \App\Http\Responses\ApiResponse::success([
                'attendance' => $result['attendance'],
                'invoice'    => $result['invoice'],
                'snap_token' => $result['snap_token'], // Frontend butuh ini untuk memunculkan popup
            ], 'Pendaftaran kelas berhasil diproses.', 201);

        } catch (\InvalidArgumentException $e) {
            return \App\Http\Responses\ApiResponse::error($e->getMessage(), null, 422);
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('[StaffClassBooking] Gagal', [
                'schedule_id' => $id,
                'error'       => $e->getMessage()
            ]);
            return \App\Http\Responses\ApiResponse::error('Gagal memproses pendaftaran. Silakan coba lagi.', null, 500);
        }
    }
}