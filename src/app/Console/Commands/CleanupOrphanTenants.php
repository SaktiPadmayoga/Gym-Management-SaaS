<?php

namespace App\Console\Commands;

use App\Models\Tenant;
use Illuminate\Console\Command;

class CleanupOrphanTenants extends Command
{
    protected $signature   = 'tenants:cleanup';
    protected $description = 'Hapus tenant yang gagal provisioning';

    public function handle(): void
    {
        $orphans = Tenant::whereIn('status', ['provisioning', 'failed'])
            ->where('created_at', '<', now()->subMinutes(30))
            ->get();

        if ($orphans->isEmpty()) {
            $this->info('Tidak ada orphan tenant.');
            return;
        }

        /** @var Tenant $tenant */
        foreach ($orphans as $tenant) {
            try {
                $tenant->delete(); // otomatis trigger DeleteDatabase
                $this->info("Cleaned: {$tenant->id} ({$tenant->slug})");
            } catch (\Exception $e) {
                $this->error("Gagal hapus {$tenant->id}: {$e->getMessage()}");
            }
        }

        $this->info('Done.');
    }
}