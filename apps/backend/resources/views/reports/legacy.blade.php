<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="utf-8">
    <title>Legacy Inheritance Certificate - Dompet Kita</title>
    <style>
        @page {
            margin: 0;
        }
        body {
            font-family: 'Helvetica', 'Arial', sans-serif;
            margin: 0;
            padding: 0;
            background-color: #fcfcfc;
            color: #1e293b;
        }
        .container {
            width: 100%;
            height: 100%;
            padding: 40px;
            box-sizing: border-box;
            background-image: radial-gradient(#e2e8f0 1px, transparent 1px);
            background-size: 20px 20px;
        }
        .certificate-border {
            border: 15px solid #1e293b;
            padding: 40px;
            height: calc(100vh - 110px);
            position: relative;
            background-color: white;
            box-shadow: 0 0 50px rgba(0,0,0,0.1);
        }
        .header {
            text-align: center;
            margin-bottom: 40px;
        }
        .header h1 {
            font-size: 42px;
            margin: 0;
            text-transform: uppercase;
            letter-spacing: 5px;
            font-weight: 900;
        }
        .header p {
            font-size: 14px;
            color: #64748b;
            margin-top: 10px;
            letter-spacing: 2px;
        }
        .seal {
            position: absolute;
            top: 20px;
            right: 40px;
            width: 100px;
            height: 100px;
        }
        .content {
            margin-top: 20px;
        }
        .section {
            margin-bottom: 30px;
        }
        .section-title {
            font-size: 12px;
            font-weight: 900;
            text-transform: uppercase;
            letter-spacing: 2px;
            border-bottom: 2px solid #e2e8f0;
            padding-bottom: 5px;
            margin-bottom: 15px;
            color: #475569;
        }
        .grid {
            display: table;
            width: 100%;
        }
        .grid-item {
            display: table-cell;
            width: 33.33%;
            padding: 10px;
            border: 1px solid #f1f5f9;
            text-align: center;
        }
        .grid-item .label {
            font-size: 9px;
            color: #94a3b8;
            text-transform: uppercase;
            display: block;
            margin-bottom: 5px;
        }
        .grid-item .value {
            font-size: 18px;
            font-weight: bold;
            color: #0f172a;
        }
        .table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
        }
        .table th, .table td {
            text-align: left;
            padding: 10px;
            border-bottom: 1px solid #f1f5f9;
            font-size: 12px;
        }
        .table th {
            background-color: #f8fafc;
            color: #64748b;
            font-weight: bold;
            text-transform: uppercase;
            font-size: 10px;
        }
        .recommendations {
            background-color: #fff1f2;
            padding: 20px;
            border-radius: 10px;
            margin-top: 20px;
            border-left: 5px solid #f43f5e;
        }
        .recommendations h3 {
            margin-top: 0;
            font-size: 14px;
            color: #9f1239;
        }
        .recommendations ul {
            margin: 0;
            padding-left: 20px;
            font-size: 11px;
            color: #be123c;
            line-height: 1.6;
        }
        .footer {
            position: absolute;
            bottom: 40px;
            left: 40px;
            right: 40px;
            text-align: center;
            font-size: 10px;
            color: #94a3b8;
        }
        .signature-box {
            margin-top: 50px;
            text-align: right;
        }
        .signature-line {
            display: inline-block;
            width: 200px;
            border-top: 1px solid #1e293b;
            margin-bottom: 10px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="certificate-border">
            <div class="seal">
                <img src="https://api.qrserver.com/v1/create-qr-code/?size=100x100&data={{ url('/') }}" alt="QR Verification" width="80">
            </div>
            
            <div class="header">
                <p>OFFICIAL FINANCIAL DEED OF REQUEST</p>
                <h1>Inheritance Certificate</h1>
                <p>GRANTED TO: <strong>{{ strtoupper($user['name']) }}</strong></p>
                <div style="font-size: 10px; margin-top: 5px; color: #94a3b8;">Ref No: DK-LEGACY-{{ date('Ymd') }}-{{ rand(1000, 9999) }}</div>
            </div>

            <div class="content">
                <div class="section">
                    <div class="section-title">Financial Summary Snapshot</div>
                    <div class="grid">
                        <div class="grid-item">
                            <span class="label">Total Aset</span>
                            <span class="value">Rp {{ number_format($financial_summary['total_assets'], 0, ',', '.') }}</span>
                        </div>
                        <div class="grid-item">
                            <span class="label">Aktiva Lancar</span>
                            <span class="value">Rp {{ number_format($financial_summary['total_goals'], 0, ',', '.') }}</span>
                        </div>
                        <div class="grid-item">
                            <span class="label">Total Liabilitas</span>
                            <span class="value" style="color: #e11d48;">Rp {{ number_format($financial_summary['total_loans'], 0, ',', '.') }}</span>
                        </div>
                    </div>
                </div>

                <div class="section">
                    <div class="section-title">Asset Distribution Details</div>
                    <table class="table">
                        <thead>
                            <tr>
                                <th>Asset Name</th>
                                <th style="text-align: right;">Valuation (IDR)</th>
                            </tr>
                        </thead>
                        <tbody>
                            @foreach($asset_details as $asset)
                            <tr>
                                <td>{{ $asset['name'] }}</td>
                                <td style="text-align: right;">Rp {{ number_format($asset['value'], 0, ',', '.') }}</td>
                            </tr>
                            @endforeach
                        </tbody>
                    </table>
                </div>

                @if(count($active_loans) > 0)
                <div class="section">
                    <div class="section-title">Debts (Active Loans)</div>
                    <table class="table">
                        <thead>
                            <tr>
                                <th>Debtor / Lender</th>
                                <th>Due Date</th>
                                <th style="text-align: right;">Amount (IDR)</th>
                            </tr>
                        </thead>
                        <tbody>
                            @foreach($active_loans as $loan)
                            <tr>
                                <td>{{ $loan['debtor'] }}</td>
                                <td>{{ $loan['due_date'] ?? '-' }}</td>
                                <td style="text-align: right;">Rp {{ number_format($loan['amount'], 0, ',', '.') }}</td>
                            </tr>
                            @endforeach
                        </tbody>
                    </table>
                </div>
                @endif

                <div class="recommendations">
                    <h3>Sovereign AI Directives:</h3>
                    <ul>
                        @foreach($recommendations as $rec)
                        <li>{{ $rec }}</li>
                        @endforeach
                    </ul>
                </div>
            </div>

            <div class="signature-box">
                <div class="signature-line"></div>
                <div style="font-size: 10px; font-weight: bold;">ANTIGRAVITY SENTIENT AI</div>
                <div style="font-size: 9px; color: #94a3b8;">Certified Guardian of Alvin & Ila</div>
            </div>

            <div class="footer">
                Document generated on {{ $report_date }} (WIB) • Dompet Kita Sovereign Financial Engine v7.2.7<br>
                <em>This document represents a digital sovereign will and financial status snapshot.</em>
            </div>
        </div>
    </div>
</body>
</html>
