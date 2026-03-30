import React, { useState, useEffect, useCallback } from 'react';
import api from '@/lib/axios';
import { useAuth, type User as UserType } from '@/context/AuthContext';
import {
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSettings } from '@/hooks/useSettings';
import { ProfileTab } from './settings/ProfileTab';
import { SecurityTab } from './settings/SecurityTab';
import { PreferencesTab } from './settings/PreferencesTab';

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

  const showSuccess = useCallback((msg: string) => {
    setSuccess(true);
    setSuccessMessage(msg);
    setTimeout(() => {
      setSuccess(false);
    }, 2000);
  }, []);

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

  const handleSendResetLink = async () => {
    setLoading(true);
    try {
      await api.post('/forgot-password', { email: user?.email });
      showSuccess('Link ganti password sudah dikirim ke email kamu, Sayang! ✨');
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || 'Gagal mengirim email, coba lagi ya sayang?';
      alert(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    onClose();
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
                    <TabsContent value="profile">
                      <ProfileTab 
                        displayName={displayName}
                        setDisplayName={setDisplayName}
                        fullName={fullName}
                        setFullName={setFullName}
                        partnerName={partnerName}
                        setPartnerName={setPartnerName}
                        anniversaryDate={anniversaryDate}
                        setAnniversaryDate={setAnniversaryDate}
                        timezone={timezone}
                        setTimezone={setTimezone}
                        loading={loading}
                        onSubmit={handleUpdateProfile}
                        userEmail={user?.email}
                      />
                    </TabsContent>

                    <TabsContent value="privacy">
                      <SecurityTab 
                        userEmail={user?.email}
                        loading={loading}
                        onSendResetLink={handleSendResetLink}
                        onLogout={handleLogout}
                      />
                    </TabsContent>

                    <TabsContent value="preferences">
                      <PreferencesTab 
                        monthlyBudgetLimit={monthlyBudgetLimit}
                        budgetCycleStart={budgetCycleStart}
                        isPrivacyMode={isPrivacyMode}
                        currencyFormat={currencyFormat}
                        exchangeRate={exchangeRate}
                        updateSettings={updateSettings}
                      />
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
