import { google } from 'googleapis';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

function getAuth() {
  let credentials;
  if (process.env.GOOGLE_SERVICE_ACCOUNT_JSON) {
    try {
      credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON);
    } catch (e) {
      console.error('DRIVE_AUTH_ERROR: Failed to parse GOOGLE_SERVICE_ACCOUNT_JSON', e);
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
    scopes: ['https://www.googleapis.com/auth/drive'],
  });
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const folderId = searchParams.get('folderId') || process.env.DRIVE_FOLDER_ID || process.env.GOOGLE_DRIVE_FOLDER_ID;
  const search = searchParams.get('search');

  try {
    const auth = getAuth();
    const drive = google.drive({ version: 'v3', auth });

    // 1. Ambil daftar file & folder (Pencarian Standar, kecualikan activity_logs.json)
    let query = `'${folderId}' in parents and trashed = false and name != 'activity_logs.json'`;
    if (search) {
      // Dikembalikan ke pencarian berdasarkan nama saja sesuai permintaan
      query = `name contains '${search}' and trashed = false and name != 'activity_logs.json'`;
    }

    const list = await drive.files.list({
      q: query,
      fields: 'files(id, name, mimeType, size, createdTime, hasThumbnail, thumbnailLink, appProperties, capabilities)',
      orderBy: 'folder, name',
      supportsAllDrives: true,
      includeItemsFromAllDrives: true,
    });

    // 2. Hitung Statistik Eksekutif (hanya mengambil metadata, bukan isinya)
    const stats = await drive.files.list({
      q: "mimeType != 'application/vnd.google-apps.folder' and trashed = false and name != 'activity_logs.json'",
      fields: 'files(id, mimeType, createdTime)',
      supportsAllDrives: true,
      includeItemsFromAllDrives: true,
    });

    // --- REKAPITULASI ANALITIK ---
    const allFiles = stats.data.files || [];
    
    // a. Tipe Dokumen (Pie Chart)
    let typeCount = { pdf: 0, word: 0, excel: 0, image: 0, other: 0 };
    
    // b. Tren Unggah Per Bulan (Bar Chart) - 6 bulan terakhir
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agt", "Sep", "Okt", "Nov", "Des"];
    let monthlyUploads: Record<string, number> = {};

    allFiles.forEach(f => {
      // Rekap Tipe
      if (f.mimeType?.includes('pdf')) typeCount.pdf++;
      else if (f.mimeType?.includes('word')) typeCount.word++;
      else if (f.mimeType?.includes('excel') || f.mimeType?.includes('spreadsheet')) typeCount.excel++;
      else if (f.mimeType?.includes('image')) typeCount.image++;
      else typeCount.other++;

      // Rekap Tren Waktu
      if (f.createdTime) {
        const date = new Date(f.createdTime);
        const monthKey = `${monthNames[date.getMonth()]} ${date.getFullYear().toString().slice(2)}`; // misal: "Jul 25"
        monthlyUploads[monthKey] = (monthlyUploads[monthKey] || 0) + 1;
      }
    });

    // Format data untuk Recharts
    const typeData = [
      { name: 'PDF', value: typeCount.pdf, color: '#ef4444' }, // Red
      { name: 'Word', value: typeCount.word, color: '#3b82f6' }, // Blue
      { name: 'Excel', value: typeCount.excel, color: '#10b981' }, // Green
      { name: 'Gambar', value: typeCount.image, color: '#f59e0b' }, // Amber
      { name: 'Lainnya', value: typeCount.other, color: '#64748b' } // Slate
    ].filter(d => d.value > 0);

    const trendData = Object.entries(monthlyUploads)
      .map(([month, count]) => ({ month, total: count }))
      .slice(-6); // Ambil 6 bulan terakhir

    return NextResponse.json({
      files: list.data.files || [],
      totalDocs: allFiles.length,
      analytics: {
        types: typeData,
        trends: trendData
      }
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Fitur Rename (Ganti Nama)
export async function PATCH(request: Request) {
  try {
    const role = request.headers.get('x-user-role');
    if (role !== 'admin') {
      return NextResponse.json({ error: 'Akses ditolak: Hanya Administrator yang dapat mengubah nama berkas.' }, { status: 403 });
    }
    const { fileId, newName } = await request.json();
    if (!fileId || !newName || !newName.trim()) {
      return NextResponse.json({ error: 'fileId dan newName wajib diisi' }, { status: 400 });
    }

    // 1. Cek Google Apps Script Bridge jika ada
    if (process.env.GOOGLE_APPS_SCRIPT_URL) {
      try {
        const gasRes = await fetch(process.env.GOOGLE_APPS_SCRIPT_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'rename', fileId, newName: newName.trim() }),
        });
        const gasData = await gasRes.json();
        if (gasData.success) {
          return NextResponse.json({ success: true, name: newName.trim() });
        }
      } catch (gasErr: any) {
        console.warn('GAS rename fallback to Drive API:', gasErr.message);
      }
    }

    // 2. Gunakan Google Drive API
    const auth = getAuth();
    const drive = google.drive({ version: 'v3', auth });

    const updateRes = await drive.files.update({
      fileId: fileId,
      requestBody: { name: newName.trim() },
      supportsAllDrives: true,
      fields: 'id, name',
    });

    return NextResponse.json({ success: true, name: updateRes.data.name });
  } catch (error: any) {
    console.error('RENAME_ERROR:', error);
    return NextResponse.json({ error: error.message || 'Gagal mengubah nama berkas' }, { status: 500 });
  }
}

