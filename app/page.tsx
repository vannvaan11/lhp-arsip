"use client"
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Folder, FileText, Upload, Lock, Database, LayoutDashboard, 
  Search, LogOut, ChevronRight, Loader2, Edit2, Plus, X, Eye,
  Download, Clock, ArrowUpDown, Sun, Moon, Grid, List, HardDrive, ShieldCheck, UserCheck, Shield
} from 'lucide-react';

export default function Dashboard() {
  const [mounted, setMounted] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<'admin' | 'user' | null>(null);
  const [password, setPassword] = useState('');
  const [files, setFiles] = useState<any[]>([]);
  const [currentFolder, setCurrentFolder] = useState<string>('');
  const [folderHistory, setFolderHistory] = useState<any[]>([]);
  const [selectedFile, setSelectedFile] = useState<any>(null);
  const [stats, setStats] = useState({ total: 0 });
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [allFolders, setAllFolders] = useState<any[]>([]); 
  const [searchTerm, setSearchTerm] = useState('');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadDestinationId, setUploadDestinationId] = useState<string>('');
  const [sortBy, setSortBy] = useState<'name' | 'date'>('name');
  const [recentLogs, setRecentLogs] = useState<any[]>([]);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => { setMounted(true); }, []);

  const fetchData = async (fId: string = '') => {
    setLoading(true);
    try {
      const res = await fetch(`/api/drive?folderId=${fId}`);
      const data = await res.json();
      if (data.files) {
        setFiles(data.files);
        setStats({ total: data.totalDocs || 0 });
      }
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => {
    if (isLoggedIn) fetchData(currentFolder);
  }, [isLoggedIn, currentFolder]);

  if (!mounted) return null;

  // --- FUNGSI LOGIN ---
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // PERHATIKAN PASSWORD BARU DISINI
    if (password === 'adminLhp3') {
      setUserRole('admin');
      setIsLoggedIn(true);
    } else if (password === 'userLhp3') {
      setUserRole('user');
      setIsLoggedIn(true);
    } else {
      alert('Password Salah! Gunakan adminLhp3 atau userLhp3');
    }
  };

  // --- TAMPILAN LOGIN ---
  if (!isLoggedIn) {
    return (
      <div className="relative min-h-screen w-full flex items-center justify-center p-4 overflow-hidden bg-slate-900">
        <div className="absolute inset-0 z-0 bg-cover bg-center opacity-50" style={{ backgroundImage: "url('https://i.ibb.co.com/NnC3sn3S/bg-login.png')" }}></div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative z-10 bg-white/10 backdrop-blur-2xl p-10 rounded-[40px] shadow-2xl w-full max-w-md border border-white/20 text-center">
          <div className="p-4 bg-purple-600 w-fit mx-auto rounded-3xl text-white mb-6 shadow-lg flex justify-center"><Lock size={32} /></div>
          <h2 className="text-3xl font-black mb-2 text-white tracking-tight">Portal LHP</h2>
          <p className="text-white/60 mb-10 text-sm">Sistem Arsip Irban III</p>
          <form onSubmit={handleLogin} className="space-y-4">
            <input type="password" placeholder="Kode Akses" className="w-full p-5 rounded-3xl border-none outline-none bg-white/10 text-white text-center font-bold placeholder:text-white/30" onChange={(e) => setPassword(e.target.value)} />
            <button type="submit" className="w-full bg-white text-slate-900 p-5 rounded-3xl font-bold hover:bg-purple-50 transition-all active:scale-95">Masuk Ke Sistem</button>
          </form>
        </motion.div>
      </div>
    );
  }

  // --- TAMPILAN DASHBOARD ---
  return (
    <div className={isDarkMode ? "dark" : ""}>
      <div className="h-screen bg-[#F8FAFF] dark:bg-[#020617] flex text-slate-700 dark:text-slate-200 overflow-hidden transition-all duration-700 font-sans">
        
        {/* SIDEBAR */}
        <aside className="w-72 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 p-8 flex flex-col gap-8 transition-colors">
          <div className="flex items-center gap-3 text-purple-600 dark:text-purple-400 font-black text-2xl italic mb-4"><Database size={28} /> ARV-DRIVE</div>
          <nav className="flex-1 space-y-2 text-sm font-bold">
            <button onClick={() => {setCurrentFolder(''); setFolderHistory([]);}} className={`w-full flex items-center gap-3 p-4 rounded-2xl transition-all ${!currentFolder ? 'bg-purple-600 text-white' : 'text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
              <LayoutDashboard size={20}/> Dashboard
            </button>
            <button className="w-full flex items-center gap-3 p-4 text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-2xl transition-all font-bold"><Folder size={20}/> Arsip Utama</button>
          </nav>

          <div className="p-6 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-[32px] text-white shadow-xl">
             <p className="text-[10px] font-bold uppercase opacity-70 mb-2">{userRole} Access</p>
             <h4 className="text-4xl font-black">{stats.total}</h4>
             <p className="text-[10px] mt-1 opacity-50 uppercase tracking-widest font-bold">Dokumen Tersimpan</p>
          </div>
          
          <button onClick={() => setIsLoggedIn(false)} className="flex items-center gap-3 p-4 text-red-400 font-bold hover:bg-red-50 dark:hover:bg-red-900/10 rounded-2xl transition-all"><LogOut size={20}/> Keluar</button>
        </aside>

        {/* MAIN CONTENT */}
        <main className="flex-1 flex flex-col min-w-0">
          <header className="p-8 flex justify-between items-center bg-white/30 dark:bg-slate-900/30 backdrop-blur-sm border-b border-slate-100 dark:border-slate-800">
            <div>
              <h1 className="text-2xl font-black text-slate-800 dark:text-white tracking-tighter uppercase">Digital Archive</h1>
              <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 mt-1 uppercase tracking-widest">
                <span className="hover:text-purple-600 cursor-pointer" onClick={() => {setCurrentFolder(''); setFolderHistory([]);}}>Root</span>
                {folderHistory.map((h, i) => (
                  <React.Fragment key={h.id + i}><ChevronRight size={10}/> <span className="text-slate-600 dark:text-slate-400">{h.name}</span></React.Fragment>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-4 flex-1 max-w-xl px-8">
              <div className="flex-1 relative group">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                <input type="text" placeholder="Cari dokumen..." className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-800 border-none ring-1 ring-slate-100 dark:ring-slate-700 rounded-2xl focus:ring-2 focus:ring-purple-400 outline-none text-sm font-medium transition-all" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
              </div>
              <button onClick={() => setIsDarkMode(!isDarkMode)} className="p-3 bg-white dark:bg-slate-800 shadow-sm ring-1 ring-slate-100 dark:ring-slate-700 rounded-2xl text-slate-500 dark:text-yellow-400 transition-all">
                {isDarkMode ? <Sun size={20}/> : <Moon size={20}/>}
              </button>
            </div>

            <div className="flex items-center gap-3">
              {/* TOMBOL UPLOAD HANYA MUNCUL JIKA ADMIN */}
              {userRole === 'admin' && (
                <button onClick={() => setIsUploadModalOpen(true)} className="flex items-center gap-2 bg-slate-900 dark:bg-purple-600 text-white px-8 py-4 rounded-2xl font-bold hover:shadow-2xl transition-all">
                  <Plus size={20} /> Upload
                </button>
              )}
            </div>
          </header>

          <div className="flex-1 overflow-y-auto p-10">
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
               {files.filter(f => f.name.toLowerCase().includes(searchTerm.toLowerCase())).map((file) => (
                  <motion.div key={file.id} whileHover={{ y: -5 }} className="bg-white dark:bg-slate-800 p-6 rounded-[35px] border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all group flex flex-col justify-between h-48 cursor-pointer" onClick={() => file.mimeType.includes('folder') ? (setCurrentFolder(file.id), setFolderHistory([...folderHistory, {id: file.id, name: file.name}])) : setSelectedFile(file)}>
                    <div className="flex justify-between items-start">
                      <div className={`p-4 rounded-2xl ${file.mimeType.includes('folder') ? 'bg-amber-50 text-amber-500' : 'bg-blue-50 text-blue-500'}`}>
                        {file.mimeType.includes('folder') ? <Folder size={24} fill="currentColor" /> : <FileText size={24} />}
                      </div>
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                        {!file.mimeType.includes('folder') && (
                          <button onClick={(e) => { e.stopPropagation(); window.open(`https://drive.google.com/uc?export=download&id=${file.id}`, '_blank'); }} className="p-2 bg-slate-100 dark:bg-slate-700 rounded-lg text-slate-400 hover:text-blue-500"><Download size={16}/></button>
                        )}
                      </div>
                    </div>
                    <h4 className="font-black text-slate-800 dark:text-white truncate text-sm mt-4">{file.name}</h4>
                  </motion.div>
               ))}
            </div>
          </div>
        </main>

        {/* PREVIEW PANEL */}
        <AnimatePresence>
          {selectedFile && (
            <motion.div initial={{ x: 500 }} animate={{ x: 0 }} exit={{ x: 500 }} className="w-[500px] bg-white dark:bg-slate-900 shadow-2xl border-l border-slate-100 dark:border-slate-800 flex flex-col overflow-hidden relative z-30">
               <div className="p-8 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between">
                  <span className="font-black text-sm truncate uppercase tracking-tighter">{selectedFile.name}</span>
                  <button onClick={() => setSelectedFile(null)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full"><X/></button>
               </div>
               <iframe src={`https://drive.google.com/file/d/${selectedFile.id}/preview`} className="flex-1 w-full" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* MODAL UPLOAD */}
        <AnimatePresence>
          {isUploadModalOpen && userRole === 'admin' && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md">
              <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-white dark:bg-slate-900 rounded-[40px] p-10 w-full max-w-md relative border border-white/20">
                <button onClick={() => setIsUploadModalOpen(false)} className="absolute right-6 top-6 text-slate-400"><X/></button>
                <h3 className="text-2xl font-black mb-8">Admin Upload</h3>
                <label className="flex flex-col items-center justify-center w-full h-56 border-4 border-dashed border-slate-100 dark:border-slate-800 rounded-[40px] cursor-pointer hover:bg-purple-50 transition-all text-center p-8 group">
                    <div className="p-4 bg-purple-600 rounded-2xl text-white mb-4 group-hover:scale-110 transition-all"><Upload size={32}/></div>
                    <p className="text-sm font-bold text-slate-800 dark:text-white">Klik untuk Pilih Dokumen</p>
                    <input type="file" className="hidden" />
                </label>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}