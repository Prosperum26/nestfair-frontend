import { describe, expect, it } from 'vitest';
import { draftToReviewValues, prefillItemsFromReview, receiptFlags, receiptReviewSchema, type ReviewFormValues, toItemizedInput } from './draft-form.ts';
import type { ReceiptDraft } from './types.ts';

const members = ['hung', 'thien', 'mai', 'quan'];
const TODAY = '2026-10-20';

const draft = (over: Partial<ReceiptDraft> = {}): ReceiptDraft => ({
  merchant: 'Bách Hóa Xanh',
  purchasedAt: '2026-10-06',
  items: [
    { name: 'Trứng gà hộp 10', quantity: 1, lineTotal: 32_000, uncertain: false, note: null },
    { name: 'Sữa tươi 1L', quantity: 2, lineTotal: 64_000, uncertain: true, note: 'Số lượng bị mờ' },
  ],
  total: 96_000,
  warnings: [],
  ...over,
});

describe('draftToReviewValues', () => {
  const ctx = { memberIds: members, meId: 'thien', today: TODAY };

  it('điền sẵn từ bản nháp: tên = cửa hàng, ngày mua, người trả là mình, danh mục Ăn uống', () => {
    const v = draftToReviewValues(draft(), ctx);
    expect(v).toMatchObject({ title: 'Bách Hóa Xanh', date: '2026-10-06', totalAmount: 96_000, payerId: 'thien', category: 'FOOD', note: '' });
  });

  it('món chắc chắn gán cả nhà; món AI không chắc để trống và buộc người dùng chọn (D11)', () => {
    const { items } = draftToReviewValues(draft(), ctx);
    expect(items[0]).toEqual({ name: 'Trứng gà hộp 10', quantity: 1, lineTotal: 32_000, userIds: members, uncertain: false, note: null });
    expect(items[1]).toEqual({ name: 'Sữa tươi 1L', quantity: 2, lineTotal: 64_000, userIds: [], uncertain: true, note: 'Số lượng bị mờ' });
  });

  it('người trả: không phải thành viên hoặc chưa đăng nhập thì lấy người đầu tiên', () => {
    expect(draftToReviewValues(draft(), { ...ctx, meId: 'nguoi-la' }).payerId).toBe('hung');
    expect(draftToReviewValues(draft(), { ...ctx, meId: undefined }).payerId).toBe('hung');
  });

  it('thiếu ngày hoặc ngày ở tương lai thì dùng hôm nay (form không cho ngày tương lai)', () => {
    expect(draftToReviewValues(draft({ purchasedAt: null }), ctx).date).toBe(TODAY);
    expect(draftToReviewValues(draft({ purchasedAt: '2026-10-21' }), ctx).date).toBe(TODAY);
  });

  it('cửa hàng rỗng thì tên khoản chi để trống cho người dùng nhập', () => {
    expect(draftToReviewValues(draft({ merchant: '' }), ctx).title).toBe('');
  });

  it('mảng món là bản sao, sửa form không đổi bản nháp gốc', () => {
    const d = draft();
    const v = draftToReviewValues(d, ctx);
    v.items[0].name = 'đã sửa';
    expect(d.items[0].name).toBe('Trứng gà hộp 10');
  });
});

describe('receiptReviewSchema', () => {
  const schema = receiptReviewSchema(members, TODAY);
  const base = (): ReviewFormValues => ({
    title: 'Bách Hóa Xanh',
    date: '2026-10-06',
    totalAmount: 96_000,
    payerId: 'hung',
    category: 'FOOD',
    note: '',
    items: [
      { name: 'Trứng gà hộp 10', quantity: 1, lineTotal: 32_000, userIds: members, uncertain: false, note: null },
      { name: 'Sữa tươi 1L', quantity: 2, lineTotal: 64_000, userIds: ['mai'], uncertain: true, note: null },
    ],
  });
  const errorsOf = (over: Partial<ReviewFormValues>) => {
    const res = schema.safeParse({ ...base(), ...over });
    return res.success ? [] : res.error.issues.map((i) => i.path.join('.') + ': ' + i.message);
  };

  it('hợp lệ với dữ liệu đầy đủ', () => {
    expect(errorsOf({})).toEqual([]);
  });

  it('tên, ngày, tổng tiền', () => {
    expect(errorsOf({ title: '   ' })).toEqual(['title: Nhập tên cửa hàng hoặc khoản chi.']);
    expect(errorsOf({ date: '2026-10-21' })).toEqual(['date: Ngày chi không được ở tương lai.']);
    expect(errorsOf({ date: '2026-02-30' })).toEqual(['date: Nhập ngày đúng dạng dd/mm/yyyy.']);
    expect(errorsOf({ totalAmount: null })).toEqual(expect.arrayContaining(['totalAmount: Nhập số tiền.']));
    expect(errorsOf({ totalAmount: 0 })).toEqual(expect.arrayContaining(['totalAmount: Số tiền phải lớn hơn 0.']));
    expect(errorsOf({ totalAmount: 1_000_000_001 })[0]).toMatch(/^totalAmount: Số tiền tối đa/);
  });

  it('phải có ít nhất một món, tối đa 100 món', () => {
    expect(errorsOf({ items: [] })).toEqual(['items: Cần ít nhất một món.']);
    const many = Array.from({ length: 101 }, () => ({ name: 'm', quantity: 1, lineTotal: 1_000, userIds: ['hung'], uncertain: false, note: null }));
    expect(errorsOf({ items: many, totalAmount: 101_000 })).toEqual(expect.arrayContaining(['items: Tối đa 100 món.']));
  });

  it('món chưa gán ai báo ngay tại món đó [RF5]', () => {
    const items = base().items;
    items[1].userIds = [];
    expect(errorsOf({ items })).toEqual(['items.1.userIds: Chọn ít nhất một người cho món này.']);
  });

  it('món thiếu tên, tiền rỗng / 0 / âm / lẻ báo tại món đó [RF5]', () => {
    const bad = (patch: object) => {
      const items = base().items;
      Object.assign(items[0], patch);
      return errorsOf({ items });
    };
    expect(bad({ name: '  ' })).toEqual(['items.0.name: Nhập tên món.']);
    expect(bad({ lineTotal: null })).toContain('items.0.lineTotal: Nhập tiền món.');
    expect(bad({ lineTotal: 0 })).toContain('items.0.lineTotal: Tiền món phải lớn hơn 0.');
    expect(bad({ lineTotal: -5_000 })).toContain('items.0.lineTotal: Tiền món phải lớn hơn 0.');
    expect(bad({ lineTotal: 1_500.5 })).toContain('items.0.lineTotal: Tiền món phải là số nguyên VNĐ.');
  });

  it('tổng món lệch tổng hóa đơn vẫn hợp lệ: phần chênh được chia theo tỷ lệ', () => {
    expect(errorsOf({ totalAmount: 90_000 })).toEqual([]);
    expect(errorsOf({ totalAmount: 110_000 })).toEqual([]);
  });
});

