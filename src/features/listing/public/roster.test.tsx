import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import type { PublicRoster } from '../types.ts';
import { RosterTable } from './RosterTable.tsx';
import { rosterNote, rosterStats } from './roster.ts';

const none: string[] = [];
/** Ví dụ theo ảnh 21: 13 ca, 4 nhãn. Số ca: TV1 = 3, TV2 = 2, TV3 = 4, TV4 = 4. */
const roster: PublicRoster = {
  weekKey: '2026-W41',
  rows: [
    { title: 'Rửa chén', cells: [['TV1'], ['TV2'], ['TV3'], ['TV4'], ['TV1'], ['TV2'], ['TV3']] },
    { title: 'Đổ rác', cells: [['TV4'], none, none, ['TV3'], none, none, none] },
    { title: 'Tưới cây', cells: [none, ['TV3'], none, none, ['TV4'], none, none] },
    { title: 'Lau nhà', cells: [none, none, none, none, none, ['TV4'], none] },
    { title: 'Nhà tắm', cells: [none, none, none, none, none, none, ['TV1']] },
  ],
};

describe('rosterStats', () => {
  it('đếm số ca mỗi nhãn: số người, ít nhất, nhiều nhất', () => {
    expect(rosterStats(roster)).toEqual({ members: 4, minShifts: 2, maxShifts: 4 });
  });

  it('một ô có hai nhãn thì mỗi nhãn được tính một ca', () => {
    const shared: PublicRoster = { weekKey: 'w', rows: [{ title: 'Rửa chén', cells: [['TV1', 'TV2'], none, none, none, none, none, none] }] };
    expect(rosterStats(shared)).toEqual({ members: 2, minShifts: 1, maxShifts: 1 });
  });

  it('bảng rỗng thì members = 0', () => {
    expect(rosterStats({ weekKey: 'w', rows: [] })).toEqual({ members: 0, minShifts: 0, maxShifts: 0 });
    expect(rosterStats({ weekKey: 'w', rows: [{ title: 'Rửa chén', cells: [none, none, none, none, none, none, none] }] })).toEqual({
      members: 0,
      minShifts: 0,
      maxShifts: 0,
    });
  });
});

describe('rosterNote', () => {
  it('số ca khác nhau thì ghi khoảng min–max', () => {
    expect(rosterNote({ members: 4, minShifts: 3, maxShifts: 4 })).toBe('Tên thành viên được ẩn. Mỗi người trực khoảng 3–4 ca/tuần.');
  });

  it('cùng số ca thì ghi một số', () => {
    expect(rosterNote({ members: 4, minShifts: 3, maxShifts: 3 })).toBe('Tên thành viên được ẩn. Mỗi người trực khoảng 3 ca/tuần.');
  });

  it('chưa có ca nào thì chỉ nói tên được ẩn', () => {
    expect(rosterNote({ members: 0, minShifts: 0, maxShifts: 0 })).toBe('Tên thành viên được ẩn.');
  });
});

describe('RosterTable', () => {
  it('có đủ cột T2…CN, tên việc, tiêu đề, chip Ẩn danh và câu chú thích', () => {
    const html = renderToStaticMarkup(<RosterTable roster={roster} />);
    for (const day of ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN']) expect(html).toContain(`>${day}<`);
    expect(html).toContain('Lịch trực tuần này');
    expect(html).toContain('VIỆC NHÀ XOAY VÒNG CÔNG BẰNG');
    expect(html).toContain('Ẩn danh');
    for (const title of ['Rửa chén', 'Đổ rác', 'Tưới cây', 'Lau nhà', 'Nhà tắm']) expect(html).toContain(title);
    expect(html).toContain('Tên thành viên được ẩn. Mỗi người trực khoảng 2–4 ca/tuần.');
  });

  it('chỉ hiện đúng các nhãn server trả (TV1…), ô trống là dấu gạch, không có họ tên', () => {
    const html = renderToStaticMarkup(<RosterTable roster={roster} />);
    const labels = [...html.matchAll(/>(TV\d+)</g)].map((m) => m[1]);
    expect(labels).toHaveLength(13);
    expect(new Set(labels)).toEqual(new Set(['TV1', 'TV2', 'TV3', 'TV4']));
    expect(html).toContain('—');
    expect(html).not.toContain('Trần Minh Hùng');
  });

  it('roster = null thì không render gì', () => {
    expect(renderToStaticMarkup(<RosterTable roster={null} />)).toBe('');
  });

  it('roster không có dòng nào thì cũng ẩn hẳn thẻ', () => {
    expect(renderToStaticMarkup(<RosterTable roster={{ weekKey: 'w', rows: [] }} />)).toBe('');
  });
});
