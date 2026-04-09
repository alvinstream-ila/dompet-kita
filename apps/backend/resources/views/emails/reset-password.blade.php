<!DOCTYPE html>
<html lang="id">
<head>
    <title>Reset Password | Dompet Kita</title>
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
            color: #f17a63;
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
        .otp-container {
            background: #fdf2f2;
            border-radius: 16px;
            display: inline-block;
            margin: 10px 0 30px 0;
            padding: 24px 40px;
            letter-spacing: 8px;
            border: 2px dashed #f87171;
        }
        .otp-code {
            color: #ef4444;
            font-size: 42px;
            font-weight: 800;
            margin: 0;
            font-family: 'Courier New', Courier, monospace;
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
        .expiry-note {
            color: #94a3b8;
            font-size: 14px;
            margin-top: 10px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🔐 Dompet Kita</h1>
        </div>
        
        <div class="content-card">
            <h2 class="welcome-text">Bantu Ingat Password! <span class="heart">❤️</span></h2>
            <p class="description-text">
                Duh sayang, jangan sedih kalau lupa password ya. Kami di sini siap bantu kok!
            </p>
            
            <p class="description-text">
                Silakan gunakan kode reset di bawah ini untuk mengganti password kamu:
            </p>
            
            <div class="otp-container">
                <div class="otp-code">{{ $code }}</div>
            </div>
            
            <p class="expiry-note">
                Kode ini berlaku selama 30 menit saja demi keamanan kamu. Kalau bukan kamu yang minta reset, abaikan saja ya sayang! 😉
            </p>
        </div>
        
        <div class="footer">
            <p>Dibuat dengan cinta untuk masa depan kita bersama.</p>
            <p>&copy; 2026 Dompet Kita Team. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
