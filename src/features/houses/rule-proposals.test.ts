import { describe, expect, it } from 'vitest';
import { ApiError } from '@/lib/api.ts';
import { proposalErrorMessage, proposalStatusChip, proposalTitle, ruleProposalSchema } from './rule-proposals.ts';

describe('ruleProposalSchema', () => {
  it('ADD cần nội dung, cắt khoảng trắng; lý do rỗng thành undefined', () => {
    expect(ruleProposalSchema.parse({ kind: 'ADD', content: '  Khách báo trước ', reason: ' ' })).toEqual({
      kind: 'ADD',
      content: 'Khách báo trước',
      reason: undefined,
    });
    expect(ruleProposalSchema.safeParse({ kind: 'ADD', content: ' ', reason: '' }).error?.issues[0].message).toBe(
      'Nhập nội dung điều muốn thêm.',
    );
  });

  it('EDIT cần nội dung khác điều cũ', () => {
    const r = ruleProposalSchema.safeParse({ kind: 'EDIT', targetText: 'Rửa chén ngay', content: 'Rửa chén ngay', reason: '' });
    expect(r.error?.issues[0].message).toBe('Nội dung mới giống hệt điều cũ.');
    expect(ruleProposalSchema.safeParse({ kind: 'EDIT', targetText: 'Rửa chén ngay', content: '', reason: '' }).success).toBe(false);
  });

  it('REMOVE không cần nội dung, bỏ nội dung khi gửi', () => {
    expect(ruleProposalSchema.parse({ kind: 'REMOVE', targetText: 'Rửa chén ngay', content: 'gì đó', reason: 'Thừa' })).toEqual({
      kind: 'REMOVE',
      targetText: 'Rửa chén ngay',
      content: undefined,
      reason: 'Thừa',
    });
  });

  it('nội dung và lý do tối đa 200 ký tự', () => {
    expect(ruleProposalSchema.safeParse({ kind: 'ADD', content: 'a'.repeat(201), reason: '' }).success).toBe(false);
    expect(ruleProposalSchema.safeParse({ kind: 'ADD', content: 'a', reason: 'a'.repeat(201) }).success).toBe(false);
  });
});

describe('proposalTitle', () => {
  it.each([
    [{ kind: 'ADD', content: 'Khách báo trước', targetText: null }, 'Thêm điều mới'],
    [{ kind: 'EDIT', content: 'Rửa chén trong 30 phút', targetText: 'Rửa chén ngay' }, 'Sửa một điều'],
    [{ kind: 'REMOVE', content: null, targetText: 'Rửa chén ngay' }, 'Bỏ một điều'],
  ] as const)('%o -> %s', (p, title) => {
    expect(proposalTitle(p)).toBe(title);
  });
});

describe('proposalStatusChip', () => {
  it('nhãn và tone theo trạng thái', () => {
    expect(proposalStatusChip('PENDING')).toEqual({ label: 'Chờ duyệt', tone: 'yellow' });
    expect(proposalStatusChip('APPROVED')).toEqual({ label: 'Đã áp dụng', tone: 'mint' });
    expect(proposalStatusChip('REJECTED')).toEqual({ label: 'Bị từ chối', tone: 'tom' });
    expect(proposalStatusChip('WITHDRAWN')).toEqual({ label: 'Đã rút lại', tone: 'neutral' });
  });
});

describe('proposalErrorMessage', () => {
  it('lỗi có mã dùng thông báo của backend, lỗi lạ có câu mặc định', () => {
    expect(proposalErrorMessage(new ApiError(409, 'Bạn đang có 3 đề xuất chờ duyệt.', 'TOO_MANY_PENDING'))).toBe(
      'Bạn đang có 3 đề xuất chờ duyệt.',
    );
    expect(proposalErrorMessage(new Error('boom'))).toBe('Không gửi được, thử lại sau ít phút.');
  });
});
