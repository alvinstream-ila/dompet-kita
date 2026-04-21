<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="utf-8">
    <title>@yield('title') - Dompet Kita Sovereign</title>
    <style>
        @page {
            margin: 0;
        }
        body {
            font-family: 'Helvetica', 'Arial', sans-serif;
            margin: 0;
            padding: 0;
            color: #0f172a; /* Deep Navy */
            line-height: 1.5;
            background-color: #ffffff;
        }
        .wrapper {
            padding: 40px;
            position: relative;
            min-height: 100vh;
        }
        .header {
            border-bottom: 2px solid #0f172a;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        .header table {
            width: 100%;
        }
        .logo-text {
            font-size: 24px;
            font-weight: 900;
            letter-spacing: -1px;
            text-transform: uppercase;
        }
        .logo-text span {
            color: #3b82f6; /* Blue Royal */
        }
        .document-type {
            text-align: right;
            font-size: 10px;
            font-weight: bold;
            color: #64748b;
            text-transform: uppercase;
            letter-spacing: 2px;
        }
        .account-info {
            margin-bottom: 40px;
        }
        .account-info table {
            width: 100%;
        }
        .info-label {
            font-size: 9px;
            color: #94a3b8;
            text-transform: uppercase;
            font-weight: bold;
            letter-spacing: 1px;
        }
        .info-value {
            font-size: 14px;
            font-weight: bold;
            color: #1e293b;
        }
        .summary-grid {
            margin-bottom: 40px;
        }
        .summary-grid table {
            width: 100%;
            border-collapse: collapse;
        }
        .summary-card {
            background-color: #f8fafc;
            border: 1px solid #e2e8f0;
            padding: 20px;
            text-align: left;
        }
        .summary-card.highlight {
            background-color: #0f172a;
            color: #ffffff;
            border: none;
        }
        .summary-card .label {
            font-size: 9px;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 5px;
            display: block;
        }
        .summary-card .value {
            font-size: 20px;
            font-weight: 900;
        }
        .section-title {
            font-size: 11px;
            font-weight: 900;
            text-transform: uppercase;
            letter-spacing: 3px;
            color: #64748b;
            border-bottom: 1px solid #f1f5f9;
            padding-bottom: 8px;
            margin-bottom: 15px;
            margin-top: 30px;
        }
        .data-table {
            width: 100%;
            border-collapse: collapse;
        }
        .data-table th {
            text-align: left;
            font-size: 9px;
            font-weight: 900;
            text-transform: uppercase;
            letter-spacing: 1px;
            color: #94a3b8;
            padding: 12px;
            border-bottom: 1px solid #e2e8f0;
            background-color: #fcfcfc;
        }
        .data-table td {
            font-size: 11px;
            padding: 12px;
            border-bottom: 1px solid #f8fafc;
            vertical-align: top;
        }
        .data-table tr:nth-child(even) {
            background-color: #fafbfc;
        }
        .amount {
            font-weight: bold;
            font-family: 'Courier', monospace;
            text-align: right;
        }
        .positive { color: #10b981; }
        .negative { color: #f43f5e; }
        
        .footer {
            position: absolute;
            bottom: 40px;
            left: 40px;
            right: 40px;
            border-top: 1px solid #f1f5f9;
            padding-top: 20px;
            font-size: 9px;
            color: #94a3b8;
        }
        .watermark {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) rotate(-45deg);
            font-size: 100px;
            color: rgba(241, 145, 249, 0.5); /* Slightly adjusted opacity/color */
            font-weight: 900;
            z-index: -1;
            text-transform: uppercase;
        }
        .signature-section {
            margin-top: 60px;
            width: 100%;
        }
        .signature-box {
            width: 200px;
            border-top: 1px solid #0f172a;
            padding-top: 10px;
            text-align: center;
        }
        .signature-box p {
            margin: 0;
            font-size: 10px;
            font-weight: bold;
        }
    </style>
</head>
<body>
    <div class="watermark">SOVEREIGN</div>
    <div class="wrapper">
        <div class="header">
            <table style="width: 100%;">
                <thead style="display: none;">
                    <tr>
                        <th>Logo</th>
                        <th>Document Tracking</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>
                            <div class="logo-text">DOMPET<span>KITA</span></div>
                        </td>
                        <td class="document-type">
                            @yield('document_type')<br>
                            <span style="font-weight: normal; letter-spacing: normal; color: #94a3b8;">
                                Generated on {{ date('d M Y H:i') }}
                            </span>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <div class="account-info">
            <table style="width: 100%;">
                <thead style="display: none;">
                    <tr>
                        <th>Beneficiary</th>
                        <th>Reporting Period</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td style="width: 50%;">
                            <span class="info-label">Account Holder</span><br>
                            <span class="info-value">{{ strtoupper($user->name) }}</span>
                        </td>
                        <td style="width: 50%; text-align: right;">
                            <span class="info-label">Statement Period</span><br>
                            <span class="info-value">@yield('period')</span>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        @yield('content')

        <div class="footer">
            <table style="width: 100%;">
                <thead style="display: none;">
                    <tr>
                        <th>Disclaimer</th>
                        <th>Pagination</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>Dompet Kita Sovereign Financial Engine v7.1.18 • Confidential Statement</td>
                        <td style="text-align: right;">Page {PAGENO} of {nbpg}</td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</body>
</html>
