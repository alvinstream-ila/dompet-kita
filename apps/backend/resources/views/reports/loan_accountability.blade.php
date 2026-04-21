@extends('layouts.report_pdf')

@section('title', 'Statement of Liabilities')
@section('document_type', 'Consolidated Statement of Amanah')
@section('period', $period['label'])

@section('content')
<div class="summary-grid">
    <table style="width: 100%;">
        <thead style="display: none;">
            <tr>
                <th>Opening Position</th>
                <th>Closing Position</th>
                <th>Cycle Repayments</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td style="width: 33%; padding-right: 10px;">
                    <div class="summary-card">
                        <span class="label">Opening Net Balance</span>
                        <span class="value {{ $summary['opening_net'] >= 0 ? '' : 'negative' }}">
                            Rp {{ number_format($summary['opening_net'], 0, ',', '.') }}
                        </span>
                    </div>
                </td>
                <td style="width: 33%; padding: 0 5px;">
                    <div class="summary-card {{ ($carry_over['total_piutang'] - $carry_over['total_hutang']) >= $summary['opening_net'] ? 'highlight' : '' }}">
                        <span class="label" style="{{ ($carry_over['total_piutang'] - $carry_over['total_hutang']) >= $summary['opening_net'] ? 'color: #94a3b8;' : '' }}">Closing Net Balance</span>
                        <span class="value">
                            Rp {{ number_format($carry_over['total_piutang'] - $carry_over['total_hutang'], 0, ',', '.') }}
                        </span>
                    </div>
                </td>
                <td style="width: 34%; padding-left: 10px;">
                    <div class="summary-card">
                        <span class="label">Monthly Repayments</span>
                        <span class="value positive">
                            + Rp {{ number_format($summary['total_repayments'], 0, ',', '.') }}
                        </span>
                    </div>
                </td>
            </tr>
        </tbody>
    </table>
</div>

<div class="section">
    <div class="section-title">I. Monthly Activities & Mutations</div>
    <table class="data-table">
        <thead>
            <tr>
                <th>Date / Contact</th>
                <th>Activity Description</th>
                <th style="text-align: center;">Activity Type</th>
                <th style="text-align: right;">Mutation Value</th>
            </tr>
        </thead>
        <tbody>
            @foreach($activity['new_loans'] as $loan)
            <tr>
                <td>{{ $loan->created_at->format('d/m/Y') }}<br><strong>{{ $loan->contact_name }}</strong></td>
                <td>{{ $loan->description }}</td>
                <td style="text-align: center;">
                    <span style="font-size: 8px; font-weight: 900; text-transform: uppercase; color: {{ $loan->type === 'piutang' ? '#10b981' : '#f43f5e' }};">
                        {{ $loan->type === 'piutang' ? 'New Receivable' : 'New Payable' }}
                    </span>
                </td>
                <td class="amount {{ $loan->type === 'piutang' ? '' : 'negative' }}">
                    {{ $loan->type === 'piutang' ? '+' : '-' }} {{ number_format($loan->amount, 0, ',', '.') }}
                </td>
            </tr>
            @endforeach
            
            @foreach($activity['transactions'] as $tx)
            <tr>
                <td>{{ \Carbon\Carbon::parse($tx->date)->format('d/m/Y') }}<br><strong>Repayment</strong></td>
                <td>{{ $tx->description }}</td>
                <td style="text-align: center;">
                    <span style="font-size: 8px; font-weight: 900; text-transform: uppercase; color: #3b82f6;">
                        Settlement
                    </span>
                </td>
                <td class="amount positive">
                    + {{ number_format($tx->amount, 0, ',', '.') }}
                </td>
            </tr>
            @endforeach

            @if(count($activity['new_loans']) === 0 && count($activity['transactions']) === 0)
            <tr>
                <td colspan="4" style="text-align: center; color: #94a3b8; font-style: italic; padding: 40px;">
                    No new activities recorded for this period.
                </td>
            </tr>
            @endif
        </tbody>
    </table>
</div>

<div class="section">
    <div class="section-title">II. Detailed Outstanding Obligations</div>
    <table class="data-table">
        <thead>
            <tr>
                <th>Contact Person</th>
                <th>Trust Status</th>
                <th style="text-align: right;">Remaining Obligation</th>
            </tr>
        </thead>
        <tbody>
            @foreach($carry_over['items'] as $item)
            <tr>
                <td>
                    <strong>{{ $item['contact_name'] }}</strong>
                    @if($item['due_date'])
                    <br><span style="font-size: 9px; color: #f43f5e;">Due: {{ \Carbon\Carbon::parse($item['due_date'])->format('d M Y') }}</span>
                    @endif
                </td>
                <td>
                    <span style="color: {{ $item['type'] === 'piutang' ? '#10b981' : '#f43f5e' }}; font-weight: bold;">
                        {{ $item['type'] === 'piutang' ? 'Receivable (Asset)' : 'Payable (Liability)' }}
                    </span>
                </td>
                <td class="amount">
                    Rp {{ number_format($item['remaining_amount'], 0, ',', '.') }}
                </td>
            </tr>
            @endforeach
            @if(count($carry_over['items']) === 0)
            <tr>
                <td colspan="3" style="text-align: center; color: #10b981; font-weight: 900; padding: 40px; letter-spacing: 2px;">
                    ALL OBLIGATIONS FULLY SETTLED.
                </td>
            </tr>
            @endif
        </tbody>
        <tfoot>
            <tr style="background-color: #0f172a; color: #ffffff;">
                <td colspan="2" style="padding: 15px; font-weight: 900; text-transform: uppercase; letter-spacing: 2px; font-size: 9px;">Total Net Sovereignty</td>
                <td style="padding: 15px; text-align: right; font-size: 16px; font-weight: 900;">
                    Rp {{ number_format($carry_over['total_piutang'] - $carry_over['total_hutang'], 0, ',', '.') }}
                </td>
            </tr>
        </tfoot>
    </table>
</div>

<div class="signature-section">
    <table style="width: 100%;">
        <thead style="display: none;">
            <tr>
                <th>Prepared Area</th>
                <th>Approved Area</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td style="width: 50%;">
                    <div class="signature-box">
                        <p>Prepared By</p>
                        <div style="height: 50px;"></div>
                        <p>Dompet Kita Sovereign System</p>
                    </div>
                </td>
                <td style="width: 50%; text-align: right;">
                    <div class="signature-box" style="margin-left: auto;">
                        <p>Acknowledged & Approved By</p>
                        <div style="height: 50px;"></div>
                        <p>{{ strtoupper($user->name) }}</p>
                    </div>
                </td>
            </tr>
        </tbody>
    </table>
</div>
@endsection
