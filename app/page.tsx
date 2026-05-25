"use client"
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Folder, FileText, Upload, Lock, Database, LayoutDashboard, 
  Search, LogOut, ChevronRight, Loader2, Edit2, Plus, X, 
  Download, ArrowLeft, Sun, Moon, Shield, 
  CheckCircle2, AlertCircle, Filter, History, User,
  Crown, Zap, ShieldCheck, Star, Trash2
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

  // --- LOGIC: ADD ONLINE LOG ---
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
      <div className="relative min-h-screen w-full flex items-center justify-center p-4 bg-[#05070A] font-sans overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-amber-900/20 via-transparent to-transparent opacity-50"></div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative z-10 bg-[#0C0F16]/80 backdrop-blur-2xl p-12 rounded-[50px] shadow-[0_0_50px_rgba(245,158,11,0.1)] w-full max-w-md border border-amber-500/20 text-center">
          <div className="mb-10 flex justify-center">
             <div className="p-4 bg-amber-500/10 rounded-full border border-amber-500/20 shadow-[0_0_30px_rgba(245,158,11,0.2)]">
                <img src="https://i.ibb.co.com/L22pdJQ/Coat-of-arms-of-Southeast-Sulawesi-svg.png" alt="Logo" className="w-20 h-20 object-contain" />
             </div>
          </div>
          <h2 className="text-3xl font-black mb-1 text-white tracking-tighter italic uppercase">IMPERIAL <span className="text-amber-500">VAULT</span></h2>
          <p className="text-amber-500/40 mb-10 text-[9px] font-black uppercase tracking-[0.6em]">Digital Archive • Irban III</p>
          <form onSubmit={handleLogin} className="space-y-4">
            <input required type="text" placeholder="IDENTITAS USER" className="w-full p-5 rounded-2xl border border-amber-500/10 outline-none bg-white/5 text-white text-center font-bold placeholder:text-slate-600 focus:border-amber-500/50 transition-all text-xs uppercase tracking-widest" onChange={(e) => setTempName(e.target.value)} />
            <input required type="password" placeholder="KODE AKSES" className="w-full p-5 rounded-2xl border border-amber-500/10 outline-none bg-white/5 text-white text-center font-bold placeholder:text-slate-600 tracking-[0.8em] focus:border-amber-500/50 transition-all" onChange={(e) => setPassword(e.target.value)} />
            <button type="submit" className="w-full bg-gradient-to-r from-amber-600 to-yellow-500 text-slate-900 p-5 rounded-2xl font-black uppercase tracking-widest hover:shadow-[0_0_30px_rgba(245,158,11,0.3)] transition-all active:scale-95 text-xs">Authorize Entry</button>
          </form>
        </motion.div>
      </div>
    );
  }

  // --- DASHBOARD VIEW ---
  return (
    <div className={isDarkMode ? "dark" : ""}>
      <div className="h-screen bg-[#F8FAFC] dark:bg-[#05070A] flex text-slate-700 dark:text-slate-200 overflow-hidden font-sans transition-all duration-700">
        
        {/* SIDEBAR */}
        <aside className="w-80 bg-white dark:bg-[#080A0F] border-r border-slate-200 dark:border-amber-500/10 p-8 flex flex-col gap-10 relative z-20">
          <div className="flex flex-col items-center gap-5">
            <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-[28px] p-3 border border-slate-200 dark:border-amber-500/20 shadow-xl flex items-center justify-center">
               <img src="https://i.ibb.co.com/L22pdJQ/Coat-of-arms-of-Southeast-Sulawesi-svg.png" alt="Logo" className="w-full h-full object-contain" />
            </div>
            <div className="text-center">
              <h1 className="font-black text-2xl tracking-tighter text-slate-800 dark:text-white italic uppercase leading-none">ARV<span className="text-amber-500">DRIV3</span></h1>
              <p className="text-[9px] font-black text-amber-500/60 uppercase tracking-[0.3em] mt-3 italic">{userName}</p>
            </div>
          </div>
          
          <nav className="flex-1 space-y-2 font-black text-[10px] uppercase tracking-widest">
            <button onClick={goHome} className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all ${!currentFolder ? 'bg-amber-500 text-slate-900 shadow-xl shadow-amber-500/20' : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-amber-500/5'}`}>
              <LayoutDashboard size={18}/> Dashboard
            </button>
            <div className="pt-6 pb-2 px-4 text-[8px] text-slate-400 dark:text-amber-500/20 font-black tracking-[0.4em]">Nodes</div>
            <button onClick={() => setFilterType('all')} className={`w-full flex items-center gap-4 p-4 rounded-xl transition-all ${filterType === 'all' ? 'text-amber-500 bg-amber-500/5' : 'text-slate-400 hover:text-slate-600'}`}><Zap size={16}/> Semua</button>
            <button onClick={() => setFilterType('folder')} className={`w-full flex items-center gap-4 p-4 rounded-xl transition-all ${filterType === 'folder' ? 'text-amber-500 bg-amber-500/5' : 'text-slate-400 hover:text-slate-600'}`}><Folder size={16}/> Folder</button>
            <button onClick={() => setFilterType('file')} className={`w-full flex items-center gap-4 p-4 rounded-xl transition-all ${filterType === 'file' ? 'text-amber-500 bg-amber-500/5' : 'text-slate-400 hover:text-slate-600'}`}><FileText size={16}/> Dokumen</button>
            <button onClick={() => setIsLogModalOpen(true)} className="w-full flex items-center gap-4 p-4 text-slate-400 hover:bg-slate-100 dark:hover:bg-amber-500/5 rounded-2xl transition-all mt-4 border border-transparent dark:hover:border-amber-500/10">
              <History size={18}/> Online Log
            </button>
          </nav>

          <div className="p-8 bg-gradient-to-br from-amber-600 to-yellow-400 rounded-[40px] text-slate-900 shadow-2xl relative overflow-hidden group border border-white/10">
             <div className="relative z-10">
               <p className="text-[10px] font-black uppercase opacity-60 mb-1 tracking-[0.2em]">Matrix Size</p>
               <h4 className="text-4xl font-black tracking-tighter">{stats.total}</h4>
               <p className="text-[8px] mt-4 opacity-40 font-bold tracking-widest italic">SECURED ASSETS</p>
             </div>
             <Database className="absolute -right-8 -bottom-8 opacity-10 group-hover:rotate-12 transition-all duration-1000" size={150}/>
          </div>
          
          <button onClick={() => {sessionStorage.clear(); window.location.reload();}} className="flex items-center justify-center gap-3 p-5 bg-red-500/5 text-red-500 font-black uppercase text-[10px] tracking-widest rounded-2xl hover:bg-red-500 hover:text-white transition-all border border-red-500/10"><LogOut size={16}/> Sign Out</button>
        </aside>

        {/* MAIN AREA */}
        <main className="flex-1 flex flex-col min-w-0 transition-colors relative bg-white dark:bg-[#05070A]">
          <header className="p-10 flex justify-between items-center bg-white/80 dark:bg-[#05070A]/80 backdrop-blur-xl border-b border-slate-200 dark:border-amber-500/10 z-10">
            <div className="flex items-center gap-6">
              <AnimatePresence>
                {folderHistory.length > 0 && (
                  <motion.button initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.5 }} onClick={goBackOneLevel} className="p-4 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-amber-500/20 text-amber-500 hover:bg-amber-500 hover:text-white transition-all">
                    <ArrowLeft size={20} strokeWidth={3}/>
                  </motion.button>
                )}
              </AnimatePresence>
              <div>
                <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter uppercase italic leading-none">Smart <span className="text-amber-500">Vault</span></h1>
                <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 mt-2 uppercase tracking-widest leading-none">
                  <span className="hover:text-amber-500 cursor-pointer transition-colors" onClick={goHome}>CORE REPOSITORY</span>
                  {folderHistory.map((h, i) => (
                    <React.Fragment key={h.id + i}>
                      <ChevronRight size={10} className="text-slate-300"/> 
                      <span className={i === folderHistory.length -1 ? "text-amber-500 font-black" : ""}>{h.name}</span>
                    </React.Fragment>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-5 flex-1 max-w-xl px-12">
              <div className="flex-1 relative group cursor-pointer" onClick={() => setIsSearchModalOpen(true)}>
                <Search size={20} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-hover:text-amber-500 transition-colors" />
                <div className="w-full pl-16 pr-6 py-5 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-amber-500/10 rounded-[25px] text-slate-400 text-[10px] font-black uppercase tracking-widest transition-all group-hover:border-amber-500/30">Intelligence Scan...</div>
              </div>
              <button onClick={() => setIsDarkMode(!isDarkMode)} className="p-5 bg-white dark:bg-slate-800 shadow-xl border border-slate-200 dark:border-amber-500/10 rounded-[22px] text-slate-400 hover:scale-110 transition-all hover:text-amber-500">
                {isDarkMode ? <Sun size={20}/> : <Moon size={20}/>}
              </button>
            </div>

            {userRole === 'admin' && (
              <button onClick={() => {setUploadDestinationId(currentFolder); setIsUploadModalOpen(true);}} className="flex items-center gap-4 bg-slate-900 dark:bg-amber-500 dark:text-slate-900 text-white px-10 py-5 rounded-[22px] font-black uppercase text-[10px] tracking-widest shadow-xl hover:translate-y-[-3px] transition-all">
                <Plus size={18} strokeWidth={4} /> New Record
              </button>
            )}
          </header>

          <div className="flex-1 overflow-y-auto p-12 scrollbar-hide">
            {loading ? (
              <div className="h-full flex flex-col items-center justify-center gap-6 italic">
                <Loader2 className="animate-spin text-amber-500" size={50} />
                <p className="font-black text-[10px] uppercase tracking-[0.5em] text-slate-400">Synchronizing Matrix...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-10 pb-20">
                {filteredFiles.map((file) => (
                  <motion.div 
                    key={file.id} 
                    whileHover={{ y: -8, scale: 1.02 }}
                    className={`relative group bg-white dark:bg-[#0C0F16]/50 backdrop-blur-xl p-8 rounded-[45px] border transition-all cursor-pointer h-72 flex flex-col justify-between ${selectedFile?.id === file.id ? 'border-amber-500 ring-4 ring-amber-500/10 shadow-2xl' : 'border-slate-100 dark:border-amber-500/5 shadow-2xl hover:border-amber-500/30'}`}
                    onClick={() => file.mimeType.includes('folder') ? navigateToFolder(file.id, file.name) : setSelectedFile(file)}
                  >
                    <div className="flex justify-between items-start">
                      <div className={`p-5 rounded-[25px] shadow-lg transition-transform duration-500 group-hover:rotate-[10deg] ${file.mimeType.includes('folder') ? 'bg-amber-500 text-slate-900' : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-amber-500'}`}>
                        {file.mimeType.includes('folder') ? <Folder size={32} fill="currentColor" /> : <FileText size={32} />}
                      </div>
                      <div className="flex flex-col gap-3 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                        {!file.mimeType.includes('folder') && (
                          <button onClick={(e) => { e.stopPropagation(); addOnlineLog("DOWNLOAD", file.name); window.open(`https://drive.google.com/uc?export=download&id=${file.id}`, '_blank'); }} className="p-3 bg-white dark:bg-slate-700 rounded-xl text-slate-400 hover:text-amber-500 shadow-xl border border-slate-100 dark:border-amber-500/20 transition-colors"><Download size={18}/></button>
                        )}
                        {userRole === 'admin' && (
                          <>
                            <button onClick={(e) => { e.stopPropagation(); handleRename(file.id, file.name); }} className="p-3 bg-white dark:bg-slate-700 rounded-xl text-slate-400 hover:text-blue-500 shadow-xl border border-slate-100 dark:border-amber-500/20"><Edit2 size={18}/></button>
                            <button onClick={(e) => { e.stopPropagation(); handleDelete(file.id, file.name); }} className="p-3 bg-white dark:bg-slate-700 rounded-xl text-slate-400 hover:text-red-500 shadow-xl border border-slate-100 dark:border-amber-500/20"><Trash2 size={18}/></button>
                          </>
                        )}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-black text-slate-900 dark:text-white truncate text-lg uppercase tracking-tighter leading-tight">{file.name}</h4>
                      <div className="flex items-center gap-2 mt-4">
                         <span className="text-[8px] font-black uppercase tracking-widest py-1.5 px-4 bg-slate-100 dark:bg-amber-500/5 rounded-full text-slate-500 dark:text-amber-500/60 inline-block border border-transparent dark:border-amber-500/10">
                           {file.mimeType.includes('folder') ? 'DIRECTORY' : 'PDF ARCHIVE'}
                         </span>
                         <Star size={10} className="text-amber-500/20" />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </main>

        {/* LOG MODAL */}
        <AnimatePresence>
          {isLogModalOpen && (
            <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-slate-950/90 backdrop-blur-2xl" onClick={() => setIsLogModalOpen(false)}>
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-white dark:bg-[#080A0F] border border-amber-500/20 w-full max-w-5xl rounded-[50px] shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
                <div className="p-10 border-b border-slate-100 dark:border-amber-500/10 flex justify-between items-center bg-slate-50 dark:bg-[#0C0F16]">
                  <h3 className="text-2xl font-black uppercase tracking-tighter dark:text-white flex items-center gap-4"><Crown className="text-amber-500" /> System Ledger</h3>
                  <div className="flex items-center gap-6">
                    {logsLoading && <Loader2 className="animate-spin text-amber-500" size={20}/>}
                    <button onClick={() => setIsLogModalOpen(false)} className="p-3 hover:bg-red-500/10 text-slate-400 hover:text-red-500 rounded-full transition-all"><X size={24}/></button>
                  </div>
                </div>
                <div className="overflow-x-auto max-h-[65vh] p-6">
                  <table className="w-full text-left border-collapse min-w-[800px]">
                    <thead className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400">
                      <tr>
                        <th className="p-6 border-b dark:border-amber-500/10">Operator</th>
                        <th className="p-6 border-b dark:border-amber-500/10">Action</th>
                        <th className="p-6 border-b dark:border-amber-500/10">Document</th>
                        <th className="p-6 border-b dark:border-amber-500/10">Terminal</th>
                        <th className="p-6 border-b dark:border-amber-500/10">Timestamp</th>
                      </tr>
                    </thead>
                    <tbody className="text-[11px] font-bold">
                      {activityLogs.map((log) => (
                        <tr key={log.id} className="border-b border-slate-50 dark:border-amber-500/5 text-slate-600 dark:text-slate-300 hover:bg-amber-500/5 transition-colors">
                          <td className="p-6 text-amber-600">{log.user}</td>
                          <td className="p-6">
                            <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase text-white ${log.action === 'DELETE' ? 'bg-red-500' : log.action === 'UPLOAD' ? 'bg-emerald-500' : 'bg-slate-800 dark:bg-amber-500'}`}>
                              {log.action}
                            </span>
                          </td>
                          <td className="p-6 max-w-[200px] truncate italic opacity-80">{log.fileName}</td>
                          <td className="p-6 opacity-40 font-mono tracking-tighter">{log.device}</td>
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
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/90 backdrop-blur-2xl">
              <motion.div initial={{ scale: 0.8, y: 50 }} animate={{ scale: 1, y: 0 }} className="bg-white dark:bg-[#080A0F] rounded-[60px] p-16 w-full max-w-2xl relative border border-amber-500/20 shadow-2xl">
                <button onClick={() => setIsUploadModalOpen(false)} className="absolute right-12 top-12 text-slate-400 hover:text-amber-500 transition-all"><X size={32}/></button>
                <div className="text-center mb-12">
                   <h3 className="text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tighter italic">Vault <span className="text-amber-500">Deposit</span></h3>
                   <p className="text-[10px] text-amber-500/60 font-black uppercase tracking-[0.5em] mt-3">Imperial Security Protocol</p>
                </div>
                {uploadStatus === 'idle' ? (
                  <div className="space-y-10">
                    <select value={uploadDestinationId} onChange={(e) => setUploadDestinationId(e.target.value)} className="w-full p-6 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-amber-500/10 outline-none font-black text-[11px] text-slate-600 dark:text-slate-300 cursor-pointer focus:border-amber-500 transition-all uppercase tracking-widest">
                      <option value="">🏠 Root Archive</option>
                      {allFolders.map(f => (<option key={f.id} value={f.id} className="bg-[#0C0F16] text-white">📁 {f.name.toUpperCase()}</option>))}
                    </select>
                    <label className="flex flex-col items-center justify-center w-full h-80 border-4 border-dashed border-slate-100 dark:border-amber-500/10 rounded-[50px] cursor-pointer hover:bg-amber-500/5 transition-all text-center p-8 group">
                      {uploading ? (
                        <div className="w-full text-center px-10">
                          <Loader2 className="animate-spin mx-auto text-amber-500 mb-8" size={60} />
                          <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden mb-5">
                             <motion.div initial={{ width: 0 }} animate={{ width: `${uploadProgress}%` }} className="h-full bg-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.5)]" />
                          </div>
                          <p className="text-[10px] font-black uppercase text-amber-500 tracking-[0.5em]">{uploadProgress}% ENCRYPTING...</p>
                        </div>
                      ) : (
                        <><div className="p-8 bg-amber-500 rounded-[35px] text-slate-900 mb-8 shadow-xl group-hover:scale-110 transition-all duration-500"><Upload size={40} strokeWidth={3}/></div><p className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Initiate Bulk Submission</p><input type="file" multiple className="hidden" onChange={handleUpload} disabled={uploading} /></>
                      )}
                    </label>
                  </div>
                ) : (
                  <div className="text-center py-20">
                    {uploadStatus === 'success' ? (
                      <motion.div initial={{ scale: 0.5 }} animate={{ scale: 1 }}><ShieldCheck size={100} className="text-amber-500 mx-auto mb-8 shadow-2xl" /><h3 className="text-3xl font-black dark:text-white uppercase tracking-tighter italic">Submission <span className="text-amber-500">Verified</span></h3></motion.div>
                    ) : (
                      <motion.div initial={{ scale: 0.5 }} animate={{ scale: 1 }}><AlertCircle size={100} className="text-red-500 mx-auto mb-8" /><h3 className="text-3xl font-black dark:text-white uppercase tracking-tighter">Auth Failure</h3></motion.div>
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
            <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }} className="w-[750px] bg-white dark:bg-[#080A0F] backdrop-blur-3xl shadow-[-50px_0_100px_rgba(0,0,0,0.4)] border-l border-slate-100 dark:border-amber-500/10 flex flex-col overflow-hidden relative z-30">
               <div className="p-10 border-b border-slate-100 dark:border-amber-500/10 flex items-center justify-between bg-slate-50 dark:bg-[#0C0F16]">
                  <div className="flex items-center gap-6 overflow-hidden">
                    <div className="p-4 bg-amber-500 rounded-2xl text-slate-900 shadow-xl"><FileText size={28}/></div>
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-600 block mb-1">Authenticated Document</span>
                      <span className="font-black text-lg truncate uppercase tracking-tighter text-slate-900 dark:text-white block leading-none">{selectedFile.name}</span>
                    </div>
                  </div>
                  <button onClick={() => { setSelectedFile(null); setPreviewLoading(true); }} className="p-4 text-slate-400 hover:text-red-500 transition-all bg-slate-100 dark:bg-slate-800 rounded-2xl"><X size={28}/></button>
               </div>
               <div className="flex-1 relative m-10">
                  {previewLoading && (
                    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 rounded-[50px] border border-amber-500/5">
                      <Loader2 className="animate-spin text-amber-500 mb-6" size={48} />
                      <p className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-500 italic">Authorizing Stream...</p>
                    </div>
                  )}
                  <iframe src={`https://drive.google.com/file/d/${selectedFile.id}/preview`} className="w-full h-full rounded-[50px] overflow-hidden bg-white dark:bg-slate-950 border border-amber-500/10 shadow-2xl" title="Live Sync" style={{ opacity: previewLoading ? 0 : 1 }} onLoad={() => setPreviewLoading(false)} />
               </div>
               <div className="p-10 bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl border-t border-slate-100 dark:border-amber-500/10">
                 <button onClick={() => { addOnlineLog("DOWNLOAD", selectedFile.name); window.open(`https://drive.google.com/uc?export=download&id=${selectedFile.id}`, '_blank'); }} className="w-full py-7 bg-slate-900 dark:bg-amber-500 text-white dark:text-slate-900 rounded-[30px] font-black text-[11px] uppercase tracking-[0.5em] flex items-center justify-center gap-4 active:scale-95 transition-all shadow-xl"><Download size={22} strokeWidth={4}/> Authorized Retrieval</button>
               </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* SEARCH SPOTLIGHT */}
        <AnimatePresence>
          {isSearchModalOpen && (
            <div className="fixed inset-0 z-[200] flex items-start justify-center pt-32 px-4 bg-slate-950/80 backdrop-blur-xl" onClick={() => setIsSearchModalOpen(false)}>
              <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className="bg-white dark:bg-[#080A0F] border border-amber-500/20 w-full max-w-2xl rounded-[35px] shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
                <div className="p-8 flex items-center gap-6 border-b border-slate-100 dark:border-amber-500/10">
                  <Search className="text-amber-500" size={28} />
                  <input autoFocus type="text" placeholder="Intelligence Search..." className="flex-1 bg-transparent outline-none font-black text-xl text-slate-900 dark:text-white uppercase tracking-tighter" onChange={(e) => setSearchTerm(e.target.value)} />
                </div>
                <div className="max-h-[400px] overflow-y-auto p-6 space-y-2 scrollbar-hide">
                  {files.filter(f => f.name.toLowerCase().includes(searchTerm.toLowerCase())).map(f => (
                    <div key={f.id} onClick={() => { if(f.mimeType.includes('folder')) navigateToFolder(f.id, f.name); else setSelectedFile(f); setIsSearchModalOpen(false); }} className="p-5 hover:bg-amber-500 hover:text-slate-900 rounded-2xl cursor-pointer flex items-center justify-between group transition-all font-black text-sm uppercase tracking-tighter text-slate-500 dark:text-slate-400">
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