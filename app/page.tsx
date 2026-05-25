"use client"
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Folder, FileText, Upload, Lock, Database, LayoutDashboard, 
  Search, LogOut, ChevronRight, Loader2, Edit2, Plus, X, Eye,
  Download, Clock, ArrowLeft, Sun, Moon, HardDrive, Shield, 
  CheckCircle2, AlertCircle, Command, Trash2, Filter, History, User,
  Zap, Star, Box, Layers
} from 'lucide-react';

// --- INTERFACES ---
interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  createdTime?: string;
}

interface FolderHistory {
  id: string;
  name: string;
}

interface ActivityLog {
  id: string;
  action: string;
  fileName: string;
  timestamp: string;
  user: string;
  device: string;
}

export default function Dashboard() {
  // --- STATES (Tetap sama) ---
  const [mounted, setMounted] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<'admin' | 'user' | null>(null);
  const [userName, setUserName] = useState<string>('');
  const [password, setPassword] = useState('');
  const [tempName, setTempName] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(true); // Default Dark agar mewah

  const [files, setFiles] = useState<DriveFile[]>([]);
  const [currentFolder, setCurrentFolder] = useState<string>('');
  const [folderHistory, setFolderHistory] = useState<FolderHistory[]>([]);
  const [selectedFile, setSelectedFile] = useState<DriveFile | null>(null);
  const [allFolders, setAllFolders] = useState<DriveFile[]>([]); 
  const [stats, setStats] = useState({ total: 0 });

  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'folder' | 'file'>('all');

  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [uploadDestinationId, setUploadDestinationId] = useState<string>('');
  const [previewLoading, setPreviewLoading] = useState(true);

  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [logsLoading, setLogsLoading] = useState(false);

  // --- ONLINE LOGGING LOGIC (Tidak diubah) ---
  const fetchOnlineLogs = useCallback(async () => {
    setLogsLoading(true);
    try {
      const res = await fetch('/api/logs');
      const data = await res.json();
      if (Array.isArray(data)) setActivityLogs(data);
    } catch (e) { console.error("Gagal mengambil log online", e); }
    setLogsLoading(false);
  }, []);

  const addOnlineLog = async (action: string, fileName: string) => {
    const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : "Unknown";
    let deviceDesc = "PC / Desktop";
    if (userAgent.includes("Android")) deviceDesc = "Android";
    else if (userAgent.includes("iPhone")) deviceDesc = "iPhone";
    else if (userAgent.includes("Macintosh")) deviceDesc = "MacBook";

    const newEntry = {
      action,
      fileName,
      user: userName || sessionStorage.getItem('userName') || "Guest",
      device: deviceDesc
    };

    try {
      await fetch('/api/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newEntry)
      });
      fetchOnlineLogs(); 
    } catch (e) { console.error("Gagal mengirim log", e); }
  };

  // --- INITIALIZATION (Tidak diubah) ---
  useEffect(() => {
    setMounted(true);
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchModalOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    const savedLogin = sessionStorage.getItem('isLoggedIn');
    const savedRole = sessionStorage.getItem('userRole');
    const savedName = sessionStorage.getItem('userName');
    const savedTheme = localStorage.getItem('theme');
    
    if (savedLogin === 'true' && savedRole && savedName) {
      setIsLoggedIn(true);
      setUserRole(savedRole as 'admin' | 'user');
      setUserName(savedName);
      fetchOnlineLogs();
    }
    if (savedTheme === 'light') setIsDarkMode(false);

    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [fetchOnlineLogs]);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  // --- DATA FETCHING (Tidak diubah) ---
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
    if (isLoggedIn) fetchData(currentFolder);
  }, [isLoggedIn, currentFolder]);

  useEffect(() => {
    if (isUploadModalOpen) fetchAllFolders();
  }, [isUploadModalOpen]);

  const navigateToFolder = (id: string, name: string) => {
    setCurrentFolder(id);
    setFolderHistory(prev => [...prev, { id, name }]);
    setSelectedFile(null);
  };

  const goBackOneLevel = () => {
    if (folderHistory.length > 0) {
      const newHistory = [...folderHistory];
      newHistory.pop();
      setFolderHistory(newHistory);
      const prevFolder = newHistory[newHistory.length - 1];
      setCurrentFolder(prevFolder ? prevFolder.id : '');
      setSelectedFile(null);
    }
  };

  const goHome = () => {
    setCurrentFolder('');
    setFolderHistory([]);
    setSelectedFile(null);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tempName.trim()) { alert("Silakan masukkan identitas!"); return; }
    if (password === 'adminLhp3') {
      loginProcess('admin');
    } else if (password === 'userLhp3') {
      loginProcess('user');
    } else { alert('Kode Akses Salah!'); }
  };

  const loginProcess = (role: 'admin' | 'user') => {
    setIsLoggedIn(true);
    setUserRole(role);
    setUserName(tempName);
    sessionStorage.setItem('isLoggedIn', 'true');
    sessionStorage.setItem('userRole', role);
    sessionStorage.setItem('userName', tempName);
    addOnlineLog("LOGIN", "Masuk ke Dashboard");
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (!selectedFiles || selectedFiles.length === 0) return;
    setUploading(true); setUploadStatus('idle'); setUploadProgress(0);
    const dest = uploadDestinationId || currentFolder || '';
    let success = 0;
    for (let i = 0; i < selectedFiles.length; i++) {
      const formData = new FormData();
      formData.append('file', selectedFiles[i]);
      formData.append('parentId', dest);
      try {
        const res = await fetch('/api/drive/upload', { method: 'POST', body: formData });
        if (res.ok) { success++; addOnlineLog("UPLOAD", selectedFiles[i].name); }
        setUploadProgress(Math.round(((i + 1) / selectedFiles.length) * 100));
      } catch (e) { console.error(e); }
    }
    setUploadStatus(success > 0 ? 'success' : 'error');
    setTimeout(() => { setIsUploadModalOpen(false); setUploadStatus('idle'); fetchData(currentFolder); }, 2000);
    setUploading(false);
  };

  const handleDelete = async (fileId: string, fileName: string) => {
    if (userRole !== 'admin') return;
    if (!confirm(`Hapus permanen ${fileName}?`)) return;
    try {
      const res = await fetch(`/api/drive?fileId=${fileId}`, { method: 'DELETE' });
      if (res.ok) { addOnlineLog("DELETE", fileName); fetchData(currentFolder); setSelectedFile(null); }
    } catch (e) { console.error(e); }
  };

  const handleRename = async (fileId: string, oldName: string) => {
    if (userRole !== 'admin') return;
    const newName = prompt("Ubah nama:", oldName);
    if (!newName || newName === oldName) return;
    try {
      await fetch('/api/drive', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileId, newName })
      });
      addOnlineLog("RENAME", `${oldName} -> ${newName}`);
      fetchData(currentFolder);
    } catch (e) { console.error(e); }
  };

  if (!mounted) return null;

  const filteredFiles = files
    .filter(f => f.name.toLowerCase().includes(searchTerm.toLowerCase()))
    .filter(f => {
      if (filterType === 'folder') return f.mimeType.includes('folder');
      if (filterType === 'file') return !f.mimeType.includes('folder');
      return true;
    });

  // --- LOGIN VIEW ---
  if (!isLoggedIn) {
    return (
      <div className="relative min-h-screen w-full flex items-center justify-center p-4 bg-[#020617] font-sans overflow-hidden">
        {/* Background Decorative Glow */}
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-600/20 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/20 blur-[120px] rounded-full"></div>
        
        <div className="absolute inset-0 z-0 bg-cover bg-center opacity-10 scale-105 contrast-125" style={{ backgroundImage: "url('https://i.ibb.co.com/NnC3sn3S/bg-login.png')" }}></div>
        
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="relative z-10 bg-slate-900/40 backdrop-blur-3xl p-10 md:p-16 rounded-[40px] shadow-[0_0_50px_rgba(0,0,0,0.5)] w-full max-w-md border border-white/10 text-center">
          <div className="mb-10 relative flex justify-center">
             <div className="absolute inset-0 bg-white/20 blur-2xl rounded-full scale-75"></div>
             <img src="https://i.ibb.co.com/L22pdJQ/Coat-of-arms-of-Southeast-Sulawesi-svg.png" alt="Logo" className="w-24 h-24 object-contain relative z-10" />
          </div>
          
          <h2 className="text-4xl font-black mb-1 text-white tracking-tighter italic uppercase leading-none">ELHP <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-400 font-black">PORTAL</span></h2>
          <p className="text-slate-400 mb-10 text-[10px] font-bold uppercase tracking-[0.6em] ml-1">Inspection Authority • Irban III</p>
          
          <form onSubmit={handleLogin} className="space-y-5">
            <div className="relative group">
               <User className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-purple-400 transition-colors" size={18}/>
               <input required type="text" placeholder="IDENTITAS USER" className="w-full py-5 pl-14 pr-5 rounded-2xl border border-white/5 outline-none bg-white/5 text-white font-bold placeholder:text-slate-600 focus:border-purple-500/50 focus:bg-white/10 transition-all text-xs uppercase tracking-widest" onChange={(e) => setTempName(e.target.value)} />
            </div>
            
            <div className="relative group">
               <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-purple-400 transition-colors" size={18}/>
               <input required type="password" placeholder="KODE AKSES" className="w-full py-5 pl-14 pr-5 rounded-2xl border border-white/5 outline-none bg-white/5 text-white font-bold placeholder:text-slate-600 focus:border-purple-500/50 focus:bg-white/10 transition-all text-xs tracking-[0.8em]" onChange={(e) => setPassword(e.target.value)} />
            </div>

            <button type="submit" className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-5 rounded-2xl font-black uppercase tracking-[0.2em] hover:shadow-[0_0_30px_rgba(147,51,234,0.4)] transition-all active:scale-95 text-xs">Verify Credentials</button>
          </form>
          
          <div className="mt-10 flex items-center justify-center gap-4 text-slate-600">
             <div className="h-[1px] w-10 bg-white/5"></div>
             <Shield size={16}/>
             <div className="h-[1px] w-10 bg-white/5"></div>
          </div>
        </motion.div>
      </div>
    );
  }

  // --- DASHBOARD VIEW ---
  return (
    <div className={isDarkMode ? "dark" : ""}>
      <div className="h-screen bg-[#F1F5F9] dark:bg-[#020617] flex text-slate-700 dark:text-slate-200 overflow-hidden transition-all duration-700 font-sans">
        
        {/* SIDEBAR */}
        <aside className="w-80 bg-white/40 dark:bg-slate-900/40 backdrop-blur-3xl border-r border-white/5 p-8 flex flex-col gap-10 relative z-20">
          <div className="flex flex-col items-center gap-5">
            <div className="relative group">
              <div className="absolute inset-0 bg-purple-500/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-all"></div>
              <div className="w-20 h-20 bg-white dark:bg-slate-800 rounded-[28px] p-3 border border-white/10 flex items-center justify-center shadow-2xl relative z-10">
                 <img src="https://i.ibb.co.com/L22pdJQ/Coat-of-arms-of-Southeast-Sulawesi-svg.png" alt="Logo" className="w-full h-full object-contain" />
              </div>
            </div>
            <div className="text-center">
              <h1 className="font-black text-2xl tracking-tighter text-slate-800 dark:text-white italic leading-none uppercase">ARV<span className="text-purple-500">DRIV3</span></h1>
              <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/5 rounded-full">
                 <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                 <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest truncate max-w-[120px]">{userName}</span>
              </div>
            </div>
          </div>
          
          <nav className="flex-1 space-y-2 font-black">
            <button onClick={goHome} className={`w-full flex items-center gap-4 p-4 rounded-2xl text-[10px] uppercase tracking-[0.2em] transition-all group ${!currentFolder ? 'bg-purple-600 text-white shadow-[0_10px_25px_rgba(147,51,234,0.3)]' : 'text-slate-400 hover:bg-white/5'}`}>
              <LayoutDashboard size={18} className="group-hover:rotate-6 transition-transform"/> Dashboard
            </button>
            
            <div className="pt-6 pb-2 px-4 text-[8px] text-slate-500 font-black uppercase tracking-[0.4em]">System Nodes</div>
            <div className="space-y-1">
              <button onClick={() => setFilterType('all')} className={`w-full flex items-center gap-4 p-4 rounded-xl text-[9px] uppercase tracking-widest transition-all ${filterType === 'all' ? 'text-purple-400 bg-purple-400/5' : 'text-slate-500 hover:text-slate-300'}`}><Layers size={16}/> All Nodes</button>
              <button onClick={() => setFilterType('folder')} className={`w-full flex items-center gap-4 p-4 rounded-xl text-[9px] uppercase tracking-widest transition-all ${filterType === 'folder' ? 'text-amber-400 bg-amber-400/5' : 'text-slate-500 hover:text-slate-300'}`}><Folder size={16}/> Directories</button>
              <button onClick={() => setFilterType('file')} className={`w-full flex items-center gap-4 p-4 rounded-xl text-[9px] uppercase tracking-widest transition-all ${filterType === 'file' ? 'text-blue-400 bg-blue-400/5' : 'text-slate-500 hover:text-slate-300'}`}><FileText size={16}/> Archives</button>
            </div>
            
            <button onClick={() => setIsLogModalOpen(true)} className="w-full flex items-center gap-4 p-4 text-slate-500 hover:bg-white/5 rounded-2xl transition-all text-[9px] uppercase tracking-widest mt-4 group">
              <History size={18} className="group-hover:rotate-[-20deg] transition-transform"/> Transaction Logs
            </button>
          </nav>

          {/* Premium Stats Card */}
          <div className="p-8 bg-gradient-to-br from-slate-900 to-indigo-900 rounded-[35px] text-white shadow-2xl relative overflow-hidden group border border-white/5">
             <div className="relative z-10">
               <p className="text-[9px] font-black uppercase opacity-40 mb-2 tracking-[0.3em]">Quantum Data</p>
               <h4 className="text-4xl font-black tracking-tighter flex items-end gap-1">{stats.total}<span className="text-xs text-purple-400 mb-1 opacity-60">files</span></h4>
               <div className="mt-4 flex items-center gap-2">
                  <div className="h-1 flex-1 bg-white/10 rounded-full overflow-hidden">
                     <motion.div initial={{ width: 0 }} animate={{ width: '70%' }} className="h-full bg-gradient-to-r from-purple-500 to-pink-500"></motion.div>
                  </div>
                  <span className="text-[8px] font-black opacity-30 tracking-widest">ACTIVE</span>
               </div>
             </div>
             <Database className="absolute -right-8 -bottom-8 opacity-[0.03] group-hover:rotate-12 group-hover:scale-110 transition-all duration-1000" size={150}/>
          </div>
          
          <button onClick={() => {sessionStorage.clear(); window.location.reload();}} className="flex items-center justify-center gap-3 p-5 bg-red-500/5 text-red-500 font-black uppercase text-[10px] tracking-widest rounded-2xl hover:bg-red-500 hover:text-white transition-all border border-red-500/10"><LogOut size={16}/> System Signout</button>
        </aside>

        {/* MAIN AREA */}
        <main className="flex-1 flex flex-col min-w-0 transition-colors relative bg-[#F8FAFF] dark:bg-[#020617]">
          {/* Subtle Background Glows */}
          <div className="absolute top-0 right-0 w-[50%] h-[50%] bg-indigo-500/5 blur-[150px] pointer-events-none"></div>

          <header className="p-8 md:p-10 flex justify-between items-center bg-white/50 dark:bg-slate-900/40 backdrop-blur-xl border-b border-white/5 z-10">
            <div className="flex items-center gap-6">
              <AnimatePresence>
                {folderHistory.length > 0 && (
                  <motion.button initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} onClick={goBackOneLevel} className="p-4 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-white/5 text-purple-500 hover:bg-purple-600 hover:text-white transition-all">
                    <ArrowLeft size={20} strokeWidth={3}/>
                  </motion.button>
                )}
              </AnimatePresence>
              <div>
                <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter uppercase italic leading-none">Smart <span className="text-purple-500">Archiv3</span></h1>
                <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 mt-2 uppercase tracking-widest leading-none">
                  <span className="hover:text-purple-500 cursor-pointer transition-colors" onClick={goHome}>CENTRAL HUB</span>
                  {folderHistory.map((h, i) => (
                    <React.Fragment key={h.id + i}>
                      <ChevronRight size={10} className="text-slate-600"/> 
                      <span className={i === folderHistory.length -1 ? "text-purple-500 font-black" : ""}>{h.name}</span>
                    </React.Fragment>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-5 flex-1 max-w-xl px-12">
              <div className="flex-1 relative group cursor-pointer" onClick={() => setIsSearchModalOpen(true)}>
                <Search size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500 group-hover:text-purple-500 transition-colors" />
                <div className="w-full pl-16 pr-6 py-5 bg-white/50 dark:bg-slate-800/40 border border-white/10 rounded-[25px] text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] shadow-inner transition-all group-hover:border-purple-500/30">Intelligence Scan...</div>
              </div>
              <button onClick={() => setIsDarkMode(!isDarkMode)} className="p-5 bg-white/50 dark:bg-slate-800/40 shadow-xl border border-white/10 rounded-[22px] text-slate-500 hover:scale-110 transition-all hover:text-purple-500 active:rotate-12">
                {isDarkMode ? <Sun size={20}/> : <Moon size={20}/>}
              </button>
            </div>

            {userRole === 'admin' && (
              <button onClick={() => {setUploadDestinationId(currentFolder); setIsUploadModalOpen(true);}} className="flex items-center gap-4 bg-slate-900 dark:bg-white dark:text-slate-900 text-white px-10 py-5 rounded-[22px] font-black uppercase text-[10px] tracking-widest shadow-[0_15px_30px_rgba(0,0,0,0.2)] hover:translate-y-[-3px] transition-all active:scale-95">
                <Plus size={18} strokeWidth={4} /> New Record
              </button>
            )}
          </header>

          <div className="flex-1 overflow-y-auto p-8 md:p-12 scrollbar-hide">
            {loading ? (
              <div className="h-full flex flex-col items-center justify-center gap-6">
                <div className="relative">
                   <div className="w-20 h-20 border-4 border-purple-500/20 rounded-full animate-ping"></div>
                   <Loader2 className="animate-spin text-purple-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" size={40} />
                </div>
                <p className="font-black text-[10px] uppercase tracking-[0.5em] text-slate-500">Syncing Matrix...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-8 pb-20">
                {filteredFiles.map((file) => (
                  <motion.div 
                    key={file.id} 
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={{ y: -8 }}
                    className={`relative group bg-white/40 dark:bg-slate-800/20 backdrop-blur-3xl p-8 rounded-[40px] border transition-all cursor-pointer h-72 flex flex-col justify-between ${selectedFile?.id === file.id ? 'border-purple-500 ring-2 ring-purple-500/20' : 'border-white/5 shadow-2xl hover:border-purple-500/30'}`}
                    onClick={() => file.mimeType.includes('folder') ? navigateToFolder(file.id, file.name) : setSelectedFile(file)}
                  >
                    <div className="flex justify-between items-start">
                      <div className={`p-5 rounded-[25px] transition-all duration-500 group-hover:scale-110 shadow-xl ${file.mimeType.includes('folder') ? 'bg-amber-500/10 text-amber-500' : 'bg-blue-500/10 text-blue-500'}`}>
                        {file.mimeType.includes('folder') ? <Folder size={32} fill="currentColor" className="opacity-80"/> : <FileText size={32} />}
                      </div>
                      
                      <div className="flex flex-col gap-3 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                        {!file.mimeType.includes('folder') && (
                          <button onClick={(e) => { e.stopPropagation(); addOnlineLog("DOWNLOAD", file.name); window.open(`https://drive.google.com/uc?export=download&id=${file.id}`, '_blank'); }} className="p-3 bg-white dark:bg-slate-700 rounded-xl text-slate-500 hover:text-blue-500 shadow-xl border border-white/5 transition-all"><Download size={18}/></button>
                        )}
                        {userRole === 'admin' && (
                          <>
                            <button onClick={(e) => { e.stopPropagation(); handleRename(file.id, file.name); }} className="p-3 bg-white dark:bg-slate-700 rounded-xl text-slate-500 hover:text-amber-500 shadow-xl border border-white/5 transition-all"><Edit2 size={18}/></button>
                            <button onClick={(e) => { e.stopPropagation(); handleDelete(file.id, file.name); }} className="p-3 bg-white dark:bg-slate-700 rounded-xl text-slate-500 hover:text-red-500 shadow-xl border border-white/5 transition-all"><Trash2 size={18}/></button>
                          </>
                        )}
                      </div>
                    </div>
                    
                    <div className="relative">
                      <h4 className="font-black text-slate-800 dark:text-white truncate text-lg uppercase tracking-tighter leading-tight group-hover:text-purple-500 transition-colors">{file.name}</h4>
                      <div className="flex items-center gap-3 mt-3">
                         <span className={`text-[8px] font-black uppercase tracking-[0.2em] py-1.5 px-4 rounded-full inline-block ${file.mimeType.includes('folder') ? 'bg-amber-500/10 text-amber-500' : 'bg-blue-500/10 text-blue-500'}`}>
                           {file.mimeType.includes('folder') ? 'DIRECTORY' : 'PDF ARCHIVE'}
                         </span>
                         <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest opacity-40 italic">ELHPv2</span>
                      </div>
                    </div>
                    
                    {/* Hover Decoration */}
                    <div className="absolute top-5 right-5 w-2 h-2 bg-purple-500 rounded-full opacity-0 group-hover:opacity-100 transition-all animate-pulse"></div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </main>

        {/* SEARCH SPOTLIGHT */}
        <AnimatePresence>
          {isSearchModalOpen && (
            <div className="fixed inset-0 z-[200] flex items-start justify-center pt-32 px-4 bg-slate-950/80 backdrop-blur-xl" onClick={() => setIsSearchModalOpen(false)}>
              <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className="bg-slate-900/80 border border-white/10 w-full max-w-2xl rounded-[35px] shadow-2xl overflow-hidden backdrop-blur-2xl" onClick={e => e.stopPropagation()}>
                <div className="p-8 flex items-center gap-6 border-b border-white/5">
                  <Search className="text-purple-500" size={28} />
                  <input autoFocus type="text" placeholder="Intelligence search..." className="flex-1 bg-transparent outline-none font-black text-xl text-white uppercase tracking-tighter" onChange={(e) => setSearchTerm(e.target.value)} />
                  <div className="p-2 px-4 bg-white/5 border border-white/5 rounded-xl text-[9px] font-black text-slate-500">ESC</div>
                </div>
                <div className="max-h-[400px] overflow-y-auto p-6 space-y-2 scrollbar-hide">
                  {files.filter(f => f.name.toLowerCase().includes(searchTerm.toLowerCase())).map(f => (
                    <div key={f.id} onClick={() => { if(f.mimeType.includes('folder')) navigateToFolder(f.id, f.name); else setSelectedFile(f); setIsSearchModalOpen(false); }} className="p-5 hover:bg-purple-600 hover:text-white rounded-2xl cursor-pointer flex items-center justify-between group transition-all font-black text-sm uppercase tracking-tighter text-slate-400">
                      <div className="flex items-center gap-5">{f.mimeType.includes('folder') ? <Folder size={20}/> : <FileText size={20}/>}<span>{f.name}</span></div>
                      <ChevronRight size={16} className="opacity-0 group-hover:opacity-100 group-hover:translate-x-2 transition-all" />
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* LOG MODAL TABLE */}
        <AnimatePresence>
          {isLogModalOpen && (
            <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-slate-950/90 backdrop-blur-2xl" onClick={() => {setIsLogModalOpen(false); fetchOnlineLogs();}}>
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-slate-900 border border-white/10 w-full max-w-5xl rounded-[40px] shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
                <div className="p-10 border-b border-white/5 flex justify-between items-center bg-slate-900/50">
                  <h3 className="text-2xl font-black uppercase tracking-tighter text-white flex items-center gap-4"><Zap className="text-purple-500 fill-purple-500" /> Transaction Matrix</h3>
                  <div className="flex items-center gap-6">
                    {logsLoading && <Loader2 className="animate-spin text-purple-500" size={20}/>}
                    <button onClick={() => {setIsLogModalOpen(false); fetchOnlineLogs();}} className="p-3 hover:bg-red-500/20 text-slate-400 hover:text-red-500 rounded-full transition-all border border-white/5"><X size={24}/></button>
                  </div>
                </div>
                <div className="overflow-x-auto max-h-[65vh] p-4">
                  <table className="w-full text-left border-collapse min-w-[800px]">
                    <thead className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 sticky top-0 bg-slate-900 z-10">
                      <tr>
                        <th className="p-6 border-b border-white/5">Subject</th>
                        <th className="p-6 border-b border-white/5">Action</th>
                        <th className="p-6 border-b border-white/5">Object</th>
                        <th className="p-6 border-b border-white/5">Terminal</th>
                        <th className="p-6 border-b border-white/5">Timestamp</th>
                      </tr>
                    </thead>
                    <tbody className="text-[11px] font-bold">
                      {activityLogs.map((log) => (
                        <tr key={log.id} className="border-b border-white/5 text-slate-300 hover:bg-white/[0.02] transition-colors group">
                          <td className="p-6 text-purple-400 group-hover:text-purple-300 transition-colors">{log.user}</td>
                          <td className="p-6">
                            <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest text-white ${log.action === 'DELETE' ? 'bg-red-500' : log.action === 'UPLOAD' ? 'bg-emerald-500' : 'bg-indigo-500'}`}>
                              {log.action}
                            </span>
                          </td>
                          <td className="p-6 max-w-[200px] truncate text-slate-400 italic">{log.fileName}</td>
                          <td className="p-6 opacity-40 font-mono tracking-tighter">{log.device}</td>
                          <td className="p-6 text-[10px] opacity-30 group-hover:opacity-60 transition-all">{log.timestamp}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {activityLogs.length === 0 && !logsLoading && (
                    <div className="p-20 text-center flex flex-col items-center gap-4">
                       <History size={40} className="text-slate-800" />
                       <p className="text-slate-700 uppercase tracking-widest text-xs font-black">No system records found</p>
                    </div>
                  )}
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* UPLOAD MODAL */}
        <AnimatePresence>
          {isUploadModalOpen && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/90 backdrop-blur-2xl">
              <motion.div initial={{ scale: 0.8, y: 50 }} animate={{ scale: 1, y: 0 }} className="bg-slate-900 rounded-[50px] p-16 w-full max-w-2xl relative border border-white/10 shadow-[0_0_100px_rgba(0,0,0,0.5)]">
                <button onClick={() => setIsUploadModalOpen(false)} className="absolute right-12 top-12 text-slate-500 hover:rotate-90 transition-all duration-500 hover:text-white"><X size={32}/></button>
                <div className="text-center mb-12">
                   <h3 className="text-4xl font-black text-white uppercase tracking-tighter italic">Data <span className="text-purple-500">Transmission</span></h3>
                   <p className="text-xs text-purple-400 font-bold uppercase tracking-[0.6em] mt-3 opacity-60">Irban III Inspection Unit</p>
                </div>
                {uploadStatus === 'idle' ? (
                  <div className="space-y-10">
                    <div className="relative">
                      <select value={uploadDestinationId} onChange={(e) => setUploadDestinationId(e.target.value)} className="w-full p-6 pr-14 rounded-2xl bg-white/5 border border-white/10 outline-none font-black text-[11px] text-slate-300 cursor-pointer focus:border-purple-500/50 transition-all appearance-none uppercase tracking-widest">
                        <option value="">🏠 Root Network</option>
                        {allFolders.map(f => (<option key={f.id} value={f.id} className="bg-slate-900">📁 {f.name.toUpperCase()}</option>))}
                      </select>
                      <ChevronRight className="absolute right-6 top-1/2 -translate-y-1/2 rotate-90 text-slate-500 pointer-events-none" size={20}/>
                    </div>
                    
                    <label className="flex flex-col items-center justify-center w-full h-80 border-2 border-dashed border-white/10 rounded-[40px] cursor-pointer hover:bg-purple-600/5 hover:border-purple-500/40 transition-all text-center p-8 group relative overflow-hidden">
                      {uploading ? (
                        <div className="w-full relative z-10 px-10">
                          <Loader2 className="animate-spin mx-auto text-purple-500 mb-8" size={60} />
                          <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden mb-5">
                             <motion.div initial={{ width: 0 }} animate={{ width: `${uploadProgress}%` }} className="h-full bg-gradient-to-r from-purple-500 via-indigo-500 to-emerald-500" />
                          </div>
                          <p className="text-[10px] font-black uppercase text-purple-500 tracking-[0.5em]">{uploadProgress}% ENCRYPTING...</p>
                        </div>
                      ) : (
                        <>
                          <div className="absolute inset-0 bg-purple-600 opacity-0 group-hover:opacity-[0.02] transition-all"></div>
                          <div className="p-8 bg-purple-600 rounded-3xl text-white mb-8 shadow-[0_15px_35px_rgba(147,51,234,0.4)] group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                            <Upload size={40} strokeWidth={3}/>
                          </div>
                          <p className="text-xl font-black text-white uppercase tracking-tighter">Queue Transfer</p>
                          <p className="text-[9px] text-slate-500 font-bold uppercase mt-3 tracking-[0.2em]">Max capacity 100MB per file</p>
                          <input type="file" multiple className="hidden" onChange={handleUpload} disabled={uploading} />
                        </>
                      )}
                    </label>
                  </div>
                ) : (
                  <div className="text-center py-20">
                    {uploadStatus === 'success' ? (
                      <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
                        <div className="w-32 h-32 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-8 border border-emerald-500/20 shadow-[0_0_50px_rgba(16,185,129,0.1)]">
                           <CheckCircle2 size={60} className="text-emerald-500" />
                        </div>
                        <h3 className="text-3xl font-black text-white uppercase tracking-tighter">Success <span className="text-emerald-500">Secured</span></h3>
                      </motion.div>
                    ) : (
                      <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
                        <div className="w-32 h-32 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-8 border border-red-500/20 shadow-[0_0_50px_rgba(239,68,68,0.1)]">
                           <AlertCircle size={60} className="text-red-500" />
                        </div>
                        <h3 className="text-3xl font-black text-white uppercase tracking-tighter">Transmission <span className="text-red-500">Failed</span></h3>
                      </motion.div>
                    )}
                  </div>
                )}
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* PREVIEW PANEL */}
        <AnimatePresence>
          {selectedFile && (
            <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }} className="w-[750px] bg-white/90 dark:bg-slate-900/80 backdrop-blur-3xl shadow-[-50px_0_100px_rgba(0,0,0,0.5)] border-l border-white/10 flex flex-col overflow-hidden relative z-30">
               {/* Decorative Gradient Bar */}
               <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-purple-500 via-indigo-500 to-transparent"></div>
               
               <div className="p-10 border-b border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-6 overflow-hidden">
                    <div className="p-5 bg-purple-600/10 rounded-2xl text-purple-500 shadow-inner">
                      <FileText size={28}/>
                    </div>
                    <div>
                      <span className="font-black text-xs uppercase tracking-[0.3em] text-purple-500 block mb-1">System Preview</span>
                      <span className="font-black text-lg truncate uppercase tracking-tighter text-slate-900 dark:text-white block leading-none">{selectedFile.name}</span>
                    </div>
                  </div>
                  <button onClick={() => { setSelectedFile(null); setPreviewLoading(true); }} className="p-4 bg-white/5 text-slate-400 hover:text-red-500 hover:bg-red-500/10 rounded-2xl transition-all border border-white/5"><X size={28}/></button>
               </div>
               
               <div className="flex-1 relative m-10">
                  {previewLoading && (
                    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-slate-100 dark:bg-slate-950 rounded-[45px] border border-white/5">
                      <div className="relative">
                         <div className="w-20 h-20 border-4 border-purple-500/20 rounded-full animate-ping"></div>
                         <Loader2 className="animate-spin text-purple-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" size={32} />
                      </div>
                      <p className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-600 dark:text-slate-500 mt-6 animate-pulse">Syncing Visualizer...</p>
                    </div>
                  )}
                  <iframe 
                    src={`https://drive.google.com/file/d/${selectedFile.id}/preview`} 
                    className="w-full h-full rounded-[45px] overflow-hidden bg-white dark:bg-slate-950 border border-white/10 shadow-2xl transition-opacity duration-1000" 
                    title="Live Sync"
                    style={{ opacity: previewLoading ? 0 : 1 }}
                    onLoad={() => setPreviewLoading(false)}
                  />
               </div>

               <div className="p-10 bg-slate-100/50 dark:bg-slate-900/50 backdrop-blur-xl border-t border-white/5">
                 <button onClick={() => { addOnlineLog("DOWNLOAD", selectedFile.name); window.open(`https://drive.google.com/uc?export=download&id=${selectedFile.id}`, '_blank'); }} className="w-full py-7 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-[28px] font-black text-xs uppercase tracking-[0.4em] flex items-center justify-center gap-4 hover:shadow-[0_20px_40px_rgba(0,0,0,0.3)] hover:scale-[1.02] active:scale-95 transition-all shadow-xl">
                   <Download size={22} strokeWidth={4}/> Authorize Download
                 </button>
               </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}