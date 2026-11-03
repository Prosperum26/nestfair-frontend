import { describe, expect, it } from 'vitest';
import { expenseFormSchema } from './schemas.ts';
import type { ExpenseFormValues } from './split-preview.ts';

const members = ['hung', 'thien', 'mai', 'quan'];
const schema = expenseFormSchema(members, '2026-10-14');
const valid: ExpenseFormValues = {
  title: 'Pizza tối thứ Bảy',
  date: '2026-10-10',
  totalAmount: 450_000,
  payerId: 'hung',
  category: 'FOOD',
  splitType: 'EQUAL',
  participants: members,
  exact: {},
  note: '',
  receiptImageUrl: null,
};
const errorsOf = (values: Partial<ExpenseFormValues>) => {
  const res = schema.safeParse({ ...valid, ...values });
  return res.success ? [] : res.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`);
};

describe('expenseFormSchema', () => {
  it('hợp lệ với dữ liệu thiết kế 08', () => {
    expect(errorsOf({})).toEqual([]);
  });

  it('tên, ngày, số tiền', () => {
    expect(errorsOf({ title: '   ' })).toEqual(['title: Nhập tên khoản chi.']);
    expect(errorsOf({ date: '2026-02-30' })).toEqual(['date: Nhập ngày đúng dạng dd/mm/yyyy.']);
    expect(errorsOf({ date: '2026-10-15' })).toEqual(['date: Ngày chi không được ở tương lai.']);
    expect(errorsOf({ totalAmount: null })).toEqual(['totalAmount: Nhập số tiền.']);
    expect(errorsOf({ totalAmount: 0 })).toEqual(['totalAmount: Số tiền phải lớn hơn 0.']);
    expect(errorsOf({ totalAmount: 1_000_000_001 })[0]).toMatch(/^totalAmount: Số tiền tối đa/);
  });

  it('CUSTOM / EXACT cần ít nhất một người', () => {
    expect(errorsOf({ splitType: 'CUSTOM', participants: [] })).toEqual(['participants: Chọn ít nhất một người cùng chịu khoản chi.']);
    expect(errorsOf({ splitType: 'EXACT', participants: [] })).toEqual(['participants: Chọn ít nhất một người cùng chịu khoản chi.']);
  });

  it('EXACT lệch tổng (thiết kế 08: còn thiếu 30.000đ) → lỗi ở exact; khớp thì hợp lệ', () => {
    const lacking = { hung: 120_000, thien: 100_000, mai: 100_000, quan: 100_000 };
    expect(errorsOf({ splitType: 'EXACT', exact: lacking })).toEqual(['exact: Tổng các phần phải bằng số tiền hóa đơn thì mới lưu được.']);
    expect(errorsOf({ splitType: 'EXACT', exact: { ...lacking, hung: 150_000 } })).toEqual([]);
  });

  it('EQUAL không quan tâm danh sách tích', () => {
    expect(errorsOf({ splitType: 'EQUAL', participants: [] })).toEqual([]);
  });
});
