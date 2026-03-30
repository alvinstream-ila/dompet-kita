import React, { useState } from 'react';
import { 
  FileSpreadsheet,
  FileText,
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { PageLoader } from '@/components/ui/PageLoader';
import { useTransactions } from '@/hooks/useTransactions';
import type { CategorySummary, Transaction } from '@/types';

import { ReportHeader } from '../components/features/ReportHeader';
import { ReportStats } from '../components/features/ReportStats';
import { ReportCategoryBreakdown } from '../components/features/ReportCategoryBreakdown';
import { ReportCharts } from '../components/features/ReportCharts';
import { ReportPeriodPicker } from '../components/features/ReportPeriodPicker';

const Reports: React.FC = () => {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const { data: infiniteData, isLoading } = useTransactions(selectedMonth, selectedYear);
  const transactions: Transaction[] = infiniteData?.pages.flat() || [];

  const months = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
  ];

  const currentYear = new Date().getFullYear();
  const baseYear = 2024;
  const years = Array.from(
    { length: (currentYear + 1) - baseYear + 1 }, 
    (_, i) => (currentYear + 1) - i
  );

  const totalIncome = transactions.filter(t => t.type === 'income').reduce((acc, curr) => acc + curr.amount, 0);
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((acc, curr) => acc + curr.amount, 0);
  const balance = totalIncome - totalExpense;

  const categoryData = transactions.reduce<Record<string, CategorySummary>>((acc, curr) => {
    const key = `${curr.type}-${curr.category}`;
    if (!acc[key]) {
      acc[key] = { type: curr.type, category: curr.category, amount: 0, percentage: 0 };
    }
    acc[key].amount += curr.amount;
    return acc;
  }, {});

  const sortedCategories = Object.values(categoryData).sort((a, b) => b.amount - a.amount);

  const monthlyData = transactions.reduce<Record<string, { income: number; expense: number }>>((acc, curr) => {
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
        data: Object.values(monthlyData).map(m => m.income),
        backgroundColor: '#10b981',
        borderRadius: 8,
      },
      {
        label: 'Pengeluaran',
        data: Object.values(monthlyData).map(m => m.expense),
        backgroundColor: '#3b82f6',
        borderRadius: 8,
      }
    ]
  };

  const expenseByCat = transactions.filter(t => t.type === 'expense').reduce<Record<string, number>>((acc, curr) => {
    acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
    return acc;
  }, {});

  const doughnutData = {
    labels: Object.keys(expenseByCat),
    datasets: [{
      data: Object.values(expenseByCat),
      backgroundColor: ['#3b82f6', '#10b981', '#f43f5e', '#f59e0b', '#8b5cf6', '#ec4899'],
      borderWidth: 0,
    }]
  };

  const exportToExcel = async () => {
    setIsExporting(true);
    try {
      const ExcelJS = await import('exceljs');
      const { saveAs } = await import('file-saver');
      const workbook = new ExcelJS.Workbook();
      workbook.creator = 'Dompet Kita';
      const summarySheet = workbook.addWorksheet('Ringkasan');
      summarySheet.columns = [{ header: 'LABEL', key: 'label', width: 25 }, { header: 'NILAI', key: 'value', width: 45 }];
      summarySheet.addRows([
        { label: 'LAPORAN KEUANGAN KITA ✨', value: '' },
        { label: 'Periode:', value: `${months[selectedMonth]} ${selectedYear}` },
        { label: 'Tabungan:', value: `Rp ${balance.toLocaleString('id-ID')}` }
      ]);
      const transSheet = workbook.addWorksheet('Riwayat');
      transSheet.columns = [{ header: 'Tanggal', key: 'date', width: 15 }, { header: 'Tipe', key: 'type', width: 15 }, { header: 'Nominal', key: 'amount', width: 18 }];
      transactions.forEach(t => transSheet.addRow({ date: new Date(t.date).toLocaleDateString('id-ID'), type: t.type, amount: t.amount }));
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      saveAs(blob, `Laporan_${months[selectedMonth]}_${selectedYear}.xlsx`);
    } catch (error) { console.error('Export failed:', error); } finally { setIsExporting(false); }
  };

  const exportToPDF = async () => {
    setIsExporting(true);
    try {
      const { default: jsPDF } = await import('jspdf');
      const { default: autoTable } = await import('jspdf-autotable');
      const doc = new jsPDF();
      doc.text("LAPORAN KEUANGAN DOMPET KITA ✨", 15, 15);
      doc.text(`Periode: ${months[selectedMonth]} ${selectedYear}`, 15, 25);
      autoTable(doc, { 
        startY: 35, 
        head: [['Tanggal', 'Kategori', 'Keterangan', 'Aksi', 'Nominal']],
        body: transactions.map(t => [new Date(t.date).toLocaleDateString('id-ID'), t.category, t.description || '-', t.type, `Rp ${t.amount.toLocaleString('id-ID')}`])
      });
      doc.save(`Report_${months[selectedMonth]}_${selectedYear}.pdf`);
    } catch (error) { console.error('Export failed:', error); } finally { setIsExporting(false); }
  };

  return (
    <div className="container mx-auto px-4 py-8 pb-32">
      <PageLoader isLoading={isLoading} message="Menghitung kepingan kebahagiaan kita, sebentar lagi siap ya Sayang... 📊💖" />
      <PageLoader isLoading={isExporting} message="Lagi menyiapkan laporan spesial buat kamu... ✨📄" />
      
      <ReportHeader />

      <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-10">
        <ReportPeriodPicker 
           isOpen={isPickerOpen}
           onToggle={() => setIsPickerOpen(!isPickerOpen)}
           selectedMonth={selectedMonth}
           selectedYear={selectedYear}
           onSelectMonth={(m) => { setSelectedMonth(m); setIsPickerOpen(false); }}
           onSelectYear={(y) => { setSelectedYear(y); setIsPickerOpen(false); }}
           months={months}
           years={years}
        />

        <div className="flex items-center gap-4 w-full md:w-auto">
           <Button 
                onClick={exportToExcel} 
                className="h-14 px-8 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-2xl border-none shadow-sm flex items-center justify-center gap-3 font-black text-[10px] uppercase tracking-widest transition-all hover:-translate-y-0.5 active:scale-95 flex-1 md:flex-none"
            >
              <FileSpreadsheet className="w-4 h-4" strokeWidth={3} /> Ekspor Excel
           </Button>
           <Button 
                onClick={exportToPDF} 
                className="h-14 px-8 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-2xl border-none shadow-sm flex items-center justify-center gap-3 font-black text-[10px] uppercase tracking-widest transition-all hover:-translate-y-0.5 active:scale-95 flex-1 md:flex-none"
            >
              <FileText className="w-4 h-4" strokeWidth={3} /> Ekspor PDF
           </Button>
        </div>
      </div>

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
    </div>
  );
};

export default Reports;
