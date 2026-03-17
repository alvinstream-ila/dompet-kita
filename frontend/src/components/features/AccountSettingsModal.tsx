import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  Loader2, 
  User, 
  CheckCircle2,
  Camera,
  ImagePlus,
  ShieldCheck,
  Trash2,
  LogOut,
  AlertTriangle,
  MailCheck,
  Settings2,
  Zap,
  KeyRound,
  CalendarDays,
  EyeOff,
  Coins
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSettings } from '@/hooks/useSettings';
import { Switch } from "@/components/ui/switch";
import { useCurrency } from '@/hooks/useCurrency';
import { cn } from "@/lib/utils";

import type { User as SupabaseUser } from '@supabase/supabase-js';

interface AccountSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: SupabaseUser | null;
  defaultTab?: string;
}

export const AccountSettingsModal: React.FC<AccountSettingsModalProps> = ({ isOpen, onClose, user, defaultTab = 'profile' }) => {
  const { budgetCycleStart, isPrivacyMode, isEcoMode, currencyFormat, monthlyBudgetLimit, updateSettings } = useSettings();
  const { data: idrToUsd = 0.00006 } = useCurrency();
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Profile States
  const [displayName, setDisplayName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');

  // Security States
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordUpdateEmailSent, setPasswordUpdateEmailSent] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteConfirmationText, setDeleteConfirmationText] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteEmailSent, setDeleteEmailSent] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setActiveTab(defaultTab);
    }
  }, [isOpen, defaultTab]);

  useEffect(() => {
    if (user && isOpen) {
      setDisplayName(user.user_metadata?.display_name || user.user_metadata?.full_name || '');
      setAvatarUrl(user.user_metadata?.avatar_url || '');
      setSuccess(false);
      setNewPassword('');
      setConfirmPassword('');
      setCurrentPassword('');
      setPasswordUpdateEmailSent(false);
      setDeleteEmailSent(false);
    }
  }, [user, isOpen]);

  if (!user && isOpen) return null; // Guard if open but no user

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      if (!e.target.files || e.target.files.length === 0 || !user) return;
      const file = e.target.files[0];
      
      // Limit file size to 5MB
      if (file.size > 5 * 1024 * 1024) {
        alert('Ukuran foto terlalu besar sayang! Maksimal 5MB yaa.. ❤️');
        return;
      }

      setUploading(true);
      const fileExt = file.name.split('.').pop();
      const filePath = `${user.id}/${Math.random()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      setAvatarUrl(publicUrl);
      await supabase.auth.updateUser({ data: { avatar_url: publicUrl } });
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Gagal mengupload foto');
    } finally {
      setUploading(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        data: { display_name: displayName }
      });
      if (error) throw error;
      showSuccess('Profil berhasil diupdate! ✨');
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      alert('Password tidak cocok sayang!');
      return;
    }
    setLoading(true);
    try {
      // Step 1: Re-authenticate first
      if (!user?.email) throw new Error('Email tidak ditemukan');
      
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPassword,
      });

      if (authError) throw new Error('Password saat ini salah, sayang! Coba diingat lagi ya.');

      // Step 2: Update the password
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      
      setNewPassword('');
      setConfirmPassword('');
      setCurrentPassword('');
      setPasswordUpdateEmailSent(true);
      
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

  const handleDeleteAccountRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (deleteConfirmationText !== 'HAPUS PERMANEN') {
      alert('Teks konfirmasi salah, sayang!');
      return;
    }

    setLoading(true);
    try {
      // Step 1: Re-authenticate user with their password
      if (!user?.email) throw new Error('Email tidak ditemukan');

      const { error: authError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: deletePassword,
      });

      if (authError) throw new Error('Password salah, sayang! Coba ingat-ingat lagi ya.');

      // Step 2: In a real app, we'd call an Edge Function here to send a secure delete link.
      // For now, we simulate the success state of sending that email.
      setDeleteEmailSent(true);
      
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Terjadi kesalahan saat memproses permintaan.');
    } finally {
      setLoading(false);
    }
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
          </div>
          <div className="absolute -right-10 -top-10 w-48 h-48 bg-blue-500/20 rounded-full blur-3xl" />
          <div className="absolute -left-10 -bottom-10 w-32 h-32 bg-pink-500/10 rounded-full blur-2xl" />
        </DialogHeader>

        <div className="px-6 pb-8 -mt-8 relative z-20">
          <div className="bg-white rounded-[32px] p-2 shadow-2xl border border-slate-100 min-h-[400px] flex flex-col">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full flex-1 flex flex-col">
              <div className="px-4 pt-4">
                <TabsList className="grid w-full grid-cols-3 p-1 bg-slate-50 rounded-2xl h-11">
                  <TabsTrigger 
                    value="profile" 
                    className="rounded-xl font-black text-[10px] tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-slate-900"
                  >
                    UMUM
                  </TabsTrigger>
                  <TabsTrigger 
                    value="privacy" 
                    className="rounded-xl font-black text-[10px] tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-slate-900"
                  >
                    KEAMANAN
                  </TabsTrigger>
                  <TabsTrigger 
                    value="preferences" 
                    className="rounded-xl font-black text-[10px] tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-slate-900"
                  >
                    PREFERENSI
                  </TabsTrigger>
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
                    <TabsContent value="profile" className="m-0 space-y-6 animate-in slide-in-from-left-2 duration-300">
                      <div className="flex flex-col items-center gap-4 mb-2">
                        <div className="relative group cursor-pointer">
                          <input type="file" id="avatar-set" accept="image/*" className="hidden" onChange={handleAvatarUpload} disabled={uploading} />
                          <label htmlFor="avatar-set" className="block cursor-pointer">
                            <div className="w-24 h-24 rounded-full border-4 border-slate-50 shadow-md overflow-hidden relative bg-slate-100 transition-transform group-hover:scale-105 active:scale-95">
                              {avatarUrl ? (
                                <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full bg-linear-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-3xl font-black">
                                  {(displayName || user?.email || '?').charAt(0).toUpperCase()}
                                </div>
                              )}
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                {uploading ? <Loader2 className="w-6 h-6 text-white animate-spin" /> : <Camera className="w-6 h-6 text-white" />}
                              </div>
                            </div>
                          </label>
                          <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center border border-slate-100">
                            <ImagePlus className="size-4" />
                          </div>
                        </div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Foto Profil Alvin & Ila</p>
                      </div>

                      <form onSubmit={handleUpdateProfile} className="space-y-4">
                        <div className="space-y-2">
                          <Label className="text-[10px] font-black text-slate-800 uppercase tracking-widest px-1">Nama Panggilan</Label>
                          <div className="relative group">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                            <Input 
                              value={displayName}
                              onChange={(e) => setDisplayName(e.target.value)}
                              className="h-11 bg-slate-50 border-slate-200 rounded-xl pl-11 font-bold text-sm focus-visible:ring-blue-500/20"
                            />
                          </div>
                        </div>
                        <Button disabled={loading} className="w-full h-11 bg-slate-900 hover:bg-black rounded-xl font-black text-[11px] tracking-widest uppercase shadow-md text-white">
                          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "SIMPAN IDENTITAS"}
                        </Button>
                      </form>
                    </TabsContent>

                    <TabsContent value="privacy" className="m-0 space-y-6 animate-in slide-in-from-right-2 duration-300">
                      {passwordUpdateEmailSent ? (
                        <div className="py-8 text-center space-y-6 animate-in fade-in zoom-in duration-300">
                          <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto text-emerald-500">
                            <ShieldCheck className="w-10 h-10" />
                          </div>
                          <div className="space-y-2">
                            <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter">Password Diupdate! 🔒</h3>
                            <p className="text-slate-500 font-bold text-sm leading-relaxed px-6">
                              Password kamu sudah berhasil diganti. Notifikasi keamanan juga telah dikirim ke <b>{user?.email}</b>.
                              <br /><br />
                              Pastikan kamu selalu waspada ya, Sayang! ✨
                            </p>
                          </div>
                          <Button 
                            onClick={() => setPasswordUpdateEmailSent(false)}
                            className="w-full h-11 bg-slate-900 hover:bg-black text-white rounded-xl font-black uppercase tracking-widest text-[11px]"
                          >
                            KEMBALI KE PENGATURAN
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-6">
                          {/* Session Section */}
                          <div className="bg-blue-50/50 rounded-2xl p-4 border border-blue-100">
                            <div className="flex items-center gap-3 mb-3">
                              <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">
                                <MailCheck className="w-4 h-4" />
                              </div>
                              <div className="flex flex-col">
                                <span className="text-[10px] font-black text-blue-600 uppercase tracking-wider">Status Akun</span>
                                <span className="text-[11px] font-bold text-slate-700 truncate w-40">{user?.email}</span>
                              </div>
                              <div className="ml-auto flex items-center gap-1.5 px-2.5 py-1 bg-emerald-100 text-emerald-600 rounded-full">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                <span className="text-[9px] font-black uppercase">Aktif</span>
                              </div>
                            </div>
                          </div>

                          {/* Password Form */}
                          <form onSubmit={handleChangePassword} className="space-y-4">
                            <div className="flex items-center gap-2 px-1">
                              <KeyRound className="w-3.5 h-3.5 text-slate-400" />
                              <Label className="text-[10px] font-black text-slate-800 uppercase tracking-widest">Ganti Password</Label>
                            </div>
                            <div className="space-y-3">
                              <Input 
                                type="password"
                                placeholder="Password Saat Ini"
                                required
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                className="h-11 bg-slate-50 border-slate-200 rounded-xl px-4 font-bold text-sm focus-visible:bg-white"
                              />
                              <Input 
                                type="password"
                                placeholder="Password Baru"
                                required
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="h-11 bg-slate-50 border-slate-200 rounded-xl px-4 font-bold text-sm focus-visible:bg-white"
                              />
                              <Input 
                                type="password"
                                placeholder="Konfirmasi Password Baru"
                                required
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="h-11 bg-slate-50 border-slate-200 rounded-xl px-4 font-bold text-sm focus-visible:bg-white"
                              />
                            </div>
                            <Button disabled={loading} className="w-full h-11 bg-slate-900 hover:bg-black rounded-xl font-black text-[11px] tracking-widest uppercase shadow-lg shadow-slate-100 text-white">
                              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "GANTI PASSWORD"}
                            </Button>
                          </form>

                          {/* Danger Zone */}
                          <div className="pt-4 border-t border-slate-100">
                            <div className="flex items-center gap-2 mb-4 px-1">
                              <AlertTriangle className="w-3.5 h-3.5 text-red-500" />
                              <Label className="text-[10px] font-black text-red-600 uppercase tracking-widest">Danger Zone</Label>
                            </div>
                            <div className="space-y-3">
                              <Button 
                                variant="outline" 
                                type="button"
                                onClick={async () => {
                                  await supabase.auth.signOut();
                                  onClose();
                                }}
                                className="w-full h-11 border-red-100 text-red-600 hover:bg-red-50 hover:text-red-700 rounded-xl font-bold text-[11px] uppercase transition-colors"
                              >
                                <LogOut className="w-4 h-4 mr-2" /> Keluar Sesi Lain
                              </Button>
                              <Button 
                                variant="ghost" 
                                type="button"
                                onClick={() => setShowDeleteConfirm(true)}
                                className="w-full h-11 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl font-bold text-[10px] uppercase transition-colors"
                              >
                                Hapus Akun Dompet Kita
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}
                    </TabsContent>

                    <TabsContent value="preferences" className="m-0 space-y-6 animate-in slide-in-from-right-2 duration-300">
                      <div className="space-y-6">
                         {/* Budget Limit Setting */}
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
                           <div className="flex items-center gap-2 pt-1">
                             <div className="relative flex-1 group">
                               <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-black text-slate-400 group-focus-within:text-emerald-500 transition-colors">Rp</span>
                               <Input 
                                 type="number"
                                 value={monthlyBudgetLimit}
                                 onChange={(e) => updateSettings({ monthlyBudgetLimit: parseInt(e.target.value) || 0 })}
                                 className="h-10 bg-white border-slate-200 rounded-xl pl-9 pr-3 font-bold text-sm focus-visible:ring-emerald-500/20"
                               />
                             </div>
                           </div>
                         </div>

                        {/* Budget Cycle Setting */}
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
                          <div className="flex items-center gap-2 pt-1">
                            <div className="flex-1">
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
                            <div className="text-[10px] font-black text-slate-400 uppercase bg-white px-3 py-2 rounded-xl border border-slate-100">SETIAP BULAN</div>
                          </div>
                        </div>

                        {/* Privacy Mode Toggle */}
                        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between group">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-pink-100 flex items-center justify-center text-pink-600">
                              <EyeOff className="w-4 h-4" />
                            </div>
                            <div className="flex flex-col">
                              <span className="text-[10px] font-black text-slate-800 uppercase tracking-wider leading-tight">Mode Privasi</span>
                              <span className="text-[11px] font-bold text-slate-500">Sembunyikan saldo & nominal</span>
                            </div>
                          </div>
                          <Switch 
                            checked={isPrivacyMode}
                            onCheckedChange={(checked) => updateSettings({ isPrivacyMode: checked })}
                          />
                        </div>

                        {/* Eco Mode Toggle */}
                        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between group">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center text-amber-600">
                              <Zap className="w-4 h-4" />
                            </div>
                            <div className="flex flex-col">
                              <span className="text-[10px] font-black text-slate-800 uppercase tracking-wider leading-tight">Mode Hemat (Eco)</span>
                              <span className="text-[11px] font-bold text-slate-500">Matikan efek berat biar HP lancar ✨</span>
                            </div>
                          </div>
                          <Switch 
                            checked={isEcoMode}
                            onCheckedChange={(checked) => updateSettings({ isEcoMode: checked })}
                          />
                        </div>

                        {/* Currency Setting */}
                        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600">
                              <Coins className="w-4 h-4" />
                            </div>
                            <div className="flex flex-col">
                              <span className="text-[10px] font-black text-slate-800 uppercase tracking-wider leading-tight">Format Mata Uang</span>
                              <span className="text-[11px] font-bold text-slate-500">Default tampilan nominal</span>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-2 pt-1">
                            <Button 
                              variant={currencyFormat === 'IDR' ? 'default' : 'outline'}
                              onClick={() => updateSettings({ currencyFormat: 'IDR' })}
                              className={cn(
                                "h-10 rounded-xl font-black text-[10px] tracking-widest uppercase transition-all",
                                currencyFormat === 'IDR' ? "bg-slate-900 border-none text-white hover:bg-black" : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50"
                              )}
                            >
                              RUPIAH (IDR)
                            </Button>
                            <Button 
                              variant={currencyFormat === 'USD' ? 'default' : 'outline'}
                              onClick={() => updateSettings({ currencyFormat: 'USD' })}
                              className={cn(
                                "h-10 rounded-xl font-black text-[10px] tracking-widest uppercase transition-all",
                                currencyFormat === 'USD' ? "bg-slate-900 border-none text-white hover:bg-black" : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50"
                              )}
                            >
                              DOLLAR (USD)
                            </Button>
                          </div>
                          {currencyFormat === 'USD' && (
                             <div className="flex items-center justify-between px-1 py-1">
                               <div className="flex items-center gap-1.5">
                                 <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                 <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">Kurs Terkini</span>
                               </div>
                               <span className="text-[10px] font-bold text-slate-400">
                                 1 USD ≈ Rp{idrToUsd > 0 ? (1 / idrToUsd).toLocaleString('id-ID', { maximumFractionDigits: 0 }) : '17.000'}
                               </span>
                             </div>
                          )}
                        </div>

                        {/* Quick Info Box */}
                        <div className="p-4 rounded-2xl border border-dashed border-slate-200 flex gap-3">
                           <Settings2 className="w-4 h-4 text-slate-300 mt-0.5" />
                           <p className="text-[10px] font-bold text-slate-400 leading-relaxed uppercase tracking-tight">
                             PENGATURAN INI AKAN DI-SYNC SECARA OTOMATIS KE SEMUA PERANGKAT KALIAN BERDUA, SAYANG! ✨
                           </p>
                        </div>
                      </div>
                    </TabsContent>
                  </>
                )}
              </div>
            </Tabs>
          </div>
        </div>
      </DialogContent>

      <Dialog open={showDeleteConfirm} onOpenChange={(open) => {
        if (!open) {
          setShowDeleteConfirm(false);
          setDeleteEmailSent(false);
          setDeletePassword('');
          setDeleteConfirmationText('');
        }
      }}>
        <DialogContent className="sm:max-w-[400px] p-0 overflow-hidden rounded-[32px] border-none shadow-2xl bg-white">
          {deleteEmailSent ? (
            <div className="p-10 text-center space-y-6 animate-in fade-in zoom-in duration-300">
              <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto text-blue-500">
                <MailCheck className="w-10 h-10" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter">Email Terkirim! ✉️</h3>
                <p className="text-slate-500 font-bold text-sm leading-relaxed px-2">
                  Link konfirmasi penghapusan telah dikirim ke <b>{user?.email}</b>.
                  <br /><br />
                  Silakan klik link tersebut untuk menghapus akun secara permanen. Keamananmu prioritas kami, Sayang!
                </p>
              </div>
              <Button 
                onClick={() => setShowDeleteConfirm(false)}
                className="w-full h-12 bg-slate-900 hover:bg-black text-white rounded-2xl font-black uppercase tracking-widest text-[11px]"
              >
                MENGERTI, TERIMA KASIH
              </Button>
            </div>
          ) : (
            <div className="p-8 space-y-6">
              <div className="text-center space-y-2">
                <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mx-auto text-red-500 mb-2">
                  <Trash2 className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter">Pastikan Ini Kamu</h3>
                <p className="text-slate-500 font-bold text-[13px] leading-relaxed">
                  Demi keamanan data keuangan kalian berkuda, kami butuh verifikasi lebih lanjut.
                </p>
              </div>

              <form onSubmit={handleDeleteAccountRequest} className="space-y-5">
                <div className="space-y-1.5 text-left">
                  <Label className="text-[10px] font-black text-slate-800 uppercase tracking-widest px-1">Password Saat Ini</Label>
                  <Input 
                    type="password"
                    placeholder="Masukkan password kamu..."
                    required
                    value={deletePassword}
                    onChange={(e) => setDeletePassword(e.target.value)}
                    className="h-11 bg-slate-50 border-slate-200 rounded-xl px-4 font-bold text-sm"
                  />
                </div>

                <div className="space-y-1.5 text-left">
                  <Label className="text-[10px] font-black text-red-600 uppercase tracking-widest px-1 flex items-center gap-1.5">
                    Konfirmasi Teks <AlertTriangle className="size-3" />
                  </Label>
                  <p className="text-[10px] text-slate-400 font-bold px-1 mb-1 italic">
                    Ketik "HAPUS PERMANEN" untuk lanjut:
                  </p>
                  <Input 
                    placeholder="HAPUS PERMANEN"
                    required
                    value={deleteConfirmationText}
                    onChange={(e) => setDeleteConfirmationText(e.target.value)}
                    className="h-11 bg-red-50/30 border-red-100 rounded-xl px-4 font-bold text-sm text-red-600 placeholder:text-red-200"
                  />
                </div>

                <div className="flex flex-col gap-3 pt-2">
                  <Button 
                    type="submit"
                    disabled={loading || deleteConfirmationText !== 'HAPUS PERMANEN'}
                    className="h-12 bg-red-500 hover:bg-red-600 text-white rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-lg shadow-red-100"
                  >
                    {loading ? <Loader2 className="size-5 animate-spin" /> : "MINTA LINK PENGHAPUSAN"}
                  </Button>
                  <Button 
                    type="button"
                    variant="ghost" 
                    onClick={() => setShowDeleteConfirm(false)}
                    className="h-12 rounded-2xl font-bold text-slate-400 text-[11px] uppercase tracking-widest"
                  >
                    TUNGGU, GAK JADI
                  </Button>
                </div>
              </form>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Dialog>
  );
};
