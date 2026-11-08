import { QueryClient } from '@tanstack/react-query';
import { describe, expect, it } from 'vitest';
import { optimisticList, patchById, removeById } from './optimistic.ts';

type Row = { id: string; title: string };
const rows = (): Row[] => [
  { id: 'a', title: 'Đổ rác' },
  { id: 'b', title: 'Đóng tiền điện' },
  { id: 'c', title: 'Mua nước' },
];

describe('removeById / patchById', () => {
  it('removeById bỏ đúng phần tử và không đổi mảng gốc', () => {
    const list = rows();
    const next = removeById(list, 'b');
    expect(next?.map((r) => r.id)).toEqual(['a', 'c']);
    expect(list).toHaveLength(3);
    expect(removeById(undefined, 'b')).toBeUndefined();
  });

  it('patchById chỉ đổi phần tử khớp', () => {
    const next = patchById(rows(), 'a', { title: 'Đổ rác tối' });
    expect(next?.map((r) => r.title)).toEqual(['Đổ rác tối', 'Đóng tiền điện', 'Mua nước']);
    expect(patchById(undefined, 'a', { title: 'x' })).toBeUndefined();
  });
});

describe('optimisticList', () => {
  const setup = () => {
    const qc = new QueryClient();
    qc.setQueryData(['reminders', 'list', 'upcoming'], rows());
    qc.setQueryData(['reminders', 'list', 'all'], rows());
    const remove = optimisticList<string, Row>(qc, { queryKey: ['reminders'], apply: (list, id) => removeById(list, id) ?? list, ids: (id) => [id] });
    const ids = (key: string) => qc.getQueryData<Row[]>(['reminders', 'list', key])?.map((r) => r.id);
    return { qc, remove, ids };
  };

  it('áp thay đổi ngay cho mọi query cùng tiền tố', async () => {
    const { remove, ids } = setup();
    await remove.onMutate('b');
    expect(ids('upcoming')).toEqual(['a', 'c']);
    expect(ids('all')).toEqual(['a', 'c']);
  });

  it('lỗi thì khôi phục đúng phần tử đó về vị trí cũ', async () => {
    const { remove, ids } = setup();
    const ctx = await remove.onMutate('b');
    remove.onError(new Error('500'), 'b', ctx);
    expect(ids('upcoming')).toEqual(['a', 'b', 'c']);
  });

  it('hai thao tác liên tiếp, cái đầu lỗi: không hồi sinh cái thứ hai đã xóa', async () => {
    const { remove, ids } = setup();
    const ctxB = await remove.onMutate('b');
    await remove.onMutate('c');
    remove.onError(new Error('500'), 'b', ctxB);
    expect(ids('upcoming')).toEqual(['a', 'b']);
    expect(ids('all')).toEqual(['a', 'b']);
  });

  it('khôi phục bản cũ khi sửa thất bại', async () => {
    const { qc } = setup();
    const patch = optimisticList<{ id: string; title: string }, Row>(qc, {
      queryKey: ['reminders'],
      apply: (list, v) => patchById(list, v.id, { title: v.title }) ?? list,
      ids: (v) => [v.id],
    });
    const ctx = await patch.onMutate({ id: 'a', title: 'Đổ rác tối' });
    expect(qc.getQueryData<Row[]>(['reminders', 'list', 'all'])?.[0].title).toBe('Đổ rác tối');
    patch.onError(new Error('409'), { id: 'a', title: 'Đổ rác tối' }, ctx);
    expect(qc.getQueryData<Row[]>(['reminders', 'list', 'all'])?.[0].title).toBe('Đổ rác');
  });
});
