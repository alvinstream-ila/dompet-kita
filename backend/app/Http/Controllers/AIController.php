<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
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
        return response()->json([
            'success' => false,
            'message' => 'Layanan scan struk sedang dalam pemeliharaan, Sayang. Tunggu sebentar ya! ❤️'
        ], 503);
    }

    /**
     * Get financial insights based on user transactions.
     */
    public function getDashboardInsight(Request $request)
    {
        try {
            $user = $request->user();
            
            // Explicitly disable query log to save memory/state
            // \DB::connection()->disableQueryLog();

            // Aggregate last 30 days data
            $transactions = Transaction::where('user_id', $user->id)
                ->where('date', '>=', now()->subDays(30))
                ->get();

            $totalIncome = $transactions->where('type', 'income')->sum('amount');
            $totalExpense = $transactions->where('type', 'expense')->sum('amount');
            $savings = (float) $totalIncome - (float) $totalExpense;

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

            $matched = collect($templates)->first(function($t) use ($savings) {
                return $t['condition'];
            });

            $selected = $matched ? collect($matched['options'])->random() : [
                'title' => 'Pesan Sayang Buat Kamu ✨',
                'insight' => 'Apapun kondisi keuangan kita, yang penting kita selalu bareng-bareng. Aku sayang kamu selamanya! ❤️'
            ];

            return response()->json($selected);
        } catch (\Exception $e) {
            \Log::error('AI Insight Error Trace: ' . $e->getMessage());
            return response()->json([
                'title' => 'Pesan Sayang ✨',
                'insight' => 'Apapun yang terjadi, aku selalu bangga sama kamu. Yuk semangat cari cuan bareng lagi! ❤️'
            ]);
        }
    }
}
