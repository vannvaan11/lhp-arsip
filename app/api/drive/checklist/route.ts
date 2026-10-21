import { google } from 'googleapis';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

function getAuth() {
  let credentials;
  if (process.env.GOOGLE_SERVICE_ACCOUNT_JSON) {
    try {
      credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON);
    } catch (e) {
      console.error('CHECKLIST_AUTH_ERROR: Failed to parse GOOGLE_SERVICE_ACCOUNT_JSON', e);
    }
  }

  if (!credentials && process.env.GOOGLE_CLIENT_EMAIL && process.env.GOOGLE_PRIVATE_KEY) {
    credentials = {
      client_email: process.env.GOOGLE_CLIENT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    };
  }

  return new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/drive.readonly'],
  });
}

// Deteksi apakah file adalah LHP atau ST berdasarkan nama & tag
function classifyDocRole(fileName: string, tagsJson?: string): 'LHP' | 'ST' | 'none' {
  const name = fileName.toLowerCase();

  // 1. Cek Tags (appProperties)
  if (tagsJson) {
    try {
      const tags = JSON.parse(tagsJson);
      if (Array.isArray(tags)) {
        const lowerTags = tags.map((t: string) => String(t).toLowerCase());
        if (lowerTags.some((t: string) => t === 'lhp' || t === 'laporan hasil' || t === 'laporan pengawasan')) {
          return 'LHP';
        }
        if (lowerTags.some((t: string) => t === 'st' || t === 'spt' || t === 'surat tugas' || t === 'surat perintah tugas')) {
          return 'ST';
        }
      }
    } catch {}
  }

  // 2. Cek Nama File untuk LHP (Laporan Hasil Pengawasan / Pemeriksaan)
  const isLhp = 
    name.includes('lhp') ||
    name.includes('laporan hasil pengawasan') ||
    name.includes('laporan hasil pemeriksaan') ||
    name.includes('laporan-hasil') ||
    name.includes('laporan_hasil') ||
    name.includes('laporan hasil') ||
    name.includes('laporan akhir');

  // 3. Cek Nama File untuk ST (Surat Tugas / SPT)
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

  // Jika nama memuat kedua kata (misal "LHP_atas_ST_094.pdf"), prioritaskan LHP jika diawali LHP
  if (isLhp && isSt) {
    if (name.startsWith('lhp') || name.includes('laporan')) return 'LHP';
    return 'ST';
  }

  if (isLhp) return 'LHP';
  if (isSt) return 'ST';

  return 'none';
}

export async function GET() {
  try {
    const auth = getAuth();
    const drive = google.drive({ version: 'v3', auth });

    // 1. Ambil seluruh folder
    const folderRes = await drive.files.list({
      q: "mimeType = 'application/vnd.google-apps.folder' and trashed = false",
      fields: 'files(id, name, parents)',
      pageSize: 1000,
    });
    const folderList = folderRes.data.files || [];

    const folderMap: Record<string, { id: string; name: string; parents?: string[] }> = {};
    folderList.forEach((f) => {
      if (f.id && f.name) {
        folderMap[f.id] = { id: f.id, name: f.name, parents: f.parents || [] };
      }
    });

    // 2. Ambil seluruh file dokumen
    const fileRes = await drive.files.list({
      q: "trashed = false and name != 'activity_logs.json' and mimeType != 'application/vnd.google-apps.folder'",
      fields: 'files(id, name, mimeType, size, createdTime, parents, appProperties)',
      pageSize: 1000,
      orderBy: 'createdTime desc',
    });
    const rawFiles = fileRes.data.files || [];

    // 3. Kelompokkan berkas berdasarkan Folder
    const folderItemsMap: Record<
      string,
      {
        folderId: string;
        folderName: string;
        totalDocs: number;
        stFiles: any[];
        lhpFiles: any[];
        otherFiles: any[];
      }
    > = {};

    // Inisialisasi setiap folder yang ditemukan
    folderList.forEach((f) => {
      if (f.id && f.name) {
        folderItemsMap[f.id] = {
          folderId: f.id,
          folderName: f.name,
          totalDocs: 0,
          stFiles: [],
          lhpFiles: [],
          otherFiles: [],
        };
      }
    });

    // Wadah untuk berkas di Root
    const rootItems = {
      folderId: 'root',
      folderName: 'Beranda / Root',
      totalDocs: 0,
      stFiles: [] as any[],
      lhpFiles: [] as any[],
      otherFiles: [] as any[],
    };

    let totalLhpFiles = 0;
    let totalStFiles = 0;

    rawFiles.forEach((file) => {
      const parentId = file.parents && file.parents.length > 0 ? file.parents[0] : null;
      const role = classifyDocRole(file.name || '', file.appProperties?.tags);

      const fileData = {
        id: file.id || '',
        name: file.name || 'Tanpa Judul',
        mimeType: file.mimeType || '',
        size: file.size || '',
        createdTime: file.createdTime || '',
        role,
      };

      if (role === 'LHP') totalLhpFiles++;
      if (role === 'ST') totalStFiles++;

      let targetFolder = parentId && folderItemsMap[parentId] ? folderItemsMap[parentId] : rootItems;
      targetFolder.totalDocs++;

      if (role === 'LHP') {
        targetFolder.lhpFiles.push(fileData);
      } else if (role === 'ST') {
        targetFolder.stFiles.push(fileData);
      } else {
        targetFolder.otherFiles.push(fileData);
      }
    });

    // 4. Susun status checklist setiap folder
    const allFolderChecklists = Object.values(folderItemsMap)
      .concat(rootItems.totalDocs > 0 ? [rootItems] : [])
      .map((item) => {
        const hasSt = item.stFiles.length > 0;
        const hasLhp = item.lhpFiles.length > 0;

        let status: 'complete' | 'missing_st' | 'missing_lhp' | 'empty' = 'empty';
        if (hasSt && hasLhp) {
          status = 'complete';
        } else if (hasLhp && !hasSt) {
          status = 'missing_st';
        } else if (hasSt && !hasLhp) {
          status = 'missing_lhp';
        } else {
          status = 'empty';
        }

        return {
          id: item.folderId,
          name: item.folderName,
          totalDocs: item.totalDocs,
          hasSt,
          hasLhp,
          status,
          stCount: item.stFiles.length,
          lhpCount: item.lhpFiles.length,
          stFiles: item.stFiles,
          lhpFiles: item.lhpFiles,
          completenessScore: hasSt && hasLhp ? 100 : (hasSt || hasLhp ? 50 : 0),
        };
      });

    // 5. Hitung Ringkasan Eksekutif
    const completeCount = allFolderChecklists.filter((f) => f.status === 'complete').length;
    const missingStCount = allFolderChecklists.filter((f) => f.status === 'missing_st').length;
    const missingLhpCount = allFolderChecklists.filter((f) => f.status === 'missing_lhp').length;
    const emptyCount = allFolderChecklists.filter((f) => f.status === 'empty').length;

    const rate = allFolderChecklists.length > 0 
      ? Math.round((completeCount / allFolderChecklists.length) * 100) 
      : 0;

    return NextResponse.json({
      success: true,
      summary: {
        totalFolders: allFolderChecklists.length,
        completeCount,
        missingStCount,
        missingLhpCount,
        emptyCount,
        completenessRate: rate,
        totalFiles: rawFiles.length,
        totalLhpFiles,
        totalStFiles,
      },
      checklists: allFolderChecklists,
    });
  } catch (error: any) {
    console.error('DRIVE_CHECKLIST_ERROR:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Gagal memproses data checklist kelengkapan LHP & ST',
      },
      { status: 500 }
    );
  }
}
