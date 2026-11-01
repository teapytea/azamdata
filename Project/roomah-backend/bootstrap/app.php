<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Support\Facades\Route; // PENTING: Tambahkan use statement ini

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        // PERUBAHAN: Kita definisikan rute API secara manual di sini
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php', // Mengaktifkan file routes/api.php
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
        // PENTING: Memberi tahu Laravel bahwa prefix API kita adalah 'api'
        apiPrefix: 'api', 
    )
->withMiddleware(function (Middleware $middleware) {
    // PERUBAHAN: Tambahkan pengecualian CSRF untuk rute API
    $middleware->validateCsrfTokens(except: [
        'api/*' // Mengecualikan semua rute yang diawali dengan /api
    ]);

    $middleware->api(prepend: [
        \Illuminate\Http\Middleware\HandleCors::class,
        \Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful::class,
    ]);
})
    ->withExceptions(function (Exceptions $exceptions) {
        //
    })->create();