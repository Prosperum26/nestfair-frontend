import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Button } from '@/components/ui/Button.tsx';
import { Field } from '@/components/ui/Field.tsx';
import { Input } from '@/components/ui/Input.tsx';
import { Modal } from '@/components/ui/Modal.tsx';
import { Textarea } from '@/components/ui/Textarea.tsx';
import { useProposeRule } from '../hooks.ts';
import {
  proposalErrorMessage,
  proposalTitle,
  type RuleProposalFormInput,
  type RuleProposalInput,
  ruleProposalSchema,
} from '../rule-proposals.ts';
import type { RuleProposalKind } from '../types.ts';

export interface ProposeTarget {
  kind: RuleProposalKind;
  /** EDIT / REMOVE: điều đang có. */
  targetText?: string;
}

const DESCRIPTIONS: Record<RuleProposalKind, string> = {
  ADD: 'Trưởng phòng duyệt thì điều này được thêm vào cuối nội quy.',
  EDIT: 'Trưởng phòng duyệt thì điều cũ được thay bằng nội dung mới.',
  REMOVE: 'Trưởng phòng duyệt thì điều này bị bỏ khỏi nội quy.',
};

/** Thành viên đề xuất thêm / sửa / bỏ một điều. Mở lại với `target` khác thì form tự đặt lại (key ở nơi gọi). */
export function ProposeRuleDialog({
  houseId,
  target,
  onClose,
}: {
  houseId: string;
  target: ProposeTarget;
  onClose: () => void;
}) {
  const propose = useProposeRule(houseId);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RuleProposalFormInput, unknown, RuleProposalInput>({
    resolver: zodResolver(ruleProposalSchema),
    mode: 'onTouched',
    defaultValues: {
      kind: target.kind,
      targetText: target.targetText,
      content: target.kind === 'EDIT' ? target.targetText : '',
      reason: '',
    },
  });

  const onSubmit = handleSubmit((values) =>
    propose.mutate(values, {
      onSuccess: () => {
        toast('Đã gửi đề xuất cho trưởng phòng.');
        onClose();
      },
      onError: (e) => toast.error(proposalErrorMessage(e)),
    }),
  );

  return (
    <Modal open onClose={onClose} overline="Đề xuất nội quy" title={proposalTitle(target)} description={DESCRIPTIONS[target.kind]}>
      <form className="flex flex-col gap-4" noValidate onSubmit={onSubmit}>
        {target.targetText && (
          <div className="rounded-btn border border-line bg-paper px-3.5 py-3">
            <p className="font-mono text-over uppercase text-ink-2">Điều hiện tại</p>
            <p className={target.kind === 'REMOVE' ? 'mt-1 break-words text-sm text-ink-2 line-through decoration-tom' : 'mt-1 break-words text-sm text-ink'}>
              {target.targetText}
            </p>
          </div>
        )}
        {target.kind !== 'REMOVE' && (
          <Field label={target.kind === 'ADD' ? 'Điều muốn thêm' : 'Nội dung mới'} htmlFor="proposal-content" error={errors.content?.message}>
            <Textarea id="proposal-content" rows={3} className="min-h-[88px]" invalid={!!errors.content} {...register('content')} />
          </Field>
        )}
        <Field label="Lý do (không bắt buộc)" htmlFor="proposal-reason" error={errors.reason?.message}>
          <Input id="proposal-reason" placeholder="Vì sao nên đổi?" invalid={!!errors.reason} {...register('reason')} />
        </Field>
        <div className="flex flex-col-reverse gap-2.5 sm:flex-row sm:justify-end">
          <Button type="button" variant="secondary" onClick={onClose}>
            Hủy
          </Button>
          <Button type="submit" variant="accent" loading={propose.isPending}>
            Gửi đề xuất
          </Button>
        </div>
      </form>
    </Modal>
  );
}
