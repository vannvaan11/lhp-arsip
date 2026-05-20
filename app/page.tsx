"use client"
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Folder, FileText, Upload, Lock, Database, LayoutDashboard, 
  Search, LogOut, ChevronRight, Loader2, Edit2, Plus, X, Eye
} from 'lucide-react';

export default function Dashboard() {
  const [mounted, setMounted] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [password, setPassword] = useState('');
  const [files, setFiles] = useState<any[]>([]);
  const [currentFolder, setCurrentFolder] = useState<string>('');
  const [folderHistory, setFolderHistory] = useState<any[]>([]);
  const [selectedFile, setSelectedFile] = useState<any>(null);
  const [stats, setStats] = useState({ total: 0 });
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [allFolders, setAllFolders] = useState<any[]>([]); // Untuk menyimpan semua folder di Drive
  
  // Fitur Baru: Search & Upload Modal
  const [searchTerm, setSearchTerm] = useState('');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadDestinationId, setUploadDestinationId] = useState<string>('');

  useEffect(() => { setMounted(true); }, []);

  // Ambil Data dari API
  const fetchData = async (fId: string = '') => {
    setLoading(true);
    try {
      const res = await fetch(`/api/drive?folderId=${fId}`);
      const data = await res.json();
      setFiles(data.files || []);
      setStats({ total: data.totalDocs || 0 });
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const fetchAllFolders = async () => {
  try {
    const res = await fetch('/api/drive/all-folders');
    const data = await res.json();
    setAllFolders(data);
  } catch (e) { console.error("Gagal mengambil daftar folder", e); }
};

// Panggil fungsi ini saat Modal Upload dibuka
useEffect(() => {
  if (isUploadModalOpen) fetchAllFolders();
}, [isUploadModalOpen]);

  useEffect(() => {
    if (isLoggedIn) fetchData(currentFolder);
  }, [isLoggedIn, currentFolder]);

  // Logika Filter Pencarian
  const filteredFiles = files.filter(file => 
    file.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'Lhp3') { setIsLoggedIn(true); } 
    else { alert('Password Salah!'); }
  };

  const handleRename = async (fileId: string, oldName: string) => {
    const newName = prompt("Ubah nama file/folder:", oldName);
    if (!newName || newName === oldName) return;
    await fetch('/api/drive', {
      method: 'PATCH',
      body: JSON.stringify({ fileId, newName })
    });
    fetchData(currentFolder);
  };

  const handleUpload = async (e: any) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('parentId', uploadDestinationId || currentFolder || '');

    try {
      await fetch('/api/drive/upload', { method: 'POST', body: formData });
      setIsUploadModalOpen(false);
      fetchData(currentFolder);
    } catch (e) { alert("Gagal Upload"); }
    setUploading(false);
  };

  if (!mounted) return null;

  if (!isLoggedIn) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-[#E3F2FD] via-[#F3E5F5] to-[#FCE4EC]">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white/70 backdrop-blur-2xl p-10 rounded-[40px] shadow-2xl w-96 text-center border border-white">
          <div className="p-4 bg-purple-500 w-fit mx-auto rounded-3xl text-white mb-6 shadow-lg shadow-purple-200"><Lock /></div>
          <h2 className="text-2xl font-black mb-8 text-slate-800">Arsip Pengawasan</h2>
          <form onSubmit={handleLogin}>
            <input type="password" placeholder="Password Akses" className="w-full p-5 rounded-3xl border-none ring-1 ring-purple-100 mb-4 outline-none focus:ring-2 focus:ring-purple-400 bg-white/50 text-center" onChange={(e) => setPassword(e.target.value)} />
            <button type="submit" className="w-full bg-slate-900 text-white p-5 rounded-3xl font-bold hover:scale-[1.02] transition-all shadow-xl">Buka Sistem</button>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-[#FBFCFE] flex text-slate-700 overflow-hidden font-sans">
      {/* SIDEBAR */}
      <aside className="w-72 bg-white border-r border-slate-100 p-8 flex flex-col gap-10">
        <div className="flex items-center gap-3 text-purple-600 font-black text-2xl italic"><Database size={28} /> LHP-DRIVE</div>
        <nav className="flex-1 space-y-2 text-sm font-bold">
          <button onClick={() => {setCurrentFolder(''); setFolderHistory([]);}} className={`w-full flex items-center gap-3 p-4 rounded-2xl transition-all ${!currentFolder ? 'bg-purple-50 text-purple-600 shadow-sm' : 'text-slate-400 hover:bg-slate-50'}`}>
            <LayoutDashboard size={20}/> Dashboard
          </button>
          <button className="w-full flex items-center gap-3 p-4 text-slate-400 hover:bg-slate-50 rounded-2xl transition-all">
            <Folder size={20}/> Root Directory
          </button>
        </nav>
        <div className="p-6 bg-gradient-to-br from-blue-600 to-purple-600 rounded-[32px] text-white shadow-xl">
          <p className="text-[10px] font-black uppercase opacity-70 mb-1">Total Laporan</p>
          <h4 className="text-4xl font-black">{stats.total}</h4>
        </div>
        <button onClick={() => setIsLoggedIn(false)} className="flex items-center gap-3 p-4 text-red-400 font-bold hover:bg-red-50 rounded-2xl transition-all"><LogOut size={20}/> Keluar</button>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col min-w-0">
        <header className="p-10 flex justify-between items-center bg-white/30 backdrop-blur-sm border-b border-slate-100">
          <div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tighter">Digital Archive</h1>
            <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 mt-1 uppercase tracking-widest">
              <span className="hover:text-purple-600 cursor-pointer" onClick={() => {setCurrentFolder(''); setFolderHistory([]);}}>Root</span>
              {folderHistory.map((h) => (<React.Fragment key={h.id}><ChevronRight size={10}/> <span className="text-slate-600">{h.name}</span></React.Fragment>))}
            </div>
          </div>

          {/* SEARCH BAR */}
          <div className="flex-1 max-w-md mx-8 relative group hidden md:block">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-purple-500 transition-colors" />
            <input type="text" placeholder="Cari dokumen..." className="w-full pl-12 pr-4 py-3 bg-white ring-1 ring-slate-100 rounded-2xl focus:ring-2 focus:ring-purple-400 outline-none text-sm font-medium transition-all" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
          
          <button onClick={() => {setUploadDestinationId(currentFolder); setIsUploadModalOpen(true);}} className="flex items-center gap-2 bg-slate-900 text-white px-8 py-4 rounded-2xl font-bold hover:shadow-2xl transition-all active:scale-95">
            <Plus size={20} /> Upload
          </button>
        </header>

        <div className="flex-1 flex overflow-hidden p-6 gap-6">
          {/* GRID FILES */}
          <div className="flex-1 overflow-y-auto pr-2">
            {loading ? (
              <div className="h-full flex items-center justify-center text-slate-400 font-bold text-xs uppercase tracking-widest"><Loader2 className="animate-spin mr-3" /> Memuat Drive...</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {filteredFiles.map((file) => (
                  <motion.div key={file.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={`p-5 rounded-[28px] border transition-all cursor-pointer group flex flex-col justify-between h-40 ${selectedFile?.id === file.id ? 'bg-purple-600 border-purple-600 text-white shadow-xl' : 'bg-white border-slate-100 hover:border-purple-200 shadow-sm'}`} onClick={() => { file.mimeType.includes('folder') ? (setCurrentFolder(file.id), setFolderHistory([...folderHistory, {id: file.id, name: file.name}])) : setSelectedFile(file); }}>
                    <div className="flex justify-between items-start">
                      <div className={`p-3 rounded-2xl ${selectedFile?.id === file.id ? 'bg-white/20 text-white' : (file.mimeType.includes('folder') ? 'bg-amber-50 text-amber-500' : 'bg-blue-50 text-blue-500')}`}>
                        {file.mimeType.includes('folder') ? <Folder size={24} fill="currentColor" /> : <FileText size={24} />}
                      </div>
                      <button onClick={(e) => { e.stopPropagation(); handleRename(file.id, file.name); }} className={`p-2 rounded-xl opacity-0 group-hover:opacity-100 transition-all ${selectedFile?.id === file.id ? 'text-white' : 'text-slate-300 hover:text-purple-500'}`}><Edit2 size={16} /></button>
                    </div>
                    <div>
                      <h4 className="font-bold truncate text-sm">{file.name}</h4>
                      <p className="text-[9px] font-black uppercase opacity-50 tracking-tighter">{file.mimeType.includes('folder') ? 'Directory' : 'Document'}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* PREVIEW PANEL */}
          <AnimatePresence>
            {selectedFile && (
              <motion.div initial={{ x: 300, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 300, opacity: 0 }} className="w-[450px] bg-white rounded-[40px] shadow-2xl border border-slate-100 flex flex-col overflow-hidden">
                <div className="p-6 border-b border-slate-50 flex items-center justify-between bg-white/50 backdrop-blur-md">
                  <span className="font-bold text-sm truncate pr-4">{selectedFile.name}</span>
                  <button onClick={() => setSelectedFile(null)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400"><X size={20} /></button>
                </div>
                <div className="flex-1 bg-slate-50"><iframe src={`https://drive.google.com/file/d/${selectedFile.id}/preview`} className="w-full h-full border-none" /></div>
                <div className="p-6"><button onClick={() => window.open(`https://drive.google.com/file/d/${selectedFile.id}/view`, '_blank')} className="w-full py-4 bg-purple-50 text-purple-600 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-purple-100 transition-all"><Eye size={18} /> Full View</button></div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* UPLOAD MODAL */}
      <AnimatePresence>
        {isUploadModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsUploadModalOpen(false)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="relative bg-white rounded-[40px] shadow-2xl w-full max-w-md p-8 border border-white">
              <h3 className="text-xl font-black mb-6">Upload Dokumen</h3>
              <div className="space-y-6">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Pilih Folder Tujuan</label>
                  <select value={uploadDestinationId} onChange={(e) => setUploadDestinationId(e.target.value)} className="w-full p-4 rounded-2xl bg-slate-50 border-none ring-1 ring-slate-100 focus:ring-2 focus:ring-purple-400 outline-none font-bold text-sm">
                    <option value="">🏠 Root / Utama</option>
                    {files.filter(f => f.mimeType.includes('folder')).map(f => (<option key={f.id} value={f.id}>📁 {f.name}</option>))}
                  </select>
                </div>
                <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-slate-100 rounded-[32px] cursor-pointer hover:bg-purple-50 hover:border-purple-200 transition-all text-center p-4">
                  <div className="p-4 bg-purple-50 rounded-2xl text-purple-600 mb-2">{uploading ? <Loader2 className="animate-spin" /> : <Upload size={24} />}</div>
                  <p className="text-sm font-bold text-slate-600">{uploading ? 'Mengirim...' : 'Pilih File Laporan'}</p>
                  <input type="file" className="hidden" onChange={handleUpload} disabled={uploading} />
                </label>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}