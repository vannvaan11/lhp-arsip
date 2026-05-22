"use client"
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Folder, FileText, Upload, Lock, Database, LayoutDashboard, 
  Search, LogOut, ChevronRight, Loader2, Edit2, Plus, X, Eye,
  Download, Clock, ArrowLeft, Sun, Moon, HardDrive, Shield, 
  CheckCircle2, AlertCircle, Command, Trash2, Filter, History, User
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
  const [isDarkMode, setIsDarkMode] = useState(false);

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

  // --- INITIALIZATION ---
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
    const savedLogs = localStorage.getItem('drive_logs');
    
    if (savedLogin === 'true' && savedRole && savedName) {
      setIsLoggedIn(true);
      setUserRole(savedRole as 'admin' | 'user');
      setUserName(savedName);
    }
    if (savedTheme === 'dark') setIsDarkMode(true);
    if (savedLogs) setActivityLogs(JSON.parse(savedLogs));

    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  // --- LOGGING HELPER ---
  const addLog = (action: string, fileName: string) => {
    const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : "Unknown";
    let deviceDesc = "PC / Desktop";
    if (userAgent.includes("Android")) deviceDesc = "Smartphone Android";
    else if (userAgent.includes("iPhone")) deviceDesc = "Apple iPhone";
    else if (userAgent.includes("Macintosh")) deviceDesc = "MacBook/Mac";

    const newLog: ActivityLog = {
      id: Math.random().toString(36).substr(2, 9),
      action,
      fileName,
      timestamp: new Date().toLocaleString('id-ID'),
      user: userName || sessionStorage.getItem('userName') || "Guest",
      device: deviceDesc
    };
    const updatedLogs = [newLog, ...activityLogs].slice(0, 100);
    setActivityLogs(updatedLogs);
    localStorage.setItem('drive_logs', JSON.stringify(updatedLogs));
  };

  // --- DATA FETCHING ---
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

  // --- NAVIGATION ---
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

  // --- ACTIONS ---
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
    addLog("LOGIN", "Masuk ke Dashboard");
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
        if (res.ok) { success++; addLog("UPLOAD", selectedFiles[i].name); }
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
      if (res.ok) { addLog("DELETE", fileName); fetchData(currentFolder); setSelectedFile(null); }
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
      addLog("RENAME", `${oldName} -> ${newName}`);
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
      <div className="relative min-h-screen w-full flex items-center justify-center p-4 bg-[#0F172A] font-sans overflow-hidden">
        <div className="absolute inset-0 z-0 bg-cover bg-center opacity-30 scale-110" style={{ backgroundImage: "url('https://i.ibb.co.com/NnC3sn3S/bg-login.png')" }}></div>
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="relative z-10 bg-white/10 backdrop-blur-3xl p-12 rounded-[60px] shadow-2xl w-full max-w-md border border-white/10 text-center">
          <div className="mb-8 flex justify-center">
             <img src="https://i.ibb.co.com/L22pdJQ/Coat-of-arms-of-Southeast-Sulawesi-svg.png" alt="Logo" className="w-20 h-20 object-contain" />
          </div>
          <h2 className="text-3xl font-black mb-1 text-white tracking-tighter italic uppercase">DIGITAL ARCHIVE</h2>
          <p className="text-purple-400 mb-8 text-[10px] font-black uppercase tracking-[0.4em]">Tracking System Active</p>
          <form onSubmit={handleLogin} className="space-y-4">
            <input required type="text" placeholder="IDENTITAS (NAMA/JABATAN)" className="w-full p-5 rounded-[25px] border-none outline-none bg-white/5 text-white text-center font-bold placeholder:text-white/20 focus:ring-2 focus:ring-purple-500 transition-all text-sm uppercase" onChange={(e) => setTempName(e.target.value)} />
            <input required type="password" placeholder="KODE AKSES" className="w-full p-5 rounded-[25px] border-none outline-none bg-white/5 text-white text-center font-bold placeholder:text-white/20 tracking-[0.5em] focus:ring-2 focus:ring-purple-500 transition-all" onChange={(e) => setPassword(e.target.value)} />
            <button type="submit" className="w-full bg-white text-slate-900 p-5 rounded-[25px] font-black uppercase tracking-widest hover:bg-purple-50 transition-all shadow-xl active:scale-95">Masuk Sistem</button>
          </form>
        </motion.div>
      </div>
    );
  }

  // --- DASHBOARD VIEW ---
  return (
    <div className={isDarkMode ? "dark" : ""}>
      <div className="h-screen bg-[#F0F4FF] dark:bg-[#020617] flex text-slate-700 dark:text-slate-200 overflow-hidden transition-all duration-700 font-sans">
        
        {/* SIDEBAR */}
        <aside className="w-80 bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl border-r border-slate-200 dark:border-slate-800 p-10 flex flex-col gap-10 relative z-20">
          <div className="flex flex-col items-center gap-4 mb-2">
            <div className="w-20 h-20 bg-white/10 rounded-3xl p-3 border border-white/20 flex items-center justify-center shadow-xl overflow-hidden">
               <img src="https://i.ibb.co.com/L22pdJQ/Coat-of-arms-of-Southeast-Sulawesi-svg.png" alt="Logo" className="w-full h-full object-contain" />
            </div>
            <div className="text-center">
              <h1 className="font-black text-2xl tracking-tighter text-slate-800 dark:text-white italic leading-none">ARV<span className="text-purple-600">DRIV3</span></h1>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1 italic">{userName}</p>
            </div>
          </div>
          
          <nav className="flex-1 space-y-3 font-black">
            <button onClick={goHome} className={`w-full flex items-center gap-4 p-5 rounded-[25px] text-xs uppercase tracking-widest transition-all ${!currentFolder ? 'bg-slate-900 dark:bg-purple-600 text-white shadow-2xl scale-[1.05]' : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}>
              <LayoutDashboard size={18}/> Dashboard
            </button>
            <div className="pt-2 pb-1 px-4 text-[9px] text-slate-400 uppercase tracking-[0.2em]">Kategori</div>
            <div className="grid grid-cols-1 gap-1">
              <button onClick={() => setFilterType('all')} className={`flex items-center gap-3 p-4 rounded-xl text-[10px] uppercase tracking-wider transition-all ${filterType === 'all' ? 'bg-purple-100 text-purple-600 dark:bg-purple-900/30' : 'text-slate-400 hover:bg-slate-50'}`}><Filter size={14}/> Semua</button>
              <button onClick={() => setFilterType('folder')} className={`flex items-center gap-3 p-4 rounded-xl text-[10px] uppercase tracking-wider transition-all ${filterType === 'folder' ? 'bg-amber-100 text-amber-600' : 'text-slate-400'}`}><Folder size={14}/> Folder</button>
              <button onClick={() => setFilterType('file')} className={`flex items-center gap-3 p-4 rounded-xl text-[10px] uppercase tracking-wider transition-all ${filterType === 'file' ? 'bg-blue-100 text-blue-600' : 'text-slate-400'}`}><FileText size={14}/> Dokumen</button>
            </div>
            <button onClick={() => setIsLogModalOpen(true)} className="w-full flex items-center gap-4 p-4 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-[20px] transition-all text-[10px] uppercase tracking-widest">
              <History size={18}/> Log Aktivitas
            </button>
          </nav>

          {/* TOTAL DOKUMEN - KEMBALI SEPERTI ASLINYA */}
          <div className="p-8 bg-gradient-to-br from-slate-900 to-slate-800 dark:from-purple-900 dark:to-indigo-900 rounded-[40px] text-white shadow-2xl relative overflow-hidden group">
             <div className="relative z-10">
               <p className="text-[10px] font-black uppercase opacity-50 mb-2 tracking-[0.2em] leading-none">Database Sync</p>
               <h4 className="text-4xl font-black tracking-tighter">{stats.total}</h4>
               <p className="text-[9px] mt-4 opacity-40 font-bold uppercase tracking-widest leading-none">Reports Secured</p>
             </div>
             <Database className="absolute -right-6 -bottom-6 opacity-5 group-hover:rotate-12 transition-all duration-700" size={120}/>
          </div>
          
          <button onClick={() => {sessionStorage.clear(); window.location.reload();}} className="flex items-center justify-center gap-3 p-5 bg-red-500/10 text-red-500 font-black uppercase text-[10px] tracking-widest rounded-2xl hover:bg-red-500 hover:text-white transition-all"><LogOut size={16}/> LOGOUT</button>
        </aside>

        {/* MAIN AREA */}
        <main className="flex-1 flex flex-col min-w-0 transition-colors relative bg-[#F8FAFF] dark:bg-[#020617]">
          <header className="p-10 flex justify-between items-center bg-white/20 dark:bg-slate-900/20 backdrop-blur-md border-b border-slate-200/50 dark:border-slate-800 z-10">
            <div className="flex items-center gap-6">
              <AnimatePresence>
                {folderHistory.length > 0 && (
                  <motion.button initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.5 }} onClick={goBackOneLevel} className="p-4 bg-white dark:bg-slate-800 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-700 text-purple-600 hover:bg-purple-600 hover:text-white transition-all">
                    <ArrowLeft size={24} strokeWidth={3}/>
                  </motion.button>
                )}
              </AnimatePresence>
              <div>
                <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter uppercase italic leading-none">Smart Archiv3</h1>
                <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 mt-2 uppercase tracking-[0.2em] leading-none">
                  <span className="hover:text-purple-600 cursor-pointer transition-colors" onClick={goHome}>DIGITAL LHP IRBAN III</span>
                  {folderHistory.map((h, i) => (
                    <React.Fragment key={h.id + i}>
                      <ChevronRight size={10} className="text-slate-300"/> 
                      <span className={i === folderHistory.length -1 ? "text-purple-600 dark:text-purple-400 font-black" : ""}>{h.name}</span>
                    </React.Fragment>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-5 flex-1 max-w-xl px-12">
              <div className="flex-1 relative group cursor-pointer" onClick={() => setIsSearchModalOpen(true)}>
                <Search size={20} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-hover:text-purple-500 transition-colors" />
                <div className="w-full pl-16 pr-6 py-5 bg-white dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 rounded-[30px] text-slate-400 text-xs font-black uppercase tracking-widest shadow-xl group-hover:ring-2 group-hover:ring-purple-500/20 transition-all">Cari Dokumen...</div>
                <div className="absolute right-6 top-1/2 -translate-y-1/2 px-2 py-1 bg-slate-50 dark:bg-slate-800 rounded-lg text-[9px] font-black text-slate-300 border border-slate-100 dark:border-slate-700">CTRL + K</div>
              </div>
              <button onClick={() => setIsDarkMode(!isDarkMode)} className="p-5 bg-white dark:bg-slate-900 shadow-xl border border-slate-100 dark:border-slate-800 rounded-[25px] text-slate-400 dark:text-yellow-400 hover:scale-110 transition-all active:rotate-90">
                {isDarkMode ? <Sun size={24}/> : <Moon size={24}/>}
              </button>
            </div>

            {userRole === 'admin' && (
              <button onClick={() => {setUploadDestinationId(currentFolder); setIsUploadModalOpen(true);}} className="flex items-center gap-3 bg-slate-900 dark:bg-purple-600 text-white px-10 py-5 rounded-[30px] font-black uppercase text-[10px] tracking-[0.2em] shadow-xl hover:translate-y-[-2px] transition-all active:scale-95">
                <Plus size={20} strokeWidth={3} /> Upload Berkas
              </button>
            )}
          </header>

          <div className="flex-1 overflow-y-auto p-12 scrollbar-hide">
            {loading ? (
              <div className="h-full flex flex-col items-center justify-center gap-4 text-slate-400">
                <Loader2 className="animate-spin text-purple-600" size={40} />
                <p className="font-black text-xs uppercase tracking-[0.3em]">Sinkronisasi Arsip...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-10 pb-20">
                {filteredFiles.map((file) => (
                  <motion.div 
                    key={file.id} 
                    whileHover={{ y: -10, scale: 1.02 }}
                    className={`relative group bg-white/70 dark:bg-slate-800/40 backdrop-blur-xl p-8 rounded-[50px] border transition-all cursor-pointer h-64 flex flex-col justify-between ${selectedFile?.id === file.id ? 'border-purple-500 ring-4 ring-purple-500/10 shadow-2xl' : 'border-slate-200/50 dark:border-slate-800 shadow-xl hover:shadow-2xl'}`}
                    onClick={() => file.mimeType.includes('folder') ? navigateToFolder(file.id, file.name) : setSelectedFile(file)}
                  >
                    <div className="flex justify-between items-start">
                      <div className={`p-5 rounded-[25px] shadow-inner transition-transform duration-500 group-hover:rotate-[10deg] ${file.mimeType.includes('folder') ? 'bg-amber-100 text-amber-500' : 'bg-blue-100 text-blue-500'}`}>
                        {file.mimeType.includes('folder') ? <Folder size={32} fill="currentColor" /> : <FileText size={32} />}
                      </div>
                      <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                        {!file.mimeType.includes('folder') && (
                          <button onClick={(e) => { e.stopPropagation(); addLog("DOWNLOAD", file.name); window.open(`https://drive.google.com/uc?export=download&id=${file.id}`, '_blank'); }} className="p-3 bg-white dark:bg-slate-700 rounded-2xl text-slate-400 hover:text-blue-500 shadow-xl border border-slate-100 dark:border-slate-600"><Download size={20}/></button>
                        )}
                        {userRole === 'admin' && (
                          <>
                            <button onClick={(e) => { e.stopPropagation(); handleRename(file.id, file.name); }} className="p-3 bg-white dark:bg-slate-700 rounded-2xl text-slate-400 hover:text-purple-500 shadow-xl border border-slate-100 dark:border-slate-600"><Edit2 size={20}/></button>
                            <button onClick={(e) => { e.stopPropagation(); handleDelete(file.id, file.name); }} className="p-3 bg-white dark:bg-slate-700 rounded-2xl text-slate-400 hover:text-red-500 shadow-xl border border-slate-100 dark:border-slate-600"><Trash2 size={20}/></button>
                          </>
                        )}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-black text-slate-900 dark:text-white truncate text-lg uppercase tracking-tighter leading-none">{file.name}</h4>
                      <span className="text-[9px] font-black uppercase tracking-[0.2em] py-1.5 px-4 bg-slate-100 dark:bg-slate-700/50 rounded-full text-slate-400 inline-block mt-2">
                        {file.mimeType.includes('folder') ? 'DIRECTORY' : 'PDF ARCHIVE'}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </main>

        {/* SEARCH SPOTLIGHT */}
        <AnimatePresence>
          {isSearchModalOpen && (
            <div className="fixed inset-0 z-[200] flex items-start justify-center pt-32 px-4 bg-slate-900/60 backdrop-blur-xl" onClick={() => setIsSearchModalOpen(false)}>
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white dark:bg-slate-900 w-full max-w-3xl rounded-[40px] shadow-2xl overflow-hidden border border-white/10" onClick={e => e.stopPropagation()}>
                <div className="p-8 flex items-center gap-6 border-b border-slate-200 dark:border-slate-800">
                  <Search className="text-purple-600" size={28} />
                  <input autoFocus type="text" placeholder="Masukkan nama berkas..." className="flex-1 bg-transparent outline-none font-black text-xl dark:text-white uppercase tracking-tighter" onChange={(e) => setSearchTerm(e.target.value)} />
                </div>
                <div className="max-h-[400px] overflow-y-auto p-6 scrollbar-hide">
                  {files.filter(f => f.name.toLowerCase().includes(searchTerm.toLowerCase())).map(f => (
                    <div key={f.id} onClick={() => { if(f.mimeType.includes('folder')) navigateToFolder(f.id, f.name); else setSelectedFile(f); setIsSearchModalOpen(false); }} className="p-5 hover:bg-purple-600 hover:text-white rounded-[25px] cursor-pointer flex items-center justify-between group transition-all mb-2 font-black text-sm uppercase tracking-tighter">
                      <div className="flex items-center gap-5">{f.mimeType.includes('folder') ? <Folder size={24}/> : <FileText size={24}/>}<span>{f.name}</span></div>
                      <ChevronRight size={18} className="opacity-30 group-hover:translate-x-2 transition-transform" />
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
            <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-xl" onClick={() => setIsLogModalOpen(false)}>
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-white dark:bg-slate-900 w-full max-w-4xl rounded-[40px] shadow-2xl overflow-hidden border border-white/10" onClick={e => e.stopPropagation()}>
                <div className="p-8 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
                  <h3 className="text-xl font-black uppercase tracking-tighter dark:text-white flex items-center gap-3"><History className="text-purple-500" /> Activity Log</h3>
                  <button onClick={() => setIsLogModalOpen(false)} className="p-2 hover:bg-red-100 rounded-full transition-all text-slate-400 hover:text-red-500"><X size={24}/></button>
                </div>
                <div className="overflow-x-auto max-h-[60vh]">
                  <table className="w-full text-left border-collapse min-w-[700px]">
                    <thead className="bg-slate-100 dark:bg-slate-800 text-[10px] font-black uppercase tracking-widest text-slate-400">
                      <tr>
                        <th className="p-6">User / Identitas</th>
                        <th className="p-6">Aksi</th>
                        <th className="p-6">Berkas</th>
                        <th className="p-6">Perangkat</th>
                        <th className="p-6">Waktu</th>
                      </tr>
                    </thead>
                    <tbody className="text-[11px] font-bold">
                      {activityLogs.map((log) => (
                        <tr key={log.id} className="border-b border-slate-100 dark:border-slate-800 dark:text-slate-300 hover:bg-slate-50 transition-colors">
                          <td className="p-6 text-purple-600 dark:text-purple-400">{log.user}</td>
                          <td className="p-6">
                            <span className={`px-2 py-1 rounded text-[9px] text-white ${log.action === 'DELETE' ? 'bg-red-500' : log.action === 'UPLOAD' ? 'bg-green-500' : 'bg-blue-500'}`}>{log.action}</span>
                          </td>
                          <td className="p-6 max-w-[150px] truncate">{log.fileName}</td>
                          <td className="p-6 opacity-60 italic">{log.device}</td>
                          <td className="p-6 text-[9px] opacity-50">{log.timestamp}</td>
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
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/80 backdrop-blur-2xl">
              <motion.div initial={{ scale: 0.8, y: 50 }} animate={{ scale: 1, y: 0 }} className="bg-white dark:bg-slate-900 rounded-[60px] p-16 w-full max-w-2xl relative border border-white/10 shadow-2xl">
                <button onClick={() => setIsUploadModalOpen(false)} className="absolute right-12 top-12 text-slate-400 hover:rotate-90 transition-all duration-500"><X size={32}/></button>
                <div className="text-center mb-12">
                   <h3 className="text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tighter italic">Secure Gateway</h3>
                   <p className="text-xs text-purple-500 font-bold uppercase tracking-[0.5em] mt-2">Bulk Transmission Active</p>
                </div>
                {uploadStatus === 'idle' ? (
                  <div className="space-y-10">
                    <select value={uploadDestinationId} onChange={(e) => setUploadDestinationId(e.target.value)} className="w-full p-6 rounded-[30px] bg-slate-100 dark:bg-slate-800 border-none outline-none font-black text-sm text-slate-600 dark:text-slate-300 cursor-pointer ring-2 ring-slate-100 dark:ring-slate-800 focus:ring-purple-500 transition-all appearance-none">
                      <option value="">🏠 ROOT DIRECTORY</option>
                      {allFolders.map(f => (<option key={f.id} value={f.id}>📁 {f.name.toUpperCase()}</option>))}
                    </select>
                    <label className="flex flex-col items-center justify-center w-full h-72 border-4 border-dashed border-slate-100 dark:border-slate-800 rounded-[50px] cursor-pointer hover:bg-purple-50/50 dark:hover:bg-purple-900/10 transition-all text-center p-8 group">
                      {uploading ? (
                        <div className="w-full"><Loader2 className="animate-spin mx-auto text-purple-600 mb-6" size={60} /><div className="w-full bg-slate-100 dark:bg-slate-800 h-4 rounded-full overflow-hidden mb-4"><motion.div initial={{ width: 0 }} animate={{ width: `${uploadProgress}%` }} className="h-full bg-gradient-to-r from-purple-500 to-blue-500" /></div><p className="text-xs font-black uppercase text-purple-500 tracking-[0.3em]">{uploadProgress}% TRANSMITTING...</p></div>
                      ) : (
                        <><div className="p-8 bg-purple-600 rounded-[35px] text-white mb-6 shadow-2xl group-hover:scale-110 transition-all"><Upload size={48} strokeWidth={3}/></div><p className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Initialize Batch Archive</p>
                        <input type="file" multiple className="hidden" onChange={handleUpload} disabled={uploading} /></>
                      )}
                    </label>
                  </div>
                ) : (
                  <div className="text-center py-20">{uploadStatus === 'success' ? (<motion.div initial={{ scale: 0.5 }} animate={{ scale: 1 }}><CheckCircle2 size={100} className="text-green-500 mx-auto mb-6" /><h3 className="text-3xl font-black dark:text-white uppercase tracking-tighter">Batch Secured</h3></motion.div>) : (<motion.div initial={{ scale: 0.5 }} animate={{ scale: 1 }}><AlertCircle size={100} className="text-red-500 mx-auto mb-6" /><h3 className="text-3xl font-black dark:text-white uppercase">Failure</h3></motion.div>)}</div>
                )}
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* PREVIEW PANEL */}
        <AnimatePresence>
          {selectedFile && (
            <motion.div initial={{ x: 700 }} animate={{ x: 0 }} exit={{ x: 700 }} className="w-[650px] bg-white/90 dark:bg-slate-900/90 backdrop-blur-3xl shadow-2xl border-l border-white/20 flex flex-col overflow-hidden relative z-30 transition-all duration-500">
               <div className="p-10 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-white/50 dark:bg-slate-900/50 backdrop-blur-md">
                  <div className="flex items-center gap-5 overflow-hidden"><div className="p-4 bg-purple-100 dark:bg-purple-900/30 rounded-2xl text-purple-600"><FileText size={24}/></div><span className="font-black text-sm truncate uppercase tracking-widest text-slate-900 dark:text-white block leading-none">{selectedFile.name}</span></div>
                  <button onClick={() => { setSelectedFile(null); setPreviewLoading(true); }} className="p-3 bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-red-500 rounded-full transition-all border border-slate-200 dark:border-slate-700 leading-none"><X size={28}/></button>
               </div>
               <div className="flex-1 relative m-8">
                  {previewLoading && (
                    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white dark:bg-slate-950 rounded-[50px] gap-4">
                      <Loader2 className="animate-spin text-purple-500" size={48} />
                      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Loading Document...</p>
                    </div>
                  )}
                  <iframe 
                    src={`https://drive.google.com/file/d/${selectedFile.id}/preview`} 
                    className="w-full h-full rounded-[50px] overflow-hidden bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-2xl" 
                    title="Live Sync"
                    onLoad={() => setPreviewLoading(false)}
                  />
               </div>
               <div className="p-10 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md border-t border-slate-200 dark:border-slate-800"><button onClick={() => { addLog("DOWNLOAD", selectedFile.name); window.open(`https://drive.google.com/uc?export=download&id=${selectedFile.id}`, '_blank'); }} className="w-full py-6 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-[35px] font-black text-xs uppercase tracking-[0.3em] flex items-center justify-center gap-4 active:scale-95 shadow-xl transition-all leading-none border border-white/20"><Download size={22} strokeWidth={3}/> Secure Download</button></div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}