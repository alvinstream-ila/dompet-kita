import { CheckCircle2, ShieldCheck } from 'lucide-react';
import type React from 'react';
import { useCallback, useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { type User as UserType, useAuth } from '@/features/auth';
import api from '@/lib/axios';
import type { ApiError } from '@/types';
import { useSettings } from '../hooks/useSettings';
import { PreferencesTab } from './PreferencesTab';
import { ProfileTab } from './ProfileTab';
import { SecurityTab } from './SecurityTab';

interface AccountSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserType | null;
  defaultTab?: string;
}

export const AccountSettingsModal: React.FC<AccountSettingsModalProps> = ({
  isOpen,
  onClose,
  user,
  defaultTab = 'profile',
}) => {
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
    updateSettings,
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
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

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
      setTwoFactorEnabled(!!user.two_factor_enabled);
      setSuccess(false);
    }
  }, [
    user,
    isOpen,
    storedFullName,
    storedPartnerName,
    storedAnniversaryDate,
    storedTimezone,
  ]);

  const showSuccess = useCallback((msg: string) => {
    setSuccess(true);
    setSuccessMessage(msg);
    setTimeout(() => {
      setSuccess(false);
    }, 2000);
  }, []);

  if (!user && isOpen) return null;

  const handleUpdateProfile = async (e: React.SubmitEvent<HTMLFormElement>) => {
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
    } catch (error: unknown) {
      const axiosError = error as ApiError;
      alert(axiosError.response?.data?.message || 'Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  };

  const handleSendResetLink = async () => {
    setLoading(true);
    try {
      await api.post('/forgot-password', { email: user?.email });
      showSuccess(
        'Link ganti password sudah dikirim ke email kamu, Sayang! ✨'
      );
    } catch (error: unknown) {
      let errorMsg = 'Gagal mengirim email, coba lagi ya sayang?';
      const axiosError = error as ApiError;
      if (axiosError.response?.data?.message) {
        errorMsg = axiosError.response.data.message;
      }
      alert(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    onClose();
  };

  const handleToggleTwoFactor = async (enabled: boolean) => {
    setLoading(true);
    try {
      await api.put('/user/profile', { two_factor_enabled: enabled });
      setTwoFactorEnabled(enabled);
      showSuccess(`2FA berhasil ${enabled ? 'diaktifkan' : 'dimatikan'}! ✨`);
    } catch (error: unknown) {
      let errorMsg = 'Gagal mengubah pengaturan 2FA';
      const axiosError = error as ApiError;
      if (axiosError.response?.data?.message) {
        errorMsg = axiosError.response.data.message;
      }
      alert(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="overflow-hidden rounded-[40px] border-none bg-white/95 p-0 shadow-2xl backdrop-blur-xl sm:max-w-[440px]">
        <DialogHeader className="relative overflow-hidden bg-slate-900 p-8 pb-14 text-white">
          <div className="relative z-10 space-y-1">
            <p className="text-[10px] font-black tracking-[0.2em] uppercase opacity-70">
              Control Center
            </p>
            <DialogTitle className="flex items-center gap-2 text-2xl font-black tracking-tight text-white">
              <ShieldCheck className="text-blue-royal h-6 w-6" />
              PENGATURAN AKUN
            </DialogTitle>
            <DialogDescription className="sr-only">
              Kelola profil, keamanan, dan preferensi aplikasi Anda di sini.
            </DialogDescription>
          </div>
          <div className="bg-blue-royal/20 absolute -top-10 -right-10 h-48 w-48 rounded-full blur-3xl" />
          <div className="bg-pink-primary/10 absolute -bottom-10 -left-10 h-32 w-32 rounded-full blur-2xl" />
        </DialogHeader>

        <div className="relative z-20 -mt-8 px-6 pb-8">
          <div className="flex min-h-[400px] flex-col rounded-[32px] border border-slate-100 bg-white p-2 shadow-2xl">
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="flex w-full flex-1 flex-col"
            >
              <div className="px-4 pt-4">
                <TabsList className="grid h-11 w-full grid-cols-3 rounded-2xl bg-slate-50 p-1">
                  <TabsTrigger
                    value="profile"
                    className="rounded-xl text-[10px] font-black tracking-widest"
                  >
                    UMUM
                  </TabsTrigger>
                  <TabsTrigger
                    value="privacy"
                    className="rounded-xl text-[10px] font-black tracking-widest"
                  >
                    KEAMANAN
                  </TabsTrigger>
                  <TabsTrigger
                    value="preferences"
                    className="rounded-xl text-[10px] font-black tracking-widest"
                  >
                    PREFERENSI
                  </TabsTrigger>
                </TabsList>
              </div>

              <div className="flex-1 overflow-y-auto px-4 py-6">
                {success ? (
                  <div className="animate-in fade-in zoom-in space-y-4 py-12 text-center duration-300">
                    <div className="bg-green-stat/10 mx-auto mb-2 flex h-20 w-20 items-center justify-center rounded-full">
                      <CheckCircle2 className="text-green-stat h-10 w-10" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-xl font-black tracking-tight text-slate-800 uppercase">
                        Sukses!
                      </h3>
                      <p className="px-6 text-sm leading-relaxed font-bold text-slate-500">
                        {successMessage}
                      </p>
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
                        twoFactorEnabled={twoFactorEnabled}
                        onToggleTwoFactor={handleToggleTwoFactor}
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
