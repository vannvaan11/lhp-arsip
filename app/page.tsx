"use client"
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { 
  Folder, FileText, Upload, Lock, Database, LayoutDashboard, 
  Search, LogOut, ChevronRight, Loader2, Edit2, Plus, X, 
  Download, ArrowLeft, Sun, Moon, Shield, 
  CheckCircle2, AlertCircle, Filter, History, User,
  Crown, Zap, ShieldCheck, Star, Trash2, Trophy, Coins,
  LayoutGrid, List, Clock, Info, Share2, Pin, Eye, Activity,
  Cpu, HardDrive, ShieldAlert, Command, Settings, Bell, ChevronDown
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

  // --- HANDLERS ---
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

  const goHome = () => { setCurrentFolder(''); setFolderHistory([]); setSelectedFile(null); setSearchTerm(''); };

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

  const baseFiles = searchTerm.length >= 2 ? searchResults : files.filter(f => f.name.toLowerCase().includes(searchTerm.toLowerCase()));

  const filteredFilesMain = baseFiles
    .filter(f => {
      if (filterType === 'folder') return f.mimeType.includes('folder');
      if (filterType === 'file') return !f.mimeType.includes('folder');
      return true;
    });

  // --- LOGIN PAGE RENDER ---
  if (!isLoggedIn) {
    return (
      <div className="relative min-h-screen w-full flex items-center justify-center p-6 bg-[#020617] font-sans overflow-hidden">
        {/* Animated Background Canvas */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,#1e293b_0%,#020617_100%)]"></div>
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-amber-600/10 blur-[120px] rounded-full animate-pulse"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full animate-pulse delay-700"></div>
          <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "url('https://www.transparenttextures.com/patterns/carbon-fibre.png')" }}></div>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="relative z-10 w-full max-w-[450px]"
        >
          <div className="bg-slate-900/40 backdrop-blur-3xl p-10 rounded-[48px] border border-white/10 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.6)]">
            <div className="flex flex-col items-center mb-10">
              <motion.div 
                whileHover={{ rotate: 360 }}
                transition={{ duration: 1, ease: "anticipate" }}
                className="w-24 h-24 mb-6 relative"
              >
                <div className="absolute inset-0 bg-amber-500 blur-2xl opacity-20 animate-pulse"></div>
                <img 
                  src="https://i.ibb.co.com/L22pdJQ/Coat-of-arms-of-Southeast-Sulawesi-svg.png" 
                  alt="Logo" 
                  className="w-full h-full object-contain relative z-10 drop-shadow-[0_0_15px_rgba(245,158,11,0.5)]" 
                />
              </motion.div>
              <h2 className="text-3xl font-black text-white tracking-tighter uppercase italic">
                ROYAL <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-yellow-200 to-amber-600">VAULT</span>
              </h2>
              <p className="text-amber-500/60 text-[9px] font-black uppercase tracking-[0.5em] mt-2">Inspectorate Elite Access</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase ml-4 tracking-widest">Identitas</label>
                <div className="relative group">
                  <User className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-amber-500 transition-colors" size={18}/>
                  <input required type="text" placeholder="MASUKKAN NAMA" className="w-full py-5 pl-14 pr-6 rounded-3xl border border-white/5 outline-none bg-white/5 text-white font-bold placeholder:text-slate-600 focus:border-amber-500/50 focus:bg-amber-500/5 transition-all text-sm uppercase" onChange={(e) => setTempName(e.target.value)} />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase ml-4 tracking-widest">Kunci Akses</label>
                <div className="relative group">
                  <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-amber-500 transition-colors" size={18}/>
                  <input required type="password" placeholder="••••••••" className="w-full py-5 pl-14 pr-6 rounded-3xl border border-white/5 outline-none bg-white/5 text-white font-bold placeholder:text-slate-600 tracking-[0.5em] focus:border-amber-500/50 focus:bg-amber-500/5 transition-all" onChange={(e) => setPassword(e.target.value)} />
                </div>
              </div>

              <button type="submit" className="w-full relative overflow-hidden group mt-4">
                <div className="absolute inset-0 bg-gradient-to-r from-amber-600 via-amber-400 to-amber-600 group-hover:scale-105 transition-transform duration-500"></div>
                <div className="relative px-8 py-5 flex items-center justify-center gap-3">
                  <span className="text-slate-950 font-black uppercase tracking-widest text-xs">Verify Authority</span>
                  <ShieldCheck size={18} className="text-slate-950" />
                </div>
              </button>
            </form>
          </div>
          <p className="text-center mt-8 text-[9px] text-slate-600 font-bold uppercase tracking-[0.3em]">Secure End-to-End Encryption Node v2.0</p>
        </motion.div>
      </div>
    );
  }

  // --- MAIN DASHBOARD RENDER ---
  return (
    <div className={`${isDarkMode ? "dark" : ""} font-sans`}>
      <div className="h-screen bg-[#020617] text-slate-300 flex overflow-hidden relative">
        
        {/* Background Overlay Decor */}
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-[60%] h-[60%] bg-blue-600/5 blur-[150px] rounded-full"></div>
          <div className="absolute bottom-0 left-0 w-[60%] h-[60%] bg-amber-600/5 blur-[150px] rounded-full"></div>
          <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: "url('https://www.transparenttextures.com/patterns/grid-me.png')" }}></div>
        </div>

        {/* SIDEBAR - MODERN DETACHED STYLE */}
        <aside className="w-24 lg:w-72 m-6 mr-0 rounded-[40px] bg-slate-900/40 backdrop-blur-2xl border border-white/10 flex flex-col items-center py-10 relative z-30 shadow-2xl">
          <div className="flex flex-col items-center gap-8 w-full px-6">
            <motion.div 
              whileHover={{ scale: 1.05 }}
              onClick={goHome}
              className="cursor-pointer flex flex-col items-center"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-amber-500/20 to-transparent p-3 rounded-2xl border border-amber-500/30 mb-4">
                <img src="https://i.ibb.co.com/L22pdJQ/Coat-of-arms-of-Southeast-Sulawesi-svg.png" alt="Logo" className="w-full h-full object-contain shadow-2xl" />
              </div>
              <h1 className="hidden lg:block font-black text-xl tracking-tighter text-white italic">ARV<span className="text-amber-500">DRIV3</span></h1>
            </motion.div>

            <div className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent my-4"></div>

            <nav className="w-full space-y-3">
              {[
                { icon: LayoutDashboard, label: 'Overview', active: !currentFolder, onClick: goHome },
                { icon: Folder, label: 'Directories', active: filterType === 'folder', onClick: () => setFilterType('folder') },
                { icon: FileText, label: 'Records', active: filterType === 'file', onClick: () => setFilterType('file') },
                { icon: History, label: 'Audit Logs', active: false, onClick: () => setIsLogModalOpen(true) },
              ].map((item, idx) => (
                <button
                  key={idx}
                  onClick={item.onClick}
                  className={`w-full flex items-center justify-center lg:justify-start gap-4 p-4 rounded-2xl transition-all relative group ${item.active ? 'bg-amber-500 text-slate-950 shadow-xl shadow-amber-500/20' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}
                >
                  <item.icon size={20} />
                  <span className="hidden lg:block text-[11px] font-black uppercase tracking-widest">{item.label}</span>
                  {item.active && <motion.div layoutId="nav-active" className="absolute left-0 w-1 h-8 bg-slate-950 rounded-r-full" />}
                </button>
              ))}
            </nav>
          </div>

          <div className="mt-auto w-full px-6 space-y-6">
            <div className="bg-white/5 rounded-3xl p-5 border border-white/5 text-center hidden lg:block">
              <p className="text-[8px] font-black text-amber-500/50 uppercase tracking-[0.3em] mb-2">Vault Health</p>
              <div className="flex items-center justify-center gap-2">
                <div className="flex gap-0.5">
                  {[1,2,3,4,5].map(i => <div key={i} className={`w-1 h-4 rounded-full ${i < 5 ? 'bg-amber-500' : 'bg-slate-700'}`}></div>)}
                </div>
                <span className="text-xs font-black text-white italic">98%</span>
              </div>
            </div>

            <button 
              onClick={() => {sessionStorage.clear(); window.location.reload();}}
              className="w-full p-4 rounded-2xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all flex items-center justify-center lg:justify-start gap-4 group"
            >
              <LogOut size={20} className="group-hover:rotate-12 transition-transform" />
              <span className="hidden lg:block text-[11px] font-black uppercase tracking-widest">Sign Out</span>
            </button>
          </div>
        </aside>

        {/* MAIN AREA */}
        <main className="flex-1 flex flex-col min-w-0 relative overflow-hidden">
          
          {/* HEADER - FLOATING GLASS STYLE */}
          <header className="m-6 p-6 rounded-[32px] bg-slate-900/40 backdrop-blur-xl border border-white/10 flex items-center justify-between gap-8 z-20 shadow-xl">
            <div className="flex items-center gap-6">
              <AnimatePresence>
                {folderHistory.length > 0 && (
                  <motion.button 
                    initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}
                    onClick={goBackOneLevel}
                    className="p-3 bg-white/5 rounded-xl text-amber-400 border border-white/10 hover:bg-amber-500 hover:text-slate-950 transition-all"
                  >
                    <ArrowLeft size={18} />
                  </motion.button>
                )}
              </AnimatePresence>
              <div className="hidden sm:block">
                <h2 className="text-lg font-black text-white uppercase italic leading-none tracking-tight">Smart <span className="text-amber-500">Archive</span></h2>
                <div className="flex items-center gap-2 text-[9px] font-black text-slate-500 mt-1 uppercase tracking-widest">
                  <span className="hover:text-amber-500 cursor-pointer" onClick={goHome}>CORE</span>
                  {folderHistory.map((h, i) => (
                    <React.Fragment key={h.id}>
                      <ChevronRight size={10} />
                      <span className={i === folderHistory.length -1 ? "text-amber-400" : ""}>{h.name.substring(0, 15)}</span>
                    </React.Fragment>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex-1 max-w-xl relative group">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-amber-500 transition-colors" size={16} />
              <input 
                onClick={() => setIsSearchModalOpen(true)}
                readOnly
                value={searchTerm}
                placeholder="SEARCH REGISTRY (CTRL + K)"
                className="w-full bg-white/5 border border-white/5 rounded-[20px] py-4 pl-14 pr-6 text-[10px] font-black tracking-widest text-slate-400 cursor-pointer hover:bg-white/10 transition-all outline-none"
              />
              {searchTerm && (
                <button onClick={(e) => { e.stopPropagation(); setSearchTerm(''); setSearchResults([]); }} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-amber-500 z-10">
                  <X size={14} />
                </button>
              )}
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden md:flex bg-white/5 p-1 rounded-2xl border border-white/5">
                <button onClick={() => setViewMode('grid')} className={`p-3 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-amber-500 text-slate-950 shadow-lg' : 'text-slate-500 hover:text-white'}`}><LayoutGrid size={18}/></button>
                <button onClick={() => setViewMode('list')} className={`p-3 rounded-xl transition-all ${viewMode === 'list' ? 'bg-amber-500 text-slate-950 shadow-lg' : 'text-slate-500 hover:text-white'}`}><List size={18}/></button>
              </div>
              <button onClick={() => setIsDarkMode(!isDarkMode)} className="p-3 bg-white/5 rounded-2xl text-slate-500 border border-white/5 hover:text-amber-500 transition-all">
                {isDarkMode ? <Sun size={18}/> : <Moon size={18}/>}
              </button>
              {userRole === 'admin' && (
                <button 
                  onClick={() => {setUploadDestinationId(currentFolder); setIsUploadModalOpen(true);}}
                  className="bg-gradient-to-r from-amber-600 to-amber-400 text-slate-950 p-4 rounded-2xl font-black shadow-lg shadow-amber-500/20 hover:scale-105 transition-all flex items-center gap-2"
                >
                  <Plus size={20} strokeWidth={3} />
                  <span className="hidden lg:block text-[10px] uppercase tracking-tighter">New Record</span>
                </button>
              )}
            </div>
          </header>

          {/* MAIN CONTENT SCROLLABLE AREA */}
          <div className="flex-1 overflow-y-auto px-6 pb-24 scrollbar-hide">
            
            {loading ? (
              <div className="h-full flex flex-col items-center justify-center">
                <div className="relative w-24 h-24 flex items-center justify-center">
                  <div className="absolute inset-0 border-4 border-amber-500/10 border-t-amber-500 rounded-full animate-spin"></div>
                  <Database className="text-amber-500 animate-pulse" size={32} />
                </div>
                <p className="mt-6 text-[10px] font-black uppercase tracking-[0.5em] text-amber-500/40 italic">Decrypting Matrix...</p>
              </div>
            ) : (
              <div className="max-w-[1600px] mx-auto space-y-10">
                
                {/* HERO STATS - BENTO STYLE */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  {[
                    { label: 'Security Layer', value: 'Level 07', icon: Shield, color: 'text-blue-500' },
                    { label: 'Total Objects', value: stats.total, icon: Database, color: 'text-amber-500' },
                    { label: 'Registry Status', value: 'Authorized', icon: CheckCircle2, color: 'text-emerald-500' },
                    { label: 'Active User', value: userName.split(' ')[0], icon: User, color: 'text-purple-500' },
                  ].map((stat, i) => (
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                      key={i} className="bg-slate-900/40 backdrop-blur-xl p-6 rounded-[32px] border border-white/5 hover:border-white/10 transition-all group"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className={`p-3 rounded-2xl bg-white/5 ${stat.color} group-hover:scale-110 transition-transform`}>
                          <stat.icon size={20} />
                        </div>
                        <Activity size={14} className="text-slate-700" />
                      </div>
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{stat.label}</p>
                      <h4 className="text-2xl font-black text-white mt-1 italic uppercase tracking-tighter">{stat.value}</h4>
                    </motion.div>
                  ))}
                </div>

                {/* ESSENTIAL DIRECTORIES */}
                {!currentFolder && filterType !== 'file' && (
                  <section>
                    <div className="flex items-center gap-4 mb-6">
                      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
                      <h3 className="text-[10px] font-black uppercase text-amber-500/60 tracking-[0.5em] flex items-center gap-3">
                        <Pin size={14} /> Root Directories
                      </h3>
                      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                      {filteredFilesMain.filter(f => f.mimeType.includes('folder')).slice(0, 4).map((folder, i) => (
                        <motion.div 
                          whileHover={{ y: -5 }}
                          key={folder.id} 
                          onClick={() => navigateToFolder(folder.id, folder.name)}
                          className="bg-white/5 hover:bg-amber-500/5 p-6 rounded-[32px] border border-white/5 hover:border-amber-500/30 cursor-pointer transition-all group flex items-center gap-5"
                        >
                          <div className="p-4 bg-amber-500 rounded-2xl text-slate-950 group-hover:rotate-6 transition-all shadow-lg shadow-amber-500/20">
                            <Folder size={24} fill="currentColor" />
                          </div>
                          <div className="min-w-0">
                            <h4 className="font-black text-white text-sm truncate uppercase tracking-tighter group-hover:text-amber-400">{folder.name}</h4>
                            <p className="text-[8px] text-slate-600 font-bold uppercase mt-1 tracking-widest">Entry Point</p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </section>
                )}

                {/* MAIN GRID/LIST FILES */}
                <section>
                  <div className="flex items-center justify-between mb-8">
                    <h3 className="text-[11px] font-black uppercase text-slate-500 tracking-[0.4em] flex items-center gap-3">
                      <Star size={14} className="text-amber-500" /> Active Registry
                    </h3>
                    <div className="flex items-center gap-4 text-[10px] font-bold text-slate-600">
                      <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div> {filteredFilesMain.length} Nodes</span>
                    </div>
                  </div>

                  {viewMode === 'grid' ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-8">
                      {filteredFilesMain.map((file, i) => (
                        <motion.div 
                          initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }}
                          key={file.id}
                          onClick={() => file.mimeType.includes('folder') ? navigateToFolder(file.id, file.name) : setSelectedFile(file)}
                          className={`relative group bg-slate-900/40 backdrop-blur-xl p-8 rounded-[40px] border transition-all cursor-pointer overflow-hidden ${selectedFile?.id === file.id ? 'border-amber-500 bg-amber-500/5 shadow-2xl' : 'border-white/5 hover:border-white/20'}`}
                        >
                          {/* Card Background Glow */}
                          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                          
                          <div className="flex justify-between items-start relative z-10">
                            <div className={`p-5 rounded-[24px] ${file.mimeType.includes('folder') ? 'bg-amber-500 text-slate-950' : 'bg-white/5 text-white border border-white/10'} group-hover:scale-110 transition-all duration-300`}>
                              {file.mimeType.includes('folder') ? <Folder size={28} fill="currentColor" /> : <FileText size={28} />}
                            </div>
                            
                            <div className="flex flex-col gap-2 opacity-0 translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                              {!file.mimeType.includes('folder') && (
                                <button onClick={(e) => { e.stopPropagation(); window.open(`https://drive.google.com/uc?export=download&id=${file.id}`, '_blank'); }} className="p-3 bg-white/10 hover:bg-amber-500 hover:text-slate-950 rounded-xl transition-all border border-white/10"><Download size={16}/></button>
                              )}
                              {userRole === 'admin' && (
                                <>
                                  <button onClick={(e) => { e.stopPropagation(); handleRename(file.id, file.name); }} className="p-3 bg-white/10 hover:bg-blue-500 hover:text-white rounded-xl transition-all border border-white/10"><Edit2 size={16}/></button>
                                  <button onClick={(e) => { e.stopPropagation(); handleDelete(file.id, file.name); }} className="p-3 bg-white/10 hover:bg-red-500 hover:text-white rounded-xl transition-all border border-white/10"><Trash2 size={16}/></button>
                                </>
                              )}
                            </div>
                          </div>

                          <div className="mt-12 relative z-10">
                            <h4 className="font-black text-white truncate text-base uppercase tracking-tighter italic group-hover:text-amber-400 transition-colors">{file.name}</h4>
                            <div className="flex items-center gap-3 mt-4">
                              <span className={`text-[8px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full border ${file.mimeType.includes('folder') ? 'border-amber-500/30 text-amber-500 bg-amber-500/10' : 'border-white/10 text-slate-500 bg-white/5'}`}>
                                {file.mimeType.includes('folder') ? 'Directory' : 'Data Object'}
                              </span>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-slate-900/40 backdrop-blur-xl rounded-[32px] border border-white/10 overflow-hidden">
                      <div className="grid grid-cols-12 p-6 border-b border-white/5 text-[9px] font-black uppercase tracking-[0.3em] text-slate-500 bg-white/[0.02]">
                        <div className="col-span-7 pl-4">Object Identity</div>
                        <div className="col-span-3">Type</div>
                        <div className="col-span-2 text-right pr-4">Action</div>
                      </div>
                      {filteredFilesMain.map(file => (
                        <div key={file.id} onClick={() => file.mimeType.includes('folder') ? navigateToFolder(file.id, file.name) : setSelectedFile(file)} className="grid grid-cols-12 p-5 items-center hover:bg-white/[0.03] transition-colors cursor-pointer group border-b border-white/5 last:border-0">
                          <div className="col-span-7 flex items-center gap-4 pl-4">
                            <div className={`p-2 rounded-xl ${file.mimeType.includes('folder') ? 'text-amber-500 bg-amber-500/10' : 'text-slate-400 bg-white/5'}`}>
                              {file.mimeType.includes('folder') ? <Folder size={18} fill="currentColor"/> : <FileText size={18}/>}
                            </div>
                            <span className="text-xs font-bold text-slate-200 group-hover:text-amber-400 truncate uppercase tracking-tight">{file.name}</span>
                          </div>
                          <div className="col-span-3 text-[9px] font-black text-slate-600 uppercase italic tracking-widest">{file.mimeType.includes('folder') ? 'Folder Node' : 'Encrypted File'}</div>
                          <div className="col-span-2 flex justify-end gap-2 pr-4">
                            <button onClick={(e) => { e.stopPropagation(); setSelectedFile(file); }} className="p-2 bg-white/5 rounded-lg text-slate-500 hover:text-amber-400 transition-all border border-white/5"><Info size={16}/></button>
                            {userRole === 'admin' && <button onClick={(e) => { e.stopPropagation(); handleDelete(file.id, file.name); }} className="p-2 bg-white/5 rounded-lg text-slate-500 hover:text-red-500 transition-all border border-white/5"><Trash2 size={16}/></button>}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </section>
              </div>
            )}
          </div>

          {/* BOTTOM TICKER & STATUS */}
          <div className="absolute bottom-6 left-6 right-6 z-30 space-y-4">
            <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-2xl h-10 overflow-hidden flex items-center shadow-2xl relative">
              <div className="absolute left-0 top-0 bottom-0 px-4 bg-amber-500 text-slate-950 text-[9px] font-black flex items-center z-20 italic uppercase tracking-widest">
                <Zap size={12} className="mr-2" /> Live Intel Stream
              </div>
              <div className="whitespace-nowrap flex items-center gap-16 animate-marquee pl-32">
                {[1,2,3].map(i => (
                  <div key={i} className="flex gap-16 items-center text-[10px] font-black text-amber-500/60 uppercase tracking-[0.2em] italic">
                    <span>• Status: SSL Active AES-256</span>
                    <span>• Node: Authorized {userName?.split(' ')[0]}</span>
                    <span>• Protocol: RSA-4096 Secured</span>
                    <span>• Records: {stats.total} Objects Index</span>
                    <span>• Intelligence: Southeast Sulawesi Inspectorate Portal</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-slate-950/80 backdrop-blur-md border border-white/5 rounded-2xl p-4 px-8 flex items-center justify-between text-[9px] font-black uppercase text-slate-500 tracking-widest">
              <div className="flex gap-8">
                <span className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-ping"></div> 
                  Verified Connection: Kendrick Node 0x{stats.total}
                </span>
                <span className="flex items-center gap-2"><Command size={12} /> Press K for Global Scan</span>
              </div>
              <div className="flex items-center gap-6">
                <span className="flex items-center gap-2"><Shield size={12} className="text-emerald-500" /> End-to-End Encrypted</span>
                <span className="text-slate-700">© 2024 ROYAL VAULT v2.0</span>
              </div>
            </div>
          </div>
        </main>

        {/* --- MODALS - RE-DESIGNED --- */}
        
        {/* LOG MODAL */}
        <AnimatePresence>
          {isLogModalOpen && (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/90 backdrop-blur-md"
              onClick={() => setIsLogModalOpen(false)}
            >
              <motion.div 
                initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
                className="bg-slate-900 border border-white/10 w-full max-w-5xl rounded-[48px] shadow-[0_40px_100px_rgba(0,0,0,0.8)] overflow-hidden" 
                onClick={e => e.stopPropagation()}
              >
                <div className="p-10 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-amber-500 rounded-2xl text-slate-950 shadow-lg shadow-amber-500/20">
                      <History size={24} />
                    </div>
                    <div>
                      <h3 className="text-2xl font-black uppercase tracking-tighter text-white italic">Operational Transactions</h3>
                      <p className="text-[9px] text-slate-500 font-bold uppercase tracking-[0.3em] mt-1">Audit Trail & Access History</p>
                    </div>
                  </div>
                  <button onClick={() => setIsLogModalOpen(false)} className="p-4 bg-white/5 hover:bg-red-500 hover:text-white text-slate-500 rounded-2xl transition-all border border-white/10"><X size={24}/></button>
                </div>
                <div className="max-h-[60vh] overflow-y-auto p-4 scrollbar-hide">
                  <table className="w-full border-collapse">
                    <thead className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 sticky top-0 bg-slate-900 z-10">
                      <tr>
                        <th className="p-6 text-left">Actor Identity</th>
                        <th className="p-6 text-left">Command Executed</th>
                        <th className="p-6 text-left">Target Object</th>
                        <th className="p-6 text-right">Timestamp</th>
                      </tr>
                    </thead>
                    <tbody className="text-xs font-bold text-slate-400">
                      {activityLogs.map((log) => (
                        <tr key={log.id} className="border-b border-white/5 hover:bg-amber-500/5 transition-colors group">
                          <td className="p-6">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-amber-500 text-[10px]">{log.user.charAt(0)}</div>
                              <span className="group-hover:text-amber-500">{log.user}</span>
                            </div>
                          </td>
                          <td className="p-6">
                            <span className="px-3 py-1 rounded-lg text-[9px] font-black uppercase border border-amber-500/30 text-amber-500 bg-amber-500/5">{log.action}</span>
                          </td>
                          <td className="p-6 max-w-xs truncate italic text-slate-500 group-hover:text-slate-300">{log.fileName}</td>
                          <td className="p-6 text-right font-mono text-[10px] opacity-40">{log.timestamp}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* UPLOAD MODAL */}
        <AnimatePresence>
          {isUploadModalOpen && (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/90 backdrop-blur-md"
            >
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                className="bg-slate-900 rounded-[56px] p-12 w-full max-w-xl relative border border-white/10 shadow-3xl"
              >
                <button onClick={() => setIsUploadModalOpen(false)} className="absolute right-10 top-10 text-slate-500 hover:text-white transition-all"><X size={28}/></button>
                <div className="text-center mb-10">
                  <div className="w-20 h-20 bg-amber-500/10 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-amber-500/20 text-amber-500">
                    <Upload size={32} />
                  </div>
                  <h3 className="text-3xl font-black text-white uppercase tracking-tighter italic">Record Submission</h3>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.4em] mt-2">Authority Level High-Security</p>
                </div>

                {uploadStatus === 'idle' ? (
                  <div className="space-y-8">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase ml-4 tracking-widest italic">Destination Node</label>
                      <select 
                        value={uploadDestinationId} 
                        onChange={(e) => setUploadDestinationId(e.target.value)} 
                        className="w-full p-5 rounded-2xl bg-white/5 border border-white/10 outline-none font-black text-xs text-amber-500 focus:border-amber-500/50 appearance-none uppercase tracking-widest cursor-pointer"
                      >
                        <option value="">🏠 ROOT ARCHIVE CORE</option>
                        {allFolders.map(f => (<option key={f.id} value={f.id} className="bg-slate-900 text-white font-sans uppercase tracking-tight italic text-sm">📁 {f.name}</option>))}
                      </select>
                    </div>

                    <label className="flex flex-col items-center justify-center w-full h-72 border-2 border-dashed border-white/10 rounded-[40px] cursor-pointer hover:bg-amber-500/5 hover:border-amber-500/30 transition-all text-center p-8 group relative overflow-hidden">
                      {uploading ? (
                        <div className="w-full px-8">
                          <Loader2 className="animate-spin mx-auto text-amber-500 mb-6" size={48} />
                          <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden mb-4">
                            <motion.div initial={{ width: 0 }} animate={{ width: `${uploadProgress}%` }} className="h-full bg-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.5)]" />
                          </div>
                          <p className="text-[10px] font-black uppercase text-amber-400 tracking-[0.4em] animate-pulse italic">{uploadProgress}% Synchronizing...</p>
                        </div>
                      ) : (
                        <>
                          <p className="text-lg font-black text-white uppercase tracking-tight italic">Drop Intelligence Data</p>
                          <p className="text-[9px] text-slate-500 font-bold uppercase mt-2 opacity-50">Select high-integrity file records</p>
                          <input type="file" multiple className="hidden" onChange={handleUpload} disabled={uploading} />
                        </>
                      )}
                    </label>
                  </div>
                ) : (
                  <div className="text-center py-10">
                    {uploadStatus === 'success' ? (
                      <motion.div initial={{ scale: 0.5 }} animate={{ scale: 1 }}>
                        <ShieldCheck size={100} className="text-amber-500 mx-auto mb-6" />
                        <h3 className="text-2xl font-black text-white uppercase tracking-tighter italic">Ledger Secured Successfully</h3>
                      </motion.div>
                    ) : (
                      <motion.div initial={{ scale: 0.5 }} animate={{ scale: 1 }}>
                        <AlertCircle size={100} className="text-red-500 mx-auto mb-6" />
                        <h3 className="text-2xl font-black text-white uppercase tracking-tighter">Authorization Denied</h3>
                      </motion.div>
                    )}
                  </div>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* PREVIEW PANEL - SLEEK SLIDE OUT */}
        <AnimatePresence>
          {selectedFile && (
            <motion.div 
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} 
              transition={{ type: 'spring', damping: 30, stiffness: 200 }} 
              className="fixed inset-y-0 right-0 w-full lg:w-[800px] bg-slate-900/95 backdrop-blur-3xl shadow-[-50px_0_100px_rgba(0,0,0,0.5)] border-l border-white/10 z-[150] flex flex-col"
            >
              <div className="p-10 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-6 min-w-0">
                  <div className="p-4 bg-amber-500/10 rounded-2xl text-amber-500 border border-amber-500/20">
                    <FileText size={28}/>
                  </div>
                  <div className="min-w-0">
                    <span className="text-[9px] font-black uppercase tracking-[0.4em] text-amber-500/50 block mb-1">Intelligence Stream Identity</span>
                    <h4 className="font-black text-xl truncate uppercase tracking-tighter text-white italic">{selectedFile.name}</h4>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button onClick={() => { addOnlineLog("DOWNLOAD", selectedFile.name); window.open(`https://drive.google.com/uc?export=download&id=${selectedFile.id}`, '_blank'); }} className="p-4 bg-amber-500 rounded-2xl text-slate-950 hover:scale-105 transition-all shadow-lg shadow-amber-500/20"><Download size={22}/></button>
                  <button onClick={() => { setSelectedFile(null); setPreviewLoading(true); }} className="p-4 bg-white/5 text-slate-500 hover:text-white rounded-2xl border border-white/10 transition-all"><X size={22}/></button>
                </div>
              </div>
              
              <div className="flex-1 relative bg-black/40 overflow-hidden">
                {previewLoading && (
                  <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-slate-900">
                    <Loader2 className="animate-spin text-amber-500 mb-6" size={48} />
                    <p className="text-[10px] font-black uppercase tracking-[0.5em] text-amber-500/40 italic">Visualizing Node Data...</p>
                  </div>
                )}
                <iframe src={`https://drive.google.com/file/d/${selectedFile.id}/preview`} className="w-full h-full border-0" title="Preview" onLoad={() => setPreviewLoading(false)} />
              </div>

              <div className="p-10 bg-slate-950/60 backdrop-blur-md border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4 text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] italic">
                  <Clock size={16} className="text-amber-500" /> Synced in Real-Time: Global Ledger v.07
                </div>
                <button 
                  onClick={() => { addOnlineLog("DOWNLOAD", selectedFile.name); window.open(`https://drive.google.com/uc?export=download&id=${selectedFile.id}`, '_blank'); }}
                  className="w-full sm:w-auto px-10 py-5 bg-white/5 text-amber-500 hover:bg-amber-500 hover:text-slate-950 rounded-2xl font-black text-xs uppercase tracking-widest border border-amber-500/30 transition-all"
                >
                  Authorize Retrieval
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* SEARCH MODAL */}
        <AnimatePresence>
          {isSearchModalOpen && (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-[200] flex items-start justify-center pt-32 px-4 bg-slate-950/90 backdrop-blur-xl"
              onClick={() => setIsSearchModalOpen(false)}
            >
              <motion.div 
                initial={{ scale: 0.95, y: -20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: -20 }}
                className="bg-slate-900 border border-white/10 w-full max-w-2xl rounded-[40px] shadow-3xl overflow-hidden" 
                onClick={e => e.stopPropagation()}
              >
                <div className="p-8 flex items-center gap-6 border-b border-white/5 bg-white/[0.02]">
                  <Search className="text-amber-500" size={24} />
                  <input 
                    autoFocus 
                    type="text" 
                    value={searchTerm}
                    placeholder="SCANNING ARCHIVE REGISTRY..." 
                    className="flex-1 bg-transparent outline-none font-black text-xl text-white uppercase tracking-tighter italic placeholder:text-slate-700" 
                    onChange={(e) => handleGlobalSearch(e.target.value)} 
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        setIsSearchModalOpen(false);
                      }
                    }}
                  />
                  {searchLoading && <Loader2 className="animate-spin text-amber-500" size={20} />}
                  <div className="px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-[10px] font-black text-slate-500 uppercase">ESC</div>
                </div>
                <div className="max-h-[400px] overflow-y-auto p-4 space-y-2 scrollbar-hide">
                  {searchTerm.length >= 2 ? (
                    searchResults.length > 0 ? (
                      searchResults.map(f => (
                        <div 
                          key={f.id} 
                          onClick={() => { if(f.mimeType.includes('folder')) navigateToFolder(f.id, f.name); else setSelectedFile(f); setIsSearchModalOpen(false); }} 
                          className="p-4 hover:bg-amber-500/10 rounded-2xl cursor-pointer flex items-center justify-between group transition-all text-slate-400 border border-transparent hover:border-amber-500/20"
                        >
                          <div className="flex items-center gap-4 min-w-0">
                            {f.mimeType.includes('folder') ? <Folder size={18} className="text-amber-500/60"/> : <FileText size={18}/>}
                            <div className="truncate">
                              <span className="block font-black uppercase text-xs text-white tracking-tight">{f.name}</span>
                              <span className="text-[8px] font-bold opacity-30 uppercase tracking-widest mt-0.5 block">0x{f.id.substring(0,8)}</span>
                            </div>
                          </div>
                          <ChevronRight size={16} className="opacity-0 group-hover:opacity-100 group-hover:translate-x-2 transition-all" />
                        </div>
                      ))
                    ) : !searchLoading && <div className="p-12 text-center opacity-30 text-[10px] font-black uppercase tracking-[0.5em] italic">No Match Found</div>
                  ) : <div className="p-12 text-center opacity-30 text-[10px] font-black uppercase tracking-[0.5em] italic">Initializing Scan...</div>}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* GLOBAL MARQUEE ANIMATION */}
        <style jsx global>{`
          @keyframes marquee {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
          .animate-marquee {
            animation: marquee 30s linear infinite;
            display: flex;
          }
          .scrollbar-hide::-webkit-scrollbar {
            display: none;
          }
          .scrollbar-hide {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
        `}</style>

      </div>
    </div>
  );
}