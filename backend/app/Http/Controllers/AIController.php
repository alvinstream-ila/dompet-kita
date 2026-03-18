<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Gemini;
use Illuminate\Support\Facades\Log;

class AIController extends Controller
{
    /**
     * Analyze receipt from image using Gemini AI.
     * 
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function analyzeReceipt(Request $request)
    {
        $request->validate([
            'image' => 'required|string', // Base64 expected
            'mime_type' => 'required|string',
        ]);

        try {
            $apiKey = config('services.gemini.key');
            
            if (!$apiKey) {
                return response()->json([
                    'message' => 'AI Service not configured'
                ], 500);
            }

            $client = Gemini::client($apiKey);
            
            $prompt = "Analyze this receipt and extract: 1. Total Amount (number only), 2. Shop/Merchant Name. Respond strictly in JSON format: { \"amount\": number, \"merchant\": \"string\" }";

            $result = $client->generativeModel(model: 'gemini-1.5-flash')->generateContent([
                $prompt,
                new \Gemini\Data\Blob(
                    mimeType: $request->mime_type,
                    data: $request->image
                )
            ]);

            $text = $result->text();
            $cleanText = preg_replace('/```json|```/i', '', $text);
            $cleanText = trim($cleanText);
            
            $data = json_decode($cleanText, true);

            return response()->json([
                'success' => true,
                'data' => $data
            ]);

        } catch (\Exception $e) {
            Log::error('AI Scan Error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Gagal menganalisis struk: ' . $e->getMessage()
            ], 500);
        }
    }
}
