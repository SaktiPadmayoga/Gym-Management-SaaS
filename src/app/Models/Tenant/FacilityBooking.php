<?php

namespace App\Models\Tenant;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class FacilityBooking extends Model
{
    use HasUuids;
    protected $guarded = [];

    public function facility() { return $this->belongsTo(Facility::class); }
    public function member() { return $this->belongsTo(Member::class); }
    public function invoice() { return $this->belongsTo(TenantInvoice::class, 'tenant_invoice_id'); }
}