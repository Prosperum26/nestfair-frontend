import { useEffect } from 'react';
import { useLocation } from 'react-router';
import { PublicFooter } from '@/components/layout/PublicFooter.tsx';
import { PublicHeader } from '@/components/layout/PublicHeader.tsx';
import { CtaBand } from '@/features/landing/components/CtaBand.tsx';
import { DebtSection } from '@/features/landing/components/DebtSection.tsx';
import { FaqSection } from '@/features/landing/components/FaqSection.tsx';
import { Hero } from '@/features/landing/components/Hero.tsx';
import { HowItWorks } from '@/features/landing/components/HowItWorks.tsx';
import { MoreFeatures } from '@/features/landing/components/MoreFeatures.tsx';
import { PainPoints } from '@/features/landing/components/PainPoints.tsx';
import { usePageTitle } from '@/lib/use-page-title.ts';

/** Trang giới thiệu NestFair cho người chưa đăng nhập (ảnh thiết kế 01_Landing). */
export function LandingPage() {
  usePageTitle();
  const { hash } = useLocation();

  // Từ trang khác bấm "/#faq" thì cuộn tới đúng mục; vào "/" thường thì về đầu trang.
  useEffect(() => {
    if (!hash) return;
    document.getElementById(hash.slice(1))?.scrollIntoView();
  }, [hash]);

  return (
    <div className="min-h-svh bg-paper">
      <PublicHeader />
      <main id="main">
        <Hero />
        <PainPoints />
        <MoreFeatures />
        <DebtSection />
        <HowItWorks />
        <FaqSection />
        <CtaBand />
      </main>
      <PublicFooter />
    </div>
  );
}
