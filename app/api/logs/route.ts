import { google } from 'googleapis';
import { NextRequest, NextResponse } from 'next/server';
import { Readable } from 'stream';

const LOG_FILE_NAME = 'activity_logs.json';

const getDriveClient = () => {
  const auth = new google.auth.GoogleAuth({
    credentials: JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON!),
    scopes: ['https://www.googleapis.com/auth/drive'],
  });
  return google.drive({ version: 'v3', auth });
};

async function findLogFile(drive: any) {
  const list = await drive.files.list({
    q: `name = '${LOG_FILE_NAME}' and trashed = false`,
    fields: 'files(id)',
    spaces: 'drive',
  });
  return list.data.files && list.data.files.length > 0 ? list.data.files[0].id! : null;
}

// GET: Ambil isi Log dari Drive
export async function GET() {
  try {
    const drive = getDriveClient();
    const fileId = await findLogFile(drive);

    if (!fileId) {
      return NextResponse.json([]);
    }

    const res = await drive.files.get(
      { fileId, alt: 'media' },
      { responseType: 'text' }
    );
    
    // Parse the response - it may come as string or object
    let logs;
    if (typeof res.data === 'string') {
      logs = JSON.parse(res.data);
    } else {
      logs = res.data;
    }
    
    return NextResponse.json(Array.isArray(logs) ? logs : []);
  } catch (error: any) {
    console.error('GET /api/logs error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST: Tambahkan Log baru ke Drive
export async function POST(req: NextRequest) {
  try {
    const drive = getDriveClient();
    const body = await req.json();
    const fileId = await findLogFile(drive);

    let logs: any[] = [];

    if (fileId) {
      try {
        const res = await drive.files.get(
          { fileId, alt: 'media' },
          { responseType: 'text' }
        );
        const parsed = typeof res.data === 'string' ? JSON.parse(res.data) : res.data;
        if (Array.isArray(parsed)) logs = parsed;
      } catch (e) {
        console.error('Error reading existing logs:', e);
        logs = [];
      }
    }

    // Tambah log baru di posisi paling atas
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'Unknown IP';
    const newEntry = {
      id: Math.random().toString(36).substr(2, 9),
      ...body,
      ip,
      timestamp: new Date().toISOString(),
    };
    
    logs = [newEntry, ...logs].slice(0, 500);

    const jsonString = JSON.stringify(logs);
    const stream = new Readable();
    stream.push(jsonString);
    stream.push(null);

    if (fileId) {
      await drive.files.update({
        fileId,
        media: { mimeType: 'application/json', body: stream },
      });
    } else {
      await drive.files.create({
        requestBody: {
          name: LOG_FILE_NAME,
          parents: [process.env.DRIVE_FOLDER_ID!],
        },
        media: { mimeType: 'application/json', body: stream },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('POST /api/logs error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}