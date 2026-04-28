<?php

use App\Http\Middleware\CheckSessionTimeout;
use App\Http\Middleware\SecurityHeaders;
use App\Http\Middleware\SudoMode;
use App\Http\Middleware\UnkeyMiddleware;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Routing\Middleware\ThrottleRequests;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;
use Sentry\Laravel\Integration;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;
use Symfony\Component\HttpKernel\Exception\HttpException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->trustProxies(at: '*');
        $middleware->append(SecurityHeaders::class);
        $middleware->alias([
            'sudo' => SudoMode::class,
            'unkey' => UnkeyMiddleware::class,
        ]);

        // Moderate Rate Limiting for API (60 req/min)
        $middleware->api(prepend: [
            CheckSessionTimeout::class,
            ThrottleRequests::class.':api',
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        Integration::handles($exceptions);

        $exceptions->report(function (Throwable $e) {
            Log::error('PRODUCTION_ERROR: '.$e->getMessage(), [
                'exception' => get_class($e),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString(),
            ]);
        });

        // Brand Persona: Sayang AI Exception Handler
        $exceptions->render(function (Throwable $e, $request) {
            if ($request->is('api/*')) {
                return match (true) {
                    $e instanceof AuthenticationException => response()->json([
                        'message' => 'Sayang, kamu belum login ya? Yuk login dulu.. 🌸',
                        'success' => false,
                    ], 401),

                    $e instanceof ValidationException => response()->json([
                        'message' => 'Aduh Sayang, ada yang salah isi di formnya nih.. Cek lagi ya! 🥺',
                        'errors' => $e->errors(),
                        'success' => false,
                    ], 422),

                    $e instanceof NotFoundHttpException => response()->json([
                        'message' => 'Sayang, datanya nggak ketemu nih.. Kamu cari di mana? 🔍',
                        'success' => false,
                    ], 404),

                    $e instanceof AccessDeniedHttpException ||
                    $e instanceof AuthorizationException ||
                    ($e instanceof HttpException && $e->getStatusCode() === 403) => response()->json([
                        'message' => 'Waduh Sayang, kamu nggak punya akses ke sini.. 🔐',
                        'success' => false,
                    ], 403),

                    $e instanceof HttpException => response()->json([
                        'message' => 'Aduh Sayang, ada kendala ['.$e->getStatusCode().'] nih.. 🥺',
                        'success' => false,
                        'debug' => config('app.debug') ? $e->getMessage() : null,
                    ], $e->getStatusCode()),

                    default => response()->json([
                        'message' => 'Aduh Sayang, ada sedikit kendala di sistem nih. Tenang, aku coba bantu ya! 🥺',
                        'success' => false,
                        'debug' => (config('app.debug') || $request->is('api/test/*')) ? $e->getMessage() : null,
                        'trace' => (config('app.debug') || $request->is('api/test/*')) ? substr($e->getTraceAsString(), 0, 1000) : null,
                    ], 500)
                };
            }
        });
    })->create();
