<?php

namespace App\Actions\Security\DeadMansSwitch;

use App\Actions\AI\GetLegacyAdviceAction;
use App\Actions\BaseAction;
use App\Models\Asset;
use App\Models\Goal;
use App\Models\LegacyVaultReport;
use App\Models\Loan;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Mpdf\Laravel\Facades\Pdf;

class GenerateReportAction extends BaseAction
{
    public function __construct(
        protected GetLegacyAdviceAction $getLegacyAdviceAction
    ) {}

    /**
     * Generate a comprehensive financial snapshot (Legacy Report PDF).
     */
    public function execute(User $user, ?string $password = null): string
    {
        Log::info("Initiating Legacy PDF generation for user {$user->id}");

        $data = [
            'report_date' => Carbon::now()->format('d F Y, H:i'),
            'user' => [
                'name' => $user->name,
                'email' => $user->email,
            ],
            'financial_summary' => [
                'total_assets' => (float) Asset::where('user_id', $user->id)->sum('value'),
                'total_loans' => (float) Loan::where('user_id', $user->id)->where('is_paid', false)->sum('amount'),
                'total_goals' => (float) Goal::where('user_id', $user->id)->where('is_completed', false)->sum('target_amount'),
            ],
            'asset_details' => Asset::where('user_id', $user->id)->get(['name', 'value'])->toArray(),
            'active_loans' => Loan::where('user_id', $user->id)->where('is_paid', false)->get(['debtor', 'amount', 'due_date'])->toArray(),
        ];

        // AI Advice
        $partner = $user->partner()->first();
        $partnerName = $partner instanceof User ? (string) $partner->name : ($user->legacy_partner_name ?? 'belum dihubungkan');

        $aiAdvice = $this->getLegacyAdviceAction->execute($user, $data);

        $data['recommendations'] = [
            (string) $aiAdvice,
            "Ini adalah snapshot kekayaan digital 'Dompet Kita' per hari ini.",
            'Simpan dokumen ini di tempat yang aman (misial: Vault digital atau cetak fisik).',
            "Pastikan pasangan Anda ({$partnerName}) mengetahui lokasi penyimpanan ini.",
        ];

        // Generate PDF using mPDF
        $pdf = Pdf::loadView('reports.legacy', $data);

        // Apply Encryption if password is provided
        // Use a fallback (e.g. email or specialized token) if automated
        $encryptionKey = $password ?? $user->email;

        $pdf->getMpdf()->SetProtection(['copy', 'print'], $encryptionKey, $encryptionKey);

        $timestamp = date('Y_m_d_His');
        $random = Str::random(8);
        $filename = "legacy/vault_{$user->id}_{$timestamp}_{$random}.pdf";

        // Save to Storj (Sovereign Cloud)
        Storage::disk('storj')->put($filename, $pdf->output());

        // Record in database archive
        LegacyVaultReport::create([
            'user_id' => $user->id,
            'filename' => 'Snapshot Finansial #'.(LegacyVaultReport::where('user_id', $user->id)->count() + 101),
            'storage_path' => $filename,
            'disk' => 'storj',
            'summary_data' => $data['financial_summary'],
        ]);

        Log::info("Legacy PDF report successfully archived to Storj for user {$user->id}");

        return $filename;
    }
}
