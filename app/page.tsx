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
  Command, Share2, Palette, BarChart2, KeyRound, Copy, Check,
  Minimize2, Maximize2, Smartphone, GripHorizontal, Sparkles,
  Monitor, Wrench, Focus, Rows3
} from 'lucide-react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

// --- INTERFACES ---
interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  createdTime?: string;
  size?: string;
  owner?: string;
  hasThumbnail?: boolean;
  thumbnailLink?: string;
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
  const [themeColor, setThemeColor] = useState('amber');
  const [showPassword, setShowPassword] = useState(false);
  const [loginErrorModal, setLoginErrorModal] = useState<string | null>(null);
  const [sharedFileId, setSharedFileId] = useState<string | null>(null);
  const [sharedFileError, setSharedFileError] = useState<string | null>(null);
  const [isSharedView, setIsSharedView] = useState(false);
  const [sharedPinInput, setSharedPinInput] = useState('');
  const [sharedPinVerified, setSharedPinVerified] = useState(false);
  const [sharedPinLoading, setSharedPinLoading] = useState(false);
  const [shareModalFileId, setShareModalFileId] = useState<string | null>(null);
  const [shareModalFileName, setShareModalFileName] = useState('');
  const [generatedPin, setGeneratedPin] = useState<string | null>(null);
  const [generatedShareUrl, setGeneratedShareUrl] = useState<string | null>(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [shareGenerating, setShareGenerating] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);
  const [pinCopied, setPinCopied] = useState(false);

  // --- PiP (Floating Preview) ---
  const [pipFile, setPipFile] = useState<DriveFile | null>(null);
  const [pipPosition, setPipPosition] = useState({ x: 0, y: 0 });
  const [isDraggingPip, setIsDraggingPip] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  // --- PWA Install ---
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [isAppInstalled, setIsAppInstalled] = useState(false);

  // --- Smart Search ---
  const [fuzzyHint, setFuzzyHint] = useState<string | null>(null);

  // --- App Modes ---
  const [isPresentationMode, setIsPresentationMode] = useState(false);
  const [isCompactMode, setIsCompactMode] = useState(false);
  const [isMaintenanceMode, setIsMaintenanceMode] = useState(false);
  const [isFocusMode, setIsFocusMode] = useState(false);

  const [files, setFiles] = useState<DriveFile[]>([]);
  const [searchResults, setSearchResults] = useState<DriveFile[]>([]); 
  const [currentFolder, setCurrentFolder] = useState<string>('');
  const [folderHistory, setFolderHistory] = useState<FolderHistory[]>([]);
  const [selectedFile, setSelectedFile] = useState<DriveFile | null>(null);
  const [allFolders, setAllFolders] = useState<DriveFile[]>([]); 
  const [stats, setStats] = useState({ total: 0 });
  const [analyticsData, setAnalyticsData] = useState<any>(null);

  // --- Presensi Dokumen ---
  const [activeViewers, setActiveViewers] = useState<{name: string, timeText: string}[]>([]);

  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false); 
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'folder' | 'file'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);
  const [isAnalyticsModalOpen, setIsAnalyticsModalOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [uploadDestinationId, setUploadDestinationId] = useState<string>('');
  const [previewLoading, setPreviewLoading] = useState(true);

  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [logsLoading, setLogsLoading] = useState(false);

  // --- FUZZY SEARCH (Levenshtein Distance) ---
  const levenshtein = (a: string, b: string): number => {
    const la = a.length, lb = b.length;
    if (la === 0) return lb;
    if (lb === 0) return la;
    const matrix: number[][] = [];
    for (let i = 0; i <= la; i++) { matrix[i] = [i]; }
    for (let j = 0; j <= lb; j++) { matrix[0][j] = j; }
    for (let i = 1; i <= la; i++) {
      for (let j = 1; j <= lb; j++) {
        const cost = a[i - 1] === b[j - 1] ? 0 : 1;
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j - 1] + cost
        );
      }
    }
    return matrix[la][lb];
  };

  const fuzzyMatch = (query: string, items: DriveFile[]): { results: DriveFile[]; correctedTerm: string | null } => {
    const q = query.toLowerCase().trim();
    const words = q.split(/\s+/);
    
    const scored = items.map(item => {
      const name = item.name.toLowerCase();
      const nameWords = name.split(/[\s_\-\.]+/);
      
      let totalScore = 0;
      let matchedWords: string[] = [];
      
      for (const queryWord of words) {
        // Exact substring match = best score
        if (name.includes(queryWord)) {
          totalScore += 100;
          matchedWords.push(queryWord);
          continue;
        }
        
        // Fuzzy match against each word in file name
        let bestWordScore = 0;
        let bestMatch = '';
        for (const nameWord of nameWords) {
          const dist = levenshtein(queryWord, nameWord);
          const maxLen = Math.max(queryWord.length, nameWord.length);
          const similarity = 1 - (dist / maxLen);
          if (similarity > bestWordScore) {
            bestWordScore = similarity;
            bestMatch = nameWord;
          }
        }
        
        // Accept if similarity >= 60%
        if (bestWordScore >= 0.6) {
          totalScore += bestWordScore * 80;
          if (bestWordScore < 1) matchedWords.push(bestMatch);
        }
      }
      
      return { item, score: totalScore, matchedWords };
    });
    
    const filtered = scored.filter(s => s.score > 40).sort((a, b) => b.score - a.score);
    
    // Find correction hint
    let correctedTerm: string | null = null;
    if (filtered.length > 0) {
      const topResult = filtered[0];
      const hasTypo = topResult.matchedWords.length > 0 && topResult.score < 100 * words.length;
      if (hasTypo && topResult.matchedWords.length > 0) {
        correctedTerm = topResult.item.name;
      }
    }
    
    return { results: filtered.map(f => f.item), correctedTerm };
  };

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
    setFuzzyHint(null);
    if (!term.trim() || term.length < 2) { setSearchResults([]); return; }
    setSearchLoading(true);
    try {
      const res = await fetch(`/api/drive?search=${encodeURIComponent(term)}`);
      const data = await res.json();
      if (data.files && data.files.length > 0) {
        setSearchResults(data.files);
      } else {
        // Fallback: Fuzzy search against cached files
        const { results, correctedTerm } = fuzzyMatch(term, files);
        setSearchResults(results);
        setFuzzyHint(correctedTerm);
      }
    } catch (e) {
      // Even on error, try local fuzzy search
      const { results, correctedTerm } = fuzzyMatch(term, files);
      setSearchResults(results);
      setFuzzyHint(correctedTerm);
    }
    setSearchLoading(false);
  };

  // --- Hitung Active Viewers ---
  useEffect(() => {
    if (!selectedFile || activityLogs.length === 0) {
      setActiveViewers([]);
      return;
    }
    
    const THIRTY_MINUTES = 30 * 60 * 1000;
    const now = Date.now();
    const viewersMap = new Map<string, string>();
    
    activityLogs.forEach(log => {
      // 1. Harus log "VIEW_DOCUMENT" dan nama file cocok
      if (log.action === "VIEW_DOCUMENT" && log.fileName === selectedFile.name) {
        // 2. Bukan saya (user sendiri)
        const currentUName = userName || sessionStorage.getItem('userName');
        if (log.user !== currentUName) {
          const logTime = new Date(log.timestamp).getTime();
          const diffMs = now - logTime;
          // 3. Masih dalam 30 menit terakhir
          if (diffMs <= THIRTY_MINUTES) {
            const diffMins = Math.floor(diffMs / 60000);
            const timeText = diffMins < 1 ? 'Baru saja' : `${diffMins} menit lalu`;
            
            // Simpan log paling baru per user
            if (!viewersMap.has(log.user)) {
              viewersMap.set(log.user, timeText);
            }
          }
        }
      }
    });

    const activeList = Array.from(viewersMap.entries()).map(([name, timeText]) => ({ name, timeText }));
    setActiveViewers(activeList);
  }, [selectedFile, activityLogs, userName]);

  // Polling Logs secara berkala saat sedang preview dokumen
  useEffect(() => {
    let interval: any;
    if (selectedFile) {
      interval = setInterval(() => {
        fetchOnlineLogs();
      }, 15000); // 15 detik
    }
    return () => {
      if (interval) clearInterval(interval);
    }
  }, [selectedFile, fetchOnlineLogs]);

  useEffect(() => {
    // Load theme preferences
    const savedThemeColor = localStorage.getItem('themeColor');
    if (savedThemeColor) setThemeColor(savedThemeColor);
    const savedDarkMode = localStorage.getItem('isDarkMode');
    if (savedDarkMode !== null) setIsDarkMode(savedDarkMode === 'true');

    // Load maintenance mode
    const savedMaintenance = localStorage.getItem('isMaintenanceMode');
    if (savedMaintenance === 'true') setIsMaintenanceMode(true);
    
    // Load compact mode
    const savedCompact = localStorage.getItem('isCompactMode');
    if (savedCompact === 'true') setIsCompactMode(true);

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

    // Handle PIN-secured share link
    const pinShareFileId = params.get('pinshare');
    if (pinShareFileId) {
      setIsSharedView(true);
      setSharedFileId(pinShareFileId);
      setMounted(true);
      return;
    }

    setMounted(true);
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') { e.preventDefault(); setIsSearchModalOpen(true); }
      if (e.key === 'Escape') { setSelectedFile(null); setIsSearchModalOpen(false); setSearchResults([]); setSearchTerm(''); }
    };
    window.addEventListener('keydown', handleKeyDown);

    // PWA Install Prompt
    const handleBeforeInstall = (e: Event) => { e.preventDefault(); setInstallPrompt(e); };
    const handleAppInstalled = () => { setIsAppInstalled(true); setInstallPrompt(null); };
    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleAppInstalled);
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) setIsAppInstalled(true);

    const savedLogin = sessionStorage.getItem('isLoggedIn');
    const savedRole = sessionStorage.getItem('userRole');
    const savedName = sessionStorage.getItem('userName');
    if (savedLogin === 'true' && savedRole && savedName) {
      setIsLoggedIn(true); setUserRole(savedRole as any); setUserName(savedName); fetchOnlineLogs();
    } else {
      const rememberedName = localStorage.getItem('savedLoginName');
      const rememberedPwd = localStorage.getItem('savedLoginPwd');
      if (rememberedName) setTempName(rememberedName);
      if (rememberedPwd) setPassword(rememberedPwd);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [fetchOnlineLogs]);

  // --- PiP Drag Handlers ---
  useEffect(() => {
    if (!isDraggingPip) return;
    const handleMouseMove = (e: MouseEvent) => {
      setPipPosition({ x: e.clientX - dragOffset.x, y: e.clientY - dragOffset.y });
    };
    const handleMouseUp = () => setIsDraggingPip(false);
    const handleTouchMove = (e: TouchEvent) => {
      const touch = e.touches[0];
      setPipPosition({ x: touch.clientX - dragOffset.x, y: touch.clientY - dragOffset.y });
    };
    const handleTouchEnd = () => setIsDraggingPip(false);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('touchmove', handleTouchMove);
    window.addEventListener('touchend', handleTouchEnd);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isDraggingPip, dragOffset]);

  useEffect(() => { document.documentElement.classList.toggle('dark', isDarkMode); }, [isDarkMode]);

  const fetchData = async (fId: string = '') => {
    setLoading(true);
    try {
      const res = await fetch(`/api/drive?folderId=${fId}`);
      const data = await res.json();
      if (data.files) {
        setFiles(data.files);
        setAllFolders(data.files.filter((f: any) => f.mimeType.includes('folder')));
      }
      if (data.totalDocs !== undefined) setStats({ total: data.totalDocs });
      if (data.analytics) setAnalyticsData(data.analytics);
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

  const jumpToHistory = (index: number) => {
    const newHistory = folderHistory.slice(0, index + 1);
    setFolderHistory(newHistory);
    const targetFolder = newHistory[newHistory.length - 1];
    setCurrentFolder(targetFolder.id);
    setSelectedFile(null);
    addOnlineLog("OPEN_FOLDER", targetFolder.name);
  };

  const goHome = () => { setCurrentFolder(''); setFolderHistory([]); setSelectedFile(null); setSearchTerm(''); setFilterType('all'); };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tempName.trim()) { setLoginErrorModal("Silakan masukkan Nama Anda terlebih dahulu."); return; }
    // Block user login during maintenance
    if (isMaintenanceMode && password !== 'adminLhp3') {
      setLoginErrorModal("Sistem sedang dalam pemeliharaan. Hanya Admin yang dapat masuk saat ini.");
      return;
    }
    const processLogin = (role: 'admin' | 'user') => {
      setIsLoggedIn(true); setUserRole(role); setUserName(tempName);
      sessionStorage.setItem('isLoggedIn', 'true'); sessionStorage.setItem('userRole', role); sessionStorage.setItem('userName', tempName);
      localStorage.setItem('savedLoginName', tempName); localStorage.setItem('savedLoginPwd', password);
      addOnlineLog("LOGIN", "Masuk ke sistem");
    };
    if (password === 'adminLhp3') processLogin('admin');
    else if (password === 'userLhp3') processLogin('user');
    else setLoginErrorModal('Kunci Akses yang Anda masukkan salah!');
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

  // --- SHARED VIEW (Bypass Login) ---
  if (isSharedView) {
    const handlePinVerify = async () => {
      if (!sharedFileId || !sharedPinInput.trim()) return;
      setSharedPinLoading(true);
      try {
        const res = await fetch('/api/share', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ fileId: sharedFileId, pin: sharedPinInput.trim() })
        });
        const data = await res.json();
        if (data.valid) {
          setSharedPinVerified(true);
        } else {
          setSharedFileError(data.error || 'PIN tidak valid atau sudah digunakan.');
        }
      } catch (e) {
        setSharedFileError('Gagal memverifikasi PIN. Coba lagi.');
      }
      setSharedPinLoading(false);
    };

    // Check if this is a PIN-secured link (uses ?pinshare= param)
    const params = new URLSearchParams(window.location.search);
    const isPinSecured = !!params.get('pinshare');

    return (
      <div className={`${isDarkMode ? "dark" : "light"} theme-${themeColor}`}>
        <div className="min-h-screen bg-[var(--bg-main)] flex items-center justify-center p-4 relative overflow-hidden transition-colors">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-[var(--accent)]/[0.05] blur-[120px] rounded-full pointer-events-none"></div>
        
        {sharedFileError ? (
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-[var(--bg-panel)] border border-[var(--border-line)] p-8 rounded-2xl max-w-md w-full text-center shadow-2xl relative z-10">
            <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-[var(--text-main)] mb-2">Akses Ditolak</h2>
            <p className="text-[var(--text-muted)]">{sharedFileError}</p>
          </motion.div>

        ) : isPinSecured && !sharedPinVerified ? (
          /* PIN INPUT GATE */
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-[var(--bg-panel)]/80 backdrop-blur-xl border border-[var(--border-line)] p-10 rounded-3xl max-w-md w-full shadow-2xl relative z-10">
            <div className="flex flex-col items-center mb-8">
              <div className="w-16 h-16 rounded-2xl bg-[var(--accent)]/10 flex items-center justify-center mb-5">
                <KeyRound size={32} className="text-[var(--accent)]" />
              </div>
              <h2 className="text-xl font-bold text-[var(--text-main)] text-center">Dokumen Dilindungi PIN</h2>
              <p className="text-sm text-[var(--text-muted)] mt-2 text-center">Masukkan PIN 6-digit yang diberikan oleh pengirim untuk membuka dokumen ini.</p>
            </div>
            <div className="space-y-4">
              <div className="relative">
                <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={16} />
                <input 
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="Masukkan 6-digit PIN"
                  value={sharedPinInput}
                  onChange={(e) => setSharedPinInput(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  onKeyDown={(e) => e.key === 'Enter' && handlePinVerify()}
                  className="w-full py-4 pl-12 pr-4 rounded-xl border border-[var(--border-line)] outline-none bg-white/[0.04] text-[var(--text-main)] text-2xl text-center tracking-[0.5em] font-bold placeholder:text-slate-600 placeholder:text-sm placeholder:tracking-normal focus:border-[var(--accent)] transition-all"
                />
              </div>
              <button 
                onClick={handlePinVerify}
                disabled={sharedPinInput.length !== 6 || sharedPinLoading}
                className="w-full bg-[var(--accent)] hover:opacity-90 text-[var(--accent-fg)] py-4 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {sharedPinLoading ? <Loader2 size={18} className="animate-spin" /> : <ShieldCheck size={18} />}
                <span>{sharedPinLoading ? 'Memverifikasi...' : 'Buka Dokumen'}</span>
              </button>
              <p className="text-center text-xs text-[var(--text-muted)] mt-3">PIN bersifat sekali pakai dan tidak dapat digunakan kembali.</p>
            </div>
          </motion.div>

        ) : (
          /* DOCUMENT PREVIEW */
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="w-full max-w-5xl h-[85vh] bg-[var(--bg-panel)] rounded-2xl border border-[var(--border-line)] flex flex-col overflow-hidden shadow-2xl relative z-10">
            <div className="p-5 border-b border-[var(--border-line)] flex items-center justify-between bg-[var(--bg-panel-trans)] backdrop-blur-xl z-30">
              <div className="flex items-center gap-4">
                <div className="p-2.5 bg-emerald-500/10 rounded-xl text-emerald-500">
                  <ShieldCheck size={24} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[var(--text-main)]">Dokumen Dibagikan</h3>
                  <p className="text-xs text-[var(--text-muted)] mt-0.5">Akses Terbatas - Inspektorat Sultra</p>
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
      </div>
    );
  }

  // --- LOGIN PAGE ---
  if (!isLoggedIn) {
    return (
      <div className={`${isDarkMode ? "dark" : "light"} theme-${themeColor}`}>
        <div className="relative min-h-screen w-full flex items-center justify-center p-6 bg-[var(--bg-main)] transition-colors">
        {/* Subtle background gradient */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-[var(--accent)]/[0.07] blur-[150px] rounded-full"></div>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 16 }} 
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative z-10 w-full max-w-md"
        >
          <div className="bg-[var(--bg-panel)]/80 backdrop-blur-xl p-10 rounded-3xl border border-[var(--border-line)] shadow-2xl">
            {/* Logo & Title */}
            <div className="flex flex-col items-center mb-10">
              <div className="w-20 h-20 mb-5">
                <img 
                  src="https://i.ibb.co.com/L22pdJQ/Coat-of-arms-of-Southeast-Sulawesi-svg.png" 
                  alt="Logo Sultra" 
                  className="w-full h-full object-contain" 
                />
              </div>
              <h1 className="text-2xl font-bold text-[var(--text-main)] tracking-tight text-center">
                Arsip Digital Irban III
              </h1>
              <p className="text-sm text-[var(--text-muted)] mt-1.5 text-center">
                Inspektorat Provinsi Sulawesi Tenggara
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[var(--text-muted)] ml-1">Nama</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={16}/>
                  <input 
                    required 
                    type="text" 
                    placeholder="Masukkan nama Anda" 
                    className="w-full py-3.5 pl-11 pr-4 rounded-xl border border-[var(--border-line)] outline-none bg-white/[0.04] text-[var(--text-main)] text-sm placeholder:text-slate-600 focus:border-[var(--accent)] focus:bg-[var(--accent)]/[0.03] transition-all" 
                    onChange={(e) => setTempName(e.target.value)} 
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[var(--text-muted)] ml-1">Kunci Akses</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={16}/>
                  <input 
                    required 
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••" 
                    className="w-full py-3.5 pl-11 pr-12 rounded-xl border border-[var(--border-line)] outline-none bg-white/[0.04] text-[var(--text-main)] text-sm placeholder:text-slate-600 tracking-widest focus:border-[var(--accent)] focus:bg-[var(--accent)]/[0.03] transition-all" 
                    onChange={(e) => setPassword(e.target.value)} 
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button type="submit" className="w-full bg-[var(--accent)] hover:opacity-90 text-[var(--accent-fg)] py-3.5 rounded-xl font-semibold text-sm transition-all mt-2 flex items-center justify-center gap-2">
                <span>Masuk</span>
                <ChevronRight size={16} />
              </button>
            </form>

            {/* Maintenance Mode Banner */}
            {isMaintenanceMode && (
              <div className="mt-5 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center gap-3">
                <Wrench size={18} className="text-amber-500 flex-shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-amber-500">Sedang dalam Pemeliharaan sistem</p>
                  <p className="text-[10px] text-[var(--text-muted)] mt-0.5">Hanya Admin yang dapat masuk saat ini.</p>
                </div>
              </div>
            )}
          </div>

          <p className="text-center mt-6 text-xs text-slate-600">
            © 2026 Royal Vault v2.0
          </p>
        </motion.div>

        {/* LOGIN ERROR MODAL */}
        <AnimatePresence>
          {loginErrorModal && (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            >
              <motion.div 
                initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
                className="bg-[var(--bg-panel)] p-6 rounded-2xl border border-red-500/30 w-full max-w-sm shadow-2xl relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-full h-1 bg-red-500"></div>
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-red-500/10 text-red-500 rounded-xl flex-shrink-0">
                    <AlertCircle size={24} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-[var(--text-main)] mb-1">Akses Ditolak</h3>
                    <p className="text-sm text-[var(--text-muted)] leading-relaxed">
                      {loginErrorModal}
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => setLoginErrorModal(null)}
                  className="w-full mt-6 bg-[var(--hover-fill)] hover:bg-[var(--accent)] text-[var(--text-main)] hover:text-[var(--accent-fg)] py-2.5 rounded-xl text-sm font-medium transition-colors"
                >
                  Mengerti
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        </div>
      </div>
    );
  }

  // --- MAIN DASHBOARD ---
  return (
    <div className={`${isDarkMode ? "dark" : "light"} theme-${themeColor}`}>
      <div className="h-screen bg-[var(--bg-main)] text-[var(--text-main)] flex overflow-hidden transition-colors">
        
        {/* SIDEBAR */}
        <aside className={`${isFocusMode ? 'hidden' : 'w-[72px] lg:w-64'} bg-[var(--bg-panel-trans)] border-r border-[var(--border-line)] flex flex-col py-6 transition-all`}>
          {/* Logo */}
          <div className="px-4 lg:px-6 mb-6">
            <div 
              onClick={goHome}
              className="cursor-pointer flex items-center gap-3"
            >
              <div className="w-10 h-10 bg-[var(--accent)]/10 p-2 rounded-xl border border-[var(--accent-light)] flex-shrink-0">
                <img src="https://i.ibb.co.com/L22pdJQ/Coat-of-arms-of-Southeast-Sulawesi-svg.png" alt="Logo" className="w-full h-full object-contain" />
              </div>
              <div className="hidden lg:block min-w-0">
                <h1 className="font-bold text-[var(--text-main)] text-sm truncate">Arsip Digital Irban III</h1>
                <p className="text-[10px] text-[var(--text-muted)] truncate">Inspektorat Sultra</p>
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
                    ? 'bg-[var(--accent)]/10 text-[var(--accent)] font-semibold' 
                    : 'text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-white/[0.04]'
                }`}
              >
                <item.icon size={18} />
                <span className="hidden lg:block">{item.label}</span>
              </button>
            ))}
          </nav>

          <div className="px-3 lg:px-4 mb-2 space-y-1">
            <button onClick={() => setIsThemeModalOpen(true)} className="w-full flex items-center gap-3 p-3 lg:px-4 lg:py-3 rounded-xl text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--hover-fill)] transition-all">
              <Palette size={18} />
              <span className="hidden lg:block text-sm font-medium">Tema & Tampilan</span>
            </button>

            {/* MODE TOGGLES */}
            <button 
              onClick={() => setIsPresentationMode(!isPresentationMode)} 
              className={`w-full flex items-center gap-3 p-3 lg:px-4 lg:py-3 rounded-xl transition-all ${isPresentationMode ? 'bg-blue-500/10 text-blue-400 font-semibold' : 'text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--hover-fill)]'}`}
              title="Mode Rapat / Presentasi"
            >
              <Monitor size={18} />
              <span className="hidden lg:block text-sm font-medium">Mode Rapat</span>
            </button>

            <button 
              onClick={() => { const newVal = !isCompactMode; setIsCompactMode(newVal); localStorage.setItem('isCompactMode', String(newVal)); }} 
              className={`w-full flex items-center gap-3 p-3 lg:px-4 lg:py-3 rounded-xl transition-all ${isCompactMode ? 'bg-purple-500/10 text-purple-400 font-semibold' : 'text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--hover-fill)]'}`}
              title="Mode Compact / Padat"
            >
              <Rows3 size={18} />
              <span className="hidden lg:block text-sm font-medium">Mode Padat</span>
            </button>

            {userRole === 'admin' && (
              <button 
                onClick={() => { const newVal = !isMaintenanceMode; setIsMaintenanceMode(newVal); localStorage.setItem('isMaintenanceMode', String(newVal)); }} 
                className={`w-full flex items-center gap-3 p-3 lg:px-4 lg:py-3 rounded-xl transition-all ${isMaintenanceMode ? 'bg-amber-500/10 text-amber-400 font-semibold' : 'text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--hover-fill)]'}`}
                title="Mode Pemeliharaan (Kunci Sistem)"
              >
                <Wrench size={18} />
                <span className="hidden lg:block text-sm font-medium">Pemeliharaan</span>
              </button>
            )}
            {installPrompt && !isAppInstalled && (
              <button 
                onClick={() => {
                  installPrompt.prompt();
                  installPrompt.userChoice.then((choiceResult: any) => {
                    if (choiceResult.outcome === 'accepted') {
                      setIsAppInstalled(true);
                      setInstallPrompt(null);
                    }
                  });
                }} 
                className="w-full flex items-center gap-3 p-3 lg:px-4 lg:py-3.5 rounded-xl text-[var(--accent)] hover:bg-[var(--accent)]/10 transition-all border border-dashed border-[var(--accent)]"
              >
                <Smartphone size={20} />
                <span className="hidden lg:block text-sm font-medium">Install Aplikasi</span>
              </button>
            )}
          </div>

          {/* User & Logout */}
          <div className="px-3 lg:px-4 mt-auto">
            {!isPresentationMode && (
            <div className="hidden lg:flex items-center gap-3 px-3 py-2.5 rounded-xl bg-[var(--hover-fill)] border border-[var(--border-line)] mb-2">
              <div className="w-8 h-8 rounded-lg bg-[var(--accent)]/10 flex items-center justify-center text-[var(--accent)] text-xs font-bold flex-shrink-0">
                {userName.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-[var(--text-main)] truncate">{userName}</p>
                <p className="text-[10px] text-[var(--text-muted)] capitalize">{userRole}</p>
              </div>
            </div>
            )}

            <button 
              onClick={() => {
                addOnlineLog("LOGOUT", "Keluar dari sistem");
                setTimeout(() => { sessionStorage.clear(); window.location.reload(); }, 300);
              }}
              className="w-full flex items-center justify-center lg:justify-start gap-3 px-3 py-2.5 rounded-xl text-[var(--text-muted)] hover:text-red-400 hover:bg-red-500/10 transition-all text-sm"
            >
              <LogOut size={18} />
              <span className="hidden lg:block">Keluar</span>
            </button>
          </div>
        </aside>

        {/* MAIN AREA */}
        <main className="flex-1 flex flex-col min-w-0 relative">
          
          {/* HEADER */}
          <header className={`${isFocusMode ? 'hidden' : ''} px-6 lg:px-8 py-4 border-b border-[var(--border-line)] flex items-center justify-between gap-4 bg-[var(--bg-panel)]/30 backdrop-blur-sm`}>
            <div className="flex items-center gap-3 min-w-0">
              <AnimatePresence>
                {folderHistory.length > 0 && (
                  <motion.button 
                    initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -8 }}
                    onClick={goBackOneLevel}
                    className="p-2 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--hover-fill)] transition-all flex-shrink-0"
                  >
                    <ArrowLeft size={18} />
                  </motion.button>
                )}
              </AnimatePresence>
              
              {/* Breadcrumb */}
              <div className="flex items-center gap-1.5 text-sm min-w-0 overflow-x-auto pb-1 custom-scrollbar">
                <span className="text-[var(--text-muted)] hover:text-[var(--accent)] cursor-pointer transition-colors font-medium flex-shrink-0" onClick={goHome}>Beranda</span>
                {folderHistory.map((h, i) => (
                  <React.Fragment key={h.id}>
                    <ChevronRight size={14} className="text-slate-600 flex-shrink-0" />
                    <span 
                      onClick={() => i !== folderHistory.length - 1 && jumpToHistory(i)}
                      className={`truncate flex-shrink-0 ${i === folderHistory.length - 1 ? "text-[var(--text-main)] font-medium" : "text-[var(--text-muted)] hover:text-[var(--accent)] cursor-pointer transition-colors"}`}
                    >
                      {h.name}
                    </span>
                  </React.Fragment>
                ))}
              </div>
            </div>

            {/* Search Bar */}
            <div className="flex-1 max-w-lg relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={15} />
              <input 
                onClick={() => setIsSearchModalOpen(true)}
                readOnly
                value={searchTerm}
                placeholder="Cari dokumen... (Ctrl+K)"
                className="w-full bg-white/[0.04] border border-[var(--border-line)] rounded-xl py-2.5 pl-10 pr-4 text-sm text-[var(--text-main)] cursor-pointer hover:bg-[var(--hover-fill)] transition-all outline-none placeholder:text-slate-600"
              />
              {searchTerm && (
                <button onClick={(e) => { e.stopPropagation(); setSearchTerm(''); setSearchResults([]); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-main)]">
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Header Actions */}
            <div className="flex items-center gap-2">
              {!isPresentationMode && (
                <div className="hidden md:flex bg-[var(--hover-fill)] p-1 rounded-lg border border-[var(--border-line)]">
                  <button onClick={() => setViewMode('grid')} className={`p-2 rounded-md transition-all ${viewMode === 'grid' ? 'bg-[var(--accent)]/15 text-[var(--accent)]' : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'}`}><LayoutGrid size={16}/></button>
                  <button onClick={() => setViewMode('list')} className={`p-2 rounded-md transition-all ${viewMode === 'list' ? 'bg-[var(--accent)]/15 text-[var(--accent)]' : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'}`}><List size={16}/></button>
                </div>
              )}
              <button onClick={() => setIsDarkMode(!isDarkMode)} className="p-2.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--hover-fill)] transition-all">
                {isDarkMode ? <Sun size={16}/> : <Moon size={16}/>}
              </button>
              {userRole === 'admin' && !isPresentationMode && (
                <button 
                  onClick={() => {setUploadDestinationId(currentFolder); setIsUploadModalOpen(true);}}
                  className="bg-[var(--accent)] hover:opacity-90 text-[var(--accent-fg)] px-4 py-2.5 rounded-xl font-semibold text-sm transition-all flex items-center gap-2"
                >
                  <Plus size={16} strokeWidth={2.5} />
                  <span className="hidden lg:block">Upload</span>
                </button>
              )}
            </div>
          </header>

          {/* MAIN CONTENT */}
          <div className={`flex-1 overflow-y-auto ${isCompactMode ? 'px-4 lg:px-6 py-3' : 'px-6 lg:px-8 py-6'} custom-scrollbar`}>

            {/* Active Mode Indicators */}
            {(isPresentationMode || isMaintenanceMode || isFocusMode) && (
              <div className="flex flex-wrap gap-2 mb-4">
                {isPresentationMode && (
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-medium">
                    <Monitor size={12} /> Mode Rapat Aktif
                    <button onClick={() => setIsPresentationMode(false)} className="ml-1 hover:text-blue-200"><X size={12}/></button>
                  </div>
                )}
                {isMaintenanceMode && (
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-medium">
                    <Wrench size={12} /> Pemeliharaan Aktif — Staf tidak bisa login
                    <button onClick={() => { setIsMaintenanceMode(false); localStorage.setItem('isMaintenanceMode', 'false'); }} className="ml-1 hover:text-amber-200"><X size={12}/></button>
                  </div>
                )}
              </div>
            )}
            
            {loading ? (
              <div className="h-full flex flex-col items-center justify-center">
                <Loader2 className="animate-spin text-[var(--accent)] mb-4" size={32} />
                <p className="text-sm text-[var(--text-muted)]">Memuat data...</p>
              </div>
            ) : (
              <div className={`max-w-[1400px] mx-auto ${isCompactMode ? 'space-y-4' : 'space-y-8'}`}>
                
                {/* STATS ROW */}
                {!isPresentationMode && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: 'Total Dokumen', value: stats.total, icon: Database, color: 'text-[var(--accent)] bg-[var(--accent)]/10' },
                    { label: 'Folder', value: folders.length, icon: Folder, color: 'text-blue-400 bg-blue-400/10' },
                    { label: 'File', value: documents.length, icon: FileText, color: 'text-emerald-400 bg-emerald-400/10' },
                    { label: 'Pengguna', value: userName.split(' ')[0], icon: User, color: 'text-purple-400 bg-purple-400/10' },
                  ].map((stat, i) => (
                    <motion.div 
                      initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                      key={i} className="bg-[var(--hover-fill)] p-5 rounded-2xl border border-[var(--border-line)] hover:border-[var(--border-strong)] transition-all"
                    >
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${stat.color}`}>
                        <stat.icon size={17} />
                      </div>
                      <p className="text-xs text-[var(--text-muted)] mb-0.5">{stat.label}</p>
                      <p className={`${isCompactMode ? 'text-lg' : 'text-xl'} font-bold text-[var(--text-main)]`}>{stat.value}</p>
                    </motion.div>
                  ))}
                </div>
                )}

                {/* ANALYTICS BUTTON */}
                {userRole === 'admin' && !currentFolder && filterType === 'all' && analyticsData && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-end">
                    <button 
                      onClick={() => setIsAnalyticsModalOpen(true)}
                      className="flex items-center gap-2 px-5 py-3 bg-[var(--bg-panel)] border border-[var(--border-strong)] rounded-xl text-sm font-semibold text-[var(--text-main)] hover:bg-[var(--accent)] hover:border-[var(--accent)] hover:text-[var(--accent-fg)] transition-all shadow-sm"
                    >
                      <BarChart2 size={16} /> Lihat Analitik Pimpinan
                    </button>
                  </motion.div>
                )}

                {/* FOLDERS SECTION (only on root) */}
                {!currentFolder && filterType !== 'file' && folders.length > 0 && (
                  <section>
                    <div className="flex items-center gap-3 mb-4">
                      <Folder size={16} className="text-[var(--accent)]" />
                      <h3 className="text-sm font-semibold text-[var(--text-main)]">Folder</h3>
                      <span className="text-xs text-[var(--text-muted)]">{folders.length}</span>
                    </div>
                    <div className={`grid grid-cols-1 sm:grid-cols-2 ${isCompactMode ? 'lg:grid-cols-5 gap-2' : 'lg:grid-cols-4 gap-3'}`}>
                      {folders.map((folder, i) => (
                        <motion.div 
                          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                          key={folder.id} 
                          onClick={() => navigateToFolder(folder.id, folder.name)}
                          className={`group bg-[var(--hover-fill)] hover:bg-[var(--accent)]/[0.06] ${isCompactMode ? 'p-2.5' : 'p-3 sm:p-4'} rounded-xl border border-[var(--border-line)] hover:border-[var(--accent-light)] cursor-pointer transition-all flex items-center gap-3 sm:gap-3.5`}
                        >
                          <div className="p-2.5 bg-[var(--accent)]/10 rounded-xl text-[var(--accent)] group-hover:bg-[var(--accent)]/20 transition-colors flex-shrink-0">
                            <Folder size={20} />
                          </div>
                          <div className="min-w-0">
                            <h4 title={folder.name} className="text-xs sm:text-sm font-medium text-[var(--text-main)] line-clamp-2 sm:truncate group-hover:text-[var(--accent)] transition-colors">{folder.name}</h4>
                            <p className="text-[10px] sm:text-[11px] text-[var(--text-muted)] mt-0.5">Folder</p>
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
                      <FileText size={16} className="text-[var(--text-muted)]" />
                      <h3 className="text-sm font-semibold text-[var(--text-main)]">
                        {currentFolder ? 'Isi Folder' : filterType === 'file' ? 'Semua Dokumen' : 'Semua Item'}
                      </h3>
                      <span className="text-xs text-[var(--text-muted)]">{filteredFilesMain.length}</span>
                    </div>
                  </div>

                  {filteredFilesMain.length === 0 ? (
                    <div className="text-center py-20">
                      <Database size={40} className="text-slate-700 mx-auto mb-4" />
                      <p className="text-[var(--text-muted)] text-sm">Tidak ada data ditemukan</p>
                    </div>
                  ) : viewMode === 'grid' ? (
                    <div className={`grid grid-cols-1 sm:grid-cols-2 ${isCompactMode ? 'xl:grid-cols-5 gap-2' : 'xl:grid-cols-4 gap-4'}`}>
                      {filteredFilesMain.map((file, i) => (
                        <motion.div 
                          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                          key={file.id}
                          onClick={() => file.mimeType.includes('folder') ? navigateToFolder(file.id, file.name) : handleFileSelect(file)}
                          className={`group relative bg-[var(--hover-fill)] ${isCompactMode ? 'p-3' : 'p-4 sm:p-5'} rounded-2xl border cursor-pointer transition-all ${
                            selectedFile?.id === file.id 
                              ? 'border-[var(--accent)] bg-[var(--accent)]/[0.05]' 
                              : 'border-[var(--border-line)] hover:border-[var(--border-strong)] hover:bg-[var(--hover-fill)]'
                          }`}
                        >
                          <div className={`flex items-start justify-between ${isCompactMode ? 'mb-2' : 'mb-3 sm:mb-6'}`}>
                            <div className={`p-3 rounded-xl overflow-hidden ${
                              file.hasThumbnail && file.thumbnailLink 
                                ? 'p-0 w-16 h-16 bg-transparent' // Remove padding if it's an image thumbnail
                                : file.mimeType.includes('folder') 
                                  ? 'bg-[var(--accent)]/10 text-[var(--accent)]' 
                                  : 'bg-[var(--hover-fill)] text-[var(--text-muted)]'
                            }`}>
                              {file.hasThumbnail && file.thumbnailLink ? (
                                <img src={file.thumbnailLink} alt="Thumbnail" className="w-full h-full object-cover rounded-xl border border-[var(--border-line)]" />
                              ) : file.mimeType.includes('folder') ? (
                                <Folder size={22} />
                              ) : (
                                <FileText size={22} />
                              )}
                            </div>
                            
                            {/* Actions - visible on hover */}
                            {!isPresentationMode && (
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              {!file.mimeType.includes('folder') && (
                                <button onClick={(e) => { e.stopPropagation(); addOnlineLog("DOWNLOAD", file.name); window.open(`https://drive.google.com/uc?export=download&id=${file.id}`, '_blank'); }} className="p-2 rounded-lg hover:bg-[var(--hover-fill)] text-[var(--text-muted)] hover:text-[var(--text-main)] transition-all">
                                  <Download size={14}/>
                                </button>
                              )}
                              {userRole === 'admin' && (
                                <>
                                  <button onClick={(e) => { e.stopPropagation(); handleRename(file.id, file.name); }} className="p-2 rounded-lg hover:bg-[var(--hover-fill)] text-[var(--text-muted)] hover:text-blue-400 transition-all"><Edit2 size={14}/></button>
                                  <button onClick={(e) => { e.stopPropagation(); handleDelete(file.id, file.name); }} className="p-2 rounded-lg hover:bg-[var(--hover-fill)] text-[var(--text-muted)] hover:text-red-400 transition-all"><Trash2 size={14}/></button>
                                </>
                              )}
                            </div>
                            )}
                          </div>

                          <h4 title={file.name} className="text-xs sm:text-sm leading-tight sm:leading-normal font-medium text-[var(--text-main)] line-clamp-3 sm:truncate group-hover:text-[var(--accent)] transition-colors">{file.name}</h4>
                          <p className="text-[10px] sm:text-[11px] text-[var(--text-muted)] mt-1 sm:mt-1.5">
                            {file.mimeType.includes('folder') ? 'Folder' : 'Dokumen'}
                          </p>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    /* LIST VIEW */
                    <div className="bg-[var(--hover-fill)] rounded-xl border border-[var(--border-line)] overflow-hidden">
                      <div className="grid grid-cols-12 px-4 sm:px-5 py-3 border-b border-[var(--border-line)] text-xs font-medium text-[var(--text-muted)] bg-[var(--hover-fill)]">
                        <div className="col-span-9 sm:col-span-7">Nama</div>
                        <div className="hidden sm:block sm:col-span-3">Tipe</div>
                        <div className="col-span-3 sm:col-span-2 text-right">Aksi</div>
                      </div>
                      {filteredFilesMain.map(file => (
                        <div 
                          key={file.id} 
                          onClick={() => file.mimeType.includes('folder') ? navigateToFolder(file.id, file.name) : handleFileSelect(file)} 
                          className="grid grid-cols-12 px-4 sm:px-5 py-3 sm:py-3.5 items-center hover:bg-[var(--hover-fill)] transition-colors cursor-pointer group border-b border-[var(--border-line)] last:border-0"
                        >
                          <div className="col-span-9 sm:col-span-7 flex items-center gap-2 sm:gap-3 pr-2">
                            <div className={`p-1.5 rounded-lg flex-shrink-0 ${file.mimeType.includes('folder') ? 'text-[var(--accent)] bg-[var(--accent)]/10' : 'text-[var(--text-muted)] bg-[var(--hover-fill)]'}`}>
                              {file.mimeType.includes('folder') ? <Folder size={16}/> : <FileText size={16}/>}
                            </div>
                            <span title={file.name} className="text-xs sm:text-sm text-[var(--text-main)] group-hover:text-[var(--accent)] line-clamp-2 sm:truncate transition-colors leading-tight sm:leading-normal">{file.name}</span>
                          </div>
                          <div className="hidden sm:block sm:col-span-3 text-xs text-[var(--text-muted)]">{file.mimeType.includes('folder') ? 'Folder' : 'Dokumen'}</div>
                          <div className="col-span-3 sm:col-span-2 flex items-center justify-end gap-0.5 sm:gap-2">
                            {!file.mimeType.includes('folder') && (
                              <button onClick={(e) => { e.stopPropagation(); addOnlineLog("DOWNLOAD", file.name); window.open(`https://drive.google.com/uc?export=download&id=${file.id}`, '_blank'); }} className="p-1.5 rounded-md text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--hover-fill)] transition-all"><Download size={14}/></button>
                            )}
                            {userRole === 'admin' && (
                              <button onClick={(e) => { e.stopPropagation(); handleDelete(file.id, file.name); }} className="p-1.5 rounded-md text-[var(--text-muted)] hover:text-red-400 hover:bg-[var(--hover-fill)] transition-all"><Trash2 size={14}/></button>
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
          <div className="px-6 lg:px-8 py-3 border-t border-[var(--border-line)] flex items-center justify-between text-xs text-[var(--text-muted)] bg-[var(--bg-panel)]/30">
            <div className="flex items-center gap-5">
              <span className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-[var(--accent)] rounded-full animate-pulse"></div>
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
                className="bg-[var(--bg-panel)] border border-[var(--border-line)] w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden" 
                onClick={e => e.stopPropagation()}
              >
                <div className="p-6 border-b border-[var(--border-line)] flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-[var(--accent)]/10 rounded-xl text-[var(--accent)]">
                      <History size={20} />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-[var(--text-main)]">Riwayat Aktivitas</h3>
                      <p className="text-xs text-[var(--text-muted)] mt-0.5">Log akses & perubahan dokumen</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={handleDownloadLogs} className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium bg-[var(--accent)]/10 text-[var(--accent)] hover:bg-[var(--accent)]/20 rounded-lg transition-all">
                      <Download size={14} /> Export CSV
                    </button>
                    <button onClick={() => setIsLogModalOpen(false)} className="p-2 hover:bg-[var(--hover-fill)] text-[var(--text-muted)] hover:text-[var(--text-main)] rounded-lg transition-all"><X size={20}/></button>
                  </div>
                </div>
                <div className="max-h-[60vh] overflow-y-auto custom-scrollbar">
                  <table className="w-full border-collapse">
                    <thead className="text-xs font-medium text-[var(--text-muted)] sticky top-0 bg-[var(--bg-panel)] z-10">
                      <tr>
                        <th className="p-4 text-left">Pengguna</th>
                        <th className="p-4 text-left">Aksi</th>
                        <th className="p-4 text-left">Nama File</th>
                        <th className="p-4 text-right">Waktu</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm text-[var(--text-muted)]">
                      {logsLoading ? (
                        <tr><td colSpan={4} className="p-8 text-center">
                          <Loader2 className="animate-spin text-[var(--accent)] mx-auto mb-2" size={24} />
                          <p className="text-xs text-[var(--text-muted)]">Memuat riwayat...</p>
                        </td></tr>
                      ) : activityLogs.length === 0 ? (
                        <tr><td colSpan={4} className="p-8 text-center">
                          <History size={32} className="text-slate-700 mx-auto mb-2" />
                          <p className="text-[var(--text-muted)] text-sm">Belum ada riwayat aktivitas</p>
                          <p className="text-slate-600 text-xs mt-1">Coba download atau upload dokumen terlebih dahulu</p>
                        </td></tr>
                      ) : activityLogs.map((log) => (
                        <tr key={log.id} className="border-t border-[var(--border-line)] hover:bg-[var(--hover-fill)] transition-colors">
                          <td className="p-4">
                            <div className="flex items-center gap-2.5">
                              <div className="w-7 h-7 rounded-lg bg-[var(--accent)]/10 flex items-center justify-center text-[var(--accent)] text-[10px] font-bold flex-shrink-0">{log.user?.charAt(0) || '?'}</div>
                              <div>
                                <span className="text-[var(--text-main)] text-sm">{log.user}</span>
                                <span className="block text-[10px] text-slate-600 mt-0.5">{log.device}</span>
                              </div>
                            </div>
                          </td>
                          <td className="p-4">
                            <span className={`px-2.5 py-1 rounded-md text-[10px] font-semibold border ${
                              log.action === 'DELETE' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                              log.action === 'SHARE' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                              log.action === 'UPLOAD' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                              'bg-[var(--accent)]/10 text-[var(--accent)] border-[var(--accent-light)]'
                            }`}>{log.action}</span>
                          </td>
                          <td className="p-4 max-w-xs truncate text-[var(--text-muted)]" title={log.fileName}>{log.fileName}</td>
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
                className="bg-[var(--bg-panel)] rounded-2xl p-8 w-full max-w-lg relative border border-[var(--border-line)] shadow-2xl"
              >
                <button onClick={() => setIsUploadModalOpen(false)} className="absolute right-6 top-6 text-[var(--text-muted)] hover:text-[var(--text-main)] transition-all"><X size={20}/></button>
                
                <div className="mb-8">
                  <div className="w-12 h-12 bg-[var(--accent)]/10 rounded-xl flex items-center justify-center mb-4 text-[var(--accent)]">
                    <Upload size={22} />
                  </div>
                  <h3 className="text-xl font-bold text-[var(--text-main)]">Upload Dokumen</h3>
                  <p className="text-sm text-[var(--text-muted)] mt-1">Pilih folder tujuan dan file yang akan diunggah</p>
                </div>

                {uploadStatus === 'idle' ? (
                  <div className="space-y-5">
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-[var(--text-muted)] ml-1">Folder Tujuan</label>
                      <select 
                        value={uploadDestinationId} 
                        onChange={(e) => setUploadDestinationId(e.target.value)} 
                        className="w-full p-3.5 rounded-xl bg-white/[0.04] border border-[var(--border-line)] outline-none text-sm text-[var(--text-main)] focus:border-[var(--accent)] appearance-none cursor-pointer"
                      >
                        <option value="">📂 Root (Folder Utama)</option>
                        {allFolders.map(f => (<option key={f.id} value={f.id} className="bg-[var(--bg-panel)] text-[var(--text-main)]">📁 {f.name}</option>))}
                      </select>
                    </div>

                    <label className="flex flex-col items-center justify-center w-full h-52 border-2 border-dashed border-[var(--border-line)] rounded-2xl cursor-pointer hover:bg-[var(--accent)]/[0.03] hover:border-[var(--accent-light)] transition-all text-center p-6">
                      {uploading ? (
                        <div className="w-full px-4">
                          <Loader2 className="animate-spin mx-auto text-[var(--accent)] mb-4" size={36} />
                          <div className="w-full bg-[var(--hover-fill)] h-1.5 rounded-full overflow-hidden mb-3">
                            <motion.div initial={{ width: 0 }} animate={{ width: `${uploadProgress}%` }} className="h-full bg-[var(--accent)] rounded-full" />
                          </div>
                          <p className="text-sm text-[var(--accent)]">{uploadProgress}% mengunggah...</p>
                        </div>
                      ) : (
                        <>
                          <Upload size={28} className="text-slate-600 mb-3" />
                          <p className="text-sm font-medium text-[var(--text-main)]">Klik untuk memilih file</p>
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
                        <h3 className="text-lg font-bold text-[var(--text-main)]">Berhasil Diunggah</h3>
                        <p className="text-sm text-[var(--text-muted)] mt-1">Dokumen telah tersimpan</p>
                      </motion.div>
                    ) : (
                      <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }}>
                        <AlertCircle size={56} className="text-red-500 mx-auto mb-4" />
                        <h3 className="text-lg font-bold text-[var(--text-main)]">Gagal Mengunggah</h3>
                        <p className="text-sm text-[var(--text-muted)] mt-1">Terjadi kesalahan, silakan coba lagi</p>
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
              className={`fixed inset-y-0 right-0 ${isFocusMode ? 'w-full' : 'w-full lg:w-[720px]'} bg-[var(--bg-panel)]/98 backdrop-blur-xl shadow-[-20px_0_60px_rgba(0,0,0,0.5)] border-l border-[var(--border-line)] z-[150] flex flex-col`}
            >
              {/* Preview Header */}
              <div className="p-6 border-b border-[var(--border-line)] flex items-center justify-between">
                <div className="flex items-center gap-4 min-w-0">
                  <div className="p-2.5 bg-[var(--accent)]/10 rounded-xl text-[var(--accent)] flex-shrink-0">
                    <FileText size={22}/>
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-[var(--text-muted)] mb-0.5">Preview Dokumen</p>
                    <h4 className="font-semibold text-[var(--text-main)] truncate text-sm">{selectedFile.name}</h4>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {/* Viewers Avatars */}
                  {activeViewers.length > 0 && (
                    <div className="flex items-center mr-2 lg:mr-4">
                      <div className="flex -space-x-2 mr-2">
                        {activeViewers.map((viewer, idx) => (
                          <div 
                            key={idx} 
                            className="w-7 h-7 lg:w-8 lg:h-8 rounded-full bg-[var(--accent)] text-[var(--bg-panel)] flex items-center justify-center text-xs font-bold border-2 border-[var(--bg-panel)] relative group cursor-help transition-transform hover:scale-110"
                            style={{ zIndex: 10 - idx }}
                          >
                            {viewer.name.charAt(0).toUpperCase()}
                            <div className="absolute top-10 whitespace-nowrap bg-[var(--bg-panel)] border border-[var(--border-line)] text-[var(--text-main)] text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity shadow-lg pointer-events-none z-50">
                              {viewer.name} ({viewer.timeText})
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="text-[10px] text-[var(--text-muted)] hidden sm:block">
                        juga melihat ini
                      </div>
                    </div>
                  )}
                  <button onClick={() => setIsFocusMode(!isFocusMode)} className={`p-2.5 rounded-xl transition-all ${isFocusMode ? 'bg-green-500/10 text-green-500 hover:bg-green-500/20' : 'bg-[var(--hover-fill)] text-[var(--text-muted)] hover:text-[var(--text-main)]'}`} title={isFocusMode ? 'Keluar Mode Fokus' : 'Mode Fokus (Layar Penuh)'}><Focus size={18}/></button>
                  <button onClick={() => {
                    setPipFile(selectedFile);
                    setSelectedFile(null);
                    setIsFocusMode(false);
                    setPipPosition({ x: window.innerWidth - 420, y: window.innerHeight - 320 });
                  }} className="p-2.5 bg-[var(--hover-fill)] text-[var(--text-muted)] hover:text-[var(--text-main)] rounded-xl transition-all" title="Minimize (Picture-in-Picture)"><Minimize2 size={18}/></button>
                  <button onClick={() => {
                    setShareModalFileId(selectedFile.id);
                    setShareModalFileName(selectedFile.name);
                    setGeneratedPin(null);
                    setGeneratedShareUrl(null);
                    setShareGenerating(false);
                    setShareCopied(false);
                    setPinCopied(false);
                    setIsShareModalOpen(true);
                  }} className="p-2.5 bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 rounded-xl transition-all" title="Bagikan dengan PIN"><Share2 size={18}/></button>
                  <button onClick={() => { addOnlineLog("DOWNLOAD", selectedFile.name); window.open(`https://drive.google.com/uc?export=download&id=${selectedFile.id}`, '_blank'); }} className="p-2.5 bg-[var(--accent)] rounded-xl text-slate-950 hover:bg-amber-400 transition-colors"><Download size={18}/></button>
                  <button onClick={() => { setSelectedFile(null); setPreviewLoading(true); setIsFocusMode(false); }} className="p-2.5 bg-[var(--hover-fill)] text-[var(--text-muted)] hover:text-[var(--text-main)] rounded-xl transition-all"><X size={18}/></button>
                </div>
              </div>
              
              {/* Preview Content */}
              <div className="flex-1 relative bg-black/30 overflow-hidden">
                {previewLoading && (
                  <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-[var(--bg-panel)]">
                    <Loader2 className="animate-spin text-[var(--accent)] mb-3" size={32} />
                    <p className="text-xs text-[var(--text-muted)]">Memuat preview...</p>
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
              <div className="p-5 border-t border-[var(--border-line)] flex items-center justify-between">
                <p className="text-xs text-[var(--text-muted)] flex items-center gap-2">
                  <Eye size={13} /> Preview langsung dari Google Drive
                </p>
                <button 
                  onClick={() => { addOnlineLog("DOWNLOAD", selectedFile.name); window.open(`https://drive.google.com/uc?export=download&id=${selectedFile.id}`, '_blank'); }}
                  className="px-5 py-2.5 bg-[var(--hover-fill)] text-[var(--accent)] hover:bg-[var(--accent)] hover:text-slate-950 rounded-xl font-medium text-sm border border-[var(--accent-light)] transition-all"
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
                className="bg-[var(--bg-panel)] border border-[var(--border-line)] w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden" 
                onClick={e => e.stopPropagation()}
              >
                <div className="p-5 flex items-center gap-4 border-b border-[var(--border-line)]">
                  <Search className="text-[var(--text-muted)] flex-shrink-0" size={18} />
                  <input 
                    autoFocus 
                    type="text" 
                    value={searchTerm}
                    placeholder="Cari dokumen atau folder..." 
                    className="flex-1 bg-transparent outline-none text-sm text-[var(--text-main)] placeholder:text-slate-600" 
                    onChange={(e) => handleGlobalSearch(e.target.value)} 
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        setIsSearchModalOpen(false);
                      }
                    }}
                  />
                  {searchLoading && <Loader2 className="animate-spin text-[var(--accent)] flex-shrink-0" size={16} />}
                  <div className="px-2 py-0.5 bg-[var(--hover-fill)] border border-[var(--border-line)] rounded-md text-[10px] font-medium text-[var(--text-muted)]">ESC</div>
                </div>
                {fuzzyHint && (
                  <div className="px-5 py-2 bg-[var(--accent)]/10 border-b border-[var(--border-line)] flex items-center gap-2">
                    <Sparkles size={14} className="text-[var(--accent)]" />
                    <span className="text-xs text-[var(--text-main)]">
                      Mungkin yang Anda maksud: <button onClick={() => handleGlobalSearch(fuzzyHint)} className="font-bold text-[var(--accent)] hover:underline">{fuzzyHint}</button>?
                    </span>
                  </div>
                )}
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
                            <div className={`p-1.5 rounded-lg ${f.mimeType.includes('folder') ? 'text-[var(--accent)] bg-[var(--accent)]/10' : 'text-[var(--text-muted)] bg-[var(--hover-fill)]'}`}>
                              {f.mimeType.includes('folder') ? <Folder size={16}/> : <FileText size={16}/>}
                            </div>
                            <div className="min-w-0">
                              <span className="block text-sm text-[var(--text-main)] truncate">{f.name}</span>
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

        {/* THEME SETTINGS MODAL */}
        <AnimatePresence>
          {isThemeModalOpen && (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
              onClick={() => setIsThemeModalOpen(false)}
            >
              <motion.div 
                initial={{ scale: 0.95, y: 10 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 10 }}
                className="bg-[var(--bg-panel)] border border-[var(--border-line)] w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden p-6 relative" 
                onClick={e => e.stopPropagation()}
              >
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-bold text-[var(--text-main)] flex items-center gap-2">
                    <Palette size={20} className="text-[var(--accent)]" /> Tema & Tampilan
                  </h3>
                  <button onClick={() => setIsThemeModalOpen(false)} className="p-2 bg-[var(--hover-fill)] hover:bg-[var(--border-line)] text-[var(--text-muted)] rounded-full transition-colors">
                    <X size={16} />
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Mode */}
                  <div>
                    <label className="text-sm font-semibold text-[var(--text-main)] block mb-3">Mode Layar</label>
                    <div className="grid grid-cols-2 gap-3">
                      <button 
                        onClick={() => { setIsDarkMode(false); localStorage.setItem('isDarkMode', 'false'); }}
                        className={`p-3 rounded-2xl border transition-all flex flex-col items-center gap-2 ${!isDarkMode ? 'border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)]' : 'border-[var(--border-line)] text-[var(--text-muted)] hover:border-[var(--border-strong)]'}`}
                      >
                        <Sun size={24} />
                        <span className="text-xs font-medium">Terang</span>
                      </button>
                      <button 
                        onClick={() => { setIsDarkMode(true); localStorage.setItem('isDarkMode', 'true'); }}
                        className={`p-3 rounded-2xl border transition-all flex flex-col items-center gap-2 ${isDarkMode ? 'border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)]' : 'border-[var(--border-line)] text-[var(--text-muted)] hover:border-[var(--border-strong)]'}`}
                      >
                        <Moon size={24} />
                        <span className="text-xs font-medium">Gelap</span>
                      </button>
                    </div>
                  </div>

                  {/* Accent Colors */}
                  <div>
                    <label className="text-sm font-semibold text-[var(--text-main)] block mb-3">Warna Aksen</label>
                    <div className="flex items-center gap-3 justify-center">
                      {[
                        { id: 'amber', color: '#f59e0b', name: 'Kuning' },
                        { id: 'blue', color: '#3b82f6', name: 'Biru' },
                        { id: 'emerald', color: '#10b981', name: 'Hijau' },
                        { id: 'purple', color: '#a855f7', name: 'Ungu' }
                      ].map((theme) => (
                        <button
                          key={theme.id}
                          onClick={() => { setThemeColor(theme.id); localStorage.setItem('themeColor', theme.id); }}
                          title={theme.name}
                          className={`w-12 h-12 rounded-full border-4 transition-all ${themeColor === theme.id ? 'border-[var(--border-strong)] scale-110 shadow-lg' : 'border-transparent hover:scale-105'}`}
                          style={{ backgroundColor: theme.color }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ANALYTICS MODAL */}
        <AnimatePresence>
          {isAnalyticsModalOpen && analyticsData && (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
              onClick={() => setIsAnalyticsModalOpen(false)}
            >
              <motion.div 
                initial={{ scale: 0.95, y: 10 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 10 }}
                className="bg-[var(--bg-panel)] border border-[var(--border-line)] w-full max-w-4xl max-h-[90vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col relative" 
                onClick={e => e.stopPropagation()}
              >
                <div className="p-6 border-b border-[var(--border-line)] flex justify-between items-center bg-[var(--bg-panel-trans)]">
                  <div>
                    <h3 className="text-xl font-bold text-[var(--text-main)] flex items-center gap-2">
                      <BarChart2 size={24} className="text-[var(--accent)]" /> Dashboard Analitik Pimpinan
                    </h3>
                    <p className="text-sm text-[var(--text-muted)] mt-1">Rekapitulasi data arsip Inspektorat secara real-time</p>
                  </div>
                  <button onClick={() => setIsAnalyticsModalOpen(false)} className="p-2 bg-[var(--hover-fill)] hover:bg-[var(--border-line)] text-[var(--text-muted)] rounded-full transition-colors">
                    <X size={20} />
                  </button>
                </div>

                <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-8">
                  {/* Stats Cards */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-[var(--hover-fill)] p-5 rounded-2xl border border-[var(--border-line)]">
                      <p className="text-xs text-[var(--text-muted)] mb-1">Total Arsip</p>
                      <p className="text-2xl font-bold text-[var(--accent)]">{stats.total}</p>
                    </div>
                    <div className="bg-[var(--hover-fill)] p-5 rounded-2xl border border-[var(--border-line)]">
                      <p className="text-xs text-[var(--text-muted)] mb-1">Total PDF</p>
                      <p className="text-2xl font-bold text-red-500">{analyticsData.types.find((t:any) => t.name === 'PDF')?.value || 0}</p>
                    </div>
                    <div className="bg-[var(--hover-fill)] p-5 rounded-2xl border border-[var(--border-line)]">
                      <p className="text-xs text-[var(--text-muted)] mb-1">Total Word</p>
                      <p className="text-2xl font-bold text-blue-500">{analyticsData.types.find((t:any) => t.name === 'Word')?.value || 0}</p>
                    </div>
                    <div className="bg-[var(--hover-fill)] p-5 rounded-2xl border border-[var(--border-line)]">
                      <p className="text-xs text-[var(--text-muted)] mb-1">Total Excel</p>
                      <p className="text-2xl font-bold text-emerald-500">{analyticsData.types.find((t:any) => t.name === 'Excel')?.value || 0}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Pie Chart */}
                    <div className="bg-[var(--hover-fill)] p-6 rounded-2xl border border-[var(--border-line)]">
                      <h4 className="text-sm font-semibold text-[var(--text-main)] mb-6 text-center">Komposisi Format Dokumen</h4>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie data={analyticsData.types} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={5} dataKey="value">
                              {analyticsData.types.map((entry: any, index: number) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <Tooltip 
                              contentStyle={{ backgroundColor: 'var(--bg-panel)', borderColor: 'var(--border-line)', color: 'var(--text-main)', borderRadius: '12px' }}
                              itemStyle={{ color: 'var(--text-main)' }}
                            />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="flex flex-wrap justify-center gap-4 mt-4">
                        {analyticsData.types.map((entry: any, index: number) => (
                          <div key={index} className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
                            <span className="text-xs text-[var(--text-muted)]">{entry.name} ({entry.value})</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Bar Chart */}
                    <div className="bg-[var(--hover-fill)] p-6 rounded-2xl border border-[var(--border-line)]">
                      <h4 className="text-sm font-semibold text-[var(--text-main)] mb-6 text-center">Tren Aktivitas Unggah (6 Bulan Terakhir)</h4>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={analyticsData.trends}>
                            <XAxis dataKey="month" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                            <Tooltip 
                              contentStyle={{ backgroundColor: 'var(--bg-panel)', borderColor: 'var(--border-line)', color: 'var(--text-main)', borderRadius: '12px' }}
                              cursor={{ fill: 'var(--hover-fill)' }}
                            />
                            <Bar dataKey="total" fill="var(--accent)" radius={[4, 4, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
        {/* SHARE WITH PIN MODAL */}
        <AnimatePresence>
          {isShareModalOpen && (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
              onClick={() => setIsShareModalOpen(false)}
            >
              <motion.div 
                initial={{ scale: 0.95, y: 10 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 10 }}
                className="bg-[var(--bg-panel)] border border-[var(--border-line)] w-full max-w-md rounded-3xl shadow-2xl overflow-hidden" 
                onClick={e => e.stopPropagation()}
              >
                <div className="p-6 border-b border-[var(--border-line)] flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-bold text-[var(--text-main)] flex items-center gap-2">
                      <KeyRound size={20} className="text-[var(--accent)]" /> Bagikan dengan PIN
                    </h3>
                    <p className="text-xs text-[var(--text-muted)] mt-1 truncate max-w-[280px]">{shareModalFileName}</p>
                  </div>
                  <button onClick={() => setIsShareModalOpen(false)} className="p-2 bg-[var(--hover-fill)] hover:bg-[var(--border-line)] text-[var(--text-muted)] rounded-full transition-colors">
                    <X size={18} />
                  </button>
                </div>

                <div className="p-6 space-y-6">
                  {!generatedPin ? (
                    /* Step 1: Generate */
                    <div className="text-center space-y-4">
                      <div className="w-20 h-20 mx-auto rounded-2xl bg-blue-500/10 flex items-center justify-center">
                        <Shield size={36} className="text-blue-500" />
                      </div>
                      <div>
                        <p className="text-sm text-[var(--text-main)] font-medium">Buat tautan aman dengan PIN sekali pakai</p>
                        <p className="text-xs text-[var(--text-muted)] mt-2">PIN hanya bisa digunakan satu kali oleh penerima pertama yang memasukkannya. Setelah digunakan, PIN otomatis hangus.</p>
                      </div>
                      <button 
                        onClick={async () => {
                          setShareGenerating(true);
                          try {
                            const res = await fetch('/api/share', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ fileId: shareModalFileId })
                            });
                            const data = await res.json();
                            if (data.pin) {
                              setGeneratedPin(data.pin);
                              setGeneratedShareUrl(`${window.location.origin}?pinshare=${shareModalFileId}`);
                              addOnlineLog("SHARE", shareModalFileName);
                            }
                          } catch (e) { console.error(e); }
                          setShareGenerating(false);
                        }}
                        disabled={shareGenerating}
                        className="w-full bg-[var(--accent)] hover:opacity-90 text-[var(--accent-fg)] py-3.5 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        {shareGenerating ? <Loader2 size={16} className="animate-spin" /> : <KeyRound size={16} />}
                        {shareGenerating ? 'Membuat PIN...' : 'Buat Link + PIN Sekali Pakai'}
                      </button>
                    </div>
                  ) : (
                    /* Step 2: Show PIN & Link */
                    <div className="space-y-5">
                      <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 flex items-center gap-3">
                        <CheckCircle2 size={20} className="text-emerald-500 flex-shrink-0" />
                        <p className="text-sm text-emerald-400 font-medium">PIN berhasil dibuat!</p>
                      </div>

                      {/* PIN Display */}
                      <div className="space-y-2">
                        <label className="text-xs font-medium text-[var(--text-muted)]">PIN Keamanan (Sekali Pakai)</label>
                        <div className="flex gap-2">
                          <div className="flex-1 bg-[var(--hover-fill)] border border-[var(--border-line)] rounded-xl py-4 text-center text-3xl font-bold text-[var(--accent)] tracking-[0.4em]">
                            {generatedPin}
                          </div>
                          <button 
                            onClick={() => { navigator.clipboard.writeText(generatedPin!); setPinCopied(true); setTimeout(() => setPinCopied(false), 2000); }}
                            className={`px-4 rounded-xl border transition-all flex items-center ${pinCopied ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : 'bg-[var(--hover-fill)] border-[var(--border-line)] text-[var(--text-muted)] hover:text-[var(--text-main)]'}`}
                          >
                            {pinCopied ? <Check size={18} /> : <Copy size={18} />}
                          </button>
                        </div>
                      </div>

                      {/* Link Display */}
                      <div className="space-y-2">
                        <label className="text-xs font-medium text-[var(--text-muted)]">Tautan Dokumen</label>
                        <div className="flex gap-2">
                          <div className="flex-1 bg-[var(--hover-fill)] border border-[var(--border-line)] rounded-xl py-3 px-4 text-xs text-[var(--text-muted)] truncate">
                            {generatedShareUrl}
                          </div>
                          <button 
                            onClick={() => { navigator.clipboard.writeText(generatedShareUrl!); setShareCopied(true); setTimeout(() => setShareCopied(false), 2000); }}
                            className={`px-4 rounded-xl border transition-all flex items-center ${shareCopied ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : 'bg-[var(--hover-fill)] border-[var(--border-line)] text-[var(--text-muted)] hover:text-[var(--text-main)]'}`}
                          >
                            {shareCopied ? <Check size={18} /> : <Copy size={18} />}
                          </button>
                        </div>
                      </div>

                      <div className="bg-[var(--hover-fill)] border border-[var(--border-line)] rounded-xl p-4 space-y-1">
                        <p className="text-xs font-semibold text-[var(--text-main)]">Cara Penggunaan:</p>
                        <p className="text-xs text-[var(--text-muted)]">1. Salin dan kirimkan <b>Tautan</b> ke penerima.</p>
                        <p className="text-xs text-[var(--text-muted)]">2. Kirimkan <b>PIN</b> secara terpisah (lewat chat/telepon).</p>
                        <p className="text-xs text-red-400">⚠️ PIN hanya bisa digunakan 1 kali. Setelah dipakai, otomatis hangus.</p>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* PiP (Picture-in-Picture) WIDGET */}
        <AnimatePresence>
          {pipFile && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }}
              style={{ left: pipPosition.x, top: pipPosition.y }}
              className="fixed z-[300] w-[400px] h-[300px] bg-[var(--bg-panel)] rounded-2xl shadow-2xl border border-[var(--border-strong)] overflow-hidden flex flex-col"
            >
              {/* PiP Header (Draggable) */}
              <div 
                className="p-3 bg-[var(--bg-panel-trans)] border-b border-[var(--border-line)] flex items-center justify-between cursor-move"
                onMouseDown={(e) => {
                  setIsDraggingPip(true);
                  setDragOffset({ x: e.clientX - pipPosition.x, y: e.clientY - pipPosition.y });
                }}
                onTouchStart={(e) => {
                  const touch = e.touches[0];
                  setIsDraggingPip(true);
                  setDragOffset({ x: touch.clientX - pipPosition.x, y: touch.clientY - pipPosition.y });
                }}
              >
                <div className="flex items-center gap-2 min-w-0 pointer-events-none">
                  <GripHorizontal size={14} className="text-[var(--text-muted)]" />
                  <span className="text-xs font-semibold text-[var(--text-main)] truncate">{pipFile.name}</span>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => { setSelectedFile(pipFile); setPipFile(null); setPreviewLoading(true); }} className="p-1.5 hover:bg-[var(--hover-fill)] rounded-lg text-[var(--text-muted)] hover:text-[var(--text-main)]"><Maximize2 size={14}/></button>
                  <button onClick={() => setPipFile(null)} className="p-1.5 hover:bg-[var(--hover-fill)] rounded-lg text-[var(--text-muted)] hover:text-red-400"><X size={14}/></button>
                </div>
              </div>
              {/* PiP Content */}
              <div className="flex-1 bg-black/50 relative pointer-events-none">
                <iframe src={`https://drive.google.com/file/d/${pipFile.id}/preview`} className="w-full h-full border-0 absolute inset-0" title="PiP Preview" />
                {/* Invisible overlay to prevent iframe capturing mouse events while dragging */}
                {isDraggingPip && <div className="absolute inset-0 z-10 bg-transparent" />}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}