"use client"
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Folder, FileText, Upload, Lock, Database, LayoutDashboard, 
  Search, LogOut, ChevronRight, Loader2, Edit2, Plus, X, 
  Download, ArrowLeft, Sun, Moon, Shield, 
  CheckCircle2, AlertCircle, Filter, History, User,
  Crown, Zap, ShieldCheck, Star, Trash2, Trophy, Coins,
  LayoutGrid, List, Clock, Info, Share2, Pin
} from 'lucide-react';

// --- INTERFACES ---
interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  createdTime?: string;
  size?: string;
  owner?: string;
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
  const [mounted, setMounted] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<'admin' | 'user' | null>(null);
  const [userName, setUserName] = useState<string>('');
  const [password, setPassword] = useState('');
  const [tempName, setTempName] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(true);

  const [files, setFiles] = useState<DriveFile[]>([]);
  const [searchResults, setSearchResults] = useState<DriveFile[]>([]); 
  const [currentFolder, setCurrentFolder] = useState<string>('');
  const [folderHistory, setFolderHistory] = useState<FolderHistory[]>([]);
  const [selectedFile, setSelectedFile] = useState<DriveFile | null>(null);
  const [allFolders, setAllFolders] = useState<DriveFile[]>([]); 
  const [stats, setStats] = useState({ total: 0 });

  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false); 
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'folder' | 'file'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

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

  const fetchOnlineLogs = useCallback(async () => {
    setLogsLoading(true);
    try {
      const res = await fetch('/api/logs');
      const data = await res.json();
      if (Array.isArray(data)) setActivityLogs(data);
    } catch (e) { console.error("Error logs:", e); }
    setLogsLoading(false);
  }, []);

  const addOnlineLog = async (action: string, fileName: string) => {
    const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : "Unknown";
    const deviceDesc = userAgent.includes("Android") ? "Android" : userAgent.includes("iPhone") ? "iPhone" : "PC / Desktop";
    const newEntry = { action, fileName, user: userName || sessionStorage.getItem('userName') || "Guest", device: deviceDesc };
    try {
      await fetch('/api/logs', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newEntry) });
      fetchOnlineLogs();
    } catch (e) { console.error(e); }
  };

  const handleGlobalSearch = async (term: string) => {
    setSearchTerm(term);
    if (!term.trim() || term.length < 2) { setSearchResults([]); return; }
    setSearchLoading(true);
    try {
      const res = await fetch(`/api/drive?search=${encodeURIComponent(term)}`);
      const data = await res.json();
      if (data.files) setSearchResults(data.files);
      else setSearchResults([]);
    } catch (e) { setSearchResults([]); }
    setSearchLoading(false);
  };

  useEffect(() => {
    setMounted(true);
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') { e.preventDefault(); setIsSearchModalOpen(true); }
      if (e.key === 'Escape') { setSelectedFile(null); setIsSearchModalOpen(false); setSearchResults([]); setSearchTerm(''); }
    };
    window.addEventListener('keydown', handleKeyDown);
    const savedLogin = sessionStorage.getItem('isLoggedIn');
    const savedRole = sessionStorage.getItem('userRole');
    const savedName = sessionStorage.getItem('userName');
    if (savedLogin === 'true' && savedRole && savedName) {
      setIsLoggedIn(true); setUserRole(savedRole as any); setUserName(savedName); fetchOnlineLogs();
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [fetchOnlineLogs]);

  useEffect(() => { document.documentElement.classList.toggle('dark', isDarkMode); }, [isDarkMode]);

  const fetchData = async (fId: string = '') => {
    setLoading(true);
    try {
      const res = await fetch(`/api/drive?folderId=${fId}`);
      const data = await res.json();
      if (data.files) { setFiles(data.files); setStats({ total: data.totalDocs || 0 }); }
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { if (isLoggedIn) fetchData(currentFolder); }, [isLoggedIn, currentFolder]);

  const fetchAllFolders = async () => {
    try {
      const res = await fetch('/api/drive/all-folders');
      const data = await res.json();
      if (Array.isArray(data)) setAllFolders(data);
    } catch (e) { console.error(e); }
  };

  useEffect(() => { if (isUploadModalOpen) fetchAllFolders(); }, [isUploadModalOpen]);

  const navigateToFolder = (id: string, name: string) => {
    setCurrentFolder(id); setFolderHistory(prev => [...prev, { id, name }]); setSelectedFile(null);
  };

  const goBackOneLevel = () => {
    if (folderHistory.length > 0) {
      const newHistory = [...folderHistory]; newHistory.pop(); setFolderHistory(newHistory);
      const prevFolder = newHistory[newHistory.length - 1]; setCurrentFolder(prevFolder ? prevFolder.id : ''); setSelectedFile(null);
    }
  };

  const goHome = () => { setCurrentFolder(''); setFolderHistory([]); setSelectedFile(null); };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tempName.trim()) { alert("Masukkan Nama!"); return; }
    const processLogin = (role: 'admin' | 'user') => {
      setIsLoggedIn(true); setUserRole(role); setUserName(tempName);
      sessionStorage.setItem('isLoggedIn', 'true'); sessionStorage.setItem('userRole', role); sessionStorage.setItem('userName', tempName);
      addOnlineLog("LOGIN", "Masuk ke Vault");
    };
    if (password === 'adminLhp3') processLogin('admin');
    else if (password === 'userLhp3') processLogin('user');
    else alert('Kunci Akses Salah!');
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files; if (!selectedFiles || selectedFiles.length === 0) return;
    setUploading(true); setUploadStatus('idle'); setUploadProgress(0);
    let success = 0;
    for (let i = 0; i < selectedFiles.length; i++) {
      const formData = new FormData(); formData.append('file', selectedFiles[i]);
      formData.append('parentId', uploadDestinationId || currentFolder || '');
      try {
        const res = await fetch('/api/drive/upload', { method: 'POST', body: formData });
        if (res.ok) { success++; addOnlineLog("UPLOAD", selectedFiles[i].name); }
        setUploadProgress(Math.round(((i + 1) / selectedFiles.length) * 100));
      } catch (e) { console.error(e); }
    }
    setUploadStatus(success > 0 ? 'success' : 'error');
    setTimeout(() => { setIsUploadModalOpen(false); fetchData(currentFolder); }, 2000);
    setUploading(false);
  };

  const handleDelete = async (fileId: string, fileName: string) => {
    if (userRole !== 'admin' || !confirm(`Hapus permanen ${fileName}?`)) return;
    try {
      const res = await fetch(`/api/drive?fileId=${fileId}`, { method: 'DELETE' });
      if (res.ok) { addOnlineLog("DELETE", fileName); fetchData(currentFolder); setSelectedFile(null); }
    } catch (e) { console.error(e); }
  };

  const handleRename = async (fileId: string, oldName: string) => {
    if (userRole !== 'admin') return;
    const newName = prompt("Nama Baru:", oldName); if (!newName) return;
    try {
      await fetch('/api/drive', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ fileId, newName }) });
      addOnlineLog("RENAME", `${oldName} -> ${newName}`); fetchData(currentFolder);
    } catch (e) { console.error(e); }
  };

  if (!mounted) return null;

  const filteredFilesMain = files
    .filter(f => f.name.toLowerCase().includes(searchTerm.toLowerCase()))
    .filter(f => {
      if (filterType === 'folder') return f.mimeType.includes('folder');
      if (filterType === 'file') return !f.mimeType.includes('folder');
      return true;
    });

  if (!isLoggedIn) {
    return (
      <div className="relative min-h-screen w-full flex items-center justify-center p-4 bg-[#0a0f1a] font-sans overflow-hidden">
        {/* Background Image Layer (Login) */}
        <div className="absolute inset-0 z-0 bg-cover bg-center opacity-40 grayscale-[0.5] contrast-125" style={{ backgroundImage: "url('https://i.ibb.co.com/NnC3sn3S/bg-login.png')" }}></div>
        
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-900/20 via-transparent to-amber-900/10 z-[1]"></div>
        
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="relative z-10 bg-slate-900/90 backdrop-blur-xl p-12 rounded-[60px] shadow-[0_0_100px_rgba(0,0,0,0.5)] w-full max-w-md border border-amber-500/20 text-center">
          <div className="mb-8 flex justify-center">
             <div className="p-6 bg-gradient-to-br from-amber-300 to-amber-600 rounded-full shadow-[0_10px_40px_rgba(245,158,11,0.3)]">
                <img src="https://i.ibb.co.com/L22pdJQ/Coat-of-arms-of-Southeast-Sulawesi-svg.png" alt="Logo" className="w-20 h-20 object-contain" />
             </div>
          </div>
          <h2 className="text-4xl font-black mb-1 text-white tracking-tighter italic uppercase">ROYAL <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-200">VAULT</span></h2>
          <p className="text-amber-500/60 mb-10 text-[10px] font-black uppercase tracking-[0.6em]">Inspectorate Elite Portal</p>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="relative group">
               <User className="absolute left-6 top-1/2 -translate-y-1/2 text-amber-500/40" size={18}/>
               <input required type="text" placeholder="IDENTITAS PENGGUNA" className="w-full py-5 pl-16 pr-5 rounded-3xl border border-white/5 outline-none bg-white/5 text-amber-100 font-bold placeholder:text-slate-600 focus:border-amber-500/50 transition-all text-xs uppercase" onChange={(e) => setTempName(e.target.value)} />
            </div>
            <div className="relative group">
               <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-amber-500/40" size={18}/>
               <input required type="password" placeholder="KUNCI AKSES" className="w-full py-5 pl-16 pr-5 rounded-3xl border border-white/5 outline-none bg-white/5 text-amber-100 font-bold placeholder:text-slate-600 tracking-[0.8em] focus:border-amber-500/50 transition-all" onChange={(e) => setPassword(e.target.value)} />
            </div>
            <button type="submit" className="w-full bg-gradient-to-r from-amber-600 via-amber-400 to-amber-600 text-slate-950 py-5 rounded-3xl font-black uppercase tracking-widest hover:shadow-[0_0_30px_rgba(245,158,11,0.4)] transition-all active:scale-95 text-xs border border-amber-300/30">Verify Authority</button>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <div className={isDarkMode ? "dark" : ""}>
      <div className="h-screen bg-[#0f172a] flex text-slate-300 overflow-hidden font-sans relative">
        {/* Fixed Background Image Layer (Dashboard) */}
        <div className="fixed inset-0 z-0 bg-cover bg-center opacity-[0.07] pointer-events-none grayscale contrast-125" style={{ backgroundImage: "url('https://i.ibb.co.com/NnC3sn3S/bg-login.png')" }}></div>
        
        <div className="fixed inset-0 z-0 bg-gradient-to-tr from-slate-900 via-[#1e293b] to-slate-900 pointer-events-none opacity-90"></div>
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-amber-500/5 blur-[120px] rounded-full pointer-events-none"></div>

        {/* SIDEBAR */}
        <aside className="w-80 bg-slate-900/60 backdrop-blur-xl border-r border-amber-500/10 p-8 flex flex-col gap-10 relative z-20 shadow-2xl">
          <div className="flex flex-col items-center gap-5">
            <div className="relative group p-1 bg-gradient-to-br from-amber-500/30 to-transparent rounded-[35px]">
              <div className="w-20 h-20 bg-[#1e293b] rounded-[30px] p-4 shadow-2xl flex items-center justify-center relative overflow-hidden border border-white/5">
                 <img src="https://i.ibb.co.com/L22pdJQ/Coat-of-arms-of-Southeast-Sulawesi-svg.png" alt="Logo" className="w-full h-full object-contain" />
              </div>
            </div>
            <div className="text-center">
              <h1 className="font-black text-2xl tracking-tighter text-white italic uppercase leading-none">ARV<span className="text-amber-500">DRIV3</span></h1>
              <div className="mt-5 inline-flex items-center gap-2 px-4 py-1.5 bg-gradient-to-r from-amber-500/20 to-transparent rounded-full border border-amber-500/20 shadow-inner">
                 <Crown size={14} className="text-amber-400" />
                 <span className="text-[10px] font-black text-amber-200 uppercase tracking-widest truncate max-w-[120px]">{userName}</span>
              </div>
            </div>
          </div>
          
          <nav className="flex-1 space-y-3 font-black text-[10px] uppercase tracking-widest overflow-y-auto scrollbar-hide">
            <button onClick={goHome} className={`w-full flex items-center gap-5 p-5 rounded-3xl transition-all border ${!currentFolder ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-[0_10px_25px_rgba(245,158,11,0.2)]' : 'bg-white/5 text-slate-400 border-transparent hover:border-white/10 hover:text-white'}`}>
              <LayoutDashboard size={18}/> Overview
            </button>
            <div className="pt-8 pb-2 px-4 text-[8px] text-amber-500/40 font-black tracking-[0.4em]">Vault Filtration</div>
            <button onClick={() => setFilterType('all')} className={`w-full flex items-center gap-5 p-4 rounded-2xl transition-all border ${filterType === 'all' ? 'text-amber-400 bg-amber-500/5 border-amber-500/20' : 'text-slate-500 border-transparent hover:text-slate-300'}`}><LayoutGrid size={16}/> Matrix</button>
            <button onClick={() => setFilterType('folder')} className={`w-full flex items-center gap-5 p-4 rounded-2xl transition-all border ${filterType === 'folder' ? 'text-amber-400 bg-amber-500/5 border-amber-500/20' : 'text-slate-500 border-transparent hover:text-slate-300'}`}><Folder size={16}/> Directories</button>
            <button onClick={() => setFilterType('file')} className={`w-full flex items-center gap-5 p-4 rounded-2xl transition-all border ${filterType === 'file' ? 'text-amber-400 bg-amber-500/5 border-amber-500/20' : 'text-slate-500 border-transparent hover:text-slate-300'}`}><FileText size={16}/> Records</button>
            <button onClick={() => setIsLogModalOpen(true)} className="w-full flex items-center gap-5 p-4 text-slate-500 hover:bg-white/5 rounded-2xl transition-all mt-4">
              <History size={18}/> Audit Logs
            </button>
          </nav>

          <div className="p-8 space-y-4 bg-white/5 rounded-[40px] border border-white/5">
             <div className="flex items-center justify-between">
                <div>
                   <p className="text-[8px] font-black uppercase text-amber-500/40 mb-1 tracking-widest italic">Ledger Status</p>
                   <h4 className="text-3xl font-black text-white leading-none">{stats.total}</h4>
                </div>
                <div className="p-3 bg-amber-500 rounded-2xl text-slate-900 shadow-lg shadow-amber-500/20"><Database size={20}/></div>
             </div>
             <button onClick={() => {sessionStorage.clear(); window.location.reload();}} className="w-full flex items-center justify-center gap-3 p-4 bg-red-500/10 text-red-400 font-black uppercase text-[9px] tracking-widest rounded-2xl hover:bg-red-500 hover:text-white transition-all border border-red-500/20">Signout</button>
          </div>
        </aside>

        {/* MAIN AREA */}
        <main className="flex-1 flex flex-col min-w-0 transition-colors relative z-10 overflow-hidden transform-gpu will-change-transform">
          <header className="px-10 py-10 flex justify-between items-center bg-slate-800/20 backdrop-blur-md border-b border-white/5">
            <div className="flex items-center gap-6">
              <AnimatePresence>
                {folderHistory.length > 0 && (
                  <motion.button initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} onClick={goBackOneLevel} className="p-4 bg-white/5 rounded-2xl text-amber-400 border border-amber-500/20 hover:bg-amber-500 hover:text-slate-950 transition-all shadow-xl">
                    <ArrowLeft size={20} strokeWidth={3}/>
                  </motion.button>
                )}
              </AnimatePresence>
              <div>
                <h1 className="text-3xl font-black text-white tracking-tighter uppercase italic leading-none">Smart <span className="text-amber-500">Archive</span></h1>
                <div className="flex items-center gap-2 text-[9px] font-black text-slate-500 mt-2 uppercase tracking-[0.3em]">
                  <span className="hover:text-amber-500 cursor-pointer transition-colors" onClick={goHome}>CENTRAL REPOSITORY</span>
                  {folderHistory.map((h, i) => (
                    <React.Fragment key={h.id + i}>
                      <ChevronRight size={10} className="text-slate-700"/> 
                      <span className={i === folderHistory.length -1 ? "text-amber-400" : ""}>{h.name}</span>
                    </React.Fragment>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-5 flex-1 max-w-2xl px-12">
               <div className="flex-1 relative group" onClick={() => setIsSearchModalOpen(true)}>
                  <Search size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500 group-hover:text-amber-400 transition-colors" />
                  <div className="w-full pl-16 pr-6 py-4 bg-white/5 border border-white/10 rounded-[25px] text-slate-500 text-[11px] font-bold uppercase tracking-widest cursor-pointer group-hover:border-amber-500/30 transition-all text-left shadow-inner">Global Vault Search (Ctrl+K)</div>
               </div>
               
               <div className="flex items-center bg-white/5 p-1.5 rounded-[22px] border border-white/5 shadow-inner">
                  <button onClick={() => setViewMode('grid')} className={`p-3 rounded-2xl transition-all ${viewMode === 'grid' ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20' : 'text-slate-500 hover:text-white'}`}><LayoutGrid size={18}/></button>
                  <button onClick={() => setViewMode('list')} className={`p-3 rounded-2xl transition-all ${viewMode === 'list' ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20' : 'text-slate-500 hover:text-white'}`}><List size={18}/></button>
               </div>

               <button onClick={() => setIsDarkMode(!isDarkMode)} className="p-4 bg-white/5 rounded-2xl text-slate-500 hover:text-amber-400 border border-white/5 transition-all shadow-inner">
                  {isDarkMode ? <Sun size={20}/> : <Moon size={20}/>}
               </button>
            </div>

            {userRole === 'admin' && (
              <button onClick={() => {setUploadDestinationId(currentFolder); setIsUploadModalOpen(true);}} className="flex items-center gap-4 bg-gradient-to-r from-amber-600 to-amber-400 text-slate-950 px-10 py-4 rounded-[22px] font-black uppercase text-[11px] tracking-[0.2em] shadow-2xl hover:-translate-y-1 transition-all border border-amber-300/30">
                <Plus size={18} strokeWidth={4} /> New Record
              </button>
            )}
          </header>

          <div className="flex-1 overflow-y-auto p-12 scrollbar-hide will-change-scroll transform-gpu">
            {loading ? (
              <div className="h-full flex flex-col items-center justify-center gap-8">
                <div className="relative">
                  <div className="absolute inset-0 bg-amber-500/20 blur-3xl animate-pulse"></div>
                  <Loader2 className="animate-spin text-amber-500 relative z-10" size={64} />
                </div>
                <p className="font-black text-[11px] uppercase tracking-[0.6em] text-amber-500/40 animate-pulse italic">Syncing Royal Matrix Assets...</p>
              </div>
            ) : (
              <div className="space-y-16">
                 
                {!currentFolder && filterType !== 'file' && (
                   <section>
                      <h3 className="text-[11px] font-black uppercase text-slate-500 tracking-[0.5em] mb-8 flex items-center gap-4">
                         <Pin size={14} className="text-amber-500" /> Essential Directories
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                         {filteredFilesMain.filter(f => f.mimeType.includes('folder')).slice(0, 4).map(folder => (
                            <div 
                               key={folder.id} 
                               onClick={() => navigateToFolder(folder.id, folder.name)}
                               className="bg-gradient-to-br from-white/[0.03] to-transparent p-8 rounded-[45px] border border-white/5 flex items-center gap-6 cursor-pointer group hover:border-amber-500/30 transition-all transform-gpu hover:-translate-y-2 shadow-2xl"
                            >
                               <div className="p-5 bg-amber-500 rounded-3xl text-slate-900 shadow-xl transition-all group-hover:rotate-6 shadow-amber-500/20">
                                  <Folder size={28} fill="currentColor" />
                                </div>
                                <div className="min-w-0">
                                   <h4 className="font-black text-white text-sm truncate uppercase tracking-tighter group-hover:text-amber-300 transition-colors">{folder.name}</h4>
                                   <p className="text-[9px] text-slate-500 font-bold uppercase mt-1 tracking-widest">Access Node</p>
                                </div>
                            </div>
                         ))}
                      </div>
                   </section>
                )}

                <section>
                   <div className="flex items-center justify-between mb-10 border-b border-white/5 pb-6">
                      <h3 className="text-[11px] font-black uppercase text-slate-500 tracking-[0.5em] flex items-center gap-4">
                         <Star size={14} className="text-amber-500" /> Active Ledger
                      </h3>
                      <p className="text-[10px] font-bold text-slate-600 italic uppercase tracking-widest">{filteredFilesMain.length} Secured Objects Detected</p>
                   </div>

                   {viewMode === 'grid' ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-12">
                        {filteredFilesMain.map((file) => (
                           <div 
                              key={file.id} 
                              className={`relative group bg-gradient-to-b from-white/[0.04] to-transparent p-10 rounded-[55px] border transition-all cursor-pointer h-80 flex flex-col justify-between transform-gpu hover:-translate-y-2 ${selectedFile?.id === file.id ? 'border-amber-500 bg-amber-500/10 shadow-[0_20px_50px_rgba(245,158,11,0.1)]' : 'border-white/5 hover:border-amber-500/40 hover:shadow-2xl'}`}
                              onClick={() => file.mimeType.includes('folder') ? navigateToFolder(file.id, file.name) : setSelectedFile(file)}
                           >
                              <div className="flex justify-between items-start">
                                 <div className={`p-6 rounded-[30px] shadow-2xl transition-all duration-300 group-hover:scale-110 ${file.mimeType.includes('folder') ? 'bg-amber-500 text-slate-950 shadow-amber-500/20' : 'bg-slate-800 text-slate-100 border border-white/10 shadow-black/40'}`}>
                                    {file.mimeType.includes('folder') ? <Folder size={32} fill="currentColor" /> : <FileText size={32} />}
                                 </div>
                                 <div className="flex flex-col gap-3 opacity-0 group-hover:opacity-100 transition-all translate-x-3 group-hover:translate-x-0">
                                    {!file.mimeType.includes('folder') && (
                                       <button onClick={(e) => { e.stopPropagation(); addOnlineLog("DOWNLOAD", file.name); window.open(`https://drive.google.com/uc?export=download&id=${file.id}`, '_blank'); }} className="p-4 bg-slate-800 rounded-2xl text-slate-400 hover:text-amber-400 border border-white/10 transition-colors shadow-lg shadow-black/50"><Download size={18}/></button>
                                    )}
                                    {userRole === 'admin' && (
                                       <>
                                          <button onClick={(e) => { e.stopPropagation(); handleRename(file.id, file.name); }} className="p-4 bg-slate-800 rounded-2xl text-slate-400 hover:text-amber-400 border border-white/10 transition-colors shadow-lg shadow-black/50"><Edit2 size={18}/></button>
                                          <button onClick={(e) => { e.stopPropagation(); handleDelete(file.id, file.name); }} className="p-4 bg-slate-800 rounded-2xl text-slate-400 hover:text-red-400 border border-white/10 transition-colors shadow-lg shadow-black/50"><Trash2 size={18}/></button>
                                       </>
                                    )}
                                 </div>
                              </div>
                              <div>
                                 <h4 className="font-black text-white truncate text-lg uppercase tracking-tighter leading-tight group-hover:text-amber-300 transition-colors">{file.name}</h4>
                                 <div className="flex items-center gap-3 mt-5">
                                    <span className={`text-[9px] font-black uppercase tracking-[0.2em] py-1.5 px-4 rounded-full border shadow-inner ${file.mimeType.includes('folder') ? 'border-amber-500/30 text-amber-500 bg-amber-500/10' : 'border-white/10 text-slate-500 bg-white/5'}`}>
                                       {file.mimeType.includes('folder') ? 'DIRECTORY' : 'DATA OBJECT'}
                                    </span>
                                 </div>
                              </div>
                           </div>
                        ))}
                      </div>
                   ) : (
                      <div className="bg-white/5 rounded-[45px] border border-white/5 overflow-hidden transform-gpu shadow-2xl">
                         <div className="grid grid-cols-12 p-8 border-b border-white/10 text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 bg-white/[0.02]">
                            <div className="col-span-6 pl-4">Object Identity</div>
                            <div className="col-span-3">Registry Type</div>
                            <div className="col-span-3 text-right pr-6">Vault Actions</div>
                         </div>
                         {filteredFilesMain.map(file => (
                            <div 
                               key={file.id} 
                               onClick={() => file.mimeType.includes('folder') ? navigateToFolder(file.id, file.name) : setSelectedFile(file)}
                               className={`grid grid-cols-12 p-6 items-center hover:bg-amber-500/5 transition-colors cursor-pointer group border-b border-white/5 last:border-0 ${selectedFile?.id === file.id ? 'bg-amber-500/10' : ''}`}
                            >
                               <div className="col-span-6 flex items-center gap-6 pl-4">
                                  <div className={`p-3 rounded-xl ${file.mimeType.includes('folder') ? 'text-amber-500 bg-amber-500/10' : 'text-slate-400 bg-white/5'}`}>
                                     {file.mimeType.includes('folder') ? <Folder size={22} fill="currentColor"/> : <FileText size={22}/>}
                                  </div>
                                  <span className="text-sm font-bold text-slate-200 group-hover:text-amber-300 truncate uppercase tracking-tighter transition-colors">{file.name}</span>
                               </div>
                               <div className="col-span-3 text-[10px] font-black text-slate-500 uppercase tracking-widest italic">
                                  {file.mimeType.includes('folder') ? 'Folder Node' : 'Encrypted File'}
                               </div>
                               <div className="col-span-3 flex justify-end gap-3 pr-6">
                                  <button onClick={(e) => { e.stopPropagation(); setSelectedFile(file); }} className="p-3 bg-white/5 rounded-2xl text-slate-500 hover:text-amber-400 border border-white/10 transition-all"><Info size={18}/></button>
                                  {userRole === 'admin' && (
                                     <>
                                        <button onClick={(e) => { e.stopPropagation(); handleRename(file.id, file.name); }} className="p-3 bg-white/5 rounded-2xl text-slate-500 hover:text-amber-400 border border-white/10 transition-all"><Edit2 size={18}/></button>
                                        <button onClick={(e) => { e.stopPropagation(); handleDelete(file.id, file.name); }} className="p-3 bg-white/5 rounded-2xl text-slate-500 hover:text-red-400 border border-white/10 transition-all"><Trash2 size={18}/></button>
                                     </>
                                  )}
                               </div>
                            </div>
                         ))}
                      </div>
                   )}
                </section>
              </div>
            )}
          </div>

          <div className="p-6 px-12 bg-slate-900/60 backdrop-blur-md border-t border-white/5 flex items-center justify-between text-[10px] font-black uppercase text-slate-500 tracking-[0.4em]">
             <div className="flex gap-10">
                <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-ping"></div> CTRL + K Search</span>
                <span className="flex items-center gap-2">ESC Reset View</span>
             </div>
             <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-emerald-500 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
                End-to-End Encryption Active
             </div>
          </div>
        </main>

        {/* LOG MODAL */}
        <AnimatePresence>
          {isLogModalOpen && (
            <div className="fixed inset-0 z-[200] flex items-start justify-center pt-24 p-6 bg-[#0f172a]/95 backdrop-blur-md" onClick={() => setIsLogModalOpen(false)}>
              <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="bg-slate-900 border border-amber-500/20 w-full max-w-5xl rounded-[60px] shadow-[0_30px_100px_rgba(0,0,0,0.8)] overflow-hidden" onClick={e => e.stopPropagation()}>
                <div className="p-12 border-b border-white/10 flex justify-between items-center bg-white/[0.02]">
                  <h3 className="text-2xl font-black uppercase tracking-tighter text-white flex items-center gap-5 italic leading-none"><Coins className="text-amber-500" size={32} /> Operational Transactions</h3>
                  <button onClick={() => setIsLogModalOpen(false)} className="p-4 hover:bg-red-500/10 text-slate-500 hover:text-red-500 transition-all border border-white/10 rounded-full"><X size={28}/></button>
                </div>
                <div className="overflow-x-auto max-h-[60vh] p-8 scrollbar-hide">
                  <table className="w-full text-left border-collapse min-w-[800px]">
                    <thead className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-600 sticky top-0 bg-slate-900 z-10 border-b border-white/5">
                      <tr><th className="p-6">Actor</th><th className="p-6">Command</th><th className="p-6">Target Object</th><th className="p-6">Timestamp</th></tr>
                    </thead>
                    <tbody className="text-[11px] font-bold">
                      {activityLogs.map((log) => (
                        <tr key={log.id} className="border-b border-white/5 text-slate-400 hover:bg-amber-500/5 transition-colors">
                          <td className="p-6 text-amber-500/80">{log.user}</td>
                          <td className="p-6"><span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase border shadow-inner ${log.action === 'DELETE' ? 'border-red-500/50 text-red-400 bg-red-500/5' : log.action === 'UPLOAD' ? 'border-emerald-500/50 text-emerald-400 bg-emerald-500/5' : 'border-amber-500/50 text-amber-400 bg-amber-500/5'}`}>{log.action}</span></td>
                          <td className="p-6 max-w-[250px] truncate opacity-70 italic font-mono tracking-tighter">{log.fileName}</td>
                          <td className="p-6 text-[10px] opacity-40 uppercase tracking-widest">{log.timestamp}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* UPLOAD MODAL */}
        <AnimatePresence>
          {isUploadModalOpen && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-[#0f172a]/95 backdrop-blur-md">
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-slate-900 rounded-[70px] p-16 w-full max-w-xl relative border border-amber-500/20 shadow-[0_40px_100px_rgba(0,0,0,0.6)]">
                <button onClick={() => setIsUploadModalOpen(false)} className="absolute right-12 top-12 text-slate-600 hover:text-amber-400 transition-all"><X size={32}/></button>
                <div className="text-center mb-12">
                   <h3 className="text-4xl font-black text-white uppercase tracking-tighter italic leading-none">Record <span className="text-amber-500">Submission</span></h3>
                   <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.6em] mt-4 italic opacity-60">High-Security Authority Active</p>
                </div>
                {uploadStatus === 'idle' ? (
                  <div className="space-y-10">
                    <select value={uploadDestinationId} onChange={(e) => setUploadDestinationId(e.target.value)} className="w-full p-6 rounded-3xl bg-white/5 border border-white/10 outline-none font-black text-[11px] text-slate-400 cursor-pointer focus:border-amber-500 transition-all uppercase tracking-[0.2em] shadow-inner">
                      <option value="">🏠 CENTRAL ARCHIVE CORE</option>
                      {allFolders.map(f => (<option key={f.id} value={f.id} className="bg-slate-900 text-white">📁 {f.name.toUpperCase()}</option>))}
                    </select>
                    <label className="flex flex-col items-center justify-center w-full h-80 border-2 border-dashed border-amber-500/20 rounded-[50px] cursor-pointer hover:bg-amber-500/5 transition-all text-center p-8 relative overflow-hidden group shadow-inner">
                      {uploading ? (
                        <div className="w-full px-10">
                          <Loader2 className="animate-spin mx-auto text-amber-500 mb-8" size={60} />
                          <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden mb-6 shadow-inner">
                             <motion.div initial={{ width: 0 }} animate={{ width: `${uploadProgress}%` }} className="h-full bg-gradient-to-r from-amber-600 to-amber-300 shadow-[0_0_20px_rgba(245,158,11,0.5)]" />
                          </div>
                          <p className="text-[11px] font-black uppercase text-amber-400 tracking-[0.5em] animate-pulse">{uploadProgress}% AUTHENTICATING...</p>
                        </div>
                      ) : (
                        <>
                          <div className="p-8 bg-amber-500 rounded-[30px] text-slate-950 mb-8 shadow-[0_15px_40px_rgba(245,158,11,0.4)] group-hover:scale-110 transition-all duration-500 transform-gpu"><Upload size={40} strokeWidth={3}/></div>
                          <p className="text-xl font-black text-white uppercase tracking-tighter italic">Upload Intelligence Data</p>
                          <p className="text-[10px] text-slate-500 font-bold uppercase mt-2 opacity-50">Drag & Drop or Click to Select</p>
                          <input type="file" multiple className="hidden" onChange={handleUpload} disabled={uploading} />
                        </>
                      )}
                    </label>
                  </div>
                ) : (
                  <div className="text-center py-20">
                    {uploadStatus === 'success' ? (
                      <motion.div initial={{ scale: 0.5 }} animate={{ scale: 1 }}>
                        <ShieldCheck size={120} className="text-amber-500 mx-auto mb-8 shadow-amber-500/20" />
                        <h3 className="text-3xl font-black text-white uppercase tracking-tighter italic">Ledger <span className="text-amber-500">Secured</span></h3>
                      </motion.div>
                    ) : (
                      <motion.div initial={{ scale: 0.5 }} animate={{ scale: 1 }}>
                        <AlertCircle size={120} className="text-red-500 mx-auto mb-8" />
                        <h3 className="text-3xl font-black text-white uppercase tracking-tighter">Authority Denied</h3>
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
            <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 30, stiffness: 200 }} className="w-[850px] bg-slate-900/95 backdrop-blur-2xl shadow-[-50px_0_100px_rgba(0,0,0,0.5)] border-l border-amber-500/10 flex flex-col overflow-hidden relative z-[100] transform-gpu">
               <div className="p-12 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                  <div className="flex items-center gap-8 min-w-0">
                    <div className="p-5 bg-amber-500/10 rounded-3xl text-amber-500 border border-amber-500/20 shadow-2xl"><FileText size={32}/></div>
                    <div className="min-w-0">
                      <span className="text-[10px] font-black uppercase tracking-[0.5em] text-amber-500/60 block mb-2 italic">Official Intelligence Stream</span>
                      <h4 className="font-black text-xl truncate uppercase tracking-tighter text-white block leading-none italic">{selectedFile.name}</h4>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                     <button onClick={() => { addOnlineLog("DOWNLOAD", selectedFile.name); window.open(`https://drive.google.com/uc?export=download&id=${selectedFile.id}`, '_blank'); }} className="p-5 bg-amber-500 rounded-[25px] text-slate-950 hover:bg-amber-400 transition-all shadow-2xl shadow-amber-500/20"><Download size={26}/></button>
                     <button onClick={() => { setSelectedFile(null); setPreviewLoading(true); }} className="p-5 text-slate-500 hover:text-red-400 bg-white/5 rounded-[25px] border border-white/10 transition-all shadow-xl"><X size={26}/></button>
                  </div>
               </div>
               
               <div className="flex-1 relative m-10 bg-[#0a0f1a] rounded-[60px] overflow-hidden border border-white/10 transform-gpu shadow-[inset_0_0_50px_rgba(0,0,0,0.8)]">
                  {previewLoading && (
                    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-slate-900/90 backdrop-blur-sm">
                      <Loader2 className="animate-spin text-amber-500 mb-8" size={56} />
                      <p className="text-[11px] font-black uppercase tracking-[0.5em] text-amber-500/40 animate-pulse italic">Visualizing Encrypted Node...</p>
                    </div>
                  )}
                  <iframe 
                    src={`https://drive.google.com/file/d/${selectedFile.id}/preview`} 
                    className="w-full h-full border-0 transition-opacity duration-1000" 
                    title="Vault Sync"
                    style={{ opacity: previewLoading ? 0 : 1 }}
                    onLoad={() => setPreviewLoading(false)}
                  />
               </div>

               <div className="p-10 px-14 bg-white/[0.02] backdrop-blur-md border-t border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-4 text-slate-500 text-[11px] font-black uppercase tracking-[0.3em] italic">
                     <Clock size={18} className="text-amber-500/50" /> Synchronization: Real-Time
                  </div>
                  <button onClick={() => { addOnlineLog("DOWNLOAD", selectedFile.name); window.open(`https://drive.google.com/uc?export=download&id=${selectedFile.id}`, '_blank'); }} className="px-12 py-7 bg-white/5 text-amber-500 rounded-[30px] font-black text-[12px] uppercase tracking-[0.6em] flex items-center gap-5 hover:bg-amber-500 hover:text-slate-950 transition-all border border-amber-500/30 shadow-2xl active:scale-95">
                    <Download size={22} strokeWidth={4}/> Authorize Node Retrieval
                  </button>
               </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* SEARCH MODAL */}
        <AnimatePresence>
          {isSearchModalOpen && (
            <div className="fixed inset-0 z-[200] flex items-start justify-center pt-32 px-4 bg-[#0f172a]/95 backdrop-blur-xl" onClick={() => setIsSearchModalOpen(false)}>
              <motion.div initial={{ scale: 0.95, y: -20 }} animate={{ scale: 1, y: 0 }} className="bg-slate-900 border border-amber-500/30 w-full max-w-2xl rounded-[50px] shadow-[0_40px_100px_rgba(0,0,0,0.8)] overflow-hidden" onClick={e => e.stopPropagation()}>
                <div className="p-10 flex items-center gap-8 border-b border-white/10 bg-white/[0.02]">
                  <Search className="text-amber-500" size={32} />
                  <input autoFocus type="text" placeholder="Scanning Archive Registry..." className="flex-1 bg-transparent outline-none font-black text-2xl text-white uppercase tracking-tighter italic placeholder:text-slate-700" onChange={(e) => handleGlobalSearch(e.target.value)} />
                  {searchLoading && <Loader2 className="animate-spin text-amber-500" size={24} />}
                  <div className="p-3 px-6 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black text-slate-500 uppercase tracking-widest shadow-inner">ESC</div>
                </div>
                <div className="max-h-[500px] overflow-y-auto p-8 space-y-3 scrollbar-hide transform-gpu">
                  {searchTerm.length >= 2 ? (
                    <>{searchResults.length > 0 ? (searchResults.map(f => (
                      <div key={f.id} onClick={() => { if(f.mimeType.includes('folder')) navigateToFolder(f.id, f.name); else setSelectedFile(f); setIsSearchModalOpen(false); }} className="p-6 hover:bg-amber-500 hover:text-slate-950 rounded-[30px] cursor-pointer flex items-center justify-between group transition-all text-slate-400 border border-transparent hover:border-amber-400/40 shadow-xl">
                        <div className="flex items-center gap-6 tracking-tighter italic min-w-0">
                          {f.mimeType.includes('folder') ? <Folder size={22} className="shrink-0 text-amber-500/60 group-hover:text-slate-900"/> : <FileText size={22} className="shrink-0 group-hover:text-slate-900"/>}
                          <div className="truncate">
                            <span className="block font-black uppercase text-sm group-hover:text-slate-950 transition-colors">{f.name}</span>
                            <span className="text-[8px] font-black opacity-30 uppercase tracking-[0.3em] mt-1 block">Registry Node 0x{f.id.substring(0,4)}</span>
                          </div>
                        </div>
                        <ChevronRight size={20} className="opacity-0 group-hover:opacity-100 group-hover:translate-x-3 transition-all shrink-0" />
                      </div>
                    ))) : !searchLoading && (<div className="p-16 text-center opacity-30 text-[11px] font-black uppercase tracking-[0.8em] italic">No Match Found in Vault</div>)}</>
                  ) : (<div className="p-16 text-center opacity-30 text-[11px] font-black uppercase tracking-[0.8em] italic">Initialize Registry Scan...</div>)}
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}