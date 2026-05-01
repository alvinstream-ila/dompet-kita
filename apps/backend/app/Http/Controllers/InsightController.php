<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\TransactionInsight;
use App\Models\User;
use App\Services\Cfo\QuantumInsightEngine;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

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
            'message' => 'Analisis data finansial selesai. Pola baru telah diidentifikasi.',
            'success' => true,
        ]);
    }

    /**
     * @return JsonResponse
     */
    public function index(Request $request)
    {
        $user = $request->user();
        if (! $user instanceof User) {
            abort(401);
        }

        $insights = TransactionInsight::where('household_id', $user->household_id)
            ->where('status', '!=', 'archived')
            ->latest()
            ->get();

        return response()->json($insights);
    }

    /**
     * @return JsonResponse
     */
    public function update(Request $request, TransactionInsight $insight)
    {
        $this->authorize('update', $insight);

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
        $this->authorize('delete', $insight);

        $insight->delete();

        return response()->json(null, Response::HTTP_NO_CONTENT);
    }
}
