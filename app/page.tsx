"use client"
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Folder, FileText, Upload, Lock, Database, LayoutDashboard, 
  Search, LogOut, ChevronRight, Loader2, Edit2, Plus, X, Eye,
  Download, Clock, ArrowLeft, Sun, Moon, HardDrive, Shield, 
  CheckCircle2, AlertCircle, Command
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

export default function Dashboard() {
  // --- STATES ---
  const [mounted, setMounted] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<'admin' | 'user' | null>(null);
  const [password, setPassword] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(false);

  const [files, setFiles] = useState<DriveFile[]>([]);
  const [currentFolder, setCurrentFolder] = useState<string>('');
  const [folderHistory, setFolderHistory] = useState<FolderHistory[]>([]);
  const [selectedFile, setSelectedFile] = useState<DriveFile | null>(null);
  const [allFolders, setAllFolders] = useState<DriveFile[]>([]); 
  const [stats, setStats] = useState({ total: 0 });

  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'date'>('name');

  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [uploadDestinationId, setUploadDestinationId] = useState<string>('');

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
    const savedTheme = localStorage.getItem('theme');
    
    if (savedLogin === 'true' && savedRole) {
      setIsLoggedIn(true);
      setUserRole(savedRole as 'admin' | 'user');
    }
    if (savedTheme === 'dark') setIsDarkMode(true);

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
    if (password === 'adminLhp3') {
      setUserRole('admin'); setIsLoggedIn(true);
      sessionStorage.setItem('isLoggedIn', 'true');
      sessionStorage.setItem('userRole', 'admin');
    } else if (password === 'userLhp3') {
      setUserRole('user'); setIsLoggedIn(true);
      sessionStorage.setItem('isLoggedIn', 'true');
      sessionStorage.setItem('userRole', 'user');
    } else { alert('Akses Ditolak! Kode Salah.'); }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true); setUploadStatus('idle'); setUploadProgress(30);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('parentId', uploadDestinationId || currentFolder || '');
    try {
      const res = await fetch('/api/drive/upload', { method: 'POST', body: formData });
      if (res.ok) {
        setUploadProgress(100);
        setUploadStatus('success');
        setTimeout(() => { setIsUploadModalOpen(false); setUploadStatus('idle'); fetchData(currentFolder); }, 2000);
      } else { setUploadStatus('error'); }
    } catch (e) { setUploadStatus('error'); }
    setUploading(false);
  };

  const handleRename = async (fileId: string, oldName: string) => {
    if (userRole !== 'admin') return;
    const newName = prompt("Ubah nama berkas:", oldName);
    if (!newName || newName === oldName) return;
    try {
      await fetch('/api/drive', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileId, newName })
      });
      fetchData(currentFolder);
    } catch (e) { alert("Gagal merubah nama"); }
  };

  if (!mounted) return null;

  // --- LOGIN VIEW ---
  if (!isLoggedIn) {
    return (
      <div className="relative min-h-screen w-full flex items-center justify-center p-4 bg-[#0F172A] font-sans overflow-hidden">
        <div className="absolute inset-0 z-0 bg-cover bg-center opacity-30 scale-110" style={{ backgroundImage: "url('https://i.ibb.co.com/NnC3sn3S/bg-login.png')" }}></div>
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="relative z-10 bg-white/10 backdrop-blur-3xl p-12 rounded-[60px] shadow-2xl w-full max-w-md border border-white/10 text-center">
          <div className="mb-8 flex justify-center">
            <div className="w-24 h-24 bg-white/10 backdrop-blur-md rounded-full p-4 border border-white/20 shadow-inner">
               <img src="https://i.ibb.co.com/L22pdJQ/Coat-of-arms-of-Southeast-Sulawesi-svg.png" alt="Logo" className="w-full h-full object-contain" />
            </div>
          </div>
          <h2 className="text-4xl font-black mb-1 text-white tracking-tighter italic uppercase leading-none">DIGITAL ARCHIVE</h2>
          <p className="text-purple-400 mb-10 text-[10px] font-black uppercase tracking-[0.4em]">Irban III • Inspection Portal</p>
          <form onSubmit={handleLogin} className="space-y-6">
            <input type="password" placeholder="ENTER ACCESS CODE" className="w-full p-6 rounded-[30px] border-none outline-none bg-white/5 text-white text-center font-black placeholder:text-white/20 tracking-[0.5em] focus:ring-2 focus:ring-purple-500 transition-all" onChange={(e) => setPassword(e.target.value)} />
            <button type="submit" className="w-full bg-white text-slate-900 p-6 rounded-[30px] font-black uppercase tracking-widest hover:bg-purple-50 transition-all shadow-xl active:scale-95">Akses Sistem</button>
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
          <div className="flex flex-col items-center gap-4 mb-6">
            {/* FIX LOGO: DIHAPUS BRIGHTNESS-0 INVERT AGAR WARNA ASLI MUNCUL */}
            <div className="w-20 h-20 bg-white/10 dark:bg-white/5 backdrop-blur-md rounded-3xl p-3 border border-white/20 shadow-xl shadow-slate-200/50 dark:shadow-none overflow-hidden flex items-center justify-center">
               <img src="https://i.ibb.co.com/L22pdJQ/Coat-of-arms-of-Southeast-Sulawesi-svg.png" alt="Logo" className="w-full h-full object-contain" />
            </div>
            <div className="text-center">
              <h1 className="font-black text-2xl tracking-tighter text-slate-800 dark:text-white italic leading-none">ARV<span className="text-purple-600">DRIV3</span></h1>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1 leading-none">Inspection Tech v2.0</p>
            </div>
          </div>
          
          <nav className="flex-1 space-y-3 font-black">
            <button onClick={goHome} className={`w-full flex items-center gap-4 p-5 rounded-[25px] text-xs uppercase tracking-widest transition-all ${!currentFolder ? 'bg-slate-900 dark:bg-purple-600 text-white shadow-2xl scale-[1.05]' : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}>
              <LayoutDashboard size={18}/> Dashboard
            </button>
            <button onClick={goHome} className="w-full flex items-center gap-4 p-5 text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-[25px] transition-all text-xs uppercase tracking-widest">
              <Folder size={18}/> Root System
            </button>
          </nav>

          <div className="p-8 bg-gradient-to-br from-slate-900 to-slate-800 dark:from-purple-900 dark:to-indigo-900 rounded-[40px] text-white shadow-2xl relative overflow-hidden group">
             <div className="relative z-10">
               <p className="text-[10px] font-black uppercase opacity-50 mb-2 tracking-[0.2em] leading-none">{userRole} Identity</p>
               <h4 className="text-4xl font-black tracking-tighter">{stats.total}</h4>
               <p className="text-[9px] mt-4 opacity-40 font-bold uppercase tracking-widest leading-none">Reports Secured</p>
             </div>
             <Database className="absolute -right-6 -bottom-6 opacity-5 group-hover:rotate-12 transition-all duration-700" size={120}/>
          </div>
          
          <button onClick={() => {sessionStorage.clear(); window.location.reload();}} className="flex items-center justify-center gap-3 p-5 bg-red-500/10 text-red-500 font-black uppercase text-[10px] tracking-widest rounded-2xl hover:bg-red-500 hover:text-white transition-all"><LogOut size={16}/> lOGOUT</button>
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
                <div className="w-full pl-16 pr-6 py-5 bg-white dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 rounded-[30px] text-slate-400 text-xs font-black uppercase tracking-widest shadow-xl shadow-slate-200/50 dark:shadow-none transition-all group-hover:ring-2 group-hover:ring-purple-500/20">Search Control...</div>
                <div className="absolute right-6 top-1/2 -translate-y-1/2 px-2 py-1 bg-slate-50 dark:bg-slate-800 rounded-lg text-[9px] font-black text-slate-300 border border-slate-100 dark:border-slate-700">CTRL + K</div>
              </div>
              
              <button onClick={() => setIsDarkMode(!isDarkMode)} className="p-5 bg-white dark:bg-slate-900 shadow-xl border border-slate-100 dark:border-slate-800 rounded-[25px] text-slate-400 dark:text-yellow-400 hover:scale-110 transition-all active:rotate-90">
                {isDarkMode ? <Sun size={24}/> : <Moon size={24}/>}
              </button>
            </div>

            {userRole === 'admin' && (
              <button onClick={() => {setUploadDestinationId(currentFolder); setIsUploadModalOpen(true);}} className="flex items-center gap-3 bg-slate-900 dark:bg-purple-600 text-white px-10 py-5 rounded-[30px] font-black uppercase text-[10px] tracking-[0.2em] shadow-xl hover:translate-y-[-2px] transition-all active:scale-95">
                <Plus size={20} strokeWidth={3} /> New Report
              </button>
            )}
          </header>

          <div className="flex-1 overflow-y-auto p-12 scrollbar-hide">
            {loading ? (
              <div className="h-full flex flex-col items-center justify-center gap-4 text-slate-400">
                <Loader2 className="animate-spin text-purple-600" size={40} />
                <p className="font-black text-xs uppercase tracking-[0.3em]">Synchronizing...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-10 pb-20">
                {files.filter(f => f.name.toLowerCase().includes(searchTerm.toLowerCase())).map((file) => (
                  <motion.div 
                    key={file.id} 
                    whileHover={{ y: -10, scale: 1.02 }}
                    className={`relative group bg-white/70 dark:bg-slate-800/40 backdrop-blur-xl p-8 rounded-[50px] border transition-all cursor-pointer h-64 flex flex-col justify-between ${selectedFile?.id === file.id ? 'border-purple-500 ring-4 ring-purple-500/10 shadow-2xl' : 'border-slate-200/50 dark:border-slate-800 shadow-[0_10px_40px_rgba(0,0,0,0.03)] hover:shadow-2xl hover:border-purple-400/50'}`}
                    onClick={() => file.mimeType.includes('folder') ? navigateToFolder(file.id, file.name) : setSelectedFile(file)}
                  >
                    <div className="flex justify-between items-start">
                      <div className={`p-5 rounded-[25px] shadow-inner transition-transform duration-500 group-hover:rotate-[10deg] ${file.mimeType.includes('folder') ? 'bg-amber-100 text-amber-500 dark:bg-amber-900/30' : 'bg-blue-100 text-blue-500 dark:bg-blue-900/30'}`}>
                        {file.mimeType.includes('folder') ? <Folder size={32} fill="currentColor" /> : <FileText size={32} />}
                      </div>
                      
                      <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-4 group-hover:translate-x-0">
                        {!file.mimeType.includes('folder') && (
                          <button onClick={(e) => { e.stopPropagation(); window.open(`https://drive.google.com/uc?export=download&id=${file.id}`, '_blank'); }} className="p-3 bg-white dark:bg-slate-700 rounded-2xl text-slate-400 hover:text-blue-500 shadow-xl border border-slate-100 dark:border-slate-600"><Download size={20}/></button>
                        )}
                        {userRole === 'admin' && (
                          <button onClick={(e) => { e.stopPropagation(); handleRename(file.id, file.name); }} className="p-3 bg-white dark:bg-slate-700 rounded-2xl text-slate-400 hover:text-purple-500 shadow-xl border border-slate-100 dark:border-slate-600"><Edit2 size={20}/></button>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-black text-slate-900 dark:text-white truncate text-lg leading-tight mb-2 uppercase tracking-tighter leading-none">{file.name}</h4>
                      <span className="text-[9px] font-black uppercase tracking-[0.2em] py-1.5 px-4 bg-slate-100 dark:bg-slate-700/50 rounded-full text-slate-400 inline-block">
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
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white/90 dark:bg-slate-900/90 w-full max-w-3xl rounded-[40px] shadow-2xl overflow-hidden border border-white/20" onClick={e => e.stopPropagation()}>
                <div className="p-8 flex items-center gap-6 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                  <Search className="text-purple-600" size={28} />
                  <input autoFocus type="text" placeholder="Type document name..." className="flex-1 bg-transparent outline-none font-black text-xl dark:text-white uppercase tracking-tighter" onChange={(e) => setSearchTerm(e.target.value)} />
                  <div className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-xl text-[10px] font-black text-slate-400 border border-slate-200 dark:border-slate-700">ESC</div>
                </div>
                <div className="max-h-[500px] overflow-y-auto p-6 scrollbar-hide">
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

        {/* UPLOAD MODAL */}
        <AnimatePresence>
          {isUploadModalOpen && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/80 backdrop-blur-2xl">
              <motion.div initial={{ scale: 0.8, y: 50 }} animate={{ scale: 1, y: 0 }} className="bg-white dark:bg-slate-900 rounded-[60px] p-16 w-full max-w-2xl relative border border-white/10 shadow-2xl">
                <button onClick={() => setIsUploadModalOpen(false)} className="absolute right-12 top-12 text-slate-400 hover:rotate-90 transition-all duration-500"><X size={32}/></button>
                <div className="text-center mb-12">
                   <h3 className="text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tighter italic">Secure Gateway</h3>
                   <p className="text-xs text-purple-500 font-bold uppercase tracking-[0.5em] mt-2">Satellite Transmission Active</p>
                </div>
                {uploadStatus === 'idle' ? (
                  <div className="space-y-10">
                    <select value={uploadDestinationId} onChange={(e) => setUploadDestinationId(e.target.value)} className="w-full p-6 rounded-[30px] bg-slate-100 dark:bg-slate-800 border-none outline-none font-black text-sm text-slate-600 dark:text-slate-300 cursor-pointer ring-2 ring-slate-100 dark:ring-slate-800 focus:ring-purple-500 transition-all appearance-none">
                      <option value="">🏠 ROOT DIRECTORY</option>
                      {allFolders.map(f => (<option key={f.id} value={f.id}>📁 {f.name.toUpperCase()}</option>))}
                    </select>
                    <label className="flex flex-col items-center justify-center w-full h-72 border-4 border-dashed border-slate-100 dark:border-slate-800 rounded-[50px] cursor-pointer hover:bg-purple-50/50 dark:hover:bg-purple-900/10 transition-all text-center p-8 group">
                      {uploading ? (
                        <div className="w-full"><Loader2 className="animate-spin mx-auto text-purple-600 mb-6" size={60} /><div className="w-full bg-slate-100 dark:bg-slate-800 h-4 rounded-full overflow-hidden mb-4"><motion.div initial={{ width: 0 }} animate={{ width: `${uploadProgress}%` }} className="h-full bg-gradient-to-r from-purple-500 to-blue-500 shadow-[0_0_20px_#a855f7]" /></div><p className="text-xs font-black uppercase text-purple-500 tracking-[0.3em]">{uploadProgress}% ENCRYPTING...</p></div>
                      ) : (
                        <><div className="p-8 bg-purple-600 rounded-[35px] text-white mb-6 shadow-2xl group-hover:scale-110 transition-all"><Upload size={48} strokeWidth={3}/></div><p className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Initialize Archive</p><input type="file" className="hidden" onChange={handleUpload} disabled={uploading} /></>
                      )}
                    </label>
                  </div>
                ) : (
                  <div className="text-center py-20">{uploadStatus === 'success' ? (<motion.div initial={{ scale: 0.5 }} animate={{ scale: 1 }}><CheckCircle2 size={100} className="text-green-500 mx-auto mb-6" /><h3 className="text-3xl font-black dark:text-white uppercase tracking-tighter">Secured</h3></motion.div>) : (<motion.div initial={{ scale: 0.5 }} animate={{ scale: 1 }}><AlertCircle size={100} className="text-red-500 mx-auto mb-6" /><h3 className="text-3xl font-black dark:text-white uppercase">Failure</h3></motion.div>)}</div>
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
                  <button onClick={() => setSelectedFile(null)} className="p-3 bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-red-500 rounded-full transition-all border border-slate-200 dark:border-slate-700 leading-none"><X size={28}/></button>
               </div>
               <iframe src={`https://drive.google.com/file/d/${selectedFile.id}/preview`} className="flex-1 w-full m-8 rounded-[50px] overflow-hidden bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-2xl" title="Live Sync" />
               <div className="p-10 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md border-t border-slate-200 dark:border-slate-800"><button onClick={() => window.open(`https://drive.google.com/uc?export=download&id=${selectedFile.id}`, '_blank')} className="w-full py-6 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-[35px] font-black text-xs uppercase tracking-[0.3em] flex items-center justify-center gap-4 active:scale-95 shadow-xl transition-all leading-none border border-white/20"><Download size={22} strokeWidth={3}/> Secure Download</button></div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}