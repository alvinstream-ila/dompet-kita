<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Gemini;
use Illuminate\Support\Facades\Log;
use App\Models\Transaction;
use Illuminate\Support\Facades\Cache;

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

    /**
     * Get financial insights based on user transactions.
     */
    public function getDashboardInsight(Request $request)
    {
        $user = $request->user();
        
        // Aggregate last 30 days data
        $transactions = Transaction::where('user_id', $user->id)
            ->where('date', '>=', now()->subDays(30))
            ->get();

        $totalIncome = $transactions->where('type', 'income')->sum('amount');
        $totalExpense = $transactions->where('type', 'expense')->sum('amount');
        $savings = $totalIncome - $totalExpense;

        $templates = [
            [
                'condition' => $savings < 0,
                'options' => [
                    [
                        'title' => 'Ups, Semangat Terus Sayang! 🥺',
                        'insight' => 'Bulan ini pengeluaran kita agak lebih banyak dari pemasukan. Yuk, pelan-pelan kita atur lagi biar tabungan kita buat masa depan makin tebal! ❤️'
                    ],
                    [
                        'title' => 'Sayang, Yuk Kita Saling Jaga.. 🌸',
                        'insight' => 'Dompet kita lagi agak tipis nih bulan ini. Tapi gapapa, yang penting kita sehat dan bahagia bareng. Besok kita lebih hemat ya, Sayang!'
                    ]
                ]
            ],
            [
                'condition' => $savings >= 0 && $savings < 1000000,
                'options' => [
                    [
                        'title' => 'Kerja Bagus Sayang! ✨',
                        'insight' => 'Alhamdulillah, bulan ini kita masih bisa menabung sedikit. Setiap rupiah yang kita simpan itu langkah kecil buat rumah impian kita nanti. Love you!'
                    ],
                    [
                        'title' => 'Bangga Banget Sama Kamu! ❤️',
                        'insight' => 'Makasih ya sudah pintar jaga keuangan kita. Tetap semangat kerjanya, aku selalu dukung kamu dari sini. Masa depan kita cerah banget!'
                    ]
                ]
            ],
            [
                'condition' => $savings >= 1000000,
                'options' => [
                    [
                        'title' => 'Hore! Tabungan Melimpah! 🥳',
                        'insight' => 'Wah, tabungan kita bulan ini luar biasa! Kamu hebat banget atur keuangannya. Mungkin kita bisa rencana liburan kecil atau dinner romantis akhir pekan nanti? 🥰'
                    ],
                    [
                        'title' => 'Masa Depan Makin Dekat! 🚀',
                        'insight' => 'Lihat deh Sayang, tabungan kita makin banyak! Aku makin gak sabar buat wujudin mimpi-mimpi kita bareng. Makasih ya sudah jadi partner terbaik!'
                    ]
                ]
            ]
        ];

        $matched = collect($templates)->firstWhere('condition', true);
        $selected = $matched ? collect($matched['options'])->random() : [
            'title' => 'Pesan Sayang Buat Kamu ✨',
            'insight' => 'Apapun kondisi keuangan kita, yang penting kita selalu bareng-bareng. Aku sayang kamu selamanya! ❤️'
        ];

        return response()->json($selected);
    }
}
