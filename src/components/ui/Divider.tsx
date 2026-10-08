/** Đường kẻ ngang có chữ ở giữa ("hoặc"). */
export function Divider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3" role="separator">
      <span className="h-px flex-1 bg-line" />
      <span className="text-cap text-ink-2">{label}</span>
      <span className="h-px flex-1 bg-line" />
    </div>
  );
}