// Fitur Delete (Hapus Berkas)
export async function DELETE(request: Request) {
  try {
    const role = request.headers.get('x-user-role');
    if (role !== 'admin') {
      return NextResponse.json({ error: 'Akses ditolak: Hanya Administrator yang dapat menghapus berkas.' }, { status: 403 });
    }
    const { searchParams } = new URL(request.url);
    const fileId = searchParams.get('fileId');

    if (!fileId) {
      return NextResponse.json({ error: 'fileId wajib disertakan' }, { status: 400 });
    }

    // 1. Cek Google Apps Script Bridge jika ada (dapat memindahkan file pemilik langsung ke Trash)
    if (process.env.GOOGLE_APPS_SCRIPT_URL) {
      try {
        const gasRes = await fetch(process.env.GOOGLE_APPS_SCRIPT_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'delete', fileId }),
        });
        const gasData = await gasRes.json();
        if (gasData.success) {
          return NextResponse.json({ success: true, message: 'Berkas berhasil dihapus' });
        }
      } catch (gasErr: any) {
        console.warn('GAS delete fallback to Drive API:', gasErr.message);
      }
    }

    // 2. Gunakan Google Drive API
    const auth = getAuth();
    const drive = google.drive({ version: 'v3', auth });

    // Dapatkan metadata file untuk membaca perizinan dan parent folder
    let fileMeta: any = null;
    try {
      const resMeta = await drive.files.get({
        fileId,
        fields: 'id, name, capabilities, parents',
        supportsAllDrives: true,
      });
      fileMeta = resMeta.data;
    } catch (getErr: any) {
      if (getErr.code === 404) {
        return NextResponse.json({ success: true, message: 'Berkas sudah tidak ada di Drive' });
      }
      throw getErr;
    }

    const canDelete = fileMeta?.capabilities?.canDelete;
    const canTrash = fileMeta?.capabilities?.canTrash;
    const canRemoveParent = fileMeta?.capabilities?.canRemoveMyDriveParent;

    // A. Hapus permanen jika didukung (file buatan service account atau Shared Drive)
    if (canDelete) {
      await drive.files.delete({
        fileId,
        supportsAllDrives: true,
      });
      return NextResponse.json({ success: true, message: 'Berkas berhasil dihapus secara permanen' });
    }

    // B. Pindahkan ke sampah jika diizinkan
    if (canTrash) {
      await drive.files.update({
        fileId,
        requestBody: { trashed: true },
        supportsAllDrives: true,
      });
      return NextResponse.json({ success: true, message: 'Berkas berhasil dipindahkan ke sampah' });
    }

    // C. Jika file milik akun lain di folder shared, unparent / lepas file dari folder arsip
    if (canRemoveParent && fileMeta?.parents && fileMeta.parents.length > 0) {
      const parentIds = fileMeta.parents.join(',');
      await drive.files.update({
        fileId,
        removeParents: parentIds,
        supportsAllDrives: true,
      });
      return NextResponse.json({ success: true, message: 'Berkas berhasil dihapus dari arsip' });
    }

    // D. Fallback eksekusi langsung
    try {
      await drive.files.delete({
        fileId,
        supportsAllDrives: true,
      });
      return NextResponse.json({ success: true, message: 'Berkas berhasil dihapus' });
    } catch (finalDelErr: any) {
      try {
        await drive.files.update({
          fileId,
          requestBody: { trashed: true },
          supportsAllDrives: true,
        });
        return NextResponse.json({ success: true, message: 'Berkas berhasil dipindahkan ke sampah' });
      } catch (trashErr: any) {
        throw new Error(
          finalDelErr.message || 'Izin Google Drive tidak mencukupi untuk menghapus berkas ini.'
        );
      }
    }
  } catch (error: any) {
    console.error('DELETE_DRIVE_ERROR:', error);
    return NextResponse.json(
      { error: error.message || 'Gagal menghapus berkas' },
      { status: 500 }
    );
  }
}