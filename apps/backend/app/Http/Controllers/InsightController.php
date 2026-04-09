<?php

namespace App\Http\Controllers;

use App\Models\TransactionInsight;
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

        $engine->generateInsights($user);

        return response()->json([
            'message' => 'Analisis kuantum selesai sayang! ✨ Pola baru telah terdeteksi.',
            'success' => true,
        ]);
    }

    /**
     * @return Collection<int, TransactionInsight>
     */
    public function index()
    {
        // HasUserScope handles the owner filtering
        return TransactionInsight::where('status', '!=', 'archived')
            ->latest()
            ->get();
    }

    /**
     * @return JsonResponse
     */
    public function update(Request $request, TransactionInsight $insight)
    {
        $validated = $request->validate([
            'status' => 'required|in:new,read,archived',
        ]);

        $insight->update($validated);

        return response()->json($insight);
    }

    /**
     * @return JsonResponse
     */
    public function destroy(TransactionInsight $insight)
    {
        $insight->delete();

        return response()->json(null, Response::HTTP_NO_CONTENT);
    }
}
