import { ChevronDown, LogOut, ScanLine, UserRound } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import { Avatar } from '@/components/ui/Avatar.tsx';
import { avatarToneFor } from '@/components/ui/tones.ts';
import { Menu, MenuItem, MenuSeparator } from '@/components/ui/Menu.tsx';
import { useLogout } from '@/features/auth/hooks.ts';
import { ledgerErrorMessage } from '@/features/expenses/errors.ts';
import { OcrConsentDialog } from '@/features/receipts/components/OcrConsentDialog.tsx';
import { ocrToggleLabel } from '@/features/receipts/consent.ts';
import { useSetOcrConsent } from '@/features/receipts/hooks.ts';
import { useAuthStore } from '@/stores/auth-store.ts';

/** Avatar + chevron (desktop) hoặc avatar 40 (mobile): Hồ sơ, bật/tắt quét hóa đơn bằng AI, Đăng xuất. */
export function UserMenu({ compact = false }: { compact?: boolean }) {
  const user = useAuthStore((s) => s.user);
  const logout = useLogout();
  const navigate = useNavigate();
  const setConsent = useSetOcrConsent();
  const [consentOpen, setConsentOpen] = useState(false);
  if (!user) return null;

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
    </>
  );
}
