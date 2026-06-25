<?php

namespace App\Http\Controllers\Tenant;

use App\Http\Controllers\Controller;
use App\Http\Requests\Tenant\UpdateBranchSettingRequest;
use App\Http\Resources\Tenant\BranchSettingResource;
use App\Models\Tenant\BranchSetting;
use App\Http\Responses\ApiResponse;
use Database\Seeders\BranchSettingSeeder;
use Illuminate\Http\Request;

class BranchSettingController extends Controller
{

    public function index(Request $request, string $branchId)
    {
        $settings = BranchSetting::where('branch_id', $branchId)
            ->when($request->filled('group'), fn($q) => $q->where('group', $request->group))
            ->get();

        $grouped = $settings->groupBy('group')->map(function ($items) {
            return $items->mapWithKeys(fn($s) => [$s->key => [
                'value'     => $s->casted_value,
                'type'      => $s->type,
                'is_public' => $s->is_public,
            ]]);
        });

        return ApiResponse::success([
            'branch_id' => $branchId,
            'settings'  => $grouped,
        ]);
    }


    public function public(string $branchId)
    {
        $settings = BranchSetting::where('branch_id', $branchId)
            ->where('is_public', true)
            ->get()
            ->mapWithKeys(fn($s) => [$s->key => $s->casted_value]);

        return ApiResponse::success($settings);
    }


    public function update(UpdateBranchSettingRequest $request, string $branchId)
    {
        $updated = [];

        foreach ($request->settings as $item) {
            $value = $item['value'];

            if (is_array($value)) {
                $value = json_encode($value);
            }

            $setting = BranchSetting::updateOrCreate(
                ['branch_id' => $branchId, 'key' => $item['key']],
                [
                    'group'     => $item['group'],
                    'value'     => $value !== null ? (string) $value : null,
                    'type'      => $item['type'],
                    'is_public' => $item['is_public'] ?? false,
                ]
            );

            $updated[] = $setting;
        }

        return ApiResponse::success(
            BranchSettingResource::collection(collect($updated)),
            'Settings updated successfully'
        );
    }


    public function updateGroup(Request $request, string $branchId, string $group)
    {
        $validated = $request->validate([
            '*' => ['nullable'],
        ]);

        $updated = [];

        foreach ($request->all() as $key => $value) {
            // Skip non-setting keys
            if (in_array($key, ['_method', '_token'])) continue;

            $existing = BranchSetting::where('branch_id', $branchId)
                ->where('key', $key)
                ->first();

            if (!$existing) continue; // hanya update yang sudah ada

            $castedValue = is_array($value) ? json_encode($value) : (string) $value;

            $existing->update(['value' => $castedValue]);
            $updated[] = $existing->fresh();
        }

        return ApiResponse::success(
            BranchSettingResource::collection(collect($updated)),
            ucfirst($group) . ' settings updated successfully'
        );
    }

    /**
     * Reset setting ke default
     */
    public function reset(string $branchId, string $group)
    {
        // Hapus setting group ini
        BranchSetting::where('branch_id', $branchId)
            ->where('group', $group)
            ->delete();

        // Re-seed default untuk group ini
        BranchSettingSeeder::defaultSettings($branchId);

        return ApiResponse::success(null, ucfirst($group) . ' settings reset to default');
    }
}