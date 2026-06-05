<?php

namespace App\Services;

use App\Models\Tenant;
use App\Models\Tenant\TenantNotification;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class NotificationService
{
    public function createCentral(string $type, string $title, string $message): void
    {
        DB::connection('central')->table('notifications')->insert([
            'id'         => (string) Str::uuid(),
            'type'       => $type,
            'title'      => $title,
            'message'    => $message,
            'is_read'    => false,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    public function createTenant(?string $branchId, ?string $staffId, string $type, string $title, string $message): void
    {
        TenantNotification::create([
            'id'        => (string) Str::uuid(),
            'branch_id' => $branchId,
            'staff_id'  => $staffId,
            'type'      => $type,
            'title'     => $title,
            'message'   => $message,
            'is_read'   => false,
        ]);
    }

    public function createTenantForTenant(Tenant $tenant, ?string $branchId, string $type, string $title, string $message): void
    {
        try {
            $tenant->run(function () use ($branchId, $type, $title, $message) {
                $this->createTenant($branchId, null, $type, $title, $message);
            });
        } catch (\Throwable $e) {
            Log::error('[NotificationService] Failed creating tenant notification', [
                'tenant_id' => $tenant->id,
                'type'      => $type,
                'error'     => $e->getMessage(),
            ]);
        }
    }

    public function notifyTenantDeactivated(Tenant $tenant, string $status, ?string $message = null): void
    {
        $this->createTenantForTenant(
            $tenant,
            null,
            'tenant_deactivated',
            'Gym Nonaktif',
            $message ?? "Gym {$tenant->name} telah dinonaktifkan dengan status {$status}."
        );
    }

    public function notifyDomainRequestApproved(Tenant $tenant, ?string $branchId, string $requestedDomain): void
    {
        $this->createTenantForTenant(
            $tenant,
            $branchId,
            'domain_request_approved',
            'Pengajuan Domain Disetujui',
            "Pengajuan ganti domain ke {$requestedDomain} telah disetujui oleh platform."
        );
    }

    public function notifyDomainRequestRejected(Tenant $tenant, ?string $branchId, string $requestedDomain, ?string $rejectionReason = null): void
    {
        $reason = $rejectionReason ? " Alasan: {$rejectionReason}" : '';
        $this->createTenantForTenant(
            $tenant,
            $branchId,
            'domain_request_rejected',
            'Pengajuan Domain Ditolak',
            "Pengajuan ganti domain ke {$requestedDomain} ditolak.{$reason}"
        );
    }
}
