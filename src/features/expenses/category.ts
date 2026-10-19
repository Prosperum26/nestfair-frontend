import { Droplet, Gift, House, type LucideIcon, Package, ShoppingCart, Sparkles, Wifi, Zap } from 'lucide-react';
import type { Tone } from '@/components/ui/tones.ts';
import type { ExpenseCategory, SplitType } from './types.ts';

interface CategoryMeta {
  label: string;
  icon: LucideIcon;
  /** Tone icon tile (Design.md mục 3, Icon tile: điện bolt/yellow, nước droplet/sky, wifi/lil, ăn uống cart/mint, đồ dùng sparkles/neutral). */
  tone: Tone;
  /** Màu đoạn trong thanh "Theo danh mục" (chỉ token Design.md). */
  bar: string;
}

/** 8 danh mục theo đặc tả (quyết định D6 của issue #9). Thứ tự này dùng cho bộ lọc và ô chọn. */
export const CATEGORY_META: Record<ExpenseCategory, CategoryMeta> = {
  ELECTRICITY: { label: 'Điện', icon: Zap, tone: 'yellow', bar: 'bg-mai-v' },
  WATER: { label: 'Nước', icon: Droplet, tone: 'sky', bar: 'bg-sky-v' },
  INTERNET: { label: 'Internet', icon: Wifi, tone: 'lil', bar: 'bg-lil-v' },
  RENT: { label: 'Tiền nhà', icon: House, tone: 'neutral', bar: 'bg-ink-2' },
  FOOD: { label: 'Ăn uống', icon: ShoppingCart, tone: 'mint', bar: 'bg-mint-v' },
  SUPPLIES: { label: 'Đồ dùng', icon: Sparkles, tone: 'neutral', bar: 'bg-ink-3' },
  GIFT: { label: 'Quà cảm ơn', icon: Gift, tone: 'tom', bar: 'bg-tom-v' },
  OTHER: { label: 'Khác', icon: Package, tone: 'neutral', bar: 'bg-line-2' },
};

export const CATEGORIES = Object.keys(CATEGORY_META) as ExpenseCategory[];

/** Danh mục người dùng tự chọn khi ghi khoản chi (GIFT do luồng đổi ca tạo). */
export const SELECTABLE_CATEGORIES = CATEGORIES.filter((c) => c !== 'GIFT');

export const SPLIT_META: Record<SplitType, { label: string; tone: Tone }> = {
  EQUAL: { label: 'Chia đều', tone: 'neutral' },
  CUSTOM: { label: 'Chọn người', tone: 'sky' },
  EXACT: { label: 'Chính xác', tone: 'lil' },
  ITEMIZED: { label: 'Theo món', tone: 'yellow' },
};

/**
 * Tỉ lệ từng đoạn của thanh "Theo danh mục" (%), bỏ danh mục 0đ. Đoạn nhỏ vẫn có tối thiểu 2% để nhìn thấy,
 * phần bù lấy từ đoạn lớn nhất nên tổng luôn 100.
 */
export function categoryBarSegments(items: { category: ExpenseCategory; amount: number }[]): { category: ExpenseCategory; percent: number }[] {
  const shown = items.filter((i) => i.amount > 0);
  const total = shown.reduce((s, i) => s + i.amount, 0);
  if (total === 0) return [];
  const MIN = 2;
  const segments = shown.map((i) => ({ category: i.category, percent: Math.max(MIN, (i.amount / total) * 100) }));
  const overflow = segments.reduce((s, x) => s + x.percent, 0) - 100;
  const largest = segments.reduce((a, b) => (b.percent > a.percent ? b : a));
  largest.percent -= overflow;
  return segments;
}
