import { zodResolver } from '@hookform/resolvers/zod';
import { MapPin, Phone, Sparkles } from 'lucide-react';
import { type ReactNode, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Button } from '@/components/ui/Button.tsx';
import { Checkbox } from '@/components/ui/Checkbox.tsx';
import { Chip } from '@/components/ui/Chip.tsx';
import { Field } from '@/components/ui/Field.tsx';
import { Input } from '@/components/ui/Input.tsx';
import { SegmentedControl } from '@/components/ui/SegmentedControl.tsx';
import { messageForListingError, missingLabels } from '../errors.ts';
import { buildFormDefaults, primaryAction, toListingInput } from '../form-state.ts';
import { useSaveListing, useSetListingStatus } from '../hooks.ts';
import { type ListingFormOutput, type ListingFormValues, listingFormSchema } from '../schemas.ts';
import type { AdminListingResponse, GenderWanted } from '../types.ts';
import { CostFields } from './CostFields.tsx';
import { ListingAside } from './ListingAside.tsx';

const GENDER_OPTIONS: { value: GenderWanted; label: string }[] = [
  { value: 'MALE', label: 'Nam' },
  { value: 'FEMALE', label: 'Nữ' },
  { value: 'ANY', label: 'Không yêu cầu' },
];

const textareaClass =
  'w-full resize-y rounded-btn border border-line-2 bg-surface p-3.5 text-b text-ink outline-none placeholder:text-ink-3 focus:border-[1.5px] focus:border-ink focus:shadow-focus disabled:bg-paper-2';

function Card({ id, title, aside, children }: { id: string; title: string; aside?: ReactNode; children: ReactNode }) {
  return (
    <section aria-labelledby={id} className="rounded-card border border-line bg-surface p-4 sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <h2 id={id} className="font-display text-ct text-ink">
          {title}
        </h2>
        {aside}
      </div>
      <div className="mt-5 flex flex-col gap-5">{children}</div>
    </section>
  );
}

function ReadOnlyValue({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-sm font-medium text-ink">{label}</span>
      <div className="flex h-12 items-center rounded-btn border border-line-2 bg-paper-2 px-3.5 text-b text-ink">{value}</div>
      {hint && <p className="text-cap text-ink-2">{hint}</p>}
    </div>
  );
}

/**
 * Form tin đăng (ảnh 20): thông tin cơ bản, chi phí, mô tả và mong muốn. Phần Ảnh theo nhóm (F4)
 * và poster (F5, F6) gắn ở ListingPage. Thành viên thường chỉ xem.
 */
