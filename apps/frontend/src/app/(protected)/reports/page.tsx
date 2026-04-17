'use client';

import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Title,
  Tooltip,
} from 'chart.js';
import { FileSpreadsheet, FileText } from 'lucide-react';
import dynamic from 'next/dynamic';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ReportHeader, ReportPeriodPicker } from '@/features/reports';
import {
  ReportChartSkeleton,
  ReportStatSkeleton,
  ReportTableSkeleton,
} from '@/features/reports/components/ReportSkeletons';
import { useTransactions } from '@/features/transactions';
import type { CategorySummary, Transaction } from '@/types';

const ReportStats = dynamic(
  () => import('@/features/reports').then((m) => m.ReportStats),
  {
    loading: () => <ReportStatSkeleton />,
    ssr: false,
  }
);
const ReportCategoryBreakdown = dynamic(
  () => import('@/features/reports').then((m) => m.ReportCategoryBreakdown),
  {
    loading: () => <ReportTableSkeleton />,
    ssr: false,
  }
);
const ReportCharts = dynamic(
  () => import('@/features/reports').then((m) => m.ReportCharts),
  {
    loading: () => <ReportChartSkeleton />,
    ssr: false,
  }
);

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

/**
 * Reports Page - Financial Reporting & Export 📊
 * Ported to Next.js 15 (App Router)
 * - All imports refactored to @/ aliases
 * - Excel/PDF dynamic imports preserved as-is (they are browser-only, safe under 'use client')
 */
