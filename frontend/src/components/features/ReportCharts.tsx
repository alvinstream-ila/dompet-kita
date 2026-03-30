import React from 'react';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
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

interface ReportChartsProps {
  barChartData: any;
  doughnutData: any;
}

export const ReportCharts: React.FC<ReportChartsProps> = ({
  barChartData,
  doughnutData
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="bg-white/90 backdrop-blur-2xl p-8 rounded-[40px] border border-white shadow-xl min-h-[400px] flex flex-col group transition-all hover:shadow-2xl hover:border-blue-50">
        <h3 className="text-sm font-black text-slate-800 mb-8 tracking-tighter uppercase leading-none opacity-60 group-hover:opacity-100 transition-opacity">Pemasukan vs Pengeluaran</h3>
        <div className="h-[250px] flex-1">
          <Bar 
            data={barChartData} 
            options={{ 
              maintainAspectRatio: false, 
              plugins: { legend: { display: false } },
              scales: { x: { grid: { display: false } }, y: { display: false } }
            }} 
          />
        </div>
      </div>

      <div className="bg-white/90 backdrop-blur-2xl p-8 rounded-[40px] border border-white shadow-xl min-h-[400px] flex flex-col group transition-all hover:shadow-2xl hover:border-emerald-50">
        <h3 className="text-sm font-black text-slate-800 mb-8 tracking-tighter uppercase leading-none opacity-60 group-hover:opacity-100 transition-opacity">Komposisi Pengeluaran</h3>
        <div className="h-[250px] flex-1 flex items-center justify-center">
          <Doughnut 
            data={doughnutData} 
            options={{ 
              maintainAspectRatio: false, 
              plugins: { legend: { position: 'bottom', labels: { usePointStyle: true, font: { weight: 'bold' } } } } 
            }} 
          />
        </div>
      </div>

      <div className="bg-white/90 backdrop-blur-2xl p-8 rounded-[40px] border border-white shadow-xl min-h-[400px] flex flex-col group transition-all hover:shadow-2xl hover:border-violet-50">
        <h3 className="text-sm font-black text-slate-800 mb-8 tracking-tighter uppercase leading-none opacity-60 group-hover:opacity-100 transition-opacity">Tren Berjalan</h3>
        <div className="h-[250px] flex-1">
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
  );
};
