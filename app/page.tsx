"use client"
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Folder, FileText, Upload, Lock, Database, LayoutDashboard, 
  Search, LogOut, ChevronRight, Loader2, Edit2, Plus, X, 
  Download, ArrowLeft, Sun, Moon, Shield, 
  CheckCircle2, AlertCircle, Filter, History, User,
  ShieldCheck, Trash2, ShieldAlert,
  LayoutGrid, List, Clock, Eye, EyeOff,
  Command, Share2, Palette, BarChart2, KeyRound, Copy, Check,
  Minimize2, Maximize2, Smartphone, GripHorizontal, Sparkles,
  Monitor, Wrench, Focus, Rows3, FileSpreadsheet, Tag, Star,
  RotateCw
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
  appProperties?: Record<string, string>;
  tags?: string[];
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
  const [themeAtmosphere, setThemeAtmosphere] = useState('default');
  const [fontSize, setFontSize] = useState<'sm' | 'md' | 'lg'>('md');
  const [glassEffect, setGlassEffect] = useState(true);
  const [themeCustomTab, setThemeCustomTab] = useState<'colors' | 'display'>('colors');
  const [showPassword, setShowPassword] = useState(false);
  const [loginErrorModal, setLoginErrorModal] = useState<string | null>(null);
  const [sharedFileId, setSharedFileId] = useState<string | null>(null);
  const [sharedFileError, setSharedFileError] = useState<string | null>(null);
  const [isSharedView, setIsSharedView] = useState(false);
  const [sharedPinInput, setSharedPinInput] = useState('');
  const [sharedPinVerified, setSharedPinVerified] = useState(false);
  const [sharedPinLoading, setSharedPinLoading] = useState(false);
  const [isSharedSecurityLocked, setIsSharedSecurityLocked] = useState(false);
  const [sharedSecurityAlert, setSharedSecurityAlert] = useState<string | null>(null);
  const [watermarkClock, setWatermarkClock] = useState<string>('');
  const [shareModalFileId, setShareModalFileId] = useState<string | null>(null);
  const [shareModalFileName, setShareModalFileName] = useState('');
  const [generatedPin, setGeneratedPin] = useState<string | null>(null);
  const [generatedShareUrl, setGeneratedShareUrl] = useState<string | null>(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [shareGenerating, setShareGenerating] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);
  const [pinCopied, setPinCopied] = useState(false);

  // --- Export Excel ---
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [exportScope, setExportScope] = useState<'current' | 'all'>('current');
  const [exportLoading, setExportLoading] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);

  // --- Label / Tagging ---
  const [tagMap, setTagMap] = useState<Record<string, string[]>>({});
  const [selectedTagFilter, setSelectedTagFilter] = useState<string>('all');
  const [isTagModalOpen, setIsTagModalOpen] = useState(false);
  const [tagModalFile, setTagModalFile] = useState<DriveFile | null>(null);
  const [customTagInput, setCustomTagInput] = useState('');
  const [tagSaving, setTagSaving] = useState(false);
  const [customTagHistory, setCustomTagHistory] = useState<string[]>([]);

  // --- Favorit & Riwayat Terakhir ---
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [recentlyViewed, setRecentlyViewed] = useState<{ id: string; name: string; mimeType: string; viewedAt: number }[]>([]);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [isRecentModalOpen, setIsRecentModalOpen] = useState(false);
  const [recentSearchQuery, setRecentSearchQuery] = useState('');

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
  const [uploadErrorMessage, setUploadErrorMessage] = useState<string>('');
  const [uploadDestinationId, setUploadDestinationId] = useState<string>('');
  const [previewLoading, setPreviewLoading] = useState(true);

  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const [logSearchQuery, setLogSearchQuery] = useState('');
  const [logCategoryFilter, setLogCategoryFilter] = useState<'ALL' | 'DOCS' | 'AUTH' | 'MANAGE' | 'SHARE'>('ALL');
  const [isConfirmClearLogsOpen, setIsConfirmClearLogsOpen] = useState(false);
  const [clearLogsLoading, setClearLogsLoading] = useState(false);

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
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setActivityLogs(data);
          try {
            localStorage.setItem('archive_activity_logs_cache', JSON.stringify(data));
          } catch {}
        }
      }
    } catch (e) {
      console.error("Error logs:", e);
      try {
        const cached = localStorage.getItem('archive_activity_logs_cache');
        if (cached) {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length > 0) setActivityLogs(parsed);
        }
      } catch {}
    } finally {
      setLogsLoading(false);
    }
  }, []);

  const addOnlineLog = async (action: string, fileName: string) => {
    const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : "Unknown";
    const deviceDesc = userAgent.includes("Android") ? "Android" : userAgent.includes("iPhone") ? "iPhone" : "PC / Desktop";
    const currentName = userName || (typeof sessionStorage !== 'undefined' ? sessionStorage.getItem('userName') : null) || tempName || "Guest";
    const newEntry: ActivityLog = {
      id: 'log_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      action,
      fileName,
      user: currentName,
      device: deviceDesc,
      timestamp: new Date().toISOString()
    };

    // Optimistic local state update
    setActivityLogs(prev => {
      const updated = [newEntry, ...prev.filter(p => p.id !== newEntry.id)].slice(0, 1000);
      try {
        localStorage.setItem('archive_activity_logs_cache', JSON.stringify(updated));
      } catch {}
      return updated;
    });

    try {
      await fetch('/api/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newEntry)
      });
    } catch (e) {
      console.error("Gagal sinkronisasi log:", e);
    }
  };

  const handleClearLogs = async () => {
    setClearLogsLoading(true);
    try {
      const res = await fetch('/api/logs', { method: 'DELETE' });
      if (res.ok) {
        setActivityLogs([]);
        try { localStorage.removeItem('archive_activity_logs_cache'); } catch {}
        setIsConfirmClearLogsOpen(false);
        addOnlineLog("LOG_RESET", "Pembersihan seluruh riwayat aktivitas oleh Admin");
      }
    } catch (e) {
      console.error("Gagal membersihkan log:", e);
    } finally {
      setClearLogsLoading(false);
    }
  };

  const getActionBadge = (action: string) => {
    switch (action) {
      case 'LOGIN':
        return { label: 'Masuk Sesi', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', icon: ShieldCheck };
      case 'LOGOUT':
        return { label: 'Keluar Sesi', color: 'bg-slate-500/10 text-slate-400 border-slate-500/20', icon: LogOut };
      case 'VIEW_DOCUMENT':
        return { label: 'Lihat Dokumen', color: 'bg-purple-500/10 text-purple-400 border-purple-500/20', icon: Eye };
      case 'OPEN_FOLDER':
        return { label: 'Buka Folder', color: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20', icon: Folder };
      case 'DOWNLOAD':
        return { label: 'Unduh File', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20', icon: Download };
      case 'UPLOAD':
        return { label: 'Unggah File', color: 'bg-teal-500/10 text-teal-400 border-teal-500/20', icon: Upload };
      case 'RENAME':
        return { label: 'Ganti Nama', color: 'bg-amber-500/10 text-amber-400 border-amber-500/20', icon: Edit2 };
      case 'DELETE':
        return { label: 'Hapus File', color: 'bg-rose-500/10 text-rose-400 border-rose-500/20', icon: Trash2 };
      case 'SHARE':
      case 'PIN_ACCESS':
        return { label: 'Bagikan PIN', color: 'bg-sky-500/10 text-sky-400 border-sky-500/20', icon: Share2 };
      case 'WHATSAPP_SHARE':
        return { label: 'Kirim WhatsApp', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', icon: Smartphone };
      case 'UPDATE_LABEL':
        return { label: 'Ubah Label', color: 'bg-fuchsia-500/10 text-fuchsia-400 border-fuchsia-500/20', icon: Tag };
      case 'FAVORITE':
        return { label: 'Tambah Favorit', color: 'bg-amber-500/10 text-amber-400 border-amber-500/20', icon: Star };
      case 'UNFAVORITE':
        return { label: 'Hapus Favorit', color: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20', icon: Star };
      case 'EXPORT_EXCEL':
        return { label: 'Ekspor Rekap', color: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20', icon: FileSpreadsheet };
      case 'EXPORT_CSV':
        return { label: 'Ekspor Audit Log', color: 'bg-amber-500/10 text-amber-400 border-amber-500/20', icon: Download };
      default:
        return { label: action, color: 'bg-[var(--accent)]/10 text-[var(--accent)] border-[var(--accent-light)]', icon: History };
    }
  };

  const formatLogRelativeTime = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffSecs = Math.floor(diffMs / 1000);
      if (diffSecs < 45) return 'Baru saja';
      const diffMins = Math.floor(diffSecs / 60);
      if (diffMins < 60) return `${diffMins} mnt lalu`;
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours} jam lalu`;
      const diffDays = Math.floor(diffHours / 24);
      if (diffDays === 1) return 'Kemarin';
      if (diffDays < 7) return `${diffDays} hari lalu`;
      return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
    } catch {
      return timestamp;
    }
  };

  // --- PRESET TAGS & HELPERS ---
  const PRESET_TAGS = [
    { label: 'Penting', bg: 'bg-rose-500/15', text: 'text-rose-400', border: 'border-rose-500/30', dot: 'bg-rose-500' },
    { label: 'Rahasia', bg: 'bg-purple-500/15', text: 'text-purple-400', border: 'border-purple-500/30', dot: 'bg-purple-500' },
    { label: 'Selesai', bg: 'bg-emerald-500/15', text: 'text-emerald-400', border: 'border-emerald-500/30', dot: 'bg-emerald-500' },
    { label: 'Tindak Lanjut', bg: 'bg-amber-500/15', text: 'text-amber-400', border: 'border-amber-500/30', dot: 'bg-amber-500' },
    { label: 'Ketaatan', bg: 'bg-blue-500/15', text: 'text-blue-400', border: 'border-blue-500/30', dot: 'bg-blue-500' },
    { label: 'Kinerja', bg: 'bg-cyan-500/15', text: 'text-cyan-400', border: 'border-cyan-500/30', dot: 'bg-cyan-500' },
  ];

  const getTagStyle = (tag: string) => {
    const found = PRESET_TAGS.find(p => p.label.toLowerCase() === tag.toLowerCase());
    if (found) return found;
    const colors = [
      { bg: 'bg-indigo-500/15', text: 'text-indigo-400', border: 'border-indigo-500/30', dot: 'bg-indigo-500' },
      { bg: 'bg-teal-500/15', text: 'text-teal-400', border: 'border-teal-500/30', dot: 'bg-teal-500' },
      { bg: 'bg-pink-500/15', text: 'text-pink-400', border: 'border-pink-500/30', dot: 'bg-pink-500' },
      { bg: 'bg-orange-500/15', text: 'text-orange-400', border: 'border-orange-500/30', dot: 'bg-orange-500' },
    ];
    const hash = tag.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };

  const getFileTags = useCallback((file: DriveFile | null): string[] => {
    if (!file) return [];
    if (tagMap[file.id] && Array.isArray(tagMap[file.id])) return tagMap[file.id];
    if (file.appProperties?.tags) {
      try {
        const parsed = JSON.parse(file.appProperties.tags);
        if (Array.isArray(parsed)) return parsed;
      } catch {}
    }
    return [];
  }, [tagMap]);

  const saveCustomTagToHistory = (newTag: string) => {
    const trimmed = newTag.trim();
    if (!trimmed) return;
    if (PRESET_TAGS.some(p => p.label.toLowerCase() === trimmed.toLowerCase())) return;

    setCustomTagHistory(prev => {
      if (prev.some(t => t.toLowerCase() === trimmed.toLowerCase())) return prev;
      const updated = [...prev, trimmed];
      try {
        localStorage.setItem('archive_custom_tags', JSON.stringify(updated));
      } catch (e) { console.error(e); }
      return updated;
    });
  };

  const removeCustomTagFromHistory = (tagToRemove: string) => {
    setCustomTagHistory(prev => {
      const updated = prev.filter(t => t.toLowerCase() !== tagToRemove.toLowerCase());
      try {
        localStorage.setItem('archive_custom_tags', JSON.stringify(updated));
      } catch (e) { console.error(e); }
      return updated;
    });
  };

  const openTagModal = (file: DriveFile) => {
    setTagModalFile(file);
    setCustomTagInput('');
    setIsTagModalOpen(true);
  };

  const handleSaveFileTags = async (fileId: string, fileName: string, newTags: string[]) => {
    setTagSaving(true);
    const sanitized = Array.from(new Set(newTags.map(t => t.trim()).filter(Boolean)));
    const updatedMap = { ...tagMap, [fileId]: sanitized };
    setTagMap(updatedMap);
    try {
      localStorage.setItem('archive_file_tags', JSON.stringify(updatedMap));
    } catch (e) { console.error(e); }

    // Update in files state
    setFiles(prev => prev.map(f => {
      if (f.id === fileId) {
        return {
          ...f,
          appProperties: {
            ...(f.appProperties || {}),
            tags: JSON.stringify(sanitized),
          }
        };
      }
      return f;
    }));

    if (selectedFile?.id === fileId) {
      setSelectedFile(prev => prev ? {
        ...prev,
        appProperties: {
          ...(prev.appProperties || {}),
          tags: JSON.stringify(sanitized),
        }
      } : null);
    }

    if (tagModalFile?.id === fileId) {
      setTagModalFile(prev => prev ? {
        ...prev,
        appProperties: {
          ...(prev.appProperties || {}),
          tags: JSON.stringify(sanitized),
        }
      } : null);
    }

    try {
      const res = await fetch('/api/drive/tags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileId, tags: sanitized }),
      });
      if (res.ok) {
        addOnlineLog("UPDATE_LABEL", `${fileName} [${sanitized.join(', ') || 'Tanpa label'}]`);
      }
    } catch (err) {
      console.error('Error updating tags in Google Drive:', err);
    }
    setTagSaving(false);
  };

  // --- FAVORIT & RIWAYAT TERAKHIR DIBUKA ---
  const toggleFavorite = (fileId: string, fileName?: string) => {
    setFavorites(prev => {
      const next = new Set(prev);
      const isFav = next.has(fileId);
      if (isFav) {
        next.delete(fileId);
      } else {
        next.add(fileId);
      }
      try {
        localStorage.setItem('archive_favorites', JSON.stringify(Array.from(next)));
      } catch (err) {
        console.error(err);
      }
      if (fileName) {
        addOnlineLog(isFav ? "UNFAVORITE" : "FAVORITE", fileName);
      }
      return next;
    });
  };

  const addToRecentlyViewed = (file: DriveFile) => {
    if (!file || !file.id || file.mimeType?.includes('folder')) return;
    setRecentlyViewed(prev => {
      const filtered = prev.filter(item => item.id !== file.id);
      const updated = [
        {
          id: file.id,
          name: file.name,
          mimeType: file.mimeType,
          viewedAt: Date.now()
        },
        ...filtered
      ].slice(0, 25);

      try {
        localStorage.setItem('archive_recent_history', JSON.stringify(updated));
      } catch (err) {
        console.error(err);
      }
      return updated;
    });
  };

  const clearRecentlyViewed = () => {
    setRecentlyViewed([]);
    try {
      localStorage.removeItem('archive_recent_history');
    } catch (err) {
      console.error(err);
    }
  };

  const formatRelativeTime = (timestamp: number) => {
    const diff = Math.floor((Date.now() - timestamp) / 1000);
    if (diff < 60) return 'Baru saja';
    if (diff < 3600) return `${Math.floor(diff / 60)} mnt lalu`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} jam lalu`;
    if (diff < 604800) return `${Math.floor(diff / 86400)} hari lalu`;
    const d = new Date(timestamp);
    return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
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
    const savedAtmosphere = localStorage.getItem('themeAtmosphere');
    if (savedAtmosphere) setThemeAtmosphere(savedAtmosphere);
    const savedFontSize = localStorage.getItem('themeFontSize') as 'sm' | 'md' | 'lg' | null;
    if (savedFontSize) setFontSize(savedFontSize);
    const savedGlass = localStorage.getItem('themeGlassEffect');
    if (savedGlass !== null) setGlassEffect(savedGlass === 'true');

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
      setIsLoggedIn(true); setUserRole(savedRole as any); setUserName(savedName);
    } else {
      const rememberedName = localStorage.getItem('savedLoginName');
      const rememberedPwd = localStorage.getItem('savedLoginPwd');
      if (rememberedName) setTempName(rememberedName);
      if (rememberedPwd) setPassword(rememberedPwd);
    }

    // Ambil log yang tersimpan di cache dan lakukan sinkronisasi
    try {
      const cached = localStorage.getItem('archive_activity_logs_cache');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) setActivityLogs(parsed);
      }
    } catch {}
    fetchOnlineLogs();
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

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode);
    const currentAtmos = Array.from(document.documentElement.classList).filter(c => c.startsWith('atmos-'));
    currentAtmos.forEach(c => document.documentElement.classList.remove(c));
    if (themeAtmosphere && themeAtmosphere !== 'default') {
      document.documentElement.classList.add(`atmos-${themeAtmosphere}`);
    }
  }, [isDarkMode, themeAtmosphere]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('archive_file_tags');
      if (saved) setTagMap(JSON.parse(saved));

      const savedCustom = localStorage.getItem('archive_custom_tags');
      if (savedCustom) setCustomTagHistory(JSON.parse(savedCustom));

      const savedFavs = localStorage.getItem('archive_favorites');
      if (savedFavs) {
        const parsed = JSON.parse(savedFavs);
        if (Array.isArray(parsed)) setFavorites(new Set(parsed));
      }

      const savedRecent = localStorage.getItem('archive_recent_history');
      if (savedRecent) {
        const parsed = JSON.parse(savedRecent);
        if (Array.isArray(parsed)) setRecentlyViewed(parsed);
      }
    } catch {}
  }, []);

  const fetchData = async (fId: string = '') => {
    setLoading(true);
    try {
      const res = await fetch(`/api/drive?folderId=${fId}`);
      const data = await res.json();
      if (data.files) {
        setFiles(data.files);
        setAllFolders(data.files.filter((f: any) => f.mimeType.includes('folder')));

        // Sync tags from Google Drive appProperties
        const driveTagsMap: Record<string, string[]> = {};
        const discoveredCustomTags: string[] = [];

        data.files.forEach((f: any) => {
          if (f.appProperties?.tags) {
            try {
              const parsed = JSON.parse(f.appProperties.tags);
              if (Array.isArray(parsed)) {
                driveTagsMap[f.id] = parsed;
                parsed.forEach((tag: string) => {
                  if (!PRESET_TAGS.some(p => p.label.toLowerCase() === tag.toLowerCase())) {
                    discoveredCustomTags.push(tag);
                  }
                });
              }
            } catch {}
          }
        });
        if (Object.keys(driveTagsMap).length > 0) {
          setTagMap(prev => {
            const merged = { ...prev, ...driveTagsMap };
            try { localStorage.setItem('archive_file_tags', JSON.stringify(merged)); } catch {}
            return merged;
          });
        }
        if (discoveredCustomTags.length > 0) {
          setCustomTagHistory(prev => {
            const combined = Array.from(new Set([...prev, ...discoveredCustomTags]));
            try { localStorage.setItem('archive_custom_tags', JSON.stringify(combined)); } catch {}
            return combined;
          });
        }
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
    addToRecentlyViewed(file);
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
    setUploading(true); setUploadStatus('idle'); setUploadProgress(0); setUploadErrorMessage('');
    let success = 0;
    let lastError = '';

    for (let i = 0; i < selectedFiles.length; i++) {
      const formData = new FormData();
      formData.append('file', selectedFiles[i]);
      formData.append('parentId', uploadDestinationId || currentFolder || '');
      try {
        const res = await fetch('/api/drive/upload', { method: 'POST', body: formData });
        const data = await res.json();
        if (res.ok && data.success) {
          success++;
          addOnlineLog("UPLOAD", selectedFiles[i].name);
        } else {
          lastError = data.details || data.error || 'Gagal mengunggah file';
        }
        setUploadProgress(Math.round(((i + 1) / selectedFiles.length) * 100));
      } catch (e: any) {
        console.error(e);
        lastError = e.message || 'Terjadi kesalahan koneksi saat upload';
      }
    }

    if (success > 0) {
      setUploadStatus('success');
      setTimeout(() => { setIsUploadModalOpen(false); fetchData(currentFolder); }, 2000);
    } else {
      setUploadStatus('error');
      setUploadErrorMessage(lastError || 'Gagal mengunggah berkas. Periksa izin dan koneksi Google Drive.');
    }
    setUploading(false);
  };

  const handleDelete = async (fileId: string, fileName: string) => {
    if (userRole !== 'admin') {
      alert('Hanya Administrator yang memiliki akses untuk menghapus dokumen.');
      return;
    }
    if (!confirm(`Hapus berkas "${fileName}" dari arsip?`)) return;

    try {
      const res = await fetch(`/api/drive?fileId=${fileId}`, { method: 'DELETE' });
      const data = await res.json();
      if (res.ok && data.success) {
        addOnlineLog("DELETE", fileName);
        if (selectedFile?.id === fileId) {
          setSelectedFile(null);
        }
        fetchData(currentFolder);
      } else {
        alert(`Gagal menghapus berkas: ${data.error || 'Terjadi kesalahan'}`);
      }
    } catch (e: any) {
      console.error(e);
      alert(`Gagal menghapus berkas: ${e.message}`);
    }
  };

  const handleRename = async (fileId: string, oldName: string) => {
    if (userRole !== 'admin') {
      alert('Hanya Administrator yang memiliki akses untuk mengubah nama berkas.');
      return;
    }
    const newName = prompt("Nama Baru Berkas:", oldName);
    if (!newName || !newName.trim() || newName.trim() === oldName) return;

    try {
      const res = await fetch('/api/drive', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileId, newName: newName.trim() })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        addOnlineLog("RENAME", `${oldName} -> ${newName.trim()}`);
        if (selectedFile?.id === fileId) {
          setSelectedFile(prev => prev ? { ...prev, name: newName.trim() } : null);
        }
        fetchData(currentFolder);
      } else {
        alert(`Gagal mengubah nama berkas: ${data.error || 'Terjadi kesalahan'}`);
      }
    } catch (e: any) {
      console.error(e);
      alert(`Gagal mengubah nama berkas: ${e.message}`);
    }
  };

  const handleDownloadLogs = () => {
    if (userRole !== 'admin') {
      alert('Hanya Administrator yang memiliki akses untuk mengekspor data riwayat aktivitas.');
      return;
    }
    const headers = ["ID", "Pengguna", "Perangkat", "IP Address", "Aksi", "Nama Dokumen / Keterangan", "Waktu (ISO)", "Waktu Lokal"];
    const csvContent = [
      headers.join(","),
      ...activityLogs.map(log => 
        `"${log.id || '-'}","${(log.user || '-').replace(/"/g, '""')}","${log.device || '-'}","${log.ip || '-'}","${log.action}","${(log.fileName || '').replace(/"/g, '""')}","${log.timestamp}","${new Date(log.timestamp).toLocaleString('id-ID')}"`
      )
    ].join("\n");
    const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `audit_trail_irban3_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addOnlineLog("EXPORT_CSV", "Admin mengunduh rekaman audit log (CSV)");
  };

  // --- HELPER EKSPOR EXCEL ---
  const getReadableType = (mimeType: string, name: string): string => {
    if (mimeType.includes('folder')) return 'Folder';
    if (mimeType.includes('pdf') || name.toLowerCase().endsWith('.pdf')) return 'PDF';
    if (mimeType.includes('word') || name.toLowerCase().endsWith('.docx') || name.toLowerCase().endsWith('.doc')) return 'Word (DOCX)';
    if (mimeType.includes('spreadsheet') || mimeType.includes('excel') || name.toLowerCase().endsWith('.xlsx') || name.toLowerCase().endsWith('.xls')) return 'Excel (XLSX)';
    if (mimeType.includes('image')) return 'Gambar';
    if (mimeType.includes('presentation') || name.toLowerCase().endsWith('.pptx')) return 'PowerPoint';
    return 'Berkas Lainnya';
  };

  const formatFileSize = (sizeBytes?: string | number): string => {
    if (!sizeBytes) return '-';
    const bytes = Number(sizeBytes);
    if (isNaN(bytes) || bytes === 0) return '-';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const handleExportExcel = async (scope: 'current' | 'all' = exportScope) => {
    setExportLoading(true);
    setExportSuccess(false);

    try {
      let itemsToExport: Array<{
        id: string;
        name: string;
        mimeType: string;
        size?: string;
        createdTime?: string;
        folderName?: string;
      }> = [];

      let currentFolderName = 'Beranda Utama';
      if (currentFolder) {
        currentFolderName = folderHistory[folderHistory.length - 1]?.name || 'Folder Aktif';
      } else if (filterType === 'file') {
        currentFolderName = 'Semua Dokumen';
      } else if (filterType === 'folder') {
        currentFolderName = 'Semua Folder';
      }

      if (scope === 'current') {
        itemsToExport = filteredFilesMain.map(item => ({
          id: item.id,
          name: item.name,
          mimeType: item.mimeType,
          size: item.size,
          createdTime: item.createdTime,
          folderName: currentFolderName,
        }));
      } else {
        // Ambil seluruh arsip dari endpoint export
        const res = await fetch('/api/drive/export');
        const data = await res.json();
        if (data.success && Array.isArray(data.files)) {
          itemsToExport = data.files;
        } else {
          // Fallback ke data files lokal jika server ada kendala
          itemsToExport = files.map(item => ({
            id: item.id,
            name: item.name,
            mimeType: item.mimeType,
            size: item.size,
            createdTime: item.createdTime,
            folderName: currentFolderName,
          }));
        }
      }

      if (itemsToExport.length === 0) {
        alert('Tidak ada data arsip untuk diekspor.');
        setExportLoading(false);
        return;
      }

      // Waktu ekspor sekarang
      const now = new Date();
      const exportTimeStr = now.toLocaleString('id-ID', {
        dateStyle: 'long',
        timeStyle: 'medium',
      });
      const dateFileStr = now.toISOString().split('T')[0];

      // Format CSV dengan UTF-8 BOM (\uFEFF)
      const cleanCsvVal = (val: any) => `"${String(val ?? '').replace(/"/g, '""')}"`;

      const rows: string[] = [];

      // Kop Informasi Dokumen
      rows.push(`"REKAPITULASI ARSIP DIGITAL LAPORAN HASIL PEMERIKSAAN (LHP)"`);
      rows.push(`"INSPEKTORAT PROVINSI SULAWESI TENGGARA — IRBAN WILAYAH III"`);
      rows.push(`"Waktu Unduh",${cleanCsvVal(`${exportTimeStr} WITA`)}`);
      rows.push(`"Diekspor Oleh",${cleanCsvVal(`${userName || 'Petugas'} (${userRole || 'User'})`)}`);
      rows.push(`"Cakupan Data",${cleanCsvVal(scope === 'all' ? 'Seluruh Arsip Sistem (Google Drive)' : `Tampilan Saat Ini (${currentFolderName})`)}`);
      rows.push(`"Total Arsip",${cleanCsvVal(`${itemsToExport.length} Berkas`)}`);
      rows.push(''); // Baris pemisah

      // Header Kolom Tabel
      rows.push([
        '"No"',
        '"Nama Dokumen / Arsip"',
        '"Format Dokumen"',
        '"Ukuran"',
        '"Tanggal Dibuat / Unggah"',
        '"Lokasi Folder / OPD"',
        '"ID Arsip Drive"',
        '"Tautan Akses Google Drive"',
      ].join(','));

      // Data Baris
      itemsToExport.forEach((item, idx) => {
        const itemType = getReadableType(item.mimeType, item.name);
        const itemSize = formatFileSize(item.size);
        const itemDate = item.createdTime
          ? new Date(item.createdTime).toLocaleString('id-ID', {
              dateStyle: 'medium',
              timeStyle: 'short',
            })
          : '-';
        const driveLink = item.id ? `https://drive.google.com/file/d/${item.id}/view` : '-';

        rows.push([
          cleanCsvVal(idx + 1),
          cleanCsvVal(item.name),
          cleanCsvVal(itemType),
          cleanCsvVal(itemSize),
          cleanCsvVal(itemDate),
          cleanCsvVal(item.folderName || currentFolderName),
          cleanCsvVal(item.id),
          cleanCsvVal(driveLink),
        ].join(','));
      });

      // Baris Total Penutup
      rows.push('');
      rows.push([
        '"TOTAL"',
        cleanCsvVal(`${itemsToExport.length} Berkas`),
        '""',
        '""',
        '""',
        '""',
        '""',
        '""',
      ].join(','));

      const csvString = '\uFEFF' + rows.join('\r\n');
      const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const safeScopeName = scope === 'all' ? 'Semua_Arsip' : (currentFolderName.replace(/[^a-zA-Z0-9_-]/g, '_'));
      link.download = `Rekap_Arsip_LHP_Irban_III_${safeScopeName}_${dateFileStr}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      addOnlineLog('EXPORT_EXCEL', `Rekap Excel (${scope}): ${itemsToExport.length} dokumen`);
      setExportSuccess(true);
      setTimeout(() => {
        setExportSuccess(false);
      }, 3000);
    } catch (err: any) {
      console.error('EXPORT_ERROR:', err);
      alert('Terjadi kesalahan saat mengekspor: ' + (err.message || 'Error'));
    } finally {
      setExportLoading(false);
    }
  };

  // --- ANTI-CAPTURE & ANTI-SCREENSHOT ENGINE (Shared View Protection) ---
  useEffect(() => {
    if (!isSharedView) return;

    // 1. Real-time Clock for Forensic Watermarking
    const updateClock = () => {
      const now = new Date();
      const pad = (n: number) => n.toString().padStart(2, '0');
      const timeStr = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())} WIB`;
      const dateStr = `${pad(now.getDate())}/${pad(now.getMonth() + 1)}/${now.getFullYear()}`;
      setWatermarkClock(`${dateStr} • ${timeStr}`);
    };
    updateClock();
    const clockInterval = setInterval(updateClock, 1000);

    // 2. Anti-Capture: Window Blur & Visibility Loss
    // Instantly blacks out document when Snipping Tool, Mac Screen Capture, Android/iOS Recorders, or App Switcher triggers
    const handleWindowBlur = () => {
      setIsSharedSecurityLocked(true);
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        setIsSharedSecurityLocked(true);
      }
    };

    // 3. Keystroke Interception (PrintScreen, Ctrl+P, Ctrl+S, Win+Shift+S, Cmd+Shift+3/4/5, DevTools)
    const handleSecurityKeyDown = (e: KeyboardEvent) => {
      // PrintScreen
      if (e.key === 'PrintScreen' || e.keyCode === 44) {
        e.preventDefault();
        e.stopPropagation();
        try {
          if (navigator.clipboard?.writeText) {
            navigator.clipboard.writeText('⚠️ PERINGATAN: Tangkapan layar dilarang pada dokumen terbatas ini.');
          }
        } catch {}
        setIsSharedSecurityLocked(true);
        setSharedSecurityAlert('Tangkapan layar (PrintScreen) telah diblokir.');
        return false;
      }

      // Ctrl / Cmd + P (Print)
      if ((e.ctrlKey || e.metaKey) && (e.key === 'p' || e.key === 'P')) {
        e.preventDefault();
        e.stopPropagation();
        setSharedSecurityAlert('Fungsi cetak (Print to PDF/Kertas) dinonaktifkan.');
        return false;
      }

      // Ctrl / Cmd + S (Save page)
      if ((e.ctrlKey || e.metaKey) && (e.key === 's' || e.key === 'S')) {
        e.preventDefault();
        e.stopPropagation();
        setSharedSecurityAlert('Penyimpanan halaman dinonaktifkan.');
        return false;
      }

      // Windows Snipping Tool (Win/Ctrl + Shift + S)
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 's' || e.key === 'S')) {
        e.preventDefault();
        e.stopPropagation();
        setIsSharedSecurityLocked(true);
        setSharedSecurityAlert('Alat tangkapan layar diblokir.');
        return false;
      }

      // Mac Screenshot (Cmd + Shift + 3, 4, 5)
      if (e.metaKey && e.shiftKey && ['3', '4', '5'].includes(e.key)) {
        e.preventDefault();
        e.stopPropagation();
        setIsSharedSecurityLocked(true);
        setSharedSecurityAlert('Tangkapan layar Mac diblokir.');
        return false;
      }

      // DevTools (F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C)
      if (e.key === 'F12' || ((e.ctrlKey || e.metaKey) && e.shiftKey && ['i', 'I', 'j', 'J', 'c', 'C'].includes(e.key))) {
        e.preventDefault();
        e.stopPropagation();
        setSharedSecurityAlert('Alat pengembang (DevTools/Inspect) dinonaktifkan.');
        return false;
      }

      // Ctrl / Cmd + U (View Source)
      if ((e.ctrlKey || e.metaKey) && (e.key === 'u' || e.key === 'U')) {
        e.preventDefault();
        return false;
      }
    };

    const handleSecurityKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'PrintScreen' || e.keyCode === 44) {
        try {
          navigator.clipboard?.writeText('⚠️ PERINGATAN: Tangkapan layar dilarang pada dokumen terbatas ini.');
        } catch {}
        setIsSharedSecurityLocked(true);
      }
    };

    window.addEventListener('blur', handleWindowBlur);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('keydown', handleSecurityKeyDown, true);
    window.addEventListener('keyup', handleSecurityKeyUp, true);

    return () => {
      clearInterval(clockInterval);
      window.removeEventListener('blur', handleWindowBlur);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('keydown', handleSecurityKeyDown, true);
      window.removeEventListener('keyup', handleSecurityKeyUp, true);
    };
  }, [isSharedView]);

  if (!mounted) return null;

  const baseFiles = (searchTerm.length >= 2 ? searchResults : files).filter(f => f.name.toLowerCase().includes(searchTerm.toLowerCase()));

  const filteredFilesMain = baseFiles
    .filter(f => {
      if (filterType === 'folder') return f.mimeType.includes('folder');
      if (filterType === 'file') return !f.mimeType.includes('folder');
      return true;
    })
    .filter(f => {
      if (selectedTagFilter === 'all') return true;
      const fileTags = getFileTags(f);
      return fileTags.some(t => t.toLowerCase() === selectedTagFilter.toLowerCase());
    })
    .filter(f => {
      if (!showFavoritesOnly) return true;
      return favorites.has(f.id);
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
      <div className={`${isDarkMode ? "dark" : "light"} theme-${themeColor} ${themeAtmosphere !== 'default' ? `atmos-${themeAtmosphere}` : ''} font-scale-${fontSize} ${glassEffect ? 'enable-glass' : 'disable-glass'}`}>
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
          /* DOCUMENT PREVIEW (ENHANCED ANTI-CAPTURE & ANTI-LEAK) */
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="w-full max-w-5xl h-[88vh] bg-[var(--bg-panel)] rounded-2xl border border-[var(--border-line)] flex flex-col overflow-hidden shadow-2xl relative z-10 secure-no-select select-none">
            {/* Security Top Bar */}
            <div className="p-4 sm:p-5 border-b border-[var(--border-line)] flex items-center justify-between bg-[var(--bg-panel-trans)] backdrop-blur-xl z-30 flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-emerald-500/10 rounded-xl text-emerald-500 flex-shrink-0">
                  <ShieldCheck size={22} />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-sm sm:text-base font-bold text-[var(--text-main)]">Dokumen Rahasia Terbatas</h3>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                      <Lock size={10} /> Terlindungi PIN
                    </span>
                  </div>
                  <p className="text-[11px] text-[var(--text-muted)] mt-0.5 flex items-center gap-2">
                    <span>Inspektorat Prov. Sulawesi Tenggara</span>
                    {sharedPinInput && <span className="font-mono text-slate-400 font-semibold">• PIN: {sharedPinInput}</span>}
                  </p>
                </div>
              </div>

              {/* Security Status & Actions */}
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-400 text-xs font-medium">
                  <EyeOff size={13} className="animate-pulse" />
                  <span className="hidden sm:inline">Proteksi Anti-Capture Aktif</span>
                  <span className="sm:hidden">Anti-Capture</span>
                </div>
                <button
                  onClick={() => {
                    // Safe exit & return to base URL
                    window.location.href = window.location.origin;
                  }}
                  className="px-3.5 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/25 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5"
                  title="Tutup & Kunci Dokumen"
                >
                  <X size={14} />
                  <span>Tutup Akses</span>
                </button>
              </div>
            </div>

            {/* Security Alert Toast if triggered */}
            {sharedSecurityAlert && (
              <div className="bg-amber-500/15 border-b border-amber-500/30 px-4 py-2 flex items-center justify-between text-xs text-amber-300 z-40">
                <span className="flex items-center gap-2 font-medium">
                  <AlertCircle size={14} className="flex-shrink-0" /> {sharedSecurityAlert}
                </span>
                <button onClick={() => setSharedSecurityAlert(null)} className="hover:text-white p-1">
                  <X size={13} />
                </button>
              </div>
            )}
            
            <div 
              onContextMenu={(e) => { e.preventDefault(); setSharedSecurityAlert('Klik kanan dinonaktifkan demi keamanan dokumen.'); }}
              className="flex-1 relative bg-black/50 overflow-hidden secure-no-select select-none"
            >
              {/* SECURITY BLACKOUT SHIELD (Triggers on blur / visibilitychange / PrintScreen / Snipping Tool) */}
              {isSharedSecurityLocked && (
                <div 
                  onClick={() => { setIsSharedSecurityLocked(false); setSharedSecurityAlert(null); }}
                  className="absolute inset-0 z-50 bg-slate-950/98 backdrop-blur-2xl flex flex-col items-center justify-center p-6 text-center cursor-pointer select-none transition-all"
                >
                  <div className="w-16 h-16 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-4 animate-pulse">
                    <ShieldAlert size={36} />
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-white mb-2">Tampilan Disamarkan Demi Keamanan</h3>
                  <p className="text-xs sm:text-sm text-slate-400 max-w-md mb-6 leading-relaxed">
                    Dokumen otomatis dikaburkan saat jendela kehilangan fokus, beralih aplikasi, atau terdeteksi pintasan tangkapan/perekam layar.
                  </p>
                  <button 
                    onClick={(e) => { e.stopPropagation(); setIsSharedSecurityLocked(false); setSharedSecurityAlert(null); }}
                    className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs sm:text-sm transition-all shadow-lg flex items-center gap-2"
                  >
                    <Check size={16} />
                    <span>Klik di Sini untuk Membuka Kembali</span>
                  </button>
                </div>
              )}

              {/* DYNAMIC REALTIME FORENSIC WATERMARK OVERLAY */}
              <div 
                className="absolute inset-0 z-20 pointer-events-none select-none flex flex-col justify-between p-4 overflow-hidden"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='420' height='300' xmlns='http://www.w3.org/2000/svg'%3E%3Ctext x='50%25' y='50%25' font-size='15' font-family='Arial, sans-serif' font-weight='bold' fill='%23ef4444' opacity='0.16' transform='translate(210, 150) rotate(-30) translate(-210, -150)' text-anchor='middle'%3ERAHASIA INSPEKTORAT SULTRA%3C/text%3E%3C/svg%3E")`,
                  backgroundRepeat: 'repeat'
                }}
              >
                {/* Realtime Moving Forensic Header */}
                <div className="flex justify-between items-start text-[10px] text-red-500/40 font-mono tracking-widest font-bold">
                  <span>DOKUMEN RAHASIA PEMERIKSAAN</span>
                  <span>{watermarkClock || 'AKTIF'}</span>
                </div>
                
                {/* Floating Central Forensic Badge (Prevents physical camera bypass) */}
                <div className="self-center py-2 px-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500/50 text-[11px] font-mono font-bold tracking-wider text-center backdrop-blur-[1px]">
                  PIN: {sharedPinInput || 'TERVERIFIKASI'} • {watermarkClock} • DILARANG MEREKAM / MEMOTRET
                </div>

                {/* Forensic Footer */}
                <div className="flex justify-between items-end text-[10px] text-red-500/40 font-mono tracking-widest font-bold">
                  <span>HAK CIPTA INSPEKTORAT SULTRA</span>
                  <span>TIDAK UNTUK DISEBARLUASKAN</span>
                </div>
              </div>

              {/* The Actual PDF Preview Iframe */}
              <iframe 
                src={`https://drive.google.com/file/d/${sharedFileId}/preview`} 
                className={`w-full h-full border-0 relative z-0 transition-all duration-300 ${isSharedSecurityLocked ? 'opacity-0 scale-95 blur-2xl pointer-events-none' : 'opacity-100 scale-100'}`} 
                title="Shared Preview" 
              />
            </div>

            {/* Bottom Security Footer */}
            <div className="p-3 bg-[var(--bg-panel-trans)] border-t border-[var(--border-line)] flex items-center justify-between text-[11px] text-[var(--text-muted)] z-30 px-5">
              <span className="flex items-center gap-1.5 font-medium">
                <Lock size={12} className="text-emerald-400" /> Sesi sekali pakai aktif • Unduhan dinonaktifkan
              </span>
              <span className="text-slate-500 hidden sm:inline">
                Terlindungi oleh Protokol Keamanan Inspektorat
              </span>
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
      <div className={`${isDarkMode ? "dark" : "light"} theme-${themeColor} ${themeAtmosphere !== 'default' ? `atmos-${themeAtmosphere}` : ''} font-scale-${fontSize} ${glassEffect ? 'enable-glass' : 'disable-glass'}`}>
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
    <div className={`${isDarkMode ? "dark" : "light"} theme-${themeColor} ${themeAtmosphere !== 'default' ? `atmos-${themeAtmosphere}` : ''} font-scale-${fontSize} ${glassEffect ? 'enable-glass' : 'disable-glass'}`}>
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
              { icon: FileSpreadsheet, label: 'Ekspor Excel', active: false, onClick: () => setIsExportModalOpen(true) },
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
              <button 
                onClick={() => {
                  const next = !isDarkMode;
                  setIsDarkMode(next);
                  localStorage.setItem('isDarkMode', String(next));
                }} 
                title={isDarkMode ? "Beralih ke Mode Terang" : "Beralih ke Mode Gelap"}
                className="p-2.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--hover-fill)] transition-all"
              >
                {isDarkMode ? <Sun size={16}/> : <Moon size={16}/>}
              </button>
              <button 
                onClick={() => setIsThemeModalOpen(true)} 
                title="Kustomisasi Tema, Warna & Tampilan" 
                className="p-2.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--accent)] hover:bg-[var(--hover-fill)] transition-all"
              >
                <Palette size={16}/>
              </button>
              {!isPresentationMode && (
                <>
                  <button 
                    onClick={() => { setIsLogModalOpen(true); fetchOnlineLogs(); }}
                    className="bg-[var(--accent)]/10 hover:bg-[var(--accent)]/20 text-[var(--accent)] border border-[var(--accent-light)] px-3.5 py-2.5 rounded-xl font-semibold text-xs sm:text-sm transition-all flex items-center gap-2 shadow-sm"
                    title="Audit Trail & Riwayat Aktivitas Sistem (Pencarian, Alamat IP, Sesi)"
                  >
                    <History size={16} />
                    <span className="hidden sm:inline">Riwayat Aktivitas</span>
                  </button>
                  <button 
                    onClick={() => setIsExportModalOpen(true)}
                    className="bg-emerald-600/15 hover:bg-emerald-600/25 text-emerald-400 border border-emerald-500/30 px-3.5 py-2.5 rounded-xl font-semibold text-xs sm:text-sm transition-all flex items-center gap-2 shadow-sm"
                    title="Ekspor Rekap Arsip ke Excel"
                  >
                    <FileSpreadsheet size={16} className="text-emerald-400" />
                    <span className="hidden sm:inline">Ekspor Excel</span>
                  </button>
                </>
              )}
              {userRole === 'admin' && !isPresentationMode && (
                <button 
                  onClick={() => { setUploadStatus('idle'); setUploadErrorMessage(''); setUploadDestinationId(currentFolder); setIsUploadModalOpen(true); }}
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
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-end gap-3 flex-wrap">
                    <button 
                      onClick={() => setIsExportModalOpen(true)}
                      className="flex items-center gap-2 px-5 py-3 bg-emerald-600/15 border border-emerald-500/30 rounded-xl text-sm font-semibold text-emerald-400 hover:bg-emerald-600/25 transition-all shadow-sm"
                    >
                      <FileSpreadsheet size={16} /> Ekspor Rekap Excel
                    </button>
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
                        {showFavoritesOnly ? 'Dokumen Favorit' : currentFolder ? 'Isi Folder' : filterType === 'file' ? 'Semua Dokumen' : 'Semua Item'}
                      </h3>
                      <span className="text-xs text-[var(--text-muted)]">{filteredFilesMain.length}</span>
                    </div>

                    {/* Action Bar (Favorit, Riwayat, Ekspor) */}
                    {!isPresentationMode && (
                      <div className="flex items-center gap-1.5 sm:gap-2">
                        {/* Tombol Filter Favorit */}
                        <button
                          onClick={() => setShowFavoritesOnly(prev => !prev)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-xs font-semibold transition-all border ${
                            showFavoritesOnly
                              ? 'bg-amber-500/20 text-amber-500 border-amber-500/40 shadow-sm ring-2 ring-amber-500/20'
                              : 'bg-[var(--hover-fill)] text-[var(--text-muted)] hover:text-amber-500 border-[var(--border-line)]'
                          }`}
                          title={showFavoritesOnly ? 'Tampilkan Semua Dokumen' : 'Tampilkan Dokumen Favorit Saja'}
                        >
                          <Star size={14} className={showFavoritesOnly ? 'fill-amber-500 text-amber-500' : 'text-amber-500'} />
                          <span className="hidden sm:inline">Favorit</span>
                          {favorites.size > 0 && (
                            <span className="text-[10px] px-1.5 py-0.2 bg-amber-500/20 text-amber-500 rounded-full font-bold">
                              {favorites.size}
                            </span>
                          )}
                        </button>

                        {/* Tombol Riwayat Aktivitas & Audit Trail */}
                        <button
                          onClick={() => { setIsLogModalOpen(true); fetchOnlineLogs(); }}
                          className="flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 bg-[var(--accent)]/10 hover:bg-[var(--accent)]/20 text-[var(--accent)] border border-[var(--accent-light)] rounded-xl text-xs font-semibold transition-all group shadow-sm"
                          title="Buka Audit Trail & Riwayat Aktivitas (Pencarian, Alamat IP, Sesi, Perangkat)"
                        >
                          <History size={14} className="group-hover:rotate-45 transition-transform" />
                          <span className="hidden sm:inline">Riwayat Aktivitas</span>
                          <span className="sm:hidden">Log</span>
                          {activityLogs.length > 0 && (
                            <span className="text-[10px] px-1.5 py-0.2 bg-[var(--accent)]/20 text-[var(--accent)] rounded-full font-bold">
                              {activityLogs.length}
                            </span>
                          )}
                        </button>

                        {/* Tombol Dokumen Terakhir Dilihat */}
                        <button
                          onClick={() => setIsRecentModalOpen(true)}
                          className="flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 bg-[var(--hover-fill)] hover:bg-sky-500/10 text-[var(--text-muted)] hover:text-sky-500 border border-[var(--border-line)] hover:border-sky-500/30 rounded-xl text-xs font-semibold transition-all group"
                          title="Lihat Dokumen yang Baru Saja Anda Buka"
                        >
                          <Clock size={14} className="group-hover:rotate-45 transition-transform text-sky-500" />
                          <span className="hidden sm:inline">Terakhir Dilihat</span>
                          {recentlyViewed.length > 0 && (
                            <span className="text-[10px] px-1.5 py-0.2 bg-sky-500/20 text-sky-500 rounded-full font-bold">
                              {recentlyViewed.length}
                            </span>
                          )}
                        </button>

                        {/* Tombol Ekspor Excel */}
                        <button
                          onClick={() => setIsExportModalOpen(true)}
                          className="flex items-center gap-2 px-3 py-1.5 sm:px-3.5 sm:py-2 bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-500 hover:text-emerald-400 border border-emerald-500/25 rounded-xl text-xs font-semibold transition-all shadow-sm group"
                          title="Ekspor Rekapitulasi ke Excel"
                        >
                          <FileSpreadsheet size={15} className="group-hover:scale-110 transition-transform" />
                          <span className="hidden sm:inline">Ekspor Excel</span>
                          <span className="sm:hidden">Excel</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* LABEL FILTER BAR */}
                  <div className="flex items-center gap-2 overflow-x-auto pb-2.5 mb-4 scrollbar-none">
                    <span className="text-xs text-[var(--text-muted)] flex items-center gap-1.5 flex-shrink-0 font-medium">
                      <Tag size={13} className="text-[var(--accent)]" /> Label:
                    </span>
                    <button
                      onClick={() => setSelectedTagFilter('all')}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-all whitespace-nowrap border ${
                        selectedTagFilter === 'all'
                          ? 'bg-[var(--accent)] text-[var(--accent-fg)] border-[var(--accent)] shadow-sm'
                          : 'bg-[var(--hover-fill)] text-[var(--text-muted)] hover:text-[var(--text-main)] border-[var(--border-line)]'
                      }`}
                    >
                      Semua
                    </button>
                    {PRESET_TAGS.map(pt => {
                      const isSelected = selectedTagFilter.toLowerCase() === pt.label.toLowerCase();
                      return (
                        <button
                          key={pt.label}
                          onClick={() => setSelectedTagFilter(isSelected ? 'all' : pt.label)}
                          className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-all whitespace-nowrap border ${
                            isSelected
                              ? `${pt.bg} ${pt.text} ${pt.border} ring-2 ring-[var(--accent)]/30 font-semibold shadow-sm`
                              : 'bg-[var(--hover-fill)] text-[var(--text-muted)] hover:text-[var(--text-main)] border-[var(--border-line)]'
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${pt.dot}`}></span>
                          {pt.label}
                        </button>
                      );
                    })}
                    {/* Custom tags in use or in history */}
                    {Array.from(new Set([...customTagHistory, ...Object.values(tagMap).flat()]))
                      .filter(t => !PRESET_TAGS.some(p => p.label.toLowerCase() === t.toLowerCase()))
                      .map(customTag => {
                        const isSelected = selectedTagFilter.toLowerCase() === customTag.toLowerCase();
                        const style = getTagStyle(customTag);
                        return (
                          <button
                            key={customTag}
                            onClick={() => setSelectedTagFilter(isSelected ? 'all' : customTag)}
                            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-all whitespace-nowrap border ${
                              isSelected
                                ? `${style.bg} ${style.text} ${style.border} ring-2 ring-[var(--accent)]/30 font-semibold shadow-sm`
                                : 'bg-[var(--hover-fill)] text-[var(--text-muted)] hover:text-[var(--text-main)] border-[var(--border-line)]'
                            }`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`}></span>
                            {customTag}
                          </button>
                        );
                      })}
                    {selectedTagFilter !== 'all' && (
                      <button
                        onClick={() => setSelectedTagFilter('all')}
                        className="text-[11px] text-[var(--accent)] hover:underline flex items-center gap-1 px-2 whitespace-nowrap font-medium ml-1"
                      >
                        <X size={12} /> Reset
                      </button>
                    )}
                  </div>

                  {filteredFilesMain.length === 0 ? (
                    <div className="text-center py-20">
                      {showFavoritesOnly ? (
                        <div className="max-w-xs mx-auto">
                          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500 mx-auto mb-4 border border-amber-500/20">
                            <Star size={32} className="fill-amber-500/30" />
                          </div>
                          <h4 className="text-sm font-bold text-[var(--text-main)] mb-1">Belum Ada Dokumen Favorit</h4>
                          <p className="text-xs text-[var(--text-muted)] leading-relaxed mb-4">
                            Tandai dokumen penting dengan menekan ikon bintang pada berkas agar mudah ditemukan di sini.
                          </p>
                          <button
                            onClick={() => setShowFavoritesOnly(false)}
                            className="px-4 py-2 bg-[var(--hover-fill)] hover:bg-[var(--accent)] hover:text-slate-950 text-xs font-semibold rounded-xl border border-[var(--border-line)] transition-all"
                          >
                            Tampilkan Semua Berkas
                          </button>
                        </div>
                      ) : (
                        <>
                          <Database size={40} className="text-slate-700 mx-auto mb-4" />
                          <p className="text-[var(--text-muted)] text-sm">Tidak ada data ditemukan</p>
                        </>
                      )}
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
                            
                            {/* Actions - visible on hover or if favorited */}
                            {!isPresentationMode && (
                            <div className="flex gap-1 items-center">
                              <button 
                                onClick={(e) => { e.stopPropagation(); toggleFavorite(file.id, file.name); }} 
                                title={favorites.has(file.id) ? "Hapus dari Favorit" : "Tambah ke Favorit"} 
                                className={`p-2 rounded-lg transition-all ${
                                  favorites.has(file.id)
                                    ? 'opacity-100 text-amber-500 hover:text-amber-400 bg-amber-500/10'
                                    : 'opacity-0 group-hover:opacity-100 text-[var(--text-muted)] hover:text-amber-500 hover:bg-[var(--hover-fill)]'
                                }`}
                              >
                                <Star size={14} className={favorites.has(file.id) ? 'fill-amber-500 text-amber-500' : ''} />
                              </button>
                              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={(e) => { e.stopPropagation(); openTagModal(file); }} title="Kelola Label" className="p-2 rounded-lg hover:bg-[var(--hover-fill)] text-[var(--text-muted)] hover:text-[var(--accent)] transition-all">
                                  <Tag size={14}/>
                                </button>
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
                            </div>
                            )}
                          </div>

                          <h4 title={file.name} className="text-xs sm:text-sm leading-tight sm:leading-normal font-medium text-[var(--text-main)] line-clamp-3 sm:truncate group-hover:text-[var(--accent)] transition-colors">{file.name}</h4>
                          <p className="text-[10px] sm:text-[11px] text-[var(--text-muted)] mt-1 sm:mt-1.5">
                            {file.mimeType.includes('folder') ? 'Folder' : 'Dokumen'}
                          </p>

                          {/* Tag Badges */}
                          {getFileTags(file).length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2.5">
                              {getFileTags(file).slice(0, 3).map(tag => {
                                const style = getTagStyle(tag);
                                return (
                                  <span
                                    key={tag}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedTagFilter(tag);
                                    }}
                                    title={`Filter label: ${tag}`}
                                    className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-md font-medium border ${style.bg} ${style.text} ${style.border} hover:opacity-80 transition-opacity`}
                                  >
                                    <span className={`w-1 h-1 rounded-full ${style.dot}`}></span>
                                    {tag}
                                  </span>
                                );
                              })}
                              {getFileTags(file).length > 3 && (
                                <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-[var(--hover-fill)] text-[var(--text-muted)] border border-[var(--border-line)]">
                                  +{getFileTags(file).length - 3}
                                </span>
                              )}
                            </div>
                          )}
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
                          <div className="col-span-9 sm:col-span-7 flex flex-col justify-center pr-2">
                            <div className="flex items-center gap-2 sm:gap-3">
                              <div className={`p-1.5 rounded-lg flex-shrink-0 ${file.mimeType.includes('folder') ? 'text-[var(--accent)] bg-[var(--accent)]/10' : 'text-[var(--text-muted)] bg-[var(--hover-fill)]'}`}>
                                {file.mimeType.includes('folder') ? <Folder size={16}/> : <FileText size={16}/>}
                              </div>
                              <span title={file.name} className="text-xs sm:text-sm text-[var(--text-main)] group-hover:text-[var(--accent)] line-clamp-2 sm:truncate transition-colors leading-tight sm:leading-normal">{file.name}</span>
                            </div>
                            {/* Tags in list row */}
                            {getFileTags(file).length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-1.5 pl-8 sm:pl-9">
                                {getFileTags(file).slice(0, 3).map(tag => {
                                  const style = getTagStyle(tag);
                                  return (
                                    <span
                                      key={tag}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedTagFilter(tag);
                                      }}
                                      className={`inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-md font-medium border ${style.bg} ${style.text} ${style.border}`}
                                    >
                                      <span className={`w-1 h-1 rounded-full ${style.dot}`}></span>
                                      {tag}
                                    </span>
                                  );
                                })}
                                {getFileTags(file).length > 3 && (
                                  <span className="text-[10px] px-1 py-0.5 rounded-md bg-[var(--hover-fill)] text-[var(--text-muted)] border border-[var(--border-line)]">
                                    +{getFileTags(file).length - 3}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                          <div className="hidden sm:block sm:col-span-3 text-xs text-[var(--text-muted)]">{file.mimeType.includes('folder') ? 'Folder' : 'Dokumen'}</div>
                          <div className="col-span-3 sm:col-span-2 flex items-center justify-end gap-0.5 sm:gap-2">
                            <button 
                              onClick={(e) => { e.stopPropagation(); toggleFavorite(file.id, file.name); }} 
                              title={favorites.has(file.id) ? "Hapus dari Favorit" : "Tambah ke Favorit"} 
                              className={`p-1.5 rounded-md transition-all ${
                                favorites.has(file.id)
                                  ? 'text-amber-500 hover:text-amber-400 bg-amber-500/10'
                                  : 'text-[var(--text-muted)] hover:text-amber-500 hover:bg-[var(--hover-fill)]'
                              }`}
                            >
                              <Star size={14} className={favorites.has(file.id) ? 'fill-amber-500 text-amber-500' : ''}/>
                            </button>
                            <button onClick={(e) => { e.stopPropagation(); openTagModal(file); }} title="Kelola Label" className="p-1.5 rounded-md text-[var(--text-muted)] hover:text-[var(--accent)] hover:bg-[var(--hover-fill)] transition-all">
                              <Tag size={14}/>
                            </button>
                            {!file.mimeType.includes('folder') && (
                              <button onClick={(e) => { e.stopPropagation(); addOnlineLog("DOWNLOAD", file.name); window.open(`https://drive.google.com/uc?export=download&id=${file.id}`, '_blank'); }} className="p-1.5 rounded-md text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--hover-fill)] transition-all"><Download size={14}/></button>
                            )}
                            {userRole === 'admin' && (
                              <>
                                <button onClick={(e) => { e.stopPropagation(); handleRename(file.id, file.name); }} title="Ganti Nama" className="p-1.5 rounded-md text-[var(--text-muted)] hover:text-blue-400 hover:bg-[var(--hover-fill)] transition-all"><Edit2 size={14}/></button>
                                <button onClick={(e) => { e.stopPropagation(); handleDelete(file.id, file.name); }} title="Hapus Berkas" className="p-1.5 rounded-md text-[var(--text-muted)] hover:text-red-400 hover:bg-[var(--hover-fill)] transition-all"><Trash2 size={14}/></button>
                              </>
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
              className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/70 backdrop-blur-md"
              onClick={() => setIsLogModalOpen(false)}
            >
              <motion.div 
                initial={{ scale: 0.95, y: 15 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 15 }}
                className="bg-[var(--bg-panel)] border border-[var(--border-line)] w-full max-w-5xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[88vh] relative" 
                onClick={e => e.stopPropagation()}
              >
                {/* Confirmation Modal to Clear Logs */}
                {isConfirmClearLogsOpen && (
                  <div className="absolute inset-0 z-30 flex items-center justify-center p-6 bg-black/75 backdrop-blur-sm">
                    <motion.div 
                      initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                      className="bg-[var(--bg-panel)] border border-rose-500/40 p-6 rounded-2xl max-w-sm w-full shadow-2xl text-center space-y-4"
                    >
                      <div className="w-12 h-12 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center mx-auto border border-rose-500/20">
                        <Trash2 size={24} />
                      </div>
                      <div>
                        <h4 className="text-base font-bold text-[var(--text-main)]">Hapus Seluruh Riwayat?</h4>
                        <p className="text-xs text-[var(--text-muted)] mt-1.5 leading-relaxed">
                          Tindakan ini akan mengosongkan seluruh audit log aktivitas yang tercatat di server. Tindakan ini permanen.
                        </p>
                      </div>
                      <div className="flex items-center gap-2.5 pt-1">
                        <button 
                          onClick={() => setIsConfirmClearLogsOpen(false)}
                          className="flex-1 py-2.5 px-3 text-xs font-medium rounded-xl border border-[var(--border-line)] text-[var(--text-muted)] hover:bg-[var(--hover-fill)] hover:text-[var(--text-main)] transition-all"
                        >
                          Batal
                        </button>
                        <button 
                          onClick={handleClearLogs}
                          disabled={clearLogsLoading}
                          className="flex-1 py-2.5 px-3 text-xs font-semibold rounded-xl bg-rose-600 text-white hover:bg-rose-700 transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-rose-600/20 disabled:opacity-50"
                        >
                          {clearLogsLoading ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />} Ya, Bersihkan
                        </button>
                      </div>
                    </motion.div>
                  </div>
                )}

                {/* Modal Header */}
                <div className="p-5 sm:p-6 border-b border-[var(--border-line)] flex flex-wrap justify-between items-center gap-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-[var(--accent)]/10 rounded-xl text-[var(--accent)] border border-[var(--accent-light)]">
                      <History size={20} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-bold text-[var(--text-main)]">Audit Trail & Riwayat Aktivitas</h3>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> Aktif
                        </span>
                      </div>
                      <p className="text-xs text-[var(--text-muted)] mt-0.5">Pencatatan real-time seluruh akses, perubahan berkas, dan sesi login</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <button 
                      onClick={() => fetchOnlineLogs()} 
                      disabled={logsLoading} 
                      title="Segarkan Riwayat" 
                      className="p-2 bg-white/[0.03] border border-[var(--border-line)] hover:bg-[var(--hover-fill)] text-[var(--text-muted)] hover:text-[var(--text-main)] rounded-lg transition-all disabled:opacity-50"
                    >
                      <RotateCw size={15} className={logsLoading ? 'animate-spin text-[var(--accent)]' : ''} />
                    </button>
                    {userRole === 'admin' && (
                      <button 
                        onClick={handleDownloadLogs} 
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-[var(--accent)] text-slate-950 hover:bg-amber-400 rounded-lg transition-all shadow-sm"
                        title="Unduh seluruh data riwayat audit (Khusus Admin)"
                      >
                        <Download size={14} /> Export CSV
                      </button>
                    )}
                    {userRole === 'admin' && (
                      <button 
                        onClick={() => setIsConfirmClearLogsOpen(true)} 
                        className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 rounded-lg transition-all"
                        title="Kosongkan seluruh log"
                      >
                        <Trash2 size={13} /> Reset
                      </button>
                    )}
                    <button 
                      onClick={() => setIsLogModalOpen(false)} 
                      className="p-2 hover:bg-[var(--hover-fill)] text-[var(--text-muted)] hover:text-[var(--text-main)] rounded-lg transition-all"
                    >
                      <X size={18}/>
                    </button>
                  </div>
                </div>

                {/* Metrics Summary Strip */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 px-5 py-2.5 bg-black/20 border-b border-[var(--border-line)] text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-[var(--text-muted)]">Total Log:</span>
                    <span className="font-bold text-[var(--text-main)] font-mono">{activityLogs.length}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[var(--text-muted)]">Pengguna:</span>
                    <span className="font-bold text-[var(--text-main)] font-mono">{new Set(activityLogs.map(l => l.user)).size}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[var(--text-muted)]">Akses Dokumen:</span>
                    <span className="font-bold text-[var(--accent)] font-mono">
                      {activityLogs.filter(l => ['VIEW_DOCUMENT', 'DOWNLOAD'].includes(l.action)).length}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 justify-start sm:justify-end">
                    <span className="text-[var(--text-muted)]">Terakhir:</span>
                    <span className="text-[var(--text-main)] font-medium">
                      {activityLogs[0] ? formatLogRelativeTime(activityLogs[0].timestamp) : '-'}
                    </span>
                  </div>
                </div>

                {/* Search & Filter Toolbar */}
                <div className="p-4 border-b border-[var(--border-line)] space-y-3 bg-[var(--bg-panel)]">
                  <div className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center justify-between">
                    <div className="relative flex-1">
                      <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                      <input 
                        type="text"
                        value={logSearchQuery}
                        onChange={(e) => setLogSearchQuery(e.target.value)}
                        placeholder="Cari nama riwayat, berkas, pengguna, aksi, IP, atau perangkat..."
                        className="w-full pl-8 pr-7 py-2 bg-white/[0.03] border border-[var(--border-line)] rounded-xl text-xs text-[var(--text-main)] placeholder-[var(--text-muted)] outline-none focus:border-[var(--accent)] transition-all"
                      />
                      {logSearchQuery && (
                        <button onClick={() => setLogSearchQuery('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-main)]">
                          <X size={13} />
                        </button>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 sm:pb-0">
                      {[
                        { id: 'ALL', label: 'Semua', count: activityLogs.length },
                        { id: 'DOCS', label: 'Dokumen', count: activityLogs.filter(l => ['VIEW_DOCUMENT', 'DOWNLOAD', 'OPEN_FOLDER'].includes(l.action)).length },
                        { id: 'MANAGE', label: 'Modifikasi', count: activityLogs.filter(l => ['UPLOAD', 'DELETE', 'RENAME', 'UPDATE_LABEL', 'FAVORITE', 'UNFAVORITE', 'EXPORT_EXCEL'].includes(l.action)).length },
                        { id: 'AUTH', label: 'Sesi', count: activityLogs.filter(l => ['LOGIN', 'LOGOUT'].includes(l.action)).length },
                        { id: 'SHARE', label: 'Bagikan', count: activityLogs.filter(l => ['SHARE', 'WHATSAPP_SHARE', 'PIN_ACCESS'].includes(l.action)).length },
                      ].map(tab => (
                        <button
                          key={tab.id}
                          onClick={() => setLogCategoryFilter(tab.id as any)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1.5 border ${
                            logCategoryFilter === tab.id
                              ? 'bg-[var(--accent)] text-slate-950 border-[var(--accent)] font-semibold shadow-sm'
                              : 'bg-white/[0.02] border-[var(--border-line)] text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--hover-fill)]'
                          }`}
                        >
                          {tab.label}
                          <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                            logCategoryFilter === tab.id ? 'bg-black/20 text-slate-950 font-bold' : 'bg-white/[0.06] text-[var(--text-muted)]'
                          }`}>
                            {tab.count}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Table Content */}
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                  {(() => {
                    const filteredLogs = activityLogs.filter(log => {
                      if (logCategoryFilter === 'DOCS') {
                        if (!['VIEW_DOCUMENT', 'DOWNLOAD', 'OPEN_FOLDER'].includes(log.action)) return false;
                      } else if (logCategoryFilter === 'MANAGE') {
                        if (!['UPLOAD', 'DELETE', 'RENAME', 'UPDATE_LABEL', 'FAVORITE', 'UNFAVORITE', 'EXPORT_EXCEL'].includes(log.action)) return false;
                      } else if (logCategoryFilter === 'AUTH') {
                        if (!['LOGIN', 'LOGOUT'].includes(log.action)) return false;
                      } else if (logCategoryFilter === 'SHARE') {
                        if (!['SHARE', 'WHATSAPP_SHARE', 'PIN_ACCESS'].includes(log.action)) return false;
                      }

                      if (logSearchQuery.trim()) {
                        const q = logSearchQuery.toLowerCase();
                        const badge = getActionBadge(log.action);
                        return (
                          (log.user && log.user.toLowerCase().includes(q)) ||
                          (log.fileName && log.fileName.toLowerCase().includes(q)) ||
                          (log.action && log.action.toLowerCase().includes(q)) ||
                          (badge.label && badge.label.toLowerCase().includes(q)) ||
                          (log.device && log.device.toLowerCase().includes(q)) ||
                          (log.ip && log.ip.toLowerCase().includes(q))
                        );
                      }
                      return true;
                    });

                    if (logsLoading && activityLogs.length === 0) {
                      return (
                        <div className="p-12 text-center">
                          <Loader2 className="animate-spin text-[var(--accent)] mx-auto mb-3" size={28} />
                          <p className="text-sm font-medium text-[var(--text-main)]">Memuat Riwayat Aktivitas...</p>
                          <p className="text-xs text-[var(--text-muted)] mt-1">Mengambil data log audit dari sistem</p>
                        </div>
                      );
                    }

                    if (activityLogs.length === 0) {
                      return (
                        <div className="p-12 text-center">
                          <div className="w-14 h-14 rounded-2xl bg-[var(--accent)]/10 text-[var(--accent)] flex items-center justify-center mx-auto mb-3">
                            <History size={28} />
                          </div>
                          <p className="text-base font-bold text-[var(--text-main)]">Belum Ada Riwayat Aktivitas</p>
                          <p className="text-xs text-[var(--text-muted)] mt-1.5 max-w-sm mx-auto">
                            Aktivitas seperti login, melihat dokumen, mengunduh, mengganti nama, atau menghapus berkas akan otomatis tercatat di sini.
                          </p>
                        </div>
                      );
                    }

                    if (filteredLogs.length === 0) {
                      return (
                        <div className="p-10 text-center">
                          <Search size={30} className="text-slate-600 mx-auto mb-2 opacity-50" />
                          <p className="text-sm font-medium text-[var(--text-main)]">Tidak ada log yang cocok</p>
                          <p className="text-xs text-[var(--text-muted)] mt-1">Coba sesuaikan kata kunci pencarian atau kategori filter Anda</p>
                          <button 
                            onClick={() => { setLogSearchQuery(''); setLogCategoryFilter('ALL'); }}
                            className="mt-3 px-3 py-1.5 text-xs text-[var(--accent)] bg-[var(--accent)]/10 hover:bg-[var(--accent)]/20 rounded-lg transition-all"
                          >
                            Reset Filter
                          </button>
                        </div>
                      );
                    }

                    return (
                      <table className="w-full border-collapse">
                        <thead className="text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider sticky top-0 bg-[var(--bg-panel)] z-10 border-b border-[var(--border-line)]">
                          <tr>
                            <th className="p-3.5 text-left">Pengguna & Perangkat</th>
                            <th className="p-3.5 text-left">Aksi</th>
                            <th className="p-3.5 text-left">Nama Berkas / Keterangan</th>
                            <th className="p-3.5 text-left">Alamat IP</th>
                            <th className="p-3.5 text-right">Waktu</th>
                          </tr>
                        </thead>
                        <tbody className="text-xs text-[var(--text-muted)] divide-y divide-[var(--border-line)]">
                          {filteredLogs.map((log) => {
                            const badge = getActionBadge(log.action);
                            const BadgeIcon = badge.icon;
                            const isMobile = (log.device || '').includes('Android') || (log.device || '').includes('iPhone');

                            return (
                              <tr key={log.id} className="hover:bg-[var(--hover-fill)] transition-colors">
                                <td className="p-3.5">
                                  <div className="flex items-center gap-2.5">
                                    <div className="w-7 h-7 rounded-lg bg-[var(--accent)]/15 border border-[var(--accent-light)] flex items-center justify-center text-[var(--accent)] text-xs font-bold flex-shrink-0">
                                      {log.user?.charAt(0).toUpperCase() || '?'}
                                    </div>
                                    <div>
                                      <span className="text-[var(--text-main)] font-medium text-xs block">{log.user || 'Guest'}</span>
                                      <div className="flex items-center gap-1 text-[10px] text-slate-500 mt-0.5">
                                        {isMobile ? <Smartphone size={10} /> : <Monitor size={10} />}
                                        <span>{log.device || 'Desktop'}</span>
                                      </div>
                                    </div>
                                  </div>
                                </td>
                                <td className="p-3.5">
                                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-semibold border ${badge.color}`}>
                                    <BadgeIcon size={11} />
                                    <span>{badge.label}</span>
                                  </span>
                                </td>
                                <td className="p-3.5 max-w-sm truncate text-[var(--text-main)]" title={log.fileName}>
                                  <span className="font-normal text-xs">{log.fileName || '-'}</span>
                                </td>
                                <td className="p-3.5 font-mono text-[11px] text-slate-500">
                                  {log.ip || '127.0.0.1'}
                                </td>
                                <td className="p-3.5 text-right">
                                  <span className="text-[var(--text-main)] font-medium text-xs block">
                                    {formatLogRelativeTime(log.timestamp)}
                                  </span>
                                  <span className="text-[10px] text-slate-500 font-mono mt-0.5 block">
                                    {log.timestamp && log.timestamp.includes('T') 
                                      ? new Date(log.timestamp).toLocaleString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' })
                                      : log.timestamp}
                                  </span>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    );
                  })()}
                </div>

                {/* Modal Footer */}
                <div className="p-3.5 px-5 bg-black/20 border-t border-[var(--border-line)] flex items-center justify-between text-xs text-[var(--text-muted)]">
                  <span>
                    Menampilkan <strong className="text-[var(--text-main)] font-mono">{activityLogs.length}</strong> aktivitas terbaru
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Sistem Arsip Digital Irban III
                  </span>
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
                        <p className="text-xs text-red-400 mt-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-left leading-relaxed break-words">
                          {uploadErrorMessage || 'Terjadi kesalahan pada Google Drive saat mengunggah berkas.'}
                        </p>
                        <div className="flex gap-2 justify-center mt-5">
                          <button
                            type="button"
                            onClick={() => { setUploadStatus('idle'); setUploadErrorMessage(''); }}
                            className="px-4 py-2 bg-[var(--accent)] text-slate-950 font-bold rounded-xl text-xs hover:opacity-90 transition-opacity"
                          >
                            Coba Lagi
                          </button>
                          <button
                            type="button"
                            onClick={() => setIsUploadModalOpen(false)}
                            className="px-4 py-2 bg-[var(--hover-fill)] text-[var(--text-muted)] font-medium rounded-xl text-xs hover:text-[var(--text-main)] transition-colors"
                          >
                            Tutup
                          </button>
                        </div>
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
                  <button 
                    onClick={() => toggleFavorite(selectedFile.id, selectedFile.name)} 
                    className={`p-2.5 rounded-xl transition-all ${
                      favorites.has(selectedFile.id) 
                        ? 'bg-amber-500/20 text-amber-500 hover:bg-amber-500/30' 
                        : 'bg-[var(--hover-fill)] text-[var(--text-muted)] hover:text-amber-500'
                    }`} 
                    title={favorites.has(selectedFile.id) ? 'Hapus dari Favorit' : 'Tambah ke Favorit'}
                  >
                    <Star size={18} className={favorites.has(selectedFile.id) ? 'fill-amber-500 text-amber-500' : ''}/>
                  </button>
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
                  {userRole === 'admin' && (
                    <>
                      <button onClick={() => handleRename(selectedFile.id, selectedFile.name)} className="p-2.5 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 rounded-xl transition-all" title="Ganti Nama Berkas"><Edit2 size={18}/></button>
                      <button onClick={() => handleDelete(selectedFile.id, selectedFile.name)} className="p-2.5 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-xl transition-all" title="Hapus Berkas"><Trash2 size={18}/></button>
                    </>
                  )}
                  <button onClick={() => { addOnlineLog("DOWNLOAD", selectedFile.name); window.open(`https://drive.google.com/uc?export=download&id=${selectedFile.id}`, '_blank'); }} className="p-2.5 bg-[var(--accent)] rounded-xl text-slate-950 hover:bg-amber-400 transition-colors"><Download size={18}/></button>
                  <button onClick={() => { setSelectedFile(null); setPreviewLoading(true); setIsFocusMode(false); }} className="p-2.5 bg-[var(--hover-fill)] text-[var(--text-muted)] hover:text-[var(--text-main)] rounded-xl transition-all"><X size={18}/></button>
                </div>
              </div>
              
              {/* PREVIEW TAGS BAR */}
              <div className="px-6 py-2.5 bg-[var(--hover-fill)]/60 border-b border-[var(--border-line)] flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-1.5 flex-wrap min-w-0">
                  <span className="text-xs text-[var(--text-muted)] flex items-center gap-1 font-medium mr-1">
                    <Tag size={13} className="text-[var(--accent)]" /> Label:
                  </span>
                  {getFileTags(selectedFile).length === 0 ? (
                    <span className="text-xs text-[var(--text-muted)] italic">Belum ada label</span>
                  ) : (
                    getFileTags(selectedFile).map(tag => {
                      const style = getTagStyle(tag);
                      return (
                        <span
                          key={tag}
                          className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-0.5 rounded-full font-medium border ${style.bg} ${style.text} ${style.border}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`}></span>
                          {tag}
                          <button
                            onClick={() => {
                              const remaining = getFileTags(selectedFile).filter(t => t.toLowerCase() !== tag.toLowerCase());
                              handleSaveFileTags(selectedFile.id, selectedFile.name, remaining);
                            }}
                            title="Hapus label ini"
                            className="hover:opacity-70 ml-0.5 p-0.5 rounded-full"
                          >
                            <X size={11} />
                          </button>
                        </span>
                      );
                    })
                  )}
                </div>
                <button
                  onClick={() => openTagModal(selectedFile)}
                  className="text-xs text-[var(--accent)] hover:underline flex items-center gap-1 font-semibold px-2.5 py-1 rounded-lg hover:bg-[var(--accent)]/10 transition-colors"
                >
                  <Plus size={13} /> Kelola Label
                </button>
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
              className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md"
              onClick={() => setIsThemeModalOpen(false)}
            >
              <motion.div 
                initial={{ scale: 0.95, y: 15 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 15 }}
                className="bg-[var(--bg-panel)] border border-[var(--border-line)] w-full max-w-xl max-h-[90vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col relative" 
                onClick={e => e.stopPropagation()}
              >
                {/* Modal Header */}
                <div className="p-6 border-b border-[var(--border-line)] flex items-center justify-between bg-[var(--bg-panel-trans)]">
                  <div>
                    <h3 className="text-lg font-bold text-[var(--text-main)] flex items-center gap-2">
                      <Palette size={20} className="text-[var(--accent)]" /> Kustomisasi Tema & Tampilan
                    </h3>
                    <p className="text-xs text-[var(--text-muted)] mt-0.5">Personalisasi suasana warna, tata letak, dan gaya antarmuka</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => {
                        const accents = ['amber', 'blue', 'emerald', 'purple', 'rose', 'orange', 'teal', 'lime'];
                        const darkAtmos = ['default', 'oled', 'forest', 'slate'];
                        const lightAtmos = ['default', 'sepia'];
                        const randomDark = Math.random() > 0.35;
                        const randomAccent = accents[Math.floor(Math.random() * accents.length)];
                        const randomAtmos = randomDark 
                          ? darkAtmos[Math.floor(Math.random() * darkAtmos.length)]
                          : lightAtmos[Math.floor(Math.random() * lightAtmos.length)];
                        setIsDarkMode(randomDark);
                        setThemeColor(randomAccent);
                        setThemeAtmosphere(randomAtmos);
                        localStorage.setItem('isDarkMode', String(randomDark));
                        localStorage.setItem('themeColor', randomAccent);
                        localStorage.setItem('themeAtmosphere', randomAtmos);
                      }}
                      title="Acak Kombinasi Tema"
                      className="p-2 rounded-xl bg-[var(--hover-fill)] hover:bg-[var(--accent)] hover:text-slate-950 text-[var(--text-muted)] text-xs font-semibold flex items-center gap-1.5 transition-all"
                    >
                      <Sparkles size={14} className="text-[var(--accent)] group-hover:text-current" />
                      <span className="hidden sm:inline">Acak</span>
                    </button>
                    <button 
                      onClick={() => {
                        setIsDarkMode(true);
                        setThemeColor('amber');
                        setThemeAtmosphere('default');
                        setFontSize('md');
                        setGlassEffect(true);
                        setIsCompactMode(false);
                        localStorage.setItem('isDarkMode', 'true');
                        localStorage.setItem('themeColor', 'amber');
                        localStorage.setItem('themeAtmosphere', 'default');
                        localStorage.setItem('themeFontSize', 'md');
                        localStorage.setItem('themeGlassEffect', 'true');
                        localStorage.setItem('isCompactMode', 'false');
                      }}
                      title="Kembalikan ke Setelan Bawaan"
                      className="p-2 rounded-xl bg-[var(--hover-fill)] hover:bg-[var(--border-line)] text-[var(--text-muted)] text-xs transition-colors"
                    >
                      <RotateCw size={14} />
                    </button>
                    <button onClick={() => setIsThemeModalOpen(false)} className="p-2 bg-[var(--hover-fill)] hover:bg-[var(--border-line)] text-[var(--text-muted)] rounded-full transition-colors ml-1">
                      <X size={16} />
                    </button>
                  </div>
                </div>

                {/* Sub-Tabs */}
                <div className="px-6 pt-4 border-b border-[var(--border-line)] flex gap-4 bg-[var(--bg-main)]">
                  <button 
                    onClick={() => setThemeCustomTab('colors')} 
                    className={`pb-3 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 ${themeCustomTab === 'colors' ? 'border-[var(--accent)] text-[var(--accent)]' : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-main)]'}`}
                  >
                    <Palette size={14} /> Palet & Suasana
                  </button>
                  <button 
                    onClick={() => setThemeCustomTab('display')} 
                    className={`pb-3 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 ${themeCustomTab === 'display' ? 'border-[var(--accent)] text-[var(--accent)]' : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-main)]'}`}
                  >
                    <Monitor size={14} /> Tampilan & Aksesibilitas
                  </button>
                </div>

                {/* Modal Body */}
                <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-6">
                  {themeCustomTab === 'colors' ? (
                    <>
                      {/* Mode Terang / Gelap */}
                      <div>
                        <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider block mb-2.5">Mode Layar</label>
                        <div className="grid grid-cols-2 gap-3">
                          <button 
                            onClick={() => { setIsDarkMode(false); localStorage.setItem('isDarkMode', 'false'); }}
                            className={`p-3.5 rounded-2xl border transition-all flex items-center justify-center gap-3 ${!isDarkMode ? 'border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)] shadow-sm' : 'border-[var(--border-line)] text-[var(--text-muted)] hover:border-[var(--border-strong)]'}`}
                          >
                            <Sun size={20} className={!isDarkMode ? 'text-amber-500 fill-amber-500/20' : ''} />
                            <div className="text-left">
                              <p className="text-xs font-bold leading-tight">Mode Terang</p>
                              <p className="text-[10px] text-[var(--text-muted)] opacity-80">Siang hari & kontras cerah</p>
                            </div>
                          </button>
                          <button 
                            onClick={() => { setIsDarkMode(true); localStorage.setItem('isDarkMode', 'true'); }}
                            className={`p-3.5 rounded-2xl border transition-all flex items-center justify-center gap-3 ${isDarkMode ? 'border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)] shadow-sm' : 'border-[var(--border-line)] text-[var(--text-muted)] hover:border-[var(--border-strong)]'}`}
                          >
                            <Moon size={20} className={isDarkMode ? 'text-blue-400 fill-blue-400/20' : ''} />
                            <div className="text-left">
                              <p className="text-xs font-bold leading-tight">Mode Gelap</p>
                              <p className="text-[10px] text-[var(--text-muted)] opacity-80">Malam hari & nyaman di mata</p>
                            </div>
                          </button>
                        </div>
                      </div>

                      {/* Suasana Latar Belakang */}
                      <div>
                        <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider block mb-2.5">
                          Atmosfer Latar ({isDarkMode ? 'Nuansa Gelap' : 'Nuansa Terang'})
                        </label>
                        <div className="grid grid-cols-2 gap-2.5">
                          {(isDarkMode ? [
                            { id: 'default', name: 'Midnight Obsidian', desc: 'Biru navy dalam elegan', icon: '🌌', color: '#0c1220' },
                            { id: 'oled', name: 'Pure OLED Black', desc: 'Hitam murni 100% hemat daya', icon: '🖤', color: '#000000' },
                            { id: 'forest', name: 'Cyber Forest', desc: 'Hijau rimba pengawasan APIP', icon: '🌲', color: '#041210' },
                            { id: 'slate', name: 'Slate Titanium', desc: 'Abu-abu grafit eksekutif', icon: '🏛️', color: '#0f172a' }
                          ] : [
                            { id: 'default', name: 'Clean Modern', desc: 'Putih bersih modern', icon: '☀️', color: '#f8fafc' },
                            { id: 'sepia', name: 'Warm Paper Sepia', desc: 'Kertas arsip halus ramah mata', icon: '📜', color: '#fbf7ee' }
                          ]).map(atmos => (
                            <button
                              key={atmos.id}
                              onClick={() => {
                                setThemeAtmosphere(atmos.id);
                                localStorage.setItem('themeAtmosphere', atmos.id);
                              }}
                              className={`p-3 rounded-2xl border text-left transition-all flex items-center gap-3 ${themeAtmosphere === atmos.id ? 'border-[var(--accent)] bg-[var(--accent)]/10 shadow-sm' : 'border-[var(--border-line)] hover:border-[var(--border-strong)] bg-[var(--bg-main)]'}`}
                            >
                              <div className="w-8 h-8 rounded-xl border border-[var(--border-strong)] flex items-center justify-center text-sm shadow-inner flex-shrink-0" style={{ backgroundColor: atmos.color }}>
                                {atmos.icon}
                              </div>
                              <div className="min-w-0">
                                <p className={`text-xs font-bold truncate ${themeAtmosphere === atmos.id ? 'text-[var(--accent)]' : 'text-[var(--text-main)]'}`}>{atmos.name}</p>
                                <p className="text-[10px] text-[var(--text-muted)] truncate">{atmos.desc}</p>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* 8 Palet Warna Aksen */}
                      <div>
                        <div className="flex items-center justify-between mb-2.5">
                          <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">
                            Warna Aksen Aplikasi
                          </label>
                          <span className="text-[11px] font-semibold text-[var(--accent)] capitalize">
                            Terpilih: {themeColor}
                          </span>
                        </div>
                        <div className="grid grid-cols-4 gap-2.5">
                          {[
                            { id: 'amber', color: '#f59e0b', name: 'Amber', label: 'Emas Irban' },
                            { id: 'blue', color: '#3b82f6', name: 'Blue', label: 'Safir Laut' },
                            { id: 'emerald', color: '#10b981', name: 'Emerald', label: 'Zamrud Hijau' },
                            { id: 'purple', color: '#a855f7', name: 'Purple', label: 'Amethyst' },
                            { id: 'rose', color: '#f43f5e', name: 'Rose', label: 'Ruby Merah' },
                            { id: 'orange', color: '#f97316', name: 'Orange', label: 'Surya Oranye' },
                            { id: 'teal', color: '#06b6d4', name: 'Teal', label: 'Cyan Siber' },
                            { id: 'lime', color: '#84cc16', name: 'Lime', label: 'Neon Lime' },
                          ].map(t => (
                            <button
                              key={t.id}
                              onClick={() => {
                                setThemeColor(t.id);
                                localStorage.setItem('themeColor', t.id);
                              }}
                              className={`p-2.5 rounded-2xl border text-center transition-all flex flex-col items-center gap-1.5 ${themeColor === t.id ? 'border-[var(--accent)] bg-[var(--accent)]/10 shadow-md scale-[1.03]' : 'border-[var(--border-line)] hover:border-[var(--border-strong)] bg-[var(--bg-main)] hover:scale-[1.01]'}`}
                            >
                              <div 
                                className={`w-8 h-8 rounded-full shadow-md transition-transform flex items-center justify-center ${themeColor === t.id ? 'ring-2 ring-white/60 scale-105' : ''}`}
                                style={{ backgroundColor: t.color }}
                              >
                                {themeColor === t.id && <Check size={14} className="text-white drop-shadow" />}
                              </div>
                              <span className={`text-[10px] font-bold ${themeColor === t.id ? 'text-[var(--accent)]' : 'text-[var(--text-muted)]'}`}>
                                {t.label}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      {/* Skala Ukuran Font */}
                      <div>
                        <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider block mb-2.5">
                          Skala Ukuran Teks (Keterbacaan)
                        </label>
                        <div className="grid grid-cols-3 gap-3">
                          {[
                            { id: 'sm', name: 'Ringkas', size: '13px', desc: 'Banyak berkas' },
                            { id: 'md', name: 'Standar', size: '14px', desc: 'Seimbang ideal' },
                            { id: 'lg', name: 'Ekstra Besar', size: '16px', desc: 'Sangat nyaman' },
                          ].map(f => (
                            <button
                              key={f.id}
                              onClick={() => {
                                setFontSize(f.id as any);
                                localStorage.setItem('themeFontSize', f.id);
                              }}
                              className={`p-3.5 rounded-2xl border text-center transition-all ${fontSize === f.id ? 'border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)] shadow-sm' : 'border-[var(--border-line)] text-[var(--text-muted)] hover:border-[var(--border-strong)] bg-[var(--bg-main)]'}`}
                            >
                              <p className="text-base font-bold mb-0.5" style={{ fontSize: f.size }}>Aa</p>
                              <p className="text-xs font-bold">{f.name}</p>
                              <p className="text-[10px] text-[var(--text-muted)]">{f.desc}</p>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Kepadatan Antarmuka (Compact Mode) */}
                      <div className="p-4 rounded-2xl border border-[var(--border-line)] bg-[var(--bg-main)] flex items-center justify-between">
                        <div>
                          <p className="text-xs font-bold text-[var(--text-main)]">Mode Kepadatan Ringkas (Compact Layout)</p>
                          <p className="text-[10px] text-[var(--text-muted)] mt-0.5">Memadatkan jarak daftar arsip agar memuat lebih banyak baris dokumen di layar</p>
                        </div>
                        <button
                          onClick={() => {
                            const next = !isCompactMode;
                            setIsCompactMode(next);
                            localStorage.setItem('isCompactMode', String(next));
                          }}
                          className={`w-12 h-6 rounded-full transition-colors relative flex items-center px-1 ${isCompactMode ? 'bg-[var(--accent)]' : 'bg-[var(--border-strong)]'}`}
                        >
                          <motion.div 
                            layout 
                            className={`w-4 h-4 rounded-full bg-white shadow-sm ${isCompactMode ? 'ml-auto' : 'mr-auto'}`} 
                          />
                        </button>
                      </div>

                      {/* Efek Kaca Blur (Glassmorphism) */}
                      <div className="p-4 rounded-2xl border border-[var(--border-line)] bg-[var(--bg-main)] flex items-center justify-between">
                        <div>
                          <p className="text-xs font-bold text-[var(--text-main)]">Efek Transparansi Kaca (Glassmorphism)</p>
                          <p className="text-[10px] text-[var(--text-muted)] mt-0.5">Efek kaca buram (frosted blur) pada sidebar, header, dan drawer preview dokumen</p>
                        </div>
                        <button
                          onClick={() => {
                            const next = !glassEffect;
                            setGlassEffect(next);
                            localStorage.setItem('themeGlassEffect', String(next));
                          }}
                          className={`w-12 h-6 rounded-full transition-colors relative flex items-center px-1 ${glassEffect ? 'bg-[var(--accent)]' : 'bg-[var(--border-strong)]'}`}
                        >
                          <motion.div 
                            layout 
                            className={`w-4 h-4 rounded-full bg-white shadow-sm ${glassEffect ? 'ml-auto' : 'mr-auto'}`} 
                          />
                        </button>
                      </div>
                    </>
                  )}

                  {/* Interactive Live Preview Box */}
                  <div className="p-4 rounded-2xl border border-[var(--border-line)] bg-[var(--bg-main)] transition-all">
                    <div className="flex items-center justify-between mb-2.5">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-1.5">
                        <Eye size={13} className="text-[var(--accent)]" /> Pratinjau Interaktif Langsung
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--accent)]/10 text-[var(--accent)] font-semibold border border-[var(--accent-light)]">
                        Real-time
                      </span>
                    </div>
                    <div className="p-3.5 rounded-xl bg-[var(--bg-panel)] border border-[var(--border-line)] shadow-sm">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="p-2 rounded-lg bg-[var(--accent)]/15 text-[var(--accent)] flex-shrink-0">
                            <FileText size={18} />
                          </div>
                          <div className="min-w-0">
                            <h5 className="text-xs font-bold text-[var(--text-main)] truncate">LHP Evaluasi Kamaru-Wanci (700.1.2.1/044/2025).pdf</h5>
                            <p className="text-[10px] text-[var(--text-muted)] mt-0.5">Dokumen Resmi Inspektorat</p>
                          </div>
                        </div>
                        <span className="text-[10px] px-2 py-0.5 rounded-md font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex-shrink-0">
                          Final
                        </span>
                      </div>
                      <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-[var(--border-line)]">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] px-2 py-0.5 rounded-md font-medium bg-[var(--accent)]/10 text-[var(--accent)] border border-[var(--accent-light)]">
                            Ketaatan
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded-md font-medium bg-[var(--hover-fill)] text-[var(--text-muted)] border border-[var(--border-line)]">
                            2025
                          </span>
                        </div>
                        <button 
                          type="button"
                          className="px-3 py-1 rounded-lg text-xs font-semibold bg-[var(--accent)] text-[var(--accent-fg)] hover:opacity-90 transition-opacity"
                        >
                          Buka Berkas
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="p-4 border-t border-[var(--border-line)] flex items-center justify-between bg-[var(--bg-panel-trans)]">
                  <p className="text-[11px] text-[var(--text-muted)]">
                    Perubahan langsung disimpan ke peramban Anda
                  </p>
                  <button 
                    onClick={() => setIsThemeModalOpen(false)}
                    className="px-5 py-2 rounded-xl text-xs font-bold bg-[var(--accent)] text-[var(--accent-fg)] hover:opacity-90 transition-opacity shadow-sm"
                  >
                    Selesai
                  </button>
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

                      {/* KIRIM CEPAT KE WHATSAPP */}
                      <div className="border border-[#25D366]/30 bg-[#25D366]/5 rounded-2xl p-4 space-y-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-[#25D366]/15 flex items-center justify-center flex-shrink-0">
                            <svg viewBox="0 0 24 24" width="18" height="18" fill="#25D366"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-[#25D366]">Kirim Cepat ke WhatsApp</p>
                            <p className="text-[10px] text-[var(--text-muted)]">Pilih format pengiriman di bawah</p>
                          </div>
                        </div>

                        {/* Format Lengkap (Rekomendasi) */}
                        <button
                          onClick={() => {
                            const msg = `📋 *MEMO PENGIRIMAN DOKUMEN TERBATAS*\n` +
                              `━━━━━━━━━━━━━━━━━━━━━━\n` +
                              `🏛️ Inspektorat Daerah Prov. Sultra — Irban III\n\n` +
                              `📄 *Dokumen:*\n${shareModalFileName}\n\n` +
                              `🔐 *PIN Sekali Pakai:*\n${generatedPin}\n\n` +
                              `🔗 *Link Akses:*\n${generatedShareUrl}\n\n` +
                              `━━━━━━━━━━━━━━━━━━━━━━\n` +
                              `⚠️ *PERINGATAN KEAMANAN:*\n` +
                              `• PIN hanya berlaku 1x pakai\n` +
                              `• Tangkapan layar & rekaman DIBLOKIR\n` +
                              `• Dokumen dilindungi watermark forensik\n` +
                              `• Jangan sebarkan tanpa izin resmi\n` +
                              `━━━━━━━━━━━━━━━━━━━━━━`;
                            window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`, '_blank');
                            addOnlineLog("WHATSAPP_SHARE", `Format Lengkap: ${shareModalFileName}`);
                          }}
                          className="w-full bg-[#25D366] hover:bg-[#20BD5A] text-white py-3 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#25D366]/20"
                        >
                          <svg viewBox="0 0 24 24" width="16" height="16" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                          Kirim Format Lengkap (Rekomendasi)
                        </button>

                        {/* Sub-buttons: Tautan Saja & PIN Saja */}
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            onClick={() => {
                              const msg = `🔗 *Tautan Dokumen Terbatas*\n\n📄 ${shareModalFileName}\n\n${generatedShareUrl}\n\n_PIN akan dikirim terpisah._`;
                              window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`, '_blank');
                              addOnlineLog("WHATSAPP_SHARE", `Tautan Saja: ${shareModalFileName}`);
                            }}
                            className="bg-[#25D366]/10 hover:bg-[#25D366]/20 border border-[#25D366]/20 text-[#25D366] py-2.5 rounded-xl text-xs font-medium transition-all flex items-center justify-center gap-1.5"
                          >
                            <Share2 size={13} />
                            Kirim Tautan Saja
                          </button>
                          <button
                            onClick={() => {
                              const msg = `🔐 *PIN Dokumen Terbatas*\n\n📄 ${shareModalFileName}\n\nPIN: *${generatedPin}*\n\n⚠️ _Gunakan segera. PIN hanya berlaku 1x._`;
                              window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`, '_blank');
                              addOnlineLog("WHATSAPP_SHARE", `PIN Saja: ${shareModalFileName}`);
                            }}
                            className="bg-[#25D366]/10 hover:bg-[#25D366]/20 border border-[#25D366]/20 text-[#25D366] py-2.5 rounded-xl text-xs font-medium transition-all flex items-center justify-center gap-1.5"
                          >
                            <KeyRound size={13} />
                            Kirim PIN Saja
                          </button>
                        </div>

                        <p className="text-[10px] text-[var(--text-muted)] text-center">
                          💡 Untuk keamanan ekstra, kirim Tautan dan PIN secara terpisah
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* EXPORT EXCEL MODAL */}
        <AnimatePresence>
          {isExportModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }} 
                onClick={() => !exportLoading && setIsExportModalOpen(false)} 
                className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
              />
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 15 }} 
                animate={{ opacity: 1, scale: 1, y: 0 }} 
                exit={{ opacity: 0, scale: 0.95, y: 15 }} 
                className="relative w-full max-w-lg bg-[var(--bg-panel)] border border-[var(--border-line)] rounded-2xl shadow-2xl overflow-hidden p-6 z-10"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 flex-shrink-0">
                      <FileSpreadsheet size={20} />
                    </div>
                    <div>
                      <h3 className="font-bold text-[var(--text-main)] text-base">Ekspor Rekap Arsip ke Excel</h3>
                      <p className="text-xs text-[var(--text-muted)]">Unduh lembar kerja data arsip LHP berformat Excel (.csv UTF-8)</p>
                    </div>
                  </div>
                  <button 
                    disabled={exportLoading}
                    onClick={() => setIsExportModalOpen(false)} 
                    className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--hover-fill)] transition-colors"
                  >
                    <X size={18} />
                  </button>
                </div>

                {/* Body Options */}
                <div className="space-y-3 mb-6">
                  <label className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider block">Pilih Cakupan Rekapitulasi</label>

                  {/* Option 1: Tampilan Saat Ini */}
                  <div 
                    onClick={() => !exportLoading && setExportScope('current')}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${
                      exportScope === 'current'
                        ? 'bg-emerald-500/10 border-emerald-500/40 text-[var(--text-main)]'
                        : 'bg-[var(--hover-fill)] border-[var(--border-line)] text-[var(--text-muted)] hover:border-[var(--border-strong)]'
                    }`}
                  >
                    <input 
                      type="radio" 
                      name="exportScope" 
                      checked={exportScope === 'current'} 
                      onChange={() => setExportScope('current')}
                      className="mt-1 text-emerald-500 focus:ring-emerald-500" 
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-[var(--text-main)]">Tampilan Saat Ini ({filteredFilesMain.length} item)</p>
                      <p className="text-xs text-[var(--text-muted)] mt-0.5">
                        Merekap berkas pada {currentFolder ? (folderHistory[folderHistory.length - 1]?.name || 'folder ini') : 'layar beranda / filter aktif'}.
                      </p>
                    </div>
                  </div>

                  {/* Option 2: Seluruh Dokumen Sistem */}
                  <div 
                    onClick={() => !exportLoading && setExportScope('all')}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${
                      exportScope === 'all'
                        ? 'bg-emerald-500/10 border-emerald-500/40 text-[var(--text-main)]'
                        : 'bg-[var(--hover-fill)] border-[var(--border-line)] text-[var(--text-muted)] hover:border-[var(--border-strong)]'
                    }`}
                  >
                    <input 
                      type="radio" 
                      name="exportScope" 
                      checked={exportScope === 'all'} 
                      onChange={() => setExportScope('all')}
                      className="mt-1 text-emerald-500 focus:ring-emerald-500" 
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-[var(--text-main)]">Seluruh Arsip Sistem ({stats.total || 'Semua'} Berkas)</p>
                      <p className="text-xs text-[var(--text-muted)] mt-0.5">
                        Mengambil seluruh daftar dokumen dari Google Drive beserta pemetaan nama folder induknya.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Format Features Info */}
                <div className="bg-[var(--hover-fill)] p-3 rounded-xl border border-[var(--border-line)] mb-6 text-xs text-[var(--text-muted)] space-y-1">
                  <p className="font-medium text-[var(--text-main)] flex items-center gap-1.5">
                    <Check size={14} className="text-emerald-400" /> Kompatibel Penuh dengan Microsoft Excel & Google Sheets
                  </p>
                  <p className="text-[11px] text-slate-400">
                    File dilengkapi kop resmi Irban III Sultra, rincian ukuran, tanggal unggah, kategori format, serta tautan langsung ke berkas Google Drive.
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-3">
                  <button
                    disabled={exportLoading}
                    onClick={() => setIsExportModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl text-xs font-semibold text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--hover-fill)] transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    disabled={exportLoading}
                    onClick={() => handleExportExcel(exportScope)}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-md hover:shadow-emerald-600/20 disabled:opacity-50"
                  >
                    {exportLoading ? (
                      <>
                        <Loader2 size={15} className="animate-spin" />
                        <span>Mempersiapkan Data...</span>
                      </>
                    ) : exportSuccess ? (
                      <>
                        <CheckCircle2 size={15} className="text-white" />
                        <span>Berhasil Diunduh!</span>
                      </>
                    ) : (
                      <>
                        <Download size={15} />
                        <span>Unduh File Excel (.csv)</span>
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* TAG MODAL */}
        <AnimatePresence>
          {isTagModalOpen && tagModalFile && (
            <div className="fixed inset-0 z-[250] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
              <motion.div 
                initial={{ scale: 0.95, opacity: 0, y: 15 }} 
                animate={{ scale: 1, opacity: 1, y: 0 }} 
                exit={{ scale: 0.95, opacity: 0, y: 15 }}
                className="bg-[var(--bg-panel)] rounded-2xl p-6 sm:p-7 w-full max-w-md border border-[var(--border-line)] shadow-2xl relative"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-5">
                  <div className="flex items-center gap-3 min-w-0 pr-3">
                    <div className="w-10 h-10 rounded-xl bg-[var(--accent)]/10 flex items-center justify-center text-[var(--accent)] flex-shrink-0">
                      <Tag size={20} />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-base font-bold text-[var(--text-main)]">Kelola Label Dokumen</h3>
                      <p className="text-xs text-[var(--text-muted)] truncate max-w-[260px] sm:max-w-[300px]" title={tagModalFile.name}>
                        {tagModalFile.name}
                      </p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setIsTagModalOpen(false)} 
                    className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--hover-fill)] transition-colors"
                  >
                    <X size={18} />
                  </button>
                </div>

                {/* Section 1: Label Aktif */}
                <div className="mb-5">
                  <label className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider block mb-2">
                    Label Aktif Saat Ini
                  </label>
                  {getFileTags(tagModalFile).length === 0 ? (
                    <p className="text-xs text-slate-500 italic bg-[var(--hover-fill)] p-3 rounded-xl border border-[var(--border-line)]">
                      Belum ada label. Pilih dari label rekomendasi di bawah atau ketik label baru.
                    </p>
                  ) : (
                    <div className="flex flex-wrap gap-1.5 p-3 rounded-xl bg-[var(--hover-fill)] border border-[var(--border-line)]">
                      {getFileTags(tagModalFile).map(tag => {
                        const style = getTagStyle(tag);
                        return (
                          <span
                            key={tag}
                            className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium border ${style.bg} ${style.text} ${style.border}`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`}></span>
                            {tag}
                            <button
                              disabled={tagSaving}
                              onClick={() => {
                                const current = getFileTags(tagModalFile);
                                const updated = current.filter(t => t.toLowerCase() !== tag.toLowerCase());
                                handleSaveFileTags(tagModalFile.id, tagModalFile.name, updated);
                              }}
                              className="hover:opacity-75 p-0.5 rounded-full"
                              title="Hapus label"
                            >
                              <X size={12} />
                            </button>
                          </span>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Section 2: Rekomendasi Label Cepat */}
                <div className="mb-5">
                  <label className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider block mb-2">
                    Pilihan Label Standar
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {PRESET_TAGS.map(pt => {
                      const active = getFileTags(tagModalFile).some(t => t.toLowerCase() === pt.label.toLowerCase());
                      return (
                        <button
                          key={pt.label}
                          type="button"
                          disabled={tagSaving}
                          onClick={() => {
                            const current = getFileTags(tagModalFile);
                            let updated: string[];
                            if (active) {
                              updated = current.filter(t => t.toLowerCase() !== pt.label.toLowerCase());
                            } else {
                              updated = [...current, pt.label];
                            }
                            handleSaveFileTags(tagModalFile.id, tagModalFile.name, updated);
                          }}
                          className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium border transition-all text-left ${
                            active
                              ? `${pt.bg} ${pt.text} ${pt.border} ring-2 ring-[var(--accent)]/40 font-semibold shadow-sm`
                              : 'bg-[var(--hover-fill)] text-[var(--text-muted)] hover:text-[var(--text-main)] border-[var(--border-line)] hover:border-[var(--border-strong)]'
                          }`}
                        >
                          <span className="flex items-center gap-1.5 truncate">
                            <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${pt.dot}`}></span>
                            {pt.label}
                          </span>
                          {active && <Check size={13} className="flex-shrink-0 ml-1" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Section 2.5: Riwayat Label Kustom */}
                {customTagHistory.length > 0 && (
                  <div className="mb-5">
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider block">
                        Riwayat Label Kustom ({customTagHistory.length})
                      </label>
                      <span className="text-[10px] text-slate-500">Klik untuk langsung menerapkan</span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-36 overflow-y-auto custom-scrollbar p-0.5">
                      {customTagHistory.map(tag => {
                        const active = getFileTags(tagModalFile).some(t => t.toLowerCase() === tag.toLowerCase());
                        const style = getTagStyle(tag);
                        return (
                          <div
                            key={tag}
                            className={`flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                              active
                                ? `${style.bg} ${style.text} ${style.border} ring-2 ring-[var(--accent)]/40 font-semibold shadow-sm`
                                : 'bg-[var(--hover-fill)] text-[var(--text-muted)] hover:text-[var(--text-main)] border-[var(--border-line)] hover:border-[var(--border-strong)]'
                            }`}
                          >
                            <button
                              type="button"
                              disabled={tagSaving}
                              onClick={() => {
                                const current = getFileTags(tagModalFile);
                                let updated: string[];
                                if (active) {
                                  updated = current.filter(t => t.toLowerCase() !== tag.toLowerCase());
                                } else {
                                  updated = [...current, tag];
                                }
                                handleSaveFileTags(tagModalFile.id, tagModalFile.name, updated);
                              }}
                              className="flex items-center gap-1.5 truncate flex-1 text-left py-0.5"
                            >
                              <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${style.dot}`}></span>
                              <span className="truncate">{tag}</span>
                              {active && <Check size={12} className="flex-shrink-0 ml-1 text-emerald-400" />}
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                removeCustomTagFromHistory(tag);
                              }}
                              title="Hapus dari daftar riwayat label"
                              className="p-1 hover:text-red-400 text-slate-500 rounded-lg hover:bg-[var(--hover-fill)] transition-colors ml-1"
                            >
                              <Trash2 size={11} />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Section 3: Tambah Label Kustom */}
                <div className="mb-6">
                  <label className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider block mb-2">
                    Buat Label Kustom Baru
                  </label>
                  <form 
                    onSubmit={(e) => {
                      e.preventDefault();
                      const trimmed = customTagInput.trim();
                      if (!trimmed) return;
                      const current = getFileTags(tagModalFile);
                      if (!current.some(t => t.toLowerCase() === trimmed.toLowerCase())) {
                        handleSaveFileTags(tagModalFile.id, tagModalFile.name, [...current, trimmed]);
                      }
                      saveCustomTagToHistory(trimmed);
                      setCustomTagInput('');
                    }}
                    className="flex gap-2"
                  >
                    <input 
                      type="text"
                      placeholder="Contoh: BPK 2024, Rahasia Khusus..."
                      value={customTagInput}
                      onChange={(e) => setCustomTagInput(e.target.value)}
                      className="flex-1 bg-white/[0.04] border border-[var(--border-line)] rounded-xl py-2 px-3 text-xs text-[var(--text-main)] focus:border-[var(--accent)] outline-none transition-colors placeholder:text-slate-600"
                    />
                    <button
                      type="submit"
                      disabled={!customTagInput.trim() || tagSaving}
                      className="px-3.5 py-2 bg-[var(--accent)] text-[var(--accent-fg)] rounded-xl text-xs font-semibold hover:opacity-90 disabled:opacity-40 transition-opacity flex items-center gap-1 flex-shrink-0"
                    >
                      <Plus size={14} /> Tambah
                    </button>
                  </form>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-3 border-t border-[var(--border-line)]">
                  <span className="text-[11px] text-[var(--text-muted)] flex items-center gap-1.5">
                    {tagSaving ? (
                      <>
                        <Loader2 size={12} className="animate-spin text-[var(--accent)]" /> Menyimpan label ke Google Drive...
                      </>
                    ) : (
                      <>
                        <Check size={12} className="text-emerald-400" /> Tersinkron otomatis
                      </>
                    )}
                  </span>
                  <button
                    onClick={() => setIsTagModalOpen(false)}
                    className="px-4 py-2 bg-[var(--hover-fill)] hover:bg-[var(--border-line)] text-xs font-semibold text-[var(--text-main)] rounded-xl transition-colors"
                  >
                    Selesai
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* RECENTLY VIEWED MODAL */}
        <AnimatePresence>
          {isRecentModalOpen && (
            <div className="fixed inset-0 z-[250] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
              <motion.div 
                initial={{ scale: 0.95, opacity: 0, y: 15 }} 
                animate={{ scale: 1, opacity: 1, y: 0 }} 
                exit={{ scale: 0.95, opacity: 0, y: 15 }}
                className="bg-[var(--bg-panel)] rounded-2xl p-6 sm:p-7 w-full max-w-lg border border-[var(--border-line)] shadow-2xl relative max-h-[85vh] flex flex-col"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header */}
                <div className="flex items-start justify-between pb-3 border-b border-[var(--border-line)]">
                  <div className="flex items-center gap-3 min-w-0 pr-3">
                    <div className="w-10 h-10 rounded-xl bg-sky-500/10 flex items-center justify-center text-sky-500 flex-shrink-0">
                      <Clock size={20} />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-base font-bold text-[var(--text-main)]">Riwayat Terakhir Dibuka</h3>
                      <p className="text-xs text-[var(--text-muted)]">
                        {recentlyViewed.length} berkas yang baru saja Anda buka
                      </p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setIsRecentModalOpen(false)} 
                    className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--hover-fill)] transition-colors"
                  >
                    <X size={18} />
                  </button>
                </div>

                {/* Banner Alih ke Audit Trail Lengkap */}
                <div className="mt-3 p-3 bg-[var(--accent)]/10 border border-[var(--accent-light)] rounded-xl flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <History size={16} className="text-[var(--accent)] flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="font-semibold text-[var(--text-main)] text-xs truncate">Ingin Audit Trail & Catatan Lengkap?</p>
                      <p className="text-[11px] text-[var(--text-muted)] truncate">Termasuk pencarian nama riwayat, alamat IP, perangkat, & sesi login</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setIsRecentModalOpen(false);
                      setIsLogModalOpen(true);
                      fetchOnlineLogs();
                    }}
                    className="px-3 py-1.5 bg-[var(--accent)] text-slate-950 font-bold rounded-lg text-xs hover:bg-amber-400 transition-all shadow-sm flex-shrink-0"
                  >
                    Buka Audit Trail &rarr;
                  </button>
                </div>

                {/* Pencarian Dokumen Terakhir */}
                {recentlyViewed.length > 3 && (
                  <div className="relative mt-3">
                    <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                    <input
                      type="text"
                      value={recentSearchQuery}
                      onChange={(e) => setRecentSearchQuery(e.target.value)}
                      placeholder="Cari nama riwayat berkas..."
                      className="w-full pl-8 pr-3 py-1.5 bg-white/[0.03] border border-[var(--border-line)] rounded-lg text-xs text-[var(--text-main)] placeholder-[var(--text-muted)] outline-none focus:border-sky-500 transition-all"
                    />
                  </div>
                )}

                {/* List Container */}
                <div className="flex-1 overflow-y-auto py-3 space-y-2 pr-1 my-1">
                  {(() => {
                    const filteredRecent = recentlyViewed.filter(item => 
                      !recentSearchQuery.trim() || item.name.toLowerCase().includes(recentSearchQuery.toLowerCase())
                    );
                    if (recentlyViewed.length === 0) {
                      return (
                        <div className="text-center py-12">
                          <Clock size={36} className="text-slate-600 mx-auto mb-3 opacity-40" />
                          <p className="text-sm font-semibold text-[var(--text-muted)]">Belum Ada Riwayat</p>
                          <p className="text-xs text-[var(--text-muted)] mt-1">Dokumen yang Anda buka dan pratinjau akan otomatis tercatat di sini.</p>
                        </div>
                      );
                    }
                    if (filteredRecent.length === 0) {
                      return (
                        <div className="text-center py-8">
                          <Search size={28} className="text-slate-600 mx-auto mb-2 opacity-40" />
                          <p className="text-xs font-semibold text-[var(--text-muted)]">Tidak ditemukan riwayat berkas</p>
                        </div>
                      );
                    }
                    return filteredRecent.map((item) => {
                      const isFav = favorites.has(item.id);
                      return (
                        <div
                          key={item.id}
                          className="flex items-center justify-between p-3 rounded-xl bg-[var(--hover-fill)]/70 hover:bg-[var(--hover-fill)] border border-[var(--border-line)] transition-all group cursor-pointer"
                          onClick={() => {
                            const fullFile = files.find(f => f.id === item.id) 
                              || searchResults.find(f => f.id === item.id) 
                              || { id: item.id, name: item.name, mimeType: item.mimeType };
                            handleFileSelect(fullFile);
                            setIsRecentModalOpen(false);
                          }}
                        >
                          <div className="flex items-center gap-3 min-w-0 pr-3">
                            <div className="p-2 rounded-lg bg-[var(--bg-panel)] text-[var(--text-muted)] group-hover:text-sky-500 transition-colors flex-shrink-0">
                              <FileText size={18} />
                            </div>
                            <div className="min-w-0">
                              <h4 className="text-xs sm:text-sm font-medium text-[var(--text-main)] truncate group-hover:text-sky-500 transition-colors" title={item.name}>
                                {item.name}
                              </h4>
                              <p className="text-[10px] text-[var(--text-muted)] flex items-center gap-1.5 mt-0.5">
                                <span className="inline-block w-1.5 h-1.5 rounded-full bg-sky-500/70"></span>
                                {formatRelativeTime(item.viewedAt)}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-1 flex-shrink-0">
                            {/* Star button */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleFavorite(item.id, item.name);
                              }}
                              title={isFav ? "Hapus dari Favorit" : "Tambah ke Favorit"}
                              className={`p-2 rounded-lg transition-all ${
                                isFav
                                  ? 'text-amber-500 bg-amber-500/10'
                                  : 'text-[var(--text-muted)] hover:text-amber-500 hover:bg-[var(--hover-fill)]'
                              }`}
                            >
                              <Star size={14} className={isFav ? 'fill-amber-500 text-amber-500' : ''} />
                            </button>
                            {/* Open button */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                const fullFile = files.find(f => f.id === item.id) 
                                  || searchResults.find(f => f.id === item.id) 
                                  || { id: item.id, name: item.name, mimeType: item.mimeType };
                                handleFileSelect(fullFile);
                                setIsRecentModalOpen(false);
                              }}
                              className="px-2.5 py-1.5 bg-sky-500/10 hover:bg-sky-500/20 text-sky-500 rounded-lg text-xs font-semibold transition-all"
                            >
                              Buka
                            </button>
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>

                {/* Footer */}
                {recentlyViewed.length > 0 && (
                  <div className="pt-3 border-t border-[var(--border-line)] flex items-center justify-between">
                    <span className="text-[11px] text-[var(--text-muted)]">
                      Tersimpan otomatis di peramban
                    </span>
                    <button
                      onClick={clearRecentlyViewed}
                      className="text-xs text-rose-500 hover:text-rose-400 hover:underline flex items-center gap-1 transition-colors font-medium px-2 py-1"
                    >
                      <Trash2 size={13} />
                      Bersihkan Riwayat
                    </button>
                  </div>
                )}
              </motion.div>
            </div>
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