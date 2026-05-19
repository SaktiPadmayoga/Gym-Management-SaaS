<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Selamat Datang di Gym Kami</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f9f9f9; }
        .container { max-width: 600px; margin: 20px auto; background-color: #ffffff; padding: 30px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        .header { text-align: center; margin-bottom: 30px; }
        .header h1 { color: #2c3e50; margin: 0; }
        .content { margin-bottom: 30px; }
        .button-container { text-align: center; margin: 25px 0; }
        .button { display: inline-block; padding: 12px 24px; background-color: #3498db; color: #ffffff; text-decoration: none; border-radius: 5px; font-weight: bold; }
        .button-secondary { background-color: #2ecc71; }
        .footer { text-align: center; font-size: 12px; color: #7f8c8d; border-top: 1px solid #eeeeee; padding-top: 20px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Selamat Datang, {{ $member->name }}!</h1>
        </div>
        
        <div class="content">
            <p>Terima kasih telah bergabung. Kami senang memberitahukan bahwa paket membership <strong>{{ $planName }}</strong> Anda telah berhasil diaktifkan melalui kasir kami.</p>
            
            <p>Anda dapat mengelola akun, melihat jadwal kelas, dan memantau riwayat transaksi Anda melalui Dashboard Member kami.</p>
            
            <div class="button-container">
                <a href="{{ $dashboardUrl }}" class="button">Masuk ke Dashboard</a>
            </div>

            @if($resetUrl)
            <div style="background-color: #f8f9fa; padding: 15px; border-left: 4px solid #f1c40f; margin-top: 30px;">
                <h3 style="margin-top: 0; color: #d35400;">Langkah Penting: Atur Kata Sandi Anda</h3>
                <p>Karena akun Anda didaftarkan secara manual oleh tim kami, silakan atur kata sandi Anda terlebih dahulu sebelum login ke dashboard.</p>
                <div class="button-container">
                    <a href="{{ $resetUrl }}" class="button button-secondary">Atur Kata Sandi</a>
                </div>
                <p style="font-size: 12px; color: #7f8c8d;">Jika tombol di atas tidak berfungsi, salin dan tempel URL berikut di browser Anda:<br>
                <a href="{{ $resetUrl }}">{{ $resetUrl }}</a></p>
            </div>
            @endif
        </div>
        
        <div class="footer">
            <p>&copy; {{ date('Y') }} Fitnice. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
