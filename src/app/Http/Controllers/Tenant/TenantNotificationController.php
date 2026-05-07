<?php

namespace App\Http\Controllers\Tenant;

use App\Http\Controllers\Controller;
use App\Http\Responses\ApiResponse;
use App\Models\Tenant\TenantNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class TenantNotificationController extends Controller
{
    public function index(Request $request)
    {
        try {
            $staff = $request->user('staff');
            
            $activeBranchId = $request->header('X-Branch-Id'); 

            $query = TenantNotification::with(['branch:id,name']);

            if ($staff->role !== 'owner') {
                $query->where(function ($q) use ($activeBranchId) {
                    $q->where('branch_id', $activeBranchId) 
                      ->orWhereNull('branch_id');
                });
            }

            $notifications = $query->orderBy('created_at', 'desc')->take(20)->get();

            $unreadQuery = TenantNotification::where('is_read', false);
            if ($staff->role !== 'owner') {
                $unreadQuery->where(function ($q) use ($activeBranchId) {
                    $q->where('branch_id', $activeBranchId) ->orWhereNull('branch_id');
                });
            }
            $unreadCount = $unreadQuery->count();

            // Format data untuk Frontend
            $formattedData = $notifications->map(function ($notif) {
                return [
                    'id'          => $notif->id,
                    'type'        => $notif->type,
                    'title'       => $notif->title,
                    'message'     => $notif->message,
                    'is_read'     => $notif->is_read,
                    'branch_name' => $notif->branch ? $notif->branch->name : null,
                    'created_at'  => $notif->created_at->toIso8601String(),
                ];
            });

            return ApiResponse::success([
                'notifications' => $formattedData,
                'unread_count'  => $unreadCount
            ], 'Notifikasi berhasil dimuat');

        } catch (\Exception $e) {
            Log::error('[TenantNotification Index] ' . $e->getMessage());
            return ApiResponse::error('Gagal memuat notifikasi', null, 500);
        }
    }

    public function markAsRead(Request $request, $id)
    {
        $staff = $request->user('staff');
        $activeBranchId = $request->header('X-Branch-Id'); 
        
        $notification = TenantNotification::find($id);

        if (!$notification) {
            return ApiResponse::error('Notifikasi tidak ditemukan', null, 404);
        }

        if ($staff->role !== 'owner' && $notification->branch_id !== null && $notification->branch_id !== $activeBranchId) {
            return ApiResponse::error('Unauthorized', null, 403);
        }
        $notification->is_read = true;
        $notification->save();

        return ApiResponse::success(null, 'Notifikasi dibaca');
    }

    public function markAllAsRead(Request $request)
    {
        $staff = $request->user('staff');
        $activeBranchId = $request->header('X-Branch-Id');

        $query = TenantNotification::where('is_read', false);

        if ($staff->role !== 'owner') {
            $query->where(function ($q) use ($activeBranchId) {
                $q->where('branch_id', $activeBranchId)->orWhereNull('branch_id');
            });
        }
        $query->update(['is_read' => true]);

        return ApiResponse::success(null, 'Semua notifikasi dibaca');
    }
}