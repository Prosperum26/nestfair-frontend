import { Check, ChevronDown, House, Plus } from 'lucide-react';
import { useNavigate } from 'react-router';
import { IconTile } from '@/components/ui/IconTile.tsx';
import { Menu, MenuItem, MenuSeparator } from '@/components/ui/Menu.tsx';
import { useCurrentHouse } from '@/features/houses/hooks.ts';
import { cn } from '@/lib/cn.ts';
import { useHouseStore } from '@/stores/house-store.ts';

/**
 * Pill "Nhà 12A" ở top nav: đổi nhà đang xem, hoặc tạo / vào nhà khác.
 * compact: dùng ở top bar mobile (chỉ chữ + chevron).
 */
export function HouseSwitcher({ compact = false }: { compact?: boolean }) {
  const { house, data: houses } = useCurrentHouse();
  const selectHouse = useHouseStore((s) => s.selectHouse);
  const navigate = useNavigate();
  if (!house) return null;

  return (
    <Menu
      align={compact ? 'left' : 'right'}
      trigger={(props) => (
        <button
          type="button"
          {...props}
          aria-label={`Nhà đang xem: ${house.name}. Đổi nhà`}
          className={cn(
            'flex min-w-0 items-center gap-2 focus-visible:outline-none focus-visible:shadow-focus',
            compact
              ? 'rounded-btn-sm font-mono text-over uppercase text-ink-2'
              : 'h-10 rounded-full border border-line bg-paper py-1 pr-3 pl-1 text-sm font-semibold text-ink hover:bg-paper-2',
          )}
        >
          {!compact && <IconTile icon={<House />} tone="hl" size={32} className="rounded-full!" />}
          <span className={cn('truncate', !compact && 'max-w-[120px]')}>{house.name}</span>
          <ChevronDown className="size-4 shrink-0" aria-hidden />
        </button>
      )}
    >
      {(close) => (
        <>
          <p className="px-3 pt-1.5 pb-1 font-mono text-over uppercase text-ink-2">Nhà của bạn</p>
          {houses?.map((h) => (
            <MenuItem
              key={h.id}
              active={h.id === house.id}
              icon={h.id === house.id ? <Check /> : <span className="size-[18px]" />}
              onSelect={() => {
                selectHouse(h.id);
                close();
              }}
            >
              <span className="block truncate">{h.name}</span>
              <span className="block text-cap font-normal text-ink-2">
                {h.myRole === 'ADMIN' ? 'Trưởng phòng' : 'Thành viên'} · {h.memberCount}/{h.maxMembers} người
              </span>
            </MenuItem>
          ))}
          <MenuSeparator />
          <MenuItem
            icon={<Plus />}
            onSelect={() => {
              close();
              navigate('/onboarding');
            }}
          >
            Tạo hoặc vào nhà khác
          </MenuItem>
        </>
      )}
    </Menu>
  );
}
