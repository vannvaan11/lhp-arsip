"use client"
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Folder, FileText, Upload, Lock, Database, LayoutDashboard, 
  Search, LogOut, ChevronRight, Loader2, Edit2, Plus, X, 
  Download, ArrowLeft, Sun, Moon, Shield, 
  CheckCircle2, AlertCircle, Filter, History, User,
  ShieldCheck, Trash2,
  LayoutGrid, List, Clock, Eye, EyeOff,
  Command, Share2
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
  ip?: string;
}

export default function Dashboard() {
  const [mounted, setMounted] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<'admin' | 'user' | null>(null);
  const [userName, setUserName] = useState<string>('');
  const [password, setPassword] = useState('');
  const [tempName, setTempName] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [sharedFileId, setSharedFileId] = useState<string | null>(null);
  const [sharedFileError, setSharedFileError] = useState<string | null>(null);
  const [isSharedView, setIsSharedView] = useState(false);

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
    const params = new URLSearchParams(window.location.search);
    const shareToken = params.get('share');
    if (shareToken) {
      setIsSharedView(true);
      try {
        const decoded = JSON.parse(atob(shareToken));
        if (Date.now() > decoded.exp) {
          setSharedFileError("Tautan ini telah kedaluwarsa.");
        } else {
          setSharedFileId(decoded.id);
        }
      } catch (e) {
        setSharedFileError("Tautan tidak valid.");
      }
      setMounted(true);
      return;
    }

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
    addOnlineLog("OPEN_FOLDER", name);
  };

  const handleFileSelect = (file: DriveFile) => {
    setSelectedFile(file);
    addOnlineLog("VIEW_DOCUMENT", file.name);
  };

  const goBackOneLevel = () => {
    if (folderHistory.length > 0) {
      const newHistory = [...folderHistory]; newHistory.pop(); setFolderHistory(newHistory);
      const prevFolder = newHistory[newHistory.length - 1]; setCurrentFolder(prevFolder ? prevFolder.id : ''); setSelectedFile(null);
      if (prevFolder) addOnlineLog("OPEN_FOLDER", prevFolder.name);
    }
  };

  const goHome = () => { setCurrentFolder(''); setFolderHistory([]); setSelectedFile(null); setSearchTerm(''); setFilterType('all'); };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tempName.trim()) { alert("Masukkan Nama!"); return; }
    const processLogin = (role: 'admin' | 'user') => {
      setIsLoggedIn(true); setUserRole(role); setUserName(tempName);
      sessionStorage.setItem('isLoggedIn', 'true'); sessionStorage.setItem('userRole', role); sessionStorage.setItem('userName', tempName);
      addOnlineLog("LOGIN", "Masuk ke sistem");
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
    if (userRole !== 'admin' || !confirm(`Hapus permanen "${fileName}"?`)) return;
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

  const handleDownloadLogs = () => {
    const headers = ["Pengguna", "Aksi", "Nama File", "Waktu"];
    const csvContent = [
      headers.join(","),
      ...activityLogs.map(log => 
        `"${log.user}","${log.action}","${log.fileName}","${new Date(log.timestamp).toLocaleString('id-ID')}"`
      )
    ].join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `audit_trail_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!mounted) return null;

  const baseFiles = (searchTerm.length >= 2 ? searchResults : files).filter(f => f.name.toLowerCase().includes(searchTerm.toLowerCase()));

  const filteredFilesMain = baseFiles
    .filter(f => {
      if (filterType === 'folder') return f.mimeType.includes('folder');
      if (filterType === 'file') return !f.mimeType.includes('folder');
      return true;
    });

  const folders = filteredFilesMain.filter(f => f.mimeType.includes('folder'));
  const documents = filteredFilesMain.filter(f => !f.mimeType.includes('folder'));

  if (!mounted) return null;

  // --- SHARED VIEW (Bypass Login) ---
  if (isSharedView) {
    return (
      <div className="min-h-screen bg-[#0c1220] flex flex-col items-center justify-center p-4 sm:p-8 relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-amber-500/[0.05] blur-[120px] rounded-full pointer-events-none"></div>
        
        {sharedFileError ? (
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-slate-900 border border-white/[0.08] p-8 rounded-2xl max-w-md w-full text-center shadow-2xl relative z-10">
            <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">Akses Ditolak</h2>
            <p className="text-slate-400">{sharedFileError}</p>
          </motion.div>
        ) : (
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="w-full max-w-5xl h-[85vh] bg-slate-900 rounded-2xl border border-white/[0.08] flex flex-col overflow-hidden shadow-2xl relative z-10">
            <div className="p-5 border-b border-white/[0.06] flex items-center justify-between bg-slate-900/50 backdrop-blur-xl z-30">
              <div className="flex items-center gap-4">
                <div className="p-2.5 bg-emerald-500/10 rounded-xl text-emerald-500">
                  <ShieldCheck size={24} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Dokumen Dibagikan</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Akses Terbatas - Inspektorat Sultra</p>
                </div>
              </div>
            </div>
            
            <div className="flex-1 relative bg-black/50">
              <div className="absolute inset-0 z-20 pointer-events-none"
                style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='400' height='400' xmlns='http://www.w3.org/2000/svg'%3E%3Ctext x='50%25' y='50%25' font-size='28' font-family='Arial' font-weight='bold' fill='%23ef4444' opacity='0.15' transform='translate(200, 200) rotate(-45) translate(-200, -200)' text-anchor='middle'%3EDOKUMEN INSPEKTORAT%3C/text%3E%3C/svg%3E")`, backgroundRepeat: 'repeat' }}
              />
              <iframe src={`https://drive.google.com/file/d/${sharedFileId}/preview`} className="w-full h-full border-0 relative z-0" title="Shared Preview" />
            </div>
          </motion.div>
        )}
      </div>
    );
  }

  // --- LOGIN PAGE ---
  if (!isLoggedIn) {
    return (
      <div className="relative min-h-screen w-full flex items-center justify-center p-6 bg-[#0c1220]">
        {/* Subtle background gradient */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-amber-500/[0.07] blur-[150px] rounded-full"></div>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 16 }} 
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative z-10 w-full max-w-md"
        >
          <div className="bg-slate-900/80 backdrop-blur-xl p-10 rounded-3xl border border-white/[0.06] shadow-2xl">
            {/* Logo & Title */}
            <div className="flex flex-col items-center mb-10">
              <div className="w-20 h-20 mb-5">
                <img 
                  src="https://i.ibb.co.com/L22pdJQ/Coat-of-arms-of-Southeast-Sulawesi-svg.png" 
                  alt="Logo Sultra" 
                  className="w-full h-full object-contain" 
                />
              </div>
              <h1 className="text-2xl font-bold text-white tracking-tight text-center">
                Arsip Digital
              </h1>
              <p className="text-sm text-slate-400 mt-1.5 text-center">
                Inspektorat Provinsi Sulawesi Tenggara
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-400 ml-1">Nama</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16}/>
                  <input 
                    required 
                    type="text" 
                    placeholder="Masukkan nama Anda" 
                    className="w-full py-3.5 pl-11 pr-4 rounded-xl border border-white/[0.08] outline-none bg-white/[0.04] text-white text-sm placeholder:text-slate-600 focus:border-amber-500/40 focus:bg-amber-500/[0.03] transition-all" 
                    onChange={(e) => setTempName(e.target.value)} 
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-400 ml-1">Kunci Akses</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16}/>
                  <input 
                    required 
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••" 
                    className="w-full py-3.5 pl-11 pr-12 rounded-xl border border-white/[0.08] outline-none bg-white/[0.04] text-white text-sm placeholder:text-slate-600 tracking-widest focus:border-amber-500/40 focus:bg-amber-500/[0.03] transition-all" 
                    onChange={(e) => setPassword(e.target.value)} 
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button type="submit" className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 py-3.5 rounded-xl font-semibold text-sm transition-colors mt-2 flex items-center justify-center gap-2">
                <span>Masuk</span>
                <ChevronRight size={16} />
              </button>
            </form>
          </div>

          <p className="text-center mt-6 text-xs text-slate-600">
            © 2026 Royal Vault v2.0
          </p>
        </motion.div>
      </div>
    );
  }

  // --- MAIN DASHBOARD ---
  return (
    <div className={`${isDarkMode ? "dark" : ""}`}>
      <div className="h-screen bg-[#0c1220] text-slate-300 flex overflow-hidden">
        
        {/* SIDEBAR */}
        <aside className="w-[72px] lg:w-64 bg-slate-900/60 border-r border-white/[0.06] flex flex-col py-6">
          {/* Logo */}
          <div className="px-4 lg:px-6 mb-6">
            <div 
              onClick={goHome}
              className="cursor-pointer flex items-center gap-3"
            >
              <div className="w-10 h-10 bg-amber-500/10 p-2 rounded-xl border border-amber-500/20 flex-shrink-0">
                <img src="https://i.ibb.co.com/L22pdJQ/Coat-of-arms-of-Southeast-Sulawesi-svg.png" alt="Logo" className="w-full h-full object-contain" />
              </div>
              <div className="hidden lg:block min-w-0">
                <h1 className="font-bold text-white text-sm truncate">Arsip Digital</h1>
                <p className="text-[10px] text-slate-500 truncate">Inspektorat Sultra</p>
              </div>
            </div>
          </div>

          <div className="w-full h-px bg-white/[0.04]"></div>

          {/* Nav */}
          <nav className="flex-1 px-3 lg:px-4 py-4 space-y-1">
            {[
              { icon: LayoutDashboard, label: 'Beranda', active: !currentFolder && filterType === 'all', onClick: goHome },
              { icon: Folder, label: 'Folder', active: filterType === 'folder', onClick: () => setFilterType('folder') },
              { icon: FileText, label: 'Dokumen', active: filterType === 'file', onClick: () => setFilterType('file') },
              { icon: History, label: 'Riwayat', active: false, onClick: () => { setIsLogModalOpen(true); fetchOnlineLogs(); } },
            ].map((item, idx) => (
              <button
                key={idx}
                onClick={item.onClick}
                className={`w-full flex items-center justify-center lg:justify-start gap-3 px-3 py-2.5 rounded-xl transition-all text-sm ${
                  item.active 
                    ? 'bg-amber-500/10 text-amber-500 font-semibold' 
                    : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                <item.icon size={18} />
                <span className="hidden lg:block">{item.label}</span>
              </button>
            ))}
          </nav>

          {/* User & Logout */}
          <div className="px-3 lg:px-4 space-y-2">
            <div className="hidden lg:flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.04]">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-500 text-xs font-bold flex-shrink-0">
                {userName.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-white truncate">{userName}</p>
                <p className="text-[10px] text-slate-500 capitalize">{userRole}</p>
              </div>
            </div>

            <button 
              onClick={() => {
                addOnlineLog("LOGOUT", "Keluar dari sistem");
                setTimeout(() => { sessionStorage.clear(); window.location.reload(); }, 300);
              }}
              className="w-full flex items-center justify-center lg:justify-start gap-3 px-3 py-2.5 rounded-xl text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all text-sm"
            >
              <LogOut size={18} />
              <span className="hidden lg:block">Keluar</span>
            </button>
          </div>
        </aside>

        {/* MAIN AREA */}
        <main className="flex-1 flex flex-col min-w-0 relative">
          
          {/* HEADER */}
          <header className="px-6 lg:px-8 py-4 border-b border-white/[0.06] flex items-center justify-between gap-4 bg-slate-900/30 backdrop-blur-sm">
            <div className="flex items-center gap-3 min-w-0">
              <AnimatePresence>
                {folderHistory.length > 0 && (
                  <motion.button 
                    initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -8 }}
                    onClick={goBackOneLevel}
                    className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06] transition-all flex-shrink-0"
                  >
                    <ArrowLeft size={18} />
                  </motion.button>
                )}
              </AnimatePresence>
              
              {/* Breadcrumb */}
              <div className="hidden sm:flex items-center gap-1.5 text-sm min-w-0">
                <span className="text-slate-400 hover:text-amber-500 cursor-pointer transition-colors font-medium" onClick={goHome}>Arsip</span>
                {folderHistory.map((h, i) => (
                  <React.Fragment key={h.id}>
                    <ChevronRight size={14} className="text-slate-600 flex-shrink-0" />
                    <span className={`truncate ${i === folderHistory.length - 1 ? "text-white font-medium" : "text-slate-400"}`}>
                      {h.name}
                    </span>
                  </React.Fragment>
                ))}
              </div>
            </div>

            {/* Search Bar */}
            <div className="flex-1 max-w-lg relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={15} />
              <input 
                onClick={() => setIsSearchModalOpen(true)}
                readOnly
                value={searchTerm}
                placeholder="Cari dokumen... (Ctrl+K)"
                className="w-full bg-white/[0.04] border border-white/[0.06] rounded-xl py-2.5 pl-10 pr-4 text-sm text-slate-300 cursor-pointer hover:bg-white/[0.06] transition-all outline-none placeholder:text-slate-600"
              />
              {searchTerm && (
                <button onClick={(e) => { e.stopPropagation(); setSearchTerm(''); setSearchResults([]); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white">
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Header Actions */}
            <div className="flex items-center gap-2">
              <div className="hidden md:flex bg-white/[0.03] p-1 rounded-lg border border-white/[0.04]">
                <button onClick={() => setViewMode('grid')} className={`p-2 rounded-md transition-all ${viewMode === 'grid' ? 'bg-amber-500/15 text-amber-500' : 'text-slate-500 hover:text-white'}`}><LayoutGrid size={16}/></button>
                <button onClick={() => setViewMode('list')} className={`p-2 rounded-md transition-all ${viewMode === 'list' ? 'bg-amber-500/15 text-amber-500' : 'text-slate-500 hover:text-white'}`}><List size={16}/></button>
              </div>
              <button onClick={() => setIsDarkMode(!isDarkMode)} className="p-2.5 rounded-lg text-slate-500 hover:text-white hover:bg-white/[0.06] transition-all">
                {isDarkMode ? <Sun size={16}/> : <Moon size={16}/>}
              </button>
              {userRole === 'admin' && (
                <button 
                  onClick={() => {setUploadDestinationId(currentFolder); setIsUploadModalOpen(true);}}
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 px-4 py-2.5 rounded-xl font-semibold text-sm transition-colors flex items-center gap-2"
                >
                  <Plus size={16} strokeWidth={2.5} />
                  <span className="hidden lg:block">Upload</span>
                </button>
              )}
            </div>
          </header>

          {/* MAIN CONTENT */}
          <div className="flex-1 overflow-y-auto px-6 lg:px-8 py-6 custom-scrollbar">
            
            {loading ? (
              <div className="h-full flex flex-col items-center justify-center">
                <Loader2 className="animate-spin text-amber-500 mb-4" size={32} />
                <p className="text-sm text-slate-500">Memuat data...</p>
              </div>
            ) : (
              <div className="max-w-[1400px] mx-auto space-y-8">
                
                {/* STATS ROW */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: 'Total Dokumen', value: stats.total, icon: Database, color: 'text-amber-500 bg-amber-500/10' },
                    { label: 'Folder', value: folders.length, icon: Folder, color: 'text-blue-400 bg-blue-400/10' },
                    { label: 'File', value: documents.length, icon: FileText, color: 'text-emerald-400 bg-emerald-400/10' },
                    { label: 'Pengguna', value: userName.split(' ')[0], icon: User, color: 'text-purple-400 bg-purple-400/10' },
                  ].map((stat, i) => (
                    <motion.div 
                      initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                      key={i} className="bg-white/[0.03] p-5 rounded-2xl border border-white/[0.06] hover:border-white/[0.1] transition-all"
                    >
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${stat.color}`}>
                        <stat.icon size={17} />
                      </div>
                      <p className="text-xs text-slate-500 mb-0.5">{stat.label}</p>
                      <p className="text-xl font-bold text-white">{stat.value}</p>
                    </motion.div>
                  ))}
                </div>

                {/* FOLDERS SECTION (only on root) */}
                {!currentFolder && filterType !== 'file' && folders.length > 0 && (
                  <section>
                    <div className="flex items-center gap-3 mb-4">
                      <Folder size={16} className="text-amber-500" />
                      <h3 className="text-sm font-semibold text-white">Folder</h3>
                      <span className="text-xs text-slate-500">{folders.length}</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                      {folders.map((folder, i) => (
                        <motion.div 
                          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                          key={folder.id} 
                          onClick={() => navigateToFolder(folder.id, folder.name)}
                          className="group bg-white/[0.03] hover:bg-amber-500/[0.06] p-4 rounded-xl border border-white/[0.06] hover:border-amber-500/20 cursor-pointer transition-all flex items-center gap-3.5"
                        >
                          <div className="p-2.5 bg-amber-500/10 rounded-xl text-amber-500 group-hover:bg-amber-500/20 transition-colors flex-shrink-0">
                            <Folder size={20} />
                          </div>
                          <div className="min-w-0">
                            <h4 className="text-sm font-medium text-white truncate group-hover:text-amber-400 transition-colors">{folder.name}</h4>
                            <p className="text-[11px] text-slate-500 mt-0.5">Folder</p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </section>
                )}

                {/* FILES SECTION */}
                <section>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <FileText size={16} className="text-slate-400" />
                      <h3 className="text-sm font-semibold text-white">
                        {currentFolder ? 'Isi Folder' : filterType === 'file' ? 'Semua Dokumen' : 'Semua Item'}
                      </h3>
                      <span className="text-xs text-slate-500">{filteredFilesMain.length}</span>
                    </div>
                  </div>

                  {filteredFilesMain.length === 0 ? (
                    <div className="text-center py-20">
                      <Database size={40} className="text-slate-700 mx-auto mb-4" />
                      <p className="text-slate-500 text-sm">Tidak ada data ditemukan</p>
                    </div>
                  ) : viewMode === 'grid' ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                      {filteredFilesMain.map((file, i) => (
                        <motion.div 
                          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                          key={file.id}
                          onClick={() => file.mimeType.includes('folder') ? navigateToFolder(file.id, file.name) : handleFileSelect(file)}
                          className={`group relative bg-white/[0.03] p-5 rounded-2xl border cursor-pointer transition-all ${
                            selectedFile?.id === file.id 
                              ? 'border-amber-500/40 bg-amber-500/[0.05]' 
                              : 'border-white/[0.06] hover:border-white/[0.12] hover:bg-white/[0.05]'
                          }`}
                        >
                          <div className="flex items-start justify-between mb-6">
                            <div className={`p-3 rounded-xl ${
                              file.mimeType.includes('folder') 
                                ? 'bg-amber-500/10 text-amber-500' 
                                : 'bg-white/[0.06] text-slate-400'
                            }`}>
                              {file.mimeType.includes('folder') ? <Folder size={22} /> : <FileText size={22} />}
                            </div>
                            
                            {/* Actions - visible on hover */}
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              {!file.mimeType.includes('folder') && (
                                <button onClick={(e) => { e.stopPropagation(); addOnlineLog("DOWNLOAD", file.name); window.open(`https://drive.google.com/uc?export=download&id=${file.id}`, '_blank'); }} className="p-2 rounded-lg hover:bg-white/[0.08] text-slate-500 hover:text-white transition-all">
                                  <Download size={14}/>
                                </button>
                              )}
                              {userRole === 'admin' && (
                                <>
                                  <button onClick={(e) => { e.stopPropagation(); handleRename(file.id, file.name); }} className="p-2 rounded-lg hover:bg-white/[0.08] text-slate-500 hover:text-blue-400 transition-all"><Edit2 size={14}/></button>
                                  <button onClick={(e) => { e.stopPropagation(); handleDelete(file.id, file.name); }} className="p-2 rounded-lg hover:bg-white/[0.08] text-slate-500 hover:text-red-400 transition-all"><Trash2 size={14}/></button>
                                </>
                              )}
                            </div>
                          </div>

                          <h4 title={file.name} className="text-sm font-medium text-white truncate group-hover:text-amber-400 transition-colors">{file.name}</h4>
                          <p className="text-[11px] text-slate-500 mt-1.5">
                            {file.mimeType.includes('folder') ? 'Folder' : 'Dokumen'}
                          </p>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    /* LIST VIEW */
                    <div className="bg-white/[0.02] rounded-xl border border-white/[0.06] overflow-hidden">
                      <div className="grid grid-cols-12 px-5 py-3 border-b border-white/[0.06] text-xs font-medium text-slate-500 bg-white/[0.02]">
                        <div className="col-span-7">Nama</div>
                        <div className="col-span-3">Tipe</div>
                        <div className="col-span-2 text-right">Aksi</div>
                      </div>
                      {filteredFilesMain.map(file => (
                        <div 
                          key={file.id} 
                          onClick={() => file.mimeType.includes('folder') ? navigateToFolder(file.id, file.name) : handleFileSelect(file)} 
                          className="grid grid-cols-12 px-5 py-3.5 items-center hover:bg-white/[0.03] transition-colors cursor-pointer group border-b border-white/[0.04] last:border-0"
                        >
                          <div className="col-span-7 flex items-center gap-3">
                            <div className={`p-1.5 rounded-lg ${file.mimeType.includes('folder') ? 'text-amber-500 bg-amber-500/10' : 'text-slate-400 bg-white/[0.05]'}`}>
                              {file.mimeType.includes('folder') ? <Folder size={16}/> : <FileText size={16}/>}
                            </div>
                            <span title={file.name} className="text-sm text-slate-200 group-hover:text-amber-400 truncate transition-colors">{file.name}</span>
                          </div>
                          <div className="col-span-3 text-xs text-slate-500">{file.mimeType.includes('folder') ? 'Folder' : 'Dokumen'}</div>
                          <div className="col-span-2 flex justify-end gap-1">
                            {!file.mimeType.includes('folder') && (
                              <button onClick={(e) => { e.stopPropagation(); addOnlineLog("DOWNLOAD", file.name); window.open(`https://drive.google.com/uc?export=download&id=${file.id}`, '_blank'); }} className="p-1.5 rounded-md text-slate-500 hover:text-white hover:bg-white/[0.08] transition-all"><Download size={14}/></button>
                            )}
                            {userRole === 'admin' && (
                              <button onClick={(e) => { e.stopPropagation(); handleDelete(file.id, file.name); }} className="p-1.5 rounded-md text-slate-500 hover:text-red-400 hover:bg-white/[0.08] transition-all"><Trash2 size={14}/></button>
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

          {/* FOOTER */}
          <div className="px-6 lg:px-8 py-3 border-t border-white/[0.06] flex items-center justify-between text-xs text-slate-500 bg-slate-900/30">
            <div className="flex items-center gap-5">
              <span className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse"></div>
                Online
              </span>
              <span className="hidden sm:flex items-center gap-1.5 text-slate-600">
                <Command size={11} /> Ctrl+K untuk mencari
              </span>
            </div>
            <div className="flex items-center gap-4">
              <span className="hidden sm:flex items-center gap-1.5">
                <Shield size={11} className="text-emerald-500" /> Terenkripsi
              </span>
              <span className="text-slate-600">© 2026 Royal Vault v2.0</span>
            </div>
          </div>
        </main>

        {/* --- MODALS --- */}
        
        {/* LOG MODAL */}
        <AnimatePresence>
          {isLogModalOpen && (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm"
              onClick={() => setIsLogModalOpen(false)}
            >
              <motion.div 
                initial={{ scale: 0.95, y: 10 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 10 }}
                className="bg-slate-900 border border-white/[0.08] w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden" 
                onClick={e => e.stopPropagation()}
              >
                <div className="p-6 border-b border-white/[0.06] flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-amber-500/10 rounded-xl text-amber-500">
                      <History size={20} />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">Riwayat Aktivitas</h3>
                      <p className="text-xs text-slate-500 mt-0.5">Log akses & perubahan dokumen</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={handleDownloadLogs} className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 rounded-lg transition-all">
                      <Download size={14} /> Export CSV
                    </button>
                    <button onClick={() => setIsLogModalOpen(false)} className="p-2 hover:bg-white/[0.06] text-slate-500 hover:text-white rounded-lg transition-all"><X size={20}/></button>
                  </div>
                </div>
                <div className="max-h-[60vh] overflow-y-auto custom-scrollbar">
                  <table className="w-full border-collapse">
                    <thead className="text-xs font-medium text-slate-500 sticky top-0 bg-slate-900 z-10">
                      <tr>
                        <th className="p-4 text-left">Pengguna</th>
                        <th className="p-4 text-left">Aksi</th>
                        <th className="p-4 text-left">Nama File</th>
                        <th className="p-4 text-right">Waktu</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm text-slate-400">
                      {logsLoading ? (
                        <tr><td colSpan={4} className="p-8 text-center">
                          <Loader2 className="animate-spin text-amber-500 mx-auto mb-2" size={24} />
                          <p className="text-xs text-slate-500">Memuat riwayat...</p>
                        </td></tr>
                      ) : activityLogs.length === 0 ? (
                        <tr><td colSpan={4} className="p-8 text-center">
                          <History size={32} className="text-slate-700 mx-auto mb-2" />
                          <p className="text-slate-500 text-sm">Belum ada riwayat aktivitas</p>
                          <p className="text-slate-600 text-xs mt-1">Coba download atau upload dokumen terlebih dahulu</p>
                        </td></tr>
                      ) : activityLogs.map((log) => (
                        <tr key={log.id} className="border-t border-white/[0.04] hover:bg-white/[0.02] transition-colors">
                          <td className="p-4">
                            <div className="flex items-center gap-2.5">
                              <div className="w-7 h-7 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-500 text-[10px] font-bold flex-shrink-0">{log.user?.charAt(0) || '?'}</div>
                              <div>
                                <span className="text-white text-sm">{log.user}</span>
                                <span className="block text-[10px] text-slate-600 mt-0.5">{log.device}</span>
                              </div>
                            </div>
                          </td>
                          <td className="p-4">
                            <span className={`px-2.5 py-1 rounded-md text-[10px] font-semibold border ${
                              log.action === 'DELETE' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                              log.action === 'SHARE' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                              log.action === 'UPLOAD' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                              'bg-amber-500/10 text-amber-500 border-amber-500/20'
                            }`}>{log.action}</span>
                          </td>
                          <td className="p-4 max-w-xs truncate text-slate-500" title={log.fileName}>{log.fileName}</td>
                          <td className="p-4 text-right text-xs text-slate-600 font-mono">{
                            log.timestamp.includes('T') 
                              ? new Date(log.timestamp).toLocaleString('id-ID') 
                              : log.timestamp
                          }</td>
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
              className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm"
            >
              <motion.div 
                initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                className="bg-slate-900 rounded-2xl p-8 w-full max-w-lg relative border border-white/[0.08] shadow-2xl"
              >
                <button onClick={() => setIsUploadModalOpen(false)} className="absolute right-6 top-6 text-slate-500 hover:text-white transition-all"><X size={20}/></button>
                
                <div className="mb-8">
                  <div className="w-12 h-12 bg-amber-500/10 rounded-xl flex items-center justify-center mb-4 text-amber-500">
                    <Upload size={22} />
                  </div>
                  <h3 className="text-xl font-bold text-white">Upload Dokumen</h3>
                  <p className="text-sm text-slate-500 mt-1">Pilih folder tujuan dan file yang akan diunggah</p>
                </div>

                {uploadStatus === 'idle' ? (
                  <div className="space-y-5">
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-slate-400 ml-1">Folder Tujuan</label>
                      <select 
                        value={uploadDestinationId} 
                        onChange={(e) => setUploadDestinationId(e.target.value)} 
                        className="w-full p-3.5 rounded-xl bg-white/[0.04] border border-white/[0.08] outline-none text-sm text-white focus:border-amber-500/40 appearance-none cursor-pointer"
                      >
                        <option value="">📂 Root (Folder Utama)</option>
                        {allFolders.map(f => (<option key={f.id} value={f.id} className="bg-slate-900 text-white">📁 {f.name}</option>))}
                      </select>
                    </div>

                    <label className="flex flex-col items-center justify-center w-full h-52 border-2 border-dashed border-white/[0.08] rounded-2xl cursor-pointer hover:bg-amber-500/[0.03] hover:border-amber-500/20 transition-all text-center p-6">
                      {uploading ? (
                        <div className="w-full px-4">
                          <Loader2 className="animate-spin mx-auto text-amber-500 mb-4" size={36} />
                          <div className="w-full bg-white/[0.06] h-1.5 rounded-full overflow-hidden mb-3">
                            <motion.div initial={{ width: 0 }} animate={{ width: `${uploadProgress}%` }} className="h-full bg-amber-500 rounded-full" />
                          </div>
                          <p className="text-sm text-amber-400">{uploadProgress}% mengunggah...</p>
                        </div>
                      ) : (
                        <>
                          <Upload size={28} className="text-slate-600 mb-3" />
                          <p className="text-sm font-medium text-slate-300">Klik untuk memilih file</p>
                          <p className="text-xs text-slate-600 mt-1">atau seret file ke sini</p>
                          <input type="file" multiple className="hidden" onChange={handleUpload} disabled={uploading} />
                        </>
                      )}
                    </label>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    {uploadStatus === 'success' ? (
                      <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }}>
                        <CheckCircle2 size={56} className="text-emerald-500 mx-auto mb-4" />
                        <h3 className="text-lg font-bold text-white">Berhasil Diunggah</h3>
                        <p className="text-sm text-slate-500 mt-1">Dokumen telah tersimpan</p>
                      </motion.div>
                    ) : (
                      <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }}>
                        <AlertCircle size={56} className="text-red-500 mx-auto mb-4" />
                        <h3 className="text-lg font-bold text-white">Gagal Mengunggah</h3>
                        <p className="text-sm text-slate-500 mt-1">Terjadi kesalahan, silakan coba lagi</p>
                      </motion.div>
                    )}
                  </div>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* PREVIEW PANEL */}
        <AnimatePresence>
          {selectedFile && (
            <motion.div 
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} 
              transition={{ type: 'spring', damping: 30, stiffness: 250 }} 
              className="fixed inset-y-0 right-0 w-full lg:w-[720px] bg-slate-900/98 backdrop-blur-xl shadow-[-20px_0_60px_rgba(0,0,0,0.5)] border-l border-white/[0.06] z-[150] flex flex-col"
            >
              {/* Preview Header */}
              <div className="p-6 border-b border-white/[0.06] flex items-center justify-between">
                <div className="flex items-center gap-4 min-w-0">
                  <div className="p-2.5 bg-amber-500/10 rounded-xl text-amber-500 flex-shrink-0">
                    <FileText size={22}/>
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-slate-500 mb-0.5">Preview Dokumen</p>
                    <h4 className="font-semibold text-white truncate text-sm">{selectedFile.name}</h4>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => {
                    const token = btoa(JSON.stringify({ id: selectedFile.id, exp: Date.now() + 86400000 }));
                    const shareUrl = `${window.location.origin}?share=${token}`;
                    navigator.clipboard.writeText(shareUrl);
                    alert("Tautan rahasia (berlaku 24 jam) berhasil disalin ke clipboard!");
                    addOnlineLog("SHARE", selectedFile.name);
                  }} className="p-2.5 bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 rounded-xl transition-all" title="Bagikan Tautan Sementara"><Share2 size={18}/></button>
                  <button onClick={() => { addOnlineLog("DOWNLOAD", selectedFile.name); window.open(`https://drive.google.com/uc?export=download&id=${selectedFile.id}`, '_blank'); }} className="p-2.5 bg-amber-500 rounded-xl text-slate-950 hover:bg-amber-400 transition-colors"><Download size={18}/></button>
                  <button onClick={() => { setSelectedFile(null); setPreviewLoading(true); }} className="p-2.5 bg-white/[0.06] text-slate-400 hover:text-white rounded-xl transition-all"><X size={18}/></button>
                </div>
              </div>
              
              {/* Preview Content */}
              <div className="flex-1 relative bg-black/30 overflow-hidden">
                {previewLoading && (
                  <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-slate-900">
                    <Loader2 className="animate-spin text-amber-500 mb-3" size={32} />
                    <p className="text-xs text-slate-500">Memuat preview...</p>
                  </div>
                )}
                {/* WATERMARK OVERLAY */}
                <div 
                  className="absolute inset-0 z-20 pointer-events-none"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='400' height='400' xmlns='http://www.w3.org/2000/svg'%3E%3Ctext x='50%25' y='50%25' font-size='28' font-family='Arial' font-weight='bold' fill='%23ef4444' opacity='0.15' transform='translate(200, 200) rotate(-45) translate(-200, -200)' text-anchor='middle'%3EDOKUMEN INSPEKTORAT%3C/text%3E%3C/svg%3E")`,
                    backgroundRepeat: 'repeat'
                  }}
                />
                <iframe src={`https://drive.google.com/file/d/${selectedFile.id}/preview`} className="w-full h-full border-0 relative z-0" title="Preview" onLoad={() => setPreviewLoading(false)} />
              </div>

              {/* Preview Footer */}
              <div className="p-5 border-t border-white/[0.06] flex items-center justify-between">
                <p className="text-xs text-slate-500 flex items-center gap-2">
                  <Eye size={13} /> Preview langsung dari Google Drive
                </p>
                <button 
                  onClick={() => { addOnlineLog("DOWNLOAD", selectedFile.name); window.open(`https://drive.google.com/uc?export=download&id=${selectedFile.id}`, '_blank'); }}
                  className="px-5 py-2.5 bg-white/[0.06] text-amber-500 hover:bg-amber-500 hover:text-slate-950 rounded-xl font-medium text-sm border border-amber-500/20 transition-all"
                >
                  Download
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
              className="fixed inset-0 z-[200] flex items-start justify-center pt-[15vh] px-4 bg-black/60 backdrop-blur-sm"
              onClick={() => setIsSearchModalOpen(false)}
            >
              <motion.div 
                initial={{ scale: 0.97, y: -10 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.97, y: -10 }}
                className="bg-slate-900 border border-white/[0.08] w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden" 
                onClick={e => e.stopPropagation()}
              >
                <div className="p-5 flex items-center gap-4 border-b border-white/[0.06]">
                  <Search className="text-slate-500 flex-shrink-0" size={18} />
                  <input 
                    autoFocus 
                    type="text" 
                    value={searchTerm}
                    placeholder="Cari dokumen atau folder..." 
                    className="flex-1 bg-transparent outline-none text-sm text-white placeholder:text-slate-600" 
                    onChange={(e) => handleGlobalSearch(e.target.value)} 
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        setIsSearchModalOpen(false);
                      }
                    }}
                  />
                  {searchLoading && <Loader2 className="animate-spin text-amber-500 flex-shrink-0" size={16} />}
                  <div className="px-2 py-0.5 bg-white/[0.06] border border-white/[0.08] rounded-md text-[10px] font-medium text-slate-500">ESC</div>
                </div>
                <div className="max-h-[360px] overflow-y-auto p-2 custom-scrollbar">
                  {searchTerm.length >= 2 ? (
                    searchResults.length > 0 ? (
                      searchResults.map(f => (
                        <div 
                          key={f.id} 
                          onClick={() => { if(f.mimeType.includes('folder')) navigateToFolder(f.id, f.name); else handleFileSelect(f); setIsSearchModalOpen(false); }} 
                          className="p-3 hover:bg-white/[0.04] rounded-xl cursor-pointer flex items-center justify-between group transition-all"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className={`p-1.5 rounded-lg ${f.mimeType.includes('folder') ? 'text-amber-500 bg-amber-500/10' : 'text-slate-400 bg-white/[0.05]'}`}>
                              {f.mimeType.includes('folder') ? <Folder size={16}/> : <FileText size={16}/>}
                            </div>
                            <div className="min-w-0">
                              <span className="block text-sm text-white truncate">{f.name}</span>
                              <span className="text-[10px] text-slate-600 mt-0.5 block">{f.mimeType.includes('folder') ? 'Folder' : 'Dokumen'}</span>
                            </div>
                          </div>
                          <ChevronRight size={14} className="text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                        </div>
                      ))
                    ) : !searchLoading && <div className="p-10 text-center text-sm text-slate-600">Tidak ditemukan</div>
                  ) : <div className="p-10 text-center text-sm text-slate-600">Ketik minimal 2 karakter...</div>}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}