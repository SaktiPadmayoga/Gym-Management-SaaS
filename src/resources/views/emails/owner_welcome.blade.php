<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Selamat Datang di GYMFIT!</title>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #1e293b; margin: 0; padding: 0; background-color: #f8fafc; }
        .container { max-width: 650px; margin: 30px auto; background-color: #ffffff; padding: 40px; border-radius: 16px; border: 1px solid #e2e8f0; box-shadow: 0 4px 10px rgba(0,0,0,0.02); }
        .header { text-align: center; margin-bottom: 35px; }
        .header .logo { display: inline-block; font-size: 26px; font-weight: 900; letter-spacing: -1px; text-transform: uppercase; color: #0f172a; margin-bottom: 10px; }
        .header .logo span { color: #14b8a6; }
        .header h1 { color: #0f172a; margin: 0; font-size: 22px; font-weight: 800; letter-spacing: -0.5px; }
        .content { font-size: 15px; color: #475569; }
        .welcome-badge { display: inline-block; padding: 6px 12px; background-color: #f0fdfa; border: 1px solid #ccfbf1; color: #0f766e; font-size: 11px; font-weight: bold; border-radius: 9999px; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 20px; }
        .button-container { text-align: center; margin: 30px 0; }
        .button { display: inline-block; padding: 14px 28px; background-color: #0f172a; color: #ffffff !important; text-decoration: none; border-radius: 12px; font-weight: bold; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px; box-shadow: 0 4px 6px rgba(15,23,42,0.15); transition: background-color 0.2s ease; }
        .button:hover { background-color: #1e293b; }
        .info-card { background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin: 25px 0; }
        .info-card h3 { margin-top: 0; color: #0f172a; font-size: 15px; font-weight: 700; margin-bottom: 15px; border-bottom: 1px solid #e2e8f0; padding-bottom: 10px; }
        .info-row { display: flex; margin-bottom: 10px; font-size: 14px; }
        .info-label { width: 150px; font-weight: 700; color: #64748b; }
        .info-value { flex: 1; color: #0f172a; font-weight: 600; }
        .setup-steps { list-style-type: none; padding: 0; margin: 25px 0; }
        .setup-step { position: relative; padding-left: 45px; margin-bottom: 25px; }
        .step-num { position: absolute; left: 0; top: 0; width: 28px; height: 28px; background-color: #14b8a6; color: #ffffff; font-weight: bold; font-size: 14px; border-radius: 50%; display: flex; items-center: center; justify-content: center; line-height: 28px; text-align: center; }
        .step-title { font-weight: 700; color: #0f172a; margin: 0 0 5px 0; font-size: 15px; }
        .step-desc { margin: 0; font-size: 13.5px; color: #64748b; }
        .footer { text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #f1f5f9; padding-top: 25px; margin-top: 35px; }
        .footer p { margin: 5px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">GYMFIT<span>.</span></div>
            <h1>Aplikasi Manajemen Gym Anda Siap Digunakan!</h1>
        </div>
        
        <div class="content">
            <div class="welcome-badge">
                @if($status === 'trial')
                    Paket Uji Coba (Trial 14 Hari)
                @else
                    Pendaftaran Berhasil
                @endif
            </div>

            <p>Halo <strong>{{ $ownerName }}</strong>,</p>
            
            <p>Selamat! Gym baru Anda, <strong>{{ $tenant->name }}</strong>, telah berhasil terdaftar dan dipersiapkan dalam platform manajemen gym cerdas <strong>GYMFIT</strong>.</p>
            
            <p>Sistem kami telah mengonfigurasi database terisolasi untuk gym Anda beserta portal subdomain khusus agar operasional gym Anda terjamin aman dan mandiri.</p>

            <div class="button-container">
                <a href="{{ $loginUrl }}" class="button" style="color: #ffffff;">Masuk ke Portal Owner</a>
            </div>

            <!-- DETAIL KREDENSIAL LOGIN -->
            <div class="info-card">
                <h3>Informasi Akses Awal</h3>
                <div class="info-row">
                    <div class="info-label">URL Portal:</div>
                    <div class="info-value"><a href="{{ $loginUrl }}" style="color: #14b8a6; text-decoration: none;">{{ $loginUrl }}</a></div>
                </div>
                <div class="info-row">
                    <div class="info-label">Email Owner:</div>
                    <div class="info-value">{{ $ownerEmail }}</div>
                </div>
                <div class="info-row">
                    <div class="info-label">Kata Sandi:</div>
                    <div class="info-value" style="font-style: italic; color: #64748b;">(Menggunakan kata sandi yang Anda buat saat pendaftaran)</div>
                </div>
                <div class="info-row">
                    <div class="info-label">Paket Langganan:</div>
                    <div class="info-value">{{ $planName }}</div>
                </div>
                @if($status === 'suspended')
                <div style="background-color: #fffbeb; border: 1px solid #fef3c7; padding: 12px; border-radius: 8px; margin-top: 15px; color: #b45309; font-size: 13px; font-weight: 600;">
                    ⚠️ Akun Anda saat ini berstatus ditangguhkan menunggu konfirmasi pembayaran. Layanan Anda akan aktif penuh otomatis segera setelah proses pembayaran diselesaikan.
                </div>
                @endif
            </div>

            <!-- PANDUAN KONFIGURASI AWAL -->
            <h2 style="font-size: 17px; font-weight: 800; color: #0f172a; margin-top: 35px; border-bottom: 2px solid #f1f5f9; padding-bottom: 8px; text-transform: uppercase; letter-spacing: 0.5px;">
                Panduan Konfigurasi Awal (Quick Start Guide)
            </h2>
            <p>Ikuti 4 langkah mudah berikut untuk mulai menjalankan operasional digital gym Anda hari ini:</p>

            <ul class="setup-steps">
                <li class="setup-step">
                    <div class="step-num">1</div>
                    <h4 class="step-title">Login ke Portal Owner</h4>
                    <p class="step-desc">Masuk menggunakan email dan password Anda pada link di atas untuk membuka dashboard kendali utama gym Anda.</p>
                </li>
                <li class="setup-step">
                    <div class="step-num">2</div>
                    <h4 class="step-title">Atur Paket & Membership</h4>
                    <p class="step-desc">Masuk ke menu Master Data untuk membuat paket Membership harian/bulanan, paket Kelas, maupun paket Personal Trainer (PT) sesuai kebutuhan bisnis Anda.</p>
                </li>
                <li class="setup-step">
                    <div class="step-num">3</div>
                    <h4 class="step-title">Undang & Daftarkan Staff</h4>
                    <p class="step-desc">Daftarkan staff resepsionis, kasir, maupun Trainer (PT) Anda dan tentukan cabang penugasan mereka. Sistem akan otomatis membatasi hak akses sesuai role masing-masing.</p>
                </li>
                <li class="setup-step">
                    <div class="step-num">4</div>
                    <h4 class="step-title">Buka Kasir POS & Mulai Check-in</h4>
                    <p class="step-desc">Mulai daftarkan member baru di meja kasir menggunakan menu POS kami, cetak invoice otomatis, dan member Anda bisa langsung melakukan check-in instan via scan QR!</p>
                </li>
            </ul>

            <p style="margin-top: 30px;">Jika Anda memiliki kendala, pertanyaan teknis, atau membutuhkan panduan implementasi lebih lanjut, jangan ragu untuk membalas email ini atau menghubungi tim Support kami.</p>
            
            <p>Selamat bergabung di ekosistem digital <strong>GYMFIT</strong>!</p>
            <p style="margin-bottom: 0;">Salam hangat,</p>
            <p style="margin-top: 5px; font-weight: bold; color: #0f172a;">Tim Manajemen GYMFIT</p>
        </div>
        
        <div class="footer">
            <p>&copy; {{ date('Y') }} GYMFIT. Hak Cipta Dilindungi.</p>
            <p style="font-size: 11px;">Email ini dikirim secara otomatis ke pengelola terdaftar GYMFIT OS. Mohon tidak membagikan informasi kredensial login Anda kepada pihak manapun.</p>
        </div>
    </div>
</body>
</html>
