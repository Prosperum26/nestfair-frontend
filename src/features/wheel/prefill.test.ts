import { describe, expect, it } from 'vitest';
import { readWheelPrefill } from './prefill.ts';

describe('readWheelPrefill: đọc router state do nút gợi ý của Trợ lý gửi sang', () => {
  it('state hợp lệ → trả tên việc và khóa nút', () => {
    expect(readWheelPrefill({ wheelPrefill: { title: 'Cọ WC', sourceKey: 'm1:2' } })).toEqual({ title: 'Cọ WC', sourceKey: 'm1:2' });
  });

  it('tên việc rỗng vẫn hợp lệ (người dùng tự gõ)', () => {
    expect(readWheelPrefill({ wheelPrefill: { title: '', sourceKey: 'm1:0' } })).toEqual({ title: '', sourceKey: 'm1:0' });
  });

  it.each([null, undefined, 'x', 3, {}, { wheelPrefill: null }, { wheelPrefill: { title: 1, sourceKey: 'a' } }, { wheelPrefill: { title: 'a' } }])(
    'state lạ %j → null, không mở modal',
    (state) => {
      expect(readWheelPrefill(state)).toBeNull();
    },
  );
});
