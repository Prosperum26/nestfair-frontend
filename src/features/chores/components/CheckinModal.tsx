import imageCompression from 'browser-image-compression';
import { Camera, Send } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/Button.tsx';
import { IconTile } from '@/components/ui/IconTile.tsx';
import { Modal } from '@/components/ui/Modal.tsx';
import { cn } from '@/lib/cn.ts';
import { useCheckin } from '../hooks.ts';
import { MAX_PROOF_BYTES, PROOF_ACCEPT, validateProofImage } from '../image-check.ts';
import type { Assignment } from '../types.ts';

/** Nén ảnh xuống ~1MB để gửi nhanh; nén lỗi thì gửi ảnh gốc (vẫn bị kiểm tra 5MB). */
async function prepare(file: File): Promise<File> {
  try {
    return await imageCompression(file, { maxSizeMB: 1, maxWidthOrHeight: 1600, useWebWorker: true });
  } catch {
    return file;
  }
}

function CheckinForm({
  assignment,
  houseId,
  onClose,
}: {
  assignment: Assignment;
  houseId: string;
  onClose: () => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [preparing, setPreparing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const checkin = useCheckin(houseId);

  const preview = useMemo(() => (file ? URL.createObjectURL(file) : null), [file]);
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

  const submit = async () => {
    if (!file) return;
    setPreparing(true);
    const photo = await prepare(file);
    setPreparing(false);
    if (photo.size > MAX_PROOF_BYTES) {
      setError('Ảnh tối đa 5MB.');
      return;
    }
    checkin.mutate(
      { assignmentId: assignment.id, photo, filename: file.name },
      {
        onSuccess: () => {
          toast('Đã gửi ảnh. Chờ bạn cùng phòng duyệt nhé.');
          onClose();
        },
        onError: (e) => toast(e.message),
      },
    );
  };

  const busy = preparing || checkin.isPending;

  return (
    <>
      {assignment.status === 'REJECTED' && assignment.rejectReason && (
        <p className="mb-4 rounded-btn-sm bg-tom-bg px-3 py-2 text-sm text-tom">Lý do từ chối: {assignment.rejectReason}</p>
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
          'flex min-h-[200px] w-full flex-col items-center justify-center gap-3 overflow-hidden rounded-card border-2 border-dashed bg-paper-2 p-4 text-center',
          'focus-visible:outline-none focus-visible:shadow-focus',
          error ? 'border-tom' : 'border-line-2',
        )}
      >
        {preview ? (
          <img src={preview} alt="Ảnh minh chứng đã chọn" className="max-h-[260px] w-full rounded-btn-sm object-contain" />
        ) : (
          <>
            <IconTile icon={<Camera />} tone="hl" size={48} />
            <span className="text-sm font-medium text-ink">Chụp ảnh hoặc chọn từ máy</span>
            <span className="font-mono text-cap text-ink-2">JPG, PNG, WEBP · tối đa 5MB</span>
          </>
        )}
      </button>
      {error && (
        <p role="alert" className="mt-2 text-cap text-tom">
          {error}
        </p>
      )}

      <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Button variant="secondary" onClick={onClose} disabled={busy}>
          Để sau
        </Button>
        <Button leftIcon={<Send />} disabled={!file} loading={busy} onClick={() => void submit()}>
          Gửi để duyệt
        </Button>
      </div>
    </>
  );
}

/** Nộp ảnh minh chứng cho ca của mình (chụp trực tiếp trên điện thoại hoặc chọn ảnh). */
export function CheckinModal({
  assignment,
  houseId,
  onClose,
}: {
  assignment: Assignment | null;
  houseId: string;
  onClose: () => void;
}) {
  return (
    <Modal
      open={!!assignment}
      onClose={onClose}
      title={assignment?.status === 'REJECTED' ? 'Làm lại và gửi ảnh' : 'Gửi ảnh minh chứng'}
      description={assignment && `${assignment.choreTitle}. Bạn cùng phòng sẽ xem ảnh rồi duyệt.`}
    >
      {assignment && <CheckinForm key={assignment.id} assignment={assignment} houseId={houseId} onClose={onClose} />}
    </Modal>
  );
}
