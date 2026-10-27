import { NextRequest, NextResponse } from 'next/server';
import { getSyncedDatabase, saveAndSyncDatabase, logActivity } from '@/lib/server-storage';


export async function POST(req: NextRequest) {
  try {
    const db = await getSyncedDatabase();
    const { action, taskIds, category } = await req.json();

    if (!Array.isArray(taskIds) || taskIds.length === 0) {
      return NextResponse.json({ error: 'Daftar ID tugas tidak valid' }, { status: 400 });
    }
    const idSet = new Set(taskIds);

    let affectedCount = 0;

    if (action === 'complete') {
      db.tasks.forEach(t => {
        if (idSet.has(t.id)) {
          t.status = 'completed';
          t.completedAt = new Date().toISOString();
          t.updatedAt = new Date().toISOString();
          affectedCount++;
        }
      });
      logActivity('complete', 'task', `Menyelesaikan ${affectedCount} tugas secara massal`);
    } else if (action === 'delete') {
      db.tasks.forEach(t => {
        if (idSet.has(t.id)) {
          t.isDeleted = true;
          t.deletedAt = new Date().toISOString();
          t.updatedAt = new Date().toISOString();
          affectedCount++;
        }
      });
      logActivity('delete', 'task', `Memindahkan ${affectedCount} tugas ke tempat sampah`);
    } else if (action === 'restore') {
      db.tasks.forEach(t => {
        if (idSet.has(t.id)) {
          t.isDeleted = false;
          t.deletedAt = undefined;
          t.updatedAt = new Date().toISOString();
          affectedCount++;
        }
      });
      logActivity('update', 'task', `Memulihkan ${affectedCount} tugas dari tempat sampah`);
    } else if (action === 'archive') {
      db.tasks.forEach(t => {
        if (idSet.has(t.id)) {
          t.isArchived = true;
          t.updatedAt = new Date().toISOString();
          affectedCount++;
        }
      });
      logActivity('archive', 'task', `Mengarsipkan ${affectedCount} tugas`);
    } else if (action === 'change_category' && category) {
      db.tasks.forEach(t => {
        if (idSet.has(t.id)) {
          t.category = category;
          t.updatedAt = new Date().toISOString();
          affectedCount++;
        }
      });
    }

    await saveAndSyncDatabase(db);
    return NextResponse.json({ success: true, count: affectedCount });
  } catch (error) {
    return NextResponse.json({ error: 'Gagal memproses aksi massal' }, { status: 500 });
  }
}
