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
  RotateCw, Sliders, Volume2, VolumeX, Zap, Flame,
  BookOpen, Scale, Bookmark, ExternalLink,
  Building2, Landmark, ChevronDown, CheckCheck, Settings,
  ClipboardCheck, CheckSquare, FileCheck, BadgeCheck, Printer, Square,
  FolderPlus, FolderInput, AlertTriangle
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

export interface OpdItem {
  id: string;
  code: string;
  name: string;
  category: 'Dinas' | 'Badan' | 'RSUD' | 'Sekretariat' | 'Lainnya';
  aliases: string[];
  isBinaanIrban3?: boolean;
}

export const DEFAULT_OPD_SULTRA: OpdItem[] = [
  {
    id: 'dikbud',
    code: 'Dikbud',
    name: 'Dinas Pendidikan dan Kebudayaan',
    category: 'Dinas',
    aliases: ['dikbud', 'pendidikan', 'kebudayaan', 'disdik', 'sekolah', 'guru', 'sma', 'smk', 'slb'],
    isBinaanIrban3: true,
  },
  {
    id: 'dinkes',
    code: 'Dinkes',
    name: 'Dinas Kesehatan',
    category: 'Dinas',
    aliases: ['dinkes', 'kesehatan', 'yankes', 'puskesmas', 'p2p', 'kesmas', 'farmasi'],
    isBinaanIrban3: true,
  },
  {
    id: 'pupr',
    code: 'DSDABM / PUPR',
    name: 'Dinas Sumber Daya Air & Bina Marga',
    category: 'Dinas',
    aliases: ['pupr', 'bina marga', 'sda', 'jalan', 'jembatan', 'irigasi', 'dsdabm', 'konstruksi'],
    isBinaanIrban3: true,
  },
  {
    id: 'cipta-karya',
    code: 'Cipta Karya & PKP',
    name: 'Dinas Perumahan Rakyat, Kawasan Permukiman dan Cipta Karya',
    category: 'Dinas',
    aliases: ['cipta karya', 'perkim', 'perumahan', 'permukiman', 'tata ruang', 'pkp'],
    isBinaanIrban3: true,
  },
  {
    id: 'rsud-bahteramas',
    code: 'RSUD Bahteramas',
    name: 'RSUD Bahteramas Provinsi Sultra',
    category: 'RSUD',
    aliases: ['bahteramas', 'rsud bahteramas', 'rumah sakit bahteramas', 'rsud'],
    isBinaanIrban3: true,
  },
  {
    id: 'rs-jantung',
    code: 'RS Jantung',
    name: 'RS Jantung, Pembuluh Darah & Otak Oputa Yi Koo',
    category: 'RSUD',
    aliases: ['oputa yi koo', 'rs jantung', 'jantung', 'oputa'],
    isBinaanIrban3: true,
  },
  {
    id: 'rsj',
    code: 'RS Jiwa',
    name: 'Rumah Sakit Jiwa Prov. Sultra',
    category: 'RSUD',
    aliases: ['rs jiwa', 'rsj', 'kejiwaan'],
    isBinaanIrban3: false,
  },
  {
    id: 'bappeda',
    code: 'Bappeda',
    name: 'Badan Perencanaan Pembangunan Daerah',
    category: 'Badan',
    aliases: ['bappeda', 'perencanaan', 'rkpd', 'rpjmd', 'litbang'],
    isBinaanIrban3: true,
  },
  {
    id: 'bpkad',
    code: 'BPKAD',
    name: 'Badan Pengelolaan Keuangan dan Aset Daerah',
    category: 'Badan',
    aliases: ['bpkad', 'keuangan daerah', 'aset daerah', 'kasda', 'bud', 'bmd'],
    isBinaanIrban3: true,
  },
  {
    id: 'bapenda',
    code: 'Bapenda',
    name: 'Badan Pendapatan Daerah',
    category: 'Badan',
    aliases: ['bapenda', 'pendapatan', 'pajak daerah', 'retribusi', 'samsat'],
    isBinaanIrban3: false,
  },
  {
    id: 'bkd',
    code: 'BKD',
    name: 'Badan Kepegawaian Daerah',
    category: 'Badan',
    aliases: ['bkd', 'kepegawaian', 'asn', 'mutasi', 'pns'],
    isBinaanIrban3: false,
  },
  {
    id: 'bpsdm',
    code: 'BPSDM',
    name: 'Badan Pengembangan Sumber Daya Manusia',
    category: 'Badan',
    aliases: ['bpsdm', 'diklat', 'pelatihan'],
    isBinaanIrban3: false,
  },
  {
    id: 'dinsos',
    code: 'Dinsos',
    name: 'Dinas Sosial',
    category: 'Dinas',
    aliases: ['dinsos', 'sosial', 'bansos', 'pkh', 'kemiskinan'],
    isBinaanIrban3: true,
  },
  {
    id: 'disnakertrans',
    code: 'Disnakertrans',
    name: 'Dinas Tenaga Kerja dan Transmigrasi',
    category: 'Dinas',
    aliases: ['disnaker', 'tenaga kerja', 'transmigrasi', 'disnakertrans', 'ketenagakerjaan'],
    isBinaanIrban3: false,
  },
  {
    id: 'dlh',
    code: 'DLH',
    name: 'Dinas Lingkungan Hidup',
    category: 'Dinas',
    aliases: ['dlh', 'lingkungan hidup', 'amdal', 'kebersihan', 'sampah'],
    isBinaanIrban3: false,
  },
  {
    id: 'dishub',
    code: 'Dishub',
    name: 'Dinas Perhubungan',
    category: 'Dinas',
    aliases: ['dishub', 'perhubungan', 'lalu lintas', 'pelabuhan', 'terminal'],
    isBinaanIrban3: false,
  },
  {
    id: 'diskominfo',
    code: 'Diskominfo',
    name: 'Dinas Komunikasi, Informatika, Statistik dan Persandian',
    category: 'Dinas',
    aliases: ['kominfo', 'diskominfo', 'informatika', 'statistik', 'persandian'],
    isBinaanIrban3: true,
  },
  {
    id: 'dpmptsp',
    code: 'DPMPTSP',
    name: 'Dinas Penanaman Modal & PTSP',
    category: 'Dinas',
    aliases: ['dpmptsp', 'perizinan', 'investasi', 'penanaman modal', 'ptsp'],
    isBinaanIrban3: false,
  },
  {
    id: 'dispora',
    code: 'Dispora',
    name: 'Dinas Pemuda dan Olahraga',
    category: 'Dinas',
    aliases: ['dispora', 'pemuda', 'olahraga', 'stadion', 'koni'],
    isBinaanIrban3: false,
  },
  {
    id: 'dkp',
    code: 'DKP',
    name: 'Dinas Kelautan dan Perikanan',
    category: 'Dinas',
    aliases: ['dkp', 'kelautan', 'perikanan', 'nelayan', 'tambak'],
    isBinaanIrban3: false,
  },
  {
    id: 'dispar',
    code: 'Dispar',
    name: 'Dinas Pariwisata',
    category: 'Dinas',
    aliases: ['dispar', 'pariwisata', 'wisata', 'destinasi'],
    isBinaanIrban3: false,
  },
  {
    id: 'distan',
    code: 'Distanak',
    name: 'Dinas Tanaman Pangan dan Peternakan',
    category: 'Dinas',
    aliases: ['pertanian', 'peternakan', 'distan', 'pangan', 'distanpt'],
    isBinaanIrban3: false,
  },
  {
    id: 'dishut',
    code: 'Dishut',
    name: 'Dinas Kehutanan',
    category: 'Dinas',
    aliases: ['dishut', 'kehutanan', 'hutan', 'kph'],
    isBinaanIrban3: false,
  },
  {
    id: 'esdm',
    code: 'Dinas ESDM',
    name: 'Dinas Energi dan Sumber Daya Mineral',
    category: 'Dinas',
    aliases: ['esdm', 'energi', 'mineral', 'tambang', 'kelistrikan'],
    isBinaanIrban3: false,
  },
  {
    id: 'disperindag',
    code: 'Disperindag',
    name: 'Dinas Perindustrian dan Perdagangan',
    category: 'Dinas',
    aliases: ['disperindag', 'perindustrian', 'perdagangan', 'pasar', 'ukm', 'industri'],
    isBinaanIrban3: false,
  },
  {
    id: 'dpmd',
    code: 'DPMD',
    name: 'Dinas Pemberdayaan Masyarakat dan Desa',
    category: 'Dinas',
    aliases: ['dpmd', 'desa', 'masyarakat desa', 'pemberdayaan desa'],
    isBinaanIrban3: false,
  },
  {
    id: 'bpbd',
    code: 'BPBD',
    name: 'Badan Penanggulangan Bencana Daerah',
    category: 'Badan',
    aliases: ['bpbd', 'bencana', 'tanggap darurat', 'kebakaran'],
    isBinaanIrban3: false,
  },
  {
    id: 'satpol-pp',
    code: 'Satpol PP',
    name: 'Satuan Polisi Pamong Praja',
    category: 'Lainnya',
    aliases: ['satpol', 'pol pp', 'satpol pp', 'pamong praja', 'perda'],
    isBinaanIrban3: false,
  },
  {
    id: 'sekda',
    code: 'Sekretariat Daerah',
    name: 'Sekretariat Daerah Prov. Sultra',
    category: 'Sekretariat',
    aliases: ['setda', 'sekda', 'biro umum', 'biro hukum', 'biro perekonomian', 'biro adbang', 'biro pengadaan', 'ulp', 'biro'],
    isBinaanIrban3: false,
  },
  {
    id: 'sekwan',
    code: 'Sekretariat DPRD',
    name: 'Sekretariat DPRD Prov. Sultra',
    category: 'Sekretariat',
    aliases: ['sekwan', 'dprd', 'dewan'],
    isBinaanIrban3: false,
  },
  {
    id: 'inspektorat',
    code: 'Inspektorat',
    name: 'Inspektorat Daerah Prov. Sultra',
    category: 'Lainnya',
    aliases: ['inspektorat', 'irban', 'apip', 'sekretariat inspektorat'],
    isBinaanIrban3: true,
  }
];

export interface GlossaryItem {
  id: string;
  term: string;
  fullTitle: string;
  category: 'Keuangan' | 'Pengadaan' | 'APIP' | 'Hukum & Sanksi';
  definition: string;
  legalBasis: string;
  significance: string;
  tags: string[];
}

export const GLOSSARY_DATABASE: GlossaryItem[] = [
  {
    id: 'tgr',
    term: 'TGR',
    fullTitle: 'Tuntutan Ganti Rugi',
    category: 'Hukum & Sanksi',
    definition: 'Suatu proses tuntutan yang dilakukan terhadap pegawai negeri atau pejabat pengelola keuangan daerah dengan tujuan untuk memulihkan kerugian daerah/negara akibat perbuatan melanggar hukum atau kelalaian dalam pelaksanaan tugas.',
    legalBasis: 'UU No. 1 Tahun 2004 tentang Perbendaharaan Negara (Pasal 59-63); Permendagri No. 133 Tahun 2018 tentang Penyelesaian Tuntutan Ganti Kerugian Daerah.',
    significance: 'Instrumen hukum pemulihan kas daerah dari temuan kekurangan volume fisik, ketekoran kas, atau kelebihan pembayaran dalam LHP.',
    tags: ['Kerugian Negara', 'Kas Daerah', 'SKTJM', 'Pengembalian']
  },
  {
    id: 'lhp',
    term: 'LHP',
    fullTitle: 'Laporan Hasil Pemeriksaan',
    category: 'APIP',
    definition: 'Dokumen resmi yang diterbitkan oleh pemeriksa (BPK atau APIP/Inspektorat) yang memuat simpulan, temuan hasil pengujian sistem pengendalian intern, kepatuhan terhadap perundang-undangan, dan rekomendasi perbaikan.',
    legalBasis: 'UU No. 15 Tahun 2004 tentang Pemeriksaan Pengelolaan dan Tanggung Jawab Keuangan Negara; Standar Audit Intern Pemerintah Indonesia (SAIPI).',
    significance: 'Dokumen rujukan utama dalam audit yang menjadi dasar pelaksanaan tindak lanjut dan pengawasan kepatuhan entitas terperiksa.',
    tags: ['BPK', 'Inspektorat', 'Audit', 'Temuan', 'Rekomendasi']
  },
  {
    id: 'nhpt',
    term: 'NHPT',
    fullTitle: 'Naskah Hasil Pemeriksaan Sementara',
    category: 'APIP',
    definition: 'Naskah kerja audit yang memuat temuan sementara untuk dikonfirmasikan dan dibahas bersama entitas auditi sebelum difinalisasi dan diterbitkan menjadi LHP.',
    legalBasis: 'Standar Audit Intern Pemerintah Indonesia (SAIPI); Peraturan BPKP No. 5 Tahun 2021 tentang Pedoman Pengawasan Intern.',
    significance: 'Memberikan ruang formal bagi auditi untuk memberikan klarifikasi, bukti sanggahan, atau koreksi faktual sebelum simpulan akhir ditetapkan.',
    tags: ['Draft Audit', 'Klarifikasi', 'Exit Meeting', 'Tanggapan']
  },
  {
    id: 'silpa',
    term: 'SiLPA',
    fullTitle: 'Sisa Lebih Pembiayaan Anggaran',
    category: 'Keuangan',
    definition: 'Selisih lebih antara realisasi penerimaan dan pengeluaran APBD selama satu tahun anggaran berkenaan ditambah dengan pembiayaan neto setelah dilakukan penutupan buku anggaran.',
    legalBasis: 'PP No. 12 Tahun 2019 tentang Pengelolaan Keuangan Daerah (Pasal 155-156); Permendagri No. 77 Tahun 2020.',
    significance: 'Komponen penting dalam audit laporan keuangan daerah untuk menguji akurasi saldo kas akhir dan kepatuhan penganggaran tahun berikutnya.',
    tags: ['APBD', 'Kas Daerah', 'Akuntansi', 'Penutupan Buku']
  },
  {
    id: 'spip',
    term: 'SPIP',
    fullTitle: 'Sistem Pengendalian Intern Pemerintah',
    category: 'APIP',
    definition: 'Proses yang integral pada tindakan dan kegiatan yang dilakukan terus-menerus oleh pimpinan dan pegawai untuk memberikan keyakinan memadai atas tercapainya efektivitas dan efisiensi, keandalan pelaporan keuangan, pengamanan aset negara, dan ketaatan regulasi.',
    legalBasis: 'PP No. 60 Tahun 2008 tentang Sistem Pengendalian Intern Pemerintah; Peraturan BPKP No. 5 Tahun 2021.',
    significance: 'Tingkat maturitas SPIP menjadi parameter utama dalam menilai ketahanan tata kelola OPD terhadap risiko korupsi dan inefisiensi anggaran.',
    tags: ['Maturitas', 'Manajemen Risiko', 'Pengendalian', 'Tata Kelola']
  },
  {
    id: 'ssh',
    term: 'SSH',
    fullTitle: 'Standar Satuan Harga',
    category: 'Pengadaan',
    definition: 'Harga satuan batas tertinggi yang ditetapkan oleh Kepala Daerah untuk setiap komponen barang/jasa sebagai pedoman penyusunan Rencana Kerja dan Anggaran (RKA-SKPD).',
    legalBasis: 'PP No. 12 Tahun 2019 tentang Pengelolaan Keuangan Daerah (Pasal 51); Permendagri No. 77 Tahun 2020 Lampiran Bab II.',
    significance: 'Tolok ukur utama pemeriksa dalam menguji kewajaran penganggaran dan mendeteksi potensi pemborosan atau penggelembungan harga belanja.',
    tags: ['RKA', 'APBD', 'Batas Tertinggi', 'Kewajaran Harga']
  },
  {
    id: 'asb',
    term: 'ASB',
    fullTitle: 'Analisis Standar Belanja',
    category: 'Keuangan',
    definition: 'Standar untuk menilai kewajaran atas beban kerja dan biaya yang digunakan untuk melaksanakan suatu kegiatan pada masing-masing SKPD.',
    legalBasis: 'PP No. 12 Tahun 2019; UU No. 23 Tahun 2014 tentang Pemerintahan Daerah; Permendagri No. 77 Tahun 2020.',
    significance: 'Digunakan oleh Inspektorat dalam reviu RKA-SKPD untuk memastikan anggaran kegiatan non-fisik (studi, bimtek, sosialisasi) proporsional dan tidak berlebihan.',
    tags: ['Beban Kerja', 'SKPD', 'Kewajaran Belanja', 'Reviu RKA']
  },
  {
    id: 'hps',
    term: 'HPS',
    fullTitle: 'Harga Perkiraan Sendiri (Owner’s Estimate)',
    category: 'Pengadaan',
    definition: 'Perkiraan harga pengadaan barang/jasa yang dikalkulasikan secara keahlian oleh Pejabat Pembuat Komitmen (PPK) dan disahkan sebelum proses pemilihan penyedia dilaksanakan.',
    legalBasis: 'Perpres No. 16 Tahun 2018 jo. Perpres No. 12 Tahun 2021 tentang Pengadaan Barang/Jasa Pemerintah (Pasal 26).',
    significance: 'Titik rawan audit pengadaan; pemeriksa meneliti apakah survei harga riil, riwayat pasar, dan komponen overhead/keuntungan disusun objektif tanpa persekongkolan.',
    tags: ['Tender', 'PPK', 'Pengadaan', 'Kalkulasi Biaya']
  },
  {
    id: 'ppk',
    term: 'PPK',
    fullTitle: 'Pejabat Pembuat Komitmen',
    category: 'Pengadaan',
    definition: 'Pejabat yang diberi kewenangan oleh PA/KPA untuk mengambil keputusan dan/atau melakukan tindakan yang dapat mengakibatkan pengeluaran anggaran belanja negara/daerah dalam pengadaan barang/jasa.',
    legalBasis: 'Perpres No. 16 Tahun 2018 jo. Perpres No. 12 Tahun 2021 (Pasal 11); Perka LKPP No. 19 Tahun 2019.',
    significance: 'Pihak yang bertanggung jawab penuh atas substansi kontrak, addendum waktu, kepatuhan spesifikasi teknis, serta pengenaan denda keterlambatan.',
    tags: ['Kontrak', 'BAST', 'SPK', 'Tanggung Jawab Teknis']
  },
  {
    id: 'pptk',
    term: 'PPTK',
    fullTitle: 'Pejabat Pelaksana Teknis Kegiatan',
    category: 'Keuangan',
    definition: 'Pejabat pada SKPD yang ditugaskan oleh Pengguna Anggaran (PA) atau KPA untuk mengendalikan pelaksanaan teknis operasional dan melaporkan perkembangan subkegiatan.',
    legalBasis: 'PP No. 12 Tahun 2019 (Pasal 12-13); Permendagri No. 77 Tahun 2020 tentang Pedoman Teknis Pengelolaan Keuangan Daerah.',
    significance: 'Verifikator lapangan pertama yang mengesahkan bukti pengeluaran dan kebenaran fisik pekerjaan sebelum diajukan pembayaran ke bendahara/PPK-SKPD.',
    tags: ['Subkegiatan', 'Pelaksanaan APBD', 'Verifikasi Lapangan']
  },
  {
    id: 'btt',
    term: 'BTT',
    fullTitle: 'Belanja Tidak Terduga',
    category: 'Keuangan',
    definition: 'Pengeluaran anggaran untuk keadaan darurat termasuk keperluan mendesak yang tidak dapat diprediksi sebelumnya dan pengembalian atas kelebihan penerimaan daerah tahun sebelumnya.',
    legalBasis: 'PP No. 12 Tahun 2019 (Pasal 68); Permendagri No. 77 Tahun 2020 Bab IV.',
    significance: 'Fokus audit khusus APIP terkait kelengkapan dokumen kedaruratan, penetapan status tanggap bencana oleh Kepala Daerah, dan akuntabilitas realisasi lapangan.',
    tags: ['Kedaruratan', 'Bencana', 'Keperluan Mendesak', 'Audit Khusus']
  },
  {
    id: 'bast',
    term: 'BAST',
    fullTitle: 'Berita Acara Serah Terima',
    category: 'Pengadaan',
    definition: 'Akta formal yang ditandatangani oleh penyedia dan PPK/penjabat penerima yang menyatakan bahwa pekerjaan barang/jasa telah selesai dilaksanakan sesuai spesifikasi teknis dan volume kontrak.',
    legalBasis: 'Perpres No. 16 Tahun 2018 jo. Perpres No. 12 Tahun 2021 (Pasal 57); KUHPerdata Pasal 1601.',
    significance: 'Syarat wajib pencairan dana pembayaran termin 100%; apabila BAST ditandatangani tanpa uji fisik memadai, PPK dapat dikenakan sanksi kelalaian audit.',
    tags: ['Serah Terima', 'Termin Akhir', 'Uji Fisik', 'Bukti Sah']
  },
  {
    id: 'fop',
    term: 'FOP',
    fullTitle: 'Formulir Opini Pemeriksaan (Kondisi-Kriteria-Sebab-Akibat)',
    category: 'APIP',
    definition: 'Kertas kerja standar yang menguraikan 4 elemen pokok temuan pemeriksaan: Kondisi (apa yang terjadi), Kriteria (standar/hukum yang berlaku), Sebab (akar pemicu penyimpangan), dan Akibat (dampak kerugian atau risiko yang timbul).',
    legalBasis: 'Standar Audit Intern Pemerintah Indonesia (SAIPI - AAIPI Kode Etik & Standar Audit No. KEP-005/AAIPI/DPN/2021).',
    significance: 'Kerangka logika wajib bagi setiap auditor dalam merumuskan temuan agar rekomendasi yang diberikan tepat sasaran dan berdasar hukum.',
    tags: ['Kondisi', 'Kriteria', 'Sebab', 'Akibat', 'Temuan Audit']
  },
  {
    id: 'kkp',
    term: 'KKP',
    fullTitle: 'Kertas Kerja Pemeriksaan',
    category: 'APIP',
    definition: 'Dokumen tertulis dan data yang dikumpulkan serta diolah oleh pemeriksa secara sistematis selama proses audit untuk mendukung kesimpulan, temuan, dan opini.',
    legalBasis: 'PermenPAN-RB No. Per/05/M.PAN/03/2008 tentang Petunjuk Teknis Pelaksanaan Pengawasan; SAIPI Paragraf 3000.',
    significance: 'Bukti autentik dan dokumentasi pertanggungjawaban hukum tim audit apabila hasil pemeriksaan diuji di pengadilan atau di hadapan APH.',
    tags: ['Bukti Audit', 'Sampling', 'Uji Petik', 'Dokumentasi Kerja']
  },
  {
    id: 'sp2d',
    term: 'SP2D',
    fullTitle: 'Surat Perintah Pencairan Dana',
    category: 'Keuangan',
    definition: 'Surat perintah yang diterbitkan oleh Bendahara Umum Daerah (BUD) atau Kuasa BUD untuk memindahbukukan sejumlah uang dari RKUD ke rekening pihak ketiga atau rekening bendahara pengeluaran.',
    legalBasis: 'PP No. 12 Tahun 2019 (Pasal 141); Permendagri No. 77 Tahun 2020.',
    significance: 'Bukti legalitas kas keluar daerah yang sah; objek pemeriksaan uji tanggal pembayaran terkait kepatuhan tahun anggaran dan batas waktu pencairan.',
    tags: ['Kas Daerah', 'BUD', 'RKUD', 'Pencairan Dana']
  },
  {
    id: 'spm',
    term: 'SPM',
    fullTitle: 'Surat Perintah Membayar',
    category: 'Keuangan',
    definition: 'Dokumen yang diterbitkan oleh Pengguna Anggaran (PA) atau KPA untuk mencairkan alokasi dana yang tertera pada SPP setelah dilakukan verifikasi kelengkapan dan keabsahan dokumen oleh PPK-SKPD.',
    legalBasis: 'PP No. 12 Tahun 2019 (Pasal 138-140); Permendagri No. 77 Tahun 2020.',
    significance: 'Pintu gerbang pengendalian intern OPD sebelum tagihan diajukan ke BUD; titik verifikasi pemotongan pajak (PPN/PPh) dan kelengkapan bukti transaksi.',
    tags: ['Verifikasi', 'PA', 'KPA', 'PPK-SKPD', 'SPP']
  },
  {
    id: 'pa_kpa',
    term: 'PA / KPA',
    fullTitle: 'Pengguna Anggaran / Kuasa Pengguna Anggaran',
    category: 'Keuangan',
    definition: 'Pejabat pemegang kewenangan penggunaan anggaran untuk melaksanakan tugas dan fungsi pada SKPD / unit kerja yang dipimpinnya sesuai Dokumen Pelaksanaan Anggaran (DPA).',
    legalBasis: 'UU No. 17 Tahun 2003 tentang Keuangan Negara (Pasal 10); PP No. 12 Tahun 2019 (Pasal 9-11).',
    significance: 'Penanggung jawab utama secara formil dan materiel atas seluruh kebijakan belanja dan pertanggungjawaban keuangan pada satuan kerja perangkat daerah.',
    tags: ['Kepala OPD', 'DPA', 'Tanggung Jawab Anggaran']
  },
  {
    id: 'sktjm',
    term: 'SKTJM',
    fullTitle: 'Surat Keterangan Tanggung Jawab Mutlak',
    category: 'Hukum & Sanksi',
    definition: 'Surat pernyataan dari pihak yang merugikan keuangan daerah/negara yang memuat pengakuan bersalah bahwa kerugian tersebut merupakan tanggung jawab pribadinya dan kesanggupan untuk melunasi secara angsuran atau tunai.',
    legalBasis: 'Permendagri No. 133 Tahun 2018 (Pasal 25-30); Peraturan BPK RI No. 3 Tahun 2007.',
    significance: 'Alat bukti perdata yang mengikat pelaku kerugian kas untuk mengembalikan dana paling lama 24 bulan dan dapat dijadikan jaminan kebendaan.',
    tags: ['Pengakuan Utang', 'Jaminan', 'TP-TGR', 'Pemulihan Kas']
  },
  {
    id: 'tp_tgr',
    term: 'TP-TGR',
    fullTitle: 'Tim / Majelis Pertimbangan Penyelesaian Kerugian Daerah',
    category: 'Hukum & Sanksi',
    definition: 'Tim ad-hoc yang dibentuk oleh Kepala Daerah untuk memproses dan menuntut penggantian kerugian daerah terhadap pegawai negeri sipil bukan bendahara atau pejabat lain yang lalai.',
    legalBasis: 'Permendagri No. 133 Tahun 2018; PP No. 38 Tahun 2016 tentang Tata Cara Tuntutan Ganti Kerugian Negara/Daerah.',
    significance: 'Lembaga yudisial administratif internal pemerintah daerah yang menggelar sidang penetapan pembebanan kerugian daerah sebelum proses pelimpahan ke APH.',
    tags: ['Sidang Majelis', 'Ganti Rugi', 'Disiplin Finansial', 'Penetapan Beban']
  },
  {
    id: 'pkpt',
    term: 'PKPT',
    fullTitle: 'Program Kerja Pengawasan Tahunan',
    category: 'APIP',
    definition: 'Dokumen perencanaan pengawasan tahunan Inspektorat yang memuat sasaran, jadwal, fokus kegiatan (audit operasional, reviu, monev, audit kinerja) berbasis penilaian risiko (Risk-Based Internal Audit).',
    legalBasis: 'Permendagri No. 88 Tahun 2022 tentang Perencanaan Pengawasan Penyelenggaraan Pemda; Standar Audit AAIPI.',
    significance: 'Peta dasar penugasan seluruh tim auditor APIP; kepatuhan audit terhadap PKPT diawasi langsung oleh Inspektorat Jenderal Kementerian Dalam Negeri dan BPKP.',
    tags: ['Rencana Kerja', 'Jadwal Audit', 'Risk Based', 'Inspektorat']
  },
  {
    id: 'dalnis',
    term: 'Dalnis',
    fullTitle: 'Pengendali Teknis Pemeriksaan',
    category: 'APIP',
    definition: 'Auditor jenjang Madya atau pejabat fungsional senior yang ditugaskan untuk melakukan supervisi teknis metodologi audit, membimbing tim, dan mereviu kecukupan bukti uji petik pada KKP.',
    legalBasis: 'PermenPAN-RB No. 38 Tahun 2014 tentang Jabatan Fungsional Auditor; Standar Pengendalian Mutu AAIPI.',
    significance: 'Gerbang kendali mutu (quality control) atas keakuratan konstruksi temuan sebelum naskah laporan dipresentasikan kepada Pengendali Mutu (Irban/Inspektur).',
    tags: ['Supervisi', 'Kendali Mutu', 'Auditor Madya', 'Reviu KKP']
  },
  {
    id: 'bmd',
    term: 'BMD',
    fullTitle: 'Barang Milik Daerah (Aset Daerah)',
    category: 'Keuangan',
    definition: 'Semua barang yang dibeli atau diperoleh atas beban APBD atau berasal dari perolehan lainnya yang sah seperti hibah, tukar-menukar, atau putusan pengadilan berkekuatan hukum tetap.',
    legalBasis: 'PP No. 27 Tahun 2014 jo. PP No. 28 Tahun 2020 tentang Pengelolaan BMD/BMN; Permendagri No. 47 Tahun 2021 tentang Tata Cara Pembukuan, Inventarisasi, dan Pelaporan BMD.',
    significance: 'Pos neraca daerah yang kerap memicu opini BPK (WTP/WDP) akibat mutasi tanpa berita acara, aset hilang, tanah belum bersertifikat, atau pemanfaatan tanpa izin.',
    tags: ['Aset Tetap', 'Inventarisasi', 'KIB', 'Sensitif Opini BPK']
  },
  {
    id: 'fraud',
    term: 'Pengeluaran Fiktif & Markup',
    fullTitle: 'Pertanggungjawaban Belanja Fiktif & Penggelembungan Nilai',
    category: 'Hukum & Sanksi',
    definition: 'Tindakan curang berupa pemalsuan bukti transaksi/nota pembayaran tanpa penyerahan riil barang/jasa, atau penetapan harga satuan jauh melampaui harga pasar riil secara sengaja untuk memperkaya diri atau orang lain.',
    legalBasis: 'UU No. 31 Tahun 1999 jo. UU No. 20 Tahun 2001 tentang Pemberantasan Tindak Pidana Korupsi (Pasal 2 dan Pasal 3); KUHP Pasal 263 tentang Pemalsuan Surat.',
    significance: 'Kategori temuan audit kepatuhan berat yang tidak dapat ditoleransi; wajib direkomendasikan pengembalian seketika, sanksi disiplin berat, dan berpotensi diteruskan ke APH.',
    tags: ['Tipikor', 'Fraud', 'Pidana', 'Bukti Palsu', 'Kerugian Negara']
  },
  {
    id: 'aph',
    term: 'APH',
    fullTitle: 'Aparat Penegak Hukum (Kejaksaan, Kepolisian, KPK)',
    category: 'Hukum & Sanksi',
    definition: 'Lembaga penegak hukum negara yang berwenang melakukan penyelidikan, penyidikan, dan penuntutan terhadap tindak pidana korupsi yang terjadi di lingkungan pemerintahan daerah.',
    legalBasis: 'Nota Kesepahaman (MoU) Tripartit Kementerian Dalam Negeri, Kejaksaan Agung RI, dan Kepolisian Negara RI tentang Koordinasi APIP dan APH dalam Penanganan Pengaduan Masyarakat; UU Tipikor.',
    significance: 'Rujukan tindak lanjut apabila auditi tidak menyelesaikan rekomendasi TGR dalam tempo 60 hari kerja atau jika ditemukan mens rea (niat jahat) korupsi terstruktur.',
    tags: ['Kejaksaan', 'Kepolisian', 'Tipikor', 'Koordinasi APIP-APH']
  }
];

