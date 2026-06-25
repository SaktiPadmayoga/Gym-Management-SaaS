<?php
namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Http\Responses\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CentralNotificationController extends Controller
{
    public function index()
    {
        $notifications = DB::connection('central')->table('notifications')
            ->orderBy('created_at', 'desc')
            ->take(20)
            ->get();

        $unreadCount = DB::connection('central')->table('notifications')
            ->where('is_read', false)
            ->count();

        return ApiResponse::success([
            'notifications' => $notifications,
            'unread_count'  => $unreadCount
        ], 'Notifikasi berhasil diambil');
    }


    
    public function markAsRead($id)
    {
        DB::connection('central')->table('notifications')
            ->where('id', $id)
            ->update(['is_read' => true, 'updated_at' => now()]);

        return ApiResponse::success(null, 'Notifikasi dibaca');
    }

    public function markAllAsRead()
    {
        DB::connection('central')->table('notifications')
            ->where('is_read', false)
            ->update(['is_read' => true, 'updated_at' => now()]);

        return ApiResponse::success(null, 'Semua notifikasi dibaca');
    }
}