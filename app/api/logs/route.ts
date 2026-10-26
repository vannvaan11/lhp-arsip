import { google } from 'googleapis';
import { NextRequest, NextResponse } from 'next/server';
import { Readable } from 'stream';
import fs from 'fs';
import path from 'path';
import os from 'os';

export const dynamic = 'force-dynamic';

const LOG_FILE_NAME = 'activity_logs.json';

// Mendapatkan path file log lokal dengan fallback
function getLocalLogFilePath(): string {
  try {
    const dataDir = path.join(process.cwd(), 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    return path.join(dataDir, LOG_FILE_NAME);
  } catch {
    return path.join(os.tmpdir(), LOG_FILE_NAME);
  }
}

// Membaca log dari penyimpanan lokal
function readLocalLogs(): any[] {
  try {
    const filePath = getLocalLogFilePath();
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (err) {
    console.error('Error reading local logs:', err);
  }

  // Coba fallback tmpdir jika gagal
  try {
    const fallbackPath = path.join(os.tmpdir(), LOG_FILE_NAME);
    if (fs.existsSync(fallbackPath)) {
      const content = fs.readFileSync(fallbackPath, 'utf8');
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {}

  return [];
}

// Menyimpan log ke penyimpanan lokal
function writeLocalLogs(logs: any[]): boolean {
  try {
    const filePath = getLocalLogFilePath();
    fs.writeFileSync(filePath, JSON.stringify(logs, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error('Error writing local logs:', err);
    try {
      const fallbackPath = path.join(os.tmpdir(), LOG_FILE_NAME);
      fs.writeFileSync(fallbackPath, JSON.stringify(logs, null, 2), 'utf8');
      return true;
    } catch (e) {
      console.error('Fallback write failed:', e);
      return false;
    }
  }
}

// Inisialisasi Google Drive Client
const getDriveClient = () => {
  if (process.env.GOOGLE_SERVICE_ACCOUNT_JSON) {
    try {
      const auth = new google.auth.GoogleAuth({
        credentials: JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON),
        scopes: ['https://www.googleapis.com/auth/drive'],
      });
      return google.drive({ version: 'v3', auth });
    } catch (e: any) {
      console.error('Google Auth JSON parse error:', e.message);
    }
  }

  if (process.env.GOOGLE_CLIENT_EMAIL && process.env.GOOGLE_PRIVATE_KEY) {
    try {
      const auth = new google.auth.GoogleAuth({
        credentials: {
          client_email: process.env.GOOGLE_CLIENT_EMAIL,
          private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        },
        scopes: ['https://www.googleapis.com/auth/drive'],
      });
      return google.drive({ version: 'v3', auth });
    } catch (e: any) {
      console.error('Google Auth Email/Key error:', e.message);
    }
  }

  return null;
};

// Mencari file log di Google Drive
async function findLogFile(drive: any) {
  try {
    const list = await drive.files.list({
      q: `name = '${LOG_FILE_NAME}' and trashed = false`,
      fields: 'files(id, name)',
      spaces: 'drive',
      supportsAllDrives: true,
      includeItemsFromAllDrives: true,
    });
    return list.data.files && list.data.files.length > 0 ? list.data.files[0].id! : null;
  } catch (err: any) {
    console.warn('findLogFile warning:', err.message);
    return null;
  }
}

// GET: Ambil daftar seluruh log
export async function GET() {
  try {
    let logs = readLocalLogs();

    // Jika log lokal kosong, coba sinkronisasi dari Google Drive jika file sudah ada di sana
    if (logs.length === 0) {
      const drive = getDriveClient();
      if (drive) {
        try {
          const fileId = await findLogFile(drive);
          if (fileId) {
            const res = await drive.files.get(
              { fileId, alt: 'media', supportsAllDrives: true },
              { responseType: 'text' }
            );
            const driveLogs = typeof res.data === 'string' ? JSON.parse(res.data) : res.data;
            if (Array.isArray(driveLogs) && driveLogs.length > 0) {
              logs = driveLogs;
              writeLocalLogs(logs);
            }
          }
        } catch (e: any) {
          console.warn('Sync from Google Drive note:', e.message);
        }
      }
    }

    return NextResponse.json(logs, {
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      },
    });
  } catch (error: any) {
    console.error('GET /api/logs error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST: Tambahkan log aktivitas baru
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const forwarded = req.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0].trim() : (req.headers.get('x-real-ip') || '127.0.0.1');

    const newEntry = {
      id: body.id || Math.random().toString(36).substring(2, 11),
      action: body.action || 'ACTIVITY',
      fileName: body.fileName || '-',
      user: body.user || 'Guest',
      device: body.device || 'PC / Desktop',
      ip,
      timestamp: body.timestamp || new Date().toISOString(),
    };

    // 1. Simpan ke penyimpanan lokal server (kecepatan instan & handal)
    let logs = readLocalLogs();
    logs = [newEntry, ...logs.filter(l => l.id !== newEntry.id)].slice(0, 1000);
    writeLocalLogs(logs);

    // 2. Sinkronkan ke Google Drive secara aman (best-effort)
    const drive = getDriveClient();
    if (drive) {
      try {
        const fileId = await findLogFile(drive);
        const jsonString = JSON.stringify(logs);
        const stream = new Readable();
        stream.push(jsonString);
        stream.push(null);

        if (fileId) {
          await drive.files.update({
            fileId,
            media: { mimeType: 'application/json', body: stream },
            supportsAllDrives: true,
          });
        } else {
          const folderId = process.env.DRIVE_FOLDER_ID || process.env.GOOGLE_DRIVE_FOLDER_ID;
          if (folderId) {
            await drive.files.create({
              requestBody: {
                name: LOG_FILE_NAME,
                parents: [folderId],
              },
              media: { mimeType: 'application/json', body: stream },
              supportsAllDrives: true,
            });
          }
        }
      } catch (driveErr: any) {
        // Catatan: Service account di folder Google Drive pribadi memiliki limit 0 quota untuk create file baru,
        // sehingga kegagalan Drive tidak boleh mematikan sistem audit log. Log tetap aman tersimpan di server.
        console.warn('Google Drive log sync warning (safe fallback used):', driveErr.message);
      }
    }

    return NextResponse.json({ success: true, entry: newEntry });
  } catch (error: any) {
    console.error('POST /api/logs error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE: Bersihkan riwayat log (Admin Only)
export async function DELETE(request: Request) {
  try {
    const role = request.headers.get('x-user-role');
    if (role !== 'admin') {
      return NextResponse.json({ error: 'Akses ditolak: Hanya Administrator yang dapat membersihkan riwayat log.' }, { status: 403 });
    }
    const emptyLogs: any[] = [];
    writeLocalLogs(emptyLogs);

    const drive = getDriveClient();
    if (drive) {
      try {
        const fileId = await findLogFile(drive);
        if (fileId) {
          const stream = new Readable();
          stream.push(JSON.stringify(emptyLogs));
          stream.push(null);

          await drive.files.update({
            fileId,
            media: { mimeType: 'application/json', body: stream },
            supportsAllDrives: true,
          });
        }
      } catch (driveErr: any) {
        console.warn('Drive clear warning:', driveErr.message);
      }
    }

    return NextResponse.json({ success: true, message: 'Riwayat aktivitas berhasil dibersihkan' });
  } catch (error: any) {
    console.error('DELETE /api/logs error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}