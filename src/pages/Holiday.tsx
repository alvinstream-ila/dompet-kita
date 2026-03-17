import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plane, 
  MapPin, 
  Calendar as CalendarIcon, 
  Plus, 
  Heart, 
  Camera,
  Utensils,
  Backpack,
  Wallet,
  Clock
} from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { useFormatting } from '@/hooks/useFormatting';

interface Trip {
  id: string;
  destination: string;
  date: string;
  budget: number;
  spent: number;
  status: 'Planning' | 'Confirmed' | 'Completed';
  image: string;
}

const Holiday: React.FC = () => {
  const { formatAmount } = useFormatting();
  const [trips] = useState<Trip[]>([
    {
      id: '1',
      destination: 'Bali, Indonesia 🌴',
      date: 'Desember 2024',
      budget: 15000000,
      spent: 5000000,
      status: 'Confirmed',
      image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=400&q=80'
    },
    {
      id: '2',
      destination: 'Tokyo, Japan 🌸',
      date: 'April 2025',
      budget: 45000000,
      spent: 0,
      status: 'Planning',
      image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=400&q=80'
    }
  ]);

  return (
    <div className="container mx-auto px-4 py-8 pb-32">
      {/* Header Section */}
      <header className="mb-10 text-center relative">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }} 
          animate={{ opacity: 1, scale: 1 }}
          className="inline-block px-4 py-1.5 rounded-full bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-[0.2em] mb-4 border border-blue-100/50"
        >
          Adventure Together ✨
        </motion.div>
        <h1 className="text-4xl md:text-6xl font-black text-slate-800 tracking-tighter mb-4">
          Liburan <span className="text-pink-500">Impian</span> Kita
        </h1>
        <p className="text-slate-500 font-medium max-w-lg mx-auto leading-relaxed">
          Kemanapun kita pergi, yang penting bareng kamu Sayang! Ayo tabung dan rencanakan petualangan kita selanjutnya! ❤️
        </p>
      </header>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="bg-white/70 backdrop-blur-xl border-white rounded-[40px] shadow-xl p-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
              <Plane className="size-12 text-blue-500" />
            </div>
            <div className="relative z-10">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Total Trip</span>
              <span className="text-3xl font-black text-slate-800 tracking-tighter">02 <span className="text-slate-300 text-xl">Rencana</span></span>
            </div>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="bg-white/70 backdrop-blur-xl border-white rounded-[40px] shadow-xl p-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
              <Wallet className="size-12 text-emerald-500" />
            </div>
            <div className="relative z-10">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Dana Terkumpul</span>
              <span className="text-3xl font-black text-emerald-600 tracking-tighter">{formatAmount(5000000)}</span>
            </div>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="bg-white/70 backdrop-blur-xl border-white rounded-[40px] shadow-xl p-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
              <Heart className="size-12 text-pink-500 fill-pink-50" />
            </div>
            <div className="relative z-10">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Mimpi Bareng</span>
              <span className="text-3xl font-black text-pink-500 tracking-tighter">100% <span className="text-slate-300 text-xl font-medium italic">Love</span></span>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Main Trip Card */}
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tighter flex items-center gap-3">
            <div className="w-2 h-8 bg-pink-500 rounded-full" />
            Petualangan Kita
          </h3>
          <Button variant="outline" className="rounded-2xl border-dashed border-2 px-6 h-12 font-black uppercase text-[11px] tracking-widest hover:bg-slate-50">
            <Plus className="size-4 mr-2" />
            Tambah Bucket List
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <AnimatePresence>
            {trips.map((trip, idx) => (
              <motion.div
                key={trip.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.1 }}
                whileHover={{ y: -10 }}
                className="group relative"
              >
                <Card className="overflow-hidden rounded-[48px] border-white/60 bg-white/50 backdrop-blur-2xl shadow-2xl border-2">
                  <div className="relative h-64 overflow-hidden">
                    <img 
                      src={trip.image} 
                      alt={trip.destination} 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent" />
                    <div className="absolute top-6 left-6 flex items-center gap-2">
                      <div className={cn(
                        "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest backdrop-blur-md shadow-lg",
                        trip.status === 'Planning' ? "bg-amber-500/90 text-white" : "bg-emerald-500/90 text-white"
                      )}>
                        {trip.status}
                      </div>
                    </div>
                    <div className="absolute bottom-6 left-8 right-8 text-white">
                      <h4 className="text-3xl font-black tracking-tight mb-2 drop-shadow-md">{trip.destination}</h4>
                      <div className="flex items-center gap-4 text-sm font-medium opacity-90">
                        <div className="flex items-center gap-1.5">
                          <CalendarIcon className="size-4" />
                          {trip.date}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <MapPin className="size-4" />
                          World Tour
                        </div>
                      </div>
                    </div>
                  </div>

                  <CardContent className="p-8 space-y-6">
                    <div className="space-y-3">
                      <div className="flex justify-between items-end mb-1">
                        <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Tabungan Trip</span>
                        <span className="text-[11px] font-black text-slate-800 uppercase tracking-widest">
                          {Math.round((trip.spent / trip.budget) * 100)}% Terkumpul
                        </span>
                      </div>
                      <Progress value={(trip.spent / trip.budget) * 100} className="h-4 rounded-full bg-slate-100 overflow-hidden shadow-inner">
                        <div 
                          className="h-full bg-linear-to-r from-blue-500 via-blue-400 to-indigo-500 transition-all duration-1000" 
                          style={{ width: `${(trip.spent / trip.budget) * 100}%` }} 
                        />
                      </Progress>
                      <div className="flex justify-between text-base font-bold tracking-tight">
                        <span className="text-blue-600 font-black">{formatAmount(trip.spent)}</span>
                        <span className="text-slate-400">Limit: {formatAmount(trip.budget)}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-4 gap-3 pt-4 border-t border-slate-100">
                      {[
                        { icon: Camera, label: 'Photos' },
                        { icon: Utensils, label: 'Food' },
                        { icon: Backpack, label: 'Items' },
                        { icon: Clock, label: 'Itinerari' }
                      ].map((item, i) => (
                        <button key={i} className="flex flex-col items-center gap-2 group/btn">
                          <div className="size-12 rounded-2xl bg-slate-50 flex items-center justify-center transition-all group-hover/btn:bg-blue-50 group-hover/btn:text-blue-500 group-hover/btn:scale-110">
                            <item.icon className="size-5" />
                          </div>
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{item.label}</span>
                        </button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default Holiday;
