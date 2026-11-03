import { LegalDocument } from '@/features/legal/components/LegalDocument.tsx';
import { PublicPageShell } from '@/features/legal/components/PublicPageShell.tsx';
import { PRIVACY } from '@/features/legal/privacy.ts';
import { usePageTitle } from '@/lib/use-page-title.ts';

export function PrivacyPage() {
  usePageTitle(PRIVACY.title);
  return (
    <PublicPageShell current="/privacy" overline="Pháp lý" title={PRIVACY.title} intro={PRIVACY.intro}>
      <LegalDocument doc={PRIVACY} />
    </PublicPageShell>
  );
}
