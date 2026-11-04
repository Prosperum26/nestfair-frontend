import { describe, expect, it } from 'vitest';
import { ApiError } from '@/lib/api.ts';
import { assistantErrorMessage, AssistantQuotaError, toAssistantError } from './errors.ts';

describe('assistantErrorMessage', () => {
  it('hết hạn mức chat → câu thân thiện; kèm resetAt thì thêm giờ reset theo giờ VN', () => {
    expect(assistantErrorMessage(new ApiError(429, 'Quota exceeded', 'ASSISTANT_QUOTA_EXCEEDED'))).toBe(
      'Hôm nay bạn đã hỏi đủ 30 câu rồi. Mai mình trò chuyện tiếp nhé.',
    );
    const e = new AssistantQuotaError(new ApiError(429, 'Quota exceeded', 'ASSISTANT_QUOTA_EXCEEDED'), '2026-10-26T00:00:00+07:00');
    expect(assistantErrorMessage(e)).toBe(
      'Hôm nay bạn đã hỏi đủ 30 câu rồi. Mai mình trò chuyện tiếp nhé. Hạn mức đặt lại lúc 00:00 giờ VN.',
    );
  });

  it('resetAt ghi bằng giờ Z vẫn format ra giờ VN', () => {
    const e = new AssistantQuotaError(new ApiError(429, 'x', 'ASSISTANT_QUOTA_EXCEEDED'), '2026-10-25T18:30:00Z');
    expect(assistantErrorMessage(e)).toContain('Hạn mức đặt lại lúc 01:30');
  });

  it('chưa đồng ý gửi chat cho Gemini → hướng dẫn bật', () => {
    expect(assistantErrorMessage(new ApiError(403, 'x', 'ASSISTANT_CONSENT_REQUIRED'))).toBe(
      'Bạn chưa cho phép gửi nội dung trò chuyện tới Google Gemini. Hãy bật ở phần cài đặt trợ lý nhé.',
    );
  });

  it('các mã lỗi nhắc nhở → câu ngắn gọn thân thiện', () => {
    expect(assistantErrorMessage(new ApiError(409, 'x', 'REMINDER_ALREADY_CREATED'))).toBe('Bạn đã tạo nhắc nhở này rồi.');
    expect(assistantErrorMessage(new ApiError(400, 'x', 'REMIND_AT_INVALID'))).toBe(
      'Thời gian nhắc phải sau hiện tại và trong vòng 1 năm tới.',
    );
    expect(assistantErrorMessage(new ApiError(409, 'x', 'REMINDER_ALREADY_SENT'))).toBe('Nhắc nhở này đã gửi rồi nên không sửa được.');
    expect(assistantErrorMessage(new ApiError(403, 'x', 'REMINDER_NOT_DELETABLE'))).toBe('Nhắc của hệ thống không xóa được.');
  });

  it('mã lạ → giữ thông điệp backend; không phải Error → câu dự phòng', () => {
    expect(assistantErrorMessage(new ApiError(400, 'Tin nhắn cần từ 1 đến 1000 ký tự.'))).toBe('Tin nhắn cần từ 1 đến 1000 ký tự.');
    expect(assistantErrorMessage('boom')).toBe('Trợ lý đang bận, thử lại sau ít phút nhé.');
  });
});

describe('toAssistantError', () => {
  it('429 ASSISTANT_QUOTA_EXCEEDED → AssistantQuotaError giữ nguyên statusCode/message/code', () => {
    const out = toAssistantError(new ApiError(429, 'Quota', 'ASSISTANT_QUOTA_EXCEEDED'));
    expect(out).toBeInstanceOf(AssistantQuotaError);
    expect(out).toBeInstanceOf(ApiError);
    expect(out).toMatchObject({ statusCode: 429, message: 'Quota', code: 'ASSISTANT_QUOTA_EXCEEDED', resetAt: null });
  });

  it('ApiError có sẵn resetAt (khi lib api giữ được body lỗi) → nhặt ra mang theo', () => {
    const origin = Object.assign(new ApiError(429, 'Quota', 'ASSISTANT_QUOTA_EXCEEDED'), { resetAt: '2026-10-26T00:00:00+07:00' });
    expect(toAssistantError(origin)).toMatchObject({ resetAt: '2026-10-26T00:00:00+07:00' });
  });

  it('lỗi khác → giữ nguyên đúng đối tượng', () => {
    const keep = new ApiError(403, 'Chưa đồng ý', 'ASSISTANT_CONSENT_REQUIRED');
    expect(toAssistantError(keep)).toBe(keep);
    const plain = new Error('x');
    expect(toAssistantError(plain)).toBe(plain);
  });
});
