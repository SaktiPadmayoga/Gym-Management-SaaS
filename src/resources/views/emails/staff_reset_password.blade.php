<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reset Password Akses Tenant Gym Anda</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; background-color: #f1f5f9; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); }
        .header { background-color: #020617; padding: 30px; text-align: center; }
        .logo { color: #ffffff; font-size: 24px; font-weight: 900; letter-spacing: -0.5px; margin: 0; text-transform: uppercase; }
        .logo span { color: #14b8a6; }
        .content { padding: 40px 30px; color: #334155; line-height: 1.6; font-size: 16px; }
        .h1 { color: #0f172a; font-size: 22px; font-weight: 800; margin-top: 0; margin-bottom: 20px; }
        .btn { display: inline-block; background-color: #020617; color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; font-size: 14px; margin: 25px 0; }
        .footer { background-color: #f8fafc; padding: 20px 30px; text-align: center; color: #94a3b8; font-size: 13px; border-top: 1px solid #e2e8f0; }
        .note { font-size: 14px; color: #64748b; margin-top: 30px; border-top: 1px solid #e2e8f0; padding-top: 20px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <p class="logo">Fitnice<span>.</span></p>
        </div>
        <div class="content">
            <h1 class="h1">Reset Kata Sandi Akun Staff</h1>
            <p>Halo,</p>
            <p>Anda menerima email ini karena kami menerima permintaan penyetelan ulang kata sandi untuk akun Staff Anda di ekosistem Gym kami.</p>
            
            <div style="text-align: center;">
                <a href="{{ $resetUrl }}" class="btn">Reset Kata Sandi</a>
            </div>
            
            <p>Tautan reset kata sandi ini akan kedaluwarsa dalam 60 menit.</p>
            
            <p>Jika Anda tidak meminta penyetelan ulang kata sandi, abaikan email ini dan akun Anda akan tetap aman.</p>
            
            <div class="note">
                <p>Jika Anda mengalami masalah saat mengklik tombol "Reset Kata Sandi", salin dan tempel URL di bawah ini ke peramban web Anda:</p>
                <p style="word-break: break-all; color: #14b8a6;">{{ $resetUrl }}</p>
            </div>
        </div>
        <div class="footer">
            &copy; {{ date('Y') }} Fitnice OS. Hak Cipta Dilindungi.
        </div>
    </div>
</body>
</html>
