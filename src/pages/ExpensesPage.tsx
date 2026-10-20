import { Filter, Plus, ScanLine, Search } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { Button } from '@/components/ui/Button.tsx';
import { IconButton } from '@/components/ui/IconButton.tsx';
import { Input } from '@/components/ui/Input.tsx';
import { Menu, MenuItem, MenuSeparator } from '@/components/ui/Menu.tsx';
import { Modal } from '@/components/ui/Modal.tsx';
import { PageHeader } from '@/components/ui/PageHeader.tsx';
import { InfoNote, MonthSwitcher } from '@/features/expenses/components/bits.tsx';
import { ExpenseDetail } from '@/features/expenses/components/ExpenseDetail.tsx';
import { ExpenseFormModal } from '@/features/expenses/components/ExpenseFormModal.tsx';
import {
  ExpenseDayList,
  ExpenseListEmpty,
  ExpenseListError,
  ExpenseListSkeleton,
  ExpenseTable,
} from '@/features/expenses/components/ExpenseList.tsx';
import { ExpenseStatsDesktop, ExpenseStatsError, ExpenseStatsMobile, ExpenseStatsSkeleton } from '@/features/expenses/components/ExpenseStats.tsx';
import { CATEGORY_META } from '@/features/expenses/category.ts';
import { useExpenses, useExpenseSummary } from '@/features/expenses/hooks.ts';
import { monthKeyOf, monthOverlineOf, shiftMonth } from '@/features/expenses/month.ts';
import { useLedgerRealtime } from '@/features/expenses/realtime.ts';
import type { Expense, ExpenseCategory, UserBrief } from '@/features/expenses/types.ts';
import { useCurrentHouse, useHouseDetail } from '@/features/houses/hooks.ts';
import { cn } from '@/lib/cn.ts';
import { firstName } from '@/lib/date.ts';
import { formatVnd } from '@/lib/format.ts';
import { useAuthStore } from '@/stores/auth-store.ts';

/** Chờ người dùng ngừng gõ rồi mới tìm (đỡ gọi API mỗi phím). */
function useDebounced<T>(value: T, ms = 300): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return debounced;
}

const chipCls = (active: boolean) =>
  cn(
    'h-9 shrink-0 rounded-full border px-3.5 text-sm whitespace-nowrap focus-visible:outline-none focus-visible:shadow-focus',
    active ? 'border-ink bg-ink font-semibold text-white' : 'border-line-2 bg-surface text-ink hover:bg-paper',
  );

