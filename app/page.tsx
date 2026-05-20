"use client"
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Folder, FileText, Upload, Lock, Database, LayoutDashboard, Search, LogOut, ChevronRight } from 'lucide-react';

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      if (password === 'Lhp3') {
        setIsLoggedIn(true);
      } else {
        alert('Password Salah!');
      }
      setLoading(false);
    }, 1000);
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-[#FDFCFE] text-slate-700 font-sans selection:bg-purple-100">
      <AnimatePresence mode="wait">
        {!isLoggedIn ? (
          // --- HALAMAN LOGIN ELEGAN ---
          <motion.div 
            key="login"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="h-screen flex items-center justify-center bg-gradient-to-br from-[#E0F2FE] via-[#F5F3FF] to-[#FFF1F2]"
          >
            <motion.div 
              initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
              className="bg-white/80 backdrop-blur-2xl p-12 rounded-[48px] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.1)] border border-white w-full max-w-md text-center"
            >
              <div className="inline-flex p-5 bg-gradient-to-tr from-purple-500 to-pink-500 rounded-3xl text-white shadow-lg shadow-purple-200 mb-6">
                <Lock size={32} />
              </div>
              <h1 className="text-3xl font-black tracking-tight text-slate-800 mb-2">Arsip Digital</h1>
              <p className="text-slate-500 mb-10 font-medium">Sistem Pengawasan Unit Kerja</p>
              
              <form onSubmit={handleLogin} className="space-y-4">
                <input 
                  type="password" placeholder="Password Akses" 
                  className="w-full p-5 rounded-3xl border-none ring-1 ring-slate-100 focus:ring-2 focus:ring-purple-400 outline-none transition-all bg-white/50 shadow-inner text-center text-lg"
                  value={password} onChange={(e) => setPassword(e.target.value)}
                />
                <button 
                  type="submit" disabled={loading}
                  className="w-full bg-slate-900 text-white p-5 rounded-3xl font-bold hover:bg-slate-800 transition-all shadow-xl active:scale-95 disabled:opacity-50"
                >
                  {loading ? 'Memproses...' : 'Buka Sistem'}
                </button>
              </form>
            </motion.div>
          </motion.div>
        ) : (
          // --- HALAMAN DASHBOARD FUTURISTIK ---
          <motion.div 
            key="dashboard"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="flex flex-col md:flex-row h-screen overflow-hidden"
          >
            {/* Sidebar Glassmorphism */}
            <aside className="w-full md:w-72 bg-white/50 backdrop-blur-md border-r border-slate-100 p-8 flex flex-col">
              <div className="flex items-center gap-3 mb-12">
                <div className="p-2.5 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl text-white">
                  <Database size={24} />
                </div>
                <span className="font-bold text-xl tracking-tighter">LHP-DRIVE</span>
              </div>
              
              <nav className="flex-1 space-y-3">
                <div className="flex items-center gap-3 p-4 bg-white shadow-sm border border-slate-100 text-purple-600 rounded-2xl font-bold cursor-pointer transition-all">
                  <LayoutDashboard size={20} /> Dashboard
                </div>
                <div className="flex items-center gap-3 p-4 text-slate-400 hover:bg-white rounded-2xl hover:shadow-sm transition-all cursor-pointer">
                  <Folder size={20} /> Folder Arsip
                </div>
              </nav>

              <button 
                onClick={() => setIsLoggedIn(false)}
                className="flex items-center gap-3 p-4 text-red-400 hover:bg-red-50 rounded-2xl transition-all"
              >
                <LogOut size={20} /> Keluar
              </button>
            </aside>

            {/* Konten Utama */}
            <main className="flex-1 overflow-y-auto p-6 md:p-12">
              <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
                <div>
                  <h2 className="text-3xl font-black text-slate-800 mb-1">Live View Dokumen</h2>
                  <p className="text-slate-500 font-medium">Terintegrasi dengan Google Drive Utama</p>
                </div>
                <button className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-4 rounded-[20px] font-bold shadow-lg shadow-purple-100 hover:scale-105 active:scale-95 transition-all">
                  <Upload size={20} /> Upload Laporan
                </button>
              </header>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Preview Box (Elegan & Besar) */}
                <div className="lg:col-span-8 bg-white rounded-[40px] shadow-[0_20px_50px_rgba(0,0,0,0.02)] border border-slate-100 overflow-hidden flex flex-col h-[600px]">
                  <div className="p-6 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-3 font-bold text-sm text-slate-600 uppercase tracking-widest">
                      <FileText size={18} className="text-blue-500" /> Preview_Aktif.pdf
                    </div>
                    <div className="flex gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-300" />
                      <div className="w-3 h-3 rounded-full bg-amber-300" />
                      <div className="w-3 h-3 rounded-full bg-green-300" />
                    </div>
                  </div>
                  <div className="flex-1 flex flex-col items-center justify-center text-slate-300">
                    <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-4 border border-slate-100">
                      <Search size={40} />
                    </div>
                    <p className="font-medium">Menunggu pilihan dokumen...</p>
                  </div>
                </div>

                {/* Folder List */}
                <div className="lg:col-span-4 space-y-6">
                  <div className="bg-white rounded-[40px] p-8 shadow-sm border border-slate-100">
                    <h3 className="font-black text-slate-800 mb-6 uppercase text-xs tracking-[0.2em]">Pilih Folder</h3>
                    <div className="space-y-3">
                      {['Laporan Semester I', 'Laporan Semester II', 'Arsip Rahasia', 'Draft Final'].map((folder) => (
                        <div key={folder} className="group flex items-center justify-between p-5 rounded-3xl border border-slate-50 hover:border-purple-200 hover:bg-purple-50/50 transition-all cursor-pointer">
                          <div className="flex items-center gap-4">
                            <Folder size={22} className="text-amber-400 group-hover:scale-110 transition-all" />
                            <span className="font-bold text-slate-600">{folder}</span>
                          </div>
                          <ChevronRight size={16} className="text-slate-300 group-hover:text-purple-400" />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </main>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}