import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const SETTINGS_FILE = path.join(process.cwd(), '.settings.json');

function getStoredRate() {
  try {
    if (fs.existsSync(SETTINGS_FILE)) {
      const data = JSON.parse(fs.readFileSync(SETTINGS_FILE, 'utf8'));
      if (data.defaultRate) return String(data.defaultRate);
    }
  } catch (_) {}
  return process.env.NEXT_PUBLIC_DEFAULT_RATE || '11.00';
}

function setStoredRate(rate) {
  try {
    const data = { defaultRate: String(rate), updatedAt: new Date().toISOString() };
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error('Failed to save settings:', err);
  }
}

export async function GET() {
  const rate = getStoredRate();
  return NextResponse.json({ defaultRate: rate });
}

export async function POST(request) {
  try {
    const body = await request.json();
    const rate = parseFloat(body.defaultRate);

    if (isNaN(rate) || rate < 0) {
      return NextResponse.json({ error: 'Valid rate per unit is required' }, { status: 400 });
    }

    const formattedRate = rate.toFixed(2);
    setStoredRate(formattedRate);

    return NextResponse.json({ success: true, defaultRate: formattedRate });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
