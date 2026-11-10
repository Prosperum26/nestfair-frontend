import { ArrowLeftRight, Megaphone, ScanLine, Sparkles } from 'lucide-react';
import type { ReactNode } from 'react';
import { Chip } from '@/components/ui/Chip.tsx';
import { IconTile } from '@/components/ui/IconTile.tsx';
import { InView, InViewItem } from '@/components/ui/Reveal.tsx';
import type { Tone } from '@/components/ui/tones.ts';
import { SectionHeading } from './SectionHeading.tsx';

interface Feature {
  icon: ReactNode;
  tone: Tone;
  title: string;
  text: string;
  soon?: boolean;
}

const FEATURES: Feature[] = [
  {
    icon: <ArrowLeftRight />,
    tone: 'lil',
    title: 'Đổi ca và Chợ ca',
    text: 'Bận thì đổi ca hoặc nhờ trực dùm. Chưa ai nhận thì đăng lên Chợ ca, kèm quà cảm ơn nếu bạn muốn.',
  },
  {
    icon: <ScanLine />,
    tone: 'sky',
    title: 'Quét hóa đơn',
    text: 'Chụp hóa đơn, Gemini đọc từng món thành bản nháp. Bạn xem lại và xác nhận rồi mới lưu.',
  },
  {
    icon: <Sparkles />,
    tone: 'yellow',
    title: 'Trợ lý AI phòng trọ',
    text: 'Hỏi chuyện sinh hoạt, xử lý sự cố, tạo nhắc nhở. Trò chuyện riêng tư, AI chỉ gợi ý và không tự ghi dữ liệu.',
  },
  {
    icon: <Megaphone />,
    tone: 'mint',
    title: 'Tìm người ở ghép',
    text: 'Đăng tin tuyển bạn ở ghép, có trang công khai và poster kèm mã QR để chia sẻ.',
    soon: true,
  },
];

/** Hàng "Còn nhiều hơn thế": các tính năng ngoài ba chuyện chính. Tìm người ở ghép gắn nhãn Sắp ra mắt. */
export function MoreFeatures() {
  return (
    <section aria-labelledby="more-title" className="mx-auto max-w-page px-4 pb-20 lg:px-6 lg:pb-24 xl:px-0">
      <SectionHeading id="more-title" overline="Còn nhiều hơn thế" title="Mọi thứ nhà trọ cần, gói gọn trong một sổ." />
      <InView as="ul" stagger className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {FEATURES.map((f) => (
          <InViewItem as="li" key={f.title} className="nf-lift flex flex-col rounded-card border border-line bg-surface p-5">
            <div className="flex items-start justify-between gap-2">
              <IconTile icon={f.icon} tone={f.tone} size={40} />
              {f.soon && <Chip size="sm">Sắp ra mắt</Chip>}
            </div>
            <h3 className="mt-4 text-h4 text-ink">{f.title}</h3>
            <p className="mt-1.5 text-sm text-ink-2">{f.text}</p>
          </InViewItem>
        ))}
      </InView>
    </section>
  );
}
