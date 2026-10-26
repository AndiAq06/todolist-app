import { NextRequest, NextResponse } from 'next/server';
import { getDatabase, saveDatabase, logActivity } from '@/lib/server-storage';
import { AppData } from '@/types';


// GET: Export entire database as JSON
export async function GET() {
  try {
    const db = getDatabase();
    return new NextResponse(JSON.stringify(db, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="todolist_backup_${new Date().toISOString().split('T')[0]}.json"`,
      },
    });
  } catch (error) {
    return NextResponse.json({ error: 'Gagal mengekspor data' }, { status: 500 });
  }
}

// POST: Import and validate JSON backup
export async function POST(req: NextRequest) {
  try {
    const importedData: AppData = await req.json();

    // Basic structure validation
    if (!importedData || !Array.isArray(importedData.tasks)) {
      return NextResponse.json(
        { error: 'Format file backup tidak valid. Harus memiliki properti tasks.' },
        { status: 400 }
      );
    }

    const db = getDatabase();
    const updatedDb: AppData = {
      profile: importedData.profile || db.profile,
      categories: importedData.categories || db.categories,
      tasks: importedData.tasks,
      habits: importedData.habits || db.habits || [],
      journals: importedData.journals || db.journals || [],
      activities: importedData.activities || db.activities || [],
      quickNotes: importedData.quickNotes || db.quickNotes || '',
    };

    saveDatabase(updatedDb);
    logActivity('update', 'task', `Berhasil memulihkan ${importedData.tasks.length} tugas dari file backup`);

    return NextResponse.json({
      success: true,
      message: `Berhasil mengimpor ${importedData.tasks.length} tugas, ${importedData.habits?.length || 0} kebiasaan, dan ${importedData.journals?.length || 0} jurnal.`,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Gagal memproses file import' }, { status: 500 });
  }
}
