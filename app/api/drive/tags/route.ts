import { google } from 'googleapis';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

function getAuth() {
  let credentials;
  if (process.env.GOOGLE_SERVICE_ACCOUNT_JSON) {
    try {
      credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON);
    } catch (e) {
      console.error('TAGS_AUTH_ERROR: Failed to parse GOOGLE_SERVICE_ACCOUNT_JSON', e);
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

// GET: Retrieve tags for a specific file
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const fileId = searchParams.get('fileId');

    if (!fileId) {
      return NextResponse.json({ error: 'fileId is required' }, { status: 400 });
    }

    const auth = getAuth();
    const drive = google.drive({ version: 'v3', auth });

    const file = await drive.files.get({
      fileId,
      fields: 'id, appProperties',
    });

    let tags: string[] = [];
    if (file.data.appProperties?.tags) {
      try {
        tags = JSON.parse(file.data.appProperties.tags);
      } catch {
        tags = [];
      }
    }

    return NextResponse.json({ success: true, fileId, tags });
  } catch (error: any) {
    console.error('GET_TAGS_ERROR:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST: Update tags for a file
export async function POST(request: Request) {
  try {
    const role = request.headers.get('x-user-role');
    if (role !== 'admin') {
      return NextResponse.json({ error: 'Akses ditolak: Hanya Administrator yang dapat mengubah label.' }, { status: 403 });
    }
    const { fileId, tags } = await request.json();

    if (!fileId) {
      return NextResponse.json({ error: 'fileId is required' }, { status: 400 });
    }

    const auth = getAuth();
    const drive = google.drive({ version: 'v3', auth });

    // Read current appProperties so we do not overwrite activePins or other metadata
    const file = await drive.files.get({
      fileId,
      fields: 'appProperties',
    });

    const currentProperties = file.data.appProperties || {};
    const sanitizedTags = Array.isArray(tags)
      ? Array.from(new Set(tags.map((t: string) => String(t).trim()).filter(Boolean)))
      : [];

    const updatedProperties = {
      ...currentProperties,
      tags: JSON.stringify(sanitizedTags),
    };

    await drive.files.update({
      fileId,
      requestBody: {
        appProperties: updatedProperties,
      },
    });

    return NextResponse.json({
      success: true,
      fileId,
      tags: sanitizedTags,
    });
  } catch (error: any) {
    console.error('UPDATE_TAGS_ERROR:', error);
    return NextResponse.json(
      { error: error.message || 'Gagal memperbarui label' },
      { status: 500 }
    );
  }
}
