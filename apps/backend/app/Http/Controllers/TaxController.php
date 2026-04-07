<?php

namespace App\Http\Controllers;

use App\Actions\AI\GetTaxAdviceAction;
use App\Actions\Finance\Tax\CalculateTaxAction;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TaxController extends Controller
{
    public function __construct(
        protected CalculateTaxAction $calculateTaxAction,
        protected GetTaxAdviceAction $getTaxAdviceAction
    ) {}

    /**
     * Get annual tax estimate and AI advice.
     */
    public function getEstimate(Request $request): JsonResponse
    {
        $user = $request->user();
        $year = (int) $request->query('year', (int) date('Y'));

        $taxData = $this->calculateTaxAction->execute($user, $year);
        $aiAdvice = $this->getTaxAdviceAction->execute($user, $taxData);

        return response()->json([
            'status' => 'success',
            'data' => array_merge($taxData, [
                'ai_advice' => $aiAdvice,
                'currency' => 'IDR',
                'disclaimer' => 'Ini adalah estimasi berdasarkan transaksi yang dicatat. Konsultasikan dengan ahli pajak untuk akurasi legal.',
            ]),
        ]);
    }
}
