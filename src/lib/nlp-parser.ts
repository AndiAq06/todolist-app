import { TaskPriority } from '@/types';

export interface ParsedTaskInput {
  title: string;
  dueDate: string; // YYYY-MM-DD
  startTime?: string; // HH:mm
  priority: TaskPriority;
  category?: string;
}

export function parseNaturalTaskInput(input: string): ParsedTaskInput {
  let text = input.trim();
  const now = new Date();

  let targetDate = new Date();
  let startTime: string | undefined = undefined;
  let priority: TaskPriority = 'normal';
  let category: string | undefined = undefined;

  // 1. Detect Priority
  if (/(prioritas\s+mendesak|mendesak|urgent|darurat)/i.test(text)) {
    priority = 'urgent';
    text = text.replace(/(prioritas\s+mendesak|mendesak|urgent|darurat)/gi, '');
  } else if (/(prioritas\s+tinggi|penting|high\s+priority)/i.test(text)) {
    priority = 'high';
    text = text.replace(/(prioritas\s+tinggi|penting|high\s+priority)/gi, '');
  } else if (/(prioritas\s+rendah|santai|low\s+priority)/i.test(text)) {
    priority = 'low';
    text = text.replace(/(prioritas\s+rendah|santai|low\s+priority)/gi, '');
  } else if (/(prioritas\s+normal|sedang)/i.test(text)) {
    priority = 'normal';
    text = text.replace(/(prioritas\s+normal|sedang)/gi, '');
  }

  // 2. Detect Relative Date
  if (/\blusa\b/i.test(text)) {
    targetDate.setDate(now.getDate() + 2);
    text = text.replace(/\blusa\b/gi, '');
  } else if (/\bbesok\b/i.test(text)) {
    targetDate.setDate(now.getDate() + 1);
    text = text.replace(/\bbesok\b/gi, '');
  } else if (/\bhari\s+ini\b/i.test(text)) {
    targetDate = new Date();
    text = text.replace(/\bhari\s+ini\b/gi, '');
  }

  // Detect Day Names (e.g. senin, selasa, rabu, kamis, jumat, sabtu, minggu)
  const daysMap: Record<string, number> = {
    minggu: 0,
    senin: 1,
    selasa: 2,
    rabu: 3,
    kamis: 4,
    jumat: 5,
    sabtu: 6,
  };

  const dayRegex = /\b(hari\s+)?(senin|selasa|rabu|kamis|jumat|sabtu|minggu)\b/i;
  const dayMatch = text.match(dayRegex);
  if (dayMatch) {
    const matchedDay = dayMatch[2].toLowerCase();
    const targetDayIndex = daysMap[matchedDay];
    const currentDayIndex = now.getDay();
    let diff = targetDayIndex - currentDayIndex;
    if (diff <= 0) diff += 7; // Next occurrence
    targetDate = new Date();
    targetDate.setDate(now.getDate() + diff);
    text = text.replace(dayRegex, '');
  }

  // 3. Detect Time (e.g. jam 19.00, jam 19:00, pukul 08:30, 14:00, jam 7 malam)
  const timeRegex = /(jam|pukul)?\s*(\d{1,2})[.:](\d{2})/i;
  const timeMatch = text.match(timeRegex);
  if (timeMatch) {
    const hours = parseInt(timeMatch[2], 10);
    const mins = parseInt(timeMatch[3], 10);
    if (hours >= 0 && hours < 24 && mins >= 0 && mins < 60) {
      startTime = `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
      text = text.replace(timeRegex, '');
    }
  } else {
    // Detect "jam 7 malam", "jam 2 siang", "jam 9 pagi"
    const simpleTimeRegex = /(jam|pukul)\s*(\d{1,2})\s*(pagi|siang|sore|malam)/i;
    const simpleMatch = text.match(simpleTimeRegex);
    if (simpleMatch) {
      let hours = parseInt(simpleMatch[2], 10);
      const period = simpleMatch[3].toLowerCase();
      if (period === 'malam' && hours < 12) hours += 12;
      if (period === 'sore' && hours < 12 && hours <= 6) hours += 12;
      if (period === 'siang' && hours < 12 && hours <= 4) hours += 12;
      startTime = `${String(hours).padStart(2, '0')}:00`;
      text = text.replace(simpleTimeRegex, '');
    }
  }

  // 4. Detect Category
  if (/\b(pekerjaan|kerja|kantor)\b/i.test(text)) {
    category = 'Pekerjaan';
  } else if (/\b(proyek|project)\b/i.test(text)) {
    category = 'Proyek';
  } else if (/\b(belajar|kuliah|studi|kursus)\b/i.test(text)) {
    category = 'Belajar';
  } else if (/\b(olahraga|kesehatan|gym|workout)\b/i.test(text)) {
    category = 'Kesehatan';
  } else if (/\b(keuangan|bayar|tagihan|gaji)\b/i.test(text)) {
    category = 'Keuangan';
  } else if (/\b(belanja|beli)\b/i.test(text)) {
    category = 'Belanja';
  }

  // Clean title
  let cleanTitle = text
    .replace(/\s+/g, ' ')
    .replace(/^[,.\s-]+|[,.\s-]+$/g, '')
    .trim();

  if (!cleanTitle) {
    cleanTitle = input.trim();
  }

  // Capitalize first letter
  cleanTitle = cleanTitle.charAt(0).toUpperCase() + cleanTitle.slice(1);

  const formattedDate = targetDate.toISOString().split('T')[0];

  return {
    title: cleanTitle,
    dueDate: formattedDate,
    startTime,
    priority,
    category,
  };
}
