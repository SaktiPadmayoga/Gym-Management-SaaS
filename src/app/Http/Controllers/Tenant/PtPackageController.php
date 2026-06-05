<?php

namespace App\Http\Controllers\Tenant;

use App\Http\Controllers\Controller;
use App\Models\Tenant\PtPackage;
use App\Http\Responses\ApiResponse;
use Illuminate\Http\Request;

class PtPackageController extends Controller
{
    /**
     * Helper to get base query with branch scoping for non-owners/admins
     */
    private function getPtPackageQuery(Request $request)
    {
        $query = PtPackage::query();
        $staff = $request->user();

        if ($staff && !$staff->isOwner() && $staff->role !== 'admin') {
            $activeBranchId = $request->header('X-Branch-Id');
            $query->where('branch_id', $activeBranchId);
        }

        return $query;
    }

    /**
     * Menampilkan daftar PT Package (dengan filter)
     */
    public function index(Request $request)
    {
        $staff = $request->user();
        $query = $this->getPtPackageQuery($request)->with(['member', 'plan']);

        // Filter branch for global managers (owner/admin)
        if ($staff && ($staff->isOwner() || $staff->role === 'admin')) {
            if ($request->filled('branch_id')) {
                $query->where('branch_id', $request->branch_id);
            } elseif ($branchId = $request->header('X-Branch-Id')) {
                $query->where('branch_id', $branchId);
            }
        }

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
    public function show(Request $request, $id)
    {
        $package = $this->getPtPackageQuery($request)
            ->with(['member', 'plan', 'invoice'])
            ->findOrFail($id);
        
        return ApiResponse::success($package, 'Detail paket PT berhasil diambil');
    }
}