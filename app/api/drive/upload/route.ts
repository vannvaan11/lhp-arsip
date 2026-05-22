import { google } from 'googleapis';
import { NextRequest, NextResponse } from 'next/server';
import { Readable } from 'stream';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const parentId = formData.get('parentId') as string;

    if (!file) {
      return NextResponse.json({ error: "File tidak ditemukan" }, { status: 400 });
    }

    // 1. Inisialisasi Auth di dalam fungsi untuk memastikan ENV terbaru terbaca
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        // Penting: Memastikan karakter \n terproses dengan benar
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/drive'],
    });

    const drive = google.drive({ version: 'v3', auth });

    // 2. Konversi File ke Buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // 3. Konversi Buffer ke Readable Stream (Metode paling aman untuk Vercel)
    const stream = new Readable();
    stream.push(buffer);
    stream.push(null);

    // 4. Tentukan Folder Tujuan (Gunakan default jika parentId kosong)
    const targetFolder = (parentId && parentId !== 'undefined' && parentId !== '') 
      ? parentId 
      : process.env.GOOGLE_DRIVE_FOLDER_ID;

    // 5. Eksekusi Upload ke Google Drive
    const response = await drive.files.create({
      requestBody: {
        name: file.name,
        parents: targetFolder ? [targetFolder] : [],
      },
      media: {
        mimeType: file.type,
        body: stream,
      },
      fields: 'id, name',
    });

    return NextResponse.json({ 
      success: true, 
      id: response.data.id, 
      name: response.data.name 
    });

  } catch (error: any) {
    console.error("DRIVE_UPLOAD_ERROR:", error);
    return NextResponse.json({ 
      error: "Upload Gagal", 
      details: error.message 
    }, { status: 500 });
  }
}