export default function ReportsPage() {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const { data: infiniteData, isLoading } = useTransactions(
    selectedMonth,
    selectedYear
  );
  const transactions: Transaction[] = infiniteData?.pages.flat() || [];

  const months = [
    'Januari',
    'Februari',
    'Maret',
    'April',
    'Mei',
    'Juni',
    'Juli',
    'Agustus',
    'September',
    'Oktober',
    'November',
    'Desember',
  ];

  const totalIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((acc, curr) => acc + curr.amount, 0);
  const totalExpense = transactions
    .filter((t) => t.type === 'expense')
    .reduce((acc, curr) => acc + curr.amount, 0);
  const balance = totalIncome - totalExpense;

  const categoryData = transactions.reduce<Record<string, CategorySummary>>(
    (acc, curr) => {
      const key = `${curr.type}-${curr.category}`;
      if (!acc[key]) {
        acc[key] = {
          type: curr.type,
          category: curr.category,
          amount: 0,
          percentage: 0,
        };
      }
      acc[key].amount += curr.amount;
      return acc;
    },
    {}
  );

  const sortedCategories = Object.values(categoryData).sort(
    (a, b) => b.amount - a.amount
  );

  const monthlyData = transactions.reduce<
    Record<string, { income: number; expense: number }>
  >((acc, curr) => {
    const date = new Date(curr.date);
    const month = date.toLocaleString('id-ID', { month: 'short' });
    if (!acc[month]) acc[month] = { income: 0, expense: 0 };
    acc[month][curr.type] += curr.amount;
    return acc;
  }, {});

  const barChartData = {
    labels: Object.keys(monthlyData),
    datasets: [
      {
        label: 'Pemasukan',
        data: Object.values(monthlyData).map((m) => m.income),
        backgroundColor: '#10b981',
        borderColor: '#10b981',
        borderRadius: 8,
        tension: 0.4,
      },
      {
        label: 'Pengeluaran',
        data: Object.values(monthlyData).map((m) => m.expense),
        backgroundColor: '#f43f5e',
        borderColor: '#f43f5e',
        borderRadius: 8,
        tension: 0.4,
      },
    ],
  };

  const expenseByCat = transactions
    .filter((t) => t.type === 'expense')
    .reduce<Record<string, number>>((acc, curr) => {
      acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
      return acc;
    }, {});

  const doughnutData = {
    labels: Object.keys(expenseByCat),
    datasets: [
      {
        data: Object.values(expenseByCat),
        backgroundColor: [
          '#f43f5e',
          '#10b981',
          '#3b82f6',
          '#f59e0b',
          '#8b5cf6',
          '#ec4899',
        ],
        borderWidth: 0,
      },
    ],
  };

  /**
   * Export to Excel — dynamic import to keep the bundle lean.
   * Safe under 'use client' as ExcelJS and file-saver are browser-only.
   */
  const exportToExcel = async () => {
    setIsExporting(true);
    try {
      const ExcelJS = await import('exceljs');
      const workbook = new ExcelJS.Workbook();
      workbook.creator = 'Dompet Kita';
      const summarySheet = workbook.addWorksheet('Ringkasan');
      summarySheet.columns = [
        { header: 'LABEL', key: 'label', width: 25 },
        { header: 'NILAI', key: 'value', width: 45 },
      ];
      summarySheet.addRows([
        { label: 'LAPORAN KEUANGAN KITA ✨', value: '' },
        {
          label: 'Periode:',
          value: `${months[selectedMonth]} ${selectedYear}`,
        },
        { label: 'Tabungan:', value: `Rp ${balance.toLocaleString('id-ID')}` },
      ]);
      const transSheet = workbook.addWorksheet('Riwayat');
      transSheet.columns = [
        { header: 'Tanggal', key: 'date', width: 15 },
        { header: 'Tipe', key: 'type', width: 15 },
        { header: 'Nominal', key: 'amount', width: 18 },
      ];
      transactions.forEach((t) => {
        transSheet.addRow({
          date: new Date(t.date).toLocaleDateString('id-ID'),
          type: t.type,
          amount: t.amount,
        });
      });
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });

      // Native Download Implementation (Replaces file-saver)
      const url = globalThis.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute(
        'download',
        `Laporan_${months[selectedMonth]}_${selectedYear}.xlsx`
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
      globalThis.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Excel export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  /**
   * Export to PDF — dynamic import to keep the bundle lean.
   * Safe under 'use client'.
   */
  const exportToPDF = async () => {
    setIsExporting(true);
    try {
      const { default: jsPDF } = await import('jspdf');
      const { default: autoTable } = await import('jspdf-autotable');
      const doc = new jsPDF();
      doc.text('LAPORAN KEUANGAN DOMPET KITA ✨', 15, 15);
      doc.text(`Periode: ${months[selectedMonth]} ${selectedYear}`, 15, 25);
      autoTable(doc, {
        startY: 35,
        head: [['Tanggal', 'Kategori', 'Keterangan', 'Aksi', 'Nominal']],
        body: transactions.map((t) => [
          new Date(t.date).toLocaleDateString('id-ID'),
          t.category,
          t.description || '-',
          t.type,
          `Rp ${t.amount.toLocaleString('id-ID')}`,
        ]),
      });
      doc.save(`Report_${months[selectedMonth]}_${selectedYear}.pdf`);
    } catch (error) {
      console.error('PDF export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-6 pb-36 md:px-8 md:py-10 md:pb-40 lg:px-12 lg:py-12">
      <ReportHeader />

      <div className="mb-10 flex flex-col items-center justify-between gap-6 md:flex-row">
        <ReportPeriodPicker
          isOpen={isPickerOpen}
          onToggle={() => setIsPickerOpen(!isPickerOpen)}
          selectedMonth={selectedMonth}
          selectedYear={selectedYear}
          onSelectMonth={(m) => {
            setSelectedMonth(m);
            setIsPickerOpen(false);
          }}
          onSelectYear={(y) => {
            setSelectedYear(y);
            setIsPickerOpen(false);
          }}
          months={months}
        />

        <div className="flex w-full items-center gap-4 md:w-auto">
          <Button
            onClick={exportToExcel}
            disabled={isExporting || transactions.length === 0}
            className="flex h-14 flex-1 items-center justify-center gap-3 rounded-2xl border-none bg-emerald-50 px-8 text-[10px] font-black tracking-widest text-emerald-600 uppercase shadow-sm transition-all hover:-translate-y-0.5 hover:bg-emerald-100 active:scale-95 disabled:opacity-50 md:flex-none"
          >
            <FileSpreadsheet className="h-4 w-4" strokeWidth={3} /> Ekspor Excel
          </Button>
          <Button
            onClick={exportToPDF}
            disabled={isExporting || transactions.length === 0}
            className="flex h-14 flex-1 items-center justify-center gap-3 rounded-2xl border-none bg-rose-50 px-8 text-[10px] font-black tracking-widest text-rose-600 uppercase shadow-sm transition-all hover:-translate-y-0.5 hover:bg-rose-100 active:scale-95 disabled:opacity-50 md:flex-none"
          >
            <FileText className="h-4 w-4" strokeWidth={3} /> Ekspor PDF
          </Button>
        </div>
      </div>

      {isLoading ? (
        <>
          <ReportStatSkeleton />
          <ReportTableSkeleton />
          <ReportChartSkeleton />
        </>
      ) : (
        <>
          <ReportStats
            totalIncome={totalIncome}
            totalExpense={totalExpense}
            balance={balance}
          />

          <ReportCategoryBreakdown
            sortedCategories={sortedCategories}
            totalIncome={totalIncome}
            totalExpense={totalExpense}
          />

          <ReportCharts
            barChartData={barChartData}
            doughnutData={doughnutData}
          />
        </>
      )}
    </div>
  );
}
