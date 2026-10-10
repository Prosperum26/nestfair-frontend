export type StrengthScore = 0 | 1 | 2 | 3 | 4;

export const STRENGTH_LABELS: Record<StrengthScore, string> = {
  0: '',
  1: 'Yếu',
  2: 'Trung bình',
  3: 'Khá mạnh',
  4: 'Mạnh',
};

/**
 * Điểm 0–4 cho thanh độ mạnh ở màn Đăng ký. Chỉ để gợi ý trực quan;
 * điều kiện bắt buộc (≥ 8 ký tự, có chữ hoa và số) do Zod + backend kiểm tra.
 */
export function passwordStrength(password: string): StrengthScore {
  if (!password) return 0;
  const checks = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /\d/.test(password),
    /[^A-Za-z0-9]/.test(password) || password.length >= 14,
  ];
  const passed = checks.filter(Boolean).length;
  // Chưa đủ 8 ký tự thì tối đa "Yếu".
  return (password.length < 8 ? Math.min(passed, 1) : passed) as StrengthScore;
}