export function ListingForm({
  houseId,
  data,
  canEdit,
  photosSlot,
}: {
  houseId: string;
  data: AdminListingResponse;
  canEdit: boolean;
  /** Thẻ "Ảnh theo nhóm" (F4), đứng giữa chi phí và mô tả. */
  photosSlot?: ReactNode;
}) {
  const { listing, summary, suggestions, missing } = data;
  const [error, setError] = useState<string | null>(null);
  const save = useSaveListing(houseId);
  const setStatus = useSetListingStatus(houseId);
  const form = useForm<ListingFormValues, unknown, ListingFormOutput>({
    resolver: zodResolver(listingFormSchema),
    mode: 'onTouched',
    defaultValues: buildFormDefaults(listing, suggestions),
  });
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = form;

  const action = primaryAction(listing?.status ?? null);
  const pending = save.isPending || setStatus.isPending;
  const full = summary.slotsOpen === 0;
  // Đăng hoặc mở lại khi nhà đã đủ người sẽ bị backend từ chối (HOUSE_FULL): khóa nút luôn.
  const blockedByFull = full && (action === 'PUBLISH' || action === 'REOPEN');

  /** Lưu nội dung, rồi (nếu cần) đổi trạng thái. Lưu xong thì form coi như sạch dù bước đổi trạng thái lỗi. */
  const submit = (then: 'NONE' | 'OPEN') =>
    handleSubmit(async (values) => {
      setError(null);
      try {
        await save.mutateAsync(toListingInput(values));
      } catch (e) {
        setError(messageForListingError(e));
        return;
      }
      reset(values);
      if (then === 'NONE') {
        toast(action === 'UPDATE' ? 'Đã cập nhật tin.' : 'Đã lưu nháp.');
        return;
      }
      try {
        await setStatus.mutateAsync('OPEN');
        toast(action === 'REOPEN' ? 'Đã mở lại tin. Link và QR cũ vẫn dùng được.' : 'Đã đăng tin. Link công khai đã sẵn sàng.');
      } catch (e) {
        setError(messageForListingError(e));
      }
    });

  const closedFull = listing?.status === 'CLOSED' && listing.closeReason === 'FULL';

  return (
    <form noValidate onSubmit={submit(action === 'PUBLISH' || action === 'REOPEN' ? 'OPEN' : 'NONE')} className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-start">
      {/* Mobile: poster lên đầu (ảnh 20 mobile). Desktop: cột phải, dính khi cuộn. */}
      <aside className="order-first lg:order-none lg:col-span-5 lg:col-start-8 lg:row-start-1 lg:sticky lg:top-24">
        <ListingAside form={form} data={data} />
      </aside>
      <div className="flex min-w-0 flex-col gap-6 lg:col-span-7 lg:col-start-1 lg:row-start-1">
      {listing?.status === 'CLOSED' && (
        <p role="status" className="rounded-btn bg-hl-soft px-4 py-3 text-sm text-hl-ink">
          {closedFull ? 'Tin đã tự đóng vì nhà đủ người.' : 'Bạn đã đóng tin này.'}{' '}
          {full ? 'Nhà vẫn đủ người nên chưa mở lại được.' : 'Bấm Mở lại tin khi bạn muốn nhận người tiếp.'}
        </p>
      )}
      {!canEdit && (
        <p role="note" className="rounded-btn bg-paper-2 px-4 py-3 text-sm text-ink-2">
          Chỉ trưởng phòng chỉnh sửa tin.
        </p>
      )}

      <fieldset disabled={!canEdit} className="flex min-w-0 flex-col gap-6 border-0 p-0">
        <Card
          id="listing-basic-title"
          title="Thông tin cơ bản"
          aside={
            !listing && suggestions.locationText ? (
              <Chip tone="yellow" icon={<Sparkles />}>
                Điền sẵn từ dữ liệu nhà
              </Chip>
            ) : undefined
          }
        >
          <Field label="Vị trí hiển thị công khai" htmlFor="listing-location" error={errors.locationText?.message}>
            <Input
              id="listing-location"
              leftIcon={<MapPin />}
              placeholder="VD: Hẻm 51 Linh Trung, Thủ Đức · 5 phút đi bộ tới UIT"
              autoComplete="off"
              invalid={!!errors.locationText}
              {...register('locationText')}
            />
          </Field>

          <div className="grid gap-5 sm:grid-cols-2">
            <ReadOnlyValue label="Số chỗ trống" value={`${summary.slotsOpen} chỗ`} hint={`Nhà tối đa ${summary.maxMembers} người`} />
            <ReadOnlyValue label="Đang ở" value={`${summary.memberCount} người`} hint="Tính từ danh sách thành viên" />
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-ink">Giới tính cần tìm</span>
            <Controller
              control={control}
              name="genderWanted"
              render={({ field }) => (
                <SegmentedControl label="Giới tính cần tìm" size="lg" options={GENDER_OPTIONS} value={field.value} onChange={field.onChange} />
              )}
            />
          </div>

          <Field
            label="Số điện thoại liên hệ"
            htmlFor="listing-phone"
            error={errors.contactPhone?.message}
            hint="Hiện công khai trên trang tin. Người xem gọi hoặc nhắn Zalo qua số này."
          >
            <Input
              id="listing-phone"
              type="tel"
              inputMode="tel"
              leftIcon={<Phone />}
              placeholder="0901 234 567"
              autoComplete="tel"
              invalid={!!errors.contactPhone}
              {...register('contactPhone')}
            />
          </Field>
        </Card>

        <CostFields form={form} utilities={summary.utilities} disabled={!canEdit} />

        {photosSlot}

        <Card id="listing-text-title" title="Mô tả và mong muốn">
          <Field label="Mô tả phòng" htmlFor="listing-description" error={errors.description?.message}>
            <textarea
              id="listing-description"
              rows={4}
              maxLength={1000}
              placeholder="Diện tích, tầng, nội thất, tiện ích, giờ giấc..."
              className={textareaClass}
              aria-invalid={!!errors.description || undefined}
              {...register('description')}
            />
          </Field>
          <Field label="Mong muốn về bạn cùng phòng" htmlFor="listing-expectations" error={errors.roommateExpectations?.message}>
            <textarea
              id="listing-expectations"
              rows={4}
              maxLength={500}
              placeholder="Sinh viên hay đi làm, thói quen sinh hoạt, nội quy..."
              className={textareaClass}
              aria-invalid={!!errors.roommateExpectations || undefined}
              {...register('roommateExpectations')}
            />
          </Field>
          <Checkbox id="listing-roster" className="py-3" label="Hiện lịch trực ẩn danh trên trang công khai" {...register('showChoreSchedule')} />
        </Card>
      </fieldset>

      {canEdit && (
        <div className="flex flex-col gap-3">
          {error && (
            <p role="alert" className="rounded-btn-sm bg-tom-bg px-3 py-2 text-sm text-tom">
              {error}
            </p>
          )}
          {action === 'PUBLISH' && missing.length > 0 && (
            <p className="text-cap text-ink-2">Còn thiếu ảnh: {missingLabels(missing)}. Mỗi nhóm cần ít nhất 1 ảnh mới đăng được.</p>
          )}
          {blockedByFull && (
            <p className="text-cap text-ink-2">
              {action === 'PUBLISH' ? 'Nhà đã đủ người nên chưa đăng được.' : 'Nhà vẫn đủ người nên chưa mở lại được.'}
            </p>
          )}
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            {(action === 'PUBLISH' || action === 'REOPEN') && (
              <Button variant="secondary" disabled={pending || !isDirty} loading={save.isPending && !setStatus.isPending} onClick={submit('NONE')}>
                {action === 'REOPEN' ? 'Lưu thay đổi' : 'Lưu nháp'}
              </Button>
            )}
            <Button
              type="submit"
              variant={action === 'UPDATE' || action === 'SAVE_DRAFT' ? 'accent' : 'primary'}
              loading={pending}
              disabled={blockedByFull || (action === 'UPDATE' && !isDirty)}
            >
              {{ SAVE_DRAFT: 'Lưu nháp', PUBLISH: 'Đăng tin', UPDATE: 'Cập nhật tin', REOPEN: 'Mở lại tin' }[action]}
            </Button>
          </div>
        </div>
      )}
      </div>
    </form>
  );
}
