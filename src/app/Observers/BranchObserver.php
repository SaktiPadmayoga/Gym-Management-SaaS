<?php

namespace App\Observers;

use App\Models\Branch;
use Database\Seeders\BranchSettingSeeder;

class BranchObserver
{
    /**
     * Otomatis seed default settings saat branch baru dibuat
     */
    public function created(Branch $branch): void
    {
        BranchSettingSeeder::defaultSettings($branch->id);
    }
}