import { ArrowRight } from 'lucide-react';
import { LinkButton } from '@/components/ui/LinkButton.tsx';
import { InView } from '@/components/ui/Reveal.tsx';

/** Dải kêu gọi cuối trang (nền highlight, nút primary tối). */
export function CtaBand() {
  return (
    <section aria-labelledby="cta-title" className="bg-hl">
      <InView className="mx-auto flex max-w-page flex-col gap-6 px-4 py-16 lg:flex-row lg:items-center lg:justify-between lg:px-6 lg:py-20 xl:px-0">
        <div>
          <h2 id="cta-title" className="font-display text-h1m font-bold text-ink lg:text-[40px] lg:leading-[46px] lg:tracking-[-0.8px]">
            Mở sổ chung cho nhà bạn hôm nay.
          </h2>
          <p className="mt-3 text-b text-ink">Tạo nhà mất chưa đến một phút. Mời bạn cùng phòng bằng mã 6 ký tự.</p>
        </div>
        <LinkButton to="/register" variant="primary" size="lg" rightIcon={<ArrowRight />} className="self-start lg:self-auto">
          Tạo nhà miễn phí
        </LinkButton>
      </InView>
    </section>
  );
}
