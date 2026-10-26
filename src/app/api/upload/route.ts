import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { Attachment } from '@/types';


export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const files = formData.getAll('files') as File[];
    const caption = (formData.get('caption') as string) || '';

    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'Tidak ada file yang diunggah' }, { status: 400 });
    }

    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const uploadedAttachments: Attachment[] = [];

    for (const file of files) {
      // Validate file size (max 15MB)
      if (file.size > 15 * 1024 * 1024) {
        return NextResponse.json(
          { error: `File ${file.name} melebihi batas ukuran 15MB.` },
          { status: 400 }
        );
      }

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const ext = path.extname(file.name) || '.bin';
      const cleanBase = path.basename(file.name, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
      const uniqueName = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}_${cleanBase}${ext}`;
      const filePath = path.join(uploadsDir, uniqueName);

      fs.writeFileSync(filePath, buffer);

      const isImage = file.type.startsWith('image/');

      const attachment: Attachment = {
        id: `att-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        fileName: uniqueName,
        originalName: file.name,
        fileType: isImage ? 'image' : 'document',
        mimeType: file.type || 'application/octet-stream',
        fileSize: file.size,
        url: `/uploads/${uniqueName}`,
        caption: caption || undefined,
        uploadedAt: new Date().toISOString(),
      };

      uploadedAttachments.push(attachment);
    }

    return NextResponse.json({
      success: true,
      attachments: uploadedAttachments,
    });
  } catch (error) {
    console.error('Upload handler error:', error);
    return NextResponse.json(
      { error: 'Gagal mengunggah file. Silakan coba lagi.' },
      { status: 500 }
    );
  }
}
