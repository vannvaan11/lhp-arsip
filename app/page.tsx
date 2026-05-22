"use client"
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Folder, FileText, Upload, Lock, Database, LayoutDashboard, 
  Search, LogOut, ChevronRight, Loader2, Edit2, Plus, X, Eye,
  Download, Clock, ArrowUpDown, Sun, Moon, Grid, List, HardDrive, ShieldCheck
} from 'lucide-react';

export default function Dashboard() {
  const [mounted, setMounted] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
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
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid'); // Fitur Baru

  useEffect(() => { setMounted(true); }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Selamat Pagi";
    if (hour < 17) return "Selamat Siang";
    return "Selamat Malam";
  };

  const logActivity = (action: string, name: string) => {
    const newLog = { 
      id: Date.now(), 
      action, 
      name: name.length > 20 ? name.substring(0, 20) + '...' : name, 
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
    };
    setRecentLogs(prev => [newLog, ...prev].slice(0, 5));
  };

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

  const fetchAllFolders = async () => {
    try {
      const res = await fetch('/api/drive/all-folders');
      const data = await res.json();
      if (Array.isArray(data)) setAllFolders(data);
    } catch (e) { console.error(e); }
  };

  useEffect(() => {
    if (isUploadModalOpen) fetchAllFolders();
  }, [isUploadModalOpen]);

  useEffect(() => {
    if (isLoggedIn) fetchData(currentFolder);
  }, [isLoggedIn, currentFolder]);

  const filteredFiles = files.filter(file => 
    file.name.toLowerCase().includes(searchTerm.toLowerCase())
  ).sort((a, b) => {
    if (sortBy === 'name') return a.name.localeCompare(b.name);
    if (sortBy === 'date') return new Date(b.createdTime || 0).getTime() - new Date(a.createdTime || 0).getTime();
    return 0;
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'Lhp3') { 
      setIsLoggedIn(true); 
      logActivity("Akses", "Admin Masuk");
    } else { alert('Password Salah!'); }
  };

  const handleRename = async (fileId: string, oldName: string) => {
    const newName = prompt("Ubah nama:", oldName);
    if (!newName || newName === oldName) return;
    try {
      await fetch('/api/drive', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileId, newName })
      });
      logActivity("Ubah", newName);
      fetchData(currentFolder);
    } catch (e) { console.error(e); }
  };

  const handleUpload = async (e: any) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('parentId', uploadDestinationId || currentFolder || '');
    try {
      const res = await fetch('/api/drive/upload', { method: 'POST', body: formData });
      if (res.ok) {
        logActivity("Upload", file.name);
        setIsUploadModalOpen(false);
        setTimeout(() => fetchData(currentFolder), 2000);
      }
    } catch (e) { console.error(e); }
    setUploading(false);
  };

  if (!mounted) return null;

  if (!isLoggedIn) {
    return (
      <div className="relative min-h-screen w-full flex items-center justify-center p-4 overflow-hidden font-sans">
        <div className="absolute inset-0 z-0 bg-cover bg-center scale-105" style={{ backgroundImage: "url('https://i.ibb.co.com/NnC3sn3S/bg-login.png')" }}>
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"></div>
        </div>
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="relative z-10 bg-white/10 backdrop-blur-3xl p-12 rounded-[50px] shadow-2xl w-full max-w-md border border-white/20 text-center">
          <div className="p-4 bg-white/20 w-fit mx-auto rounded-full text-white mb-8 border border-white/30 shadow-inner"><Lock size={32} /></div>
          <h2 className="text-4xl font-black mb-2 text-white tracking-tighter uppercase italic">Archiv3</h2>
          <p className="text-white/60 mb-10 font-medium text-sm">Sistem Arsip LHP Digital Irban III</p>
          <form onSubmit={handleLogin} className="space-y-4">
            <input type="password" placeholder="Access Code" className="w-full p-6 rounded-[30px] border-none outline-none focus:ring-2 focus:ring-purple-400 bg-white/10 text-white text-center font-bold placeholder:text-white/30 text-xl tracking-widest transition-all" onChange={(e) => setPassword(e.target.value)} />
            <button type="submit" className="w-full bg-white text-slate-900 p-6 rounded-[30px] font-black uppercase tracking-widest hover:bg-purple-50 transition-all shadow-xl active:scale-95">Open Portal</button>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <div className={isDarkMode ? "dark" : ""}>
      <div className="h-screen bg-[#F8FAFF] dark:bg-[#020617] flex text-slate-700 dark:text-slate-200 overflow-hidden transition-all duration-700">
        
        {/* SIDEBAR FUTURISTIC */}
        <aside className="w-80 bg-white/70 dark:bg-slate-900/80 backdrop-blur-xl border-r border-slate-200 dark:border-slate-800 p-8 flex flex-col gap-8 transition-all relative z-20">
          <div className="flex items-center gap-3 text-purple-600 dark:text-purple-400 font-black text-3xl tracking-tighter italic">
            <Database size={32} strokeWidth={3} /> ARV-DRIV3
          </div>
          
          <div className="flex flex-col gap-1">
            <p className="text-[10px] font-black uppercase text-slate-400 mb-2 tracking-[0.2em] px-4">Menu Utama</p>
            <button onClick={() => {setCurrentFolder(''); setFolderHistory([]);}} className={`w-full flex items-center gap-3 p-4 rounded-3xl font-bold transition-all ${!currentFolder ? 'bg-purple-600 text-white shadow-xl shadow-purple-200 dark:shadow-none scale-[1.02]' : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}>
              <LayoutDashboard size={20}/> Dashboard
            </button>
          </div>

          <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-[40px] border border-slate-100 dark:border-slate-800">
            <h5 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4 flex items-center gap-2">
              <Clock size={14}/> Activity Log
            </h5>
            <div className="space-y-4">
              {recentLogs.map(log => (
                <div key={log.id} className="text-[11px] flex gap-3 group">
                  <div className="w-1 h-8 bg-purple-400 rounded-full opacity-0 group-hover:opacity-100 transition-all" />
                  <div>
                    <span className="font-black text-slate-800 dark:text-slate-200 uppercase">{log.action}</span>
                    <p className="text-slate-500 truncate w-40">{log.name}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-auto p-8 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 rounded-[45px] text-white shadow-2xl relative overflow-hidden group">
            <div className="relative z-10">
              <p className="text-[10px] font-bold uppercase opacity-70 mb-2">Total Files</p>
              <h4 className="text-5xl font-black mb-4 tracking-tighter">{stats.total}</h4>
              <div className="flex items-center gap-2 text-[10px] bg-black/20 w-fit px-3 py-1 rounded-full backdrop-blur-md">
                <ShieldCheck size={12}/> Secure Storage
              </div>
            </div>
            <HardDrive size={100} className="absolute -right-8 -bottom-8 opacity-10 group-hover:rotate-12 transition-transform duration-700" />
          </div>
          
          <button onClick={() => setIsLoggedIn(false)} className="flex items-center gap-3 p-4 text-slate-400 hover:text-red-500 font-bold rounded-2xl transition-all">
            <LogOut size={20}/> Logout
          </button>
        </aside>

        {/* MAIN AREA */}
        <main className="flex-1 flex flex-col min-w-0 relative">
          {/* Animated Background Blob */}
          <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-purple-400/10 rounded-full blur-[120px] -z-10 animate-pulse" />
          <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-400/10 rounded-full blur-[120px] -z-10 animate-pulse" />

          <header className="p-10 flex justify-between items-center bg-transparent backdrop-blur-sm z-10">
            <div>
              <p className="text-xs font-black text-purple-600 dark:text-purple-400 uppercase tracking-widest mb-1">{getGreeting()}, Admin</p>
              <h1 className="text-3xl font-black text-slate-800 dark:text-white tracking-tighter">Portal Laporan Hasil Pengawasan</h1>
              <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 mt-2 uppercase tracking-widest">
                <span className="hover:text-purple-600 cursor-pointer" onClick={() => {setCurrentFolder(''); setFolderHistory([]);}}>Home</span>
                {folderHistory.map((h, i) => (
                  <React.Fragment key={h.id + i}><ChevronRight size={10}/> <span className="text-slate-600 dark:text-slate-300 font-black">{h.name}</span></React.Fragment>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="relative group hidden lg:block">
                <Search size={20} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-purple-500 transition-colors" />
                <input type="text" placeholder="Cari arsip digital..." className="w-80 pl-14 pr-6 py-4 bg-white dark:bg-slate-900 shadow-xl shadow-slate-200/50 dark:shadow-none border-none ring-1 ring-slate-100 dark:ring-slate-800 rounded-[25px] focus:ring-2 focus:ring-purple-400 outline-none text-sm font-bold transition-all" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
              </div>
              
              <button onClick={() => setIsDarkMode(!isDarkMode)} className="p-4 bg-white dark:bg-slate-900 shadow-xl ring-1 ring-slate-100 dark:ring-slate-800 rounded-3xl text-slate-500 dark:text-yellow-400 hover:scale-110 transition-all">
                {isDarkMode ? <Sun size={24}/> : <Moon size={24}/>}
              </button>

              <button onClick={() => {setUploadDestinationId(currentFolder); setIsUploadModalOpen(true);}} className="flex items-center gap-3 bg-slate-900 dark:bg-purple-600 text-white px-8 py-5 rounded-[25px] font-black uppercase tracking-widest text-xs hover:shadow-2xl transition-all active:scale-95 shadow-xl shadow-slate-300 dark:shadow-purple-900/20">
                <Plus size={20} /> New Document
              </button>
            </div>
          </header>

          <div className="px-10 mb-6 flex justify-between items-center">
            <div className="flex bg-slate-100 dark:bg-slate-900 p-1.5 rounded-[20px] border border-slate-200 dark:border-slate-800 shadow-inner">
              <button onClick={() => setViewMode('grid')} className={`p-3 rounded-2xl transition-all ${viewMode === 'grid' ? 'bg-white dark:bg-slate-800 shadow-md text-purple-600' : 'text-slate-400'}`}><Grid size={18}/></button>
              <button onClick={() => setViewMode('list')} className={`p-3 rounded-2xl transition-all ${viewMode === 'list' ? 'bg-white dark:bg-slate-800 shadow-md text-purple-600' : 'text-slate-400'}`}><List size={18}/></button>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setSortBy('name')} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all border ${sortBy === 'name' ? 'bg-purple-600 border-purple-600 text-white' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-400'}`}>Name</button>
              <button onClick={() => setSortBy('date')} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all border ${sortBy === 'date' ? 'bg-purple-600 border-purple-600 text-white' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-400'}`}>Newest</button>
            </div>
          </div>

          <div className="flex-1 flex overflow-hidden p-10 pt-0 gap-8">
            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="h-full flex flex-col items-center justify-center gap-4 text-slate-400">
                  <Loader2 className="animate-spin text-purple-600" size={40} />
                  <p className="font-black text-xs uppercase tracking-[0.3em]">Synchronizing Drive...</p>
                </div>
              ) : (
                <div className={viewMode === 'grid' ? "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 pb-12" : "flex flex-col gap-3 pb-12"}>
                  {filteredFiles.map((file) => (
                    <motion.div 
                      key={file.id} 
                      whileHover={{ scale: 1.02 }}
                      className={`${viewMode === 'grid' ? 'p-8 rounded-[40px] h-56 flex flex-col justify-between' : 'p-4 rounded-2xl flex items-center justify-between'} border transition-all cursor-pointer group ${selectedFile?.id === file.id ? 'bg-slate-900 dark:bg-purple-600 border-slate-900 dark:border-purple-600 text-white shadow-2xl scale-105' : 'bg-white/60 dark:bg-slate-800/60 backdrop-blur-md border-slate-200/50 dark:border-slate-800 hover:bg-white dark:hover:bg-slate-800 shadow-sm hover:shadow-xl'}`} 
                      onClick={() => file.mimeType.includes('folder') ? (setCurrentFolder(file.id), setFolderHistory([...folderHistory, {id: file.id, name: file.name}])) : setSelectedFile(file)}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`p-4 rounded-[20px] ${selectedFile?.id === file.id ? 'bg-white/20' : (file.mimeType.includes('folder') ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-500' : 'bg-blue-100 dark:bg-blue-900/30 text-blue-500')}`}>
                          {file.mimeType.includes('folder') ? <Folder size={24} fill="currentColor" /> : <FileText size={24} />}
                        </div>
                        {viewMode === 'list' && <span className="font-bold text-sm">{file.name}</span>}
                      </div>

                      {viewMode === 'grid' && <h4 className="font-black truncate text-base mt-4">{file.name}</h4>}

                      <div className="flex justify-between items-center mt-auto">
                        {viewMode === 'grid' && <span className="text-[10px] font-black uppercase opacity-40 tracking-widest">{file.mimeType.includes('folder') ? 'Directory' : 'Report PDF'}</span>}
                        <div className="flex gap-2">
                          <button onClick={(e) => { e.stopPropagation(); handleRename(file.id, file.name); }} className="p-2 hover:bg-black/10 rounded-full transition-all opacity-0 group-hover:opacity-100"><Edit2 size={16}/></button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* LIVE PREVIEW GLASSMISM */}
            <AnimatePresence>
              {selectedFile && (
                <motion.div initial={{ x: 500, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 500, opacity: 0 }} className="w-[500px] bg-white/80 dark:bg-slate-900/80 backdrop-blur-3xl rounded-[50px] shadow-2xl border border-white/20 dark:border-slate-800 flex flex-col overflow-hidden transition-all duration-500 relative z-30">
                  <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-4 overflow-hidden">
                      <div className="p-3 bg-purple-100 dark:bg-purple-900/30 text-purple-600 rounded-2xl"><FileText size={20}/></div>
                      <span className="font-black text-sm truncate text-slate-800 dark:text-white uppercase tracking-tighter">{selectedFile.name}</span>
                    </div>
                    <button onClick={() => setSelectedFile(null)} className="p-3 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-400 transition-all"><X size={20} /></button>
                  </div>
                  <div className="flex-1 bg-slate-50 dark:bg-slate-950 relative m-4 rounded-[35px] overflow-hidden shadow-inner">
                    <iframe src={`https://drive.google.com/file/d/${selectedFile.id}/preview`} className="w-full h-full border-none" title="Preview" />
                  </div>
                  <div className="p-8 pt-0 flex gap-4">
                    <button onClick={() => window.open(`https://drive.google.com/uc?export=download&id=${selectedFile.id}`, '_blank')} className="flex-1 py-5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-[25px] font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:scale-105 transition-all"><Download size={18}/> Download</button>
                    <button onClick={() => window.open(`https://drive.google.com/file/d/${selectedFile.id}/view`, '_blank')} className="p-5 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-[25px] text-slate-400 hover:text-purple-600 transition-all"><Eye size={20}/></button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </main>

        {/* MODAL UPLOAD NEXT LEVEL */}
        <AnimatePresence>
          {isUploadModalOpen && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsUploadModalOpen(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" />
              <motion.div initial={{ scale: 0.8, y: 100 }} animate={{ scale: 1, y: 0 }} className="relative bg-white dark:bg-slate-900 rounded-[50px] shadow-2xl w-full max-w-xl p-12 border border-white/20">
                <h3 className="text-3xl font-black mb-8 text-slate-800 dark:text-white tracking-tighter uppercase italic">Secure Upload</h3>
                <div className="space-y-8">
                  <div className="space-y-3 text-left">
                    <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 ml-6">Destinasi Arsip</label>
                    <select value={uploadDestinationId} onChange={(e) => setUploadDestinationId(e.target.value)} className="w-full p-6 rounded-[30px] bg-slate-50 dark:bg-slate-800 border-none outline-none font-black text-sm text-slate-600 dark:text-slate-200 cursor-pointer ring-1 ring-slate-100 dark:ring-slate-700 focus:ring-4 focus:ring-purple-500/20 transition-all appearance-none">
                      <option value="">🏠 Root Directory</option>
                      {allFolders.map(f => (<option key={f.id} value={f.id}>📁 {f.name}</option>))}
                    </select>
                  </div>
                  <label className="flex flex-col items-center justify-center w-full h-64 border-4 border-dashed border-slate-100 dark:border-slate-800 rounded-[40px] cursor-pointer hover:bg-purple-50 dark:hover:bg-purple-900/10 hover:border-purple-200 transition-all text-center p-8 group">
                    <div className="p-6 bg-purple-600 rounded-[30px] text-white mb-6 group-hover:rotate-12 transition-transform shadow-xl shadow-purple-200 dark:shadow-none">
                      {uploading ? <Loader2 className="animate-spin" /> : <Upload size={32} />}
                    </div>
                    <p className="text-lg font-black text-slate-800 dark:text-white tracking-tight">{uploading ? 'Encrypting & Sending...' : 'Drop file atau klik untuk memilih'}</p>
                    <p className="text-xs text-slate-400 mt-2 font-medium">Berkas akan tersimpan dengan enkripsi Google Cloud</p>
                    <input type="file" className="hidden" onChange={handleUpload} disabled={uploading} />
                  </label>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}