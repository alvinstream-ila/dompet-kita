<?php

namespace App\Actions\Security\DeadMansSwitch;

use App\Actions\AI\GetLegacyAdviceAction;
use App\Actions\BaseAction;
use App\Models\Asset;
use App\Models\Goal;
use App\Models\Loan;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class GenerateReportAction extends BaseAction
{
    public function __construct(
        protected GetLegacyAdviceAction $getLegacyAdviceAction
    ) {}

    /**
     * Generate a comprehensive financial snapshot (Legacy Report).
     */
    public function execute(User $user): array
    {
        $data = [
            'report_date' => Carbon::now()->toDateTimeString(),
            'user' => [
                'name' => $user->name,
                'email' => $user->email,
            ],
            'financial_summary' => [
                'total_assets' => Asset::where('user_id', $user->id)->sum('value'),
                'total_loans' => Loan::where('user_id', $user->id)->where('is_paid', false)->sum('amount'),
                'total_goals' => Goal::where('user_id', $user->id)->where('is_completed', false)->sum('target_amount'),
            ],
            'asset_details' => Asset::where('user_id', $user->id)->get(['name', 'value']),
            'active_loans' => Loan::where('user_id', $user->id)->where('is_paid', false)->get(['debtor', 'amount', 'due_date']),
        ];

        // AI Advice
        $partnerName = $user->partner()->first()->name ?? 'belum dihubungkan';
        $data['recommendations'] = [
            $this->getLegacyAdviceAction->execute($user, $data),
            "Ini adalah snapshot kekayaan digital 'Dompet Kita' per hari ini.",
            'Simpan dokumen ini di tempat yang aman (misial: Vault digital atau cetak fisik).',
            "Pastikan pasangan Anda ({$partnerName}) mengetahui lokasi penyimpanan ini.",
        ];

        $filename = 'legacy/report_'.$user->id.'_'.date('Y_m_d').'.json';
        Storage::disk('local')->put($filename, json_encode($data, JSON_PRETTY_PRINT));

        Log::info("Legacy report generated for user {$user->id}");

        return $data;
    }
}