// Cached AudioContext singleton for mobile & PC performance (prevents memory leaks & GC pauses)
let globalAudioCtx: AudioContext | null = null;
const getAudioContext = (): AudioContext | null => {
  if (typeof window === 'undefined') return null;
  const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
  if (!AudioCtx) return null;
  if (!globalAudioCtx || globalAudioCtx.state === 'closed') {
    globalAudioCtx = new AudioCtx();
  }
  if (globalAudioCtx.state === 'suspended') {
    globalAudioCtx.resume().catch(() => {});
  }
  return globalAudioCtx;
};

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
  const [themeRadius, setThemeRadius] = useState<'sharp' | 'rounded' | 'pebble'>('rounded');
  const [ambientGlow, setAmbientGlow] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isPerformanceMode, setIsPerformanceMode] = useState(false);
  const [themeCustomTab, setThemeCustomTab] = useState<'palettes' | 'atmospheres' | 'effects'>('palettes');
  const [previewTestClicked, setPreviewTestClicked] = useState(false);

  // Web Audio API Synthesized Haptic Sound Generator (Memory-efficient singleton)
  const playHaptic = useCallback((type: 'click' | 'toggle' | 'pop' = 'click') => {
    if (!soundEnabled || typeof window === 'undefined') return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      const now = ctx.currentTime;
      if (type === 'click') {
        osc.frequency.setValueAtTime(560, now);
        osc.frequency.exponentialRampToValueAtTime(840, now + 0.03);
        gain.gain.setValueAtTime(0.04, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);
        osc.start(now);
        osc.stop(now + 0.03);
      } else if (type === 'pop') {
        osc.frequency.setValueAtTime(420, now);
        osc.frequency.exponentialRampToValueAtTime(700, now + 0.05);
        gain.gain.setValueAtTime(0.06, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
        osc.start(now);
        osc.stop(now + 0.05);
      } else {
        osc.frequency.setValueAtTime(720, now);
        osc.frequency.exponentialRampToValueAtTime(940, now + 0.04);
        gain.gain.setValueAtTime(0.05, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
        osc.start(now);
        osc.stop(now + 0.04);
      }
    } catch {
      // AudioContext could be suspended or restricted; fail gracefully
    }
  }, [soundEnabled]);
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

  // --- Filter OPD (Organisasi Perangkat Daerah) Irban 3 ---
  const [opdList, setOpdList] = useState<OpdItem[]>(DEFAULT_OPD_SULTRA);
  const [selectedOpdFilter, setSelectedOpdFilter] = useState<string>('all');
  const [isOpdDropdownOpen, setIsOpdDropdownOpen] = useState(false);
  const [opdSearchQuery, setOpdSearchQuery] = useState('');
  const [opdOnlyBinaan, setOpdOnlyBinaan] = useState(false);
  const [isManageOpdModalOpen, setIsManageOpdModalOpen] = useState(false);
  const [newOpdForm, setNewOpdForm] = useState({ name: '', code: '', category: 'Dinas' as const, aliases: '', isBinaanIrban3: true });

  // --- Checklist Kelengkapan Dokumen Wajib (LHP & ST) Irban 3 ---
  const [isChecklistModalOpen, setIsChecklistModalOpen] = useState(false);
  const [checklistGlobalData, setChecklistGlobalData] = useState<{ summary: any; checklists: any[] } | null>(null);
  const [checklistLoading, setChecklistLoading] = useState(false);
  const [checklistSearchQuery, setChecklistSearchQuery] = useState('');
  const [checklistTabFilter, setChecklistTabFilter] = useState<'all' | 'complete' | 'missing_st' | 'missing_lhp' | 'empty'>('all');
  const [manualDocRoles, setManualDocRoles] = useState<Record<string, 'LHP' | 'ST' | 'none'>>({});
  const [selectedDocRoleFilter, setSelectedDocRoleFilter] = useState<'all' | 'LHP' | 'ST' | 'complete' | 'missing_st' | 'missing_lhp'>('all');

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

  // --- Glosarium Hukum & Kamus Regulasi Melayang ---
  const [isGlossaryModalOpen, setIsGlossaryModalOpen] = useState(false);
  const [showFloatingGlossary, setShowFloatingGlossary] = useState(false);
  const [glossarySearch, setGlossarySearch] = useState('');
  const [glossaryCategory, setGlossaryCategory] = useState<'all' | 'Keuangan' | 'Pengadaan' | 'APIP' | 'Hukum & Sanksi'>('all');
  const [selectedGlossaryTerm, setSelectedGlossaryTerm] = useState<GlossaryItem | null>(null);
  const [glossaryCopyToast, setGlossaryCopyToast] = useState<string | null>(null);

  const handleCopyLegalBasis = useCallback((item: GlossaryItem) => {
    playHaptic('click');
    const textToCopy = `${item.term} (${item.fullTitle})\nDasar Hukum: ${item.legalBasis}\nKutipan Glosarium Pengawasan Inspektorat`;
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(textToCopy);
    }
    setGlossaryCopyToast(`Dasar hukum "${item.term}" berhasil disalin!`);
    setTimeout(() => {
      setGlossaryCopyToast(null);
    }, 2800);
  }, [playHaptic]);

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

  // --- Modal Konfirmasi Hapus Modern (Desain Ulang) ---
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    fileId: string;
    fileName: string;
    isDeleting: boolean;
    error: string | null;
  } | null>(null);

  // --- Modal Pindahkan Dokumen (Move) ---
  const [moveModal, setMoveModal] = useState<{
    isOpen: boolean;
    fileId?: string;
    fileName?: string;
    fileIds?: string[];
    fileNames?: string[];
    targetFolderId: string;
    isMoving: boolean;
    error: string | null;
    searchQuery: string;
  } | null>(null);

  // --- Mode Pilih Banyak (Multi-Select) & Operasi Massal Dokumen ---
  const [isMultiSelectMode, setIsMultiSelectMode] = useState<boolean>(false);
  const [selectedFileIds, setSelectedFileIds] = useState<Set<string>>(new Set());

  // --- Modal Tambah Folder Baru ---
  const [createFolderModal, setCreateFolderModal] = useState<{
    isOpen: boolean;
    name: string;
    targetParentId: string;
    isCreating: boolean;
    error: string | null;
  } | null>(null);

  // --- Modal Notifikasi Hak Akses Administrator ---
  const [adminNoticeModal, setAdminNoticeModal] = useState<string | null>(null);

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
    if (userRole !== 'admin') {
      playHaptic('toggle');
      setAdminNoticeModal('Hanya Administrator yang memiliki hak akses untuk membersihkan riwayat aktivitas.');
      return;
    }
    setClearLogsLoading(true);
    try {
      const res = await fetch('/api/logs', { 
        method: 'DELETE',
        headers: { 'x-user-role': userRole || '' }
      });
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

  // --- OPD MANAGEMENT & FILTER HELPERS ---
  const saveOpdList = (updated: OpdItem[]) => {
    setOpdList(updated);
    try {
      localStorage.setItem('archive_custom_opds', JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  };

  const handleToggleOpdBinaan = (opdId: string) => {
    if (userRole !== 'admin') {
      playHaptic('toggle');
      setAdminNoticeModal('Hanya Administrator yang memiliki hak akses untuk menandai atau mengubah OPD Binaan.');
      return;
    }
    playHaptic('click');
    const updated = opdList.map(o => o.id === opdId ? { ...o, isBinaanIrban3: !o.isBinaanIrban3 } : o);
    saveOpdList(updated);
  };

  const handleAddNewOpd = () => {
    if (userRole !== 'admin') {
      playHaptic('toggle');
      setAdminNoticeModal('Hanya Administrator yang memiliki hak akses untuk menambahkan OPD baru.');
      return;
    }
    if (!newOpdForm.name.trim() || !newOpdForm.code.trim()) return;
    playHaptic('pop');
    const id = newOpdForm.code.toLowerCase().replace(/[^a-z0-9]/g, '-') + '-' + Date.now().toString().slice(-4);
    const parsedAliases = newOpdForm.aliases
      .split(',')
      .map(a => a.trim().toLowerCase())
      .filter(Boolean);

    if (!parsedAliases.includes(newOpdForm.code.toLowerCase())) {
      parsedAliases.push(newOpdForm.code.toLowerCase());
    }

    const newOpd: OpdItem = {
      id,
      name: newOpdForm.name.trim(),
      code: newOpdForm.code.trim(),
      category: newOpdForm.category,
      aliases: parsedAliases,
      isBinaanIrban3: newOpdForm.isBinaanIrban3,
    };

    saveOpdList([newOpd, ...opdList]);
    setNewOpdForm({ name: '', code: '', category: 'Dinas', aliases: '', isBinaanIrban3: true });
  };

  const handleDeleteCustomOpd = (opdId: string) => {
    if (userRole !== 'admin') {
      playHaptic('toggle');
      setAdminNoticeModal('Hanya Administrator yang memiliki hak akses untuk menghapus OPD.');
      return;
    }
    playHaptic('click');
    const updated = opdList.filter(o => o.id !== opdId);
    saveOpdList(updated);
    if (selectedOpdFilter === opdId) setSelectedOpdFilter('all');
  };

  const handleResetOpdToDefault = () => {
    if (userRole !== 'admin') {
      playHaptic('toggle');
      setAdminNoticeModal('Hanya Administrator yang memiliki hak akses untuk mengatur ulang daftar OPD.');
      return;
    }
    playHaptic('pop');
    saveOpdList(DEFAULT_OPD_SULTRA);
  };

  const isFileBelongToOpd = useCallback((file: DriveFile, opdId: string): boolean => {
    if (!opdId || opdId === 'all') return true;
    const targetOpd = opdList.find(o => o.id === opdId);
    if (!targetOpd) return true;

    // 1. Cek tags manual file
    const fileTags = getFileTags(file);
    const tagMatch = fileTags.some(t => {
      const tLower = t.toLowerCase();
      if (tLower === targetOpd.code.toLowerCase()) return true;
      if (tLower === targetOpd.name.toLowerCase()) return true;
      return targetOpd.aliases.some(alias => tLower === alias.toLowerCase() || tLower.includes(alias.toLowerCase()));
    });
    if (tagMatch) return true;

    // 2. Cek nama file
    const nameLower = file.name.toLowerCase();
    const nameMatch = targetOpd.aliases.some(alias => {
      const aLower = alias.toLowerCase();
      if (aLower.length <= 3) {
        const rx = new RegExp(`(^|[^a-z0-9])${aLower}([^a-z0-9]|$)`, 'i');
        return rx.test(nameLower);
      }
      return nameLower.includes(aLower);
    });
    if (nameMatch) return true;

    // 3. Cek folder history (jika pengguna sedang berada di dalam folder yang bernama OPD ini)
    const inCurrentFolder = folderHistory.some(f => {
      const fLower = f.name.toLowerCase();
      return targetOpd.aliases.some(alias => fLower.includes(alias.toLowerCase())) ||
             fLower.includes(targetOpd.code.toLowerCase());
    });
    if (inCurrentFolder) return true;

    return false;
  }, [opdList, getFileTags, folderHistory]);

  const opdCounts = React.useMemo(() => {
    const counts: Record<string, number> = {};
    const pool = (searchTerm.length >= 2 ? searchResults : files);
    opdList.forEach(opd => {
      counts[opd.id] = pool.filter(f => isFileBelongToOpd(f, opd.id)).length;
    });
    return counts;
  }, [opdList, searchTerm, searchResults, files, isFileBelongToOpd]);

  // --- DETEKSI & PENGELOLAAN DOKUMEN WAJIB (LHP & ST) IRBAN 3 ---
  const detectFileRole = useCallback((file: DriveFile | null): 'LHP' | 'ST' | 'none' => {
    if (!file) return 'none';

    // 1. Cek manual override peran dokumen
    if (manualDocRoles[file.id]) {
      return manualDocRoles[file.id];
    }

    // 2. Cek tags dokumen
    const tags = getFileTags(file);
    const tagsLower = tags.map(t => t.toLowerCase());
    if (tagsLower.some(t => t === 'lhp' || t === 'laporan hasil' || t === 'laporan pengawasan' || t === 'laporan pemeriksaan')) {
      return 'LHP';
    }
    if (tagsLower.some(t => t === 'st' || t === 'spt' || t === 'surat tugas' || t === 'surat perintah tugas')) {
      return 'ST';
    }

    // 3. Cek nama file
    const name = file.name.toLowerCase();
    const isLhp = 
      name.includes('lhp') ||
      name.includes('laporan hasil pengawasan') ||
      name.includes('laporan hasil pemeriksaan') ||
      name.includes('laporan-hasil') ||
      name.includes('laporan_hasil') ||
      name.includes('laporan hasil') ||
      name.includes('laporan akhir');

    const isSt = 
      name.includes('surat tugas') ||
      name.includes('surat-tugas') ||
      name.includes('surat_tugas') ||
      name.includes('surat perintah tugas') ||
      name.includes('surat penugasan') ||
      /(^|[^a-z0-9])(st|spt)[-_ ]/i.test(name) ||
      /[-_ ](st|spt)([^a-z0-9]|$)/i.test(name) ||
      /[-_ ](st|spt)\.(pdf|docx?)/i.test(name) ||
      /\bst\b/i.test(name) ||
      /\bspt\b/i.test(name) ||
      /\b(090|094|800)\//.test(name);

    if (isLhp && isSt) {
      if (name.startsWith('lhp') || name.includes('laporan')) return 'LHP';
      return 'ST';
    }
    if (isLhp) return 'LHP';
    if (isSt) return 'ST';

    return 'none';
  }, [manualDocRoles, getFileTags]);

  const handleSetFileRole = (fileId: string, role: 'LHP' | 'ST' | 'none') => {
    if (userRole !== 'admin') {
      playHaptic('toggle');
      setAdminNoticeModal('Hanya Administrator yang memiliki hak akses untuk menentukan klasifikasi peran identitas dokumen.');
      return;
    }
    playHaptic('pop');
    const updated = { ...manualDocRoles, [fileId]: role };
    setManualDocRoles(updated);
    try {
      localStorage.setItem('archive_manual_doc_roles', JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }

    // Otomatis sinkronkan label agar konsisten
    if (role === 'LHP' || role === 'ST') {
      const targetFile = files.find(f => f.id === fileId) || (selectedFile?.id === fileId ? selectedFile : null);
      if (targetFile) {
        const existingTags = getFileTags(targetFile);
        const tagToAdd = role === 'LHP' ? 'LHP' : 'Surat Tugas';
        if (!existingTags.some(t => t.toLowerCase() === tagToAdd.toLowerCase())) {
          handleSaveFileTags(fileId, targetFile.name, [...existingTags, tagToAdd]);
        }
      }
    }
  };

  const fetchGlobalChecklist = useCallback(async () => {
    setChecklistLoading(true);
    try {
      const res = await fetch('/api/drive/checklist');
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setChecklistGlobalData(data);
        }
      }
    } catch (e) {
      console.error("Gagal mengambil data checklist:", e);
    } finally {
      setChecklistLoading(false);
    }
  }, []);

  const handleExportChecklistCsv = () => {
    if (!checklistGlobalData?.checklists) return;
    playHaptic('click');
    const headers = [
      "No",
      "Folder Penugasan / OPD",
      "Status Surat Tugas (ST)",
      "File Surat Tugas",
      "Status Laporan Hasil (LHP)",
      "File LHP",
      "Skor Kelengkapan",
      "Status Kepatuhan"
    ];
    const rows = checklistGlobalData.checklists.map((item: any, idx: number) => {
      const stName = item.stFiles && item.stFiles.length > 0 ? item.stFiles.map((f: any) => f.name).join('; ') : '-';
      const lhpName = item.lhpFiles && item.lhpFiles.length > 0 ? item.lhpFiles.map((f: any) => f.name).join('; ') : '-';
      const statusLabel = item.status === 'complete' ? 'Lengkap (100%)' : item.status === 'missing_st' ? 'Kurang ST (50%)' : item.status === 'missing_lhp' ? 'Kurang LHP (50%)' : 'Kosong (0%)';
      return [
        idx + 1,
        `"${(item.name || '').replace(/"/g, '""')}"`,
        item.hasSt ? 'Terpenuhi' : 'Belum Ada',
        `"${stName.replace(/"/g, '""')}"`,
        item.hasLhp ? 'Terpenuhi' : 'Belum Ada',
        `"${lhpName.replace(/"/g, '""')}"`,
        `${item.completenessScore}%`,
        `"${statusLabel}"`
      ].join(',');
    });
    const csvContent = "\uFEFF" + [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Matriks_Kelengkapan_LHP_ST_Irban3_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addOnlineLog("EXPORT_CSV", "Ekspor Matriks Kelengkapan LHP & ST");
  };

  const openTagModal = (file: DriveFile) => {
    if (userRole !== 'admin') {
      playHaptic('toggle');
      setAdminNoticeModal('Hanya Administrator yang memiliki hak akses untuk mengelola atau menentukan label dokumen.');
      return;
    }
    setTagModalFile(file);
    setCustomTagInput('');
    setIsTagModalOpen(true);
  };

  const handleSaveFileTags = async (fileId: string, fileName: string, newTags: string[]) => {
    if (userRole !== 'admin') {
      playHaptic('toggle');
      setAdminNoticeModal('Hanya Administrator yang memiliki hak akses untuk mengubah label dokumen.');
      return;
    }
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
        headers: { 
          'Content-Type': 'application/json',
          'x-user-role': userRole || ''
        },
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

  // Polling Logs secara berkala saat sedang preview dokumen (hemat daya saat tab tidak aktif)
  useEffect(() => {
    let interval: any;
    if (selectedFile) {
      interval = setInterval(() => {
        if (typeof document !== 'undefined' && !document.hidden) {
          fetchOnlineLogs();
        }
      }, 20000); // 20 detik saat terlihat
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
    const savedRadius = localStorage.getItem('themeRadius');
    if (savedRadius && ['sharp', 'rounded', 'pebble'].includes(savedRadius)) {
      setThemeRadius(savedRadius as any);
    }
    const savedGlow = localStorage.getItem('themeAmbientGlow');
    if (savedGlow !== null) setAmbientGlow(savedGlow === 'true');
    const savedSound = localStorage.getItem('themeSoundEnabled');
    if (savedSound !== null) setSoundEnabled(savedSound === 'true');
    const savedPerf = localStorage.getItem('themePerformanceMode');
    if (savedPerf !== null) setIsPerformanceMode(savedPerf === 'true');

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
      if ((e.ctrlKey || e.metaKey) && e.key === 'g') { e.preventDefault(); setIsGlossaryModalOpen(prev => !prev); }
      if (e.key === 'Escape') { 
        setSelectedFile(null); 
        setIsSearchModalOpen(false); 
        setSearchResults([]); 
        setSearchTerm(''); 
        setIsGlossaryModalOpen(false);
        setShowFloatingGlossary(false);
      }
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
    document.documentElement.classList.toggle('performance-mode', isPerformanceMode);
    const classesToRemove = Array.from(document.documentElement.classList).filter(c => 
      c.startsWith('atmos-') || c.startsWith('theme-') || c.startsWith('radius-')
    );
    classesToRemove.forEach(c => document.documentElement.classList.remove(c));
    if (themeAtmosphere && themeAtmosphere !== 'default') {
      document.documentElement.classList.add(`atmos-${themeAtmosphere}`);
    }
    document.documentElement.classList.add(`theme-${themeColor}`);
    document.documentElement.classList.add(`radius-${themeRadius}`);
  }, [isDarkMode, themeAtmosphere, themeColor, themeRadius, isPerformanceMode]);

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

      const savedOpds = localStorage.getItem('archive_custom_opds');
      if (savedOpds) {
        try {
          const parsed = JSON.parse(savedOpds);
          if (Array.isArray(parsed) && parsed.length > 0) setOpdList(parsed);
        } catch {}
      }

      const savedDocRoles = localStorage.getItem('archive_manual_doc_roles');
      if (savedDocRoles) {
        try {
          const parsed = JSON.parse(savedDocRoles);
          if (parsed && typeof parsed === 'object') setManualDocRoles(parsed);
        } catch {}
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

  useEffect(() => { 
    if (isLoggedIn) {
      fetchData(currentFolder);
      fetchGlobalChecklist();
    }
  }, [isLoggedIn, currentFolder, fetchGlobalChecklist]);

  const fetchAllFolders = async () => {
    try {
      const res = await fetch('/api/drive/all-folders');
      const data = await res.json();
      if (Array.isArray(data)) setAllFolders(data);
    } catch (e) { console.error(e); }
  };

  useEffect(() => { if (isUploadModalOpen) fetchAllFolders(); }, [isUploadModalOpen]);

  const navigateToFolder = (id: string, name: string) => {
    setCurrentFolder(id); setFolderHistory(prev => [...prev, { id, name }]); setSelectedFile(null); setSelectedFileIds(new Set());
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
      const prevFolder = newHistory[newHistory.length - 1]; setCurrentFolder(prevFolder ? prevFolder.id : ''); setSelectedFile(null); setSelectedFileIds(new Set());
      if (prevFolder) addOnlineLog("OPEN_FOLDER", prevFolder.name);
    }
  };

  const jumpToHistory = (index: number) => {
    const newHistory = folderHistory.slice(0, index + 1);
    setFolderHistory(newHistory);
    const targetFolder = newHistory[newHistory.length - 1];
    setCurrentFolder(targetFolder.id);
    setSelectedFile(null);
    setSelectedFileIds(new Set());
    addOnlineLog("OPEN_FOLDER", targetFolder.name);
  };

  const goHome = () => { setCurrentFolder(''); setFolderHistory([]); setSelectedFile(null); setSelectedFileIds(new Set()); setSearchTerm(''); setFilterType('all'); };

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
    if (userRole !== 'admin') {
      playHaptic('toggle');
      setAdminNoticeModal('Hanya Administrator yang memiliki hak akses untuk mengunggah dokumen.');
      return;
    }
    const selectedFiles = e.target.files; if (!selectedFiles || selectedFiles.length === 0) return;
    setUploading(true); setUploadStatus('idle'); setUploadProgress(0); setUploadErrorMessage('');
    let success = 0;
    let lastError = '';

    for (let i = 0; i < selectedFiles.length; i++) {
      const formData = new FormData();
      formData.append('file', selectedFiles[i]);
      formData.append('parentId', uploadDestinationId || currentFolder || '');
      try {
        const res = await fetch('/api/drive/upload', { 
          method: 'POST', 
          headers: { 'x-user-role': userRole || '' },
          body: formData 
        });
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

  // Pemicu Modal Hapus dengan Desain Baru yang Modern
  const handleDelete = (fileId: string, fileName: string) => {
    if (userRole !== 'admin') {
      playHaptic('toggle');
      setAdminNoticeModal('Hanya Administrator yang memiliki hak akses untuk menghapus dokumen dari arsip.');
      return;
    }
    playHaptic('pop');
    setDeleteModal({
      isOpen: true,
      fileId,
      fileName,
      isDeleting: false,
      error: null,
    });
  };

  // Eksekusi Konfirmasi Hapus Berkas
  const handleConfirmDelete = async () => {
    if (userRole !== 'admin') {
      playHaptic('toggle');
      setAdminNoticeModal('Hanya Administrator yang memiliki hak akses untuk menghapus dokumen dari arsip.');
      return;
    }
    if (!deleteModal || !deleteModal.fileId) return;
    const { fileId, fileName } = deleteModal;
    setDeleteModal(prev => prev ? { ...prev, isDeleting: true, error: null } : null);

    try {
      const res = await fetch(`/api/drive?fileId=${fileId}`, { 
        method: 'DELETE',
        headers: { 'x-user-role': userRole || '' }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        addOnlineLog("DELETE", fileName);
        if (selectedFile?.id === fileId) {
          setSelectedFile(null);
        }
        playHaptic('pop');
        setDeleteModal(null);
        fetchData(currentFolder);
        fetchGlobalChecklist();
      } else {
        setDeleteModal(prev => prev ? { ...prev, isDeleting: false, error: data.error || 'Gagal menghapus berkas dari Google Drive' } : null);
      }
    } catch (e: any) {
      console.error(e);
      setDeleteModal(prev => prev ? { ...prev, isDeleting: false, error: e.message || 'Terjadi kesalahan jaringan saat menghapus berkas' } : null);
    }
  };

  // Toggle seleksi dokumen perorangan
  const toggleSelectFile = (fileId: string) => {
    playHaptic('toggle');
    setSelectedFileIds(prev => {
      const next = new Set(prev);
      if (next.has(fileId)) {
        next.delete(fileId);
      } else {
        next.add(fileId);
      }
      return next;
    });
  };

  // Pilih Semua Dokumen yang sedang tampil (tidak termasuk folder)
  const handleSelectAllFiles = () => {
    playHaptic('click');
    const selectableDocs = filteredFilesMain.filter(f => !f.mimeType.includes('folder'));
    const allSelected = selectableDocs.length > 0 && selectableDocs.every(f => selectedFileIds.has(f.id));
    
    if (allSelected) {
      setSelectedFileIds(new Set());
    } else {
      const next = new Set(selectedFileIds);
      selectableDocs.forEach(f => next.add(f.id));
      setSelectedFileIds(next);
    }
  };

  // Batalkan seluruh seleksi dokumen
  const handleClearSelection = () => {
    playHaptic('click');
    setSelectedFileIds(new Set());
  };

  // Buka Modal Pindahkan Dokumen (Tunggal)
  const openMoveModal = (file: DriveFile) => {
    if (userRole !== 'admin') {
      playHaptic('toggle');
      setAdminNoticeModal('Hanya Administrator yang memiliki hak akses untuk memindahkan dokumen antar folder.');
      return;
    }
    playHaptic('click');
    fetchAllFolders();
    setMoveModal({
      isOpen: true,
      fileId: file.id,
      fileName: file.name,
      fileIds: [file.id],
      fileNames: [file.name],
      targetFolderId: '',
      isMoving: false,
      error: null,
      searchQuery: '',
    });
  };

  // Buka Modal Pindahkan Dokumen Banyak Sekaligus (Batch Move)
  const openBatchMoveModal = () => {
    if (userRole !== 'admin') {
      playHaptic('toggle');
      setAdminNoticeModal('Hanya Administrator yang memiliki hak akses untuk memindahkan dokumen antar folder.');
      return;
    }
    if (selectedFileIds.size === 0) return;

    playHaptic('click');
    fetchAllFolders();

    const ids = Array.from(selectedFileIds);
    const names = ids.map(id => {
      const found = files.find(f => f.id === id) || filteredFilesMain.find(f => f.id === id);
      return found ? found.name : 'Dokumen';
    });

    setMoveModal({
      isOpen: true,
      fileIds: ids,
      fileNames: names,
      fileId: ids[0],
      fileName: names.length === 1 ? names[0] : `${names.length} dokumen terpilih`,
      targetFolderId: '',
      isMoving: false,
      error: null,
      searchQuery: '',
    });
  };

  // Eksekusi Pindahkan Dokumen (Tunggal maupun Banyak Sekaligus)
  const handleConfirmMove = async () => {
    if (!moveModal || !moveModal.targetFolderId) return;
    const isBatch = Boolean(moveModal.fileIds && moveModal.fileIds.length > 0);
    if (!isBatch && !moveModal.fileId) return;

    setMoveModal(prev => prev ? { ...prev, isMoving: true, error: null } : null);

    try {
      const payload: any = {
        destinationFolderId: moveModal.targetFolderId,
        currentFolderId: currentFolder || 'root',
      };

      if (isBatch && moveModal.fileIds) {
        payload.fileIds = moveModal.fileIds;
      } else {
        payload.fileId = moveModal.fileId;
      }

      const res = await fetch('/api/drive/move', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-user-role': userRole || ''
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        const destName = moveModal.targetFolderId === 'root' 
          ? 'Beranda / Root' 
          : (allFolders.find(f => f.id === moveModal.targetFolderId)?.name || 'Folder Tujuan');
        
        if (isBatch && moveModal.fileIds && moveModal.fileIds.length > 1) {
          addOnlineLog("MOVE", `${moveModal.fileIds.length} dokumen ➔ ${destName}`);
          setSelectedFileIds(new Set());
          setIsMultiSelectMode(false);
        } else {
          addOnlineLog("MOVE", `${moveModal.fileName || 'Dokumen'} ➔ ${destName}`);
        }

        playHaptic('pop');
        setMoveModal(null);
        fetchData(currentFolder);
        fetchGlobalChecklist();
      } else {
        setMoveModal(prev => prev ? { ...prev, isMoving: false, error: data.error || 'Gagal memindahkan dokumen ke folder tujuan' } : null);
      }
    } catch (e: any) {
      console.error(e);
      setMoveModal(prev => prev ? { ...prev, isMoving: false, error: e.message || 'Terjadi kesalahan jaringan' } : null);
    }
  };

  // Buka Modal Tambah Folder Baru
  const openCreateFolderModal = () => {
    if (userRole !== 'admin') {
      playHaptic('toggle');
      setAdminNoticeModal('Hanya Administrator yang memiliki hak akses untuk membuat folder baru.');
      return;
    }
    playHaptic('click');
    fetchAllFolders();
    setCreateFolderModal({
      isOpen: true,
      name: '',
      targetParentId: currentFolder || 'root',
      isCreating: false,
      error: null,
    });
  };

  // Eksekusi Pembuatan Folder Baru
  const handleConfirmCreateFolder = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!createFolderModal || !createFolderModal.name.trim()) return;
    const { name, targetParentId } = createFolderModal;
    setCreateFolderModal(prev => prev ? { ...prev, isCreating: true, error: null } : null);

    try {
      const res = await fetch('/api/drive/folder', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-user-role': userRole || ''
        },
        body: JSON.stringify({
          name: name.trim(),
          parentId: targetParentId === 'root' ? '' : targetParentId,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        addOnlineLog("CREATE_FOLDER", name.trim());
        playHaptic('pop');
        setCreateFolderModal(null);
        fetchData(currentFolder);
        fetchAllFolders();
        fetchGlobalChecklist();
      } else {
        setCreateFolderModal(prev => prev ? { ...prev, isCreating: false, error: data.error || 'Gagal membuat folder baru' } : null);
      }
    } catch (e: any) {
      console.error(e);
      setCreateFolderModal(prev => prev ? { ...prev, isCreating: false, error: e.message || 'Terjadi kesalahan jaringan' } : null);
    }
  };

  const handleRename = async (fileId: string, oldName: string) => {
    if (userRole !== 'admin') {
      playHaptic('toggle');
      setAdminNoticeModal('Hanya Administrator yang memiliki hak akses untuk mengubah nama berkas.');
      return;
    }
    const newName = prompt("Nama Baru Berkas:", oldName);
    if (!newName || !newName.trim() || newName.trim() === oldName) return;

    try {
      const res = await fetch('/api/drive', {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'x-user-role': userRole || ''
        },
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
      playHaptic('toggle');
      setAdminNoticeModal('Hanya Administrator yang memiliki hak akses untuk mengekspor data riwayat aktivitas.');
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
      if (selectedOpdFilter !== 'all') {
        const activeOpdObj = opdList.find(o => o.id === selectedOpdFilter);
        if (activeOpdObj) {
          rows.push(`"Filter OPD Binaan",${cleanCsvVal(`${activeOpdObj.name} (${activeOpdObj.code})`)}`);
        }
      }
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
      if (!selectedOpdFilter || selectedOpdFilter === 'all') return true;
      return isFileBelongToOpd(f, selectedOpdFilter);
    })
    .filter(f => {
      if (!showFavoritesOnly) return true;
      return favorites.has(f.id);
    })
    .filter(f => {
      if (selectedDocRoleFilter === 'all') return true;
      if (selectedDocRoleFilter === 'LHP') return detectFileRole(f) === 'LHP';
      if (selectedDocRoleFilter === 'ST') return detectFileRole(f) === 'ST';
      return true;
    });

  const folders = filteredFilesMain.filter(f => f.mimeType.includes('folder'));
  const documents = filteredFilesMain.filter(f => !f.mimeType.includes('folder'));

  // Kelengkapan LHP & ST pada tampilan folder / OPD aktif saat ini
  const viewStFiles = filteredFilesMain.filter(f => !f.mimeType.includes('folder') && detectFileRole(f) === 'ST');
  const viewLhpFiles = filteredFilesMain.filter(f => !f.mimeType.includes('folder') && detectFileRole(f) === 'LHP');
  const hasStInCurrentView = viewStFiles.length > 0;
  const hasLhpInCurrentView = viewLhpFiles.length > 0;
  const viewCompletenessScore = hasStInCurrentView && hasLhpInCurrentView ? 100 : (hasStInCurrentView || hasLhpInCurrentView ? 50 : 0);

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
      <div className={`${isDarkMode ? "dark" : "light"} theme-${themeColor} ${themeAtmosphere !== 'default' ? `atmos-${themeAtmosphere}` : ''} font-scale-${fontSize} ${glassEffect ? 'enable-glass' : 'disable-glass'} radius-${themeRadius} ${ambientGlow ? 'ambient-mesh-glow' : ''} ${isPerformanceMode ? 'performance-mode' : ''}`}>
        <div className="min-h-screen bg-[var(--bg-main)] flex items-center justify-center p-4 relative overflow-hidden transition-colors">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-[var(--accent)]/[0.05] blur-[60px] rounded-full pointer-events-none transform-gpu will-change-transform"></div>
        
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
      <div className={`${isDarkMode ? "dark" : "light"} theme-${themeColor} ${themeAtmosphere !== 'default' ? `atmos-${themeAtmosphere}` : ''} font-scale-${fontSize} ${glassEffect ? 'enable-glass' : 'disable-glass'} radius-${themeRadius} ${ambientGlow ? 'ambient-mesh-glow' : ''} ${isPerformanceMode ? 'performance-mode' : ''}`}>
        <div className="relative min-h-screen w-full flex items-center justify-center p-6 bg-[var(--bg-main)] transition-colors">
        {/* Subtle background gradient */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[480px] h-[480px] bg-[var(--accent)]/[0.06] blur-[60px] rounded-full pointer-events-none transform-gpu will-change-transform"></div>
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
                  loading="eager"
                  decoding="async"
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
    <div className={`${isDarkMode ? "dark" : "light"} theme-${themeColor} ${themeAtmosphere !== 'default' ? `atmos-${themeAtmosphere}` : ''} font-scale-${fontSize} ${glassEffect ? 'enable-glass' : 'disable-glass'} radius-${themeRadius} ${ambientGlow ? 'ambient-mesh-glow' : ''} ${isPerformanceMode ? 'performance-mode' : ''}`}>
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
                <img src="https://i.ibb.co.com/L22pdJQ/Coat-of-arms-of-Southeast-Sulawesi-svg.png" alt="Logo" loading="eager" decoding="async" className="w-full h-full object-contain" />
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
            <button 
              onClick={() => setIsThemeModalOpen(true)} 
              title="Kustomisasi Tema, Warna & Tampilan"
              className="w-full flex items-center justify-center lg:justify-start gap-3 p-3 lg:px-4 lg:py-3 rounded-xl text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--hover-fill)] transition-all group"
            >
              <Palette size={18} className="text-[var(--accent)] transition-transform group-hover:scale-110" />
              <span className="hidden lg:block text-sm font-medium">Tema & Tampilan</span>
            </button>

            <button 
              onClick={() => { playHaptic('pop'); setIsGlossaryModalOpen(true); }} 
              className="w-full flex items-center justify-center lg:justify-start gap-3 p-3 lg:px-4 lg:py-3 rounded-xl text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--hover-fill)] transition-all group"
              title="Kamus Regulasi & Glosarium Hukum APIP (Ctrl+G)"
            >
              <BookOpen size={18} className="text-[var(--accent)] transition-transform group-hover:scale-110" />
              <span className="hidden lg:block text-sm font-medium">Kamus Regulasi</span>
            </button>

            {/* MODE TOGGLES */}
            <button 
              onClick={() => setIsPresentationMode(!isPresentationMode)} 
              className={`w-full flex items-center justify-center lg:justify-start gap-3 p-3 lg:px-4 lg:py-3 rounded-xl transition-all ${isPresentationMode ? 'bg-blue-500/10 text-blue-400 font-semibold' : 'text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--hover-fill)]'}`}
              title="Mode Rapat / Presentasi"
            >
              <Monitor size={18} />
              <span className="hidden lg:block text-sm font-medium">Mode Rapat</span>
            </button>

            <button 
              onClick={() => { const newVal = !isCompactMode; setIsCompactMode(newVal); localStorage.setItem('isCompactMode', String(newVal)); }} 
              className={`w-full flex items-center justify-center lg:justify-start gap-3 p-3 lg:px-4 lg:py-3 rounded-xl transition-all ${isCompactMode ? 'bg-purple-500/10 text-purple-400 font-semibold' : 'text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--hover-fill)]'}`}
              title="Mode Compact / Padat"
            >
              <Rows3 size={18} />
              <span className="hidden lg:block text-sm font-medium">Mode Padat</span>
            </button>

            {userRole === 'admin' && (
              <button 
                onClick={() => { const newVal = !isMaintenanceMode; setIsMaintenanceMode(newVal); localStorage.setItem('isMaintenanceMode', String(newVal)); }} 
                className={`w-full flex items-center justify-center lg:justify-start gap-3 p-3 lg:px-4 lg:py-3 rounded-xl transition-all ${isMaintenanceMode ? 'bg-amber-500/10 text-amber-400 font-semibold' : 'text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--hover-fill)]'}`}
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
                className="w-full flex items-center justify-center lg:justify-start gap-3 p-3 lg:px-4 lg:py-3.5 rounded-xl text-[var(--accent)] hover:bg-[var(--accent)]/10 transition-all border border-dashed border-[var(--accent)]"
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
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                  userRole === 'admin' 
                    ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30 shadow-sm' 
                    : 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30'
                }`}>
                  {userName ? userName.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-[var(--text-main)] truncate">{userName}</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className={`inline-block w-1.5 h-1.5 rounded-full ${userRole === 'admin' ? 'bg-amber-400 animate-pulse' : 'bg-cyan-400'}`} />
                    <span className={`text-[10px] font-bold tracking-wide uppercase ${userRole === 'admin' ? 'text-amber-400' : 'text-cyan-400'}`}>
                      {userRole === 'admin' ? 'Administrator' : 'Pengguna / Tamu'}
                    </span>
                  </div>
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

            {/* FILTER OPD DROPDOWN SELECTOR */}
            <div className="relative">
              <button
                onClick={() => { playHaptic('click'); setIsOpdDropdownOpen(!isOpdDropdownOpen); }}
                className={`flex items-center gap-2 px-3 sm:px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm font-semibold transition-all shadow-sm ${
                  selectedOpdFilter !== 'all'
                    ? 'bg-[var(--accent)] text-[var(--accent-fg)] border-[var(--accent)] ring-2 ring-[var(--accent)]/30'
                    : 'bg-white/[0.04] hover:bg-[var(--hover-fill)] text-[var(--text-main)] border-[var(--border-line)] hover:border-[var(--border-strong)]'
                }`}
                title="Filter Dokumen berdasarkan OPD Binaan Irban 3"
              >
                <Landmark size={15} className={selectedOpdFilter !== 'all' ? 'text-[var(--accent-fg)]' : 'text-[var(--accent)]'} />
                <span className="hidden sm:inline max-w-[130px] truncate">
                  {selectedOpdFilter === 'all'
                    ? 'Semua OPD'
                    : opdList.find(o => o.id === selectedOpdFilter)?.code || 'Filter OPD'}
                </span>
                <span className="sm:hidden">
                  {selectedOpdFilter === 'all' ? 'OPD' : opdList.find(o => o.id === selectedOpdFilter)?.code || 'OPD'}
                </span>
                {selectedOpdFilter !== 'all' && (
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-black/20 text-white">
                    {opdCounts[selectedOpdFilter] || 0}
                  </span>
                )}
                <ChevronDown size={14} className={`transition-transform duration-200 ${isOpdDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Popover / Dropdown Menu */}
              {isOpdDropdownOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setIsOpdDropdownOpen(false)} 
                  />
                  <div 
                    className="absolute right-0 sm:left-0 top-full mt-2 w-80 sm:w-96 rounded-2xl bg-[var(--surface-color)]/95 backdrop-blur-2xl border border-[var(--border-line)] shadow-2xl z-50 p-3 space-y-2.5 animate-in fade-in slide-in-from-top-2 duration-150"
                    style={{ backdropFilter: 'blur(24px)' }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between pb-2 border-b border-[var(--border-line)]">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-[var(--accent)]/15 text-[var(--accent)] flex items-center justify-center">
                          <Building2 size={15} />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-[var(--text-main)]">Filter OPD Pengawasan</h4>
                          <p className="text-[10px] text-[var(--text-muted)]">Irban Wilayah III Prov. Sultra</p>
                        </div>
                      </div>
                      {userRole === 'admin' && (
                        <button
                          onClick={() => { setIsOpdDropdownOpen(false); setIsManageOpdModalOpen(true); }}
                          className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--accent)] hover:bg-[var(--hover-fill)] transition-colors"
                          title="Atur Daftar OPD / Tambah OPD Baru"
                        >
                          <Settings size={14} />
                        </button>
                      )}
                    </div>

                    {/* Filter Tab & Search Input */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-1 p-1 rounded-xl bg-[var(--hover-fill)] border border-[var(--border-line)] text-xs">
                        <button
                          type="button"
                          onClick={() => setOpdOnlyBinaan(false)}
                          className={`flex-1 py-1 rounded-lg font-medium transition-all text-center ${
                            !opdOnlyBinaan 
                              ? 'bg-[var(--accent)] text-[var(--accent-fg)] font-semibold shadow-xs' 
                              : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
                          }`}
                        >
                          Semua OPD ({opdList.length})
                        </button>
                        <button
                          type="button"
                          onClick={() => setOpdOnlyBinaan(true)}
                          className={`flex-1 py-1 rounded-lg font-medium transition-all text-center flex items-center justify-center gap-1 ${
                            opdOnlyBinaan 
                              ? 'bg-[var(--accent)] text-[var(--accent-fg)] font-semibold shadow-xs' 
                              : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
                          }`}
                        >
                          <Star size={11} className={opdOnlyBinaan ? 'fill-current' : ''} />
                          Binaan Irban 3 ({opdList.filter(o => o.isBinaanIrban3).length})
                        </button>
                      </div>

                      <div className="relative">
                        <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                        <input
                          type="text"
                          value={opdSearchQuery}
                          onChange={(e) => setOpdSearchQuery(e.target.value)}
                          placeholder="Cari nama atau kode OPD..."
                          className="w-full bg-[var(--hover-fill)] border border-[var(--border-line)] rounded-xl py-1.5 pl-8 pr-3 text-xs text-[var(--text-main)] placeholder:text-slate-500 outline-none focus:border-[var(--accent)] transition-all"
                        />
                        {opdSearchQuery && (
                          <button onClick={() => setOpdSearchQuery('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-[var(--text-main)]">
                            <X size={12} />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* OPD List Scrollable */}
                    <div className="max-h-60 overflow-y-auto space-y-1 custom-scrollbar pr-0.5">
                      {/* Opsi "Semua OPD" */}
                      <button
                        onClick={() => {
                          playHaptic('click');
                          setSelectedOpdFilter('all');
                          setIsOpdDropdownOpen(false);
                        }}
                        className={`w-full flex items-center justify-between p-2 rounded-xl text-left transition-all text-xs ${
                          selectedOpdFilter === 'all'
                            ? 'bg-[var(--accent)]/15 text-[var(--accent)] border border-[var(--accent)]/30 font-semibold'
                            : 'hover:bg-[var(--hover-fill)] text-[var(--text-main)] border border-transparent'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${selectedOpdFilter === 'all' ? 'bg-[var(--accent)]' : 'bg-slate-500'}`} />
                          <div>
                            <p className="font-semibold">Semua OPD (Tanpa Filter)</p>
                            <p className="text-[10px] text-[var(--text-muted)]">Tampilkan seluruh arsip</p>
                          </div>
                        </div>
                        {selectedOpdFilter === 'all' && <Check size={14} className="text-[var(--accent)]" />}
                      </button>

                      {/* Filtered OPDs */}
                      {opdList
                        .filter(o => {
                          if (opdOnlyBinaan && !o.isBinaanIrban3) return false;
                          if (!opdSearchQuery.trim()) return true;
                          const q = opdSearchQuery.toLowerCase();
                          return o.name.toLowerCase().includes(q) || 
                                 o.code.toLowerCase().includes(q) ||
                                 o.aliases.some(a => a.toLowerCase().includes(q));
                        })
                        .map(opd => {
                          const isSelected = selectedOpdFilter === opd.id;
                          const count = opdCounts[opd.id] || 0;
                          return (
                            <div
                              key={opd.id}
                              onClick={() => {
                                playHaptic('click');
                                setSelectedOpdFilter(isSelected ? 'all' : opd.id);
                                setIsOpdDropdownOpen(false);
                              }}
                              className={`group w-full flex items-center justify-between p-2 rounded-xl cursor-pointer transition-all text-xs border ${
                                isSelected
                                  ? 'bg-[var(--accent)]/15 text-[var(--accent)] border-[var(--accent)]/40 font-semibold'
                                  : 'hover:bg-[var(--hover-fill)] text-[var(--text-main)] border-transparent'
                              }`}
                            >
                              <div className="flex items-center gap-2 min-w-0 pr-2">
                                {userRole === 'admin' ? (
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleToggleOpdBinaan(opd.id);
                                    }}
                                    className="p-1 rounded hover:bg-white/10 text-slate-500 hover:text-amber-400 transition-colors flex-shrink-0"
                                    title={opd.isBinaanIrban3 ? "Hapus dari Binaan Irban 3" : "Tandai sebagai Binaan Irban 3"}
                                  >
                                    <Star size={13} className={opd.isBinaanIrban3 ? "fill-amber-400 text-amber-400" : ""} />
                                  </button>
                                ) : (
                                  <div className="p-1 text-slate-500 flex-shrink-0" title={opd.isBinaanIrban3 ? "OPD Binaan Irban 3" : "Bukan Binaan"}>
                                    <Star size={13} className={opd.isBinaanIrban3 ? "fill-amber-400 text-amber-400" : "opacity-30"} />
                                  </div>
                                )}
                                <div className="min-w-0">
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    <span className="font-bold text-[var(--text-main)] truncate">{opd.code}</span>
                                    <span className="text-[9px] px-1.5 py-0.2 rounded-md bg-[var(--hover-fill)] text-[var(--text-muted)] border border-[var(--border-line)]">
                                      {opd.category}
                                    </span>
                                  </div>
                                  <p className="text-[10px] text-[var(--text-muted)] truncate max-w-[200px]" title={opd.name}>
                                    {opd.name}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-1.5 flex-shrink-0">
                                {count > 0 && (
                                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                                    isSelected 
                                      ? 'bg-[var(--accent)] text-[var(--accent-fg)]' 
                                      : 'bg-[var(--hover-fill)] text-[var(--text-muted)] border border-[var(--border-line)]'
                                  }`}>
                                    {count}
                                  </span>
                                )}
                                {isSelected && <Check size={14} className="text-[var(--accent)] ml-1" />}
                              </div>
                            </div>
                          );
                        })}
                    </div>

                    {/* Footer inside Popover */}
                    <div className="pt-2 border-t border-[var(--border-line)] flex items-center justify-between text-xs">
                      {selectedOpdFilter !== 'all' ? (
                        <button
                          onClick={() => {
                            playHaptic('click');
                            setSelectedOpdFilter('all');
                            setIsOpdDropdownOpen(false);
                          }}
                          className="text-[11px] text-rose-400 hover:underline flex items-center gap-1"
                        >
                          <X size={12} /> Reset Filter OPD
                        </button>
                      ) : (
                        <span className="text-[10px] text-slate-500">Klik bintang untuk prioritaskan OPD</span>
                      )}
                      {userRole === 'admin' && (
                        <button
                          onClick={() => {
                            setIsOpdDropdownOpen(false);
                            setIsManageOpdModalOpen(true);
                          }}
                          className="text-[11px] text-[var(--accent)] hover:underline flex items-center gap-1 font-semibold ml-auto"
                        >
                          <Plus size={12} /> Tambah OPD
                        </button>
                      )}
                    </div>
                  </div>
                </>
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
                <div className="flex items-center gap-2">
                  <button 
                    onClick={openCreateFolderModal}
                    className="bg-[var(--bg-panel)] hover:bg-[var(--hover-fill)] text-[var(--text-main)] border border-[var(--border-line)] hover:border-[var(--border-strong)] px-3.5 py-2.5 rounded-xl font-semibold text-xs sm:text-sm transition-all flex items-center gap-2 shadow-sm"
                    title="Tambah Folder Baru"
                  >
                    <FolderPlus size={16} className="text-[var(--accent)]" />
                    <span className="hidden sm:inline">Folder Baru</span>
                  </button>
                  <button 
                    onClick={() => { setUploadStatus('idle'); setUploadErrorMessage(''); setUploadDestinationId(currentFolder); setIsUploadModalOpen(true); }}
                    className="bg-[var(--accent)] hover:opacity-90 text-[var(--accent-fg)] px-4 py-2.5 rounded-xl font-semibold text-sm transition-all flex items-center gap-2 shadow-sm"
                  >
                    <Plus size={16} strokeWidth={2.5} />
                    <span className="hidden lg:block">Upload</span>
                  </button>
                </div>
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
                            <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                              <p className="text-[10px] sm:text-[11px] text-[var(--text-muted)]">Folder</p>
                              {(() => {
                                const chk = checklistGlobalData?.checklists?.find((c: any) => c.id === folder.id);
                                if (!chk || chk.status === 'empty') return null;
                                return (
                                  <div className="flex items-center gap-1">
                                    <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold border ${
                                      chk.hasSt ? 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                                    }`}>
                                      {chk.hasSt ? '✓ ST' : '✗ ST'}
                                    </span>
                                    <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold border ${
                                      chk.hasLhp ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                                    }`}>
                                      {chk.hasLhp ? '✓ LHP' : '✗ LHP'}
                                    </span>
                                  </div>
                                );
                              })()}
                            </div>
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

                        {/* Tombol Matriks Checklist Kelengkapan LHP & ST */}
                        <button
                          onClick={() => {
                            playHaptic('click');
                            setIsChecklistModalOpen(true);
                            fetchGlobalChecklist();
                          }}
                          className="flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 bg-gradient-to-r from-emerald-500/15 to-cyan-500/15 hover:from-emerald-500/25 hover:to-cyan-500/25 text-[var(--text-main)] border border-emerald-500/30 rounded-xl text-xs font-semibold transition-all shadow-sm group"
                          title="Buka Matriks Rekapitulasi Kelengkapan LHP & Surat Tugas (ST)"
                        >
                          <ClipboardCheck size={15} className="text-emerald-400 group-hover:scale-110 transition-transform" />
                          <span className="hidden sm:inline">Checklist LHP & ST</span>
                          <span className="sm:hidden">Checklist</span>
                          {checklistGlobalData?.summary?.completeCount !== undefined && (
                            <span className="text-[10px] px-1.5 py-0.2 bg-emerald-500/20 text-emerald-400 rounded-full font-bold">
                              {checklistGlobalData.summary.completeCount}/{checklistGlobalData.summary.totalFolders}
                            </span>
                          )}
                        </button>

                        {/* Tombol Mode Pilih Banyak (Multi-Select) */}
                        {userRole === 'admin' && (
                          <button
                            onClick={() => {
                              playHaptic('click');
                              if (isMultiSelectMode) {
                                setIsMultiSelectMode(false);
                                setSelectedFileIds(new Set());
                              } else {
                                setIsMultiSelectMode(true);
                              }
                            }}
                            className={`flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-xs font-semibold transition-all border shadow-sm ${
                              isMultiSelectMode
                                ? 'bg-[var(--accent)] text-[var(--accent-fg)] border-[var(--accent)] ring-2 ring-[var(--accent)]/30'
                                : 'bg-[var(--hover-fill)] text-[var(--text-muted)] hover:text-[var(--text-main)] border-[var(--border-line)] hover:border-[var(--border-strong)]'
                            }`}
                            title={isMultiSelectMode ? 'Keluar dari Mode Pilih Banyak' : 'Aktifkan Mode Pilih Banyak untuk Memindahkan Dokumen Sekaligus'}
                          >
                            <CheckSquare size={14} className={isMultiSelectMode ? 'text-[var(--accent-fg)]' : 'text-[var(--accent)]'} />
                            <span className="hidden sm:inline">{isMultiSelectMode ? 'Selesai Pilih' : 'Pilih Banyak'}</span>
                            <span className="sm:hidden">Pilih</span>
                            {selectedFileIds.size > 0 && (
                              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                                isMultiSelectMode ? 'bg-black/30 text-white' : 'bg-[var(--accent)] text-[var(--accent-fg)]'
                              }`}>
                                {selectedFileIds.size}
                              </span>
                            )}
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  {/* CARD CHECKLIST KELENGKAPAN PENUGASAN (LHP & ST) */}
                  {(currentFolder || selectedOpdFilter !== 'all') && (
                    <motion.div
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mb-4 p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-[var(--bg-panel)] via-[var(--hover-fill)]/60 to-[var(--bg-panel)] border border-[var(--border-line)] shadow-lg relative overflow-hidden"
                    >
                      {/* Accent line on top */}
                      <div className={`absolute top-0 left-0 right-0 h-1 ${
                        viewCompletenessScore === 100 
                          ? 'bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500' 
                          : viewCompletenessScore === 50 
                            ? 'bg-gradient-to-r from-amber-500 via-orange-400 to-amber-500' 
                            : 'bg-gradient-to-r from-slate-600 via-slate-500 to-slate-600'
                      }`} />

                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-11 h-11 rounded-2xl flex items-center justify-center font-bold flex-shrink-0 shadow-sm ${
                            viewCompletenessScore === 100
                              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                              : viewCompletenessScore === 50
                                ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                                : 'bg-slate-500/15 text-slate-400 border border-slate-500/30'
                          }`}>
                            <ClipboardCheck size={22} />
                          </div>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="text-sm sm:text-base font-bold text-[var(--text-main)]">
                                Checklist Kelengkapan Penugasan
                              </h3>
                              <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-bold border flex items-center gap-1 ${
                                viewCompletenessScore === 100
                                  ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                                  : viewCompletenessScore === 50
                                    ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                                    : 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                              }`}>
                                {viewCompletenessScore === 100 && <CheckCircle2 size={12} />}
                                {viewCompletenessScore === 50 && <AlertCircle size={12} />}
                                {viewCompletenessScore === 0 && <X size={12} />}
                                {viewCompletenessScore === 100 ? 'Lengkap (2/2 Dokumen)' : viewCompletenessScore === 50 ? 'Sebagian (1/2 Dokumen)' : 'Belum Ada Berkas Wajib (0/2)'}
                              </span>
                            </div>
                            <p className="text-xs text-[var(--text-muted)] mt-0.5">
                              Standar penugasan pengawasan Irban 3 mewajibkan minimal 2 dokumen utama: <strong>Surat Tugas (ST)</strong> dan <strong>Laporan Hasil Pengawasan (LHP)</strong>.
                            </p>
                          </div>
                        </div>

                        {/* Progress Bar & Quick Matrix button */}
                        <div className="flex items-center gap-3 self-end md:self-center flex-shrink-0">
                          <div className="text-right">
                            <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider font-semibold">Skor Kelengkapan</p>
                            <p className={`text-sm font-bold ${
                              viewCompletenessScore === 100 ? 'text-emerald-400' : viewCompletenessScore === 50 ? 'text-amber-400' : 'text-slate-400'
                            }`}>
                              {viewCompletenessScore}%
                            </p>
                          </div>
                          <button
                            onClick={() => {
                              playHaptic('click');
                              setIsChecklistModalOpen(true);
                              fetchGlobalChecklist();
                            }}
                            className="px-3 py-1.5 rounded-xl bg-[var(--hover-fill)] hover:bg-[var(--accent)] hover:text-slate-950 text-[var(--text-main)] border border-[var(--border-line)] text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs"
                            title="Buka seluruh matriks kelengkapan OPD binaan Irban 3"
                          >
                            <CheckSquare size={13} />
                            <span>Buka Matriks</span>
                          </button>
                        </div>
                      </div>

                      {/* 2 Slot Kartu Dokumen: ST & LHP */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {/* SLOT 1: SURAT TUGAS (ST) */}
                        <div className={`p-3.5 rounded-xl border transition-all ${
                          hasStInCurrentView
                            ? 'bg-cyan-500/[0.04] border-cyan-500/30'
                            : 'bg-rose-500/[0.03] border-rose-500/20 border-dashed'
                        }`}>
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                                hasStInCurrentView ? 'bg-cyan-500/20 text-cyan-400' : 'bg-rose-500/10 text-rose-400'
                              }`}>
                                <ClipboardCheck size={16} />
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-1.5">
                                  <span className="text-xs font-bold text-[var(--text-main)]">1. Surat Tugas (ST / SPT)</span>
                                  {hasStInCurrentView ? (
                                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-400 font-bold">Terpenuhi</span>
                                  ) : (
                                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-400 font-bold">Belum Ada</span>
                                  )}
                                </div>
                                {hasStInCurrentView ? (
                                  <p className="text-[11px] text-cyan-300/80 truncate mt-0.5" title={viewStFiles[0].name}>
                                    📄 {viewStFiles[0].name}
                                  </p>
                                ) : (
                                  <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
                                    Belum ada Surat Perintah Tugas di penugasan ini
                                  </p>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center gap-1 flex-shrink-0">
                              {hasStInCurrentView ? (
                                <button
                                  onClick={() => { playHaptic('click'); handleFileSelect(viewStFiles[0]); }}
                                  className="px-2.5 py-1 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-400 text-xs font-medium flex items-center gap-1 transition-colors"
                                  title="Preview Surat Tugas"
                                >
                                  <Eye size={12} /> Buka ST
                                </button>
                              ) : (
                                <button
                                  onClick={() => {
                                    playHaptic('click');
                                    setIsUploadModalOpen(true);
                                    if (currentFolder) setUploadDestinationId(currentFolder);
                                  }}
                                  className="px-2.5 py-1 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 text-rose-400 text-xs font-semibold flex items-center gap-1 transition-colors"
                                  title="Unggah Surat Tugas sekarang"
                                >
                                  <Upload size={12} /> Unggah ST
                                </button>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* SLOT 2: LAPORAN HASIL PENGAWASAN (LHP) */}
                        <div className={`p-3.5 rounded-xl border transition-all ${
                          hasLhpInCurrentView
                            ? 'bg-emerald-500/[0.04] border-emerald-500/30'
                            : 'bg-rose-500/[0.03] border-rose-500/20 border-dashed'
                        }`}>
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                                hasLhpInCurrentView ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                              }`}>
                                <FileCheck size={16} />
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-1.5">
                                  <span className="text-xs font-bold text-[var(--text-main)]">2. Laporan Hasil (LHP)</span>
                                  {hasLhpInCurrentView ? (
                                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 font-bold">Terpenuhi</span>
                                  ) : (
                                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-400 font-bold">Belum Ada</span>
                                  )}
                                </div>
                                {hasLhpInCurrentView ? (
                                  <p className="text-[11px] text-emerald-300/80 truncate mt-0.5" title={viewLhpFiles[0].name}>
                                    📑 {viewLhpFiles[0].name}
                                  </p>
                                ) : (
                                  <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
                                    Belum ada LHP final bertandatangan di penugasan ini
                                  </p>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center gap-1 flex-shrink-0">
                              {hasLhpInCurrentView ? (
                                <button
                                  onClick={() => { playHaptic('click'); handleFileSelect(viewLhpFiles[0]); }}
                                  className="px-2.5 py-1 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 text-xs font-medium flex items-center gap-1 transition-colors"
                                  title="Preview Laporan Hasil Pengawasan"
                                >
                                  <Eye size={12} /> Buka LHP
                                </button>
                              ) : (
                                <button
                                  onClick={() => {
                                    playHaptic('click');
                                    setIsUploadModalOpen(true);
                                    if (currentFolder) setUploadDestinationId(currentFolder);
                                  }}
                                  className="px-2.5 py-1 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 text-rose-400 text-xs font-semibold flex items-center gap-1 transition-colors"
                                  title="Unggah LHP sekarang"
                                >
                                  <Upload size={12} /> Unggah LHP
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}


                  {/* BANNER OPD AKTIF */}
                  {selectedOpdFilter !== 'all' && (() => {
                    const activeOpd = opdList.find(o => o.id === selectedOpdFilter);
                    if (!activeOpd) return null;
                    const matchCount = opdCounts[activeOpd.id] || 0;
                    const matchingFolder = allFolders.find(f => {
                      const fLower = f.name.toLowerCase();
                      return activeOpd.aliases.some(alias => fLower.includes(alias.toLowerCase())) ||
                             fLower.includes(activeOpd.code.toLowerCase());
                    });

                    return (
                      <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        className="mb-4 p-4 rounded-2xl bg-gradient-to-r from-[var(--accent)]/15 via-[var(--accent)]/5 to-transparent border border-[var(--accent)]/30 backdrop-blur-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg shadow-[var(--accent)]/5"
                      >
                        <div className="flex items-center gap-3.5">
                          <div className="w-10 h-10 rounded-xl bg-[var(--accent)] text-[var(--accent-fg)] flex items-center justify-center font-bold shadow-md flex-shrink-0">
                            <Building2 size={20} />
                          </div>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--accent)]/20 text-[var(--accent)] font-semibold border border-[var(--accent)]/30">
                                {activeOpd.category}
                              </span>
                              {activeOpd.isBinaanIrban3 && (
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 font-bold border border-amber-500/30 flex items-center gap-1">
                                  <Star size={10} className="fill-amber-400" /> Binaan Irban 3
                                </span>
                              )}
                              <h3 className="text-sm sm:text-base font-bold text-[var(--text-main)]">
                                {activeOpd.name}
                              </h3>
                            </div>
                            <p className="text-xs text-[var(--text-muted)] mt-0.5 flex items-center gap-2 flex-wrap">
                              <span>Kode: <strong className="text-[var(--text-main)]">{activeOpd.code}</strong></span>
                              <span>•</span>
                              <span className="text-[var(--accent)] font-semibold">
                                {matchCount} Dokumen / Folder Ditemukan
                              </span>
                              <span>•</span>
                              <span className="text-slate-500">Pencarian Otomatis Kata Kunci & Label</span>
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 self-end sm:self-center flex-shrink-0">
                          {matchingFolder && currentFolder !== matchingFolder.id && (
                            <button
                              onClick={() => {
                                playHaptic('click');
                                navigateToFolder(matchingFolder.id, matchingFolder.name);
                              }}
                              className="px-3 py-1.5 rounded-xl bg-[var(--accent)]/15 hover:bg-[var(--accent)]/25 text-[var(--accent)] border border-[var(--accent)]/30 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs"
                              title={`Lompat langsung ke folder Google Drive: ${matchingFolder.name}`}
                            >
                              <Folder size={14} />
                              <span>Buka Folder Drive</span>
                            </button>
                          )}
                          <button
                            onClick={() => { playHaptic('pop'); setSelectedOpdFilter('all'); }}
                            className="px-3 py-1.5 rounded-xl bg-[var(--hover-fill)] hover:bg-rose-500/15 text-[var(--text-muted)] hover:text-rose-400 border border-[var(--border-line)] hover:border-rose-500/30 text-xs font-medium flex items-center gap-1 transition-all"
                            title="Hapus filter OPD ini"
                          >
                            <X size={13} />
                            <span>Reset OPD</span>
                          </button>
                        </div>
                      </motion.div>
                    );
                  })()}

                  {/* QUICK OPD FILTER CHIP BAR */}
                  <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-3 scrollbar-none">
                    <span className="text-xs text-[var(--text-muted)] flex items-center gap-1.5 flex-shrink-0 font-medium">
                      <Landmark size={13} className="text-[var(--accent)]" /> OPD Binaan:
                    </span>
                    <button
                      onClick={() => { playHaptic('click'); setSelectedOpdFilter('all'); }}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-all whitespace-nowrap border ${
                        selectedOpdFilter === 'all'
                          ? 'bg-[var(--accent)] text-[var(--accent-fg)] border-[var(--accent)] shadow-sm'
                          : 'bg-[var(--hover-fill)] text-[var(--text-muted)] hover:text-[var(--text-main)] border-[var(--border-line)]'
                      }`}
                    >
                      Semua
                    </button>
                    {opdList
                      .filter(o => o.isBinaanIrban3)
                      .map(opd => {
                        const isSelected = selectedOpdFilter === opd.id;
                        const count = opdCounts[opd.id] || 0;
                        return (
                          <button
                            key={opd.id}
                            onClick={() => { playHaptic('click'); setSelectedOpdFilter(isSelected ? 'all' : opd.id); }}
                            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-all whitespace-nowrap border ${
                              isSelected
                                ? 'bg-[var(--accent)]/15 text-[var(--accent)] border-[var(--accent)] ring-2 ring-[var(--accent)]/30 font-semibold shadow-sm'
                                : 'bg-[var(--hover-fill)] text-[var(--text-muted)] hover:text-[var(--text-main)] border-[var(--border-line)]'
                            }`}
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]"></span>
                            <span>{opd.code}</span>
                            {count > 0 && (
                              <span className="text-[10px] px-1 py-0.2 rounded-full bg-white/10 opacity-90 font-bold">
                                {count}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    <button
                      onClick={() => { playHaptic('click'); setIsManageOpdModalOpen(true); }}
                      className="text-[11px] text-[var(--text-muted)] hover:text-[var(--accent)] flex items-center gap-1 px-2 whitespace-nowrap transition-colors"
                      title="Atur OPD Binaan Irban 3 atau Tambah OPD Baru"
                    >
                      <Sliders size={12} /> Atur OPD
                    </button>
                  </div>

                  {/* QUICK CHECKLIST (LHP & ST) FILTER CHIP BAR */}
                  <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-3 scrollbar-none">
                    <span className="text-xs text-[var(--text-muted)] flex items-center gap-1.5 flex-shrink-0 font-medium">
                      <ClipboardCheck size={13} className="text-emerald-400" /> Dokumen Wajib:
                    </span>
                    <button
                      onClick={() => { playHaptic('click'); setSelectedDocRoleFilter('all'); }}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-all whitespace-nowrap border ${
                        selectedDocRoleFilter === 'all'
                          ? 'bg-[var(--accent)] text-[var(--accent-fg)] border-[var(--accent)] shadow-sm'
                          : 'bg-[var(--hover-fill)] text-[var(--text-muted)] hover:text-[var(--text-main)] border-[var(--border-line)]'
                      }`}
                    >
                      Semua Dokumen
                    </button>
                    <button
                      onClick={() => { playHaptic('click'); setSelectedDocRoleFilter(selectedDocRoleFilter === 'LHP' ? 'all' : 'LHP'); }}
                      className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-all whitespace-nowrap border ${
                        selectedDocRoleFilter === 'LHP'
                          ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 ring-2 ring-emerald-500/20 font-bold shadow-sm'
                          : 'bg-[var(--hover-fill)] text-[var(--text-muted)] hover:text-emerald-400 border-[var(--border-line)]'
                      }`}
                    >
                      <FileCheck size={12} className="text-emerald-400" />
                      <span>📑 Hanya LHP</span>
                    </button>
                    <button
                      onClick={() => { playHaptic('click'); setSelectedDocRoleFilter(selectedDocRoleFilter === 'ST' ? 'all' : 'ST'); }}
                      className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-all whitespace-nowrap border ${
                        selectedDocRoleFilter === 'ST'
                          ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40 ring-2 ring-cyan-500/20 font-bold shadow-sm'
                          : 'bg-[var(--hover-fill)] text-[var(--text-muted)] hover:text-cyan-400 border-[var(--border-line)]'
                      }`}
                    >
                      <ClipboardCheck size={12} className="text-cyan-400" />
                      <span>📜 Hanya Surat Tugas (ST)</span>
                    </button>
                    <button
                      onClick={() => { playHaptic('click'); setIsChecklistModalOpen(true); fetchGlobalChecklist(); }}
                      className="text-[11px] text-[var(--text-muted)] hover:text-emerald-400 flex items-center gap-1 px-2 whitespace-nowrap transition-colors font-medium ml-auto"
                      title="Buka Matriks Rekapitulasi Kelengkapan LHP & ST"
                    >
                      <CheckSquare size={12} /> Buka Matriks Lengkap
                    </button>
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

                  {/* Banner Status Mode Pilih Banyak (Multi-Select) */}
                  <AnimatePresence>
                    {isMultiSelectMode && userRole === 'admin' && (
                      <motion.div
                        initial={{ opacity: 0, height: 0, y: -6 }}
                        animate={{ opacity: 1, height: 'auto', y: 0 }}
                        exit={{ opacity: 0, height: 0, y: -6 }}
                        className="mb-4 p-3 sm:p-3.5 rounded-2xl bg-gradient-to-r from-[var(--accent)]/15 via-[var(--accent)]/10 to-amber-500/10 border border-[var(--accent)]/30 flex flex-wrap items-center justify-between gap-3 shadow-md"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="p-2 rounded-xl bg-[var(--accent)] text-[var(--accent-fg)] flex-shrink-0 shadow-sm">
                            <CheckSquare size={16} />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-[var(--text-main)] flex items-center gap-2">
                              <span>Mode Pilih Banyak Aktif</span>
                              {selectedFileIds.size > 0 && (
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--accent)] text-[var(--accent-fg)] font-bold">
                                  {selectedFileIds.size} dipilih
                                </span>
                              )}
                            </p>
                            <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
                              Klik pada dokumen untuk memilih, lalu tekan tombol "Pindahkan" untuk memindahkan sekaligus ke folder tujuan
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 flex-wrap ml-auto">
                          <button
                            onClick={handleSelectAllFiles}
                            className="px-3 py-1.5 rounded-xl bg-[var(--bg-panel)] hover:bg-[var(--hover-fill)] text-[var(--accent)] border border-[var(--accent)]/40 text-xs font-semibold transition-all shadow-sm"
                          >
                            {filteredFilesMain.filter(f => !f.mimeType.includes('folder')).length > 0 &&
                             filteredFilesMain.filter(f => !f.mimeType.includes('folder')).every(f => selectedFileIds.has(f.id))
                              ? 'Lepas Semua'
                              : `Pilih Semua (${filteredFilesMain.filter(f => !f.mimeType.includes('folder')).length})`}
                          </button>
                          {selectedFileIds.size > 0 && (
                            <button
                              onClick={openBatchMoveModal}
                              className="px-3.5 py-1.5 rounded-xl bg-[var(--accent)] hover:opacity-90 text-[var(--accent-fg)] text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
                            >
                              <FolderInput size={14} /> Pindahkan ({selectedFileIds.size})
                            </button>
                          )}
                          <button
                            onClick={() => {
                              setIsMultiSelectMode(false);
                              setSelectedFileIds(new Set());
                            }}
                            className="px-3 py-1.5 rounded-xl bg-[var(--hover-fill)] hover:bg-white/10 text-[var(--text-muted)] hover:text-[var(--text-main)] border border-[var(--border-line)] text-xs font-medium transition-all"
                          >
                            Tutup
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

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
                          initial={{ opacity: 0, y: 8 }} 
                          animate={{ opacity: 1, y: 0 }} 
                          transition={{ delay: Math.min(i * 0.015, 0.2), duration: 0.2 }}
                          key={file.id}
                          onClick={() => {
                            if (file.mimeType.includes('folder')) {
                              navigateToFolder(file.id, file.name);
                            } else if (isMultiSelectMode || selectedFileIds.size > 0) {
                              toggleSelectFile(file.id);
                            } else {
                              handleFileSelect(file);
                            }
                          }}
                          className={`group relative bg-[var(--hover-fill)] ${isCompactMode ? 'p-3' : 'p-4 sm:p-5'} rounded-2xl border cursor-pointer transition-all ${
                            selectedFileIds.has(file.id)
                              ? 'border-[var(--accent)] bg-[var(--accent)]/[0.08] ring-2 ring-[var(--accent)]/40 shadow-lg'
                              : selectedFile?.id === file.id 
                                ? 'border-[var(--accent)] bg-[var(--accent)]/[0.05]' 
                                : 'border-[var(--border-line)] hover:border-[var(--border-strong)] hover:bg-[var(--hover-fill)]'
                          }`}
                        >
                          {/* Multi-Select Checkbox Badge */}
                          {!file.mimeType.includes('folder') && userRole === 'admin' && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (!isMultiSelectMode) setIsMultiSelectMode(true);
                                toggleSelectFile(file.id);
                              }}
                              className={`absolute top-2.5 left-2.5 z-10 w-6 h-6 rounded-lg flex items-center justify-center transition-all shadow-sm ${
                                selectedFileIds.has(file.id)
                                  ? 'bg-[var(--accent)] text-[var(--accent-fg)] ring-2 ring-[var(--accent)]/40 scale-105 opacity-100'
                                  : isMultiSelectMode
                                    ? 'bg-black/50 hover:bg-black/80 text-white/40 hover:text-white border border-white/25 opacity-100'
                                    : 'bg-black/40 hover:bg-black/70 text-transparent hover:text-white/50 border border-white/20 opacity-0 group-hover:opacity-100'
                              }`}
                              title={selectedFileIds.has(file.id) ? "Batalkan pilihan berkas ini" : "Pilih berkas ini"}
                            >
                              <Check size={13} strokeWidth={3} className={selectedFileIds.has(file.id) ? 'opacity-100' : 'opacity-0 hover:opacity-50'} />
                            </button>
                          )}

                          <div className={`flex items-start justify-between ${isCompactMode ? 'mb-2' : 'mb-3 sm:mb-6'}`}>
                            <div className={`p-3 rounded-xl overflow-hidden ${
                              file.hasThumbnail && file.thumbnailLink 
                                ? 'p-0 w-16 h-16 bg-transparent' // Remove padding if it's an image thumbnail
                                : file.mimeType.includes('folder') 
                                  ? 'bg-[var(--accent)]/10 text-[var(--accent)]' 
                                  : 'bg-[var(--hover-fill)] text-[var(--text-muted)]'
                            }`}>
                              {file.hasThumbnail && file.thumbnailLink ? (
                                <img src={file.thumbnailLink} alt="Thumbnail" loading="lazy" decoding="async" className="w-full h-full object-cover rounded-xl border border-[var(--border-line)]" />
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
                                {!file.mimeType.includes('folder') && (
                                  <button onClick={(e) => { e.stopPropagation(); addOnlineLog("DOWNLOAD", file.name); window.open(`https://drive.google.com/uc?export=download&id=${file.id}`, '_blank'); }} className="p-2 rounded-lg hover:bg-[var(--hover-fill)] text-[var(--text-muted)] hover:text-[var(--text-main)] transition-all">
                                    <Download size={14}/>
                                  </button>
                                )}
                                {userRole === 'admin' && (
                                  <>
                                    {!file.mimeType.includes('folder') && (
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          const current = detectFileRole(file);
                                          const next = current === 'LHP' ? 'ST' : current === 'ST' ? 'none' : 'LHP';
                                          handleSetFileRole(file.id, next);
                                        }}
                                        title={
                                          detectFileRole(file) === 'LHP' 
                                            ? "Peran: LHP (Klik untuk ubah ke ST)" 
                                            : detectFileRole(file) === 'ST' 
                                              ? "Peran: Surat Tugas (Klik untuk hapus)" 
                                              : "Tandai sebagai LHP / Surat Tugas (ST)"
                                        }
                                        className={`p-2 rounded-lg transition-all ${
                                          detectFileRole(file) === 'LHP'
                                            ? 'text-emerald-400 bg-emerald-500/15 ring-1 ring-emerald-500/30'
                                            : detectFileRole(file) === 'ST'
                                              ? 'text-cyan-400 bg-cyan-500/15 ring-1 ring-cyan-500/30'
                                              : 'hover:bg-[var(--hover-fill)] text-[var(--text-muted)] hover:text-emerald-400'
                                        }`}
                                      >
                                        <BadgeCheck size={14} />
                                      </button>
                                    )}
                                    <button onClick={(e) => { e.stopPropagation(); openTagModal(file); }} title="Kelola Label" className="p-2 rounded-lg hover:bg-[var(--hover-fill)] text-[var(--text-muted)] hover:text-[var(--accent)] transition-all">
                                      <Tag size={14}/>
                                    </button>
                                    {!file.mimeType.includes('folder') && (
                                      <button onClick={(e) => { e.stopPropagation(); openMoveModal(file); }} title="Pindahkan Dokumen" className="p-2 rounded-lg hover:bg-[var(--hover-fill)] text-[var(--text-muted)] hover:text-amber-400 transition-all"><FolderInput size={14}/></button>
                                    )}
                                    <button onClick={(e) => { e.stopPropagation(); handleRename(file.id, file.name); }} title="Ganti Nama" className="p-2 rounded-lg hover:bg-[var(--hover-fill)] text-[var(--text-muted)] hover:text-blue-400 transition-all"><Edit2 size={14}/></button>
                                    <button onClick={(e) => { e.stopPropagation(); handleDelete(file.id, file.name); }} title="Hapus Berkas" className="p-2 rounded-lg hover:bg-[var(--hover-fill)] text-[var(--text-muted)] hover:text-red-400 transition-all"><Trash2 size={14}/></button>
                                  </>
                                )}
                              </div>
                            </div>
                            )}
                          </div>

                          <h4 title={file.name} className="text-xs sm:text-sm leading-tight sm:leading-normal font-medium text-[var(--text-main)] line-clamp-3 sm:truncate group-hover:text-[var(--accent)] transition-colors">{file.name}</h4>
                          <div className="flex items-center gap-2 mt-1 sm:mt-1.5 flex-wrap">
                            <p className="text-[10px] sm:text-[11px] text-[var(--text-muted)]">
                              {file.mimeType.includes('folder') ? 'Folder' : 'Dokumen'}
                            </p>
                            {!file.mimeType.includes('folder') && (() => {
                              const role = detectFileRole(file);
                              if (role === 'none') return null;
                              return role === 'LHP' ? (
                                <span className="inline-flex items-center gap-1 text-[9px] px-1.5 py-0.2 rounded font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                                  <FileCheck size={10} /> 📑 LHP
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-[9px] px-1.5 py-0.2 rounded font-bold bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
                                  <ClipboardCheck size={10} /> 📜 Surat Tugas
                                </span>
                              );
                            })()}
                          </div>

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
                      <div className="grid grid-cols-12 px-4 sm:px-5 py-3 border-b border-[var(--border-line)] text-xs font-medium text-[var(--text-muted)] bg-[var(--hover-fill)] items-center">
                        <div className="col-span-9 sm:col-span-7 flex items-center gap-2.5">
                          {userRole === 'admin' && (isMultiSelectMode || selectedFileIds.size > 0) && (
                            <button
                              type="button"
                              onClick={handleSelectAllFiles}
                              className={`w-5 h-5 rounded-md flex items-center justify-center transition-all flex-shrink-0 ${
                                filteredFilesMain.filter(f => !f.mimeType.includes('folder')).length > 0 &&
                                filteredFilesMain.filter(f => !f.mimeType.includes('folder')).every(f => selectedFileIds.has(f.id))
                                  ? 'bg-[var(--accent)] text-[var(--accent-fg)] border border-[var(--accent)]'
                                  : 'border border-[var(--border-strong)] bg-white/5 hover:border-[var(--accent)]'
                              }`}
                              title={
                                filteredFilesMain.filter(f => !f.mimeType.includes('folder')).every(f => selectedFileIds.has(f.id))
                                  ? "Batalkan pilihan semua"
                                  : "Pilih semua dokumen"
                              }
                            >
                              <Check size={12} strokeWidth={3} className={
                                filteredFilesMain.filter(f => !f.mimeType.includes('folder')).length > 0 &&
                                filteredFilesMain.filter(f => !f.mimeType.includes('folder')).every(f => selectedFileIds.has(f.id))
                                  ? 'opacity-100'
                                  : 'opacity-0'
                              } />
                            </button>
                          )}
                          <span>Nama</span>
                        </div>
                        <div className="hidden sm:block sm:col-span-3">Tipe</div>
                        <div className="col-span-3 sm:col-span-2 text-right">Aksi</div>
                      </div>
                      {filteredFilesMain.map(file => (
                        <div 
                          key={file.id} 
                          onClick={() => {
                            if (file.mimeType.includes('folder')) {
                              navigateToFolder(file.id, file.name);
                            } else if (isMultiSelectMode || selectedFileIds.size > 0) {
                              toggleSelectFile(file.id);
                            } else {
                              handleFileSelect(file);
                            }
                          }} 
                          className={`grid grid-cols-12 px-4 sm:px-5 py-3 sm:py-3.5 items-center transition-colors cursor-pointer group border-b border-[var(--border-line)] last:border-0 ${
                            selectedFileIds.has(file.id)
                              ? 'bg-[var(--accent)]/[0.08] hover:bg-[var(--accent)]/[0.12] border-l-4 border-l-[var(--accent)]'
                              : 'hover:bg-[var(--hover-fill)]'
                          }`}
                        >
                          <div className="col-span-9 sm:col-span-7 flex flex-col justify-center pr-2">
                            <div className="flex items-center gap-2 sm:gap-3">
                              {/* Checkbox Multi-Select in List View */}
                              {!file.mimeType.includes('folder') && userRole === 'admin' && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (!isMultiSelectMode) setIsMultiSelectMode(true);
                                    toggleSelectFile(file.id);
                                  }}
                                  className={`w-5 h-5 rounded-md flex items-center justify-center transition-all flex-shrink-0 ${
                                    selectedFileIds.has(file.id)
                                      ? 'bg-[var(--accent)] text-[var(--accent-fg)] border border-[var(--accent)] ring-1 ring-[var(--accent)]/40'
                                      : isMultiSelectMode
                                        ? 'border border-[var(--border-strong)] bg-white/5 hover:border-[var(--accent)]'
                                        : 'opacity-0 group-hover:opacity-100 border border-[var(--border-line)] hover:border-[var(--accent)]'
                                  }`}
                                  title={selectedFileIds.has(file.id) ? "Batalkan pilihan" : "Pilih berkas ini"}
                                >
                                  <Check size={12} strokeWidth={3} className={selectedFileIds.has(file.id) ? 'opacity-100' : 'opacity-0'} />
                                </button>
                              )}
                              <div className={`p-1.5 rounded-lg flex-shrink-0 ${file.mimeType.includes('folder') ? 'text-[var(--accent)] bg-[var(--accent)]/10' : 'text-[var(--text-muted)] bg-[var(--hover-fill)]'}`}>
                                {file.mimeType.includes('folder') ? <Folder size={16}/> : <FileText size={16}/>}
                              </div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <span title={file.name} className="text-xs sm:text-sm text-[var(--text-main)] group-hover:text-[var(--accent)] line-clamp-2 sm:truncate transition-colors leading-tight sm:leading-normal">{file.name}</span>
                                {!file.mimeType.includes('folder') && (() => {
                                  const role = detectFileRole(file);
                                  if (role === 'none') return null;
                                  return role === 'LHP' ? (
                                    <span className="inline-flex items-center gap-1 text-[9px] px-1.5 py-0.2 rounded font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                                      <FileCheck size={10} /> 📑 LHP
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 text-[9px] px-1.5 py-0.2 rounded font-bold bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
                                      <ClipboardCheck size={10} /> 📜 Surat Tugas
                                    </span>
                                  );
                                })()}
                              </div>
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
                            {!file.mimeType.includes('folder') && (
                              <button onClick={(e) => { e.stopPropagation(); addOnlineLog("DOWNLOAD", file.name); window.open(`https://drive.google.com/uc?export=download&id=${file.id}`, '_blank'); }} className="p-1.5 rounded-md text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--hover-fill)] transition-all"><Download size={14}/></button>
                            )}
                            {userRole === 'admin' && (
                              <>
                                {!file.mimeType.includes('folder') && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      const current = detectFileRole(file);
                                      const next = current === 'LHP' ? 'ST' : current === 'ST' ? 'none' : 'LHP';
                                      handleSetFileRole(file.id, next);
                                    }}
                                    title={
                                      detectFileRole(file) === 'LHP' 
                                        ? "Peran: LHP (Klik untuk ganti ke ST)" 
                                        : detectFileRole(file) === 'ST' 
                                          ? "Peran: Surat Tugas (Klik untuk hapus)" 
                                          : "Tandai sebagai LHP / Surat Tugas (ST)"
                                    }
                                    className={`p-1.5 rounded-md transition-all ${
                                      detectFileRole(file) === 'LHP'
                                        ? 'text-emerald-400 bg-emerald-500/15'
                                        : detectFileRole(file) === 'ST'
                                          ? 'text-cyan-400 bg-cyan-500/15'
                                          : 'text-[var(--text-muted)] hover:text-emerald-400 hover:bg-[var(--hover-fill)]'
                                    }`}
                                  >
                                    <BadgeCheck size={14}/>
                                  </button>
                                )}
                                <button onClick={(e) => { e.stopPropagation(); openTagModal(file); }} title="Kelola Label" className="p-1.5 rounded-md text-[var(--text-muted)] hover:text-[var(--accent)] hover:bg-[var(--hover-fill)] transition-all">
                                  <Tag size={14}/>
                                </button>
                                {!file.mimeType.includes('folder') && (
                                  <button onClick={(e) => { e.stopPropagation(); openMoveModal(file); }} title="Pindahkan Dokumen" className="p-1.5 rounded-md text-[var(--text-muted)] hover:text-amber-400 hover:bg-[var(--hover-fill)] transition-all"><FolderInput size={14}/></button>
                                )}
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

        {/* FLOATING ACTION BAR FOR MULTI-SELECT (BULK ACTIONS) */}
        <AnimatePresence>
          {userRole === 'admin' && selectedFileIds.size > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 50, scale: 0.95 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[140] w-[94%] max-w-2xl bg-[var(--bg-panel)]/95 backdrop-blur-xl border border-[var(--accent)]/40 p-3 sm:p-4 rounded-2xl shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-3 text-xs sm:text-sm ring-1 ring-[var(--accent)]/20"
            >
              <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-[var(--accent)] text-[var(--accent-fg)] flex items-center justify-center font-bold text-xs shadow-md shadow-[var(--accent)]/30">
                    {selectedFileIds.size}
                  </div>
                  <div>
                    <p className="font-bold text-[var(--text-main)] text-xs sm:text-sm">
                      {selectedFileIds.size} Dokumen Terpilih
                    </p>
                    <p className="text-[10px] text-[var(--text-muted)]">
                      Siap dipindahkan ke folder tujuan
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 ml-2">
                  <button
                    onClick={handleSelectAllFiles}
                    className="px-2.5 py-1 rounded-lg text-[11px] font-semibold text-[var(--accent)] hover:bg-[var(--accent)]/15 border border-[var(--accent)]/30 transition-all whitespace-nowrap"
                  >
                    {filteredFilesMain.filter(f => !f.mimeType.includes('folder')).length > 0 &&
                     filteredFilesMain.filter(f => !f.mimeType.includes('folder')).every(f => selectedFileIds.has(f.id))
                      ? 'Lepas Semua'
                      : 'Pilih Semua'}
                  </button>
                  <button
                    onClick={handleClearSelection}
                    className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-rose-400 hover:bg-rose-500/10 transition-all"
                    title="Batalkan pilihan"
                  >
                    <X size={15} />
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={openBatchMoveModal}
                  className="flex-1 sm:flex-initial px-4 sm:px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-[var(--accent)] to-amber-500 hover:opacity-95 text-slate-950 font-bold text-xs sm:text-sm shadow-lg shadow-amber-500/25 transition-all flex items-center justify-center gap-2 whitespace-nowrap"
                >
                  <FolderInput size={16} strokeWidth={2.5} />
                  <span>Pindahkan ke Folder ({selectedFileIds.size})</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

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
                  <button 
                    onClick={() => {
                      playHaptic('pop');
                      setShowFloatingGlossary(prev => !prev);
                    }} 
                    className={`p-2.5 rounded-xl transition-all flex items-center gap-1.5 ${
                      showFloatingGlossary 
                        ? 'bg-[var(--accent)] text-slate-950 shadow-md font-bold' 
                        : 'bg-[var(--hover-fill)] text-[var(--text-muted)] hover:text-[var(--accent)]'
                    }`}
                    title={showFloatingGlossary ? "Tutup Kamus Regulasi Melayang" : "Kamus Regulasi & Glosarium Melayang"}
                  >
                    <BookOpen size={18} />
                    <span className="hidden sm:inline text-xs font-semibold">Kamus</span>
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
                      <button onClick={() => openMoveModal(selectedFile)} className="p-2.5 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 rounded-xl transition-all" title="Pindahkan Dokumen"><FolderInput size={18}/></button>
                      <button onClick={() => handleRename(selectedFile.id, selectedFile.name)} className="p-2.5 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 rounded-xl transition-all" title="Ganti Nama Berkas"><Edit2 size={18}/></button>
                      <button onClick={() => handleDelete(selectedFile.id, selectedFile.name)} className="p-2.5 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-xl transition-all" title="Hapus Berkas"><Trash2 size={18}/></button>
                    </>
                  )}
                  <button onClick={() => { addOnlineLog("DOWNLOAD", selectedFile.name); window.open(`https://drive.google.com/uc?export=download&id=${selectedFile.id}`, '_blank'); }} className="p-2.5 bg-[var(--accent)] rounded-xl text-slate-950 hover:bg-amber-400 transition-colors"><Download size={18}/></button>
                  <button onClick={() => { setSelectedFile(null); setPreviewLoading(true); setIsFocusMode(false); }} className="p-2.5 bg-[var(--hover-fill)] text-[var(--text-muted)] hover:text-[var(--text-main)] rounded-xl transition-all"><X size={18}/></button>
                </div>
              </div>

              {/* PREVIEW ROLE BAR (LHP & ST) */}
              <div className="px-6 py-2 bg-gradient-to-r from-[var(--bg-panel)] via-[var(--hover-fill)] to-[var(--bg-panel)] border-b border-[var(--border-line)] flex items-center justify-between flex-wrap gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-[var(--text-muted)] font-medium flex items-center gap-1.5">
                    <ClipboardCheck size={14} className="text-emerald-400" /> Peran Berkas:
                  </span>
                  {(() => {
                    const role = detectFileRole(selectedFile);
                    if (role === 'LHP') {
                      return (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold text-xs">
                          <FileCheck size={12} /> 📑 Laporan Hasil Pengawasan (LHP)
                        </span>
                      );
                    }
                    if (role === 'ST') {
                      return (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 font-bold text-xs">
                          <ClipboardCheck size={12} /> 📜 Surat Tugas (ST / SPT)
                        </span>
                      );
                    }
                    return (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-500/15 text-slate-400 border border-slate-500/20 text-xs">
                        Berkas Pendukung / Belum Diklasifikasikan
                      </span>
                    );
                  })()}
                </div>

                {userRole === 'admin' && (
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-[var(--text-muted)] hidden sm:inline">Tetapkan:</span>
                    <button
                      onClick={() => handleSetFileRole(selectedFile.id, detectFileRole(selectedFile) === 'LHP' ? 'none' : 'LHP')}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                        detectFileRole(selectedFile) === 'LHP'
                          ? 'bg-emerald-500 text-slate-950 shadow-sm'
                          : 'bg-[var(--hover-fill)] text-[var(--text-muted)] hover:text-emerald-400 hover:bg-emerald-500/10 border border-[var(--border-line)]'
                      }`}
                    >
                      <FileCheck size={12} /> LHP
                    </button>
                    <button
                      onClick={() => handleSetFileRole(selectedFile.id, detectFileRole(selectedFile) === 'ST' ? 'none' : 'ST')}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                        detectFileRole(selectedFile) === 'ST'
                          ? 'bg-cyan-500 text-slate-950 shadow-sm'
                          : 'bg-[var(--hover-fill)] text-[var(--text-muted)] hover:text-cyan-400 hover:bg-cyan-500/10 border border-[var(--border-line)]'
                      }`}
                    >
                      <ClipboardCheck size={12} /> Surat Tugas
                    </button>
                  </div>
                )}
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
                          {userRole === 'admin' && (
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
                          )}
                        </span>
                      );
                    })
                  )}
                </div>
                {userRole === 'admin' && (
                  <button
                    onClick={() => openTagModal(selectedFile)}
                    className="text-xs text-[var(--accent)] hover:underline flex items-center gap-1 font-semibold px-2.5 py-1 rounded-lg hover:bg-[var(--accent)]/10 transition-colors"
                  >
                    <Plus size={13} /> Kelola Label
                  </button>
                )}
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

                {/* FLOATING REGULATION GLOSSARY OVERLAY */}
                <AnimatePresence>
                  {showFloatingGlossary && (
                    <motion.div
                      initial={{ opacity: 0, y: -15, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -15, scale: 0.96 }}
                      transition={{ duration: 0.2 }}
                      className="absolute top-3 right-3 left-3 sm:left-auto sm:w-[430px] max-h-[85%] z-30 flex flex-col bg-[var(--bg-panel)]/96 backdrop-blur-2xl border border-[var(--border-strong)] rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.6)] overflow-hidden"
                    >
                      {/* Floating Header */}
                      <div className="p-3.5 bg-[var(--hover-fill)]/70 border-b border-[var(--border-line)] flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 rounded-lg bg-[var(--accent)]/15 text-[var(--accent)]">
                            <BookOpen size={16} />
                          </div>
                          <div>
                            <h5 className="text-xs font-bold text-[var(--text-main)] flex items-center gap-1.5">
                              Kamus Regulasi Melayang
                              <span className="text-[10px] font-normal px-1.5 py-0.5 rounded-md bg-[var(--accent)]/10 text-[var(--accent)]">
                                APIP
                              </span>
                            </h5>
                            <p className="text-[10px] text-[var(--text-muted)]">Rujukan yuridis & dasar hukum audit</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => {
                              playHaptic('pop');
                              setIsGlossaryModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg hover:bg-[var(--hover-fill)] text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors"
                            title="Buka Kamus Lengkap"
                          >
                            <ExternalLink size={14} />
                          </button>
                          <button
                            onClick={() => {
                              playHaptic('click');
                              setShowFloatingGlossary(false);
                            }}
                            className="p-1.5 rounded-lg hover:bg-[var(--hover-fill)] text-[var(--text-muted)] hover:text-rose-400 transition-colors"
                            title="Tutup"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      </div>

                      {/* Floating Search & Filter */}
                      <div className="p-3 border-b border-[var(--border-line)] space-y-2 bg-[var(--bg-panel)]/50">
                        <div className="relative">
                          <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                          <input
                            type="text"
                            value={glossarySearch}
                            onChange={(e) => setGlossarySearch(e.target.value)}
                            placeholder="Cari istilah: TGR, HPS, BAST, SP2D..."
                            className="w-full pl-8 pr-7 py-1.5 text-xs bg-[var(--hover-fill)] border border-[var(--border-line)] rounded-xl text-[var(--text-main)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)]"
                          />
                          {glossarySearch && (
                            <button
                              onClick={() => setGlossarySearch('')}
                              className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-main)]"
                            >
                              <X size={12} />
                            </button>
                          )}
                        </div>

                        {/* Category filter pills */}
                        <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-thin">
                          {(['all', 'Keuangan', 'Pengadaan', 'APIP', 'Hukum & Sanksi'] as const).map(cat => (
                            <button
                              key={cat}
                              onClick={() => {
                                playHaptic('click');
                                setGlossaryCategory(cat);
                              }}
                              className={`text-[10px] px-2 py-0.5 rounded-lg font-medium whitespace-nowrap transition-all ${
                                glossaryCategory === cat
                                  ? 'bg-[var(--accent)] text-slate-950 font-bold shadow-sm'
                                  : 'bg-[var(--hover-fill)] text-[var(--text-muted)] hover:text-[var(--text-main)]'
                              }`}
                            >
                              {cat === 'all' ? 'Semua' : cat}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Floating Content Body */}
                      <div className="p-3 overflow-y-auto max-h-[380px] space-y-2.5">
                        {(() => {
                          const filtered = GLOSSARY_DATABASE.filter(item => {
                            const matchCat = glossaryCategory === 'all' || item.category === glossaryCategory;
                            if (!matchCat) return false;
                            if (!glossarySearch.trim()) return true;
                            const q = glossarySearch.toLowerCase();
                            return (
                              item.term.toLowerCase().includes(q) ||
                              item.fullTitle.toLowerCase().includes(q) ||
                              item.definition.toLowerCase().includes(q) ||
                              item.legalBasis.toLowerCase().includes(q) ||
                              item.tags.some(t => t.toLowerCase().includes(q))
                            );
                          });

                          if (filtered.length === 0) {
                            return (
                              <div className="py-8 text-center text-[var(--text-muted)]">
                                <Scale size={24} className="mx-auto mb-2 opacity-40 text-[var(--accent)]" />
                                <p className="text-xs">Istilah tidak ditemukan</p>
                                <p className="text-[10px] mt-0.5">Coba kata kunci lain atau buka kamus lengkap</p>
                              </div>
                            );
                          }

                          return (
                            <div className="space-y-2">
                              {/* Quick Terms Chips Row */}
                              <div className="flex flex-wrap gap-1 pb-1">
                                {filtered.slice(0, 10).map(item => (
                                  <button
                                    key={item.id}
                                    onClick={() => {
                                      playHaptic('click');
                                      setSelectedGlossaryTerm(item);
                                    }}
                                    className={`text-[11px] px-2 py-1 rounded-lg font-semibold transition-all flex items-center gap-1 ${
                                      (selectedGlossaryTerm?.id === item.id || (!selectedGlossaryTerm && filtered[0]?.id === item.id))
                                        ? 'bg-[var(--accent)] text-slate-950 shadow-sm font-bold'
                                        : 'bg-[var(--hover-fill)] text-[var(--text-main)] hover:bg-[var(--accent)]/15 hover:text-[var(--accent)]'
                                    }`}
                                  >
                                    <span>{item.term}</span>
                                  </button>
                                ))}
                              </div>

                              {/* Active or Featured Term Card */}
                              {(() => {
                                const activeItem = selectedGlossaryTerm || filtered[0];
                                if (!activeItem) return null;

                                const getCategoryBadge = (cat: string) => {
                                  switch (cat) {
                                    case 'Keuangan':
                                      return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
                                    case 'Pengadaan':
                                      return 'bg-sky-500/10 text-sky-400 border-sky-500/20';
                                    case 'APIP':
                                      return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
                                    case 'Hukum & Sanksi':
                                      return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
                                    default:
                                      return 'bg-[var(--hover-fill)] text-[var(--text-muted)]';
                                  }
                                };

                                return (
                                  <div className="p-3 bg-[var(--hover-fill)]/50 rounded-xl border border-[var(--border-line)] space-y-2">
                                    <div className="flex items-start justify-between gap-2">
                                      <div>
                                        <div className="flex items-center gap-1.5 flex-wrap">
                                          <span className="text-sm font-bold text-[var(--text-main)]">{activeItem.term}</span>
                                          <span className={`text-[9px] px-1.5 py-0.5 rounded-md font-semibold border ${getCategoryBadge(activeItem.category)}`}>
                                            {activeItem.category}
                                          </span>
                                        </div>
                                        <p className="text-[11px] text-[var(--text-muted)] font-medium mt-0.5">{activeItem.fullTitle}</p>
                                      </div>
                                      <button
                                        onClick={() => handleCopyLegalBasis(activeItem)}
                                        className="p-1.5 rounded-lg bg-[var(--accent)]/10 hover:bg-[var(--accent)]/20 text-[var(--accent)] transition-all flex items-center gap-1 text-[10px] font-semibold flex-shrink-0"
                                        title="Salin Dasar Hukum"
                                      >
                                        <Copy size={11} /> Salin
                                      </button>
                                    </div>

                                    {/* Definition */}
                                    <p className="text-xs text-[var(--text-main)] leading-relaxed">
                                      {activeItem.definition}
                                    </p>

                                    {/* Legal Basis Container */}
                                    <div className="p-2 rounded-lg bg-[var(--accent)]/5 border border-[var(--accent)]/20 text-[11px]">
                                      <div className="flex items-center gap-1 text-[var(--accent)] font-semibold text-[10px] mb-0.5">
                                        <Scale size={11} /> Dasar Hukum Resmi:
                                      </div>
                                      <p className="text-[var(--text-main)] text-[11px] leading-snug font-mono select-all">
                                        {activeItem.legalBasis}
                                      </p>
                                    </div>

                                    {/* Audit Significance */}
                                    <div className="text-[11px] text-[var(--text-muted)] bg-[var(--hover-fill)]/60 p-2 rounded-lg">
                                      <span className="font-semibold text-[var(--text-main)]">Signifikansi Audit: </span>
                                      {activeItem.significance}
                                    </div>
                                  </div>
                                );
                              })()}
                            </div>
                          );
                        })()}
                      </div>

                      {/* Floating Footer */}
                      <div className="p-2.5 bg-[var(--hover-fill)]/70 border-t border-[var(--border-line)] flex items-center justify-between text-[11px]">
                        <span className="text-[10px] text-[var(--text-muted)]">24 Istilah Pengawasan & Regulasi</span>
                        <button
                          onClick={() => {
                            playHaptic('pop');
                            setIsGlossaryModalOpen(true);
                          }}
                          className="text-[11px] font-bold text-[var(--accent)] hover:underline flex items-center gap-1"
                        >
                          Buka Kamus Penuh <ChevronRight size={13} />
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
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
              onClick={() => {
                playHaptic('click');
                setIsThemeModalOpen(false);
              }}
            >
              <motion.div 
                initial={{ scale: 0.95, y: 15 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 15 }}
                className="bg-[var(--bg-panel)] border border-[var(--border-line)] w-full max-w-2xl max-h-[92vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col relative" 
                onClick={e => e.stopPropagation()}
              >
                {/* Modal Header */}
                <div className="p-5 lg:p-6 border-b border-[var(--border-line)] flex items-center justify-between bg-[var(--bg-panel-trans)]">
                  <div>
                    <h3 className="text-lg font-bold text-[var(--text-main)] flex items-center gap-2">
                      <Palette size={20} className="text-[var(--accent)]" /> Kustomisasi Estetika & Tampilan
                    </h3>
                    <p className="text-xs text-[var(--text-muted)] mt-0.5">Personalisasi palet gradien neon, atmosfer layar, geometri sudut, dan audio taktil</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => {
                        playHaptic('pop');
                        const solidAccents = ['amber', 'blue', 'emerald', 'purple', 'rose', 'orange', 'teal', 'lime'];
                        const gradientAccents = ['aurora', 'sunset', 'cyberpunk', 'sovereign', 'deepsea', 'crimson'];
                        const allAccents = [...solidAccents, ...gradientAccents];
                        const darkAtmos = ['default', 'oled', 'forest', 'slate', 'cosmic', 'espresso', 'nordic', 'sakura'];
                        const lightAtmos = ['default', 'sepia', 'nordic-light', 'champagne'];
                        const radiuses: ('sharp' | 'rounded' | 'pebble')[] = ['sharp', 'rounded', 'pebble'];
                        
                        const randomDark = Math.random() > 0.35;
                        const randomAccent = allAccents[Math.floor(Math.random() * allAccents.length)];
                        const randomAtmos = randomDark 
                          ? darkAtmos[Math.floor(Math.random() * darkAtmos.length)]
                          : lightAtmos[Math.floor(Math.random() * lightAtmos.length)];
                        const randomRadius = radiuses[Math.floor(Math.random() * radiuses.length)];

                        setIsDarkMode(randomDark);
                        setThemeColor(randomAccent);
                        setThemeAtmosphere(randomAtmos);
                        setThemeRadius(randomRadius);
                        localStorage.setItem('isDarkMode', String(randomDark));
                        localStorage.setItem('themeColor', randomAccent);
                        localStorage.setItem('themeAtmosphere', randomAtmos);
                        localStorage.setItem('themeRadius', randomRadius);
                      }}
                      title="Acak Kombinasi Tema & Gradien"
                      className="px-3 py-2 rounded-xl bg-[var(--hover-fill)] hover:bg-[var(--accent)] hover:text-[var(--accent-fg)] text-[var(--text-muted)] text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm"
                    >
                      <Sparkles size={14} className="text-[var(--accent)] group-hover:text-current" />
                      <span>Acak</span>
                    </button>
                    <button 
                      onClick={() => {
                        playHaptic('pop');
                        setIsDarkMode(true);
                        setThemeColor('amber');
                        setThemeAtmosphere('default');
                        setFontSize('md');
                        setGlassEffect(true);
                        setThemeRadius('rounded');
                        setAmbientGlow(true);
                        setSoundEnabled(true);
                        setIsPerformanceMode(false);
                        setIsCompactMode(false);
                        localStorage.setItem('isDarkMode', 'true');
                        localStorage.setItem('themeColor', 'amber');
                        localStorage.setItem('themeAtmosphere', 'default');
                        localStorage.setItem('themeFontSize', 'md');
                        localStorage.setItem('themeGlassEffect', 'true');
                        localStorage.setItem('themeRadius', 'rounded');
                        localStorage.setItem('themeAmbientGlow', 'true');
                        localStorage.setItem('themeSoundEnabled', 'true');
                        localStorage.setItem('themePerformanceMode', 'false');
                        localStorage.setItem('isCompactMode', 'false');
                      }}
                      title="Kembalikan ke Setelan Bawaan"
                      className="p-2 rounded-xl bg-[var(--hover-fill)] hover:bg-[var(--border-line)] text-[var(--text-muted)] text-xs transition-colors"
                    >
                      <RotateCw size={15} />
                    </button>
                    <button 
                      onClick={() => {
                        playHaptic('click');
                        setIsThemeModalOpen(false);
                      }} 
                      className="p-2 bg-[var(--hover-fill)] hover:bg-[var(--border-line)] text-[var(--text-muted)] rounded-full transition-colors ml-1"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>

                {/* Sub-Tabs */}
                <div className="px-6 pt-3 border-b border-[var(--border-line)] flex gap-4 lg:gap-6 bg-[var(--bg-main)] overflow-x-auto scrollbar-hide">
                  <button 
                    onClick={() => { playHaptic('click'); setThemeCustomTab('palettes'); }} 
                    className={`pb-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${themeCustomTab === 'palettes' ? 'border-[var(--accent)] text-[var(--accent)]' : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-main)]'}`}
                  >
                    <Palette size={14} /> Palet & Gradien
                    <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-[var(--hover-fill)] font-semibold">14 Varian</span>
                  </button>
                  <button 
                    onClick={() => { playHaptic('click'); setThemeCustomTab('atmospheres'); }} 
                    className={`pb-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${themeCustomTab === 'atmospheres' ? 'border-[var(--accent)] text-[var(--accent)]' : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-main)]'}`}
                  >
                    <Sun size={14} /> Suasana Layar
                    <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-[var(--hover-fill)] font-semibold">{isDarkMode ? '8 Gelap' : '4 Terang'}</span>
                  </button>
                  <button 
                    onClick={() => { playHaptic('click'); setThemeCustomTab('effects'); }} 
                    className={`pb-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${themeCustomTab === 'effects' ? 'border-[var(--accent)] text-[var(--accent)]' : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-main)]'}`}
                  >
                    <Sliders size={14} /> Efek & Geometri
                    <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-[var(--hover-fill)] font-semibold">Interaktif</span>
                  </button>
                </div>

                {/* Modal Body */}
                <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-6">
                  {themeCustomTab === 'palettes' && (
                    <>
                      {/* Varian Gradien & Cyber Aura */}
                      <div>
                        <div className="flex items-center justify-between mb-2.5">
                          <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider flex items-center gap-1.5">
                            <Sparkles size={14} className="text-[var(--accent)]" /> Gradien Aura & Cyber Neon (Mewah)
                          </label>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gradient-to-r from-cyan-500/20 to-purple-500/20 text-[var(--accent)] border border-[var(--accent-light)]">
                            Edisi Spesial
                          </span>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                          {[
                            { id: 'aurora', name: 'Aurora Borealis', desc: 'Cyan ke Zamrud Kutub', gradient: 'linear-gradient(135deg, #06b6d4 0%, #10b981 100%)', badge: 'Mistik' },
                            { id: 'sunset', name: 'Lembayung Senja', desc: 'Mawar ke Amber Tropis', gradient: 'linear-gradient(135deg, #f43f5e 0%, #f59e0b 100%)', badge: 'Hangat' },
                            { id: 'cyberpunk', name: 'Cyber Synthwave', desc: 'Pink ke Ultra-Violet', gradient: 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)', badge: 'Futuristik' },
                            { id: 'sovereign', name: 'Emas Bangsawan', desc: 'Emas ke Perunggu Royal', gradient: 'linear-gradient(135deg, #fbbf24 0%, #b45309 100%)', badge: 'Kerajaan' },
                            { id: 'deepsea', name: 'Palung Samudra', desc: 'Langit ke Indigo Dalam', gradient: 'linear-gradient(135deg, #38bdf8 0%, #6366f1 100%)', badge: 'Samudra' },
                            { id: 'crimson', name: 'Kewaspadaan APIP', desc: 'Merah Membara ke Marun', gradient: 'linear-gradient(135deg, #ef4444 0%, #991b1b 100%)', badge: 'Integritas' },
                          ].map(g => (
                            <button
                              key={g.id}
                              onClick={() => {
                                playHaptic('click');
                                setThemeColor(g.id);
                                localStorage.setItem('themeColor', g.id);
                              }}
                              className={`p-3 rounded-2xl border text-left transition-all relative overflow-hidden group ${themeColor === g.id ? 'border-[var(--accent)] bg-[var(--accent)]/10 shadow-lg scale-[1.02]' : 'border-[var(--border-line)] hover:border-[var(--border-strong)] bg-[var(--bg-main)]'}`}
                            >
                              <div className="flex items-center justify-between mb-2">
                                <div 
                                  className={`w-7 h-7 rounded-full shadow-md flex items-center justify-center transition-transform ${themeColor === g.id ? 'ring-2 ring-white scale-110 shadow-lg' : 'group-hover:scale-105'}`}
                                  style={{ background: g.gradient }}
                                >
                                  {themeColor === g.id && <Check size={14} className="text-white drop-shadow" />}
                                </div>
                                <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-[var(--hover-fill)] text-[var(--text-muted)]">
                                  {g.badge}
                                </span>
                              </div>
                              <p className={`text-xs font-bold truncate ${themeColor === g.id ? 'text-[var(--accent)]' : 'text-[var(--text-main)]'}`}>
                                {g.name}
                              </p>
                              <p className="text-[10px] text-[var(--text-muted)] truncate mt-0.5">
                                {g.desc}
                              </p>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* 8 Palet Solid Klasik */}
                      <div>
                        <div className="flex items-center justify-between mb-2.5">
                          <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">
                            Palet Solid Klasik (8 Pilihan)
                          </label>
                          <span className="text-[11px] font-semibold text-[var(--accent)] capitalize">
                            Terpilih: {themeColor}
                          </span>
                        </div>
                        <div className="grid grid-cols-4 gap-2.5">
                          {[
                            { id: 'amber', color: '#f59e0b', label: 'Emas Irban' },
                            { id: 'blue', color: '#3b82f6', label: 'Safir Laut' },
                            { id: 'emerald', color: '#10b981', label: 'Zamrud Hijau' },
                            { id: 'purple', color: '#a855f7', label: 'Amethyst' },
                            { id: 'rose', color: '#f43f5e', label: 'Ruby Merah' },
                            { id: 'orange', color: '#f97316', label: 'Surya Oranye' },
                            { id: 'teal', color: '#06b6d4', label: 'Cyan Siber' },
                            { id: 'lime', color: '#84cc16', label: 'Neon Lime' },
                          ].map(t => (
                            <button
                              key={t.id}
                              onClick={() => {
                                playHaptic('click');
                                setThemeColor(t.id);
                                localStorage.setItem('themeColor', t.id);
                              }}
                              className={`p-2.5 rounded-2xl border text-center transition-all flex flex-col items-center gap-1.5 ${themeColor === t.id ? 'border-[var(--accent)] bg-[var(--accent)]/10 shadow-md scale-[1.03]' : 'border-[var(--border-line)] hover:border-[var(--border-strong)] bg-[var(--bg-main)] hover:scale-[1.01]'}`}
                            >
                              <div 
                                className={`w-8 h-8 rounded-full shadow-md transition-transform flex items-center justify-center ${themeColor === t.id ? 'ring-2 ring-white/70 scale-105' : ''}`}
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
                  )}

                  {themeCustomTab === 'atmospheres' && (
                    <>
                      {/* Mode Terang / Gelap */}
                      <div>
                        <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider block mb-2.5">Mode Layar Utama</label>
                        <div className="grid grid-cols-2 gap-3">
                          <button 
                            onClick={() => { 
                              playHaptic('toggle');
                              setIsDarkMode(false); 
                              localStorage.setItem('isDarkMode', 'false'); 
                            }}
                            className={`p-3.5 rounded-2xl border transition-all flex items-center justify-center gap-3 ${!isDarkMode ? 'border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)] shadow-sm' : 'border-[var(--border-line)] text-[var(--text-muted)] hover:border-[var(--border-strong)]'}`}
                          >
                            <Sun size={20} className={!isDarkMode ? 'text-amber-500 fill-amber-500/20' : ''} />
                            <div className="text-left">
                              <p className="text-xs font-bold leading-tight">Mode Terang</p>
                              <p className="text-[10px] text-[var(--text-muted)] opacity-80">Siang hari & kontras cerah</p>
                            </div>
                          </button>
                          <button 
                            onClick={() => { 
                              playHaptic('toggle');
                              setIsDarkMode(true); 
                              localStorage.setItem('isDarkMode', 'true'); 
                            }}
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
                        <div className="flex items-center justify-between mb-2.5">
                          <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">
                            Atmosfer Latar ({isDarkMode ? '8 Suasana Gelap' : '4 Suasana Terang'})
                          </label>
                          <span className="text-[10px] text-[var(--text-muted)]">
                            Sentuh untuk menerapkan
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2.5">
                          {(isDarkMode ? [
                            { id: 'default', name: 'Midnight Obsidian', desc: 'Biru navy dalam elegan', icon: '🌌', color: '#0c1220' },
                            { id: 'oled', name: 'Pure OLED Black', desc: 'Hitam murni 100% hemat daya', icon: '🖤', color: '#000000' },
                            { id: 'forest', name: 'Cyber Forest', desc: 'Hijau rimba pengawasan APIP', icon: '🌲', color: '#041210' },
                            { id: 'slate', name: 'Slate Titanium', desc: 'Abu-abu grafit eksekutif', icon: '🏛️', color: '#0f172a' },
                            { id: 'cosmic', name: 'Cosmic Nebula', desc: 'Ungu antariksa kosmik mewah', icon: '🪐', color: '#0a0718' },
                            { id: 'espresso', name: 'Warm Teakwood', desc: 'Kayu jati hangat & berkelas', icon: '☕', color: '#130e0b' },
                            { id: 'nordic', name: 'Nordic Polar Night', desc: 'Malam Arktik dingin damai', icon: '❄️', color: '#0b131f' },
                            { id: 'sakura', name: 'Midnight Sakura', desc: 'Plum malam estetis memukau', icon: '🌸', color: '#140816' },
                          ] : [
                            { id: 'default', name: 'Clean Modern Studio', desc: 'Putih bersih modern profesional', icon: '☀️', color: '#f8fafc' },
                            { id: 'sepia', name: 'Warm Paper Sepia', desc: 'Kertas arsip klasik ramah mata', icon: '📜', color: '#fbf7ee' },
                            { id: 'nordic-light', name: 'Arctic Ice Fog', desc: 'Kabut es Skandinavia segar', icon: '🧊', color: '#eff4f9' },
                            { id: 'champagne', name: 'Champagne Silk', desc: 'Sutra sampanye mewah lembut', icon: '🥂', color: '#faf6f0' },
                          ]).map(atmos => (
                            <button
                              key={atmos.id}
                              onClick={() => {
                                playHaptic('click');
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
                    </>
                  )}

                  {themeCustomTab === 'effects' && (
                    <>
                      {/* Bentuk Geometri Sudut (Corner Geometry) */}
                      <div>
                        <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider block mb-2.5">
                          Geometri Kelengkungan Sudut (Corner Style)
                        </label>
                        <div className="grid grid-cols-3 gap-2.5">
                          {[
                            { id: 'sharp', name: 'Tech Sharp', desc: 'Tegas 8px (Teknikal)', radius: 'rounded-md' },
                            { id: 'rounded', name: 'Modern Squircle', desc: 'Seimbang 16px (Bawaan)', radius: 'rounded-xl' },
                            { id: 'pebble', name: 'Soft Pebble', desc: 'Organik 24px (Lembut)', radius: 'rounded-2xl' },
                          ].map(r => (
                            <button
                              key={r.id}
                              onClick={() => {
                                playHaptic('click');
                                setThemeRadius(r.id as any);
                                localStorage.setItem('themeRadius', r.id);
                              }}
                              className={`p-3 border text-center transition-all ${r.radius} ${themeRadius === r.id ? 'border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)] shadow-sm' : 'border-[var(--border-line)] text-[var(--text-muted)] hover:border-[var(--border-strong)] bg-[var(--bg-main)]'}`}
                            >
                              <div className={`w-8 h-8 mx-auto mb-1.5 border-2 border-current ${r.radius} opacity-80 flex items-center justify-center text-[10px] font-bold`}>
                                {r.id === 'sharp' ? '◼' : r.id === 'rounded' ? '▢' : '●'}
                              </div>
                              <p className="text-xs font-bold leading-tight">{r.name}</p>
                              <p className="text-[10px] text-[var(--text-muted)] mt-0.5">{r.desc}</p>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Aura Cahaya Dinamis (Ambient Mesh Aurora) */}
                      <div className="p-4 rounded-2xl border border-[var(--border-line)] bg-[var(--bg-main)] flex items-center justify-between">
                        <div className="pr-4">
                          <p className="text-xs font-bold text-[var(--text-main)] flex items-center gap-1.5">
                            <Sparkles size={14} className="text-[var(--accent)]" /> Aura Cahaya Dinamis (Ambient Mesh Aurora)
                          </p>
                          <p className="text-[10px] text-[var(--text-muted)] mt-0.5">Pendaran gradien aurora lembut yang melayang perlahan di latar belakang mengikuti warna aksen</p>
                        </div>
                        <button
                          onClick={() => {
                            playHaptic('toggle');
                            const next = !ambientGlow;
                            setAmbientGlow(next);
                            localStorage.setItem('themeAmbientGlow', String(next));
                          }}
                          className={`w-12 h-6 rounded-full transition-colors relative flex items-center px-1 flex-shrink-0 ${ambientGlow ? 'bg-[var(--accent)]' : 'bg-[var(--border-strong)]'}`}
                        >
                          <motion.div 
                            layout 
                            className={`w-4 h-4 rounded-full bg-white shadow-sm ${ambientGlow ? 'ml-auto' : 'mr-auto'}`} 
                          />
                        </button>
                      </div>

                      {/* Efek Transparansi Kaca (Glassmorphism) */}
                      <div className="p-4 rounded-2xl border border-[var(--border-line)] bg-[var(--bg-main)] flex items-center justify-between">
                        <div className="pr-4">
                          <p className="text-xs font-bold text-[var(--text-main)] flex items-center gap-1.5">
                            <Eye size={14} className="text-[var(--accent)]" /> Efek Transparansi Kaca (Glassmorphism)
                          </p>
                          <p className="text-[10px] text-[var(--text-muted)] mt-0.5">Efek kaca buram (frosted blur) pada sidebar navigasi, header, dan drawer dokumen</p>
                        </div>
                        <button
                          onClick={() => {
                            playHaptic('toggle');
                            const next = !glassEffect;
                            setGlassEffect(next);
                            localStorage.setItem('themeGlassEffect', String(next));
                          }}
                          className={`w-12 h-6 rounded-full transition-colors relative flex items-center px-1 flex-shrink-0 ${glassEffect ? 'bg-[var(--accent)]' : 'bg-[var(--border-strong)]'}`}
                        >
                          <motion.div 
                            layout 
                            className={`w-4 h-4 rounded-full bg-white shadow-sm ${glassEffect ? 'ml-auto' : 'mr-auto'}`} 
                          />
                        </button>
                      </div>

                      {/* Umpan Balik Suara Interaktif (Haptic Audio FX) */}
                      <div className="p-4 rounded-2xl border border-[var(--border-line)] bg-[var(--bg-main)] flex items-center justify-between">
                        <div className="pr-4">
                          <p className="text-xs font-bold text-[var(--text-main)] flex items-center gap-1.5">
                            {soundEnabled ? <Volume2 size={14} className="text-[var(--accent)]" /> : <VolumeX size={14} className="text-[var(--text-muted)]" />} Audio Interaktif Taktil (Web Audio Haptic)
                          </p>
                          <p className="text-[10px] text-[var(--text-muted)] mt-0.5">Efek klik audio mikro sintetis saat menekan tombol dan mengganti palet antarmuka</p>
                        </div>
                        <button
                          onClick={() => {
                            const next = !soundEnabled;
                            setSoundEnabled(next);
                            localStorage.setItem('themeSoundEnabled', String(next));
                            if (next) playHaptic('pop');
                          }}
                          className={`w-12 h-6 rounded-full transition-colors relative flex items-center px-1 flex-shrink-0 ${soundEnabled ? 'bg-[var(--accent)]' : 'bg-[var(--border-strong)]'}`}
                        >
                          <motion.div 
                            layout 
                            className={`w-4 h-4 rounded-full bg-white shadow-sm ${soundEnabled ? 'ml-auto' : 'mr-auto'}`} 
                          />
                        </button>
                      </div>

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
                                playHaptic('click');
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
                        <div className="pr-4">
                          <p className="text-xs font-bold text-[var(--text-main)]">Mode Kepadatan Ringkas (Compact Table)</p>
                          <p className="text-[10px] text-[var(--text-muted)] mt-0.5">Memadatkan jarak baris tabel arsip agar memuat lebih banyak dokumen dalam satu layar</p>
                        </div>
                        <button
                          onClick={() => {
                            playHaptic('toggle');
                            const next = !isCompactMode;
                            setIsCompactMode(next);
                            localStorage.setItem('isCompactMode', String(next));
                          }}
                          className={`w-12 h-6 rounded-full transition-colors relative flex items-center px-1 flex-shrink-0 ${isCompactMode ? 'bg-[var(--accent)]' : 'bg-[var(--border-strong)]'}`}
                        >
                          <motion.div 
                            layout 
                            className={`w-4 h-4 rounded-full bg-white shadow-sm ${isCompactMode ? 'ml-auto' : 'mr-auto'}`} 
                          />
                        </button>
                      </div>
                      {/* Mode Performa Ringan / Hemat Daya (HP & PC) */}
                      <div className="p-4 rounded-2xl border border-[var(--border-line)] bg-[var(--bg-main)] flex items-center justify-between">
                        <div className="pr-4">
                          <p className="text-xs font-bold text-[var(--text-main)] flex items-center gap-1.5">
                            <Zap size={14} className="text-[var(--accent)]" /> Mode Performa Ringan (Hemat Daya HP & PC)
                          </p>
                          <p className="text-[10px] text-[var(--text-muted)] mt-0.5">Optimalkan render grafis agar aplikasi berjalan ekstra cepat 60 FPS dan hemat baterai di ponsel</p>
                        </div>
                        <button
                          onClick={() => {
                            playHaptic('toggle');
                            const next = !isPerformanceMode;
                            setIsPerformanceMode(next);
                            localStorage.setItem('themePerformanceMode', String(next));
                          }}
                          className={`w-12 h-6 rounded-full transition-colors relative flex items-center px-1 flex-shrink-0 ${isPerformanceMode ? 'bg-[var(--accent)]' : 'bg-[var(--border-strong)]'}`}
                        >
                          <motion.div 
                            layout 
                            className={`w-4 h-4 rounded-full bg-white shadow-sm ${isPerformanceMode ? 'ml-auto' : 'mr-auto'}`} 
                          />
                        </button>
                      </div>
                    </>
                  )}

                  {/* Interactive Live Preview Box */}
                  <div className="p-4 rounded-2xl border border-[var(--border-line)] bg-[var(--bg-main)] transition-all relative overflow-hidden">
                    <div className="flex items-center justify-between mb-2.5">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-1.5">
                        <Eye size={13} className="text-[var(--accent)]" /> Pratinjau Interaktif Langsung
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--accent)]/15 text-[var(--accent)] font-bold border border-[var(--accent-light)]">
                          {themeColor}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--hover-fill)] text-[var(--text-muted)] font-medium">
                          {themeRadius}
                        </span>
                      </div>
                    </div>
                    <div className="p-4 rounded-2xl bg-[var(--bg-panel)] border border-[var(--border-line)] shadow-md transition-all">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="p-2.5 rounded-xl bg-[var(--accent)]/15 text-[var(--accent)] flex-shrink-0 shadow-inner">
                            <FileText size={20} />
                          </div>
                          <div className="min-w-0">
                            <h5 className="text-xs font-bold text-[var(--text-main)] truncate">LHP Evaluasi Kinerja Kamaru-Wanci (700.1.2.1/044/2025).pdf</h5>
                            <p className="text-[10px] text-[var(--text-muted)] mt-0.5">Arsip Resmi Inspektorat Pembantu Wilayah III</p>
                          </div>
                        </div>
                        <span className="text-[10px] px-2.5 py-0.5 rounded-md font-bold bg-emerald-500/15 text-emerald-500 border border-emerald-500/25 flex-shrink-0">
                          Resmi
                        </span>
                      </div>
                      <div className="flex items-center justify-between mt-3.5 pt-3 border-t border-[var(--border-line)]">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[10px] px-2 py-0.5 rounded-md font-semibold bg-[var(--accent)]/15 text-[var(--accent)] border border-[var(--accent-light)]">
                            Pengawasan APIP
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded-md font-medium bg-[var(--hover-fill)] text-[var(--text-muted)] border border-[var(--border-line)]">
                            Tahun 2025
                          </span>
                        </div>
                        <button 
                          type="button"
                          onClick={() => {
                            playHaptic('pop');
                            setPreviewTestClicked(true);
                            setTimeout(() => setPreviewTestClicked(false), 1500);
                          }}
                          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 ${previewTestClicked ? 'bg-emerald-500 text-white scale-105' : 'bg-[var(--accent)] text-[var(--accent-fg)] hover:opacity-90'}`}
                        >
                          {previewTestClicked ? (
                            <>
                              <Check size={13} /> Berhasil Diuji! ✨
                            </>
                          ) : (
                            <>
                              <Sparkles size={13} /> Uji Interaksi
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="p-4 border-t border-[var(--border-line)] flex items-center justify-between bg-[var(--bg-panel-trans)]">
                  <p className="text-[11px] text-[var(--text-muted)] flex items-center gap-1.5">
                    <CheckCircle2 size={13} className="text-emerald-500" /> Disimpan otomatis ke peramban & aman untuk semua pengguna
                  </p>
                  <button 
                    onClick={() => {
                      playHaptic('click');
                      setIsThemeModalOpen(false);
                    }}
                    className="px-6 py-2.5 rounded-xl text-xs font-bold bg-[var(--accent)] text-[var(--accent-fg)] hover:opacity-90 transition-all shadow-md active:scale-95"
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

                {/* Section 2.3: Label Cepat OPD Binaan Irban 3 */}
                <div className="mb-5">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider flex items-center gap-1.5">
                      <Building2 size={13} className="text-[var(--accent)]" /> Labeli OPD Binaan
                    </label>
                    <span className="text-[10px] text-slate-500">1-Klik untuk menyematkan OPD</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto p-2 rounded-xl bg-[var(--hover-fill)] border border-[var(--border-line)] custom-scrollbar">
                    {opdList.filter(o => o.isBinaanIrban3).map(opd => {
                      const active = getFileTags(tagModalFile).some(t => 
                        t.toLowerCase() === opd.code.toLowerCase() || 
                        t.toLowerCase() === opd.name.toLowerCase()
                      );
                      return (
                        <button
                          key={opd.id}
                          type="button"
                          disabled={tagSaving}
                          onClick={() => {
                            const current = getFileTags(tagModalFile);
                            let updated: string[];
                            if (active) {
                              updated = current.filter(t => 
                                t.toLowerCase() !== opd.code.toLowerCase() && 
                                t.toLowerCase() !== opd.name.toLowerCase()
                              );
                            } else {
                              updated = [...current, opd.code];
                            }
                            handleSaveFileTags(tagModalFile.id, tagModalFile.name, updated);
                          }}
                          className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium border transition-all ${
                            active
                              ? 'bg-[var(--accent)]/20 text-[var(--accent)] border-[var(--accent)] font-semibold shadow-xs'
                              : 'bg-black/20 text-[var(--text-muted)] hover:text-[var(--text-main)] border-white/5'
                          }`}
                        >
                          <span>{opd.code}</span>
                          {active && <Check size={11} />}
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

        {/* FULL GLOSSARY MODAL */}
        <AnimatePresence>
          {isGlossaryModalOpen && (
            <div 
              className="fixed inset-0 z-[260] flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-md"
              onClick={() => { playHaptic('click'); setIsGlossaryModalOpen(false); }}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 15 }}
                transition={{ duration: 0.2 }}
                className="w-full max-w-5xl max-h-[92vh] bg-[var(--bg-panel)] border border-[var(--border-line)] rounded-3xl shadow-2xl flex flex-col overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header */}
                <div className="p-5 sm:p-6 border-b border-[var(--border-line)] flex items-start justify-between gap-4 bg-[var(--hover-fill)]/50">
                  <div className="flex items-start gap-3.5">
                    <div className="p-3 bg-[var(--accent)]/15 text-[var(--accent)] rounded-2xl flex-shrink-0 shadow-sm">
                      <BookOpen size={26} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-lg sm:text-xl font-bold text-[var(--text-main)]">
                          Glosarium Hukum & Kamus Regulasi
                        </h3>
                        <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[var(--accent)]/15 text-[var(--accent)] border border-[var(--accent)]/30">
                          Inspektorat & APIP
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-1">
                        Kamus istilah yuridis resmi, dasar hukum (UU/PP/Permendagri/Perpres), dan signifikansi pengawasan LHP.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => { playHaptic('click'); setIsGlossaryModalOpen(false); }}
                    className="p-2 rounded-xl bg-[var(--hover-fill)] text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--hover-fill)] transition-all flex-shrink-0"
                    title="Tutup (Esc)"
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* Search Bar & Category Navigation */}
                <div className="p-4 sm:p-6 border-b border-[var(--border-line)] space-y-4 bg-[var(--bg-panel)]">
                  <div className="relative">
                    <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                    <input
                      type="text"
                      value={glossarySearch}
                      onChange={(e) => setGlossarySearch(e.target.value)}
                      placeholder="Cari istilah, singkatan, topik, atau nomor regulasi (contoh: TGR, SiLPA, HPS, PP 12/2019, fraud)..."
                      className="w-full pl-11 pr-10 py-3 bg-[var(--hover-fill)] border border-[var(--border-line)] rounded-2xl text-sm text-[var(--text-main)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20 transition-all"
                      autoFocus
                    />
                    {glossarySearch && (
                      <button
                        onClick={() => setGlossarySearch('')}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-main)] p-1 rounded-lg"
                      >
                        <X size={16} />
                      </button>
                    )}
                  </div>

                  {/* Category Filter Tabs */}
                  <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
                    {[
                      { id: 'all', label: 'Semua Istilah', count: GLOSSARY_DATABASE.length },
                      { id: 'Keuangan', label: 'Keuangan Daerah', count: GLOSSARY_DATABASE.filter(g => g.category === 'Keuangan').length },
                      { id: 'Pengadaan', label: 'Pengadaan Barang & Jasa', count: GLOSSARY_DATABASE.filter(g => g.category === 'Pengadaan').length },
                      { id: 'APIP', label: 'APIP & Pengawasan', count: GLOSSARY_DATABASE.filter(g => g.category === 'APIP').length },
                      { id: 'Hukum & Sanksi', label: 'Hukum & Sanksi', count: GLOSSARY_DATABASE.filter(g => g.category === 'Hukum & Sanksi').length },
                    ].map(cat => (
                      <button
                        key={cat.id}
                        onClick={() => {
                          playHaptic('click');
                          setGlossaryCategory(cat.id as any);
                        }}
                        className={`text-xs px-3.5 py-2 rounded-xl font-medium whitespace-nowrap transition-all flex items-center gap-1.5 ${
                          glossaryCategory === cat.id
                            ? 'bg-[var(--accent)] text-slate-950 font-bold shadow-md'
                            : 'bg-[var(--hover-fill)] text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--hover-fill)]/80'
                        }`}
                      >
                        <span>{cat.label}</span>
                        <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                          glossaryCategory === cat.id
                            ? 'bg-black/20 text-slate-950'
                            : 'bg-[var(--bg-panel)] text-[var(--text-muted)]'
                        }`}>
                          {cat.count}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Cards Grid Content */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-6">
                  {(() => {
                    const filtered = GLOSSARY_DATABASE.filter(item => {
                      const matchCat = glossaryCategory === 'all' || item.category === glossaryCategory;
                      if (!matchCat) return false;
                      if (!glossarySearch.trim()) return true;
                      const q = glossarySearch.toLowerCase();
                      return (
                        item.term.toLowerCase().includes(q) ||
                        item.fullTitle.toLowerCase().includes(q) ||
                        item.definition.toLowerCase().includes(q) ||
                        item.legalBasis.toLowerCase().includes(q) ||
                        item.significance.toLowerCase().includes(q) ||
                        item.tags.some(t => t.toLowerCase().includes(q))
                      );
                    });

                    if (filtered.length === 0) {
                      return (
                        <div className="py-16 text-center text-[var(--text-muted)]">
                          <Scale size={42} className="mx-auto mb-3 opacity-30 text-[var(--accent)]" />
                          <h4 className="text-base font-semibold text-[var(--text-main)]">Tidak ada istilah yang cocok</h4>
                          <p className="text-xs text-[var(--text-muted)] mt-1 max-w-sm mx-auto">
                            Coba cari dengan singkatan (cth: TGR, SiLPA, BAST) atau ubah pilihan kategori di atas.
                          </p>
                          <button
                            onClick={() => { setGlossarySearch(''); setGlossaryCategory('all'); }}
                            className="mt-4 px-4 py-2 bg-[var(--hover-fill)] text-[var(--accent)] rounded-xl text-xs font-semibold hover:bg-[var(--accent)] hover:text-slate-950 transition-all"
                          >
                            Reset Pencarian
                          </button>
                        </div>
                      );
                    }

                    const getCategoryBadge = (cat: string) => {
                      switch (cat) {
                        case 'Keuangan':
                          return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
                        case 'Pengadaan':
                          return 'bg-sky-500/10 text-sky-400 border-sky-500/30';
                        case 'APIP':
                          return 'bg-purple-500/10 text-purple-400 border-purple-500/30';
                        case 'Hukum & Sanksi':
                          return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
                        default:
                          return 'bg-[var(--hover-fill)] text-[var(--text-muted)]';
                      }
                    };

                    return (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
                        {filtered.map(item => (
                          <div
                            key={item.id}
                            className="p-4 sm:p-5 rounded-2xl bg-[var(--hover-fill)]/40 border border-[var(--border-line)] hover:border-[var(--accent)]/40 transition-all flex flex-col justify-between group shadow-sm hover:shadow-md"
                          >
                            <div className="space-y-3">
                              {/* Top Title & Badge */}
                              <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="text-base font-bold text-[var(--accent)] tracking-wide">
                                      {item.term}
                                    </span>
                                    <span className={`text-[10px] px-2 py-0.5 rounded-lg font-semibold border ${getCategoryBadge(item.category)}`}>
                                      {item.category}
                                    </span>
                                  </div>
                                  <h4 className="text-sm font-semibold text-[var(--text-main)] mt-0.5 leading-snug">
                                    {item.fullTitle}
                                  </h4>
                                </div>

                                <button
                                  onClick={() => handleCopyLegalBasis(item)}
                                  className="p-2 rounded-xl bg-[var(--hover-fill)] hover:bg-[var(--accent)]/15 text-[var(--text-muted)] hover:text-[var(--accent)] transition-all flex-shrink-0 flex items-center gap-1.5 text-xs font-semibold"
                                  title="Salin Rujukan & Dasar Hukum"
                                >
                                  <Copy size={13} />
                                  <span className="hidden sm:inline">Salin</span>
                                </button>
                              </div>

                              {/* Definition Text */}
                              <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                                {item.definition}
                              </p>

                              {/* Legal Basis Container */}
                              <div className="p-3 rounded-xl bg-[var(--bg-panel)] border border-[var(--border-line)] space-y-1">
                                <div className="flex items-center gap-1.5 text-[var(--accent)] text-xs font-semibold">
                                  <Scale size={13} />
                                  <span>Dasar Hukum Resmi:</span>
                                </div>
                                <p className="text-xs text-[var(--text-main)] font-mono leading-relaxed select-all">
                                  {item.legalBasis}
                                </p>
                              </div>

                              {/* Audit Significance */}
                              <div className="p-3 rounded-xl bg-[var(--hover-fill)]/70 text-xs text-[var(--text-muted)] leading-relaxed">
                                <span className="font-semibold text-[var(--text-main)] block mb-0.5">
                                  Signifikansi Pemeriksaan / LHP:
                                </span>
                                {item.significance}
                              </div>
                            </div>

                            {/* Tags */}
                            <div className="pt-3 mt-3 border-t border-[var(--border-line)]/60 flex items-center gap-1.5 flex-wrap">
                              {item.tags.map(tag => (
                                <span
                                  key={tag}
                                  className="text-[10px] px-2 py-0.5 rounded-md bg-[var(--bg-panel)] text-[var(--text-muted)] border border-[var(--border-line)] font-medium"
                                >
                                  #{tag}
                                </span>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                </div>

                {/* Footer */}
                <div className="p-4 sm:p-5 border-t border-[var(--border-line)] bg-[var(--hover-fill)]/50 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
                    <Bookmark size={14} className="text-[var(--accent)]" />
                    <span>
                      Tip: Tekan <kbd className="px-1.5 py-0.5 rounded bg-[var(--hover-fill)] border border-[var(--border-line)] font-mono text-[10px] text-[var(--text-main)]">Ctrl+G</kbd> untuk buka cepat kapan saja
                    </span>
                  </div>
                  <button
                    onClick={() => { playHaptic('click'); setIsGlossaryModalOpen(false); }}
                    className="px-5 py-2.5 bg-[var(--accent)] text-slate-950 font-semibold rounded-xl text-xs hover:opacity-90 transition-all shadow-md w-full sm:w-auto"
                  >
                    Tutup Glosarium
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* MODAL KELOLA OPD BINAAN IRBAN 3 */}
        <AnimatePresence>
          {isManageOpdModalOpen && (
            <div className="fixed inset-0 z-[260] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
              <motion.div
                initial={{ scale: 0.95, opacity: 0, y: 15 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 15 }}
                className="bg-[var(--bg-panel)] rounded-2xl w-full max-w-2xl border border-[var(--border-line)] shadow-2xl relative flex flex-col max-h-[90vh] overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header Modal */}
                <div className="p-5 sm:p-6 border-b border-[var(--border-line)] flex items-start justify-between bg-[var(--hover-fill)]/30">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[var(--accent)]/15 text-[var(--accent)] flex items-center justify-center font-bold flex-shrink-0">
                      <Building2 size={22} />
                    </div>
                    <div>
                      <h3 className="text-base sm:text-lg font-bold text-[var(--text-main)]">
                        Kelola Wilayah Binaan OPD
                      </h3>
                      <p className="text-xs text-[var(--text-muted)]">
                        Atur daftar OPD Pemprov Sultra dan tandai bintang untuk OPD yang menjadi wilayah pengawasan Irban 3
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => { playHaptic('click'); setIsManageOpdModalOpen(false); }}
                    className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--hover-fill)] transition-colors"
                  >
                    <X size={18} />
                  </button>
                </div>

                {/* Content Modal (Scrollable) */}
                <div className="p-5 sm:p-6 space-y-6 overflow-y-auto custom-scrollbar flex-1">
                  {/* Form Tambah OPD Baru */}
                  <div className="p-4 rounded-xl bg-[var(--hover-fill)] border border-[var(--border-line)] space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-[var(--text-main)] flex items-center gap-1.5">
                        <Plus size={14} className="text-[var(--accent)]" /> Tambah OPD Baru / Kustom
                      </h4>
                      <span className="text-[10px] text-slate-500">Kecamatan, UPTD, BUMD atau Dinas baru</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                      <div className="sm:col-span-2">
                        <label className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider block mb-1">
                          Nama Lengkap OPD *
                        </label>
                        <input
                          type="text"
                          value={newOpdForm.name}
                          onChange={(e) => setNewOpdForm({ ...newOpdForm, name: e.target.value })}
                          placeholder="misal: Dinas Kehutanan Prov. Sultra"
                          className="w-full bg-[var(--bg-panel)] border border-[var(--border-line)] rounded-lg px-3 py-1.5 text-xs text-[var(--text-main)] outline-none focus:border-[var(--accent)]"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider block mb-1">
                          Kode / Singkatan *
                        </label>
                        <input
                          type="text"
                          value={newOpdForm.code}
                          onChange={(e) => setNewOpdForm({ ...newOpdForm, code: e.target.value })}
                          placeholder="misal: Dishut"
                          className="w-full bg-[var(--bg-panel)] border border-[var(--border-line)] rounded-lg px-3 py-1.5 text-xs text-[var(--text-main)] outline-none focus:border-[var(--accent)]"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                      <div>
                        <label className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider block mb-1">
                          Kategori
                        </label>
                        <select
                          value={newOpdForm.category}
                          onChange={(e) => setNewOpdForm({ ...newOpdForm, category: e.target.value as any })}
                          className="w-full bg-[var(--bg-panel)] border border-[var(--border-line)] rounded-lg px-2.5 py-1.5 text-xs text-[var(--text-main)] outline-none focus:border-[var(--accent)]"
                        >
                          <option value="Dinas">Dinas</option>
                          <option value="Badan">Badan</option>
                          <option value="RSUD">RSUD</option>
                          <option value="Sekretariat">Sekretariat</option>
                          <option value="Lainnya">Lainnya / Kecamatan</option>
                        </select>
                      </div>
                      <div className="sm:col-span-2">
                        <label className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider block mb-1">
                          Kata Kunci / Alias (Pisahkan dengan koma)
                        </label>
                        <input
                          type="text"
                          value={newOpdForm.aliases}
                          onChange={(e) => setNewOpdForm({ ...newOpdForm, aliases: e.target.value })}
                          placeholder="misal: dishut, kehutanan, hutan, kph"
                          className="w-full bg-[var(--bg-panel)] border border-[var(--border-line)] rounded-lg px-3 py-1.5 text-xs text-[var(--text-main)] outline-none focus:border-[var(--accent)]"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <label className="flex items-center gap-2 cursor-pointer text-xs text-[var(--text-muted)]">
                        <input
                          type="checkbox"
                          checked={newOpdForm.isBinaanIrban3}
                          onChange={(e) => setNewOpdForm({ ...newOpdForm, isBinaanIrban3: e.target.checked })}
                          className="rounded border-[var(--border-line)] text-[var(--accent)] focus:ring-[var(--accent)]"
                        />
                        <span>Tandai langsung sebagai Binaan Irban 3</span>
                      </label>
                      <button
                        type="button"
                        onClick={handleAddNewOpd}
                        disabled={!newOpdForm.name.trim() || !newOpdForm.code.trim()}
                        className="px-3.5 py-1.5 rounded-lg bg-[var(--accent)] text-[var(--accent-fg)] font-semibold text-xs hover:opacity-90 disabled:opacity-50 transition-all flex items-center gap-1.5 shadow-sm"
                      >
                        <Plus size={13} strokeWidth={2.5} /> Simpan OPD
                      </button>
                    </div>
                  </div>

                  {/* Daftar OPD */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-xs font-bold text-[var(--text-main)] uppercase tracking-wider">
                        Daftar OPD Terdaftar ({opdList.length})
                      </h4>
                      <button
                        onClick={handleResetOpdToDefault}
                        className="text-[11px] text-[var(--text-muted)] hover:text-amber-400 hover:underline flex items-center gap-1"
                        title="Kembalikan ke daftar bawaan standar Pemprov Sulawesi Tenggara"
                      >
                        <RotateCw size={11} /> Reset ke Standar Sultra
                      </button>
                    </div>

                    <div className="space-y-1.5 max-h-80 overflow-y-auto custom-scrollbar p-0.5">
                      {opdList.map((opd) => {
                        const count = opdCounts[opd.id] || 0;
                        const isCustom = !DEFAULT_OPD_SULTRA.some(d => d.id === opd.id);
                        return (
                          <div
                            key={opd.id}
                            className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                              opd.isBinaanIrban3
                                ? 'bg-[var(--accent)]/5 border-[var(--accent)]/30'
                                : 'bg-[var(--hover-fill)]/60 border-[var(--border-line)]'
                            }`}
                          >
                            <div className="flex items-center gap-3 min-w-0 pr-2">
                              <button
                                type="button"
                                onClick={() => handleToggleOpdBinaan(opd.id)}
                                className={`p-1.5 rounded-lg transition-colors flex-shrink-0 ${
                                  opd.isBinaanIrban3
                                    ? 'bg-amber-500/20 text-amber-400 hover:bg-amber-500/30'
                                    : 'text-slate-500 hover:text-amber-400 hover:bg-white/5'
                                }`}
                                title={opd.isBinaanIrban3 ? 'Hapus dari Binaan Irban 3' : 'Tandai sebagai Binaan Irban 3'}
                              >
                                <Star size={15} className={opd.isBinaanIrban3 ? 'fill-amber-400 text-amber-400' : ''} />
                              </button>
                              <div className="min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <strong className="text-xs font-bold text-[var(--text-main)]">{opd.code}</strong>
                                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--hover-fill)] text-[var(--text-muted)] border border-[var(--border-line)]">
                                    {opd.category}
                                  </span>
                                  {opd.isBinaanIrban3 && (
                                    <span className="text-[9px] px-1.5 py-0.2 rounded-md bg-amber-500/15 text-amber-400 font-bold border border-amber-500/30">
                                      Binaan Irban 3
                                    </span>
                                  )}
                                  {isCustom && (
                                    <span className="text-[9px] px-1.5 py-0.2 rounded-md bg-purple-500/15 text-purple-400 font-bold border border-purple-500/30">
                                      Kustom
                                    </span>
                                  )}
                                </div>
                                <p className="text-xs text-[var(--text-muted)] truncate max-w-sm sm:max-w-md mt-0.5">
                                  {opd.name}
                                </p>
                                <p className="text-[10px] text-slate-500 truncate mt-0.5">
                                  Alias: {opd.aliases.join(', ')}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 flex-shrink-0">
                              {count > 0 && (
                                <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--accent)]/15 text-[var(--accent)] font-bold border border-[var(--accent)]/30">
                                  {count} berkas
                                </span>
                              )}
                              {isCustom && (
                                <button
                                  type="button"
                                  onClick={() => handleDeleteCustomOpd(opd.id)}
                                  className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                                  title="Hapus OPD Kustom ini"
                                >
                                  <Trash2 size={14} />
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Footer Modal */}
                <div className="p-4 sm:p-5 border-t border-[var(--border-line)] bg-[var(--hover-fill)]/40 flex items-center justify-between">
                  <span className="text-xs text-[var(--text-muted)] flex items-center gap-1.5">
                    <CheckCheck size={14} className="text-emerald-400" /> Pengaturan disimpan otomatis di perangkat
                  </span>
                  <button
                    onClick={() => { playHaptic('click'); setIsManageOpdModalOpen(false); }}
                    className="px-4 py-2 bg-[var(--accent)] text-[var(--accent-fg)] rounded-xl text-xs font-semibold hover:opacity-90 transition-all shadow-md"
                  >
                    Selesai
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* MODAL MATRIKS KELENGKAPAN BERKAS (LHP & ST) IRBAN 3 */}
        <AnimatePresence>
          {isChecklistModalOpen && (
            <div className="fixed inset-0 z-[270] flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-md">
              <motion.div
                initial={{ scale: 0.95, opacity: 0, y: 15 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 15 }}
                className="bg-[var(--bg-panel)] rounded-2xl w-full max-w-5xl border border-[var(--border-line)] shadow-2xl relative flex flex-col max-h-[92vh] overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header Modal */}
                <div className="p-5 sm:p-6 border-b border-[var(--border-line)] flex items-start justify-between bg-gradient-to-r from-[var(--hover-fill)]/50 via-transparent to-[var(--hover-fill)]/30">
                  <div className="flex items-center gap-3.5">
                    <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold flex-shrink-0 shadow-md">
                      <ClipboardCheck size={24} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-base sm:text-lg font-bold text-[var(--text-main)]">
                          Matriks Kelengkapan Dokumen Pengawasan (LHP & ST)
                        </h3>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 font-bold border border-emerald-500/30">
                          Khusus Irban 3
                        </span>
                      </div>
                      <p className="text-xs text-[var(--text-muted)] mt-0.5">
                        Pemantauan kepatuhan pengarsipan berkas wajib penugasan pengawasan: Surat Tugas (ST) dan Laporan Hasil Pengawasan (LHP)
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => { playHaptic('pop'); fetchGlobalChecklist(); }}
                      disabled={checklistLoading}
                      title="Segarkan Data Matriks"
                      className="p-2 rounded-xl text-[var(--text-muted)] hover:text-[var(--accent)] hover:bg-[var(--hover-fill)] transition-colors border border-[var(--border-line)] disabled:opacity-50"
                    >
                      <RotateCw size={16} className={checklistLoading ? 'animate-spin text-emerald-400' : ''} />
                    </button>
                    <button
                      onClick={() => { playHaptic('click'); setIsChecklistModalOpen(false); }}
                      className="p-2 rounded-xl text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--hover-fill)] transition-colors border border-[var(--border-line)]"
                    >
                      <X size={18} />
                    </button>
                  </div>
                </div>

                {/* Content Modal (Scrollable) */}
                <div className="p-5 sm:p-6 space-y-5 overflow-y-auto custom-scrollbar flex-1">
                  {/* KPI Ringkasan Status */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3.5 rounded-xl bg-[var(--hover-fill)] border border-[var(--border-line)]">
                      <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider font-semibold">Total Folder Penugasan</p>
                      <p className="text-xl font-black text-[var(--text-main)] mt-1">
                        {checklistGlobalData?.summary?.totalFolders ?? allFolders.length}
                      </p>
                      <p className="text-[10px] text-[var(--text-muted)] mt-0.5">Wilayah & Penugasan</p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-emerald-500/[0.06] border border-emerald-500/30">
                      <div className="flex items-center justify-between">
                        <p className="text-[10px] text-emerald-400 uppercase tracking-wider font-bold">2/2 Lengkap (ST + LHP)</p>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-bold">
                          {checklistGlobalData?.summary?.completenessRate ?? 0}%
                        </span>
                      </div>
                      <p className="text-xl font-black text-emerald-400 mt-1">
                        {checklistGlobalData?.summary?.completeCount ?? 0}
                      </p>
                      <p className="text-[10px] text-emerald-400/70 mt-0.5">Memenuhi standar arsip</p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-cyan-500/[0.06] border border-cyan-500/30">
                      <p className="text-[10px] text-cyan-400 uppercase tracking-wider font-bold">Kurang ST (Surat Tugas)</p>
                      <p className="text-xl font-black text-cyan-400 mt-1">
                        {checklistGlobalData?.summary?.missingStCount ?? 0}
                      </p>
                      <p className="text-[10px] text-cyan-400/70 mt-0.5">Hanya memiliki LHP</p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-amber-500/[0.06] border border-amber-500/30">
                      <p className="text-[10px] text-amber-400 uppercase tracking-wider font-bold">Kurang LHP (Laporan)</p>
                      <p className="text-xl font-black text-amber-400 mt-1">
                        {checklistGlobalData?.summary?.missingLhpCount ?? 0}
                      </p>
                      <p className="text-[10px] text-amber-400/70 mt-0.5">Hanya memiliki ST</p>
                    </div>
                  </div>

                  {/* Filter Tabs & Search Bar */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
                    {/* Tabs Status */}
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                      {[
                        { id: 'all', label: 'Semua', count: checklistGlobalData?.summary?.totalFolders ?? 0 },
                        { id: 'complete', label: '🟢 Lengkap (2/2)', count: checklistGlobalData?.summary?.completeCount ?? 0 },
                        { id: 'missing_st', label: '🟡 Kurang ST', count: checklistGlobalData?.summary?.missingStCount ?? 0 },
                        { id: 'missing_lhp', label: '🟡 Kurang LHP', count: checklistGlobalData?.summary?.missingLhpCount ?? 0 },
                        { id: 'empty', label: '🔴 Kosong (0/2)', count: checklistGlobalData?.summary?.emptyCount ?? 0 },
                      ].map(tab => (
                        <button
                          key={tab.id}
                          onClick={() => { playHaptic('click'); setChecklistTabFilter(tab.id as any); }}
                          className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
                            checklistTabFilter === tab.id
                              ? 'bg-[var(--accent)] text-slate-950 border-[var(--accent)] shadow-sm'
                              : 'bg-[var(--hover-fill)] text-[var(--text-muted)] hover:text-[var(--text-main)] border-[var(--border-line)]'
                          }`}
                        >
                          {tab.label} ({tab.count})
                        </button>
                      ))}
                    </div>

                    {/* Search Input */}
                    <div className="relative min-w-[200px] sm:min-w-[260px]">
                      <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                      <input
                        type="text"
                        value={checklistSearchQuery}
                        onChange={(e) => setChecklistSearchQuery(e.target.value)}
                        placeholder="Cari folder / nama OPD..."
                        className="w-full pl-9 pr-8 py-2 rounded-xl bg-[var(--hover-fill)] border border-[var(--border-line)] text-xs text-[var(--text-main)] outline-none focus:border-[var(--accent)] placeholder:text-[var(--text-muted)]"
                      />
                      {checklistSearchQuery && (
                        <button
                          onClick={() => setChecklistSearchQuery('')}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-main)]"
                        >
                          <X size={13} />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* TABEL MATRIKS KELENGKAPAN */}
                  <div className="rounded-xl border border-[var(--border-line)] overflow-hidden bg-[var(--hover-fill)]/40">
                    {checklistLoading ? (
                      <div className="p-12 text-center">
                        <Loader2 size={32} className="animate-spin text-emerald-400 mx-auto mb-3" />
                        <p className="text-xs text-[var(--text-muted)] font-medium">Memindai kelengkapan berkas LHP & ST di Google Drive...</p>
                      </div>
                    ) : (() => {
                      const list = (checklistGlobalData?.checklists || []).filter((item: any) => {
                        // Filter Tab
                        if (checklistTabFilter !== 'all' && item.status !== checklistTabFilter) return false;
                        // Filter Search
                        if (checklistSearchQuery.trim()) {
                          const q = checklistSearchQuery.toLowerCase();
                          const inName = (item.name || '').toLowerCase().includes(q);
                          const inSt = item.stFiles && item.stFiles.some((f: any) => (f.name || '').toLowerCase().includes(q));
                          const inLhp = item.lhpFiles && item.lhpFiles.some((f: any) => (f.name || '').toLowerCase().includes(q));
                          return inName || inSt || inLhp;
                        }
                        return true;
                      });

                      if (list.length === 0) {
                        return (
                          <div className="p-10 text-center">
                            <ClipboardCheck size={36} className="text-slate-600 mx-auto mb-2" />
                            <p className="text-xs text-[var(--text-muted)]">Tidak ada data penugasan yang sesuai dengan filter.</p>
                          </div>
                        );
                      }

                      return (
                        <div className="overflow-x-auto">
                          <table className="w-full text-left border-collapse text-xs">
                            <thead>
                              <tr className="border-b border-[var(--border-line)] bg-[var(--hover-fill)] text-[var(--text-muted)] font-semibold uppercase tracking-wider text-[10px]">
                                <th className="p-3 w-12 text-center">No</th>
                                <th className="p-3 min-w-[180px]">Folder Penugasan / OPD</th>
                                <th className="p-3 min-w-[200px]">Surat Tugas (ST / SPT)</th>
                                <th className="p-3 min-w-[200px]">Laporan Hasil (LHP)</th>
                                <th className="p-3 w-32 text-center">Kelengkapan</th>
                                <th className="p-3 w-28 text-right">Aksi</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-[var(--border-line)]">
                              {list.map((item: any, idx: number) => {
                                const hasSt = item.hasSt;
                                const hasLhp = item.hasLhp;
                                const stFile = item.stFiles && item.stFiles.length > 0 ? item.stFiles[0] : null;
                                const lhpFile = item.lhpFiles && item.lhpFiles.length > 0 ? item.lhpFiles[0] : null;

                                return (
                                  <tr key={item.id || idx} className="hover:bg-[var(--hover-fill)]/70 transition-colors">
                                    <td className="p-3 text-center text-[var(--text-muted)] font-mono text-[11px]">
                                      {idx + 1}
                                    </td>
                                    <td className="p-3 font-semibold text-[var(--text-main)]">
                                      <div className="flex items-center gap-2">
                                        <Folder size={14} className="text-[var(--accent)] flex-shrink-0" />
                                        <span className="truncate max-w-[220px]" title={item.name}>
                                          {item.name}
                                        </span>
                                      </div>
                                      <p className="text-[10px] text-[var(--text-muted)] mt-0.5 pl-5">
                                        Total {item.totalDocs || 0} berkas terdaftar
                                      </p>
                                    </td>
                                    {/* Surat Tugas Column */}
                                    <td className="p-3">
                                      {hasSt ? (
                                        <div className="space-y-1">
                                          <div className="flex items-center gap-1.5 text-cyan-400 font-semibold">
                                            <CheckCircle2 size={13} className="flex-shrink-0" />
                                            <span className="truncate max-w-[180px]" title={stFile?.name}>
                                              {stFile?.name}
                                            </span>
                                          </div>
                                          {stFile && (
                                            <button
                                              onClick={() => {
                                                handleFileSelect(stFile);
                                                setIsChecklistModalOpen(false);
                                              }}
                                              className="text-[10px] text-cyan-400/80 hover:text-cyan-300 hover:underline flex items-center gap-1"
                                            >
                                              <Eye size={11} /> Buka Berkas ST
                                            </button>
                                          )}
                                        </div>
                                      ) : (
                                        <div className="flex items-center gap-1.5 text-rose-400/90 font-medium">
                                          <AlertCircle size={13} className="flex-shrink-0 text-rose-500" />
                                          <span>Belum Ada ST</span>
                                        </div>
                                      )}
                                    </td>
                                    {/* LHP Column */}
                                    <td className="p-3">
                                      {hasLhp ? (
                                        <div className="space-y-1">
                                          <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                                            <CheckCircle2 size={13} className="flex-shrink-0" />
                                            <span className="truncate max-w-[180px]" title={lhpFile?.name}>
                                              {lhpFile?.name}
                                            </span>
                                          </div>
                                          {lhpFile && (
                                            <button
                                              onClick={() => {
                                                handleFileSelect(lhpFile);
                                                setIsChecklistModalOpen(false);
                                              }}
                                              className="text-[10px] text-emerald-400/80 hover:text-emerald-300 hover:underline flex items-center gap-1"
                                            >
                                              <Eye size={11} /> Buka LHP
                                            </button>
                                          )}
                                        </div>
                                      ) : (
                                        <div className="flex items-center gap-1.5 text-rose-400/90 font-medium">
                                          <AlertCircle size={13} className="flex-shrink-0 text-rose-500" />
                                          <span>Belum Ada LHP</span>
                                        </div>
                                      )}
                                    </td>
                                    {/* Skor / Badge Kelengkapan */}
                                    <td className="p-3 text-center">
                                      <div className="flex flex-col items-center gap-1">
                                        <span className={`inline-flex items-center gap-1 text-[10px] px-2.5 py-0.5 rounded-full font-bold border ${
                                          item.status === 'complete'
                                            ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                                            : item.status === 'empty'
                                              ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                                              : 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                                        }`}>
                                          {item.status === 'complete' ? 'Lengkap (2/2)' : item.status === 'missing_st' ? 'Kurang ST' : item.status === 'missing_lhp' ? 'Kurang LHP' : 'Kosong (0/2)'}
                                        </span>
                                        {/* Progress bar */}
                                        <div className="w-16 bg-slate-700/40 h-1.5 rounded-full overflow-hidden">
                                          <div
                                            className={`h-full rounded-full ${
                                              item.status === 'complete' ? 'bg-emerald-400' : item.status === 'empty' ? 'bg-rose-500' : 'bg-amber-400'
                                            }`}
                                            style={{ width: `${item.completenessScore}%` }}
                                          />
                                        </div>
                                      </div>
                                    </td>
                                    {/* Action Column */}
                                    <td className="p-3 text-right">
                                      {item.id !== 'root' ? (
                                        <button
                                          onClick={() => {
                                            playHaptic('click');
                                            navigateToFolder(item.id, item.name);
                                            setIsChecklistModalOpen(false);
                                          }}
                                          className="px-2.5 py-1 rounded-lg bg-[var(--hover-fill)] hover:bg-[var(--accent)] hover:text-slate-950 text-[var(--text-main)] border border-[var(--border-line)] text-xs font-medium inline-flex items-center gap-1 transition-all"
                                          title={`Buka folder ${item.name}`}
                                        >
                                          <Folder size={12} /> Buka
                                        </button>
                                      ) : (
                                        <span className="text-[10px] text-[var(--text-muted)] italic">Root Drive</span>
                                      )}
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      );
                    })()}
                  </div>
                </div>

                {/* Footer Modal */}
                <div className="p-4 sm:p-5 border-t border-[var(--border-line)] bg-[var(--hover-fill)]/40 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      onClick={handleExportChecklistCsv}
                      disabled={checklistLoading || !checklistGlobalData?.checklists}
                      className="px-3.5 py-2 rounded-xl bg-emerald-600/15 hover:bg-emerald-600/25 text-emerald-400 border border-emerald-500/30 text-xs font-semibold flex items-center gap-1.5 transition-all disabled:opacity-50"
                      title="Unduh seluruh rekapitulasi kelengkapan LHP & ST dalam format CSV / Excel"
                    >
                      <Download size={14} /> Ekspor Checklist (CSV/Excel)
                    </button>
                    <button
                      onClick={() => {
                        playHaptic('click');
                        if (typeof window !== 'undefined') window.print();
                      }}
                      className="px-3.5 py-2 rounded-xl bg-[var(--hover-fill)] hover:bg-white/10 text-[var(--text-muted)] hover:text-[var(--text-main)] border border-[var(--border-line)] text-xs font-semibold flex items-center gap-1.5 transition-all"
                      title="Cetak lembar rekapitulasi matriks kelengkapan"
                    >
                      <Printer size={14} /> Cetak Matriks
                    </button>
                  </div>

                  <button
                    onClick={() => { playHaptic('click'); setIsChecklistModalOpen(false); }}
                    className="px-5 py-2 rounded-xl bg-[var(--accent)] text-[var(--accent-fg)] text-xs font-semibold hover:opacity-90 transition-all shadow-md w-full sm:w-auto"
                  >
                    Tutup
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* MODAL KONFIRMASI HAPUS BERKAS (DESAIN MODERN & ELEGAN) */}
        <AnimatePresence>
          {deleteModal && deleteModal.isOpen && (
            <div 
              className="fixed inset-0 z-[160] flex items-center justify-center p-4 bg-black/75 backdrop-blur-md"
              onClick={() => !deleteModal.isDeleting && setDeleteModal(null)}
            >
              <motion.div
                initial={{ scale: 0.92, opacity: 0, y: 15 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.94, opacity: 0, y: 10 }}
                transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                className="bg-[var(--bg-panel)] border border-rose-500/30 rounded-2xl max-w-md w-full shadow-2xl overflow-hidden relative"
                onClick={e => e.stopPropagation()}
              >
                {/* Accent Top Strip */}
                <div className="h-1.5 bg-gradient-to-r from-rose-500 via-red-500 to-amber-500 w-full" />

                {/* Close Button */}
                <button
                  onClick={() => !deleteModal.isDeleting && setDeleteModal(null)}
                  disabled={deleteModal.isDeleting}
                  className="absolute right-4 top-4 p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--hover-fill)] transition-all disabled:opacity-40"
                >
                  <X size={18} />
                </button>

                <div className="p-6 text-center space-y-4">
                  {/* Glowing Warning Danger Icon */}
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-rose-500/20 via-red-500/10 to-rose-600/5 text-rose-500 flex items-center justify-center mx-auto border border-rose-500/30 shadow-lg shadow-rose-500/10 relative">
                    <Trash2 size={28} className="text-rose-500 animate-pulse" />
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-rose-600 text-white flex items-center justify-center text-[11px] font-black shadow-md border-2 border-[var(--bg-panel)]">
                      !
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-[var(--text-main)]">
                      Hapus Dokumen Arsip?
                    </h3>
                    <p className="text-xs text-[var(--text-muted)] mt-1.5 leading-relaxed">
                      Tindakan ini memerlukan konfirmasi keamanan Administrator.
                    </p>
                  </div>

                  {/* Document Card Preview */}
                  <div className="p-3.5 rounded-xl bg-black/20 dark:bg-white/[0.03] border border-[var(--border-line)] flex items-start gap-3 text-left">
                    <div className="p-2 rounded-lg bg-rose-500/10 text-rose-400 flex-shrink-0 mt-0.5 border border-rose-500/20">
                      <FileText size={18} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] text-[var(--text-muted)] font-medium uppercase tracking-wider">Berkas yang akan dihapus</p>
                      <p className="text-xs font-semibold text-[var(--text-main)] break-all line-clamp-2 mt-0.5" title={deleteModal.fileName}>
                        {deleteModal.fileName}
                      </p>
                    </div>
                  </div>

                  {/* Info Notice Banner */}
                  <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-left flex items-start gap-2.5">
                    <AlertTriangle size={16} className="text-amber-400 flex-shrink-0 mt-0.5" />
                    <p className="text-[11px] text-amber-300/90 leading-relaxed">
                      Dokumen akan dipindahkan ke Sampah Google Drive atau dihapus dari direktori arsip sesuai otorisasi sistem.
                    </p>
                  </div>

                  {/* Error Notification Banner if Failed */}
                  {deleteModal.error && (
                    <motion.div 
                      initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}
                      className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs text-left leading-relaxed flex items-start gap-2"
                    >
                      <AlertCircle size={15} className="text-rose-400 flex-shrink-0 mt-0.5" />
                      <span><strong>Gagal:</strong> {deleteModal.error}</span>
                    </motion.div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex items-center gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => !deleteModal.isDeleting && setDeleteModal(null)}
                      disabled={deleteModal.isDeleting}
                      className="flex-1 py-2.5 px-4 rounded-xl border border-[var(--border-line)] text-xs font-semibold text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--hover-fill)] transition-all disabled:opacity-40"
                    >
                      Batal
                    </button>
                    <button
                      type="button"
                      onClick={handleConfirmDelete}
                      disabled={deleteModal.isDeleting}
                      className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white text-xs font-bold shadow-lg shadow-rose-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {deleteModal.isDeleting ? (
                        <>
                          <Loader2 size={15} className="animate-spin" />
                          <span>Menghapus...</span>
                        </>
                      ) : (
                        <>
                          <Trash2 size={15} />
                          <span>Ya, Hapus Dokumen</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* MODAL PINDAHKAN DOKUMEN (MOVE TO FOLDER) */}
        <AnimatePresence>
          {moveModal && moveModal.isOpen && (
            <div 
              className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/75 backdrop-blur-md"
              onClick={() => !moveModal.isMoving && setMoveModal(null)}
            >
              <motion.div
                initial={{ scale: 0.92, opacity: 0, y: 15 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.94, opacity: 0, y: 10 }}
                transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                className="bg-[var(--bg-panel)] border border-[var(--border-line)] rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden flex flex-col max-h-[85vh] relative"
                onClick={e => e.stopPropagation()}
              >
                {/* Accent Top Strip */}
                <div className="h-1.5 bg-gradient-to-r from-amber-500 via-[var(--accent)] to-blue-500 w-full" />

                {/* Header */}
                <div className="p-5 sm:p-6 border-b border-[var(--border-line)] flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-xl flex-shrink-0">
                      <FolderInput size={20} />
                    </div>
                    <div>
                      <h3 className="text-base sm:text-lg font-bold text-[var(--text-main)]">
                        {moveModal.fileIds && moveModal.fileIds.length > 1
                          ? `Pindahkan ${moveModal.fileIds.length} Dokumen Sekaligus`
                          : 'Pindahkan Dokumen'}
                      </h3>
                      <p className="text-xs text-[var(--text-muted)] mt-0.5">
                        {moveModal.fileIds && moveModal.fileIds.length > 1
                          ? `Pilih folder tujuan untuk memindahkan ${moveModal.fileIds.length} berkas yang dipilih`
                          : 'Pilih folder tujuan untuk memindahkan berkas'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => !moveModal.isMoving && setMoveModal(null)}
                    disabled={moveModal.isMoving}
                    className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--hover-fill)] transition-all"
                  >
                    <X size={18} />
                  </button>
                </div>

                {/* Body Content */}
                <div className="p-5 sm:p-6 space-y-4 overflow-y-auto flex-1 custom-scrollbar">
                  {/* File Info Box */}
                  <div className="p-3.5 rounded-xl bg-black/20 dark:bg-white/[0.03] border border-[var(--border-line)] space-y-2">
                    <div className="flex items-start gap-2.5">
                      <div className="p-2 rounded-xl bg-[var(--accent)]/15 text-[var(--accent)] flex-shrink-0 mt-0.5">
                        {moveModal.fileIds && moveModal.fileIds.length > 1 ? <CheckSquare size={16} /> : <FileText size={16} />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider block font-bold">
                            {moveModal.fileIds && moveModal.fileIds.length > 1
                              ? `${moveModal.fileIds.length} Dokumen Dipilih`
                              : 'Dokumen'}
                          </span>
                          {moveModal.fileIds && moveModal.fileIds.length > 1 && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--accent)] text-[var(--accent-fg)] font-bold">
                              {moveModal.fileIds.length} Berkas
                            </span>
                          )}
                        </div>
                        {moveModal.fileIds && moveModal.fileIds.length > 1 ? (
                          <div className="mt-2 max-h-28 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
                            {moveModal.fileNames?.map((name, idx) => (
                              <div key={idx} className="flex items-center gap-1.5 text-xs text-[var(--text-main)] bg-[var(--hover-fill)] px-2 py-1 rounded-lg border border-[var(--border-line)]">
                                <FileText size={12} className="text-[var(--accent)] flex-shrink-0" />
                                <span className="truncate" title={name}>{name}</span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs font-semibold text-[var(--text-main)] break-all mt-0.5" title={moveModal.fileName}>
                            {moveModal.fileName}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="pt-2 border-t border-[var(--border-line)]/50 flex items-center justify-between text-xs">
                      <span className="text-[var(--text-muted)]">Lokasi Sekarang:</span>
                      <span className="font-semibold text-[var(--text-main)] px-2 py-0.5 rounded bg-[var(--hover-fill)] border border-[var(--border-line)]">
                        {currentFolder 
                          ? (allFolders.find(f => f.id === currentFolder)?.name || 'Folder Aktif') 
                          : '📂 Beranda / Root'}
                      </span>
                    </div>
                  </div>

                  {/* Search Destination Folders */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[var(--text-main)] flex items-center justify-between">
                      <span>Pilih Folder Tujuan:</span>
                      <span className="text-[11px] text-[var(--text-muted)] font-normal">
                        {allFolders.length + 1} lokasi tersedia
                      </span>
                    </label>
                    <div className="relative">
                      <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                      <input
                        type="text"
                        value={moveModal.searchQuery}
                        onChange={(e) => setMoveModal(prev => prev ? { ...prev, searchQuery: e.target.value } : null)}
                        placeholder="Cari folder tujuan..."
                        className="w-full bg-white/[0.04] border border-[var(--border-line)] rounded-xl py-2 pl-9 pr-3 text-xs text-[var(--text-main)] outline-none focus:border-[var(--accent)] transition-all placeholder:text-[var(--text-muted)]"
                      />
                      {moveModal.searchQuery && (
                        <button
                          onClick={() => setMoveModal(prev => prev ? { ...prev, searchQuery: '' } : null)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-main)]"
                        >
                          <X size={12} />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Folder Destination List */}
                  <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1 custom-scrollbar">
                    {/* Root Option */}
                    {('beranda root folder utama'.includes(moveModal.searchQuery.toLowerCase())) && (
                      <button
                        type="button"
                        onClick={() => {
                          if (currentFolder === '') return;
                          setMoveModal(prev => prev ? { ...prev, targetFolderId: 'root' } : null);
                        }}
                        disabled={currentFolder === ''}
                        className={`w-full p-3 rounded-xl border text-left flex items-center justify-between transition-all ${
                          currentFolder === ''
                            ? 'opacity-40 border-[var(--border-line)] bg-[var(--hover-fill)] cursor-not-allowed'
                            : moveModal.targetFolderId === 'root'
                              ? 'border-[var(--accent)] bg-[var(--accent)]/10 ring-1 ring-[var(--accent)] text-[var(--text-main)] shadow-sm'
                              : 'border-[var(--border-line)] hover:border-[var(--border-strong)] hover:bg-[var(--hover-fill)] text-[var(--text-main)]'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className={`p-1.5 rounded-lg ${moveModal.targetFolderId === 'root' ? 'bg-[var(--accent)]/20 text-[var(--accent)]' : 'bg-slate-500/10 text-slate-400'}`}>
                            <Database size={16} />
                          </div>
                          <div>
                            <p className="text-xs font-semibold">📂 Beranda / Root</p>
                            <p className="text-[10px] text-[var(--text-muted)]">Direktori terluar Google Drive</p>
                          </div>
                        </div>
                        {currentFolder === '' ? (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-500/15 text-[var(--text-muted)] font-medium">
                            Lokasi Saat Ini
                          </span>
                        ) : moveModal.targetFolderId === 'root' ? (
                          <Check size={16} className="text-[var(--accent)] flex-shrink-0" />
                        ) : null}
                      </button>
                    )}

                    {/* Subfolders */}
                    {allFolders
                      .filter(f => !moveModal.searchQuery || f.name.toLowerCase().includes(moveModal.searchQuery.toLowerCase()))
                      .map((f) => {
                        const isCurrentLocation = f.id === currentFolder;
                        const isSelected = moveModal.targetFolderId === f.id;
                        return (
                          <button
                            key={f.id}
                            type="button"
                            onClick={() => {
                              if (isCurrentLocation) return;
                              setMoveModal(prev => prev ? { ...prev, targetFolderId: f.id } : null);
                            }}
                            disabled={isCurrentLocation}
                            className={`w-full p-3 rounded-xl border text-left flex items-center justify-between transition-all ${
                              isCurrentLocation
                                ? 'opacity-40 border-[var(--border-line)] bg-[var(--hover-fill)] cursor-not-allowed'
                                : isSelected
                                  ? 'border-[var(--accent)] bg-[var(--accent)]/10 ring-1 ring-[var(--accent)] text-[var(--text-main)] shadow-sm'
                                  : 'border-[var(--border-line)] hover:border-[var(--border-strong)] hover:bg-[var(--hover-fill)] text-[var(--text-main)]'
                            }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className={`p-1.5 rounded-lg ${isSelected ? 'bg-[var(--accent)]/20 text-[var(--accent)]' : 'bg-blue-500/10 text-blue-400'}`}>
                                <Folder size={16} />
                              </div>
                              <span className="text-xs font-semibold truncate" title={f.name}>
                                {f.name}
                              </span>
                            </div>
                            {isCurrentLocation ? (
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-500/15 text-[var(--text-muted)] font-medium">
                                Lokasi Saat Ini
                              </span>
                            ) : isSelected ? (
                              <Check size={16} className="text-[var(--accent)] flex-shrink-0" />
                            ) : null}
                          </button>
                        );
                      })}

                    {allFolders.filter(f => !moveModal.searchQuery || f.name.toLowerCase().includes(moveModal.searchQuery.toLowerCase())).length === 0 && !('beranda root folder utama'.includes(moveModal.searchQuery.toLowerCase())) && (
                      <div className="text-center py-6 text-[var(--text-muted)]">
                        <Folder size={28} className="mx-auto opacity-30 mb-2" />
                        <p className="text-xs">Tidak ada folder yang cocok dengan "{moveModal.searchQuery}"</p>
                      </div>
                    )}
                  </div>

                  {/* Error Notification Banner if Failed */}
                  {moveModal.error && (
                    <motion.div 
                      initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}
                      className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs text-left leading-relaxed flex items-start gap-2"
                    >
                      <AlertCircle size={15} className="text-rose-400 flex-shrink-0 mt-0.5" />
                      <span><strong>Gagal:</strong> {moveModal.error}</span>
                    </motion.div>
                  )}
                </div>

                {/* Footer Actions */}
                <div className="p-4 sm:p-5 border-t border-[var(--border-line)] bg-[var(--hover-fill)]/30 flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => !moveModal.isMoving && setMoveModal(null)}
                    disabled={moveModal.isMoving}
                    className="px-4 py-2.5 rounded-xl border border-[var(--border-line)] text-xs font-semibold text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--hover-fill)] transition-all disabled:opacity-40"
                  >
                    Batal
                  </button>

                  <button
                    type="button"
                    onClick={handleConfirmMove}
                    disabled={!moveModal.targetFolderId || moveModal.targetFolderId === currentFolder || moveModal.isMoving}
                    className="px-5 py-2.5 rounded-xl bg-[var(--accent)] text-[var(--accent-fg)] text-xs font-bold shadow-md hover:opacity-90 transition-all flex items-center gap-2 disabled:opacity-40"
                  >
                    {moveModal.isMoving ? (
                      <>
                        <Loader2 size={14} className="animate-spin" />
                        <span>Memindahkan...</span>
                      </>
                    ) : (
                      <>
                        <FolderInput size={14} />
                        <span>
                          {moveModal.fileIds && moveModal.fileIds.length > 1
                            ? `Pindahkan ${moveModal.fileIds.length} Dokumen ke Sini`
                            : 'Pindahkan ke Sini'}
                        </span>
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* MODAL TAMBAH FOLDER BARU (CREATE FOLDER) */}
        <AnimatePresence>
          {createFolderModal && createFolderModal.isOpen && (
            <div 
              className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/75 backdrop-blur-md"
              onClick={() => !createFolderModal.isCreating && setCreateFolderModal(null)}
            >
              <motion.div
                initial={{ scale: 0.92, opacity: 0, y: 15 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.94, opacity: 0, y: 10 }}
                transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                className="bg-[var(--bg-panel)] border border-[var(--border-line)] rounded-2xl max-w-md w-full shadow-2xl p-6 relative overflow-hidden"
                onClick={e => e.stopPropagation()}
              >
                {/* Accent Top Strip */}
                <div className="h-1.5 bg-gradient-to-r from-[var(--accent)] via-emerald-500 to-cyan-500 absolute top-0 left-0 right-0" />

                {/* Close Button */}
                <button
                  onClick={() => !createFolderModal.isCreating && setCreateFolderModal(null)}
                  disabled={createFolderModal.isCreating}
                  className="absolute right-4 top-4 p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--hover-fill)] transition-all disabled:opacity-40"
                >
                  <X size={18} />
                </button>

                <form onSubmit={handleConfirmCreateFolder} className="space-y-4 pt-2">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-[var(--accent)]/10 text-[var(--accent)] border border-[var(--accent-light)] flex items-center justify-center flex-shrink-0">
                      <FolderPlus size={22} />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-[var(--text-main)]">
                        Buat Folder Baru
                      </h3>
                      <p className="text-xs text-[var(--text-muted)] mt-0.5">
                        Tambahkan direktori baru di Google Drive
                      </p>
                    </div>
                  </div>

                  {/* Input Nama Folder */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[var(--text-main)] block">
                      Nama Folder:
                    </label>
                    <input
                      type="text"
                      autoFocus
                      required
                      value={createFolderModal.name}
                      onChange={(e) => setCreateFolderModal(prev => prev ? { ...prev, name: e.target.value } : null)}
                      placeholder="Contoh: LHP Dinas Pendidikan 2026"
                      className="w-full bg-white/[0.04] border border-[var(--border-line)] rounded-xl p-3 text-xs sm:text-sm text-[var(--text-main)] outline-none focus:border-[var(--accent)] transition-all placeholder:text-[var(--text-muted)]"
                    />
                  </div>

                  {/* Pilihan Lokasi Penempatan Folder */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[var(--text-main)] block">
                      Lokasi Penyimpanan:
                    </label>
                    <select
                      value={createFolderModal.targetParentId}
                      onChange={(e) => setCreateFolderModal(prev => prev ? { ...prev, targetParentId: e.target.value } : null)}
                      className="w-full p-3 rounded-xl bg-white/[0.04] border border-[var(--border-line)] outline-none text-xs sm:text-sm text-[var(--text-main)] focus:border-[var(--accent)] cursor-pointer"
                    >
                      <option value={currentFolder || 'root'} className="bg-[var(--bg-panel)] text-[var(--text-main)]">
                        📁 Lokasi Saat Ini ({currentFolder ? (allFolders.find(f => f.id === currentFolder)?.name || 'Folder Aktif') : 'Beranda / Root'})
                      </option>
                      {currentFolder && (
                        <option value="root" className="bg-[var(--bg-panel)] text-[var(--text-main)]">
                          📂 Beranda / Root (Tingkat Teratas)
                        </option>
                      )}
                      {allFolders
                        .filter(f => f.id !== currentFolder)
                        .map(f => (
                          <option key={f.id} value={f.id} className="bg-[var(--bg-panel)] text-[var(--text-main)]">
                            📁 {f.name}
                          </option>
                        ))}
                    </select>
                  </div>

                  {/* Error Notification Banner if Failed */}
                  {createFolderModal.error && (
                    <motion.div 
                      initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}
                      className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs text-left leading-relaxed flex items-start gap-2"
                    >
                      <AlertCircle size={15} className="text-rose-400 flex-shrink-0 mt-0.5" />
                      <span><strong>Gagal:</strong> {createFolderModal.error}</span>
                    </motion.div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex items-center gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => !createFolderModal.isCreating && setCreateFolderModal(null)}
                      disabled={createFolderModal.isCreating}
                      className="flex-1 py-2.5 px-4 rounded-xl border border-[var(--border-line)] text-xs font-semibold text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--hover-fill)] transition-all disabled:opacity-40"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      disabled={!createFolderModal.name.trim() || createFolderModal.isCreating}
                      className="flex-1 py-2.5 px-4 rounded-xl bg-[var(--accent)] text-[var(--accent-fg)] text-xs font-bold shadow-md hover:opacity-90 transition-all flex items-center justify-center gap-2 disabled:opacity-40"
                    >
                      {createFolderModal.isCreating ? (
                        <>
                          <Loader2 size={14} className="animate-spin" />
                          <span>Membuat Folder...</span>
                        </>
                      ) : (
                        <>
                          <FolderPlus size={14} />
                          <span>Buat Folder</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* MODAL NOTIFIKASI HAK AKSES ADMINISTRATOR */}
        <AnimatePresence>
          {adminNoticeModal && (
            <div 
              className="fixed inset-0 z-[170] flex items-center justify-center p-4 bg-black/75 backdrop-blur-md"
              onClick={() => setAdminNoticeModal(null)}
            >
              <motion.div
                initial={{ scale: 0.92, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.94, opacity: 0 }}
                className="bg-[var(--bg-panel)] border border-amber-500/30 p-6 rounded-2xl max-w-sm w-full shadow-2xl text-center space-y-4 relative"
                onClick={e => e.stopPropagation()}
              >
                <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center mx-auto border border-amber-500/20 shadow-md">
                  <ShieldAlert size={26} />
                </div>
                <div>
                  <h4 className="text-base font-bold text-[var(--text-main)]">Akses Dibatasi</h4>
                  <p className="text-xs text-[var(--text-muted)] mt-1.5 leading-relaxed">
                    {adminNoticeModal}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setAdminNoticeModal(null)}
                  className="w-full py-2.5 px-4 rounded-xl bg-[var(--accent)] text-[var(--accent-fg)] text-xs font-bold shadow-md hover:opacity-90 transition-all"
                >
                  Saya Mengerti
                </button>
              </motion.div>
            </div>
          )}
        </AnimatePresence>


        {/* GLOSSARY COPY TOAST */}
        <AnimatePresence>
          {glossaryCopyToast && (
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              className="fixed bottom-6 right-6 z-[350] px-4 py-3 bg-[var(--bg-panel)] border border-[var(--accent)] text-[var(--text-main)] rounded-2xl shadow-2xl flex items-center gap-2.5 text-xs font-semibold"
            >
              <div className="w-6 h-6 rounded-full bg-[var(--accent)]/20 text-[var(--accent)] flex items-center justify-center flex-shrink-0">
                <Check size={14} />
              </div>
              <span>{glossaryCopyToast}</span>
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