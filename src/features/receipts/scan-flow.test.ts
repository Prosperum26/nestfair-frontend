import { describe, expect, it } from 'vitest';
import { type ScanAction, type Stage, scanFlowReducer } from './scan-flow.ts';
import type { ReceiptScanResult } from './types.ts';

const draftResult: ReceiptScanResult = {
  scanId: 's1',
  imageUrl: 'https://res.cloudinary.com/demo/a.png',
  latencyMs: 2100,
  mode: 'DRAFT',
  reason: null,
  message: null,
  draft: { merchant: 'BHX', purchasedAt: '2026-10-06', items: [], total: 245_000, warnings: [] },
};
const manualResult: ReceiptScanResult = {
  ...draftResult,
  scanId: 's2',
  mode: 'MANUAL',
  reason: 'NOT_A_RECEIPT',
  message: 'Ảnh này không giống hóa đơn. Bạn thử chụp lại hoặc nhập tay nhé.',
  draft: null,
};

const started = (requestId: number): ScanAction => ({ type: 'started', requestId, previewUrl: 'blob:p' + requestId, fileName: 'bill.jpg', sizeBytes: 800_000 });
const run = (state: Stage, ...actions: ScanAction[]) => actions.reduce(scanFlowReducer, state);
const PICK: Stage = { kind: 'pick' };

describe('scanFlowReducer', () => {
  it('chọn ảnh → đang quét, nhớ requestId, ảnh xem trước và tên file', () => {
    expect(run(PICK, started(1))).toEqual({ kind: 'scanning', requestId: 1, previewUrl: 'blob:p1', fileName: 'bill.jpg', sizeBytes: 800_000 });
  });

  it('quét xong có bản nháp → màn xác nhận, giữ ảnh xem trước', () => {
    const s = run(PICK, started(1), { type: 'succeeded', requestId: 1, result: draftResult });
    expect(s).toMatchObject({ kind: 'review', previewUrl: 'blob:p1', fileName: 'bill.jpg', result: { scanId: 's1', mode: 'DRAFT' } });
  });

  it('server trả MANUAL → màn thất bại mang theo result và câu giải thích của server [RF1]', () => {
    const s = run(PICK, started(1), { type: 'succeeded', requestId: 1, result: manualResult });
    expect(s).toMatchObject({ kind: 'failed', previewUrl: 'blob:p1', result: { scanId: 's2' }, message: manualResult.message });
  });

  it('MANUAL mà thiếu message thì dùng câu mặc định, không để trống', () => {
    const s = run(PICK, started(1), { type: 'succeeded', requestId: 1, result: { ...manualResult, message: null } });
    expect(s.kind === 'failed' && s.message.length).toBeGreaterThan(10);
  });

  it('lỗi HTTP / mạng / hết hạn mức → màn thất bại với result null', () => {
    const s = run(PICK, started(1), { type: 'errored', requestId: 1, message: 'Nhà bạn đã dùng hết 20 lượt quét hôm nay.' });
    expect(s).toMatchObject({ kind: 'failed', previewUrl: 'blob:p1', result: null, message: 'Nhà bạn đã dùng hết 20 lượt quét hôm nay.' });
  });

  it('bấm Hủy khi đang quét → về chọn ảnh; phản hồi đến muộn sau đó bị bỏ, không tự nhảy sang xác nhận [RF2]', () => {
    const afterCancel = run(PICK, started(1), { type: 'cancelled' });
    expect(afterCancel).toEqual(PICK);
    expect(scanFlowReducer(afterCancel, { type: 'succeeded', requestId: 1, result: draftResult })).toEqual(PICK);
    expect(scanFlowReducer(afterCancel, { type: 'errored', requestId: 1, message: 'x' })).toEqual(PICK);
  });

  it('phản hồi của lần quét cũ không ghi đè lần quét mới [RF2]', () => {
    const s = run(PICK, started(1), { type: 'cancelled' }, started(2), { type: 'succeeded', requestId: 1, result: draftResult });
    expect(s).toMatchObject({ kind: 'scanning', requestId: 2 });
    const done = scanFlowReducer(s, { type: 'succeeded', requestId: 2, result: draftResult });
    expect(done.kind).toBe('review');
  });

  it('Hủy khi không phải đang quét thì không đổi gì', () => {
    const review = run(PICK, started(1), { type: 'succeeded', requestId: 1, result: draftResult });
    expect(scanFlowReducer(review, { type: 'cancelled' })).toBe(review);
  });

  it('chụp lại (reset) từ màn thất bại hoặc xác nhận → về chọn ảnh', () => {
    const failed = run(PICK, started(1), { type: 'errored', requestId: 1, message: 'x' });
    expect(scanFlowReducer(failed, { type: 'reset' })).toEqual(PICK);
    const review = run(PICK, started(2), { type: 'succeeded', requestId: 2, result: draftResult });
    expect(scanFlowReducer(review, { type: 'reset' })).toEqual(PICK);
  });
});
