<?php

namespace App\Http\Controllers\Tenant;

use App\Http\Controllers\Controller;
use App\Models\Tenant\PtPackage;
use App\Http\Responses\ApiResponse;
use Illuminate\Http\Request;

class PtPackageController extends Controller
{
    /**
     * Menampilkan daftar PT Package (dengan filter)
     */
    public function index(Request $request)
    {
        // Relasi wajib dibawa agar FE bisa render nama member & nama paket
        $query = PtPackage::with(['member', 'plan']);

        // Filter berdasarkan status (misal: hanya yang 'active')
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        // Pencarian berdasarkan nama member
        if ($request->filled('search')) {
            $search = $request->search;
            $query->whereHas('member', function ($q) use ($search) {
                $q->where('name', 'ilike', "%{$search}%");
            });
        }

        // Filter by branch jika diperlukan oleh sistemmu
        if ($branchId = $request->header('X-Branch-Id')) {
            $query->where('branch_id', $branchId);
        }

        $packages = $query->orderBy('created_at', 'desc')
                          ->paginate($request->get('per_page', 15));

        return ApiResponse::success([
            'data' => $packages->items(),
            'meta' => [
                'total'        => $packages->total(),
                'per_page'     => $packages->perPage(),
                'current_page' => $packages->currentPage(),
                'last_page'    => $packages->lastPage(),
            ],
        ], 'Daftar paket PT berhasil diambil');
    }

    /**
     * Menampilkan detail satu PT Package
     */
    public function show($id)
    {
        $package = PtPackage::with(['member', 'plan', 'invoice'])->findOrFail($id);
        
        return ApiResponse::success($package, 'Detail paket PT berhasil diambil');
    }
}