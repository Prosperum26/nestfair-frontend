import { RotateCw } from 'lucide-react';
import { type ReactNode, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/Button.tsx';
import { Modal } from '@/components/ui/Modal.tsx';
import { Skeleton } from '@/components/ui/Skeleton.tsx';
import { useSettlementPlan } from '@/features/expenses/hooks.ts';
import type { HouseDetail, HouseMember } from '@/features/houses/types.ts';
import { ApiError } from '@/lib/api.ts';
import { firstName } from '@/lib/date.ts';
import { formatSignedVnd } from '@/lib/format.ts';
import { balanceSentence, kickBody, type KickStep, kickSteps, membershipErrorMessage, projectedBalance } from '../flow.ts';
import { useKickMember, useLeavePreview } from '../hooks.ts';
import type { AdjustmentMode, LeavePreview, ShiftMode } from '../types.ts';
import { OptionCard } from './OptionCard.tsx';

/**
 * Trưởng phòng xóa thành viên (spec "Luồng kick"). Hết nợ: một bước xác nhận. Còn nợ: báo số tiền → chọn
 * xóa khoản đó / chuyển cho người khác → (chọn người nhận) → xác nhận. Ca sắp tới chọn ở bước xác nhận.
 */
export function KickMemberDialog({ house, member, onClose }: { house: HouseDetail; member: HouseMember; onClose: () => void }) {
  const preview = useLeavePreview(house.id, member.userId);
  const name = firstName(member.fullName);

  return (
    <Modal open onClose={onClose} overline="Xóa khỏi nhà" title={`Xóa ${name} khỏi nhà?`}>
      {preview.isPending ? (
        <div className="flex flex-col gap-3" aria-busy="true" aria-label="Đang kiểm tra số dư">
          <Skeleton className="h-16 rounded-btn" />
          <Skeleton className="h-11 rounded-btn" />
        </div>
      ) : preview.isError ? (
        <div className="flex flex-col gap-4">
          <p className="text-sm text-tom">{membershipErrorMessage(preview.error)}</p>
          <Button variant="secondary" leftIcon={<RotateCw />} onClick={() => void preview.refetch()}>
            Thử lại
          </Button>
        </div>
      ) : (
        // key: số dư đổi (server báo 409) thì làm lại từ đầu với số mới.
        <KickFlow key={preview.data.net} house={house} preview={preview.data} name={name} onClose={onClose} onStale={() => void preview.refetch()} />
      )}
    </Modal>
  );
}

function KickFlow({
  house,
  preview,
  name,
  onClose,
  onStale,
}: {
  house: HouseDetail;
  preview: LeavePreview;
  name: string;
  onClose: () => void;
  onStale: () => void;
}) {
  const kick = useKickMember(house.id);
  const plan = useSettlementPlan(house.id);
  const [mode, setMode] = useState<AdjustmentMode | null>(null);
  const [toUserId, setToUserId] = useState<string | null>(null);
  const [shifts, setShifts] = useState<ShiftMode>('AUTO');
  const [index, setIndex] = useState(0);

  const net = preview.net;
  const steps = kickSteps(net, mode);
  const step: KickStep = steps[Math.min(index, steps.length - 1)];
  const back = () => (index === 0 ? onClose() : setIndex(index - 1));
  const next = () => setIndex(index + 1);

  const others = house.members.filter((m) => m.userId !== preview.userId);
  const netOf = (userId: string) => plan.data?.members.find((m) => m.id === userId)?.net ?? 0;
  const recipient = others.find((m) => m.userId === toUserId);

  // mutateAsync thay cho callback của mutate(): sự kiện member:left tới trước khi HTTP trả về, danh sách tải lại làm
  // hộp thoại bị gỡ, và TanStack Query bỏ qua callback của mutate() khi component đã gỡ.
  const submit = async () => {
    try {
      await kick.mutateAsync({ userId: preview.userId, body: kickBody({ net, mode, toUserId, shifts }) });
      toast(`Đã xóa ${name} khỏi nhà.`);
      onClose();
    } catch (e) {
      toast.error(membershipErrorMessage(e));
      if (e instanceof ApiError && e.code === 'BALANCE_DECISION_REQUIRED') onStale();
    }
  };

  return (
    <div className="flex flex-col gap-5">
      {step === 'balance' && (
        <>
          <div className="rounded-btn border border-line bg-paper px-4 py-3.5">
            <p className="font-mono text-over uppercase text-ink-2">Số dư hiện tại</p>
            <p className={net < 0 ? 'mt-1 font-mono text-[22px] leading-8 font-semibold text-tom' : 'mt-1 font-mono text-[22px] leading-8 font-semibold text-mint'}>
              {formatSignedVnd(net)}
            </p>
            <p className="mt-1 text-sm text-ink">{balanceSentence(name, net)}.</p>
          </div>
          <p className="text-sm text-ink-2">
            Bạn vẫn muốn xóa {name}? Bước sau sẽ hỏi cách xử lý khoản này. Lịch sử chi tiêu cũ giữ nguyên.
          </p>
          <Actions onBack={back} backLabel="Quay lại">
            <Button variant="danger" onClick={next}>
              Vẫn xóa
            </Button>
          </Actions>
        </>
      )}

      {step === 'decide' && (
        <>
          <p className="text-sm text-ink-2">{balanceSentence(name, net)}. Xử lý khoản này thế nào?</p>
          <div role="radiogroup" aria-label="Cách xử lý số dư" className="flex flex-col gap-2.5">
            <OptionCard
              checked={mode === 'WRITE_OFF'}
              onSelect={() => setMode('WRITE_OFF')}
              title="Xóa khoản này"
              description={
                net < 0
                  ? `Những người đã trả hộ ${name} cùng chịu phần này, chia theo số mỗi người đang được nhận.`
                  : `Những người đang nợ ${name} được bớt phần này, chia theo số mỗi người đang nợ.`
              }
            />
            <OptionCard
              checked={mode === 'TRANSFER'}
              onSelect={() => setMode('TRANSFER')}
              title="Chuyển cho thành viên khác"
              description={net < 0 ? 'Một người trong nhà nhận trả khoản nợ này thay.' : 'Một người trong nhà nhận phần tiền này thay.'}
            />
          </div>
          <Actions onBack={back}>
            <Button disabled={!mode} onClick={next}>
              Tiếp tục
            </Button>
          </Actions>
        </>
      )}

      {step === 'pick' && (
        <>
          <p className="text-sm text-ink-2">Chọn người nhận. Số bên phải là số dư của họ sau khi nhận.</p>
          <div role="radiogroup" aria-label="Người nhận số dư" className="flex flex-col gap-2.5">
            {others.map((m) => {
              const after = projectedBalance(netOf(m.userId), net);
              return (
                <OptionCard
                  key={m.userId}
                  checked={toUserId === m.userId}
                  onSelect={() => setToUserId(m.userId)}
                  title={m.fullName}
                  description={`Hiện tại ${formatSignedVnd(netOf(m.userId))}`}
                  aside={
                    <span className={after < 0 ? 'shrink-0 font-mono text-sm font-semibold text-tom' : 'shrink-0 font-mono text-sm font-semibold text-mint'}>
                      {formatSignedVnd(after)}
                    </span>
                  }
                />
              );
            })}
          </div>
          <Actions onBack={back}>
            <Button disabled={!toUserId} onClick={next}>
              Tiếp tục
            </Button>
          </Actions>
        </>
      )}

      {step === 'confirm' && (
        <>
          <ul className="flex list-disc flex-col gap-1.5 pl-5 text-sm text-ink">
            {net === 0 && <li>{name} không còn khoản nợ hay khoản chưa nhận nào.</li>}
            {net !== 0 && mode === 'WRITE_OFF' && <li>Khoản {formatSignedVnd(net)} của {name} được xóa và chia cho những người liên quan.</li>}
            {net !== 0 && mode === 'TRANSFER' && recipient && (
              <li>
                Khoản {formatSignedVnd(net)} chuyển cho {firstName(recipient.fullName)} (số dư mới {formatSignedVnd(projectedBalance(netOf(recipient.userId), net))}).
              </li>
            )}
            {preview.pendingSettlements > 0 && <li>{preview.pendingSettlements} yêu cầu thanh toán đang chờ sẽ bị hủy.</li>}
            {preview.openChoreDebts > 0 && <li>{preview.openChoreDebts} nợ ca chưa trả sẽ được đóng.</li>}
            <li>Yêu cầu đổi ca đang chờ của {name} sẽ bị hủy. Lịch sử chi tiêu và việc nhà giữ nguyên.</li>
          </ul>

          {preview.futureShifts > 0 && (
            <div className="flex flex-col gap-2.5">
              <p className="text-sm font-medium text-ink">{name} còn {preview.futureShifts} ca sắp tới</p>
              <div role="radiogroup" aria-label="Ca sắp tới" className="flex flex-col gap-2.5">
                <OptionCard
                  checked={shifts === 'AUTO'}
                  onSelect={() => setShifts('AUTO')}
                  title="Hệ thống tự chia"
                  description="Giao cho người đang ít việc nhất, vẫn giữ rào 3 tuần nếu được."
                />
                <OptionCard
                  checked={shifts === 'MANUAL'}
                  onSelect={() => setShifts('MANUAL')}
                  title="Để trống, mình tự gán"
                  description="Các ca hiện “Chưa có người” trong lịch để bạn giao lại. Không ai bị tính lỗi."
                />
              </div>
            </div>
          )}

          <Actions onBack={back} backLabel={index === 0 ? 'Hủy' : 'Quay lại'}>
            <Button variant="danger" loading={kick.isPending} onClick={submit}>
              Xóa khỏi nhà
            </Button>
          </Actions>
        </>
      )}
    </div>
  );
}

function Actions({ onBack, backLabel = 'Quay lại', children }: { onBack: () => void; backLabel?: string; children: ReactNode }) {
  return (
    <div className="flex flex-col-reverse gap-2.5 sm:flex-row sm:justify-end">
      <Button type="button" variant="secondary" onClick={onBack}>
        {backLabel}
      </Button>
      {children}
    </div>
  );
}
