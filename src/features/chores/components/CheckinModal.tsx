import { compressImage } from '@/lib/image-compression.ts';
import { Camera, Send } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/Button.tsx';
import { IconTile } from '@/components/ui/IconTile.tsx';
import { Modal } from '@/components/ui/Modal.tsx';
import { cn } from '@/lib/cn.ts';
import { isStateChanged, messageForError } from '../errors.ts';
import { useAppeal, useCheckin } from '../hooks.ts';
import { needsConversion, PROOF_ACCEPT, validateCompressed, validateProofImage } from '../image-check.ts';
import { canAppeal } from '../permissions.ts';
import type { Assignment } from '../types.ts';

type Phase = 'idle' | 'compressing' | 'sending';

/** Nén ảnh xuống ~1MB. HEIC bắt buộc phải đổi sang JPEG được, nếu không thì báo lỗi; ảnh thường nén lỗi thì gửi ảnh gốc. */
async function prepare(file: File): Promise<File> {
  const convert = needsConversion(file.type);
  try {
    return await compressImage(file, {
      maxSizeMB: 1,
      maxWidthOrHeight: 1600,
      useWebWorker: true,
      ...(convert ? { fileType: 'image/jpeg' } : {}),
    });
  } catch (e) {
    if (convert) throw e;
    return file;
  }
}

export function CheckinForm({
  assignment,
  houseId,
  meUserId,
  onClose,
  inline,
}: {
  assignment: Assignment;
  houseId: string;
  meUserId: string | undefined;
  onClose: () => void;
  /** Nhúng thẳng vào trang (không nằm trong hộp thoại): ẩn nút "Để sau". */
  inline?: boolean;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [phase, setPhase] = useState<Phase>('idle');
  const inputRef = useRef<HTMLInputElement>(null);
  const checkin = useCheckin(houseId);
  const appeal = useAppeal(houseId);
  // Một khóa cho mỗi lần mở: retry mạng / bấm đúp không nộp hai lần.
  const idempotencyKey = useMemo(() => crypto.randomUUID(), []);

  const preview = useMemo(() => (file && !needsConversion(file.type) ? URL.createObjectURL(file) : null), [file]);
  useEffect(
    () => () => {
      if (preview) URL.revokeObjectURL(preview);
    },
    [preview],
  );

  const choose = (picked: File | undefined) => {
    if (!picked) return;
    const problem = validateProofImage(picked);
    setError(problem);
    setFile(problem ? null : picked);
  };

  const fail = (e: unknown) => {
    setPhase('idle');
    if (isStateChanged(e)) {
      toast(messageForError(e));
      onClose();
    } else setError(messageForError(e));
  };

  const submit = async () => {
    if (!file) return;
    setError(null);
    setPhase('compressing');
    let photo: File;
    try {
      photo = await prepare(file);
    } catch {
      setPhase('idle');
      setError(validateCompressed({ type: file.type, size: file.size }) ?? 'Không xử lý được ảnh này, hãy chọn ảnh khác.');
      return;
    }
    const problem = validateCompressed(photo);
    if (problem) {
      setPhase('idle');
      setError(problem);
      return;
    }
    setPhase('sending');
    checkin.mutate(
      { assignmentId: assignment.id, photo, filename: file.name, idempotencyKey },
      {
        onSuccess: (res) => {
          toast(res.verifyMode === 'SELF_ATTESTED' ? 'Đã ghi nhận hoàn thành.' : 'Đã gửi ảnh. Chờ bạn cùng phòng duyệt nhé.');
          onClose();
        },
        onError: fail,
      },
    );
  };

  const sendAppeal = () =>
    appeal.mutate(assignment.id, {
      onSuccess: () => {
        toast('Đã gửi khiếu nại cho trưởng phòng.');
        onClose();
      },
      onError: fail,
    });

  const busy = phase !== 'idle';
  const label = phase === 'compressing' ? 'Đang nén ảnh…' : phase === 'sending' ? 'Đang gửi…' : 'Gửi để duyệt';
  const retriesLeft = Math.max(0, 3 - assignment.rejectCount);

  return (
    <>
      {assignment.status === 'REJECTED' && (
        <div className="mb-4 rounded-btn-sm bg-tom-bg px-3 py-2 text-sm text-tom">
          {assignment.rejectReason && <p>Lý do từ chối: {assignment.rejectReason}</p>}
          <p className="mt-1 text-cap">
            Bạn còn <span className="font-mono">{retriesLeft}</span> lần nộp lại. Quá 3 lần ca sẽ chuyển cho trưởng phòng quyết định.
          </p>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={PROOF_ACCEPT}
        capture="environment"
        className="sr-only"
        tabIndex={-1}
        aria-label="Chọn ảnh minh chứng"
        onChange={(e) => {
          choose(e.target.files?.[0]);
          e.target.value = '';
        }}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className={cn(
          inline ? 'min-h-[120px]' : 'min-h-[200px]',
          'flex w-full flex-col items-center justify-center gap-3 overflow-hidden rounded-card border-2 border-dashed bg-paper-2 p-4 text-center',
          'focus-visible:outline-none focus-visible:shadow-focus',
          error ? 'border-tom' : 'border-line-2',
        )}
      >
        {preview ? (
          <img src={preview} alt="Ảnh minh chứng đã chọn" className={cn(inline ? 'max-h-[160px]' : 'max-h-[260px]', 'w-full rounded-btn-sm object-contain')} />
        ) : file ? (
          <span className="text-sm font-medium text-ink">Đã chọn ảnh HEIC: {file.name}</span>
        ) : (
          <>
            <IconTile icon={<Camera />} tone="hl" size={48} />
            <span className="text-sm font-medium text-ink">Chụp ảnh hoặc chọn từ máy</span>
            <span className="font-mono text-cap text-ink-2">JPG, PNG, WEBP · tối đa 5MB</span>
          </>
        )}
      </button>
      <p className="mt-2 text-cap text-ink-2">Nếu máy không mở camera, hãy chọn ảnh từ thư viện.</p>
      {error && (
        <p role="alert" className="mt-2 rounded-btn-sm bg-tom-bg px-3 py-2 text-sm text-tom">
          {error}
        </p>
      )}

      <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        {canAppeal(assignment, meUserId) && (
          <Button variant="ghost" loading={appeal.isPending} disabled={busy} onClick={sendAppeal}>
            Khiếu nại
          </Button>
        )}
        {!inline && (
          <Button variant="secondary" onClick={onClose} disabled={busy}>
            Để sau
          </Button>
        )}
        <Button leftIcon={<Send />} disabled={!file} loading={busy} onClick={() => void submit()}>
          {label}
        </Button>
      </div>
    </>
  );
}

/** Nộp ảnh minh chứng cho ca của mình (chụp trực tiếp trên điện thoại hoặc chọn ảnh). */
export function CheckinModal({
  assignment,
  houseId,
  meUserId,
  onClose,
}: {
  assignment: Assignment | null;
  houseId: string;
  meUserId: string | undefined;
  onClose: () => void;
}) {
  return (
    <Modal
      open={!!assignment}
      onClose={onClose}
      title={assignment?.status === 'REJECTED' ? 'Làm lại và gửi ảnh' : 'Gửi ảnh minh chứng'}
      description={assignment && `${assignment.choreTitle}. Bạn cùng phòng sẽ xem ảnh rồi duyệt.`}
    >
      {assignment && <CheckinForm key={assignment.id} assignment={assignment} houseId={houseId} meUserId={meUserId} onClose={onClose} />}
    </Modal>
  );
}
