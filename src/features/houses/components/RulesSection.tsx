import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useWatch } from 'react-hook-form';
import { toast } from 'sonner';
import { Button } from '@/components/ui/Button.tsx';
import { Field } from '@/components/ui/Field.tsx';
import { Textarea } from '@/components/ui/Textarea.tsx';
import { ProfileSection } from '@/features/profile/components/ProfileSection.tsx';
import { useUpdateHouse } from '../hooks.ts';
import { RULES_MAX, rulesSchema, type RulesValues } from '../schemas.ts';
import type { HouseDetail } from '../types.ts';

/** "Nội quy nhà" (Admin sửa). Mỗi dòng là một điều; cả nhà thấy ở trang Thành viên và Trợ lý AI đọc để tư vấn. */
export function RulesSection({ house }: { house: HouseDetail }) {
  const update = useUpdateHouse(house.id);
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isDirty },
  } = useForm<RulesValues>({
    resolver: zodResolver(rulesSchema),
    mode: 'onTouched',
    values: { rules: house.rules ?? '' },
  });
  const length = useWatch({ control, name: 'rules' }).length;

  const onSubmit = handleSubmit((values) =>
    update.mutate(values, {
      onSuccess: () => toast(values.rules ? 'Đã lưu nội quy.' : 'Đã xóa nội quy.'),
      onError: (e) => toast.error(e.message),
    }),
  );

  return (
    <ProfileSection id="house-rules" overline="Cả nhà cùng thấy" title="Nội quy nhà">
      <form className="flex flex-col gap-4" noValidate onSubmit={onSubmit}>
        <Field
          label="Nội quy"
          htmlFor="house-rules-input"
          error={errors.rules?.message}
          hint="Mỗi dòng một điều. Trợ lý AI đọc nội quy này khi tư vấn chuyện trong nhà."
        >
          <Textarea
            id="house-rules-input"
            rows={6}
            placeholder={'Giữ yên lặng sau 23h\nRửa chén ngay sau khi ăn'}
            invalid={!!errors.rules}
            {...register('rules')}
          />
        </Field>
        <div className="flex items-center justify-between gap-3">
          <p className="font-mono text-cap text-ink-2">
            {length} / {RULES_MAX}
          </p>
          <Button type="submit" loading={update.isPending} disabled={!isDirty}>
            Lưu nội quy
          </Button>
        </div>
      </form>
    </ProfileSection>
  );
}
