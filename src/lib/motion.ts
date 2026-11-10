import type { Transition, Variants } from 'motion/react';

/**
 * Nguồn duy nhất cho thời lượng, easing và variants (spec UX 08.11, mục 4.1).
 * Component không viết số giây rời; CSS dùng biến `--dur-*` / `--ease-*` khai báo cùng giá trị trong index.css.
 */
export const duration = { fast: 0.12, base: 0.2, slow: 0.32 } as const;

type Bezier = [number, number, number, number];
export const ease: { out: Bezier; in: Bezier } = { out: [0.2, 0, 0, 1], in: [0.4, 0, 1, 1] };

/** Lò xo ngắn chỉ cho hiệu ứng "đóng dấu". */
export const spring = { stamp: { type: 'spring', stiffness: 520, damping: 22 } } as const satisfies Record<string, Transition>;

/** Dịch chuyển tối đa khi xuất hiện (luật "Sổ Chung": không quá 8px). */
export const distance = { sm: 4, md: 8 } as const;

/** Hiệu ứng theo cuộn: chạy một lần khi 1/4 khối đã vào khung nhìn. */
export const viewport = { once: true, amount: 0.25 } as const;

const bezier =([a, b, c, d]: Bezier) => `cubic-bezier(${a}, ${b}, ${c}, ${d})`;

export const cssMotionVars = {
  '--dur-fast': `${duration.fast * 1000}ms`,
  '--dur-base': `${duration.base * 1000}ms`,
  '--dur-slow': `${duration.slow * 1000}ms`,
  '--ease-out': bezier(ease.out),
  '--ease-in': bezier(ease.in),
} as const;

const enter: Transition = { duration: duration.base, ease: ease.out };
const leave: Transition = { duration: duration.fast, ease: ease.in };

export const variants = {
  /** Nội dung vừa tải xong (thay chỗ skeleton). */
  fadeUp: {
    hidden: { opacity: 0, y: distance.sm },
    visible: { opacity: 1, y: 0, transition: enter },
  },
  /** Phần tử danh sách: vào trượt nhẹ, ra thu chiều cao. */
  listItem: {
    hidden: { opacity: 0, y: distance.sm },
    visible: { opacity: 1, y: 0, height: 'auto', transition: enter },
    exit: { opacity: 0, height: 0, transition: leave },
  },
  /** Dòng bảng (`<tr>` không co chiều cao được): chỉ mờ dần. */
  rowItem: {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: enter },
    exit: { opacity: 0, transition: leave },
  },
  /** Nội dung trang mới (chỉ vào, không chờ trang cũ ra). */
  pageEnter: {
    hidden: { opacity: 0, y: distance.sm },
    visible: { opacity: 1, y: 0, transition: { duration: duration.slow, ease: ease.out } },
  },
  /** Vệt bút dạ quang kéo từ trái sang (đặt `originX: 0` ở style). */
  markerSweep: {
    hidden: { scaleX: 0 },
    visible: { scaleX: 1, transition: { duration: duration.slow, ease: ease.out } },
  },
  /** Thẻ minh họa rơi nhẹ vào chỗ. */
  dropIn: {
    hidden: { opacity: 0, y: -distance.md },
    visible: { opacity: 1, y: 0, transition: { duration: duration.slow, ease: ease.out } },
  },
  /** Đường nối SVG được vẽ ra. */
  drawLine: {
    hidden: { pathLength: 0, opacity: 0 },
    visible: { pathLength: 1, opacity: 1, transition: { duration: duration.slow, ease: ease.out } },
  },
  /** Khối cha: các khối con (dùng variant hidden/visible) hiện lần lượt. */
  staggerGroup: {
    hidden: {},
    visible: { transition: { staggerChildren: 0.08 } },
  },
  /** Con dấu đóng xuống (ngoại lệ duy nhất được scale > 1). */
  stampIn: {
    hidden: { opacity: 0, scale: 1.4, rotate: -8 },
    visible: { opacity: 1, scale: 1, rotate: -8, transition: spring.stamp },
  },
} satisfies Record<string, Variants>;
