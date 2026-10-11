import { toast } from 'sonner';
import { Button } from '@/components/ui/Button.tsx';
import { messageForError } from '../errors.ts';
import { useAppeal } from '../hooks.ts';
import type { Assignment } from '../types.ts';

/** Người làm khiếu nại khi nghĩ bị từ chối oan: ca chuyển sang "Chờ trưởng phòng quyết". */
export function AppealButton({ houseId, assignment }: { houseId: string; assignment: Assignment }) {
  const appeal = useAppeal(houseId);
  return (
    <Button
      size="sm"
      variant="ghost"
      loading={appeal.isPending}
      onClick={() =>
        appeal.mutate(assignment.id, {
          onSuccess: () => toast('Đã gửi khiếu nại cho trưởng phòng.'),
          onError: (e) => toast(messageForError(e)),
        })
      }
    >
      Khiếu nại
    </Button>
  );
}
