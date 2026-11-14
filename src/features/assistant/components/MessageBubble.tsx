import { Sparkles } from 'lucide-react';
import type { ReactNode } from 'react';
import ReactMarkdown from 'react-markdown';
import { cn } from '@/lib/cn.ts';
import { vnTime } from '@/features/reminders/format.ts';
import type { AssistantMessageDto } from '../types.ts';
import { categoryLabel } from '../thread.ts';

/**
 * Markdown của tin trợ lý: KHÔNG bật raw HTML (không rehype-raw) — Gemini chỉ trả văn bản
 * thường / markdown, thẻ HTML trong câu trả lời hiển thị nguyên văn chứ không bao giờ render.
 * Kiểu chữ theo Design.md: đoạn văn cách nhau, danh sách đánh số / gạch đầu dòng gọn.
 */
function MarkdownContent({ content }: { content: string }) {
  return (
    <div
      className={cn(
        'space-y-2 text-b text-ink',
        '[&_ol]:list-decimal [&_ol]:pl-5 [&_p]:m-0 [&_strong]:font-semibold',
        '[&_ul]:list-disc [&_ul]:pl-5 [&_li]:mt-1',
        '[&_code]:rounded-chip [&_code]:bg-paper-2 [&_code]:px-1 [&_code]:font-mono [&_code]:text-ms',
      )}
    >
      <ReactMarkdown>{content}</ReactMarkdown>
    </div>
  );
}

/**
 * Bong bóng tin (ảnh 19):
 * - USER: nền ink, chữ trắng, bo góc bất đối xứng (đuôi góc dưới phải), căn phải, giờ mono dưới tin.
 * - ASSISTANT: icon tròn sparkles màu hl bên trái, bong bóng surface viền line, dưới tin có
 *   "giờ · loại tin"; khối nút hành động (slot `actions`) chen giữa bong bóng và dòng meta.
 * - SYSTEM: ghi chú hệ thống căn giữa (vd. hết hạn mức 30 câu/ngày), không phải tin của AI.
 */
export function MessageBubble({ message, actions }: { message: AssistantMessageDto; actions?: ReactNode }) {
  const time = vnTime(message.createdAt);

  if (message.role === 'USER') {
    return (
      <div className="flex flex-col items-end">
        <p className="max-w-[85%] rounded-card rounded-br-chip bg-ink px-4 py-3 text-b break-words whitespace-pre-wrap text-white">
          {message.content}
        </p>
        <p className="mt-1 font-mono text-cap text-ink-2">{time}</p>
      </div>
    );
  }

  if (message.role === 'SYSTEM') {
    return (
      <p
        role="status"
        className="mx-auto max-w-[92%] rounded-full bg-paper-2 px-4 py-2 text-center text-cap text-ink-2"
      >
        {message.content}
      </p>
    );
  }

  return (
    <div className="flex items-start gap-2.5 sm:gap-3">
      <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-hl text-ink" aria-hidden>
        <Sparkles className="size-4" />
      </span>
      <div className="flex min-w-0 flex-1 flex-col items-start">
        <div className="max-w-[92%] rounded-card rounded-bl-chip border border-line bg-surface px-4 py-3 sm:max-w-[85%]">
          <MarkdownContent content={message.content} />
        </div>
        {actions}
        <p className="mt-1.5 text-cap text-ink-2">
          <span className="font-mono">{time}</span> · {categoryLabel(message.category)}
        </p>
      </div>
    </div>
  );
}
