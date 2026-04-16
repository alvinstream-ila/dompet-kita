import {
  ArcElement,
  BarElement,
  CategoryScale,
  type ChartData,
  Chart as ChartJS,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
} from 'chart.js';
import type React from 'react';
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

interface ReportChartsProps {
  barChartData: ChartData<'bar'>;
  doughnutData: ChartData<'doughnut'>;
}

export const ReportCharts: React.FC<ReportChartsProps> = ({
  barChartData,
  doughnutData,
}) => {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div className="group hover:border-blue-royal/20 flex min-h-[400px] flex-col rounded-[40px] border border-white bg-white/90 p-8 shadow-xl backdrop-blur-2xl transition-all hover:shadow-2xl">
        <h3 className="mb-8 text-sm leading-none font-black tracking-tighter text-slate-800 uppercase opacity-60 transition-opacity group-hover:opacity-100">
          Pemasukan vs Pengeluaran
        </h3>
        <div className="h-[250px] flex-1">
          <Bar
            data={barChartData}
            options={{
              maintainAspectRatio: false,
              plugins: { legend: { display: false } },
              scales: {
                x: { grid: { display: false } },
                y: { display: false },
              },
            }}
          />
        </div>
      </div>

      <div className="group hover:border-red-stat/20 flex min-h-[400px] flex-col rounded-[40px] border border-white bg-white/90 p-8 shadow-xl backdrop-blur-2xl transition-all hover:shadow-2xl">
        <h3 className="mb-8 text-sm leading-none font-black tracking-tighter text-slate-800 uppercase opacity-60 transition-opacity group-hover:opacity-100">
          Komposisi Pengeluaran
        </h3>
        <div className="flex h-[250px] flex-1 items-center justify-center">
          <Doughnut
            data={doughnutData}
            options={{
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  position: 'bottom',
                  labels: { usePointStyle: true, font: { weight: 'bold' } },
                },
              },
            }}
          />
        </div>
      </div>

      <div className="group hover:border-blue-royal/20 flex min-h-[400px] flex-col rounded-[40px] border border-white bg-white/90 p-8 shadow-xl backdrop-blur-2xl transition-all hover:shadow-2xl">
        <h3 className="mb-8 text-sm leading-none font-black tracking-tighter text-slate-800 uppercase opacity-60 transition-opacity group-hover:opacity-100">
          Tren Berjalan
        </h3>
        <div className="h-[250px] flex-1">
          <Line
            data={barChartData as unknown as ChartData<'line'>}
            options={{
              maintainAspectRatio: false,
              plugins: { legend: { display: false } },
              scales: {
                y: { display: false },
                x: { grid: { display: false } },
              },
            }}
          />
        </div>
      </div>
    </div>
  );
};
