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
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadDestinationId, setUploadDestinationId] = useState<string>(''); // Default ke root

  useEffect(() => { setMounted(true); }, []);

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

  useEffect(() => {
    if (isLoggedIn) fetchData(currentFolder);
  }, [isLoggedIn, currentFolder]);

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
  // Gunakan uploadDestinationId jika dipilih, jika tidak gunakan currentFolder
  formData.append('parentId', uploadDestinationId || currentFolder || '');

  try {
    await fetch('/api/drive/upload', { method: 'POST', body: formData });
    setIsUploadModalOpen(false); // Tutup modal setelah sukses
    fetchData(currentFolder);
  } catch (error) {
    alert("Gagal upload!");
  } finally {
    setUploading(false);
  }
};
  if (!mounted) return null;

  if (!isLoggedIn) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-[#E3F2FD] via-[#F3E5F5] to-[#FCE4EC]">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-white/70 backdrop-blur-2xl p-10 rounded-[40px] shadow-2xl w-96 text-center border border-white">
          <div className="p-4 bg-purple-500 w-fit mx-auto rounded-3xl text-white mb-6 shadow-lg shadow-purple-200"><Lock /></div>
          <h2 className="text-2xl font-black mb-8 text-slate-800">Arsip Pengawasan</h2>
          <input type="password" placeholder="Password Akses" className="w-full p-5 rounded-3xl border-none ring-1 ring-purple-100 mb-4 outline-none focus:ring-2 focus:ring-purple-400 bg-white/50" onChange={(e) => setPassword(e.target.value)} />
          <button onClick={() => password === 'Lhp3' ? setIsLoggedIn(true) : alert('Password Salah!')} className="w-full bg-slate-900 text-white p-5 rounded-3xl font-bold hover:scale-[1.02] transition-all shadow-xl">Buka Sistem</button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-[#FBFCFE] flex text-slate-700 overflow-hidden font-sans">
      {/* SIDEBAR */}
      <aside className="w-72 bg-white border-r border-slate-100 p-8 flex flex-col gap-10">
        <div className="flex items-center gap-3 text-purple-600 font-black text-2xl tracking-tighter italic">
          <Database size={28} /> LHP-DRIVE
        </div>
        
        <nav className="flex-1 space-y-2">
          <button onClick={() => {setCurrentFolder(''); setFolderHistory([]);}} className={`w-full flex items-center gap-3 p-4 rounded-2xl font-bold transition-all ${!currentFolder ? 'bg-purple-50 text-purple-600 shadow-sm' : 'text-slate-400 hover:bg-slate-50'}`}>
            <LayoutDashboard size={20}/> Dashboard
          </button>
          <button className="w-full flex items-center gap-3 p-4 text-slate-400 hover:bg-slate-50 rounded-2xl transition-all">
            <Folder size={20}/> Folder Utama
          </button>
        </nav>

        {/* Statistik Card */}
        <div className="p-6 bg-gradient-to-br from-blue-600 to-purple-600 rounded-[32px] text-white shadow-xl shadow-purple-100 relative overflow-hidden">
          <div className="relative z-10">
            <p className="text-xs opacity-80 font-bold uppercase tracking-wider mb-1">Total Laporan</p>
            <h4 className="text-4xl font-black">{stats.total}</h4>
          </div>
          <div className="absolute -right-4 -bottom-4 opacity-20 transform rotate-12">
            <FileText size={100} />
          </div>
        </div>

        <button onClick={() => setIsLoggedIn(false)} className="flex items-center gap-3 p-4 text-red-400 font-bold hover:bg-red-50 rounded-2xl transition-all">
          <LogOut size={20}/> Keluar
        </button>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col min-w-0">
        <header className="p-10 flex justify-between items-center bg-white/30 backdrop-blur-sm border-b border-slate-100">
          <div>
            <h1 className="text-2xl font-black text-slate-800">Digital Archive</h1>
            <div className="flex items-center gap-2 text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">
              <span className="hover:text-purple-600 cursor-pointer" onClick={() => {setCurrentFolder(''); setFolderHistory([]);}}>Root</span>
              {folderHistory.map((h, i) => (
                <React.Fragment key={h.id}><ChevronRight size={12}/> <span className="text-slate-600">{h.name}</span></React.Fragment>
              ))}
            </div>
          </div>
          
          <label className="flex items-center gap-3 bg-slate-900 text-white px-8 py-4 rounded-[24px] font-bold cursor-pointer hover:shadow-2xl hover:shadow-slate-300 transition-all active:scale-95">
            {uploading ? <Loader2 className="animate-spin" /> : <Plus size={20} />}
            {uploading ? 'Mengupload...' : 'Upload Dokumen'}
            <input type="file" className="hidden" onChange={handleUpload} disabled={uploading} />
          </label>
        </header>

        <div className="flex-1 flex overflow-hidden p-6 gap-6">
          {/* Daftar File & Folder */}
          <div className="flex-1 overflow-y-auto pr-2 space-y-4">
            {loading ? (
              <div className="h-full flex items-center justify-center text-slate-400 font-bold tracking-widest uppercase text-xs">
                <Loader2 className="animate-spin mr-3" /> Sinkronisasi Drive...
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {files.map((file) => (
                  <motion.div 
                    key={file.id} 
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    className={`p-5 rounded-[28px] border transition-all cursor-pointer group flex flex-col justify-between h-44 ${selectedFile?.id === file.id ? 'bg-purple-600 border-purple-600 text-white shadow-xl shadow-purple-200' : 'bg-white border-slate-100 hover:border-purple-200 shadow-sm'}`}
                    onClick={() => {
                      if(file.mimeType === 'application/vnd.google-apps.folder') {
                        setCurrentFolder(file.id);
                        setFolderHistory([...folderHistory, {id: file.id, name: file.name}]);
                      } else {
                        setSelectedFile(file);
                      }
                    }}
                  >
                    <div className="flex justify-between items-start">
                      <div className={`p-3 rounded-2xl ${selectedFile?.id === file.id ? 'bg-white/20 text-white' : (file.mimeType.includes('folder') ? 'bg-amber-50 text-amber-500' : 'bg-blue-50 text-blue-500')}`}>
                        {file.mimeType.includes('folder') ? <Folder size={24} fill="currentColor" /> : <FileText size={24} />}
                      </div>
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleRename(file.id, file.name); }}
                        className={`p-2 rounded-xl opacity-0 group-hover:opacity-100 transition-all ${selectedFile?.id === file.id ? 'hover:bg-white/20 text-white' : 'hover:bg-slate-100 text-slate-400'}`}
                      >
                        <Edit2 size={16} />
                      </button>
                    </div>
                    <div>
                      <h4 className="font-bold truncate text-sm mb-1">{file.name}</h4>
                      <p className={`text-[10px] font-black uppercase tracking-tighter opacity-60`}>
                        {file.mimeType.includes('folder') ? 'Directory' : 'PDF Document'}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* LIVE VIEW PANEL (Panel Kanan) */}
          <AnimatePresence>
            {selectedFile && (
              <motion.div 
                initial={{ x: 300, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 300, opacity: 0 }}
                className="w-[450px] bg-white rounded-[40px] shadow-2xl border border-slate-100 flex flex-col overflow-hidden"
              >
                <div className="p-6 border-b border-slate-50 flex items-center justify-between">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <FileText className="text-purple-600 flex-shrink-0" size={20} />
                    <span className="font-bold text-sm truncate text-slate-700">{selectedFile.name}</span>
                  </div>
                  <button onClick={() => setSelectedFile(null)} className="p-2 hover:bg-slate-50 rounded-full text-slate-400">
                    <X size={20} />
                  </button>
                </div>
                
                <div className="flex-1 bg-slate-50 relative">
                  <iframe 
                    src={`https://drive.google.com/file/d/${selectedFile.id}/preview`}
                    className="w-full h-full border-none"
                    allow="autoplay"
                  />
                </div>

                <div className="p-6 bg-white border-t border-slate-50">
                  <button 
                    onClick={() => window.open(`https://drive.google.com/file/d/${selectedFile.id}/view`, '_blank')}
                    className="w-full py-4 bg-purple-50 text-purple-600 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-purple-100 transition-all"
                  >
                    <Eye size={18} /> Buka Tab Baru
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        {/* MODAL UPLOAD DENGAN PILIHAN FOLDER */}
<AnimatePresence>
  {isUploadModalOpen && (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={() => setIsUploadModalOpen(false)}
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
      />
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="relative bg-white rounded-[40px] shadow-2xl w-full max-w-lg overflow-hidden border border-white"
      >
        <div className="p-8">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-black text-slate-800">Upload Dokumen Baru</h3>
            <button onClick={() => setIsUploadModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400">
              <X size={20} />
            </button>
          </div>

          <div className="space-y-6">
            {/* Pilihan Folder Tujuan */}
            <div>
              <label className="text-xs font-black uppercase tracking-widest text-slate-400 mb-3 block">Pilih Folder Tujuan</label>
              <select 
                value={uploadDestinationId}
                onChange={(e) => setUploadDestinationId(e.target.value)}
                className="w-full p-4 rounded-2xl bg-slate-50 border-none ring-1 ring-slate-100 focus:ring-2 focus:ring-purple-400 outline-none font-bold text-slate-600 appearance-none cursor-pointer"
              >
                <option value="">🏠 Root (Folder Utama)</option>
                {/* Hanya menampilkan folder di dalam dropdown */}
                {files.filter(f => f.mimeType.includes('folder')).map(folder => (
                  <option key={folder.id} value={folder.id}>📁 {folder.name}</option>
                ))}
              </select>
            </div>

            {/* Area Pilih File */}
            <label className="flex flex-col items-center justify-center w-full h-44 border-2 border-dashed border-slate-200 rounded-[32px] cursor-pointer hover:bg-purple-50/50 hover:border-purple-200 transition-all group">
              <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center px-4">
                <div className="p-4 bg-purple-50 rounded-2xl text-purple-600 mb-3 group-hover:scale-110 transition-transform">
                  {uploading ? <Loader2 className="animate-spin" /> : <Upload size={24} />}
                </div>
                <p className="text-sm font-bold text-slate-600">
                  {uploading ? 'Sedang Mengirim...' : 'Klik untuk pilih file laporan'}
                </p>
                <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-tighter">PDF, DOCX, atau Gambar (Max 10MB)</p>
              </div>
              <input type="file" className="hidden" onChange={handleUpload} disabled={uploading} />
            </label>
          </div>
        </div>
      </motion.div>
    </div>
  )}
</AnimatePresence>
      </main>
    </div>
  );
}