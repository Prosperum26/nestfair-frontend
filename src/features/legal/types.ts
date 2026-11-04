export interface LegalSection {
  /** Dùng làm neo URL và mục lục: chữ thường, số, gạch nối. */
  id: string;
  title: string;
  paragraphs?: string[];
  /** Danh sách gạch đầu dòng, hiện sau các đoạn văn. */
  items?: string[];
}

export interface LegalDoc {
  title: string;
  /** dd.mm.yyyy */
  updated: string;
  intro: string;
  sections: LegalSection[];
}

export interface TocEntry {
  id: string;
  number: number;
  title: string;
}

/** Mục lục: đánh số từ 1 theo thứ tự các mục. */
export function tocOf(doc: LegalDoc): TocEntry[] {
  return doc.sections.map((s, i) => ({ id: s.id, number: i + 1, title: s.title }));
}
