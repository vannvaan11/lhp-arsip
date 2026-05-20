"use client"
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Folder, FileText, Upload, Lock, Database, LayoutDashboard, Search, LogOut, ChevronRight, Loader2 } from 'lucide-react';

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [password, setPassword] = useState('');
  const [files, setFiles] = useState<any[]>([]);
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  // Fungsi memuat file dari Drive
  useEffect(() => {
    if (isLoggedIn) {
      fetch('/api/drive')
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) setFiles(data);
        });
    }
  }, [isLoggedIn]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'Lhp3') { setIsLoggedIn(true); } 
    else { alert('Password Salah!'); }
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-[#FDFCFE] text-slate-700 font-sans">
      <AnimatePresence mode="wait">
        {!isLoggedIn ? (
          // --- LOGIN PAGE ---
          <motion.div key="login" className="h-screen flex items-center justify-center bg-gradient-to-br from-[#E0F2FE] via-[#F5F3FF] to-[#FFF1F2]">
            <div className="bg-white/80 p-12 rounded-[48px] shadow-2xl border border-white w-full max-w-md text-center">
              <div className="inline-flex p-5 bg-purple-500 rounded-3xl text-white mb-6"><Lock size={32} /></div>
              <h1 className="text-3xl font-black mb-10">Arsip Digital</h1>
              <form onSubmit={handleLogin} className="space-y-4">
                <input type="password" placeholder="Password Akses" className="w-full p-5 rounded-3xl ring-1 ring-slate-100 outline-none text-center" value={password} onChange={(e) => setPassword(e.target.value)} />
                <button type="submit" className="w-full bg-slate-900 text-white p-5 rounded-3xl font-bold">Buka Sistem</button>
              </form>
            </div>
          </motion.div>
        ) : (
          // --- DASHBOARD PAGE ---
          <div className="flex flex-col md:flex-row h-screen">
            {/* Sidebar */}
            <aside className="w-72 bg-white border-r p-8 hidden md:flex flex-col">
              <div className="flex items-center gap-3 mb-12 text-purple-600 font-bold text-xl"><Database /> LHP-DRIVE</div>
              <nav className="flex-1 space-y-3">
                <div className="p-4 bg-purple-50 text-purple-600 rounded-2xl font-bold flex items-center gap-3"><LayoutDashboard size={20}/> Dashboard</div>
                <div className="p-4 text-slate-400 flex items-center gap-3 hover:bg-slate-50 rounded-2xl cursor-pointer"><Folder size={20}/> Arsip Utama</div>
              </nav>
              <button onClick={() => setIsLoggedIn(false)} className="p-4 text-red-400 flex items-center gap-3"><LogOut size={20}/> Keluar</button>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto p-12">
              <header className="flex justify-between items-center mb-12">
                <h2 className="text-3xl font-black">Live View Laporan</h2>
                <button onClick={() => alert('Fitur upload sedang dikoneksikan ke Drive...')} className="bg-purple-600 text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-2 hover:scale-105 transition-all">
                  <Upload size={20} /> Upload Baru
                </button>
              </header>

              <div className="grid grid-cols-12 gap-8">
                {/* Preview Box */}
                <div className="col-span-8 bg-white rounded-[40px] shadow-sm border border-slate-100 overflow-hidden h-[650px] flex flex-col">
                  {selectedFileId ? (
                    <iframe 
                      src={`https://drive.google.com/file/d/${selectedFileId}/preview`} 
                      className="w-full h-full border-none"
                      allow="autoplay"
                    />
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-300">
                      <Search size={48} className="mb-4" />
                      <p>Pilih file di sebelah kanan untuk melihat</p>
                    </div>
                  )}
                </div>

                {/* File List */}
                <div className="col-span-4 bg-white rounded-[40px] p-8 border border-slate-100 shadow-sm h-fit">
                  <h3 className="font-bold mb-6 text-xs uppercase tracking-widest text-slate-400">Daftar Laporan di Drive</h3>
                  <div className="space-y-3">
                    {files.length > 0 ? files.map((file) => (
                      <div 
                        key={file.id} 
                        onClick={() => setSelectedFileId(file.id)}
                        className={`p-4 rounded-2xl border flex items-center gap-3 cursor-pointer transition-all ${selectedFileId === file.id ? 'bg-purple-50 border-purple-200' : 'hover:bg-slate-50 border-slate-50'}`}
                      >
                        <FileText size={20} className={selectedFileId === file.id ? 'text-purple-500' : 'text-blue-400'} />
                        <span className="text-sm font-bold truncate">{file.name}</span>
                      </div>
                    )) : (
                      <div className="text-center p-10 text-slate-400 text-sm">
                        <Loader2 className="animate-spin mx-auto mb-2" />
                        Mengambil data...
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </main>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}