/** Sổ chi (preview 07): thống kê tháng, danh sách khoản chi lọc theo danh mục / người trả, chi tiết dạng hóa đơn. */
export function ExpensesPage() {
  const { house } = useCurrentHouse();
  const detail = useHouseDetail(house?.id);
  const me = useAuthStore((s) => s.user);
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const thisMonth = monthKeyOf(new Date());
  const [month, setMonth] = useState(thisMonth);
  const [category, setCategory] = useState<ExpenseCategory | undefined>();
  const [payerId, setPayerId] = useState<string | undefined>();
  const [search, setSearch] = useState('');
  const q = useDebounced(search);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [mobileDetail, setMobileDetail] = useState(false);
  const [form, setForm] = useState<{ open: boolean; expense: Expense | null }>({ open: false, expense: null });
  // Nút FAB ở tab bar mở form bằng ?new=1.
  const wantsNew = searchParams.get('new') === '1';

  useLedgerRealtime(house?.id);
  const summary = useExpenseSummary(house?.id, month);
  const list = useExpenses(house?.id, { month, category, payerId, q });

  /** Thành viên theo thứ tự vào nhà (backend trả joinedAt tăng dần). */
  const members: UserBrief[] = useMemo(
    () => (detail.data?.members ?? []).map((m) => ({ id: m.userId, fullName: m.fullName, avatarUrl: m.avatarUrl })),
    [detail.data],
  );
  const expenses = list.data ?? [];
  const selected = expenses.find((e) => e.id === selectedId) ?? expenses[0] ?? null;
  const filtered = !!(category || payerId || q);
  const totalMyShare = expenses.reduce((s, e) => s + e.myShare, 0);
  const chipCategories = (summary.data?.byCategory ?? []).map((c) => c.category);
  if (category && !chipCategories.includes(category)) chipCategories.push(category);

  const openNew = () => setForm({ open: true, expense: null });
  const openEdit = (expense: Expense) => {
    setMobileDetail(false);
    setForm({ open: true, expense });
  };
  const closeForm = () => {
    setForm({ open: false, expense: null });
    if (wantsNew) setSearchParams({}, { replace: true });
  };
  /** Thành viên cho form: người đang ở + người đã rời nhưng có trong khoản đang sửa. */
  const formMembers = useMemo(() => {
    const e = form.expense;
    if (!e) return members;
    const extra = [e.payer, ...e.splits.map((s) => ({ id: s.userId, fullName: s.fullName, avatarUrl: s.avatarUrl }))].filter(
      (u, i, arr) => !members.some((m) => m.id === u.id) && arr.findIndex((x) => x.id === u.id) === i,
    );
    return [...members, ...extra];
  }, [form.expense, members]);
  const creatorName = (e: Expense) => {
    const creator = members.find((m) => m.id === e.createdById) ?? (e.payer.id === e.createdById ? e.payer : undefined);
    return creator ? (creator.id === me?.id ? 'Bạn' : firstName(creator.fullName)) : undefined;
  };
  const changeMonth = (delta: number) => {
    setMonth((m) => shiftMonth(m, delta));
    setSelectedId(null);
  };

  const detailNode = (e: Expense) =>
    house && (
      <ExpenseDetail
        expense={e}
        houseId={house.id}
        meId={me?.id}
        creatorName={creatorName(e)}
        onEdit={() => openEdit(e)}
        onDeleted={() => {
          setSelectedId(null);
          setMobileDetail(false);
        }}
      />
    );

  return (
    <>
      <PageHeader
        overline={`Sổ chi · ${monthOverlineOf(month)}`}
        title="Chi tiêu"
        actions={
          <>
            <MonthSwitcher month={month} onChange={changeMonth} max={thisMonth} />
            <Button variant="secondary" leftIcon={<ScanLine />} onClick={() => navigate('/expenses/scan')} className="max-lg:hidden">
              Quét hóa đơn
            </Button>
            <IconButton icon={<ScanLine />} label="Quét hóa đơn" onClick={() => navigate('/expenses/scan')} className="lg:hidden" />
            <Button variant="accent" leftIcon={<Plus />} onClick={openNew} className="max-lg:hidden">
              Thêm chi tiêu
            </Button>
          </>
        }
      />

      <div className="mt-6 lg:mt-8">
        {summary.isPending ? (
          <ExpenseStatsSkeleton />
        ) : summary.isError ? (
          <ExpenseStatsError onRetry={() => void summary.refetch()} />
        ) : (
          <>
            <ExpenseStatsDesktop summary={summary.data} />
            <ExpenseStatsMobile summary={summary.data} />
          </>
        )}
      </div>

      <div className="mt-6 grid gap-6 lg:mt-8 lg:grid-cols-12">
        <section aria-label="Danh sách khoản chi" className="min-w-0 lg:col-span-8 lg:rounded-card lg:border lg:border-line lg:bg-surface lg:p-5">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <Input
              aria-label="Tìm khoản chi"
              placeholder="Tìm khoản chi, người trả…"
              leftIcon={<Search />}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="lg:w-[220px] lg:shrink-0"
            />
            <div className="flex min-w-0 flex-1 items-center gap-2">
              <div className="-mx-4 flex min-w-0 flex-1 gap-2 overflow-x-auto px-4 pb-1 lg:mx-0 lg:px-0" role="group" aria-label="Lọc theo danh mục">
                <button type="button" aria-pressed={!category} className={chipCls(!category)} onClick={() => setCategory(undefined)}>
                  Tất cả
                </button>
                {chipCategories.map((c) => (
                  <button key={c} type="button" aria-pressed={category === c} className={chipCls(category === c)} onClick={() => setCategory(c)}>
                    {CATEGORY_META[c].label}
                  </button>
                ))}
              </div>
              <Menu
                trigger={(p) => <IconButton icon={<Filter />} label="Lọc theo người trả" dot={!!payerId} {...p} />}
                className="max-h-[320px] overflow-y-auto"
              >
                {(close) => (
                  <>
                    <MenuItem active={!payerId} onSelect={() => (setPayerId(undefined), close())}>
                      Mọi người trả
                    </MenuItem>
                    <MenuSeparator />
                    {members.map((m) => (
                      <MenuItem key={m.id} active={payerId === m.id} onSelect={() => (setPayerId(m.id), close())}>
                        {m.id === me?.id ? 'Bạn trả' : `${firstName(m.fullName)} trả`}
                      </MenuItem>
                    ))}
                  </>
                )}
              </Menu>
            </div>
          </div>

          <div className="mt-4">
            {list.isPending ? (
              <ExpenseListSkeleton />
            ) : list.isError ? (
              <ExpenseListError onRetry={() => void list.refetch()} />
            ) : expenses.length === 0 ? (
              <ExpenseListEmpty filtered={filtered} onAdd={openNew} />
            ) : (
              <>
                <div className="hidden lg:block">
                  <ExpenseTable expenses={expenses} meId={me?.id} selectedId={selected?.id ?? null} onSelect={(e) => setSelectedId(e.id)} />
                </div>
                <div className="lg:hidden">
                  <ExpenseDayList
                    expenses={expenses}
                    meId={me?.id}
                    onSelect={(e) => {
                      setSelectedId(e.id);
                      setMobileDetail(true);
                    }}
                  />
                </div>
                <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-cap text-ink-2">
                  <span>
                    Hiển thị {expenses.length} / {filtered ? 'đã lọc' : `${summary.data?.expenseCount ?? expenses.length} khoản chi`}
                  </span>
                  <span>
                    Tổng phần của bạn <span className="font-mono text-mm text-ink">{formatVnd(totalMyShare)}</span>
                  </span>
                </div>
              </>
            )}
          </div>
        </section>

        <aside className="hidden lg:col-span-4 lg:block" aria-label="Chi tiết khoản chọn">
          <p className="mb-3 font-mono text-over uppercase text-ink-2">Chi tiết khoản chọn</p>
          {selected ? detailNode(selected) : <p className="text-sm text-ink-2">Chọn một khoản chi để xem phần của từng người.</p>}
          <InfoNote className="mt-5">Phần lẻ khi chia đều được cộng lần lượt 1đ cho người vào nhà trước, nên tổng các phần luôn khớp hóa đơn.</InfoNote>
        </aside>
      </div>

      {house && (
        <>
          <Modal open={mobileDetail && !!selected} onClose={() => setMobileDetail(false)} title="Chi tiết khoản chi" className="lg:hidden">
            {selected && detailNode(selected)}
          </Modal>
          <ExpenseFormModal
            open={form.open || wantsNew}
            houseId={house.id}
            houseName={house.name}
            members={formMembers}
            meId={me?.id}
            expense={form.expense}
            onClose={closeForm}
            onSaved={(saved) => {
              setSelectedId(saved.id);
              // Khoản mới ở tháng khác: chuyển sang tháng đó để thấy ngay.
              const savedMonth = monthKeyOf(new Date(saved.spentAt));
              if (savedMonth !== month) setMonth(savedMonth);
            }}
          />
        </>
      )}
    </>
  );
}
