<!DOCTYPE html>
<html lang="id">
<head>
    <title>Verifikasi Email | Dompet Kita</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
    <style>
        body {
            background-color: #f8fafc;
            font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            margin: 0;
            padding: 0;
            width: 100% !important;
        }
        .container {
            margin: 0 auto;
            max-width: 600px;
            padding: 20px;
            width: 100%;
        }
        .header {
            padding: 30px 0;
            text-align: center;
        }
        .header h1 {
            color: #6366f1;
            font-size: 28px;
            font-weight: 800;
            margin: 0;
            letter-spacing: -1px;
        }
        .content-card {
            background-color: #ffffff;
            border-radius: 20px;
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
            padding: 40px;
            text-align: center;
        }
        .welcome-text {
            color: #1e293b;
            font-size: 24px;
            font-weight: 700;
            margin-bottom: 10px;
        }
        .description-text {
            color: #64748b;
            font-size: 16px;
            line-height: 1.6;
            margin-bottom: 30px;
        }
        .button-container {
            margin-bottom: 30px;
        }
        .verify-button {
            background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%);
            border-radius: 12px;
            color: #ffffff !important;
            display: inline-block;
            font-size: 16px;
            font-weight: 600;
            padding: 16px 32px;
            text-decoration: none;
            box-shadow: 0 4px 6px -1px rgba(99, 102, 241, 0.4);
        }
        .footer {
            color: #94a3b8;
            font-size: 13px;
            padding: 20px;
            text-align: center;
        }
        .footer p {
            margin: 5px 0;
        }
        .heart {
            color: #f43f5e;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>💰 Dompet Kita</h1>
        </div>
        
        <div class="content-card">
            <h2 class="welcome-text">Halo Sayang! <span class="heart">❤️</span></h2>
            <p class="description-text">
                Senang banget kamu sudah bergabung di <b>Dompet Kita</b>! Langkah kecil ini adalah awal yang keren buat kita mengatur masa depan bareng-bareng.
            </p>
            
            <p class="description-text">
                Yuk, klik tombol di bawah ini buat verifikasi email kamu sekarang:
            </p>
            
            <div class="button-container">
                <a href="{{ $verificationUrl }}" class="verify-button">
                    Verifikasi Akun Saya ✨
                </a>
            </div>
            
            <p class="description-text" style="font-size: 14px;">
                Jika tombol di atas tidak berfungsi, kamu juga bisa salin link berikut ke browser kamu:<br>
                <a href="{{ $verificationUrl }}" style="color: #6366f1; word-break: break-all;">{{ $verificationUrl }}</a>
            </p>
        </div>
        
        <div class="footer">
            <p>Dibuat dengan cinta untuk masa depan kita bersama.</p>
            <p>&copy; 2026 Dompet Kita Team. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
