import { describe, expect, it } from 'vitest';
import { houseTabOptions, parseHouseTab } from './tabs.ts';

describe('parseHouseTab', () => {
  it('trưởng phòng mặc định vào tab Nhà', () => {
    expect(parseHouseTab(null, true)).toBe('house');
  });

  it('trưởng phòng mở được tab Việc nhà qua ?tab=chores', () => {
    expect(parseHouseTab('chores', true)).toBe('chores');
  });

  it('giá trị lạ thì về tab mặc định', () => {
    expect(parseHouseTab('abc', true)).toBe('house');
    expect(parseHouseTab('', true)).toBe('house');
  });

  it('thành viên thường chỉ có tab Việc nhà, kể cả khi xin tab Nhà', () => {
    expect(parseHouseTab(null, false)).toBe('chores');
    expect(parseHouseTab('house', false)).toBe('chores');
  });
});

describe('houseTabOptions', () => {
  it('trưởng phòng có hai tab, thành viên thường không có thanh tab', () => {
    expect(houseTabOptions(true).map((o) => o.value)).toEqual(['house', 'chores']);
    expect(houseTabOptions(false)).toEqual([]);
  });
});
