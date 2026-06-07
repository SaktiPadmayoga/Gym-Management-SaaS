<?php

namespace App\Http\Controllers\Tenant;

use App\Http\Controllers\Controller;
use App\Http\Requests\Tenant\POSCheckoutRequest;
use App\Services\POSService;
use Illuminate\Http\JsonResponse;

class POSController extends Controller
{
    public function __construct(private readonly POSService $posService) {}

    public function checkout(POSCheckoutRequest $request): JsonResponse
    {
        try {
            $checkoutResult = $this->posService->checkout($request->validated());
            $invoice = $checkoutResult['invoice'];
            $snapToken = $checkoutResult['snap_token'];

            return response()->json([
                'success' => true,
                'message' => 'Transaction completed.',
                'data'    => [
                    'invoice_number' => $invoice->invoice_number,
                    'total_amount'   => $invoice->total_amount,
                    'status'         => $invoice->status,
                    'items'          => $invoice->items->map(fn($i) => [
                        'name'        => $i->item_name,
                        'quantity'    => $i->quantity,
                        'unit_price'  => $i->unit_price,
                        'total_price' => $i->total_price,
                    ]),
                    'paid_at'        => $invoice->paid_at,
                    'snap_token'     => $snapToken,
                ],
            ], 201);

        } catch (\InvalidArgumentException $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 422);

        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    public function history(): JsonResponse
    {
        $branchId = request()->header('X-Branch-Id');

        $query = \App\Models\Tenant\TenantInvoice::with(['items', 'branch', 'member'])
            ->where('invoice_number', 'like', 'INV-POS-%');

        if ($branchId) {
            $query->where('branch_id', $branchId);
        }

        $invoices = $query->latest()->paginate(20);

        return response()->json(['success' => true, 'data' => $invoices]);
    }

    public function sendReceiptEmail(string $invoiceNumber): JsonResponse
    {
        try {
            $invoice = \App\Models\Tenant\TenantInvoice::with(['items', 'branch', 'member'])
                ->where('invoice_number', $invoiceNumber)
                ->firstOrFail();

            $recipientEmail = $invoice->member?->email ?? $invoice->guest_email;

            if (!$recipientEmail) {
                return response()->json([
                    'success' => false,
                    'message' => 'Recipient email not found for this transaction.'
                ], 422);
            }

            $pdfBase64 = request()->input('pdf_base64');

            \Illuminate\Support\Facades\Mail::to($recipientEmail)->queue(
                new \App\Mail\SendInvoiceReceiptMail($invoice, $pdfBase64)
            );

            return response()->json([
                'success' => true,
                'message' => 'Receipt email queued successfully to ' . $recipientEmail
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to send email: ' . $e->getMessage()
            ], 500);
        }
    }
}