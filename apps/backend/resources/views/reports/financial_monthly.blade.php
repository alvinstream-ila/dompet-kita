@extends('layouts.report_pdf')

@section('title', 'Monthly Account Statement')
@section('document_type', 'Sovereign Monthly Financial Statement')
@section('period', $period_label)

@section('content')
<div class="summary-grid">
    <table style="width: 100%;">
        <thead style="display: none;">
            <tr>
                <th>Summary Income</th>
                <th>Summary Expense</th>
                <th>Summary Balance</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td style="width: 33%; padding-right: 10px;">
                    <div class="summary-card">
                        <span class="label">Total Inflow</span>
                        <span class="value positive">
                            + Rp {{ number_format($summary['income'], 0, ',', '.') }}
                        </span>
                    </div>
                </td>
                <td style="width: 33%; padding: 0 5px;">
                    <div class="summary-card">
                        <span class="label">Total Outflow</span>
                        <span class="value negative">
                            - Rp {{ number_format($summary['expense'], 0, ',', '.') }}
                        </span>
                    </div>
                </td>
                <td style="width: 34%; padding-left: 10px;">
                    <div class="summary-card highlight">
                        <span class="label" style="color: #94a3b8;">Month-End Balance surplus</span>
                        <span class="value">
                            Rp {{ number_format($summary['balance'], 0, ',', '.') }}
                        </span>
                    </div>
                </td>
            </tr>
        </tbody>
    </table>
</div>

<div class="section">
    <div class="section-title">I. Portfolio Allocation by Category</div>
    <table class="data-table">
        <thead>
            <tr>
                <th>category / Classification</th>
                <th style="text-align: center;">Tipe</th>
                <th style="text-align: right;">Total Mutasi</th>
            </tr>
        </thead>
        <tbody>
            @foreach($categories as $cat)
            <tr>
                <td><strong>{{ strtoupper($cat['category']) }}</strong></td>
                <td style="text-align: center;">
                    <span style="font-size: 8px; font-weight: 900; text-transform: uppercase; color: {{ $cat['type'] === 'income' ? '#10b981' : '#f43f5e' }};">
                        {{ $cat['type'] }}
                    </span>
                </td>
                <td class="amount {{ $cat['type'] === 'income' ? 'positive' : 'negative' }}">
                    {{ $cat['type'] === 'income' ? '' : '-' }} Rp {{ number_format($cat['amount'], 0, ',', '.') }}
                </td>
            </tr>
            @endforeach
        </tbody>
    </table>
</div>

<div class="section">
    <div class="section-title">II. Detailed Transaction History</div>
    <table class="data-table">
        <thead>
            <tr>
                <th>Date</th>
                <th>Description / Narration</th>
                <th>Category</th>
                <th style="text-align: right;">Amount</th>
            </tr>
        </thead>
        <tbody>
            @foreach($transactions as $tx)
            <tr>
                <td style="white-space: nowrap;">{{ \Carbon\Carbon::parse($tx->date)->format('d M Y') }}</td>
                <td>{{ $tx->description }}</td>
                <td>{{ $tx->category }}</td>
                <td class="amount {{ $tx->type === 'income' ? 'positive' : 'negative' }}">
                    {{ $tx->type === 'income' ? '+' : '-' }} {{ number_format($tx->amount, 0, ',', '.') }}
                </td>
            </tr>
            @endforeach
            @if(count($transactions) === 0)
            <tr>
                <td colspan="4" style="text-align: center; color: #94a3b8; font-style: italic; padding: 40px;">
                    No transactions recorded for this period.
                </td>
            </tr>
            @endif
        </tbody>
    </table>
</div>

<div class="signature-section">
    <table style="width: 100%;">
        <thead style="display: none;">
            <tr>
                <th>Audit Block</th>
                <th>Validation Block</th>
                <th>Holder Block</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td style="width: 33%;">
                    <div class="signature-box">
                        <p>System Audit</p>
                        <div style="height: 40px;"></div>
                        <p>VERIFIED</p>
                    </div>
                </td>
                <td style="width: 34%; text-align: center;">
                    <p style="font-size: 10px; color: #94a3b8; margin-top: 40px;">
                        * This statement is electronically generated and requires no physical signature for digital validation.
                    </p>
                </td>
                <td style="width: 33%; text-align: right;">
                    <div class="signature-box" style="margin-left: auto;">
                        <p>Account Holder</p>
                        <div style="height: 40px;"></div>
                        <p>{{ strtoupper($user->name) }}</p>
                    </div>
                </td>
            </tr>
        </tbody>
    </table>
</div>
@endsection
