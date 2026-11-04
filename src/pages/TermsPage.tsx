import { LegalDocument } from '@/features/legal/components/LegalDocument.tsx';
import { PublicPageShell } from '@/features/legal/components/PublicPageShell.tsx';
import { TERMS } from '@/features/legal/terms.ts';
import { usePageTitle } from '@/lib/use-page-title.ts';

export function TermsPage() {
  usePageTitle(TERMS.title);
  return (
    <PublicPageShell current="/terms" overline="Pháp lý" title={TERMS.title} intro={TERMS.intro}>
      <LegalDocument doc={TERMS} />
    </PublicPageShell>
  );
}
