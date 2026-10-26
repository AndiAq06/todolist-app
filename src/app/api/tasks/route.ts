import { NextRequest, NextResponse } from 'next/server';
import { getDatabase, saveDatabase, logActivity } from '@/lib/server-storage';
import { Task } from '@/types';


export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search')?.toLowerCase() || '';
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');
    const category = searchParams.get('category');
    const date = searchParams.get('date');
    const isFocus = searchParams.get('isFocus');
    const isArchived = searchParams.get('isArchived') === 'true';
    const isDeleted = searchParams.get('isDeleted') === 'true';
    const sortBy = searchParams.get('sortBy') || 'dueDate'; // dueDate, priority, createdAt, title

    const db = getDatabase();
    let tasks = db.tasks || [];

    // Filter by deletion/archive state
    tasks = tasks.filter(t => (t.isDeleted || false) === isDeleted && (t.isArchived || false) === isArchived);

    // Filter by search
    if (search) {
      tasks = tasks.filter(t =>
        t.title.toLowerCase().includes(search) ||
        t.description.toLowerCase().includes(search) ||
        (t.tags && t.tags.some(tag => tag.toLowerCase().includes(search))) ||
        (t.category && t.category.toLowerCase().includes(search))
      );
    }

    // Filter by status
    if (status && status !== 'all') {
      tasks = tasks.filter(t => t.status === status);
    }

    // Filter by priority
    if (priority && priority !== 'all') {
      tasks = tasks.filter(t => t.priority === priority);
    }

    // Filter by category
    if (category && category !== 'all') {
      tasks = tasks.filter(t => t.category === category);
    }

    // Filter by date
    if (date) {
      tasks = tasks.filter(t => t.dueDate === date);
    }

    // Filter by Focus
    if (isFocus === 'true') {
      tasks = tasks.filter(t => t.isFocus);
    }

    // Sort
    tasks.sort((a, b) => {
      if (sortBy === 'priority') {
        const pOrder: Record<string, number> = { urgent: 4, high: 3, normal: 2, low: 1 };
        return (pOrder[b.priority] || 0) - (pOrder[a.priority] || 0);
      }
      if (sortBy === 'createdAt') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      if (sortBy === 'title') {
        return a.title.localeCompare(b.title);
      }
      // default: dueDate + startTime
      const dateA = a.dueDate + (a.startTime || '00:00');
      const dateB = b.dueDate + (b.startTime || '00:00');
      return dateA.localeCompare(dateB);
    });

    return NextResponse.json({ success: true, tasks });
  } catch (error) {
    console.error('Failed to get tasks:', error);
    return NextResponse.json({ error: 'Gagal mengambil data tugas' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.title || !body.title.trim()) {
      return NextResponse.json({ error: 'Judul tugas wajib diisi' }, { status: 400 });
    }

    const db = getDatabase();

    const newTask: Task = {
      id: `task-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      title: body.title.trim(),
      description: body.description?.trim() || '',
      status: body.status || 'todo',
      priority: body.priority || 'normal',
      category: body.category || 'Pekerjaan',
      tags: Array.isArray(body.tags) ? body.tags : [],
      dueDate: body.dueDate || new Date().toISOString().split('T')[0],
      startTime: body.startTime || undefined,
      endTime: body.endTime || undefined,
      estimatedDuration: body.estimatedDuration ? Number(body.estimatedDuration) : undefined,
      actualDuration: 0,
      isFocus: Boolean(body.isFocus),
      isArchived: false,
      isDeleted: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      checklists: Array.isArray(body.checklists) ? body.checklists : [],
      attachments: Array.isArray(body.attachments) ? body.attachments : [],
      progressLogs: [],
      reminderTime: body.reminderTime || undefined,
    };

    // If marked as focus, enforce max 3 focus tasks
    if (newTask.isFocus) {
      const activeFocus = db.tasks.filter(t => t.isFocus && !t.isDeleted && !t.isArchived && t.status !== 'completed');
      if (activeFocus.length >= 3) {
        // Unset oldest focus
        activeFocus[0].isFocus = false;
      }
    }

    db.tasks = [newTask, ...(db.tasks || [])];
    saveDatabase(db);

    logActivity('create', 'task', `Menambahkan tugas baru: ${newTask.title}`);

    return NextResponse.json({ success: true, task: newTask });
  } catch (error) {
    console.error('Failed to create task:', error);
    return NextResponse.json({ error: 'Gagal membuat tugas baru' }, { status: 500 });
  }
}
