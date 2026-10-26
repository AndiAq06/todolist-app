import { NextRequest, NextResponse } from 'next/server';
import { getDatabase, saveDatabase, logActivity } from '@/lib/server-storage';
import { ProgressLog } from '@/types';


export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    if (!body.content || !body.content.trim()) {
      return NextResponse.json({ error: 'Catatan progres tidak boleh kosong' }, { status: 400 });
    }

    const db = getDatabase();
    const taskIndex = db.tasks.findIndex(t => t.id === id);

    if (taskIndex === -1) {
      return NextResponse.json({ error: 'Tugas tidak ditemukan' }, { status: 404 });
    }

    const newLog: ProgressLog = {
      id: `prog-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
      content: body.content.trim(),
      photos: Array.isArray(body.photos) ? body.photos : [],
    };

    const task = db.tasks[taskIndex];
    task.progressLogs = [newLog, ...(task.progressLogs || [])];
    task.updatedAt = new Date().toISOString();

    // If photos attached to progress, also add to task attachments if not already present
    if (newLog.photos && newLog.photos.length > 0) {
      const existingIds = new Set(task.attachments.map(a => a.id));
      for (const p of newLog.photos) {
        if (!existingIds.has(p.id)) {
          task.attachments.push(p);
        }
      }
    }

    saveDatabase(db);
    logActivity('update', 'task', `Menambahkan jurnal progres pada tugas: ${task.title}`);

    return NextResponse.json({ success: true, progressLog: newLog, task });
  } catch (error) {
    return NextResponse.json({ error: 'Gagal menambahkan log progres' }, { status: 500 });
  }
}
