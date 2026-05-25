"use client"
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Folder, FileText, Upload, Lock, Database, LayoutDashboard, 
  Search, LogOut, ChevronRight, Loader2, Edit2, Plus, X, 
  Download, ArrowLeft, Sun, Moon, Shield, 
  CheckCircle2, AlertCircle, Filter, History, User,
  Crown, Zap, ShieldCheck, Star, Trash2, Sparkles, Cpu
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
  // --- STATES ---
  const [mounted, setMounted] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<'admin' | 'user' | null>(null);
  const [userName, setUserName] = useState<string>('');
  const [password, setPassword] = useState('');
  const [tempName, setTempName] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(true);

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

  // --- LOGIC: FETCH ONLINE LOGS ---
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

  // --- INITIALIZATION ---
  useEffect(() => {
    setMounted(true);
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') { e.preventDefault(); setIsSearchModalOpen(true); }
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

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode);
  }, [isDarkMode]);

  // --- DATA FETCHING ---
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

  // --- NAVIGATION ---
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

  // --- ACTIONS ---
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tempName.trim()) { alert("Masukkan Nama!"); return; }
    const processLogin = (role: 'admin' | 'user') => {
      setIsLoggedIn(true); setUserRole(role); setUserName(tempName);
      sessionStorage.setItem('isLoggedIn', 'true'); sessionStorage.setItem('userRole', role); sessionStorage.setItem('userName', tempName);
      addOnlineLog("LOGIN", "Masuk Sistem");
    };
    if (password === 'adminLhp3') processLogin('admin');
    else if (password === 'userLhp3') processLogin('user');
    else alert('Akses Ditolak!');
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
    const newName = prompt("Ubah nama:", oldName); if (!newName) return;
    try {
      await fetch('/api/drive', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ fileId, newName }) });
      addOnlineLog("RENAME", `${oldName} -> ${newName}`); fetchData(currentFolder);
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
        {/* Aurora Glow Effects */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/20 blur-[120px] rounded-full translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-600/20 blur-[120px] rounded-full -translate-x-1/2 translate-y-1/2"></div>
        
        {/* Background Image Base */}
        <div className="absolute inset-0 z-0 bg-cover bg-center opacity-40 scale-105" style={{ backgroundImage: "url('https://i.ibb.co.com/NnC3sn3S/bg-login.png')" }}></div>
        
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="relative z-10 bg-slate-900/60 backdrop-blur-3xl p-12 rounded-[60px] shadow-[0_0_80px_rgba(0,0,0,0.5)] w-full max-w-md border border-white/10 text-center">
          <div className="mb-10 flex justify-center">
             <div className="p-4 bg-gradient-to-br from-emerald-400 to-cyan-500 rounded-3xl shadow-[0_0_30px_rgba(52,211,153,0.3)]">
                <img src="https://i.ibb.co.com/L22pdJQ/Coat-of-arms-of-Southeast-Sulawesi-svg.png" alt="Logo" className="w-20 h-20 object-contain" />
             </div>
          </div>
          <h2 className="text-3xl font-black mb-1 text-white tracking-tighter italic uppercase">CORE <span className="text-emerald-400">ARCHIVE</span></h2>
          <p className="text-blue-400/60 mb-10 text-[9px] font-black uppercase tracking-[0.5em]">Elhp Inspection System</p>
          <form onSubmit={handleLogin} className="space-y-4">
            <input required type="text" placeholder="IDENTITY NAME" className="w-full p-5 rounded-2xl border border-white/5 outline-none bg-white/5 text-emerald-100 text-center font-bold placeholder:text-slate-600 focus:border-emerald-500/50 transition-all text-xs uppercase tracking-widest" onChange={(e) => setTempName(e.target.value)} />
            <input required type="password" placeholder="ACCESS KEY" className="w-full p-5 rounded-2xl border border-white/5 outline-none bg-white/5 text-emerald-100 text-center font-bold placeholder:text-slate-600 tracking-[0.8em] focus:border-emerald-500/50 transition-all" onChange={(e) => setPassword(e.target.value)} />
            <button type="submit" className="w-full bg-gradient-to-r from-emerald-600 via-teal-600 to-blue-600 text-white p-5 rounded-2xl font-black uppercase tracking-widest hover:shadow-[0_0_40px_rgba(16,185,129,0.3)] transition-all active:scale-95 text-xs border border-white/10">Synchronize Identity</button>
          </form>
        </motion.div>
      </div>
    );
  }

  // --- DASHBOARD VIEW ---
  return (
    <div className={isDarkMode ? "dark" : ""}>
      <div className="h-screen bg-[#020617] flex text-slate-300 overflow-hidden font-sans relative">
        
        {/* Background Layer: Your Image (Fixed & Low Opacity) */}
        <div className="absolute inset-0 z-0 bg-cover bg-center opacity-10 pointer-events-none" style={{ backgroundImage: "url('https://i.ibb.co.com/NnC3sn3S/bg-login.png')" }}></div>
        
        {/* Animated Aurora Glows */}
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-600/10 blur-[150px] rounded-full animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 blur-[150px] rounded-full animate-pulse delay-1000"></div>

        {/* SIDEBAR (Cyber Glass) */}
        <aside className="w-80 bg-slate-900/40 backdrop-blur-3xl border-r border-white/5 p-10 flex flex-col gap-10 relative z-20">
          <div className="flex flex-col items-center gap-5">
            <div className="relative group">
              <div className="absolute inset-0 bg-emerald-500/20 blur-xl rounded-full scale-0 group-hover:scale-100 transition-all duration-700"></div>
              <div className="w-20 h-20 bg-slate-800 rounded-3xl p-3 border border-white/10 shadow-2xl flex items-center justify-center relative z-10">
                 <img src="https://i.ibb.co.com/L22pdJQ/Coat-of-arms-of-Southeast-Sulawesi-svg.png" alt="Logo" className="w-full h-full object-contain" />
              </div>
            </div>
            <div className="text-center">
              <h1 className="font-black text-2xl tracking-tighter text-white italic uppercase leading-none">ARV<span className="text-emerald-400">DRIV3</span></h1>
              <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 rounded-full border border-emerald-500/20">
                 <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></div>
                 <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">{userName}</span>
              </div>
            </div>
          </div>
          
          <nav className="flex-1 space-y-3 font-black text-[10px] uppercase tracking-widest">
            <button onClick={goHome} className={`w-full flex items-center gap-4 p-5 rounded-[25px] transition-all group ${!currentFolder ? 'bg-gradient-to-r from-emerald-600 to-blue-600 text-white shadow-[0_10px_30px_rgba(16,185,129,0.3)]' : 'hover:bg-white/5 text-slate-500'}`}>
              <LayoutDashboard size={18} className="group-hover:rotate-6 transition-transform"/> Dashboard
            </button>
            <div className="pt-6 pb-2 px-4 text-[8px] text-slate-600 font-black tracking-[0.4em]">Resource Nodes</div>
            <button onClick={() => setFilterType('all')} className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all ${filterType === 'all' ? 'text-emerald-400 bg-emerald-500/5' : 'text-slate-500 hover:text-slate-300'}`}><Zap size={16}/> Matrix</button>
            <button onClick={() => setFilterType('folder')} className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all ${filterType === 'folder' ? 'text-emerald-400 bg-emerald-500/5' : 'text-slate-500 hover:text-slate-300'}`}><Folder size={16}/> Directories</button>
            <button onClick={() => setFilterType('file')} className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all ${filterType === 'file' ? 'text-emerald-400 bg-emerald-500/5' : 'text-slate-500 hover:text-slate-300'}`}><FileText size={16}/> Archives</button>
            <button onClick={() => setIsLogModalOpen(true)} className="w-full flex items-center gap-4 p-4 text-slate-500 hover:bg-white/5 rounded-2xl transition-all mt-4">
              <History size={18}/> Access Logs
            </button>
          </nav>

          {/* Premium Card Stats */}
          <div className="p-8 bg-gradient-to-br from-slate-900/80 to-slate-800/80 backdrop-blur-2xl rounded-[40px] text-white shadow-2xl relative overflow-hidden group border border-white/5">
             <div className="relative z-10">
               <p className="text-[10px] font-black uppercase opacity-40 mb-2 tracking-[0.2em]">Storage Load</p>
               <h4 className="text-4xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-blue-400">{stats.total}</h4>
               <div className="mt-4 flex items-center gap-2">
                  <div className="h-1 flex-1 bg-white/5 rounded-full overflow-hidden">
                     <motion.div initial={{ width: 0 }} animate={{ width: '80%' }} className="h-full bg-gradient-to-r from-emerald-400 to-blue-500"></motion.div>
                  </div>
                  <Sparkles size={12} className="text-emerald-400 opacity-50 animate-bounce" />
               </div>
             </div>
             <Database className="absolute -right-8 -bottom-8 opacity-[0.03] group-hover:rotate-12 transition-all duration-1000" size={150}/>
          </div>
          
          <button onClick={() => {sessionStorage.clear(); window.location.reload();}} className="flex items-center justify-center gap-3 p-5 bg-red-500/5 text-red-500 font-black uppercase text-[10px] tracking-widest rounded-2xl hover:bg-red-500 hover:text-white transition-all border border-red-500/10">Sign Out System</button>
        </aside>

        {/* MAIN AREA */}
        <main className="flex-1 flex flex-col min-w-0 transition-colors relative z-10">
          <header className="p-10 flex justify-between items-center bg-slate-900/20 backdrop-blur-xl border-b border-white/5">
            <div className="flex items-center gap-6">
              <AnimatePresence>
                {folderHistory.length > 0 && (
                  <motion.button initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} onClick={goBackOneLevel} className="p-4 bg-slate-800 rounded-2xl shadow-xl border border-white/5 text-emerald-400 hover:bg-emerald-500 hover:text-white transition-all">
                    <ArrowLeft size={20} strokeWidth={3}/>
                  </motion.button>
                )}
              </AnimatePresence>
              <div>
                <h1 className="text-3xl font-black text-white tracking-tighter uppercase italic leading-none">Cyber <span className="text-emerald-400">Vault</span></h1>
                <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 mt-2 uppercase tracking-widest leading-none">
                  <span className="hover:text-emerald-400 cursor-pointer transition-colors" onClick={goHome}>CENTRAL REPOSITORY</span>
                  {folderHistory.map((h, i) => (
                    <React.Fragment key={h.id + i}>
                      <ChevronRight size={10} className="text-slate-700"/> 
                      <span className={i === folderHistory.length -1 ? "text-emerald-400 font-black" : ""}>{h.name}</span>
                    </React.Fragment>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-5 flex-1 max-w-xl px-12">
              <div className="flex-1 relative group cursor-pointer" onClick={() => setIsSearchModalOpen(true)}>
                <Search size={20} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-600 group-hover:text-emerald-400 transition-colors" />
                <div className="w-full pl-16 pr-6 py-5 bg-white/5 border border-white/5 rounded-[25px] text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] shadow-inner transition-all group-hover:border-emerald-500/30">System Scan...</div>
              </div>
              <button onClick={() => setIsDarkMode(!isDarkMode)} className="p-5 bg-white/5 border border-white/5 rounded-[22px] text-slate-500 hover:scale-110 transition-all hover:text-emerald-400">
                {isDarkMode ? <Sun size={20}/> : <Moon size={20}/>}
              </button>
            </div>

            {userRole === 'admin' && (
              <button onClick={() => {setUploadDestinationId(currentFolder); setIsUploadModalOpen(true);}} className="flex items-center gap-4 bg-white text-slate-900 px-10 py-5 rounded-[22px] font-black uppercase text-[10px] tracking-widest shadow-[0_15px_40px_rgba(255,255,255,0.1)] hover:translate-y-[-3px] transition-all">
                <Plus size={18} strokeWidth={4} /> New Record
              </button>
            )}
          </header>

          <div className="flex-1 overflow-y-auto p-12 scrollbar-hide">
            {loading ? (
              <div className="h-full flex flex-col items-center justify-center gap-6">
                <Loader2 className="animate-spin text-emerald-500" size={50} />
                <p className="font-black text-[10px] uppercase tracking-[0.5em] text-slate-500 animate-pulse">Mapping Data Nodes...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-10 pb-20">
                {filteredFiles.map((file) => (
                  <motion.div 
                    key={file.id} 
                    whileHover={{ y: -10, scale: 1.02 }}
                    className={`relative group bg-slate-900/40 backdrop-blur-3xl p-8 rounded-[45px] border transition-all cursor-pointer h-72 flex flex-col justify-between ${selectedFile?.id === file.id ? 'border-emerald-500 ring-4 ring-emerald-500/10 shadow-2xl' : 'border-white/5 shadow-2xl hover:border-emerald-500/30'}`}
                    onClick={() => file.mimeType.includes('folder') ? navigateToFolder(file.id, file.name) : setSelectedFile(file)}
                  >
                    <div className="flex justify-between items-start">
                      <div className={`p-5 rounded-[25px] shadow-2xl transition-all duration-500 group-hover:scale-110 ${file.mimeType.includes('folder') ? 'bg-emerald-500/10 text-emerald-400' : 'bg-blue-500/10 text-blue-400'}`}>
                        {file.mimeType.includes('folder') ? <Folder size={32} fill="currentColor" /> : <FileText size={32} />}
                      </div>
                      <div className="flex flex-col gap-3 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                        {!file.mimeType.includes('folder') && (
                          <button onClick={(e) => { e.stopPropagation(); addOnlineLog("DOWNLOAD", file.name); window.open(`https://drive.google.com/uc?export=download&id=${file.id}`, '_blank'); }} className="p-3 bg-slate-800 rounded-xl text-slate-400 hover:text-emerald-400 shadow-xl border border-white/5"><Download size={18}/></button>
                        )}
                        {userRole === 'admin' && (
                          <>
                            <button onClick={(e) => { e.stopPropagation(); handleRename(file.id, file.name); }} className="p-3 bg-slate-800 rounded-xl text-slate-400 hover:text-blue-400 shadow-xl border border-white/5"><Edit2 size={18}/></button>
                            <button onClick={(e) => { e.stopPropagation(); handleDelete(file.id, file.name); }} className="p-3 bg-slate-800 rounded-xl text-slate-400 hover:text-red-400 shadow-xl border border-white/5"><Trash2 size={18}/></button>
                          </>
                        )}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-black text-white truncate text-lg uppercase tracking-tighter leading-tight group-hover:text-emerald-400 transition-colors">{file.name}</h4>
                      <div className="flex items-center gap-3 mt-4">
                         <span className={`text-[8px] font-black uppercase tracking-widest py-1.5 px-4 rounded-full inline-block ${file.mimeType.includes('folder') ? 'bg-emerald-500/10 text-emerald-400' : 'bg-blue-500/10 text-blue-400'}`}>
                           {file.mimeType.includes('folder') ? 'DIRECTORY' : 'DATA OBJECT'}
                         </span>
                         <Cpu size={12} className="text-slate-700" />
                      </div>
                    </div>
                    {/* Hover Pulse */}
                    <div className="absolute top-5 right-5 w-1.5 h-1.5 bg-emerald-500 rounded-full opacity-0 group-hover:opacity-100 animate-ping"></div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </main>

        {/* LOG MODAL TABLE (ONLINE CYBER) */}
        <AnimatePresence>
          {isLogModalOpen && (
            <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-slate-950/90 backdrop-blur-2xl" onClick={() => {setIsLogModalOpen(false); fetchOnlineLogs();}}>
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-slate-900 border border-emerald-500/20 w-full max-w-5xl rounded-[50px] shadow-[0_0_100px_rgba(16,185,129,0.1)] overflow-hidden" onClick={e => e.stopPropagation()}>
                <div className="p-10 border-b border-white/5 flex justify-between items-center bg-slate-900/50 backdrop-blur-xl">
                  <h3 className="text-2xl font-black uppercase tracking-tighter text-white flex items-center gap-4"><History className="text-emerald-400 animate-spin-slow" /> Terminal Ledger</h3>
                  <div className="flex items-center gap-6">
                    {logsLoading && <Loader2 className="animate-spin text-emerald-400" size={20}/>}
                    <button onClick={() => {setIsLogModalOpen(false); fetchOnlineLogs();}} className="p-3 hover:bg-red-500/10 text-slate-500 hover:text-red-500 rounded-full transition-all border border-white/5"><X size={24}/></button>
                  </div>
                </div>
                <div className="overflow-x-auto max-h-[65vh] p-6">
                  <table className="w-full text-left border-collapse min-w-[800px]">
                    <thead className="text-[9px] font-black uppercase tracking-[0.4em] text-slate-500 sticky top-0 bg-slate-900 z-10">
                      <tr>
                        <th className="p-6 border-b border-white/5">Subject</th>
                        <th className="p-6 border-b border-white/5">Operation</th>
                        <th className="p-6 border-b border-white/5">Resource</th>
                        <th className="p-6 border-b border-white/5">Node</th>
                        <th className="p-6 border-b border-white/5">Timestamp</th>
                      </tr>
                    </thead>
                    <tbody className="text-[11px] font-bold">
                      {activityLogs.map((log) => (
                        <tr key={log.id} className="border-b border-white/5 text-slate-400 hover:bg-emerald-500/5 transition-colors group">
                          <td className="p-6 text-emerald-400/80 group-hover:text-emerald-400">{log.user}</td>
                          <td className="p-6">
                            <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase border ${log.action === 'DELETE' ? 'border-red-500/50 text-red-400 bg-red-500/5' : log.action === 'UPLOAD' ? 'border-emerald-500/50 text-emerald-400 bg-emerald-500/5' : 'border-blue-500/50 text-blue-400 bg-blue-500/5'}`}>
                              {log.action}
                            </span>
                          </td>
                          <td className="p-6 max-w-[200px] truncate opacity-70 italic font-mono">{log.fileName}</td>
                          <td className="p-6 opacity-30 text-[9px] uppercase tracking-widest">{log.device}</td>
                          <td className="p-6 text-[10px] opacity-30">{log.timestamp}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {activityLogs.length === 0 && !logsLoading && <p className="p-20 text-center text-slate-700 uppercase tracking-widest text-xs font-black italic">System ledger empty...</p>}
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* UPLOAD MODAL (CYBER) */}
        <AnimatePresence>
          {isUploadModalOpen && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/90 backdrop-blur-2xl">
              <motion.div initial={{ scale: 0.8, y: 50 }} animate={{ scale: 1, y: 0 }} className="bg-slate-900 rounded-[60px] p-16 w-full max-w-2xl relative border border-emerald-500/10 shadow-2xl">
                <button onClick={() => setIsUploadModalOpen(false)} className="absolute right-12 top-12 text-slate-600 hover:text-emerald-400 transition-all"><X size={32}/></button>
                <div className="text-center mb-12">
                   <h3 className="text-4xl font-black text-white uppercase tracking-tighter italic">Data <span className="text-emerald-400">Transmission</span></h3>
                   <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.6em] mt-3">High-Frequency Encryption Active</p>
                </div>
                {uploadStatus === 'idle' ? (
                  <div className="space-y-10">
                    <select value={uploadDestinationId} onChange={(e) => setUploadDestinationId(e.target.value)} className="w-full p-6 rounded-2xl bg-white/5 border border-white/5 outline-none font-black text-[11px] text-slate-400 cursor-pointer focus:border-emerald-500 transition-all uppercase tracking-widest">
                      <option value="">🏠 Root Domain</option>
                      {allFolders.map(f => (<option key={f.id} value={f.id} className="bg-slate-900 text-white">📁 {f.name.toUpperCase()}</option>))}
                    </select>
                    <label className="flex flex-col items-center justify-center w-full h-80 border-2 border-dashed border-white/10 rounded-[50px] cursor-pointer hover:bg-emerald-500/5 transition-all text-center p-8 group relative overflow-hidden">
                      {uploading ? (
                        <div className="w-full text-center px-10">
                          <Loader2 className="animate-spin mx-auto text-emerald-400 mb-8" size={60} />
                          <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden mb-5">
                             <motion.div initial={{ width: 0 }} animate={{ width: `${uploadProgress}%` }} className="h-full bg-gradient-to-r from-emerald-400 to-blue-500 shadow-[0_0_20px_rgba(16,185,129,0.5)]" />
                          </div>
                          <p className="text-[10px] font-black uppercase text-emerald-400 tracking-[0.5em]">{uploadProgress}% UPLOADING...</p>
                        </div>
                      ) : (
                        <>
                          <div className="absolute inset-0 bg-emerald-500 opacity-0 group-hover:opacity-[0.03] transition-all"></div>
                          <div className="p-8 bg-emerald-600 rounded-[30px] text-white mb-8 shadow-[0_15px_40px_rgba(16,185,129,0.3)] group-hover:scale-110 group-hover:rotate-3 transition-all duration-500"><Upload size={40} strokeWidth={3}/></div>
                          <p className="text-xl font-black text-white uppercase tracking-tighter">Initialize Link</p>
                          <input type="file" multiple className="hidden" onChange={handleUpload} disabled={uploading} />
                        </>
                      )}
                    </label>
                  </div>
                ) : (
                  <div className="text-center py-20">
                    {uploadStatus === 'success' ? (
                      <motion.div initial={{ scale: 0.5 }} animate={{ scale: 1 }}>
                        <ShieldCheck size={100} className="text-emerald-400 mx-auto mb-8 animate-pulse" />
                        <h3 className="text-3xl font-black text-white uppercase tracking-tighter italic">Transfer <span className="text-emerald-400">Verified</span></h3>
                      </motion.div>
                    ) : (
                      <motion.div initial={{ scale: 0.5 }} animate={{ scale: 1 }}>
                        <AlertCircle size={100} className="text-red-500 mx-auto mb-8" />
                        <h3 className="text-3xl font-black text-white uppercase tracking-tighter">Auth Link Error</h3>
                      </motion.div>
                    )}
                  </div>
                )}
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* PREVIEW PANEL (CYBER GLASS) */}
        <AnimatePresence>
          {selectedFile && (
            <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }} className="w-[750px] bg-slate-900/80 backdrop-blur-3xl shadow-[-50px_0_100px_rgba(0,0,0,0.5)] border-l border-white/10 flex flex-col overflow-hidden relative z-30">
               <div className="p-10 border-b border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-6 overflow-hidden">
                    <div className="p-4 bg-emerald-500/10 rounded-2xl text-emerald-400 shadow-2xl border border-emerald-500/20"><FileText size={28}/></div>
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-500 block mb-1">Decrypted Stream</span>
                      <span className="font-black text-lg truncate uppercase tracking-tighter text-white block leading-none">{selectedFile.name}</span>
                    </div>
                  </div>
                  <button onClick={() => { setSelectedFile(null); setPreviewLoading(true); }} className="p-4 text-slate-500 hover:text-red-400 transition-all bg-white/5 rounded-2xl border border-white/5"><X size={28}/></button>
               </div>
               
               <div className="flex-1 relative m-10">
                  {previewLoading && (
                    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-slate-950/80 rounded-[50px] border border-emerald-500/10">
                      <Loader2 className="animate-spin text-emerald-400 mb-6" size={48} />
                      <p className="text-[10px] font-black uppercase tracking-[0.5em] text-emerald-400/40 italic">Syncing Visualizing Node...</p>
                    </div>
                  )}
                  <iframe 
                    src={`https://drive.google.com/file/d/${selectedFile.id}/preview`} 
                    className="w-full h-full rounded-[50px] overflow-hidden bg-slate-950 border border-white/5 shadow-2xl transition-all duration-1000" 
                    title="Live Sync"
                    style={{ opacity: previewLoading ? 0 : 1 }}
                    onLoad={() => setPreviewLoading(false)}
                  />
               </div>

               <div className="p-10 bg-slate-900/50 backdrop-blur-xl border-t border-white/5">
                 <button onClick={() => { addOnlineLog("DOWNLOAD", selectedFile.name); window.open(`https://drive.google.com/uc?export=download&id=${selectedFile.id}`, '_blank'); }} className="w-full py-7 bg-white text-slate-900 rounded-[30px] font-black text-[11px] uppercase tracking-[0.6em] flex items-center justify-center gap-4 hover:shadow-[0_0_40px_rgba(255,255,255,0.2)] hover:scale-[1.02] active:scale-95 transition-all shadow-xl">
                   <Download size={22} strokeWidth={4}/> Authorize Retrieval
                 </button>
               </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* SEARCH SPOTLIGHT */}
        <AnimatePresence>
          {isSearchModalOpen && (
            <div className="fixed inset-0 z-[200] flex items-start justify-center pt-32 px-4 bg-slate-950/80 backdrop-blur-xl" onClick={() => setIsSearchModalOpen(false)}>
              <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className="bg-slate-900/90 border border-emerald-500/20 w-full max-w-2xl rounded-[35px] shadow-2xl overflow-hidden backdrop-blur-2xl" onClick={e => e.stopPropagation()}>
                <div className="p-8 flex items-center gap-6 border-b border-white/5">
                  <Search className="text-emerald-400" size={28} />
                  <input autoFocus type="text" placeholder="Intelligence Node Search..." className="flex-1 bg-transparent outline-none font-black text-xl text-white uppercase tracking-tighter" onChange={(e) => setSearchTerm(e.target.value)} />
                  <div className="p-2 px-4 bg-white/5 border border-white/5 rounded-xl text-[9px] font-black text-slate-500 uppercase">ESC</div>
                </div>
                <div className="max-h-[400px] overflow-y-auto p-6 space-y-2 scrollbar-hide text-[11px] font-black uppercase">
                  {files.filter(f => f.name.toLowerCase().includes(searchTerm.toLowerCase())).map(f => (
                    <div key={f.id} onClick={() => { if(f.mimeType.includes('folder')) navigateToFolder(f.id, f.name); else setSelectedFile(f); setIsSearchModalOpen(false); }} className="p-5 hover:bg-emerald-500 hover:text-slate-900 rounded-2xl cursor-pointer flex items-center justify-between group transition-all text-slate-400">
                      <div className="flex items-center gap-5">{f.mimeType.includes('folder') ? <Folder size={20}/> : <FileText size={20}/>}<span>{f.name}</span></div>
                      <ChevronRight size={16} className="opacity-0 group-hover:opacity-100 group-hover:translate-x-2 transition-all" />
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}