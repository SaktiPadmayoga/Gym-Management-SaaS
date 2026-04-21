<?php

namespace App\Http\Controllers\Tenant;

use App\Http\Controllers\Controller;
use App\Http\Requests\Tenant\MemberRegisterRequest;
use App\Http\Resources\Tenant\MemberRegistrationResource;
use App\Http\Responses\ApiResponse;
use App\Models\Tenant\MembershipPlan;
use App\Services\MemberRegistrationService;
use Illuminate\Http\JsonResponse;

class MemberRegistrationController extends Controller
{
    public function __construct(
        protected MemberRegistrationService $service
    ) {}

    /**
     * POST /api/tenant/member/register
     */
    public function register(MemberRegisterRequest $request): JsonResponse
    {
        $plan = MembershipPlan::findOrFail($request->validated('plan_id'));

        $result = $this->service->register(
            data:     $request->validated(),
            plan:     $plan,
            branchId: $request->header('X-Branch-Id'),
        );

        return ApiResponse::success(
            new MemberRegistrationResource($result),
            'Pendaftaran berhasil. Silakan selesaikan pembayaran.',
            201
        );
    }
}