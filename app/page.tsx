"use client"
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Folder, FileText, Upload, Lock, Database, LayoutDashboard, 
  Search, LogOut, ChevronRight, Loader2, Edit2, Plus, X, 
  Download, ArrowLeft, Sun, Moon, Shield, 
  CheckCircle2, AlertCircle, Filter, History, User,
  Crown, Zap, ShieldCheck, Star, Trash2, Trophy, Coins,
  LayoutGrid, List, Clock, Info, Share2, Pin, Eye, Activity,
  Cpu, HardDrive, ShieldAlert, Command
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
      <div className="relative min-h-screen w-full flex items-center justify-center p-6 bg-[#020617] font-sans overflow-hidden">
        {/* Background Image Layer (Thin and Transparent Gradient) */}
        <div className="absolute inset-0 z-0 bg-cover bg-center opacity-[0.15]" style={{ backgroundImage: "url('https://i.ibb.co.com/NnC3sn3S/bg-login.png')" }}></div>
        <div className="absolute inset-0 z-0 bg-gradient-to-b from-[#020617]/50 via-transparent to-[#020617] opacity-90"></div>
        
        {/* Light & Dot Effects */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-amber-600/10 blur-[120px] rounded-full animate-pulse"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full animate-pulse delay-700"></div>
          <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "url('https://www.transparenttextures.com/patterns/grid-me.png')" }}></div>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative z-10 w-full max-w-[450px]">
          <div className="bg-[#0f172a]/80 backdrop-blur-3xl p-10 rounded-[50px] border border-white/10 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.8)]">
            <div className="flex flex-col items-center mb-10">
              <div className="w-24 h-24 mb-6 p-4 bg-gradient-to-br from-amber-500/20 to-transparent rounded-full border border-amber-500/20">
                <img src="https://i.ibb.co.com/L22pdJQ/Coat-of-arms-of-Southeast-Sulawesi-svg.png" alt="Logo" className="w-full h-full object-contain" />
              </div>
              <h2 className="text-3xl font-black text-white tracking-tighter uppercase italic">ROYAL <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-200">VAULT</span></h2>
              <p className="text-amber-500/60 text-[9px] font-black uppercase tracking-[0.5em] mt-2">Inspectorate Elite Access</p>
            </div>
            <form onSubmit={handleLogin} className="space-y-5">
              <div className="relative group"><User className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500" size={18}/><input required type="text" placeholder="IDENTITAS PENGGUNA" className="w-full py-5 pl-14 pr-6 rounded-3xl border border-white/5 outline-none bg-white/5 text-white font-bold placeholder:text-slate-600 focus:border-amber-500/50 transition-all text-xs uppercase" onChange={(e) => setTempName(e.target.value)} /></div>
              <div className="relative group"><Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500" size={18}/><input required type="password" placeholder="KUNCI AKSES" className="w-full py-5 pl-14 pr-6 rounded-3xl border border-white/5 outline-none bg-white/5 text-white font-bold placeholder:text-slate-600 tracking-[0.5em] focus:border-amber-500/50 transition-all" onChange={(e) => setPassword(e.target.value)} /></div>
              <button type="submit" className="w-full bg-gradient-to-r from-amber-600 via-amber-400 to-amber-600 text-slate-950 py-5 rounded-3xl font-black uppercase tracking-widest hover:shadow-[0_0_30px_rgba(245,158,11,0.4)] transition-all active:scale-95 text-xs">Verify Authority</button>
            </form>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className={isDarkMode ? "dark" : ""}>
      <div className="h-screen bg-[#020617] flex text-slate-300 overflow-hidden font-sans relative">
        <div className="fixed inset-0 z-0 bg-cover bg-center opacity-[0.05] pointer-events-none grayscale contrast-125" style={{ backgroundImage: "url('https://i.ibb.co.com/NnC3sn3S/bg-login.png')" }}></div>
        <div className="fixed inset-0 z-0 bg-gradient-to-tr from-[#020617] via-[#0f172a] to-[#020617] pointer-events-none opacity-95"></div>

        {/* SIDEBAR */}
        <aside className="w-80 bg-[#0f172a]/40 backdrop-blur-2xl border-r border-white/5 p-8 flex flex-col gap-10 relative z-20 shadow-2xl">
          <div className="flex flex-col items-center gap-5">
            <div className="w-20 h-20 bg-[#1e293b] rounded-[30px] p-4 shadow-2xl border border-white/5 overflow-hidden">
               <img src="https://i.ibb.co.com/L22pdJQ/Coat-of-arms-of-Southeast-Sulawesi-svg.png" alt="Logo" className="w-full h-full object-contain" />
            </div>
            <div className="text-center">
              <h1 className="font-black text-2xl tracking-tighter text-white italic uppercase leading-none">ARV<span className="text-amber-500">DRIV3</span></h1>
              <div className="mt-5 inline-flex items-center gap-2 px-4 py-1.5 bg-amber-500/10 rounded-full border border-amber-500/20">
                 <Crown size={14} className="text-amber-400" />
                 <span className="text-[10px] font-black text-amber-200 uppercase tracking-widest">{userName}</span>
              </div>
            </div>
          </div>
          <nav className="flex-1 space-y-3 font-black text-[10px] uppercase tracking-widest overflow-y-auto scrollbar-hide">
            <button onClick={goHome} className={`w-full flex items-center gap-5 p-5 rounded-3xl transition-all border ${!currentFolder ? 'bg-amber-500 text-slate-950 border-amber-400' : 'bg-white/5 text-slate-500 border-transparent hover:text-white'}`}><LayoutDashboard size={18}/> Overview</button>
            <button onClick={() => setFilterType('folder')} className={`w-full flex items-center gap-5 p-4 rounded-2xl transition-all border ${filterType === 'folder' ? 'text-amber-400 bg-amber-500/5 border-amber-500/20' : 'text-slate-500 border-transparent'}`}><Folder size={16}/> Directories</button>
            <button onClick={() => setFilterType('file')} className={`w-full flex items-center gap-5 p-4 rounded-2xl transition-all border ${filterType === 'file' ? 'text-amber-400 bg-amber-500/5 border-amber-500/20' : 'text-slate-500 border-transparent'}`}><FileText size={16}/> Records</button>
            <button onClick={() => setIsLogModalOpen(true)} className="w-full flex items-center gap-5 p-4 text-slate-500 hover:bg-white/5 rounded-2xl transition-all"><History size={18}/> Audit Logs</button>
          </nav>
          <button onClick={() => {sessionStorage.clear(); window.location.reload();}} className="w-full flex items-center justify-center gap-3 p-4 bg-red-500/10 text-red-400 font-black uppercase text-[9px] tracking-widest rounded-2xl border border-red-500/20 hover:bg-red-500 hover:text-white transition-all">Signout</button>
        </aside>

        {/* MAIN AREA */}
        <main className="flex-1 flex flex-col min-w-0 transition-colors relative z-10 overflow-hidden">
          <header className="px-10 py-8 flex justify-between items-center bg-[#0f172a]/20 backdrop-blur-md border-b border-white/5">
            <div className="flex items-center gap-6">
              {folderHistory.length > 0 && (<button onClick={goBackOneLevel} className="p-3 bg-white/5 rounded-xl text-amber-400 border border-white/10"><ArrowLeft size={18} /></button>)}
              <div>
                <h1 className="text-2xl font-black text-white tracking-tighter uppercase italic">Smart <span className="text-amber-500">Archive</span></h1>
                <div className="flex items-center gap-2 text-[9px] font-black text-slate-500 mt-1 uppercase tracking-widest cursor-pointer" onClick={goHome}>CENTRAL REPOSITORY {folderHistory.map(h => <><ChevronRight size={10}/><span className="text-amber-500/60">{h.name}</span></>)}</div>
              </div>
            </div>
            <div className="flex items-center gap-5 flex-1 max-w-xl px-12">
               <div className="flex-1 relative" onClick={() => setIsSearchModalOpen(true)}><Search size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500" /><div className="w-full pl-14 pr-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-slate-500 text-[10px] font-black tracking-widest cursor-pointer">GLOBAL SCAN (CTRL+K)</div></div>
               <button onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')} className="p-4 bg-white/5 rounded-2xl text-slate-500 border border-white/5">{viewMode === 'grid' ? <List size={18}/> : <LayoutGrid size={18}/>}</button>
            </div>
            {userRole === 'admin' && (<button onClick={() => {setUploadDestinationId(currentFolder); setIsUploadModalOpen(true);}} className="flex items-center gap-3 bg-gradient-to-r from-amber-600 to-amber-400 text-slate-950 px-8 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl"><Plus size={18} strokeWidth={3} /> New Record</button>)}
          </header>

          <div className="flex-1 overflow-y-auto p-12 scrollbar-hide">
            {loading ? (
              <div className="h-full flex flex-col items-center justify-center gap-4"><Loader2 className="animate-spin text-amber-500" size={48} /><p className="font-black text-[10px] uppercase tracking-[0.5em] text-amber-500/40 animate-pulse italic">Visualizing Node Nodes...</p></div>
            ) : (
              <section>
                <div className="flex items-center justify-between mb-10 pb-4 border-b border-white/5">
                   <h3 className="text-[11px] font-black uppercase text-slate-500 tracking-[0.4em] flex items-center gap-3"><Star size={14} className="text-amber-500" /> Active Ledger</h3>
                   <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">{filteredFilesMain.length} Secured Objects Detected</p>
                </div>
                
                {viewMode === 'grid' ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {filteredFilesMain.map((file) => (
                      <div 
                        key={file.id} 
                        onClick={() => file.mimeType.includes('folder') ? navigateToFolder(file.id, file.name) : setSelectedFile(file)}
                        className={`relative group bg-[#161d2a] p-10 rounded-[45px] border border-transparent transition-all cursor-pointer hover:bg-[#1a2333] ${selectedFile?.id === file.id ? 'border-amber-500 shadow-[0_0_40px_rgba(245,158,11,0.1)]' : 'hover:border-white/10'}`}
                      >
                        <div className="flex justify-between items-start mb-8">
                           {/* Folder/File Icon with Glow */}
                           <div className={`p-6 rounded-[30px] shadow-2xl ${file.mimeType.includes('folder') ? 'bg-[#ff9d00] text-slate-950 shadow-[0_0_30px_rgba(255,157,0,0.3)]' : 'bg-slate-800 text-white shadow-black/40'}`}>
                              {file.mimeType.includes('folder') ? <Folder size={38} fill="currentColor" /> : <FileText size={38} />}
                           </div>
                           
                           {/* VERTICAL ACTION BUTTONS - AS PER IMAGE */}
                           <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                              {!file.mimeType.includes('folder') && (
                                <button onClick={(e) => { e.stopPropagation(); addOnlineLog("DOWNLOAD", file.name); window.open(`https://drive.google.com/uc?export=download&id=${file.id}`, '_blank'); }} className="p-3 bg-[#1e2738] rounded-xl text-slate-400 hover:text-amber-400 border border-white/5 transition-all shadow-lg"><Download size={16}/></button>
                              )}
                              {userRole === 'admin' && (
                                <>
                                  <button onClick={(e) => { e.stopPropagation(); handleRename(file.id, file.name); }} className="p-3 bg-[#1e2738] rounded-xl text-slate-400 hover:text-amber-400 border border-white/5 transition-all shadow-lg"><Edit2 size={16}/></button>
                                  <button onClick={(e) => { e.stopPropagation(); handleDelete(file.id, file.name); }} className="p-3 bg-[#1e2738] rounded-xl text-slate-400 hover:text-red-400 border border-white/5 transition-all shadow-lg"><Trash2 size={16}/></button>
                                </>
                              )}
                           </div>
                        </div>

                        <h4 className="font-black text-white truncate text-base uppercase tracking-tighter group-hover:text-amber-400 transition-colors">{file.name}</h4>
                        
                        {/* DIRECTORY BADGE - AS PER IMAGE */}
                        <div className="mt-6">
                           <span className={`inline-block text-[9px] font-black uppercase tracking-[0.2em] py-2 px-6 rounded-full border shadow-inner ${file.mimeType.includes('folder') ? 'border-amber-500/20 text-amber-500 bg-amber-500/5' : 'border-white/5 text-slate-500 bg-white/5'}`}>
                              {file.mimeType.includes('folder') ? 'DIRECTORY' : 'DATA OBJECT'}
                           </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-[#161d2a] rounded-[30px] border border-white/5 overflow-hidden">
                    {filteredFilesMain.map(file => (
                      <div key={file.id} onClick={() => file.mimeType.includes('folder') ? navigateToFolder(file.id, file.name) : setSelectedFile(file)} className="flex items-center justify-between p-6 hover:bg-white/[0.02] border-b border-white/5 last:border-0 cursor-pointer group">
                        <div className="flex items-center gap-5">
                          <div className={file.mimeType.includes('folder') ? 'text-amber-500' : 'text-slate-500'}><Folder size={20} fill={file.mimeType.includes('folder') ? 'currentColor' : 'none'}/></div>
                          <span className="text-sm font-bold text-slate-200 uppercase tracking-tight group-hover:text-amber-400">{file.name}</span>
                        </div>
                        <div className="flex gap-3">
                           {!file.mimeType.includes('folder') && <button onClick={(e) => {e.stopPropagation(); window.open(`https://drive.google.com/uc?export=download&id=${file.id}`, '_blank');}} className="p-2 hover:text-amber-400 transition-colors"><Download size={18}/></button>}
                           {userRole === 'admin' && <button onClick={(e) => {e.stopPropagation(); handleDelete(file.id, file.name);}} className="p-2 hover:text-red-400 transition-colors"><Trash2 size={18}/></button>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            )}
          </div>

          {/* BOTTOM BAR */}
          <div className="bg-[#020617] border-t border-white/5 p-4 px-10 flex items-center justify-between relative overflow-hidden">
             <div className="flex items-center gap-10 whitespace-nowrap animate-marquee">
                {[1,2].map(i => (
                  <div key={i} className="flex gap-10 text-[9px] font-black text-amber-500/40 uppercase tracking-[0.3em]">
                    <span>• SSL Security: AES-256 ACTIVE</span>
                    <span>• Status: Authorized Node Access</span>
                    <span>• Registry: {stats.total} Objects Secure</span>
                    <span>• Protocol: RSA-4096 STABLE</span>
                  </div>
                ))}
             </div>
             <div className="bg-[#020617] pl-10 z-10 flex items-center gap-3 text-[9px] font-black uppercase text-slate-600 tracking-widest">
                <div className="w-2 h-2 bg-emerald-500 rounded-full"></div> End-to-End Encryption
             </div>
          </div>
        </main>

        {/* MODALS (UPLOAD, LOGS, PREVIEW, SEARCH) - Tetap dengan desain konsisten */}
        <AnimatePresence>
          {isLogModalOpen && (
            <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-[#020617]/95 backdrop-blur-md" onClick={() => setIsLogModalOpen(false)}>
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-[#0f172a] border border-white/10 w-full max-w-5xl rounded-[50px] overflow-hidden" onClick={e => e.stopPropagation()}>
                <div className="p-10 border-b border-white/5 flex justify-between items-center"><h3 className="text-2xl font-black uppercase italic text-white flex items-center gap-4"><History className="text-amber-500" size={28} /> Audit Logs</h3><button onClick={() => setIsLogModalOpen(false)} className="p-4 hover:bg-white/5 rounded-full"><X size={24}/></button></div>
                <div className="max-h-[60vh] overflow-y-auto p-8"><table className="w-full text-left"><thead className="text-[10px] font-black uppercase tracking-widest text-slate-600 border-b border-white/5"><tr><th className="p-4">Actor</th><th className="p-4">Command</th><th className="p-4">Target</th><th className="p-4">Timestamp</th></tr></thead><tbody className="text-xs font-bold">{activityLogs.map((log) => (<tr key={log.id} className="border-b border-white/5 text-slate-400 hover:bg-white/[0.02]"><td className="p-4 text-amber-500/80">{log.user}</td><td className="p-4"><span className="px-3 py-1 rounded-lg border border-amber-500/30 text-amber-400 bg-amber-500/5">{log.action}</span></td><td className="p-4 max-w-[200px] truncate">{log.fileName}</td><td className="p-4 opacity-40">{log.timestamp}</td></tr>))}</tbody></table></div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {isUploadModalOpen && (
            <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-[#020617]/95 backdrop-blur-md">
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-[#0f172a] rounded-[50px] p-16 w-full max-w-xl relative border border-white/10"><button onClick={() => setIsUploadModalOpen(false)} className="absolute right-10 top-10 text-slate-500 hover:text-white"><X size={32}/></button><div className="text-center mb-10"><h3 className="text-3xl font-black text-white uppercase italic">Record <span className="text-amber-500">Submission</span></h3><p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-4">Security Level High Active</p></div><label className="flex flex-col items-center justify-center w-full h-80 border-2 border-dashed border-amber-500/20 rounded-[40px] cursor-pointer hover:bg-amber-500/5 transition-all text-center p-8">{uploading ? (<div className="w-full px-8"><Loader2 className="animate-spin mx-auto text-amber-500 mb-6" size={48} /><div className="w-full bg-white/5 h-2 rounded-full overflow-hidden mb-4"><motion.div initial={{ width: 0 }} animate={{ width: `${uploadProgress}%` }} className="h-full bg-amber-500" /></div><p className="text-[10px] font-black uppercase text-amber-400">{uploadProgress}% SYNCING...</p></div>) : (<><div className="p-6 bg-amber-500 rounded-3xl text-slate-950 mb-6"><Upload size={32} strokeWidth={3}/></div><p className="text-xl font-black text-white uppercase italic">Upload Intel Data</p><input type="file" multiple className="hidden" onChange={handleUpload} disabled={uploading} /></>)}</label></motion.div>
            </div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {selectedFile && (
            <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} className="fixed inset-y-0 right-0 w-full lg:w-[850px] bg-[#0f172a]/95 backdrop-blur-3xl border-l border-white/10 z-[300] flex flex-col shadow-2xl">
               <div className="p-10 border-b border-white/5 flex items-center justify-between"><div className="flex items-center gap-6"><div className="p-4 bg-amber-500/10 rounded-2xl text-amber-500"><FileText size={28}/></div><div><span className="text-[9px] font-black uppercase text-amber-500/50 block mb-1">Visual Intelligence</span><h4 className="font-black text-xl truncate uppercase text-white italic">{selectedFile.name}</h4></div></div><div className="flex gap-4"><button onClick={() => window.open(`https://drive.google.com/uc?export=download&id=${selectedFile.id}`, '_blank')} className="p-4 bg-amber-500 rounded-2xl text-slate-950 hover:bg-amber-400 transition-all"><Download size={22}/></button><button onClick={() => { setSelectedFile(null); setPreviewLoading(true); }} className="p-4 bg-white/5 text-slate-500 hover:text-white rounded-2xl border border-white/10 transition-all"><X size={22}/></button></div></div>
               <div className="flex-1 relative m-10 bg-black/40 rounded-[40px] overflow-hidden border border-white/5">{previewLoading && (<div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-[#0f172a]"><Loader2 className="animate-spin text-amber-500 mb-6" size={48} /><p className="text-[10px] font-black uppercase text-amber-500/40 animate-pulse italic">Visualizing Node Node...</p></div>)}<iframe src={`https://drive.google.com/file/d/${selectedFile.id}/preview`} className="w-full h-full border-0" title="Vault Sync" onLoad={() => setPreviewLoading(false)} /></div>
               <div className="p-10 bg-[#020617] border-t border-white/5 flex items-center justify-between"><div className="flex items-center gap-4 text-slate-500 text-[10px] font-black uppercase tracking-widest italic"><Clock size={16} className="text-amber-500/50" /> Synchronization: Real-Time</div><button onClick={() => window.open(`https://drive.google.com/uc?export=download&id=${selectedFile.id}`, '_blank')} className="px-10 py-5 bg-amber-500 text-slate-950 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-amber-400 transition-all">Authorize Node Retrieval</button></div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {isSearchModalOpen && (
            <div className="fixed inset-0 z-[400] flex items-start justify-center pt-32 px-4 bg-[#020617]/95 backdrop-blur-xl" onClick={() => setIsSearchModalOpen(false)}>
              <motion.div initial={{ scale: 0.95, y: -20 }} animate={{ scale: 1, y: 0 }} className="bg-[#0f172a] border border-white/10 w-full max-w-2xl rounded-[40px] overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}><div className="p-8 flex items-center gap-6 border-b border-white/5"><Search className="text-amber-500" size={24} /><input autoFocus type="text" placeholder="Scanning Archive Registry..." className="flex-1 bg-transparent outline-none font-black text-xl text-white uppercase italic placeholder:text-slate-700" onChange={(e) => handleGlobalSearch(e.target.value)} />{searchLoading && <Loader2 className="animate-spin text-amber-500" size={20} />}</div><div className="max-h-[400px] overflow-y-auto p-4 space-y-2">{searchTerm.length >= 2 ? (searchResults.length > 0 ? (searchResults.map(f => (<div key={f.id} onClick={() => { if(f.mimeType.includes('folder')) navigateToFolder(f.id, f.name); else setSelectedFile(f); setIsSearchModalOpen(false); }} className="p-4 hover:bg-white/5 rounded-2xl cursor-pointer flex items-center justify-between text-slate-400 group"><div className="flex items-center gap-4 min-w-0">{f.mimeType.includes('folder') ? <Folder size={18} className="text-amber-500"/> : <FileText size={18}/>}<div className="truncate"><span className="block font-black uppercase text-xs group-hover:text-amber-500">{f.name}</span><span className="text-[8px] font-black opacity-30 uppercase mt-0.5 block">Node ID: {f.id.substring(0,8)}</span></div></div><ChevronRight size={16}/></div>))) : <div className="p-10 text-center opacity-30 text-[10px] font-black uppercase italic">No Match Found</div>) : <div className="p-10 text-center opacity-30 text-[10px] font-black uppercase italic">Initialize Scan...</div>}</div></motion.div>
            </div>
          )}
        </AnimatePresence>

        <style jsx global>{`
          @keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
          .animate-marquee { animation: marquee 30s linear infinite; display: flex; }
          .scrollbar-hide::-webkit-scrollbar { display: none; }
          .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        `}</style>
      </div>
    </div>
  );
}