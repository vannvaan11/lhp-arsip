"use client"
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Folder, FileText, Upload, Lock, Database, LayoutDashboard, 
  Search, LogOut, ChevronRight, Loader2, MoreVertical, Edit2, Plus
} from 'lucide-react';

export default function Dashboard() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [password, setPassword] = useState('');
  const [files, setFiles] = useState<any[]>([]);
  const [currentFolder, setCurrentFolder] = useState<string>('');
  const [folderHistory, setFolderHistory] = useState<any[]>([]);
  const [stats, setStats] = useState({ total: 0 });
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  // Load Data
  const fetchData = async (fId: string = '') => {
    setLoading(true);
    const targetId = fId || '';
    const res = await fetch(`/api/drive?folderId=${targetId}`);
    const data = await res.json();
    setFiles(data.files || []);
    setStats({ total: data.totalDocs || 0 });
    setLoading(false);
  };

  useEffect(() => {
    if (isLoggedIn) fetchData(currentFolder);
  }, [isLoggedIn, currentFolder]);

  // Handle Rename
  const handleRename = async (fileId: string) => {
    const newName = prompt("Masukkan nama baru:");
    if (!newName) return;
    await fetch('/api/drive', {
      method: 'PATCH',
      body: JSON.stringify({ fileId, newName })
    });
    fetchData(currentFolder);
  };

  // Handle Upload
  const handleUpload = async (e: any) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('parentId', currentFolder);

    await fetch('/api/drive/upload', { method: 'POST', body: formData });
    setUploading(false);
    fetchData(currentFolder);
  };

  if (!isLoggedIn) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-pastelBlue via-pastelPurple to-pastelPink">
        <div className="bg-white/70 backdrop-blur-xl p-10 rounded-[40px] shadow-2xl w-96 text-center border border-white">
          <div className="p-4 bg-purple-500 w-fit mx-auto rounded-3xl text-white mb-6"><Lock /></div>
          <h2 className="text-2xl font-bold mb-8">Arsip Pengawasan</h2>
          <input 
            type="password" 
            className="w-full p-4 rounded-2xl border-none ring-1 ring-purple-100 mb-4 outline-none focus:ring-2 focus:ring-purple-400"
            placeholder="Password"
            onChange={(e) => setPassword(e.target.value)}
          />
          <button 
            onClick={() => password === 'Lhp3' ? setIsLoggedIn(true) : alert('Salah!')}
            className="w-full bg-slate-900 text-white p-4 rounded-2xl font-bold hover:scale-105 transition-all"
          >Masuk</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FBFCFE] flex text-slate-700">
      {/* Sidebar */}
      <aside className="w-72 bg-white border-r p-8 flex flex-col gap-10">
        <div className="flex items-center gap-3 text-purple-600 font-black text-xl italic"><Database /> ARSIP-PRO</div>
        
        <div className="space-y-2">
          <button className="w-full flex items-center gap-3 p-4 bg-purple-50 text-purple-600 rounded-2xl font-bold"><LayoutDashboard size={20}/> Dashboard</button>
          <button onClick={() => {setCurrentFolder(''); setFolderHistory([]);}} className="w-full flex items-center gap-3 p-4 text-slate-400 hover:bg-slate-50 rounded-2xl transition-all"><Folder size={20}/> Root Drive</button>
        </div>

        <div className="mt-auto p-6 bg-gradient-to-br from-purple-500 to-blue-500 rounded-[32px] text-white">
          <p className="text-xs opacity-80 mb-1">Total Dokumen</p>
          <h4 className="text-3xl font-black">{stats.total}</h4>
          <div className="mt-4 h-1 bg-white/20 rounded-full overflow-hidden">
            <div className="h-full bg-white w-2/3"></div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 p-12 overflow-y-auto">
        <header className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-3xl font-black mb-1">Unit Kerja Pengawasan</h1>
            <div className="flex items-center gap-2 text-sm text-slate-400 font-medium">
              <span>Root</span>
              {folderHistory.map((h, i) => (
                <React.Fragment key={i}><ChevronRight size={14}/> <span>{h.name}</span></React.Fragment>
              ))}
            </div>
          </div>
          
          <label className="flex items-center gap-2 bg-slate-900 text-white px-8 py-4 rounded-2xl font-bold cursor-pointer hover:shadow-xl transition-all">
            {uploading ? <Loader2 className="animate-spin" /> : <Plus size={20} />}
            {uploading ? 'Mengupload...' : 'Upload Dokumen'}
            <input type="file" className="hidden" onChange={handleUpload} disabled={uploading} />
          </label>
        </header>

        {/* Grid Folder & File */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {loading ? (
            <div className="col-span-full text-center py-20 text-slate-400"><Loader2 className="animate-spin mx-auto mb-2" /> Memuat data...</div>
          ) : (
            files.map((file) => (
              <motion.div 
                whileHover={{ y: -5 }}
                key={file.id} 
                className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm hover:shadow-md transition-all group"
              >
                <div className="flex justify-between items-start mb-4">
                  {file.mimeType === 'application/vnd.google-apps.folder' ? (
                    <div className="p-3 bg-amber-50 rounded-2xl text-amber-500"><Folder size={24} fill="currentColor"/></div>
                  ) : (
                    <div className="p-3 bg-blue-50 rounded-2xl text-blue-500"><FileText size={24}/></div>
                  )}
                  <button onClick={() => handleRename(file.id)} className="p-2 text-slate-300 hover:text-purple-500"><Edit2 size={16}/></button>
                </div>
                
                <h4 
                  onClick={() => {
                    if(file.mimeType === 'application/vnd.google-apps.folder') {
                      setCurrentFolder(file.id);
                      setFolderHistory([...folderHistory, {id: file.id, name: file.name}]);
                    } else {
                      window.open(`https://drive.google.com/file/d/${file.id}/view`, '_blank');
                    }
                  }}
                  className="font-bold text-slate-700 truncate cursor-pointer hover:text-purple-600 transition-colors"
                >
                  {file.name}
                </h4>
                <p className="text-[10px] text-slate-300 mt-1 uppercase font-bold tracking-widest">
                  {file.mimeType === 'application/vnd.google-apps.folder' ? 'Folder' : 'Document'}
                </p>
              </motion.div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}