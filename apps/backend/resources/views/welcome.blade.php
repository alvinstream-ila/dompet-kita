<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" class="dark">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Sovereign Wealth Management | Dompet Kita</title>
    
    <!-- Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;800&family=Inter:wght@300;400;600&display=swap" rel="stylesheet">

    <!-- Styles -->
    <script src="https://unpkg.com/@tailwindcss/browser@4"></script>
    <style type="text/tailwindcss">
        @theme {
            --color-indigo-500: #6366f1;
            --color-violet-500: #a855f7;
        }
        
        body {
            font-family: 'Outfit', sans-serif;
            background-color: #030712;
            background-image:
                radial-gradient(at 0% 0%, rgba(99, 102, 241, 0.15) 0px, transparent 50%),
                radial-gradient(at 100% 100%, rgba(168, 85, 247, 0.15) 0px, transparent 50%);
            min-height: 100vh;
            color: #f8fafc;
        }

        .glass-card {
            background: rgba(15, 23, 42, 0.6);
            backdrop-filter: blur(12px);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 24px;
        }

        .gradient-text {
            background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }

        .status-dot {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background-color: #10b981;
            box-shadow: 0 0 12px #10b981;
            display: inline-block;
            margin-right: 8px;
        }

        .animate-float {
            animation: float 6s ease-in-out infinite;
        }

        @keyframes float {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-10px); }
        }
    </style>
</head>
<body class="antialiased flex items-center justify-center p-6">
    <div class="max-w-4xl w-full">
        <div class="text-center mb-12">
            <h1 class="text-5xl md:text-7xl font-extrabold tracking-tight mb-4 animate-float">
                💰 <span class="gradient-text">Dompet Kita</span>
            </h1>
            <p class="text-slate-400 text-lg md:text-xl font-light">
                Sovereign Wealth Management Portal for <span class="text-white font-semibold">Alvin & Ila</span>
            </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div class="glass-card p-8 hover:border-indigo-500 transition-all duration-300">
                <div class="flex items-center mb-4">
                    <div class="p-3 bg-indigo-500/10 rounded-xl mr-4 text-indigo-400">
                        <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h3 class="text-xl font-bold">System Status</h3>
                </div>
                <div class="space-y-3">
                    <div class="flex justify-between items-center text-sm">
                        <span class="text-slate-400">Environment</span>
                        <span class="px-2 py-1 bg-slate-800 rounded text-xs font-mono">{{ config('app.env') }}</span>
                    </div>
                    <div class="flex justify-between items-center text-sm">
                        <span class="text-slate-400">Singularity Version</span>
                        <span class="text-indigo-400 font-bold">v7.1.18</span>
                    </div>
                    <div class="flex justify-between items-center text-sm">
                        <span class="text-slate-400">API Status</span>
                        <span class="flex items-center">
                            <span class="status-dot"></span>
                            <span class="text-emerald-400 font-semibold uppercase text-xs">Active</span>
                        </span>
                    </div>
                </div>
            </div>

            <div class="glass-card p-8 hover:border-violet-500 transition-all duration-300">
                <div class="flex items-center mb-4">
                    <div class="p-3 bg-violet-500/10 rounded-xl mr-4 text-violet-400">
                        <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                    </div>
                    <h3 class="text-xl font-bold">Security Heartbeat</h3>
                </div>
                <div class="space-y-3">
                    <div class="flex justify-between items-center text-sm">
                        <span class="text-slate-400">RLS Enforcement</span>
                        <span class="text-emerald-400 font-semibold">Enabled</span>
                    </div>
                    <div class="flex justify-between items-center text-sm">
                        <span class="text-slate-400">Sentry Observability</span>
                        <span class="{{ config('sentry.dsn') ? 'text-emerald-400' : 'text-amber-400' }} font-semibold text-xs">
                            {{ config('sentry.dsn') ? 'Operational' : 'Monitoring Placeholder' }}
                        </span>
                    </div>
                    <div class="flex justify-between items-center text-sm">
                        <span class="text-slate-400">Truth Marker</span>
                        <span class="text-violet-400 font-mono text-xs">SAYANG_V7.1.18_ACTIVE</span>
                    </div>
                </div>
            </div>
        </div>

        <div class="text-center text-slate-500 text-sm font-light mt-12">
            <p>Made with ❤️ for our future together.</p>
            <p class="mt-2">&copy; 2026 Dompet Kita Team • <span class="italic">Sovereign Singularity Protocol</span></p>
        </div>
    </div>
</body>
</html>
