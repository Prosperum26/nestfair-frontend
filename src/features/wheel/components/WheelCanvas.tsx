import { useEffect, useRef } from 'react';
import { sliceAtPointer } from '../angle.ts';
import { HL, INK, sliceColors } from '../colors.ts';

/**
 * Bánh xe vẽ bằng Canvas (Design.md mục 4): lát xen kẽ màu nhạt/đậm của thành viên, viền ink 1.5, vành 3px ink,
 * tâm ink + chấm hl, kim tam giác hl viền ink ở đỉnh, chữ cái đầu tên trên lát. Co theo khung, tính DPR.
 * `angleAt()` trả góc hiện tại (hàm của giờ server); khi `running` thì vẽ lại mỗi khung hình.
 */
export function WheelCanvas({
  slices,
  initials,
  angleAt,
  running,
  highlight,
  onSliceChange,
  label,
}: {
  slices: string[];
  initials: Record<string, string>;
  angleAt: () => number;
  running: boolean;
  /** Lát trúng (sáng lên khi giảm chuyển động / đã dừng). */
  highlight?: number | null;
  onSliceChange?: (index: number) => void;
  label: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const lastSlice = useRef<number | null>(null);
  const props = useRef({ slices, initials, angleAt, highlight, onSliceChange });
  useEffect(() => {
    props.current = { slices, initials, angleAt, highlight, onSliceChange };
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    let frame = 0;

    const draw = () => {
      const { slices: s, initials: ini, angleAt: at, highlight: hi, onSliceChange: onChange } = props.current;
      const size = Math.max(120, Math.min(wrap.clientWidth, 360));
      const dpr = window.devicePixelRatio || 1;
      if (canvas.width !== Math.round(size * dpr)) {
        canvas.width = Math.round(size * dpr);
        canvas.height = Math.round(size * dpr);
        canvas.style.width = `${size}px`;
        canvas.style.height = `${size}px`;
      }
      const g = canvas.getContext('2d');
      if (!g || s.length === 0) return;
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
      g.clearRect(0, 0, size, size);

      const cx = size / 2;
      const pointerH = size * 0.08;
      const cy = size / 2 + pointerH / 3;
      const r = size / 2 - pointerH / 2 - 4;
      const n = s.length;
      const w = (Math.PI * 2) / n;
      const angle = at();
      const rot = (angle * Math.PI) / 180;

      const current = sliceAtPointer(angle, n);
      if (current !== lastSlice.current) {
        if (lastSlice.current !== null) onChange?.(current);
        lastSlice.current = current;
      }

      g.save();
      g.translate(cx, cy);
      g.rotate(rot);
      for (let i = 0; i < n; i++) {
        // 0 rad của canvas là hướng 3 giờ; lát 0 bắt đầu ở đỉnh (−90°).
        const a0 = -Math.PI / 2 + i * w;
        const { fill, text } = sliceColors(s[i], i);
        g.beginPath();
        g.moveTo(0, 0);
        g.arc(0, 0, r, a0, a0 + w);
        g.closePath();
        g.fillStyle = fill;
        g.fill();
        g.lineWidth = 1.5;
        g.strokeStyle = INK;
        g.stroke();
        if (hi === i) {
          g.fillStyle = 'rgba(245, 213, 71, 0.45)';
          g.fill();
        }
        g.save();
        g.rotate(a0 + w / 2);
        g.fillStyle = text;
        g.font = `700 ${Math.round(size * 0.07)}px Inter, sans-serif`;
        g.textAlign = 'center';
        g.textBaseline = 'middle';
        g.translate(r * 0.66, 0);
        g.rotate(Math.PI / 2);
        g.fillText(ini[s[i]] ?? '?', 0, 0);
        g.restore();
      }
      g.restore();

      // Vành 3px ink.
      g.beginPath();
      g.arc(cx, cy, r, 0, Math.PI * 2);
      g.lineWidth = 3;
      g.strokeStyle = INK;
      g.stroke();
      // Tâm ink + chấm hl.
      g.beginPath();
      g.arc(cx, cy, r * 0.2, 0, Math.PI * 2);
      g.fillStyle = INK;
      g.fill();
      g.beginPath();
      g.arc(cx, cy, r * 0.08, 0, Math.PI * 2);
      g.fillStyle = HL;
      g.fill();
      // Kim tam giác hl viền ink ở đỉnh.
      const top = cy - r - pointerH / 2;
      g.beginPath();
      g.moveTo(cx - pointerH * 0.6, top);
      g.lineTo(cx + pointerH * 0.6, top);
      g.lineTo(cx, top + pointerH);
      g.closePath();
      g.fillStyle = HL;
      g.fill();
      g.lineWidth = 1.5;
      g.strokeStyle = INK;
      g.stroke();
    };

    const loop = () => {
      draw();
      if (running) frame = requestAnimationFrame(loop);
    };
    loop();
    const ro = new ResizeObserver(() => draw());
    ro.observe(wrap);
    return () => {
      cancelAnimationFrame(frame);
      ro.disconnect();
    };
  }, [running, slices, highlight]);

  return (
    <div ref={wrapRef} className="flex w-full justify-center">
      <canvas ref={canvasRef} role="img" aria-label={label} />
    </div>
  );
}
