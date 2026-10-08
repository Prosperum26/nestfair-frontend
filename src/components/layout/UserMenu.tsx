import { ChevronDown, LogOut, UserRound } from 'lucide-react';
import { useNavigate } from 'react-router';
import { Avatar } from '@/components/ui/Avatar.tsx';
import { avatarToneFor } from '@/components/ui/tones.ts';
import { Menu, MenuItem, MenuSeparator } from '@/components/ui/Menu.tsx';
import { useLogout } from '@/features/auth/hooks.ts';
import { useAuthStore } from '@/stores/auth-store.ts';

/** Avatar + chevron (desktop) hoặc avatar 40 (mobile): Hồ sơ, Đăng xuất. */
export function UserMenu({ compact = false }: { compact?: boolean }) {
  const user = useAuthStore((s) => s.user);
  const logout = useLogout();
  const navigate = useNavigate();
  if (!user) return null;

  return (
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
  );
}
