import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar, 
  ChevronDown,
  FileSpreadsheet,
  FileText,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/ui/StatCard";
import { cn } from "@/lib/utils";
import { UserNavDropdown } from '@/components/features/UserNavDropdown';
import { PageLoader } from '@/components/ui/PageLoader';
import { useTransactions } from '@/hooks/useTransactions';
import type { CategorySummary, Transaction } from '@/types';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const Reports: React.FC = () => {
  const navigate = useNavigate();
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Use React Query for fetching transactions
  const { data: infiniteData, isLoading } = useTransactions(selectedMonth, selectedYear);
  const transactions: Transaction[] = infiniteData?.pages.flat() || [];

  const months = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
  ];

  // Dynamic years: From (current year + 1) down to 2024 (app start)
  // This satisfies "otomatis update" and "sesuai data kita"
  const currentYear = new Date().getFullYear();
  const baseYear = 2024; // Baseline start for Alvin & Ila
  const years = Array.from(
    { length: (currentYear + 1) - baseYear + 1 }, 
    (_, i) => (currentYear + 1) - i
  );

  const exportToExcel = async () => {
    setIsExporting(true);
    try {
      const ExcelJS = await import('exceljs');
      const { saveAs } = await import('file-saver');
      
      const workbook = new ExcelJS.Workbook();
      workbook.creator = 'Dompet Kita';
      workbook.lastModifiedBy = 'Dompet Kita';
      workbook.created = new Date();
      workbook.modified = new Date();

      // 1. Prepare Summary Sheet
      const summarySheet = workbook.addWorksheet('Ringkasan');
      summarySheet.columns = [
        { header: 'LABEL', key: 'label', width: 25 },
        { header: 'NILAI', key: 'value', width: 45 }
      ];

      summarySheet.addRows([
        { label: 'LAPORAN KEUANGAN DOMPET KITA', value: '' },
        { label: 'Periode:', value: `${months[selectedMonth]} ${selectedYear}` },
        { label: '', value: '' },
        { label: 'RINGKASAN DANA', value: '' },
        { label: 'Total Pemasukan:', value: `Rp ${totalIncome.toLocaleString('id-ID')}` },
        { label: 'Total Pengeluaran:', value: `Rp ${totalExpense.toLocaleString('id-ID')}` },
        { label: 'Saldo Akhir:', value: `Rp ${balance.toLocaleString('id-ID')}` },
        { label: '', value: '' },
        { label: 'Catatan Sayang:', value: balance >= 0 ? "Tabungan kita aman, Sayang! ✨" : "Ayo lebih hemat lagi ya Cintaku! ❤️" },
        { label: 'Dibuat pada:', value: new Date().toLocaleString('id-ID') }
      ]);

      // Style summary header
      summarySheet.getRow(1).font = { bold: true, size: 12 };
      summarySheet.getRow(4).font = { bold: true };

      // 2. Prepare Transaction Sheet
      const transactionSheet = workbook.addWorksheet('Riwayat Transaksi');
      transactionSheet.columns = [
        { header: 'Tanggal', key: 'date', width: 15 },
        { header: 'Tipe', key: 'type', width: 15 },
        { header: 'Kategori', key: 'category', width: 20 },
        { header: 'Keterangan', key: 'note', width: 35 },
        { header: 'Nominal', key: 'amount', width: 18 },
        { header: 'Status', key: 'status', width: 12 }
      ];

      transactions.forEach(t => {
        transactionSheet.addRow({
          date: new Date(t.date).toLocaleDateString('id-ID'),
          type: t.type === 'income' ? 'Pemasukan' : 'Pengeluaran',
          category: t.category,
          note: t.note || '-',
          amount: t.amount,
          status: 'Sukses'
        });
      });

      // Style transaction header
      transactionSheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
      transactionSheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF1E293B' }
      };

      // Currency formatting for amount column
      transactionSheet.getColumn('amount').numFmt = '#,##0';

      // 3. Save File
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      saveAs(blob, `DompetKita_Laporan_${months[selectedMonth]}_${selectedYear}.xlsx`);
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const exportToPDF = async () => {
    setIsExporting(true);
    try {
      const { default: jsPDF } = await import('jspdf');
      const { default: autoTable } = await import('jspdf-autotable');
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      
      // --- BRANDED HEADER DESIGN ---
      // Deep slate top bar
      doc.setFillColor(30, 41, 59);
      doc.rect(0, 0, pageWidth, 40, 'F');
      
      // Abstract geometric accent (Replaced polygon with compatible triangle for professional look)
      doc.setFillColor(59, 130, 246); // blue-500
      doc.triangle(pageWidth - 40, 0, pageWidth, 0, pageWidth, 40, 'F');

      // Logo Text
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(22);
      doc.text("DompetKita", 15, 20);
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.text("FINANCIAL FREEDOM HUB", 15, 27);

      // Period Badge (Right Side)
      doc.text(`PERIODE: ${months[selectedMonth].toUpperCase()} ${selectedYear}`, pageWidth - 15, 22, { align: 'right' });
      doc.setFontSize(8);
      doc.text(`Dibuat pada: ${new Date().toLocaleDateString('id-ID')}`, pageWidth - 15, 27, { align: 'right' });

      // --- FINANCIAL DASHBOARD SECTION ---
      let yPos = 55;
      doc.setTextColor(30, 41, 59);
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("RINGKASAN KESEHATAN KEUANGAN", 15, yPos);
      
      yPos += 10;
      const cardWidth = 60;
      const cardHeight = 25;
      const spacing = 7.5;

      // INCOME CARD
      doc.setFillColor(240, 253, 244); // emerald-50
      doc.setDrawColor(187, 247, 208); // emerald-200
      doc.roundedRect(15, yPos, cardWidth, cardHeight, 3, 3, 'FD');
      doc.setTextColor(21, 128, 61); // emerald-700
      doc.setFontSize(8);
      doc.text("TOTAL PEMASUKAN", 20, yPos + 8);
      doc.setFontSize(12);
      doc.text(`Rp ${totalIncome.toLocaleString('id-ID')}`, 20, yPos + 18);

      // EXPENSE CARD
      doc.setFillColor(255, 241, 242); // rose-50
      doc.setDrawColor(254, 205, 211); // rose-200
      doc.roundedRect(15 + cardWidth + spacing, yPos, cardWidth, cardHeight, 3, 3, 'FD');
      doc.setTextColor(190, 18, 60); // rose-700
      doc.text("TOTAL PENGELUARAN", 15 + cardWidth + spacing + 5, yPos + 8);
      doc.text(`Rp ${totalExpense.toLocaleString('id-ID')}`, 15 + cardWidth + spacing + 5, yPos + 18);

      // NET BALANCE CARD
      doc.setFillColor(239, 246, 255); // blue-50
      doc.setDrawColor(191, 219, 254); // blue-200
      doc.roundedRect(15 + (cardWidth + spacing) * 2, yPos, cardWidth, cardHeight, 3, 3, 'FD');
      doc.setTextColor(29, 78, 216); // blue-700
      doc.text("SALDO BERSIH", 15 + (cardWidth + spacing) * 2 + 5, yPos + 8);
      doc.text(`Rp ${balance.toLocaleString('id-ID')}`, 15 + (cardWidth + spacing) * 2 + 5, yPos + 18);

      // --- CATEGORY ANALYTICS TABLE ---
      yPos += cardHeight + 15;
      doc.setTextColor(30, 41, 59);
      doc.setFontSize(11);
      doc.text("INSIGHT KATEGORI TERBESAR", 15, yPos);
      
      const catData = (sortedCategories as CategorySummary[]).slice(0, 5).map(c => [
        c.category.toUpperCase(),
        c.type === 'income' ? 'PEMASUKAN' : 'PENGELUARAN',
        `Rp ${c.amount.toLocaleString('id-ID')}`,
        `${c.type === 'income' ? (totalIncome ? Math.round((c.amount / totalIncome) * 100) : 0) : (totalExpense ? Math.round((c.amount / totalExpense) * 100) : 0)}%`
      ]);

      autoTable(doc, {
        startY: yPos + 5,
        head: [['Kategori', 'Tipe', 'Nominal', 'Porsi']],
        body: catData,
        theme: 'grid',
        headStyles: { fillColor: [71, 85, 105], fontSize: 8, fontStyle: 'bold' },
        styles: { fontSize: 8 },
        margin: { left: 15, right: 15 }
      });

      // --- FULL TRANSACTION LEDGER ---
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      yPos = (doc as any).lastAutoTable.finalY + 15;
      if (yPos > pageHeight - 40) {
        doc.addPage();
        yPos = 20;
      }
      
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.text("RINCIAN TRANSAKSI HARIAN", 15, yPos);

      const tableData = transactions.map(t => [
        new Date(t.date).toLocaleDateString('id-ID'),
        t.category,
        t.note || '-',
        t.type === 'income' ? 'IN' : 'OUT',
        `Rp ${t.amount.toLocaleString('id-ID')}`
      ]);

      autoTable(doc, {
        startY: yPos + 5,
        head: [['Tanggal', 'Kategori', 'Keterangan', 'Aksi', 'Nominal']],
        body: tableData,
        theme: 'striped',
        headStyles: { fillColor: [30, 41, 59], fontSize: 9 },
        columnStyles: {
          3: { halign: 'center', fontStyle: 'bold' },
          4: { halign: 'right', fontStyle: 'bold' }
        },
        didParseCell: (data) => {
          if (data.column.index === 3 && data.cell.section === 'body') {
            data.cell.styles.textColor = data.cell.text[0] === 'IN' ? [21, 128, 61] : [190, 18, 60];
          }
        },
        margin: { left: 15, right: 15, bottom: 25 }
      });

      // --- PREMIUM FOOTER ---
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const totalPages = (doc as any).internal.getNumberOfPages();
      for(let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFillColor(248, 250, 252);
        doc.rect(0, pageHeight - 20, pageWidth, 20, 'F');
        
        doc.setFontSize(8);
        doc.setTextColor(148, 163, 184);
        doc.setFont("helvetica", "italic");
        doc.text("Laporan ini dihasilkan secara aman oleh DompetKita - Copyright 2026", 15, pageHeight - 10);
        doc.text(`Halaman ${i} / ${totalPages}`, pageWidth - 15, pageHeight - 10, { align: 'right' });
      }

      doc.save(`DompetKita_Pro_Report_${months[selectedMonth]}_${selectedYear}.pdf`);
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  // Calculations
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

  return (
    <div className="container mx-auto px-4 py-8">
      <PageLoader isLoading={isLoading} message="Menghitung kepingan kebahagiaan kita, sebentar lagi siap ya Sayang... 📊💖" />
      <PageLoader isLoading={isExporting} message="Lagi menyiapkan laporan spesial buat kamu... ✨📄" />
      
      {/* Mobile Greeting */}
      <div className="lg:hidden flex justify-center mb-6 md:mb-10">
        <div className="bg-white/90 backdrop-blur-2xl py-4 md:py-6 px-6 md:px-10 rounded-[24px] md:rounded-[32px] items-center justify-center shadow-2xl border border-white w-full text-center">
          <h2 className="text-xl md:text-3xl font-black text-slate-800 tracking-tight leading-tight">
            <span className="font-script text-5xl md:text-8xl text-blue-500 block mb-1">Hallo Sayang..</span>
            <span className="text-slate-500 font-bold text-xs md:text-lg block tracking-normal">Ini Rangkuman Data Kita Yaa ❤️</span>
          </h2>
        </div>
      </div>

      {/* Header Row */}
      <header className="flex items-center justify-between mb-6 md:mb-8 gap-3">
        <div className="flex items-center gap-2 md:gap-3 shrink-0 cursor-pointer" onClick={() => navigate('/')}>
          <div className="w-9 h-9 md:w-12 md:h-12 relative flex items-center justify-center p-1 bg-white rounded-xl md:rounded-2xl shadow-sm border border-slate-100">
            <img src="/logo-utama.svg" alt="Logo" className="w-full h-full object-contain" />
          </div>
          <div className="flex flex-col gap-0.5 md:gap-1">
            <h1 className="text-sm md:text-2xl font-black text-slate-800 tracking-tight leading-none">
              Dompet<span className="text-blue-600">Kita</span>
            </h1>
            <span className="text-[7px] md:text-[9px] font-black text-slate-500/80 uppercase tracking-[0.2em]">
              Financial Hub
            </span>
          </div>
        </div>

        <div className="hidden lg:flex bg-white/80 backdrop-blur-2xl py-6 px-[58px] rounded-[40px] items-center justify-center border border-white shadow-2xl transition-transform hover:scale-105">
          <h2 className="text-2xl font-black text-slate-800 whitespace-nowrap tracking-tight">
            <span className="font-script text-[5rem] mr-4 text-blue-500 block lg:inline-block leading-none">Hallo Sayang,</span> 
            <span className="text-slate-600 font-bold italic">Ini Halaman <span className="text-blue-600 not-italic">Rangkuman Data</span> Kita Yaa ❤️</span>
            <span className="ml-2 inline-block animate-pulse">✨</span>
          </h2>
        </div>

        <div className="flex items-center gap-4 md:gap-8">
          <Button variant="outline" size="icon" className="w-11 h-11 md:w-14 md:h-14 rounded-full bg-white/95 backdrop-blur-xl shadow-xl border-white active:scale-95 transition-all p-0 group overflow-hidden relative">
            <motion.div 
              animate={{ opacity: [0.3, 0.5, 0.3] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="absolute inset-0 bg-linear-to-tr from-yellow-200/50 via-yellow-100/30 to-white/10 blur-xl"
            />
            <div className="w-full h-full flex items-center justify-center z-10 rounded-full overflow-hidden">
              <video 
                src="/icons/3d/turtle-moon.mp4" 
                autoPlay 
                loop 
                muted 
                playsInline
                className="w-full h-full object-cover scale-[1.2]" 
              />
            </div>
          </Button>
          <UserNavDropdown />
        </div>
      </header>

      {/* Action Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
        <div className="relative group/period">
          <div 
            onClick={() => setIsPickerOpen(!isPickerOpen)}
            className="bg-white/80 backdrop-blur-xl border border-white rounded-[24px] px-6 h-14 flex items-center gap-4 shadow-sm min-w-[280px] cursor-pointer hover:bg-white/90 transition-all"
          >
            <Calendar className="w-5 h-5 text-blue-500" />
            <span className="text-slate-400 font-bold text-sm">Periode</span>
            <div className="h-8 w-px bg-slate-100" />
            <span className="font-bold text-slate-700 text-sm">{months[selectedMonth]} {selectedYear}</span>
            <ChevronDown className={cn("w-4 h-4 text-slate-400 ml-auto transition-transform", isPickerOpen && "rotate-180")} />
          </div>

          <AnimatePresence>
            {isPickerOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute top-full left-0 right-0 mt-3 p-4 bg-white/95 backdrop-blur-2xl border border-white rounded-[32px] shadow-2xl z-60 min-w-[320px]"
              >
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                     <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Bulan</span>
                     <div className="max-h-48 overflow-y-auto custom-scrollbar pr-1">
                        {months.map((m, i) => (
                          <button
                            key={m}
                            onClick={() => {
                              setSelectedMonth(i);
                              setIsPickerOpen(false);
                            }}
                            className={cn(
                              "w-full text-left px-4 py-2 rounded-xl text-sm font-bold transition-all mb-1",
                              selectedMonth === i 
                                ? "bg-blue-500 text-white shadow-lg shadow-blue-200" 
                                : "text-slate-600 hover:bg-slate-50"
                            )}
                          >
                            {m}
                          </button>
                        ))}
                     </div>
                  </div>
                  <div className="space-y-2">
                     <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Tahun</span>
                     <div className="space-y-1">
                        {years.map(y => (
                          <button
                            key={y}
                            onClick={() => {
                              setSelectedYear(y);
                              setIsPickerOpen(false);
                            }}
                            className={cn(
                              "w-full text-left px-4 py-2 rounded-xl text-sm font-bold transition-all",
                              selectedYear === y 
                                ? "bg-blue-500 text-white shadow-lg shadow-blue-200" 
                                : "text-slate-600 hover:bg-slate-50"
                            )}
                          >
                            {y}
                          </button>
                        ))}
                     </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex items-center gap-3">
           <Button onClick={exportToExcel} className="h-12 px-6 bg-emerald-100 hover:bg-emerald-200 text-emerald-600 rounded-[20px] border-none shadow-sm flex items-center gap-2 font-black text-xs uppercase tracking-wider transition-all hover:scale-105 active:scale-95">
              <FileSpreadsheet className="w-4 h-4" /> Ekspor Excel
           </Button>
           <Button onClick={exportToPDF} className="h-12 px-6 bg-rose-100 hover:bg-rose-200 text-rose-600 rounded-[20px] border-none shadow-sm flex items-center gap-2 font-black text-xs uppercase tracking-wider transition-all hover:scale-105 active:scale-95">
              <FileText className="w-4 h-4" /> Ekspor PDF
           </Button>
        </div>
      </div>

      {/* Summary Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard title="Total Pemasukan" amount={totalIncome} imageSrc="/icons/3d/income.webp" variant="income" />
        <StatCard title="Total Pengeluaran" amount={totalExpense} imageSrc="/icons/3d/expense.webp" variant="expense" />
        <StatCard title="Total Saldo" amount={balance} imageSrc="/icons/3d/wallet.webp" variant="saldo" />
      </div>

      {/* Categories Breakdown */}
      <div className="bg-white/60 backdrop-blur-2xl border border-white/80 rounded-[48px] p-6 md:p-10 mb-8 shadow-2xl">
         <div className="space-y-4">
            {sortedCategories.slice(0, 3).map((cat, i) => (
              <div key={i} className="bg-white/80 p-6 rounded-[32px] flex items-center justify-between border border-white shadow-sm hover:translate-x-2 transition-transform cursor-pointer group">
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                    Kategori {cat.type === 'income' ? 'Pemasukan' : 'Pengeluaran'}
                  </span>
                  <span className="text-lg font-black text-slate-800 tracking-tight">{cat.category}</span>
                </div>
                <div className="flex items-center gap-6">
                  <span className={cn("text-xl font-black tracking-tighter", cat.type === 'income' ? 'text-emerald-500' : 'text-blue-500')}>
                    Rp. {cat.amount.toLocaleString('id-ID')}
                  </span>
                  <div className="bg-slate-100 px-4 py-1.5 rounded-full font-black text-[10px] text-slate-500 uppercase tracking-widest">
                    {cat.type === 'income' 
                      ? (totalIncome ? Math.round((cat.amount / totalIncome) * 100) : 0)
                      : (totalExpense ? Math.round((cat.amount / totalExpense) * 100) : 0)}%
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-200 group-hover:text-blue-500 transition-colors" />
                </div>
              </div>
            ))}
         </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         <div className="bg-white/90 backdrop-blur-2xl p-8 rounded-[40px] border border-white shadow-xl min-h-[400px]">
            <h3 className="text-sm font-black text-slate-800 mb-8 tracking-tight uppercase">Pemasukan vs Pengeluaran</h3>
            <div className="h-[250px]">
               <Bar data={barChartData} options={{ maintainAspectRatio: false, plugins: { legend: { display: false } } }} />
            </div>
         </div>

         <div className="bg-white/90 backdrop-blur-2xl p-8 rounded-[40px] border border-white shadow-xl min-h-[400px]">
            <h3 className="text-sm font-black text-slate-800 mb-8 tracking-tight uppercase">Breakdown Kategori</h3>
            <div className="h-[250px] flex items-center justify-center">
               <Doughnut data={doughnutData} options={{ maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }} />
            </div>
         </div>

         <div className="bg-white/90 backdrop-blur-2xl p-8 rounded-[40px] border border-white shadow-xl min-h-[400px]">
            <h3 className="text-sm font-black text-slate-800 mb-8 tracking-tight uppercase">Tren Keuangan</h3>
            <div className="h-[250px]">
               <Line 
                 data={barChartData} 
                 options={{ 
                   maintainAspectRatio: false, 
                   plugins: { legend: { display: false } },
                   scales: { y: { display: false }, x: { grid: { display: false } } }
                 }} 
               />
            </div>
         </div>
      </div>
    </div>
  );
};

export default Reports;
