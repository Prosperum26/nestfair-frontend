import { ChevronDown, LogOut, ScanLine, Settings, Sparkles, UserRound } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import { Avatar } from '@/components/ui/Avatar.tsx';
import { avatarToneFor } from '@/components/ui/tones.ts';
import { Menu, MenuItem, MenuSeparator } from '@/components/ui/Menu.tsx';
import { useCurrentHouse } from '@/features/houses/hooks.ts';
import { useLogout } from '@/features/auth/hooks.ts';
import type { AssistantConsentUser } from '@/features/assistant/types.ts';
import { AssistantConsentDialog } from '@/features/assistant/components/AssistantConsentDialog.tsx';
import { assistantErrorMessage } from '@/features/assistant/errors.ts';
import { useSetAssistantConsent } from '@/features/assistant/hooks.ts';
import { ledgerErrorMessage } from '@/features/expenses/errors.ts';
import { OcrConsentDialog } from '@/features/receipts/components/OcrConsentDialog.tsx';
import { ocrToggleLabel } from '@/features/receipts/consent.ts';
import { useSetOcrConsent } from '@/features/receipts/hooks.ts';
import { useAuthStore } from '@/stores/auth-store.ts';

/** Avatar + chevron (desktop) hoặc avatar 40 (mobile): Hồ sơ, bật/tắt quét hóa đơn bằng AI, Trợ lý AI, Đăng xuất. */
export function UserMenu({ compact = false }: { compact?: boolean }) {
  const user = useAuthStore((s) => s.user);
  const logout = useLogout();
  const { house } = useCurrentHouse();
  const navigate = useNavigate();
  const setConsent = useSetOcrConsent();
  const setAssistantConsent = useSetAssistantConsent();
  const [consentOpen, setConsentOpen] = useState(false);
  const [assistantConsentOpen, setAssistantConsentOpen] = useState(false);
  if (!user) return null;
  // Backend trả assistantConsentAt cùng hồ sơ; auth/types.ts chưa khai báo nên mở rộng tại chỗ dùng.
  const assistantConsentAt = (user as AssistantConsentUser).assistantConsentAt ?? null;

  return (
    <>
      <Menu
        align={compact ? 'left' : 'right'}
        trigger={(props) => (
          <button
            type="button"
            {...props}
            aria-label="Tài khoản"
            className="flex items-center gap-1 rounded-full focus-visible:outline-none focus-visible:shadow-focus"
          >
            <Avatar
              name={user.fullName}
              tone={avatarToneFor(user.id)}
              src={user.avatarUrl}
              size={compact ? 40 : 36}
            />
            {!compact && <ChevronDown className="size-4 text-ink-2" aria-hidden />}
          </button>
        )}
      >
        {(close) => (
          <>
            <div className="px-3 pt-1.5 pb-2">
              <p className="truncate text-sm font-semibold text-ink">{user.fullName}</p>
              <p className="truncate text-cap text-ink-2">{user.email}</p>
            </div>
            <MenuSeparator />
            <MenuItem
              icon={<UserRound />}
              onSelect={() => {
                close();
                navigate('/profile');
              }}
            >
              Hồ sơ & tài khoản nhận tiền
            </MenuItem>
            {house?.myRole === 'ADMIN' && (
              <MenuItem
                icon={<Settings />}
                onSelect={() => {
                  close();
                  navigate('/house');
                }}
              >
                Cài đặt nhà
              </MenuItem>
            )}
            <MenuItem
              icon={<ScanLine />}
              onSelect={() => {
                close();
                // Đang Tắt: hỏi đồng ý (D13). Đang Bật: tắt ngay, không cần xác nhận.
                if (user.ocrConsentAt === null) setConsentOpen(true);
                else
                  setConsent.mutate(false, {
                    onSuccess: () => toast('Đã tắt quét hóa đơn bằng AI.'),
                    onError: (e) => toast.error(ledgerErrorMessage(e)),
                  });
              }}
            >
              <span className="flex items-center justify-between gap-2">
                Quét hóa đơn bằng AI
                <span className="font-mono text-over uppercase text-ink-2">{ocrToggleLabel(user.ocrConsentAt)}</span>
              </span>
            </MenuItem>
            <MenuItem
              icon={<Sparkles />}
              onSelect={() => {
                close();
                // Công tắc Trợ lý AI (D5), theo mẫu quét hóa đơn: đang Tắt thì hỏi đồng ý trước.
                if (assistantConsentAt === null) setAssistantConsentOpen(true);
                else
                  setAssistantConsent.mutate(false, {
                    onSuccess: () => toast('Đã tắt Trợ lý AI.'),
                    onError: (e) => toast.error(assistantErrorMessage(e)),
                  });
              }}
            >
              <span className="flex items-center justify-between gap-2">
                Trợ lý AI
                <span className="font-mono text-over uppercase text-ink-2">{assistantConsentAt === null ? 'Tắt' : 'Bật'}</span>
              </span>
            </MenuItem>
            <MenuItem
              icon={<LogOut />}
              onSelect={() => {
                close();
                logout.mutate();
              }}
            >
              Đăng xuất
            </MenuItem>
          </>
        )}
      </Menu>
    <OcrConsentDialog
      open={consentOpen}
      onAgree={() => {
        setConsentOpen(false);
        toast('Đã bật quét hóa đơn bằng AI.');
      }}
      onDecline={() => setConsentOpen(false)}
    />
    <AssistantConsentDialog
      open={assistantConsentOpen}
      onAgree={() => {
        setAssistantConsentOpen(false);
        toast('Đã bật Trợ lý AI. Vào mục Trợ lý để trò chuyện nhé.');
      }}
      onDecline={() => setAssistantConsentOpen(false)}
    />
    </>
  );
}
