import { beforeEach, describe, expect, it } from 'vitest';
import { useWheelStore } from './store.ts';

beforeEach(() => useWheelStore.setState({ open: false, active: null, prefill: null }));

describe('wheel store: mở với tên việc điền sẵn', () => {
  it('openWithPrefill mở modal và giữ tên việc + khóa nút gợi ý', () => {
    useWheelStore.getState().openWithPrefill({ title: 'Cọ WC', sourceKey: 'm1:2' });
    const s = useWheelStore.getState();
    expect(s.open).toBe(true);
    expect(s.prefill).toEqual({ title: 'Cọ WC', sourceKey: 'm1:2' });
  });

  it('đóng modal thì bỏ phần điền sẵn, lần mở sau không dính lại', () => {
    useWheelStore.getState().openWithPrefill({ title: 'Cọ WC', sourceKey: 'm1:2' });
    useWheelStore.getState().close();
    expect(useWheelStore.getState().prefill).toBeNull();
    useWheelStore.getState().openModal();
    expect(useWheelStore.getState().prefill).toBeNull();
  });

  it('openModal thường (nút Vòng quay) không có điền sẵn', () => {
    useWheelStore.getState().openModal();
    expect(useWheelStore.getState()).toMatchObject({ open: true, prefill: null });
  });

  it('clearPrefill chỉ xóa phần điền sẵn, giữ modal đang mở', () => {
    useWheelStore.getState().openWithPrefill({ title: 'Cọ WC', sourceKey: 'm1:2' });
    useWheelStore.getState().clearPrefill();
    expect(useWheelStore.getState()).toMatchObject({ open: true, prefill: null });
  });
});
