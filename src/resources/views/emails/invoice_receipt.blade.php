<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Nota Pembayaran - {{ $invoice->invoice_number }}</title>
    <style>
        body {
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            line-height: 1.6;
            color: #2d3748;
            margin: 0;
            padding: 0;
            background-color: #f7fafc;
        }
        .container {
            max-width: 600px;
            margin: 30px auto;
            background-color: #ffffff;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
            overflow: hidden;
            border: 1px solid #e2e8f0;
        }
        .header {
            background-color: #0f766e; /* Brand Teal */
            color: #ffffff;
            padding: 30px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 24px;
            font-weight: 700;
            letter-spacing: 0.5px;
        }
        .header p {
            margin: 5px 0 0 0;
            font-size: 14px;
            opacity: 0.9;
        }
        .body {
            padding: 30px;
        }
        .info-grid {
            display: table;
            width: 100%;
            margin-bottom: 30px;
            border-bottom: 2px dashed #edf2f7;
            padding-bottom: 20px;
        }
        .info-col {
            display: table-cell;
            width: 50%;
            font-size: 14px;
        }
        .info-col strong {
            color: #4a5568;
        }
        .item-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
        }
        .item-table th {
            text-align: left;
            padding: 12px 10px;
            border-bottom: 2px solid #e2e8f0;
            color: #4a5568;
            font-size: 13px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        .item-table td {
            padding: 15px 10px;
            border-bottom: 1px solid #edf2f7;
            font-size: 14px;
        }
        .item-table td.number, .item-table th.number {
            text-align: right;
        }
        .summary-table {
            width: 50%;
            margin-left: auto;
            border-collapse: collapse;
            margin-bottom: 20px;
        }
        .summary-table td {
            padding: 6px 10px;
            font-size: 14px;
        }
        .summary-table td.label {
            color: #718096;
            text-align: right;
        }
        .summary-table td.value {
            text-align: right;
            font-weight: 600;
        }
        .summary-table tr.grand-total td {
            border-top: 2px solid #e2e8f0;
            padding-top: 12px;
            font-size: 16px;
            font-weight: 700;
            color: #0f766e;
        }
        .thank-you {
            text-align: center;
            font-size: 15px;
            color: #4a5568;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #edf2f7;
        }
        .footer {
            background-color: #f7fafc;
            padding: 20px;
            text-align: center;
            font-size: 12px;
            color: #a0aec0;
            border-top: 1px solid #edf2f7;
        }
        .badge {
            display: inline-block;
            background-color: #def7ec;
            color: #03543f;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 11px;
            font-weight: 700;
            text-transform: uppercase;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>NOTA PEMBAYARAN</h1>
            <p style="margin: 0; font-size: 18px; font-weight: 700; text-transform: uppercase;">
                {{ $invoice->branch?->name ?? tenant('name') ?? 'GymFit' }}
            </p>
            @if($invoice->branch?->address)
                <p style="margin: 4px 0 0 0; font-size: 12px; opacity: 0.9; line-height: 1.4;">
                    {{ $invoice->branch->address }}
                </p>
            @endif
            @if($invoice->branch?->phone)
                <p style="margin: 2px 0 0 0; font-size: 12px; opacity: 0.9;">
                    Telp: {{ $invoice->branch->phone }}
                </p>
            @endif
        </div>
        
        <div class="body">
            <div class="info-grid">
                <div class="info-col">
                    <strong>Informasi Pelanggan:</strong><br>
                    Nama: {{ $customerName }}<br>
                    @if($invoice->member?->phone || $invoice->guest_phone)
                        Telp: {{ $invoice->member?->phone ?? $invoice->guest_phone }}<br>
                    @endif
                    @if($invoice->member?->email || $invoice->guest_email)
                        Email: {{ $invoice->member?->email ?? $invoice->guest_email }}
                    @endif
                </div>
                <div class="info-col" style="text-align: right;">
                    <strong>Detail Transaksi:</strong><br>
                    Nomor: {{ $invoice->invoice_number }}<br>
                    Tanggal: {{ $invoice->paid_at ? $invoice->paid_at->format('d M Y H:i') : now()->format('d M Y H:i') }}<br>
                    Metode: {{ strtoupper($invoice->payment_method ?? 'Midtrans') }}<br>
                    Status: <span class="badge">LUNAS</span>
                </div>
            </div>
            
            <table class="item-table">
                <thead>
                    <tr>
                        <th>Deskripsi</th>
                        <th class="number" style="width: 60px;">Qty</th>
                        <th class="number" style="width: 100px;">Harga</th>
                        <th class="number" style="width: 120px;">Total</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach($items as $item)
                        <tr>
                            <td>
                                <strong>{{ $item->item_name }}</strong>
                            </td>
                            <td class="number">{{ $item->quantity }}</td>
                            <td class="number">Rp {{ number_format($item->unit_price, 0, ',', '.') }}</td>
                            <td class="number">Rp {{ number_format($item->total_price, 0, ',', '.') }}</td>
                        </tr>
                    @endforeach
                </tbody>
            </table>
            
            <table class="summary-table">
                <tbody>
                    <tr>
                        <td class="label">Subtotal:</td>
                        <td class="value">Rp {{ number_format($invoice->subtotal, 0, ',', '.') }}</td>
                    </tr>
                    @if($invoice->discount_amount > 0)
                        <tr>
                            <td class="label">Diskon:</td>
                            <td class="value" style="color: #e53e3e;">-Rp {{ number_format($invoice->discount_amount, 0, ',', '.') }}</td>
                        </tr>
                    @endif
                    @if($invoice->tax > 0)
                        <tr>
                            <td class="label">Pajak (10%):</td>
                            <td class="value">Rp {{ number_format($invoice->tax, 0, ',', '.') }}</td>
                        </tr>
                    @endif
                    <tr class="grand-total">
                        <td class="label">Total Bayar:</td>
                        <td class="value">Rp {{ number_format($invoice->total_amount, 0, ',', '.') }}</td>
                    </tr>
                </tbody>
            </table>
            
            @if($invoice->notes)
                <div style="margin-top: 20px; padding: 15px; background-color: #f7fafc; border: 1px dashed #e2e8f0; border-radius: 6px; font-size: 13px;">
                    <strong>Catatan:</strong> {{ $invoice->notes }}
                </div>
            @endif

            <div class="thank-you">
                <p>Terima kasih atas pembayaran Anda. Selamat berlatih!</p>
            </div>
        </div>
        
        <div class="footer">
            <p>&copy; {{ date('Y') }} {{ tenant('name') ?? 'GymFit' }}. Hak Cipta Dilindungi.</p>
        </div>
    </div>
</body>
</html>
