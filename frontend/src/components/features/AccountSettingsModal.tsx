import React, { useState, useEffect } from 'react';
import api from '@/lib/axios';
import { useAuth, type User as UserType } from '@/context/AuthContext';
import {
  Loader2,
  User,
  CheckCircle2,
  ShieldCheck,
  LogOut,
  KeyRound,
  CalendarDays,
  EyeOff,
  Coins,
  Settings2,
  Mail,
  Heart,
  Globe,
  Users
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSettings } from '@/hooks/useSettings';
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface AccountSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserType | null;
  defaultTab?: string;
}

export const AccountSettingsModal: React.FC<AccountSettingsModalProps> = ({ isOpen, onClose, user, defaultTab = 'profile' }) => {
  const {
    budgetCycleStart,
    isPrivacyMode,
    currencyFormat,
    exchangeRate,
    monthlyBudgetLimit,
    fullName: storedFullName,
    partnerName: storedPartnerName,
    anniversaryDate: storedAnniversaryDate,
    timezone: storedTimezone,
    updateSettings
  } = useSettings();
  const { logout } = useAuth();
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Profile States
  const [displayName, setDisplayName] = useState('');
  const [fullName, setFullName] = useState('');
  const [partnerName, setPartnerName] = useState('');
  const [anniversaryDate, setAnniversaryDate] = useState('');
  const [timezone, setTimezone] = useState('');

  useEffect(() => {
    if (isOpen) {
      setActiveTab(defaultTab);
    }
  }, [isOpen, defaultTab]);

  useEffect(() => {
    if (user && isOpen) {
      setDisplayName(user.name || '');
      setFullName(storedFullName || '');
      setPartnerName(storedPartnerName || '');
      setAnniversaryDate(storedAnniversaryDate || '');
      setTimezone(storedTimezone || 'Asia/Jakarta');
      setSuccess(false);
    }
  }, [user, isOpen, storedFullName, storedPartnerName, storedAnniversaryDate, storedTimezone]);

  if (!user && isOpen) return null;

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateSettings({
        fullName,
        partnerName,
        anniversaryDate,
        timezone,
      });
      // Updating basic name via api.put as well just in case SettingsContext doesn't handle 'name' column
      await api.put('/user/profile', { name: displayName });

      showSuccess('Profil berhasil diupdate! ✨');
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  };


  const showSuccess = (msg: string) => {
    setSuccess(true);
    setSuccessMessage(msg);
    setTimeout(() => {
      setSuccess(false);
    }, 2000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[440px] p-0 overflow-hidden rounded-[40px] border-none shadow-2xl bg-white/95 backdrop-blur-xl">
        <DialogHeader className="p-8 pb-14 bg-slate-900 text-white relative overflow-hidden">
          <div className="relative z-10 space-y-1">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-70">Control Center</p>
            <DialogTitle className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
              <ShieldCheck className="w-6 h-6 text-blue-400" />
              PENGATURAN AKUN
            </DialogTitle>
            <DialogDescription className="sr-only">
              Kelola profil, keamanan, dan preferensi aplikasi Anda di sini.
            </DialogDescription>
          </div>
          <div className="absolute -right-10 -top-10 w-48 h-48 bg-blue-500/20 rounded-full blur-3xl" />
          <div className="absolute -left-10 -bottom-10 w-32 h-32 bg-pink-500/10 rounded-full blur-2xl" />
        </DialogHeader>

        <div className="px-6 pb-8 -mt-8 relative z-20">
          <div className="bg-white rounded-[32px] p-2 shadow-2xl border border-slate-100 min-h-[400px] flex flex-col">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full flex-1 flex flex-col">
              <div className="px-4 pt-4">
                <TabsList className="grid w-full grid-cols-3 p-1 bg-slate-50 rounded-2xl h-11">
                  <TabsTrigger value="profile" className="rounded-xl font-black text-[10px] tracking-widest">UMUM</TabsTrigger>
                  <TabsTrigger value="privacy" className="rounded-xl font-black text-[10px] tracking-widest">KEAMANAN</TabsTrigger>
                  <TabsTrigger value="preferences" className="rounded-xl font-black text-[10px] tracking-widest">PREFERENSI</TabsTrigger>
                </TabsList>
              </div>

              <div className="flex-1 overflow-y-auto px-4 py-6">
                {success ? (
                  <div className="py-12 text-center space-y-4 animate-in fade-in zoom-in duration-300">
                    <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-2">
                      <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">Sukses!</h3>
                      <p className="text-sm font-bold text-slate-500 px-6 leading-relaxed">{successMessage}</p>
                    </div>
                  </div>
                ) : (
                  <>
                    <TabsContent value="profile" className="m-0 space-y-6 animate-in slide-in-from-left-2 duration-300 text-center">
                      <div className="flex flex-col items-center gap-4 mb-2">
                        <div className="w-24 h-24 rounded-full border-4 border-slate-50 shadow-md overflow-hidden relative bg-slate-100 flex items-center justify-center">
                          <div className="w-full h-full bg-linear-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-3xl font-black">
                            {(displayName || user?.email || '?').charAt(0).toUpperCase()}
                          </div>
                        </div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Profil</p>
                      </div>

                      <form onSubmit={handleUpdateProfile} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4 text-left">
                          <div className="space-y-2">
                            <Label className="text-[10px] font-black text-slate-800 uppercase tracking-widest px-1">Nama Panggilan</Label>
                            <div className="relative group">
                              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                              <Input
                                value={displayName}
                                onChange={(e) => setDisplayName(e.target.value)}
                                placeholder="Alvin/Ila"
                                className="h-11 bg-slate-50 border-slate-200 rounded-xl pl-11 font-bold text-sm"
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-[10px] font-black text-slate-800 uppercase tracking-widest px-1">Nama Lengkap</Label>
                            <div className="relative group">
                              <Users className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                              <Input
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                placeholder="Nama Lengkap"
                                className="h-11 bg-slate-50 border-slate-200 rounded-xl pl-11 font-bold text-sm"
                              />
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-left">
                          <div className="space-y-2">
                            <Label className="text-[10px] font-black text-slate-800 uppercase tracking-widest px-1">Nama Pasangan</Label>
                            <div className="relative group">
                              <Heart className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-pink-500 transition-colors" />
                              <Input
                                value={partnerName}
                                onChange={(e) => setPartnerName(e.target.value)}
                                placeholder="Nama Sayang"
                                className="h-11 bg-slate-50 border-slate-200 rounded-xl pl-11 font-bold text-sm"
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-[10px] font-black text-slate-800 uppercase tracking-widest px-1">Hari Spesial</Label>
                            <div className="relative group">
                              <CalendarDays className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-red-500 transition-colors" />
                              <Input
                                type="date"
                                value={anniversaryDate}
                                onChange={(e) => setAnniversaryDate(e.target.value)}
                                className="h-11 bg-slate-50 border-slate-200 rounded-xl pl-11 font-bold text-sm"
                              />
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2 text-left">
                          <Label className="text-[10px] font-black text-slate-800 uppercase tracking-widest px-1">Wilayah Waktu (Zona Waktu)</Label>
                          <div className="relative group">
                            <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                            <select
                              value={timezone}
                              onChange={(e) => setTimezone(e.target.value)}
                              className="w-full h-11 bg-slate-50 border-slate-200 rounded-xl pl-11 pr-4 font-bold text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                            >
                              <option value="Asia/Jakarta">WIB (Jakarta/Sumatera/Jawa)</option>
                              <option value="Asia/Makassar">WITA (Bali/Kalimantan/Sulawesi)</option>
                              <option value="Asia/Jayapura">WIT (Maluku/Papua)</option>
                              <option value="UTC">UTC (Universal Time)</option>
                            </select>
                          </div>
                        </div>

                        <Button disabled={loading} className="w-full h-12 bg-slate-900 hover:bg-black rounded-2xl font-black text-[11px] tracking-widest uppercase shadow-md text-white mt-2">
                          {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "SIMPAN PERUBAHAN PROFIL"}
                        </Button>
                      </form>
                    </TabsContent>

                    <TabsContent value="privacy" className="m-0 space-y-6 animate-in slide-in-from-right-2 duration-300">
                      <div className="bg-blue-50/50 rounded-2xl p-4 border border-blue-100">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">
                            <ShieldCheck className="w-4 h-4" />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[10px] font-black text-blue-600 uppercase tracking-wider">Status Akun</span>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div className="space-y-1.5 px-1">
                            <Label className="text-[10px] font-bold text-slate-500 uppercase">Alamat Email</Label>
                            <Input
                              value={user?.email}
                              disabled
                              className="h-10 bg-white/50 border-blue-100 rounded-xl font-bold text-sm opacity-60"
                            />
                            <p className="text-[9px] font-bold text-blue-400 mt-1 italic">Email resmi kalian berdua ya, Sayang! ✨</p>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="flex items-center gap-2 mb-2">
                          <KeyRound className="size-4 text-slate-400" />
                          <span className="text-[10px] font-black text-slate-800 uppercase tracking-widest">Ganti Password</span>
                        </div>

                        <div className="bg-slate-50 border border-dashed border-slate-200 rounded-2xl p-6 text-center space-y-4">
                          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto shadow-sm">
                            <Mail className="w-6 h-6 text-blue-500" />
                          </div>
                          <div className="space-y-1">
                            <p className="text-[11px] font-bold text-slate-700 leading-relaxed px-2">
                              Demi keamanan akun kalian berdua, link untuk mengganti password akan dikirimkan langsung ke email resmi, Sayang! ❤️
                            </p>
                          </div>
                          <Button
                            disabled={loading}
                            onClick={async () => {
                              setLoading(true);
                              try {
                                await api.post('/forgot-password', { email: user?.email });
                                showSuccess('Link ganti password sudah dikirim ke email kamu, Sayang! ✨');
                              } catch (error) {
                                const errorMsg = (error as any).response?.data?.message || 'Gagal mengirim email, coba lagi ya sayang?';
                                alert(errorMsg);
                              } finally {
                                setLoading(false);
                              }
                            }}
                            className="w-full h-11 bg-slate-900 hover:bg-black rounded-xl font-black text-[10px] tracking-widest uppercase shadow-md text-white"
                          >
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "KIRIM LINK KE EMAIL"}
                          </Button>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-slate-100">
                        <Button
                          variant="outline"
                          onClick={async () => {
                            await logout();
                            onClose();
                          }}
                          className="w-full h-11 border-red-100 text-red-600 hover:bg-red-50 hover:text-red-700 rounded-xl font-bold text-[11px] uppercase transition-all"
                        >
                          <LogOut className="w-4 h-4 mr-2" /> KELUAR APLIKASI
                        </Button>
                      </div>
                    </TabsContent>

                    <TabsContent value="preferences" className="m-0 space-y-6 animate-in slide-in-from-right-2 duration-300">
                      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600">
                            <ShieldCheck className="w-4 h-4" />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[10px] font-black text-slate-800 uppercase tracking-wider leading-tight">Limit Budget Bulanan</span>
                            <span className="text-[11px] font-bold text-slate-500">Batas jajan bulanan kalian berdua</span>
                          </div>
                        </div>
                        <div className="relative group">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-black text-slate-400">Rp</span>
                          <Input
                            type="text"
                            value={new Intl.NumberFormat('id-ID').format(monthlyBudgetLimit)}
                            onChange={(e) => {
                              const val = e.target.value.replace(/[^0-9]/g, '');
                              updateSettings({ monthlyBudgetLimit: Number(val) || 0 });
                            }}
                            className="h-10 bg-white border-slate-200 rounded-xl pl-9 font-bold text-sm"
                          />
                          {monthlyBudgetLimit > 0 && (
                            <p className="text-[9px] font-black text-emerald-500 mt-2 uppercase tracking-tight italic px-1">
                              {new Intl.NumberFormat('id-ID', { notation: 'compact', compactDisplay: 'long' }).format(monthlyBudgetLimit)} rupiah ✨
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">
                            <CalendarDays className="w-4 h-4" />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[10px] font-black text-slate-800 uppercase tracking-wider leading-tight">Siklus Anggaran</span>
                            <span className="text-[11px] font-bold text-slate-500">Kapan bulan finansialmu dimulai?</span>
                          </div>
                        </div>
                        <select
                          value={budgetCycleStart}
                          onChange={(e) => updateSettings({ budgetCycleStart: parseInt(e.target.value) })}
                          className="w-full h-10 bg-white border-slate-200 rounded-xl px-3 font-bold text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                        >
                          {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
                            <option key={day} value={day}>Tanggal {day}</option>
                          ))}
                        </select>
                      </div>

                      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-pink-100 flex items-center justify-center text-pink-600">
                            <EyeOff className="w-4 h-4" />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[10px] font-black text-slate-800 uppercase tracking-wider leading-tight">Mode Privasi</span>
                            <span className="text-[11px] font-bold text-slate-500">Sembunyikan saldo</span>
                          </div>
                        </div>
                        <Switch checked={isPrivacyMode} onCheckedChange={(checked) => updateSettings({ isPrivacyMode: checked })} />
                      </div>



                      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center text-amber-600">
                              <Coins className="w-4 h-4" />
                            </div>
                            <div className="flex flex-col">
                              <span className="text-[10px] font-black text-slate-800 uppercase tracking-wider leading-tight">Mata Uang Global</span>
                              <span className="text-[11px] font-bold text-slate-500">Pilih mata uang favorit kalian</span>
                            </div>
                          </div>
                          <Select 
                             value={currencyFormat}
                             onValueChange={(value) => updateSettings({ currencyFormat: value })}
                           >
                             <SelectTrigger className="w-[140px] h-9 bg-white border-slate-200 rounded-lg text-[11px] font-black focus:ring-amber-500/20">
                               <SelectValue placeholder="Pilih Mata Uang" />
                             </SelectTrigger>
                             <SelectContent className="rounded-xl border-slate-100 shadow-xl shadow-slate-200/50">
                               <SelectItem value="IDR" className="text-[11px] font-bold py-2 focus:bg-amber-50">IDR - Rupiah 🇮🇩</SelectItem>
                               <SelectItem value="USD" className="text-[11px] font-bold py-2 focus:bg-amber-50">USD - Dollar 🇺🇸</SelectItem>
                               <SelectItem value="EUR" className="text-[11px] font-bold py-2 focus:bg-amber-50">EUR - Euro 🇪🇺</SelectItem>
                               <SelectItem value="JPY" className="text-[11px] font-bold py-2 focus:bg-amber-50">JPY - Yen 🇯🇵</SelectItem>
                               <SelectItem value="SGD" className="text-[11px] font-bold py-2 focus:bg-amber-50">SGD - Dollar 🇸🇬</SelectItem>
                               <SelectItem value="MYR" className="text-[11px] font-bold py-2 focus:bg-amber-50">MYR - Ringgit 🇲🇾</SelectItem>
                               <SelectItem value="SAR" className="text-[11px] font-bold py-2 focus:bg-amber-50">SAR - Riyal 🇸🇦</SelectItem>
                               <SelectItem value="GBP" className="text-[11px] font-bold py-2 focus:bg-amber-50">GBP - Pound 🇬🇧</SelectItem>
                               <SelectItem value="AUD" className="text-[11px] font-bold py-2 focus:bg-amber-50">AUD - Dollar 🇦🇺</SelectItem>
                               <SelectItem value="KRW" className="text-[11px] font-bold py-2 focus:bg-amber-50">KRW - Won 🇰🇷</SelectItem>
                             </SelectContent>
                           </Select>
                        </div>
                        
                        {(currencyFormat !== 'IDR' && exchangeRate) && (
                           <div className="bg-white/50 rounded-xl p-2.5 border border-amber-50 flex items-center justify-between">
                              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">Kurs Realtime (vs IDR)</span>
                              <span className="text-[10px] font-black text-amber-600">
                                1 {currencyFormat} = {new Intl.NumberFormat('id-ID', { maximumFractionDigits: 2 }).format(1 / exchangeRate)} IDR
                              </span>
                           </div>
                        )}
                      </div>

                      <div className="p-4 rounded-2xl border border-dashed border-slate-200 flex gap-3">
                        <Settings2 className="w-4 h-4 text-slate-300 mt-0.5" />
                        <p className="text-[10px] font-bold text-slate-400 leading-relaxed uppercase tracking-tight">
                          PENGATURAN INI AKAN DI-SYNC SECARA OTOMATIS KE SEMUA PERANGKAT KALIAN BERDUA, SAYANG! ✨
                        </p>
                      </div>
                    </TabsContent>
                  </>
                )}
              </div>
            </Tabs>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