describe('toItemizedInput', () => {
  const values = {
    title: '  Bách Hóa Xanh ',
    date: '2026-10-06',
    totalAmount: 96_000,
    payerId: 'hung',
    category: 'FOOD' as const,
    note: ' ',
    items: [
      { name: ' Trứng gà ', quantity: 1, lineTotal: 32_000, userIds: members, uncertain: false, note: null },
      { name: 'Sữa tươi', quantity: 2, lineTotal: 64_000, userIds: ['mai'], uncertain: true, note: 'mờ' },
    ],
  };

  it('ITEMIZED kèm items, receiptScanId và ảnh của scan; không có participantIds / splits', () => {
    const input = toItemizedInput(values, { scanId: 'scan-1', imageUrl: 'https://res.cloudinary.com/x/a.png' });
    expect(input).toEqual({
      title: 'Bách Hóa Xanh',
      category: 'FOOD',
      totalAmount: 96_000,
      payerId: 'hung',
      splitType: 'ITEMIZED',
      items: [
        { name: 'Trứng gà', lineTotal: 32_000, userIds: members },
        { name: 'Sữa tươi', lineTotal: 64_000, userIds: ['mai'] },
      ],
      receiptScanId: 'scan-1',
      spentAt: '2026-10-06T12:00:00+07:00',
      note: null,
      receiptImageUrl: 'https://res.cloudinary.com/x/a.png',
    });
    expect(input).not.toHaveProperty('participantIds');
    expect(input).not.toHaveProperty('splits');
  });

  it('không có scanId (engine OCR cục bộ) thì không gửi receiptScanId', () => {
    const input = toItemizedInput(values, { scanId: null, imageUrl: 'https://res.cloudinary.com/x/a.png' });
    expect(input).not.toHaveProperty('receiptScanId');
    expect(input.receiptImageUrl).toBe('https://res.cloudinary.com/x/a.png');
  });

  it('ghi chú có nội dung thì gửi đã cắt khoảng trắng', () => {
    expect(toItemizedInput({ ...values, note: ' mua cho cả nhà ' }, { scanId: null, imageUrl: 'u' }).note).toBe('mua cho cả nhà');
  });
});

describe('receiptFlags: ô nào tô vàng từ cảnh báo ban đầu', () => {
  const w = (code: ReceiptDraft['warnings'][number]['code']) => ({ code, message: 'x' });

  it('lệch tổng → ô tổng; thiếu hoặc sai ngày → ô ngày', () => {
    expect(receiptFlags(draft({ warnings: [w('ITEMS_TOTAL_MISMATCH')] }))).toEqual({ total: true, date: false });
    expect(receiptFlags(draft({ warnings: [w('DATE_MISSING')] }))).toEqual({ total: false, date: true });
    expect(receiptFlags(draft({ warnings: [w('DATE_IN_FUTURE')] }))).toEqual({ total: false, date: true });
  });

  it('không cảnh báo, hoặc chỉ ghi chú của AI / dòng bị bỏ, thì không bật cờ nào', () => {
    expect(receiptFlags(draft())).toEqual({ total: false, date: false });
    expect(receiptFlags(draft({ warnings: [w('AI_NOTE'), w('DROPPED_ITEMS')] }))).toEqual({ total: false, date: false });
  });
});

describe("prefillItemsFromReview", () => {
  const item = (name: string, lineTotal: number | null) => ({ name, lineTotal });

  it("bỏ món tên rỗng hoặc tiền trống / 0 / âm, và cắt khoảng trắng tên", () => {
    expect(prefillItemsFromReview([item("  Trứng  ", 32_000), item("   ", 5_000), item("Sữa", null), item("Túi", 0), item("Giảm", -100)])).toEqual([
      { name: "Trứng", lineTotal: 32_000 },
    ]);
  });

  it("giữ thứ tự và cắt tối đa 100 món", () => {
    const many = Array.from({ length: 120 }, (_, i) => item("Món " + i, 1_000 + i));
    const out = prefillItemsFromReview(many);
    expect(out).toHaveLength(100);
    expect(out[0]).toEqual({ name: "Món 0", lineTotal: 1_000 });
    expect(out[99]).toEqual({ name: "Món 99", lineTotal: 1_099 });
  });
});
