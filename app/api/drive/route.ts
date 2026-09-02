import { google } from 'googleapis';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const folderId = searchParams.get('folderId') || process.env.DRIVE_FOLDER_ID;
  const search = searchParams.get('search');

  try {
    const auth = new google.auth.GoogleAuth({
      credentials: JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON!),
      scopes: ['https://www.googleapis.com/auth/drive'],
    });
    const drive = google.drive({ version: 'v3', auth });

    // 1. Ambil daftar file & folder (Pencarian Standar)
    let query = `'${folderId}' in parents and trashed = false`;
    if (search) {
      // Dikembalikan ke pencarian berdasarkan nama saja sesuai permintaan
      query = `name contains '${search}' and trashed = false`;
    }

    const list = await drive.files.list({
      q: query,
      fields: 'files(id, name, mimeType, size, createdTime, hasThumbnail, thumbnailLink)',
      orderBy: 'folder, name',
    });

    // 2. Hitung Statistik Eksekutif (hanya mengambil metadata, bukan isinya)
    const stats = await drive.files.list({
      q: "mimeType != 'application/vnd.google-apps.folder' and trashed = false",
      fields: 'files(id, mimeType, createdTime)',
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

// Fitur Rename
export async function PATCH(request: Request) {
  try {
    const { fileId, newName } = await request.json();
    const auth = new google.auth.GoogleAuth({
      credentials: JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON!),
      scopes: ['https://www.googleapis.com/auth/drive'],
    });
    const drive = google.drive({ version: 'v3', auth });

    await drive.files.update({
      fileId: fileId,
      requestBody: { name: newName }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}