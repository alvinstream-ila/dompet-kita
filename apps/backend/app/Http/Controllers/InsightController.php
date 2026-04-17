<?php

namespace App\Http\Controllers;

use App\Models\TransactionInsight;
use App\Models\User;
use App\Services\Cfo\QuantumInsightEngine;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class InsightController extends Controller
{
    /**
     * @return JsonResponse
     */
    public function generate(Request $request, QuantumInsightEngine $engine)
    {
        $user = $request->user();
        if (! $user instanceof User) {
            abort(401);
        }

        $engine->generateInsights($user);

        return response()->json([
            'message' => 'Analisis kuantum selesai sayang! ✨ Pola baru telah terdeteksi.',
            'success' => true,
        ]);
    }

    /**
     * @return Collection<int, TransactionInsight>
     */
    public function index(Request $request)
    {
        $user = $request->user();
        if (! $user instanceof User) {
            abort(401);
        }

        // HasUserScope handles the owner filtering
        return TransactionInsight::where('user_id', $user->id)
            ->where('status', '!=', 'archived')
            ->latest()
            ->get();
    }

    /**
     * @return JsonResponse
     */
    public function update(Request $request, TransactionInsight $insight)
    {
        $user = $request->user();
        if (! $user instanceof User || $insight->user_id !== $user->id) {
            abort(403);
        }

        $validated = $request->validate([
            'status' => 'required|in:new,read,archived',
        ]);

        $insight->update($validated);

        return response()->json($insight);
    }

    /**
     * @return JsonResponse
     */
    public function destroy(Request $request, TransactionInsight $insight)
    {
        $user = $request->user();
        if (! $user instanceof User || $insight->user_id !== $user->id) {
            abort(403);
        }

        $insight->delete();

        return response()->json(null, Response::HTTP_NO_CONTENT);
    }
}
