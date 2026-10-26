import { NextRequest, NextResponse } from 'next/server';
import { getDatabase, saveDatabase } from '@/lib/server-storage';
import { Category } from '@/types';


export async function GET() {
  try {
    const db = getDatabase();
    return NextResponse.json({ success: true, categories: db.categories || [] });
  } catch (error) {
    return NextResponse.json({ error: 'Gagal memuat kategori' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { name, color, icon } = await req.json();
    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'Nama kategori wajib diisi' }, { status: 400 });
    }

    const db = getDatabase();
    const newCat: Category = {
      id: `cat-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: name.trim(),
      color: color || '#10B981',
      icon: icon || 'Tag',
      isCustom: true,
    };

    db.categories = [...(db.categories || []), newCat];
    saveDatabase(db);

    return NextResponse.json({ success: true, category: newCat });
  } catch (error) {
    return NextResponse.json({ error: 'Gagal menambah kategori' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID kategori wajib diisi' }, { status: 400 });
    }

    const db = getDatabase();
    const cat = db.categories.find(c => c.id === id);

    // Reassign tasks using this category to "Lainnya"
    if (cat) {
      db.tasks.forEach(t => {
        if (t.category === cat.name) {
          t.category = 'Lainnya';
        }
      });
    }

    db.categories = (db.categories || []).filter(c => c.id !== id);
    saveDatabase(db);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Gagal menghapus kategori' }, { status: 500 });
  }
}
