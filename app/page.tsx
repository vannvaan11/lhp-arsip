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
  // --- NEW STATE UNTUK PENCARIAN GLOBAL ---
  const [globalFiles, setGlobalFiles] = useState<DriveFile[]>([]);
  const [currentFolder, setCurrentFolder] = useState<string>('');
  const [folderHistory, setFolderHistory] = useState<FolderHistory[]>([]);
  const [selectedFile, setSelectedFile] = useState<DriveFile | null>(null);
  const [allFolders, setAllFolders] = useState<DriveFile[]>([]); 
  const [stats, setStats] = useState({ total: 0 });
  const [loading, setLoading] = useState(true);
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

  // --- LOGIC: FETCH SEMUA FILE UNTUK PENCARIAN GLOBAL ---
  const fetchGlobalInventory = async () => {
    try {
      // Mengasumsikan API tanpa folderId akan mengembalikan seluruh file
      const res = await fetch(`/api/drive/all-files`);
      const data = await res.json();
      if (Array.isArray(data)) setGlobalFiles(data);
      else if (data.files) setGlobalFiles(data.files);
    } catch (e) { console.error("Global search fetch error:", e); }
  };

  useEffect(() => {
    setMounted(true);
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') { e.preventDefault(); setIsSearchModalOpen(true); }
      if (e.key === 'Escape') { setSelectedFile(null); setIsSearchModalOpen(false); }
    };
    window.addEventListener('keydown', handleKeyDown);
    const savedLogin = sessionStorage.getItem('isLoggedIn');
    const savedRole = sessionStorage.getItem('userRole');
    const savedName = sessionStorage.getItem('userName');
    if (savedLogin === 'true' && savedRole && savedName) {
      setIsLoggedIn(true); setUserRole(savedRole as any); setUserName(savedName); 
      fetchOnlineLogs();
      fetchGlobalInventory(); // Ambil data global saat login
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [fetchOnlineLogs]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode);
  }, [isDarkMode]);

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
      fetchGlobalInventory();
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
    setTimeout(() => { setIsUploadModalOpen(false); fetchData(currentFolder); fetchGlobalInventory(); }, 2000);
    setUploading(false);
  };

  const handleDelete = async (fileId: string, fileName: string) => {
    if (userRole !== 'admin' || !confirm(`Hapus permanen ${fileName}?`)) return;
    try {
      const res = await fetch(`/api/drive?fileId=${fileId}`, { method: 'DELETE' });
      if (res.ok) { addOnlineLog("DELETE", fileName); fetchData(currentFolder); setSelectedFile(null); fetchGlobalInventory(); }
    } catch (e) { console.error(e); }
  };

  const handleRename = async (fileId: string, oldName: string) => {
    if (userRole !== 'admin') return;
    const newName = prompt("Nama Baru:", oldName); if (!newName) return;
    try {
      await fetch('/api/drive', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ fileId, newName }) });
      addOnlineLog("RENAME", `${oldName} -> ${newName}`); fetchData(currentFolder); fetchGlobalInventory();
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

  if (!isLoggedIn) {
    return (
      <div className="relative min-h-screen w-full flex items-center justify-center p-4 bg-[#050505] font-sans overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-amber-600/5 blur-[120px] rounded-full"></div>
        <div className="absolute inset-0 z-0 bg-cover bg-center opacity-30 grayscale-[0.5]" style={{ backgroundImage: "url('https://i.ibb.co.com/NnC3sn3S/bg-login.png')" }}></div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="relative z-10 bg-slate-900/80 backdrop-blur-lg p-12 rounded-[50px] shadow-2xl w-full max-w-md border border-amber-500/20 text-center">
          <div className="mb-8 flex justify-center">
             <div className="p-5 bg-gradient-to-br from-amber-400 to-yellow-600 rounded-full shadow-xl">
                <img src="https://i.ibb.co.com/L22pdJQ/Coat-of-arms-of-Southeast-Sulawesi-svg.png" alt="Logo" className="w-20 h-20 object-contain" />
             </div>
          </div>
          <h2 className="text-4xl font-black mb-1 text-white tracking-tighter italic uppercase">ROYAL <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-200">VAULT</span></h2>
          <p className="text-amber-500/60 mb-10 text-[10px] font-black uppercase tracking-[0.6em]">Inspectorate Elite Portal</p>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="relative group">
               <User className="absolute left-5 top-1/2 -translate-y-1/2 text-amber-500/40" size={18}/>
               <input required type="text" placeholder="IDENTITAS PENGGUNA" className="w-full py-5 pl-14 pr-5 rounded-2xl border border-white/5 outline-none bg-white/5 text-amber-100 font-bold placeholder:text-slate-600 focus:border-amber-500/50 transition-all text-xs uppercase" onChange={(e) => setTempName(e.target.value)} />
            </div>
            <div className="relative group">
               <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-amber-500/40" size={18}/>
               <input required type="password" placeholder="KUNCI AKSES" className="w-full py-5 pl-14 pr-5 rounded-2xl border border-white/5 outline-none bg-white/5 text-amber-100 font-bold placeholder:text-slate-600 tracking-[0.8em] focus:border-amber-500/50 transition-all" onChange={(e) => setPassword(e.target.value)} />
            </div>
            <button type="submit" className="w-full bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-600 text-slate-950 py-5 rounded-2xl font-black uppercase tracking-widest hover:shadow-lg transition-all active:scale-95 text-xs">Verify Authority</button>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <div className={isDarkMode ? "dark" : ""}>
      <div className="h-screen bg-[#020202] flex text-slate-300 overflow-hidden font-sans relative">
        <div className="fixed inset-0 z-0 bg-cover bg-center opacity-[0.05] pointer-events-none grayscale contrast-125" style={{ backgroundImage: "url('https://i.ibb.co.com/NnC3sn3S/bg-login.png')" }}></div>

        {/* SIDEBAR */}
        <aside className="w-80 bg-slate-950/80 backdrop-blur-md border-r border-amber-500/10 p-8 flex flex-col gap-10 relative z-20 transform-gpu">
          <div className="flex flex-col items-center gap-5">
            <div className="w-20 h-20 bg-gradient-to-br from-slate-800 to-slate-900 rounded-[30px] p-3 border border-amber-500/20 shadow-xl flex items-center justify-center relative overflow-hidden">
               <img src="https://i.ibb.co.com/L22pdJQ/Coat-of-arms-of-Southeast-Sulawesi-svg.png" alt="Logo" className="w-full h-full object-contain" />
            </div>
            <div className="text-center">
              <h1 className="font-black text-2xl tracking-tighter text-white italic uppercase leading-none">ARV<span className="text-amber-500">DRIV3</span></h1>
              <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 bg-amber-500/5 rounded-lg border border-amber-500/10">
                 <Crown size={12} className="text-amber-500" />
                 <span className="text-[9px] font-black text-amber-500/80 uppercase tracking-widest truncate max-w-[120px]">{userName}</span>
              </div>
            </div>
          </div>
          
          <nav className="flex-1 space-y-2 font-black text-[10px] uppercase tracking-widest overflow-y-auto scrollbar-hide">
            <button onClick={goHome} className={`w-full flex items-center gap-4 p-5 rounded-2xl transition-all ${!currentFolder ? 'bg-gradient-to-br from-amber-500 to-yellow-600 text-slate-950 shadow-lg' : 'hover:bg-amber-500/5 text-slate-500'}`}>
              <LayoutDashboard size={18}/> Overview
            </button>
            <div className="pt-6 pb-2 px-4 text-[8px] text-amber-500/30 font-black tracking-[0.4em]">Resource Filters</div>
            <button onClick={() => setFilterType('all')} className={`w-full flex items-center gap-4 p-4 rounded-xl transition-all ${filterType === 'all' ? 'text-amber-500 bg-amber-500/5 border border-amber-500/10' : 'text-slate-500 hover:text-slate-300'}`}><LayoutGrid size={16}/> Matrix</button>
            <button onClick={() => setFilterType('folder')} className={`w-full flex items-center gap-4 p-4 rounded-xl transition-all ${filterType === 'folder' ? 'text-amber-500 bg-amber-500/5 border border-amber-500/10' : 'text-slate-500 hover:text-slate-300'}`}><Folder size={16}/> Directories</button>
            <button onClick={() => setFilterType('file')} className={`w-full flex items-center gap-4 p-4 rounded-xl transition-all ${filterType === 'file' ? 'text-amber-500 bg-amber-500/5 border border-amber-500/10' : 'text-slate-500 hover:text-slate-300'}`}><FileText size={16}/> Records</button>
            <button onClick={() => setIsLogModalOpen(true)} className="w-full flex items-center gap-4 p-4 text-slate-500 hover:bg-amber-500/5 rounded-2xl transition-all mt-4 border border-transparent hover:border-amber-500/10">
              <History size={18}/> Audit Logs
            </button>
          </nav>

          <div className="p-8 space-y-4">
             <div className="p-6 bg-slate-900/50 rounded-3xl border border-white/5">
                <p className="text-[8px] font-black uppercase text-amber-500/40 mb-2 tracking-widest italic">Ledger Status</p>
                <div className="flex items-center justify-between">
                   <h4 className="text-2xl font-black text-amber-500 leading-none">{stats.total}</h4>
                   <div className="p-2 bg-amber-500/10 rounded-lg text-amber-500"><Database size={16}/></div>
                </div>
             </div>
             <button onClick={() => {sessionStorage.clear(); window.location.reload();}} className="w-full flex items-center justify-center gap-3 p-5 bg-red-500/5 text-red-500 font-black uppercase text-[9px] tracking-widest rounded-2xl hover:bg-red-500 transition-all border border-red-500/10">System Signout</button>
          </div>
        </aside>

        {/* MAIN AREA */}
        <main className="flex-1 flex flex-col min-w-0 transition-colors relative z-10 overflow-hidden transform-gpu will-change-transform">
          <header className="px-10 py-8 flex justify-between items-center bg-slate-950/40 backdrop-blur-md border-b border-amber-500/10">
            <div className="flex items-center gap-6">
              <AnimatePresence>
                {folderHistory.length > 0 && (
                  <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={goBackOneLevel} className="p-4 bg-slate-900 rounded-2xl text-amber-500 border border-amber-500/20">
                    <ArrowLeft size={20} strokeWidth={3}/>
                  </motion.button>
                )}
              </AnimatePresence>
              <div>
                <h1 className="text-2xl font-black text-white tracking-tighter uppercase italic leading-none">Smart <span className="text-amber-500 font-black">Archive</span></h1>
                <div className="flex items-center gap-2 text-[8px] font-black text-slate-500 mt-2 uppercase tracking-[0.2em]">
                  <span className="hover:text-amber-500 cursor-pointer" onClick={goHome}>ROOT</span>
                  {folderHistory.map((h, i) => (
                    <React.Fragment key={h.id + i}>
                      <ChevronRight size={10} className="text-slate-700"/> 
                      <span className={i === folderHistory.length -1 ? "text-amber-400" : ""}>{h.name}</span>
                    </React.Fragment>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 flex-1 max-w-2xl px-12">
               <div className="flex-1 relative group" onClick={() => setIsSearchModalOpen(true)}>
                  <Search size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-600 group-hover:text-amber-500 transition-colors" />
                  <div className="w-full pl-16 pr-6 py-4 bg-white/5 border border-white/5 rounded-2xl text-slate-600 text-[10px] font-black uppercase tracking-widest cursor-pointer group-hover:border-amber-500/20 transition-all text-left">Search whole vault (Ctrl+K)...</div>
               </div>
               
               <div className="flex items-center bg-white/5 p-1.5 rounded-2xl border border-white/5">
                  <button onClick={() => setViewMode('grid')} className={`p-3 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-600'}`}><LayoutGrid size={18}/></button>
                  <button onClick={() => setViewMode('list')} className={`p-3 rounded-xl transition-all ${viewMode === 'list' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-600'}`}><List size={18}/></button>
               </div>

               <button onClick={() => setIsDarkMode(!isDarkMode)} className="p-4 bg-white/5 rounded-2xl text-slate-500 hover:text-amber-500 transition-all">
                  {isDarkMode ? <Sun size={20}/> : <Moon size={20}/>}
               </button>
            </div>

            {userRole === 'admin' && (
              <button onClick={() => {setUploadDestinationId(currentFolder); setIsUploadModalOpen(true);}} className="flex items-center gap-4 bg-amber-500 text-slate-950 px-8 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-md active:scale-95 transition-all">
                <Plus size={18} strokeWidth={4} /> New Record
              </button>
            )}
          </header>

          <div className="flex-1 overflow-y-auto p-12 scrollbar-hide will-change-scroll transform-gpu">
            {loading ? (
              <div className="h-full flex flex-col items-center justify-center gap-6">
                <Loader2 className="animate-spin text-amber-500" size={50} />
                <p className="font-black text-[10px] uppercase tracking-[0.5em] text-amber-500/40 animate-pulse italic">Syncing Ledger Assets...</p>
              </div>
            ) : (
              <div className="space-y-12">
                {!currentFolder && filterType !== 'file' && (
                   <section>
                      <h3 className="text-[10px] font-black uppercase text-slate-600 tracking-[0.4em] mb-6 flex items-center gap-3">
                         <Pin size={12} className="text-amber-500" /> Key Directories
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                         {filteredFiles.filter(f => f.mimeType.includes('folder')).slice(0, 4).map(folder => (
                            <div 
                               key={folder.id} 
                               onClick={() => navigateToFolder(folder.id, folder.name)}
                               className="bg-slate-900/40 p-6 rounded-[30px] border border-amber-500/10 flex items-center gap-6 cursor-pointer group hover:border-amber-500/40 transition-all transform-gpu hover:-translate-y-1"
                            >
                               <div className="p-4 bg-amber-500 rounded-2xl text-slate-950 shadow-md transition-all group-hover:rotate-6">
                                  <Folder size={24} fill="currentColor" />
                                </div>
                                <div className="min-w-0">
                                   <h4 className="font-black text-white text-xs truncate uppercase tracking-tighter">{folder.name}</h4>
                                   <p className="text-[8px] text-slate-500 font-bold uppercase mt-1">Directory Access</p>
                                </div>
                            </div>
                         ))}
                      </div>
                   </section>
                )}

                <section>
                   <div className="flex items-center justify-between mb-8">
                      <h3 className="text-[10px] font-black uppercase text-slate-600 tracking-[0.4em] flex items-center gap-3">
                         <Star size={12} className="text-amber-500" /> Active Registry
                      </h3>
                      <p className="text-[9px] font-bold text-slate-700 italic">Showing {filteredFiles.length} Object(s)</p>
                   </div>

                   {viewMode === 'grid' ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-10">
                        {filteredFiles.map((file) => (
                           <div 
                              key={file.id} 
                              className={`relative group bg-slate-900/20 p-8 rounded-[40px] border transition-all cursor-pointer h-72 flex flex-col justify-between transform-gpu hover:-translate-y-1 ${selectedFile?.id === file.id ? 'border-amber-500 bg-amber-500/5' : 'border-white/5 hover:border-amber-500/20'}`}
                              onClick={() => file.mimeType.includes('folder') ? navigateToFolder(file.id, file.name) : setSelectedFile(file)}
                           >
                              <div className="flex justify-between items-start">
                                 <div className={`p-5 rounded-2xl shadow-xl transition-all duration-300 group-hover:scale-110 ${file.mimeType.includes('folder') ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-300 border border-white/5'}`}>
                                    {file.mimeType.includes('folder') ? <Folder size={28} fill="currentColor" /> : <FileText size={28} />}
                                 </div>
                                 <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
                                    {!file.mimeType.includes('folder') && (
                                       <button onClick={(e) => { e.stopPropagation(); addOnlineLog("DOWNLOAD", file.name); window.open(`https://drive.google.com/uc?export=download&id=${file.id}`, '_blank'); }} className="p-3 bg-slate-800 rounded-xl text-slate-400 hover:text-amber-500 border border-white/5 transition-colors"><Download size={16}/></button>
                                    )}
                                    {userRole === 'admin' && (
                                       <>
                                          <button onClick={(e) => { e.stopPropagation(); handleRename(file.id, file.name); }} className="p-3 bg-slate-800 rounded-xl text-slate-400 hover:text-amber-500 border border-white/5 transition-colors"><Edit2 size={16}/></button>
                                          <button onClick={(e) => { e.stopPropagation(); handleDelete(file.id, file.name); }} className="p-3 bg-slate-800 rounded-xl text-slate-400 hover:text-red-400 border border-white/5 transition-colors"><Trash2 size={16}/></button>
                                       </>
                                    )}
                                 </div>
                              </div>
                              <div>
                                 <h4 className="font-black text-white truncate text-base uppercase tracking-tighter leading-tight group-hover:text-amber-400 transition-colors">{file.name}</h4>
                                 <div className="flex items-center gap-3 mt-4">
                                    <span className={`text-[8px] font-black uppercase tracking-widest py-1 px-3 rounded-full border ${file.mimeType.includes('folder') ? 'border-amber-500/30 text-amber-500' : 'border-white/10 text-slate-500'}`}>
                                       {file.mimeType.includes('folder') ? 'DIRECTORY' : 'DATA OBJECT'}
                                    </span>
                                 </div>
                              </div>
                           </div>
                        ))}
                      </div>
                   ) : (
                      <div className="bg-slate-900/10 rounded-[35px] border border-white/5 overflow-hidden transform-gpu">
                         <div className="grid grid-cols-12 p-6 border-b border-white/5 text-[9px] font-black uppercase tracking-widest text-slate-600">
                            <div className="col-span-6 pl-4">Object Name</div>
                            <div className="col-span-3">Type</div>
                            <div className="col-span-3 text-right pr-4">Actions</div>
                         </div>
                         {filteredFiles.map(file => (
                            <div 
                               key={file.id} 
                               onClick={() => file.mimeType.includes('folder') ? navigateToFolder(file.id, file.name) : setSelectedFile(file)}
                               className={`grid grid-cols-12 p-5 items-center hover:bg-amber-500/5 transition-colors cursor-pointer group border-b border-white/5 last:border-0 ${selectedFile?.id === file.id ? 'bg-amber-500/5' : ''}`}
                            >
                               <div className="col-span-6 flex items-center gap-6 pl-4">
                                  <div className={file.mimeType.includes('folder') ? 'text-amber-500' : 'text-slate-500'}>
                                     {file.mimeType.includes('folder') ? <Folder size={20} fill="currentColor"/> : <FileText size={20}/>}
                                  </div>
                                  <span className="text-xs font-bold text-slate-300 group-hover:text-amber-400 truncate uppercase tracking-tighter">{file.name}</span>
                               </div>
                               <div className="col-span-3 text-[9px] font-black text-slate-500 uppercase tracking-widest">
                                  {file.mimeType.includes('folder') ? 'Directory' : 'File'}
                               </div>
                               <div className="col-span-3 flex justify-end gap-2 pr-4">
                                  <button onClick={(e) => { e.stopPropagation(); setSelectedFile(file); }} className="p-3 bg-white/5 rounded-xl text-slate-500 hover:text-amber-500 transition-colors"><Info size={16}/></button>
                                  {userRole === 'admin' && (
                                     <>
                                        <button onClick={(e) => { e.stopPropagation(); handleRename(file.id, file.name); }} className="p-3 bg-white/5 rounded-xl text-slate-500 hover:text-amber-500 transition-colors"><Edit2 size={16}/></button>
                                        <button onClick={(e) => { e.stopPropagation(); handleDelete(file.id, file.name); }} className="p-3 bg-white/5 rounded-xl text-slate-500 hover:text-red-400 transition-colors"><Trash2 size={16}/></button>
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

          <div className="p-4 px-10 bg-black/40 border-t border-white/5 flex items-center justify-between text-[8px] font-black uppercase text-slate-600 tracking-[0.2em]">
             <div className="flex gap-6">
                <span>CTRL + K Global Search</span>
                <span>ESC Close Preview</span>
             </div>
             <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                Royal Vault Security Online
             </div>
          </div>
        </main>

        {/* LOG MODAL */}
        <AnimatePresence>
          {isLogModalOpen && (
            <div className="fixed inset-0 z-[200] flex items-start justify-center pt-20 p-6 bg-slate-950/95 backdrop-blur-md" onClick={() => setIsLogModalOpen(false)}>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-slate-900 border border-amber-500/20 w-full max-w-5xl rounded-[50px] shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
                <div className="p-10 border-b border-white/5 flex justify-between items-center">
                  <h3 className="text-2xl font-black uppercase tracking-tighter text-white italic leading-none"><Coins className="text-amber-500" /> Operational Log</h3>
                  <button onClick={() => setIsLogModalOpen(false)} className="p-4 hover:bg-red-500/10 text-slate-500 hover:text-red-500 rounded-full transition-all border border-white/5"><X size={24}/></button>
                </div>
                <div className="overflow-x-auto max-h-[65vh] p-6 scrollbar-hide">
                  <table className="w-full text-left border-collapse min-w-[800px]">
                    <thead className="text-[9px] font-black uppercase tracking-[0.4em] text-slate-600 sticky top-0 bg-slate-900 z-10">
                      <tr>
                        <th className="p-6 border-b border-white/5">Actor</th>
                        <th className="p-6 border-b border-white/5">Command</th>
                        <th className="p-6 border-b border-white/5">Target Object</th>
                        <th className="p-6 border-b border-white/5">Timestamp</th>
                      </tr>
                    </thead>
                    <tbody className="text-[11px] font-bold italic">
                      {activityLogs.map((log) => (
                        <tr key={log.id} className="border-b border-white/5 text-slate-400 hover:bg-amber-500/5 transition-colors">
                          <td className="p-6 text-amber-500">{log.user}</td>
                          <td className="p-6">
                            <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase border ${log.action === 'DELETE' ? 'border-red-500/50 text-red-400' : log.action === 'UPLOAD' ? 'border-emerald-500/50 text-emerald-400' : 'border-amber-500/50 text-amber-400'}`}>
                              {log.action}
                            </span>
                          </td>
                          <td className="p-6 max-w-[200px] truncate opacity-70 italic font-mono">{log.fileName}</td>
                          <td className="p-6 text-[10px] opacity-30">{log.timestamp}</td>
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
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/95 backdrop-blur-md">
              <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-slate-900 rounded-[50px] p-16 w-full max-w-xl relative border border-amber-500/20 shadow-2xl">
                <button onClick={() => setIsUploadModalOpen(false)} className="absolute right-10 top-10 text-slate-600 hover:text-amber-400 transition-all"><X size={32}/></button>
                <div className="text-center mb-10">
                   <h3 className="text-3xl font-black text-white uppercase tracking-tighter italic leading-none">Object <span className="text-amber-500">Submission</span></h3>
                   <p className="text-[9px] text-slate-500 font-black uppercase tracking-[0.4em] mt-3">Advanced Encryption Active</p>
                </div>
                {uploadStatus === 'idle' ? (
                  <div className="space-y-8">
                    <select value={uploadDestinationId} onChange={(e) => setUploadDestinationId(e.target.value)} className="w-full p-5 rounded-2xl bg-white/5 border border-white/5 outline-none font-black text-[10px] text-slate-400 cursor-pointer focus:border-amber-500 transition-all uppercase tracking-widest">
                      <option value="">🏠 CENTRAL ARCHIVE</option>
                      {allFolders.map(f => (<option key={f.id} value={f.id} className="bg-slate-900 text-white">📁 {f.name.toUpperCase()}</option>))}
                    </select>
                    <label className="flex flex-col items-center justify-center w-full h-72 border-2 border-dashed border-amber-500/10 rounded-[40px] cursor-pointer hover:bg-amber-500/5 transition-all text-center p-8 relative overflow-hidden group">
                      {uploading ? (
                        <div className="w-full">
                          <Loader2 className="animate-spin mx-auto text-amber-500 mb-6" size={50} />
                          <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden mb-4">
                             <motion.div initial={{ width: 0 }} animate={{ width: `${uploadProgress}%` }} className="h-full bg-amber-500" />
                          </div>
                          <p className="text-[10px] font-black uppercase text-amber-500 tracking-widest">{uploadProgress}% SYNCING...</p>
                        </div>
                      ) : (
                        <>
                          <div className="p-6 bg-amber-500 rounded-2xl text-slate-950 mb-6 shadow-lg group-hover:scale-110 transition-transform"><Upload size={32} strokeWidth={3}/></div>
                          <p className="text-lg font-black text-white uppercase tracking-tighter italic">Upload Dataset</p>
                          <input type="file" multiple className="hidden" onChange={handleUpload} disabled={uploading} />
                        </>
                      )}
                    </label>
                  </div>
                ) : (
                  <div className="text-center py-20">
                    {uploadStatus === 'success' ? (
                      <div>
                        <ShieldCheck size={100} className="text-amber-500 mx-auto mb-6 animate-pulse" />
                        <h3 className="text-3xl font-black text-white uppercase tracking-tighter italic">Ledger <span className="text-amber-500">Secured</span></h3>
                      </div>
                    ) : (
                      <div>
                        <AlertCircle size={100} className="text-red-500 mx-auto mb-6" />
                        <h3 className="text-3xl font-black text-white uppercase tracking-tighter">Auth Denied</h3>
                      </div>
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
            <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 30, stiffness: 200 }} className="w-[850px] bg-slate-950/95 backdrop-blur-md shadow-2xl border-l border-amber-500/10 flex flex-col overflow-hidden relative z-[100] transform-gpu">
               <div className="p-10 border-b border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-6 min-w-0">
                    <div className="p-4 bg-amber-500/10 rounded-2xl text-amber-500 border border-amber-500/20"><FileText size={28}/></div>
                    <div className="min-w-0">
                      <span className="text-[9px] font-black uppercase tracking-[0.4em] text-amber-500/60 block mb-1 italic">Encrypted Record</span>
                      <h4 className="font-black text-lg truncate uppercase tracking-tighter text-white block leading-none italic">{selectedFile.name}</h4>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                     <button onClick={() => { addOnlineLog("DOWNLOAD", selectedFile.name); window.open(`https://drive.google.com/uc?export=download&id=${selectedFile.id}`, '_blank'); }} className="p-4 bg-amber-500 rounded-2xl text-slate-950 hover:bg-yellow-400 transition-colors shadow-lg"><Download size={24}/></button>
                     <button onClick={() => { setSelectedFile(null); setPreviewLoading(true); }} className="p-4 text-slate-500 hover:text-red-400 bg-white/5 rounded-2xl border border-white/5 transition-colors"><X size={24}/></button>
                  </div>
               </div>
               
               <div className="grid grid-cols-3 p-8 gap-4 border-b border-white/5 bg-slate-900/10">
                  <div className="p-4 bg-white/5 rounded-2xl border border-white/5 text-center">
                     <p className="text-[8px] font-black uppercase text-slate-500 mb-2 tracking-widest">Type</p>
                     <p className="text-[10px] font-black text-amber-500 truncate uppercase italic">Digital Object</p>
                  </div>
                  <div className="p-4 bg-white/5 rounded-2xl border border-white/5 text-center">
                     <p className="text-[8px] font-black uppercase text-slate-500 mb-2 tracking-widest">Visibility</p>
                     <p className="text-[10px] font-black text-amber-500 truncate uppercase italic">High-Sec Vault</p>
                  </div>
                  <div className="p-4 bg-white/5 rounded-2xl border border-white/5 text-center">
                     <p className="text-[8px] font-black uppercase text-slate-500 mb-2 tracking-widest">Ownership</p>
                     <p className="text-[10px] font-black text-amber-500 truncate uppercase italic">Internal Auth</p>
                  </div>
               </div>

               <div className="flex-1 relative m-8 bg-black rounded-[40px] overflow-hidden border border-white/5 transform-gpu shadow-inner">
                  {previewLoading && (
                    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-slate-950/80">
                      <Loader2 className="animate-spin text-amber-500 mb-6" size={48} />
                      <p className="text-[10px] font-black uppercase tracking-[0.4em] text-amber-500/40 italic italic">Syncing Visual Node...</p>
                    </div>
                  )}
                  <iframe 
                    src={`https://drive.google.com/file/d/${selectedFile.id}/preview`} 
                    className="w-full h-full border-0 transition-opacity duration-700" 
                    title="Live Sync"
                    style={{ opacity: previewLoading ? 0 : 1 }}
                    onLoad={() => setPreviewLoading(false)}
                  />
               </div>

               <div className="p-8 px-10 bg-slate-900/40 backdrop-blur-md border-t border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-3 text-slate-500 text-[10px] font-black uppercase tracking-widest italic">
                     <Clock size={16}/> Sync: Recently
                  </div>
                  <button onClick={() => { addOnlineLog("DOWNLOAD", selectedFile.name); window.open(`https://drive.google.com/uc?export=download&id=${selectedFile.id}`, '_blank'); }} className="px-10 py-6 bg-amber-500 text-slate-950 rounded-[28px] font-black text-[11px] uppercase tracking-[0.5em] flex items-center gap-4 hover:bg-yellow-400 transition-all shadow-xl">
                    <Download size={20} strokeWidth={4}/> Authorize Retrieval
                  </button>
               </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* --- GLOBAL SEARCH MODAL (OPTIMIZED) --- */}
        <AnimatePresence>
          {isSearchModalOpen && (
            <div className="fixed inset-0 z-[200] flex items-start justify-center pt-32 px-4 bg-slate-950/90 backdrop-blur-md" onClick={() => setIsSearchModalOpen(false)}>
              <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="bg-slate-900 border border-amber-500/20 w-full max-w-2xl rounded-[35px] shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
                <div className="p-8 flex items-center gap-6 border-b border-white/5">
                  <Search className="text-amber-500" size={28} />
                  <input 
                    autoFocus 
                    type="text" 
                    placeholder="Search ANY file in the vault..." 
                    className="flex-1 bg-transparent outline-none font-black text-xl text-white uppercase tracking-tighter italic" 
                    onChange={(e) => setSearchTerm(e.target.value)} 
                  />
                  <div className="p-3 px-5 bg-white/5 border border-white/5 rounded-2xl text-[9px] font-black text-slate-500 uppercase tracking-widest">ESC</div>
                </div>
                
                <div className="max-h-[500px] overflow-y-auto p-6 space-y-2 scrollbar-hide transform-gpu">
                  {/* Mencari ke globalFiles (seluruh isi Drive) bukannya files (folder saat ini saja) */}
                  {globalFiles
                    .filter(f => f.name.toLowerCase().includes(searchTerm.toLowerCase()))
                    .slice(0, 30) // Batasi 30 hasil pertama untuk performa
                    .map(f => (
                      <div 
                        key={f.id} 
                        onClick={() => { 
                          if(f.mimeType.includes('folder')) navigateToFolder(f.id, f.name); 
                          else setSelectedFile(f); 
                          setIsSearchModalOpen(false); 
                        }} 
                        className="p-5 hover:bg-amber-500 hover:text-slate-950 rounded-2xl cursor-pointer flex items-center justify-between group transition-colors text-slate-400 border border-transparent hover:border-amber-500/20"
                      >
                        <div className="flex items-center gap-5 tracking-tighter italic min-w-0">
                          {f.mimeType.includes('folder') ? <Folder size={20} className="shrink-0"/> : <FileText size={20} className="shrink-0"/>}
                          <div className="truncate">
                             <span className="block">{f.name}</span>
                             {/* Menampilkan label jika ini hasil pencarian global agar user tahu filenya terselip di dalam folder */}
                             <span className="text-[7px] font-black opacity-40 uppercase tracking-widest">Global Archive Search Result</span>
                          </div>
                        </div>
                        <ChevronRight size={16} className="opacity-0 group-hover:opacity-100 group-hover:translate-x-2 transition-all shrink-0" />
                      </div>
                  ))}
                  {searchTerm && globalFiles.filter(f => f.name.toLowerCase().includes(searchTerm.toLowerCase())).length === 0 && (
                    <div className="p-10 text-center opacity-30 text-xs font-black uppercase tracking-[0.4em]">No record found in the entire vault</div>
                  )}
                  {!searchTerm && (
                    <div className="p-10 text-center opacity-30 text-xs font-black uppercase tracking-[0.4em]">Type to deep search folders and files...</div>
                  )}
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}