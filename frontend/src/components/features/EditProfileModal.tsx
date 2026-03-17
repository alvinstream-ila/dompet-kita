import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  Loader2, 
  User, 
  CheckCircle2,
  Sparkles,
  Camera,
  ImagePlus
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

import type { User as SupabaseUser } from '@supabase/supabase-js';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: SupabaseUser;
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({ isOpen, onClose, user }) => {
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (user && isOpen) {
      setDisplayName(user.user_metadata?.display_name || user.user_metadata?.full_name || '');
      setAvatarUrl(user.user_metadata?.avatar_url || '');
      setSuccess(false);
    }
  }, [user, isOpen]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      if (!e.target.files || e.target.files.length === 0) return;
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
      
      // Update metadata immediately
      await supabase.auth.updateUser({
        data: { avatar_url: publicUrl }
      });

    } catch (error) {
      alert(error instanceof Error ? error.message : 'Gagal mengupload foto');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        data: { display_name: displayName }
      });

      if (error) throw error;
      
      setSuccess(true);
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[400px] p-0 overflow-hidden rounded-[32px] border-none shadow-2xl bg-white/95 backdrop-blur-xl">
        <DialogHeader className="p-8 pb-10 bg-slate-900 text-white relative overflow-hidden">
          <div className="relative z-10 space-y-1">
             <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-70">Personalization</p>
             <DialogTitle className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
               <Sparkles className="w-6 h-6 text-blue-400" />
               EDIT PROFIL
             </DialogTitle>
          </div>
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-blue-500/20 rounded-full blur-3xl" />
          <div className="absolute -left-10 -bottom-10 w-32 h-32 bg-pink-500/10 rounded-full blur-2xl" />
        </DialogHeader>

        <div className="px-8 pb-10 -mt-20 relative z-20">
          <div className="bg-white rounded-[24px] p-6 shadow-xl border border-slate-100">
            {success ? (
              // ... (keep success UI same)
              <div className="py-8 text-center space-y-4 animate-in fade-in zoom-in duration-300">
                <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">Berhasil Diupdate!</h3>
                  <p className="text-sm font-bold text-slate-500">Nama kamu sekarang sudah keren, Sayang! ✨</p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Avatar Section */}
                <div className="flex flex-col items-center gap-4 mb-2">
                  <div className="relative group cursor-pointer">
                    <input 
                      type="file" 
                      id="avatar-upload" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={handleAvatarUpload}
                      disabled={uploading}
                    />
                    <label htmlFor="avatar-upload" className="block cursor-pointer">
                      <div className="w-24 h-24 rounded-full border-4 border-slate-50 shadow-lg overflow-hidden relative bg-slate-100 transition-transform group-hover:scale-105 active:scale-95 group-active:scale-95">
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
                    <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center text-slate-900 border border-slate-100 group-hover:bg-blue-50 transition-colors">
                      <ImagePlus className="size-4" />
                    </div>
                  </div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Klik untuk ganti foto</p>
                </div>

                <div className="space-y-2">
                  <Label className="text-[10px] font-black text-slate-800 uppercase tracking-widest px-1">Nama Panggilan Baru</Label>
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                    <Input 
                      placeholder="Masukkan nama panggilanmu..." 
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="h-12 bg-slate-50 border-slate-200 rounded-xl pl-11 font-bold text-sm focus-visible:ring-blue-500/20 focus-visible:bg-white transition-all"
                      required
                    />
                  </div>
                  <p className="text-[10px] font-bold text-slate-400 px-1 italic">
                    *Nama ini akan muncul di dashboard dan laporan kamu.
                  </p>
                </div>

                <div className="flex flex-col gap-3 pt-2">
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full h-12 bg-slate-900 hover:bg-black text-white rounded-xl font-black text-[12px] tracking-widest transition-all shadow-lg active:scale-95 uppercase"
                  >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "SIMPAN PERUBAHAN"}
                  </Button>
                  <Button 
                    type="button"
                    variant="ghost" 
                    onClick={onClose}
                    className="w-full h-12 rounded-xl font-black text-[10px] text-slate-400 uppercase tracking-widest hover:bg-slate-50"
                  >
                    BATALKAN
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
