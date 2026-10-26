import { NextRequest, NextResponse } from 'next/server';
import { getDatabase, saveDatabase, logActivity } from '@/lib/server-storage';
import { Task } from '@/types';


export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = getDatabase();
    const task = db.tasks.find(t => t.id === id);

    if (!task) {
      return NextResponse.json({ error: 'Tugas tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json({ success: true, task });
  } catch (error) {
    return NextResponse.json({ error: 'Gagal mengambil detail tugas' }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const db = getDatabase();
    const taskIndex = db.tasks.findIndex(t => t.id === id);

    if (taskIndex === -1) {
      return NextResponse.json({ error: 'Tugas tidak ditemukan' }, { status: 404 });
    }

    const currentTask = db.tasks[taskIndex];
    const previousStatus = currentTask.status;

    // Build updated task
    const updatedTask: Task = {
      ...currentTask,
      ...body,
      id: currentTask.id, // Preserve ID
      updatedAt: new Date().toISOString(),
    };

    // If status changed to completed, set completedAt
    if (updatedTask.status === 'completed' && previousStatus !== 'completed') {
      updatedTask.completedAt = new Date().toISOString();
      logActivity('complete', 'task', `Menyelesaikan tugas: ${updatedTask.title}`);
    } else if (updatedTask.status !== 'completed') {
      updatedTask.completedAt = undefined;
    }

    db.tasks[taskIndex] = updatedTask;
    saveDatabase(db);

    return NextResponse.json({ success: true, task: updatedTask });
  } catch (error) {
    console.error('Failed to update task:', error);
    return NextResponse.json({ error: 'Gagal memperbarui tugas' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const permanent = searchParams.get('permanent') === 'true';

    const db = getDatabase();
    const taskIndex = db.tasks.findIndex(t => t.id === id);

    if (taskIndex === -1) {
      return NextResponse.json({ error: 'Tugas tidak ditemukan' }, { status: 404 });
    }

    const taskTitle = db.tasks[taskIndex].title;

    if (permanent) {
      db.tasks.splice(taskIndex, 1);
      logActivity('delete', 'task', `Menghapus permanen tugas: ${taskTitle}`);
    } else {
      // Soft delete (Move to Trash)
      db.tasks[taskIndex].isDeleted = true;
      db.tasks[taskIndex].deletedAt = new Date().toISOString();
      logActivity('delete', 'task', `Memindahkan tugas ke Tempat Sampah: ${taskTitle}`);
    }

    saveDatabase(db);
    return NextResponse.json({ success: true, message: 'Tugas berhasil diproses' });
  } catch (error) {
    return NextResponse.json({ error: 'Gagal menghapus tugas' }, { status: 500 });
  }
}
