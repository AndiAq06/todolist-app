import { NextRequest, NextResponse } from 'next/server';
import { getDatabase, saveDatabase, logActivity } from '@/lib/server-storage';
import { DailyJournal } from '@/types';


export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const date = searchParams.get('date');
    const search = searchParams.get('search')?.toLowerCase() || '';

    const db = getDatabase();
    let journals = db.journals || [];

    if (date) {
      journals = journals.filter(j => j.date === date);
    }

    if (search) {
      journals = journals.filter(j =>
        j.title.toLowerCase().includes(search) ||
        j.activitySummary.toLowerCase().includes(search) ||
        j.whatWentWell.toLowerCase().includes(search) ||
        (j.tags && j.tags.some(t => t.toLowerCase().includes(search)))
      );
    }

    // Sort by date descending
    journals.sort((a, b) => b.date.localeCompare(a.date));

    return NextResponse.json({ success: true, journals });
  } catch (error) {
    return NextResponse.json({ error: 'Gagal memuat jurnal harian' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.title || !body.title.trim()) {
      return NextResponse.json({ error: 'Judul jurnal wajib diisi' }, { status: 400 });
    }

    const db = getDatabase();
    if (!db.journals) db.journals = [];

    const existingIndex = db.journals.findIndex(j => (body.id && j.id === body.id) || j.date === body.date);

    const journalData: DailyJournal = {
      id: body.id || `journal-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      date: body.date || new Date().toISOString().split('T')[0],
      title: body.title.trim(),
      mood: body.mood || 'good',
      activitySummary: body.activitySummary || '',
      whatWentWell: body.whatWentWell || '',
      obstacles: body.obstacles || '',
      lessonsLearned: body.lessonsLearned || '',
      improvements: body.improvements || '',
      tomorrowPlan: body.tomorrowPlan || '',
      photos: Array.isArray(body.photos) ? body.photos : [],
      tags: Array.isArray(body.tags) ? body.tags : [],
      createdAt: body.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (existingIndex >= 0) {
      db.journals[existingIndex] = journalData;
      logActivity('journal_saved', 'journal', `Memperbarui Jurnal Harian: ${journalData.title}`);
    } else {
      db.journals.unshift(journalData);
      logActivity('journal_saved', 'journal', `Menulis Jurnal Harian: ${journalData.title}`);
    }

    saveDatabase(db);
    return NextResponse.json({ success: true, journal: journalData });
  } catch (error) {
    return NextResponse.json({ error: 'Gagal menyimpan jurnal harian' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID jurnal diperlukan' }, { status: 400 });
    }

    const db = getDatabase();
    db.journals = (db.journals || []).filter(j => j.id !== id);
    saveDatabase(db);

    logActivity('delete', 'journal', 'Menghapus catatan jurnal');

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Gagal menghapus jurnal' }, { status: 500 });
  }
}
