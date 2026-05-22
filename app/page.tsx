"use client"
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Folder, FileText, Upload, Lock, Database, LayoutDashboard, 
  Search, LogOut, ChevronRight, Loader2, Edit2, Plus, X, Eye,
  Download, Clock, ArrowUpDown, Sun, Moon, HardDrive, Shield, 
  CheckCircle2, AlertCircle, Command
} from 'lucide-react';

export default function Dashboard() {
  const [mounted, setMounted] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<'admin' | 'user' | null>(null);
  const [password, setPassword] = useState('');
  const [files, setFiles] = useState<any[]>([]);
  const [currentFolder, setCurrentFolder] = useState<string>('');
  const [folderHistory, setFolderHistory] = useState<any[]>([]);
  const [selectedFile, setSelectedFile] = useState<any>(null);
  const [stats, setStats] = useState({ total: 0 });
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [allFolders, setAllFolders] = useState<any[]>([]); 
  const [searchTerm, setSearchTerm] = useState('');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [uploadDestinationId, setUploadDestinationId] = useState<string>('');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [sortBy, setSortBy] = useState<'name' | 'date'>('name');

  // --- 1. INITIALIZATION & SHORTCUTS ---
  useEffect(() => {
    setMounted(true);
    
    // Shortcut Ctrl+K
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchModalOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    // Session Persistence
    const savedLogin = sessionStorage.getItem('isLoggedIn');
    const savedRole = sessionStorage.getItem('userRole');
    if (savedLogin === 'true' && savedRole) {
      setIsLoggedIn(true);
      setUserRole(savedRole as 'admin' | 'user');
    }

    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // --- 2. DATA FETCHING ---
  const fetchData = async (fId: string = '') => {
    setLoading(true);
    try {
      const res = await fetch(`/api/drive?folderId=${fId}`);
      const data = await res.json();
      if (data.files) {
        setFiles(data.files);
        setStats({ total: data.totalDocs || 0 });
      }
    } catch (e) { console.error("Fetch error", e); }
    setLoading(false);
  };

  const fetchAllFolders = async () => {
    try {
      const res = await fetch('/api/drive/all-folders');
      const data = await res.json();
      if (Array.isArray(data)) setAllFolders(data);
    } catch (e) { console.error("Folders error", e); }
  };

  useEffect(() => {
    if (isLoggedIn) fetchData(currentFolder);
  }, [isLoggedIn, currentFolder]);

  useEffect(() => {
    if (isUploadModalOpen) fetchAllFolders();
  }, [isUploadModalOpen]);

  // --- 3. ACTIONS ---
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    let role: 'admin' | 'user' | null = null;
    if (password === 'adminLhp3') role = 'admin';
    else if (password === 'userLhp3') role = 'user';

    if (role) {
      setIsLoggedIn(true);
      setUserRole(role);
      sessionStorage.setItem('isLoggedIn', 'true');
      sessionStorage.setItem('userRole', role);
    } else {
      alert('Akses Ditolak! Gunakan kode yang valid.');
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadStatus('idle');
    setUploadProgress(30);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('parentId', uploadDestinationId || currentFolder || '');

    try {
      const res = await fetch('/api/drive/upload', { method: 'POST', body: formData });
      setUploadProgress(100);
      if (res.ok) {
        setUploadStatus('success');
        setTimeout(() => {
          setIsUploadModalOpen(false);
          setUploadStatus('idle');
          fetchData(currentFolder);
        }, 2000);
      } else { setUploadStatus('error'); }
    } catch (e) { setUploadStatus('error'); }
    setUploading(false);
  };

  const handleRename = async (fileId: string, oldName: string) => {
    const newName = prompt("Ubah nama file/folder:", oldName);
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

  // --- 4. VIEW: LOGIN ---
  if (!isLoggedIn) {
    return (
      <div className="relative min-h-screen w-full flex items-center justify-center p-4 bg-slate-900 font-sans">
        <div className="absolute inset-0 z-0 bg-cover bg-center opacity-40 scale-110" style={{ backgroundImage: "url('https://i.ibb.co.com/NnC3sn3S/bg-login.png')" }}></div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative z-10 bg-white/10 backdrop-blur-2xl p-10 rounded-[40px] shadow-2xl w-full max-w-md border border-white/20 text-center">
          <div className="p-4 bg-purple-600 w-fit mx-auto rounded-3xl text-white mb-6 shadow-lg flex justify-center"><Lock size={32} /></div>
          <h2 className="text-3xl font-black mb-2 text-white tracking-tight italic">Digital Archive</h2>
          <p className="text-white/60 mb-10 text-sm font-medium uppercase tracking-widest">Sistem Arsip Irban III</p>
          <form onSubmit={handleLogin} className="space-y-4">
            <input type="password" placeholder="Masukan Password Akses" className="w-full p-5 rounded-3xl border-none outline-none bg-white/10 text-white text-center font-bold placeholder:text-white/20 tracking-[0.3em]" onChange={(e) => setPassword(e.target.value)} />
            <button type="submit" className="w-full bg-white text-slate-900 p-5 rounded-3xl font-bold hover:bg-purple-50 transition-all active:scale-95 uppercase tracking-widest text-xs">Verify Access</button>
          </form>
        </motion.div>
      </div>
    );
  }

  // --- 5. VIEW: DASHBOARD ---
  return (
    <div className={isDarkMode ? "dark" : ""}>
      <div className="h-screen bg-[#F8FAFF] dark:bg-[#020617] flex text-slate-700 dark:text-slate-200 overflow-hidden transition-all duration-700 font-sans">
        
        {/* SIDEBAR */}
        <aside className="w-72 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 p-8 flex flex-col gap-8 transition-colors relative z-20">
          <div className="flex items-center gap-3 text-purple-600 dark:text-purple-400 font-black text-2xl italic mb-4"><Database size={28} /> ARV-DRIVE</div>
          <nav className="flex-1 space-y-2 text-sm font-bold">
            <button onClick={() => {setCurrentFolder(''); setFolderHistory([]);}} className={`w-full flex items-center gap-3 p-4 rounded-2xl transition-all ${!currentFolder ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 shadow-sm' : 'text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
              <LayoutDashboard size={20}/> Dashboard
            </button>
            <button className="w-full flex items-center gap-3 p-4 text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-2xl transition-all font-bold"><Folder size={20}/> Root Drive</button>
          </nav>

          <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 text-[10px] text-slate-400 flex items-center gap-2">
            <Command size={14}/> Press <kbd className="bg-white dark:bg-slate-700 px-1 py-0.5 rounded border dark:border-slate-600 font-bold text-slate-800 dark:text-white">Ctrl+K</kbd> to search
          </div>

          <div className="p-6 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 rounded-[35px] text-white shadow-xl relative overflow-hidden group">
             <p className="text-[10px] font-bold uppercase opacity-70 mb-2 tracking-[0.2em]">{userRole} System</p>
             <h4 className="text-4xl font-black tracking-tighter">{stats.total}</h4>
             <p className="text-[10px] mt-1 opacity-60 uppercase font-black tracking-widest leading-none">Arsip Terdata</p>
             <HardDrive className="absolute -right-4 -bottom-4 opacity-10 group-hover:rotate-12 transition-all duration-500" size={80}/>
          </div>
          
          <button onClick={() => {sessionStorage.clear(); window.location.reload();}} className="flex items-center gap-3 p-4 text-slate-400 hover:text-red-400 font-bold rounded-2xl transition-all"><LogOut size={20}/> Logout</button>
        </aside>

        {/* MAIN AREA */}
        <main className="flex-1 flex flex-col min-w-0 bg-[#FDFDFF] dark:bg-[#020617] transition-colors relative">
          <header className="p-8 flex justify-between items-center bg-white/30 dark:bg-slate-900/30 backdrop-blur-md border-b border-slate-100 dark:border-slate-800">
            <div>
              <h1 className="text-2xl font-black text-slate-800 dark:text-white tracking-tighter uppercase italic leading-none">Digital Archive</h1>
              <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 mt-2 uppercase tracking-widest leading-none">
                <span className="hover:text-purple-600 cursor-pointer" onClick={() => {setCurrentFolder(''); setFolderHistory([]);}}>HOME</span>
                {folderHistory.map((h, i) => (
                  <React.Fragment key={h.id + i}><ChevronRight size={10}/> <span className="text-slate-600 dark:text-slate-400 font-black">{h.name}</span></React.Fragment>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-4 flex-1 max-w-xl px-8">
              <div className="flex-1 relative group cursor-pointer" onClick={() => setIsSearchModalOpen(true)}>
                <Search size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" />
                <div className="w-full pl-14 pr-4 py-4 bg-white dark:bg-slate-800 ring-1 ring-slate-100 dark:ring-slate-800 rounded-[25px] text-slate-400 text-sm font-medium">Quick searching...</div>
              </div>
              <button onClick={() => setIsDarkMode(!isDarkMode)} className="p-4 bg-white dark:bg-slate-800 shadow-xl ring-1 ring-slate-100 dark:ring-slate-800 rounded-3xl text-slate-500 dark:text-yellow-400 transition-all hover:scale-105">
                {isDarkMode ? <Sun size={20}/> : <Moon size={20}/>}
              </button>
            </div>

            {userRole === 'admin' && (
              <button onClick={() => {setUploadDestinationId(currentFolder); setIsUploadModalOpen(true);}} className="flex items-center gap-3 bg-slate-900 dark:bg-purple-600 text-white px-8 py-4 rounded-[22px] font-black uppercase text-xs tracking-widest shadow-xl transition-all hover:scale-105 active:scale-95">
                <Plus size={20} /> New Upload
              </button>
            )}
          </header>

          <div className="flex-1 overflow-y-auto p-10 scrollbar-hide">
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8 pb-10">
               {files.filter(f => f.name.toLowerCase().includes(searchTerm.toLowerCase())).map((file) => (
                  <motion.div key={file.id} whileHover={{ y: -8 }} className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm p-8 rounded-[45px] border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-2xl transition-all group flex flex-col justify-between h-52 cursor-pointer" onClick={() => file.mimeType.includes('folder') ? (setCurrentFolder(file.id), setFolderHistory([...folderHistory, {id: file.id, name: file.name}])) : setSelectedFile(file)}>
                    <div className="flex justify-between items-start">
                      <div className={`p-4 rounded-3xl ${file.mimeType.includes('folder') ? 'bg-amber-100/50 text-amber-500 shadow-inner' : 'bg-blue-100/50 text-blue-500 shadow-inner'}`}>
                        {file.mimeType.includes('folder') ? <Folder size={28} fill="currentColor" /> : <FileText size={28} />}
                      </div>
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                        {!file.mimeType.includes('folder') && (
                          <button onClick={(e) => { e.stopPropagation(); window.open(`https://drive.google.com/uc?export=download&id=${file.id}`, '_blank'); }} className="p-3 bg-white dark:bg-slate-700 rounded-2xl text-slate-400 hover:text-blue-500 shadow-xl border dark:border-slate-600" title="Unduh"><Download size={18}/></button>
                        )}
                        {userRole === 'admin' && (
                          <button onClick={(e) => { e.stopPropagation(); handleRename(file.id, file.name); }} className="p-3 bg-white dark:bg-slate-700 rounded-2xl text-slate-400 hover:text-purple-500 shadow-xl border dark:border-slate-600" title="Rename"><Edit2 size={18}/></button>
                        )}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-black text-slate-800 dark:text-white truncate text-base leading-tight mb-1">{file.name}</h4>
                      <p className="text-[10px] font-black uppercase tracking-widest opacity-40">{file.mimeType.includes('folder') ? 'DIRECTORY' : 'PDF ARCHIVE'}</p>
                    </div>
                  </motion.div>
               ))}
            </div>
          </div>
        </main>

        {/* MODAL SEARCH (Ctrl+K) */}
        <AnimatePresence>
          {isSearchModalOpen && (
            <div className="fixed inset-0 z-[200] flex items-start justify-center pt-24 px-4 bg-slate-900/40 backdrop-blur-md" onClick={() => setIsSearchModalOpen(false)}>
              <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-[32px] shadow-2xl overflow-hidden border border-white/20" onClick={e => e.stopPropagation()}>
                <div className="p-6 flex items-center gap-4 border-b dark:border-slate-800">
                  <Search className="text-purple-500" />
                  <input autoFocus type="text" placeholder="Type document name..." className="flex-1 bg-transparent outline-none font-bold text-lg dark:text-white" onChange={(e) => setSearchTerm(e.target.value)} />
                </div>
                <div className="max-h-[400px] overflow-y-auto p-4">
                  {files.filter(f => f.name.toLowerCase().includes(searchTerm.toLowerCase())).map(f => (
                    <div key={f.id} onClick={() => {setSelectedFile(f); setIsSearchModalOpen(false);}} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-2xl cursor-pointer flex items-center justify-between group transition-all">
                      <div className="flex items-center gap-4">
                        <FileText className="text-slate-300 group-hover:text-purple-500" size={20}/>
                        <span className="font-bold text-sm dark:text-slate-300">{f.name}</span>
                      </div>
                      <ChevronRight size={14} className="text-slate-300" />
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* MODAL UPLOAD WITH PROGRESS */}
        <AnimatePresence>
          {isUploadModalOpen && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md">
              <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-white dark:bg-slate-900 rounded-[50px] p-12 w-full max-w-xl relative border border-white/20 shadow-2xl">
                <button onClick={() => setIsUploadModalOpen(false)} className="absolute right-10 top-10 text-slate-400 hover:text-slate-600"><X size={28}/></button>
                <h3 className="text-3xl font-black mb-1 text-slate-800 dark:text-white uppercase tracking-tighter italic">Secure Upload</h3>
                
                {uploadStatus === 'idle' ? (
                  <div className="space-y-8 mt-10">
                    <select value={uploadDestinationId} onChange={(e) => setUploadDestinationId(e.target.value)} className="w-full p-6 rounded-[30px] bg-slate-50 dark:bg-slate-800 border-none outline-none font-bold text-sm text-slate-600 dark:text-slate-300 ring-1 ring-slate-100 dark:ring-slate-700">
                      <option value="">🏠 Root Directory (Utama)</option>
                      {allFolders.map(f => (<option key={f.id} value={f.id}>📁 {f.name}</option>))}
                    </select>
                    <label className="flex flex-col items-center justify-center w-full h-64 border-4 border-dashed border-slate-100 dark:border-slate-800 rounded-[45px] cursor-pointer hover:bg-purple-50/50 transition-all text-center p-8 group">
                      {uploading ? (
                        <div className="w-full">
                          <Loader2 className="animate-spin mx-auto text-purple-600 mb-4" size={48} />
                          <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden mb-2">
                             <motion.div initial={{ width: 0 }} animate={{ width: `${uploadProgress}%` }} className="h-full bg-purple-500" />
                          </div>
                          <p className="text-[10px] font-black uppercase text-purple-500">{uploadProgress}% Uploading...</p>
                        </div>
                      ) : (
                        <>
                          <div className="p-6 bg-purple-600 rounded-[28px] text-white mb-6 group-hover:rotate-12 transition-all"><Upload size={36}/></div>
                          <p className="text-lg font-black text-slate-800 dark:text-white">Pilih Laporan Baru</p>
                          <input type="file" className="hidden" onChange={handleUpload} disabled={uploading} />
                        </>
                      )}
                    </label>
                  </div>
                ) : (
                  <div className="text-center py-20">
                    {uploadStatus === 'success' ? (
                      <motion.div initial={{ scale: 0.5 }} animate={{ scale: 1 }}>
                        <CheckCircle2 size={100} className="text-green-500 mx-auto mb-6" />
                        <h3 className="text-2xl font-black dark:text-white uppercase">Upload Berhasil</h3>
                      </motion.div>
                    ) : (
                      <motion.div initial={{ scale: 0.5 }} animate={{ scale: 1 }}>
                        <AlertCircle size={100} className="text-red-500 mx-auto mb-6" />
                        <h3 className="text-2xl font-black dark:text-white uppercase">Gagal Unggah</h3>
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
            <motion.div initial={{ x: 600 }} animate={{ x: 0 }} exit={{ x: 600 }} className="w-[550px] bg-white dark:bg-slate-900 shadow-2xl border-l border-slate-100 dark:border-slate-800 flex flex-col overflow-hidden relative z-30 transition-colors">
               <div className="p-8 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between bg-white/50 dark:bg-slate-900/50 backdrop-blur-md">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <FileText className="text-purple-600" size={20}/>
                    <span className="font-black text-[10px] truncate uppercase tracking-widest text-slate-800 dark:text-slate-200">{selectedFile.name}</span>
                  </div>
                  <button onClick={() => setSelectedFile(null)} className="p-2 text-slate-400 hover:text-red-500 transition-all"><X size={24}/></button>
               </div>
               <iframe src={`https://drive.google.com/file/d/${selectedFile.id}/preview`} className="flex-1 w-full bg-slate-50 dark:bg-slate-950" />
               <div className="p-8 pt-4 flex gap-4">
                  <button onClick={() => window.open(`https://drive.google.com/uc?export=download&id=${selectedFile.id}`, '_blank')} className="flex-1 py-5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-[28px] font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 transition-all"><Download size={20}/> Download PDF</button>
               </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}