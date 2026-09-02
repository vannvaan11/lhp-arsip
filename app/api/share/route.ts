import { google } from 'googleapis';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

function getAuth() {
  return new google.auth.GoogleAuth({
    credentials: JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON!),
    scopes: ['https://www.googleapis.com/auth/drive'],
  });
}

// POST - Generate PIN for a file
export async function POST(request: Request) {
  try {
    const { fileId } = await request.json();
    if (!fileId) return NextResponse.json({ error: 'fileId is required' }, { status: 400 });

    const auth = getAuth();
    const drive = google.drive({ version: 'v3', auth });

    // Generate random 6-digit PIN
    const pin = Math.floor(100000 + Math.random() * 900000).toString();

    // Read existing pins from appProperties
    const file = await drive.files.get({ fileId, fields: 'appProperties' });
    const existingPins: string[] = file.data.appProperties?.activePins 
      ? JSON.parse(file.data.appProperties.activePins) 
      : [];

    // Add new pin
    existingPins.push(pin);

    // Save pins back to file appProperties
    await drive.files.update({
      fileId,
      requestBody: {
        appProperties: {
          activePins: JSON.stringify(existingPins)
        }
      }
    });

    return NextResponse.json({ pin, fileId });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT - Verify & Consume PIN (one-time use)
export async function PUT(request: Request) {
  try {
    const { fileId, pin } = await request.json();
    if (!fileId || !pin) return NextResponse.json({ error: 'fileId and pin are required' }, { status: 400 });

    const auth = getAuth();
    const drive = google.drive({ version: 'v3', auth });

    // Read existing pins
    const file = await drive.files.get({ fileId, fields: 'appProperties' });
    const activePins: string[] = file.data.appProperties?.activePins 
      ? JSON.parse(file.data.appProperties.activePins) 
      : [];

    // Check if PIN exists
    const pinIndex = activePins.indexOf(pin);
    if (pinIndex === -1) {
      return NextResponse.json({ valid: false, error: 'PIN tidak valid atau sudah digunakan.' }, { status: 403 });
    }

    // Remove the PIN (consume it - one-time use)
    activePins.splice(pinIndex, 1);

    // Save updated pins back
    await drive.files.update({
      fileId,
      requestBody: {
        appProperties: {
          activePins: JSON.stringify(activePins)
        }
      }
    });

    return NextResponse.json({ valid: true, fileId });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
