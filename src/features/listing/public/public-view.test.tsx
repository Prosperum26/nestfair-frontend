import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { ContactBar } from './ContactBar.tsx';
import { CostBreakdown } from './CostBreakdown.tsx';
import { ListingUnavailable } from './ListingUnavailable.tsx';
import { PublicListingView } from './PublicListingView.tsx';
import type { PublicListingOpen } from '../types.ts';

describe('ContactBar', () => {
  it('contact = null thì không render gì: không tel: và không zalo.me', () => {
    const html = renderToStaticMarkup(<ContactBar contact={null} />);
    expect(html).toBe('');
  });

  it('có số thì có link Zalo (mở tab mới, noopener) và link gọi', () => {
    const html = renderToStaticMarkup(<ContactBar contact={{ phone: '0901234567' }} />);
    expect(html).toContain('href="tel:0901234567"');
    expect(html).toContain('href="https://zalo.me/0901234567"');
    expect(html).toContain('target="_blank"');
    expect(html).toContain('rel="noopener noreferrer"');
    expect(html).toContain('Nhắn Zalo');
  });
});

describe('ListingUnavailable', () => {
  it.each([
    ['notfound', 'Tin không còn khả dụng'],
    ['full', 'Phòng đã đủ người'],
    ['closed', 'Tin đã đóng'],
  ] as const)('kiểu %s có tiêu đề đúng và liên kết Về NestFair', (kind, title) => {
    const html = renderToStaticMarkup(<ListingUnavailable kind={kind} />);
    expect(html).toContain(title);
    expect(html).toContain('Về NestFair');
    expect(html).not.toContain('tel:');
    expect(html).not.toContain('zalo.me');
  });
});

describe('CostBreakdown', () => {
  const base = {
    rentPerMonth: 1_200_000,
    otherFees: [
      { name: 'Wifi', amount: 60_000 },
      { name: 'Gửi xe', amount: 100_000 },
    ],
    summary: {
      memberCount: 4,
      maxMembers: 5,
      slotsOpen: 1,
      utilities: { avgMonthlyTotal: 1_275_000, perPerson: 255_000, monthsUsed: 3 },
    },
    estimatedPerPerson: 1_615_000,
  };

  it('có từng dòng và dòng Tổng ước tính đúng số', () => {
    const html = renderToStaticMarkup(<CostBreakdown {...base} />);
    expect(html).toContain('Chi phí chi tiết');
    expect(html).toContain('Tiền thuê');
    expect(html).toContain('1.200.000đ');
    expect(html).toContain('Điện nước (TB 3 tháng)');
    expect(html).toContain('255.000đ');
    expect(html).toContain('Wifi');
    expect(html).toContain('Gửi xe');
    expect(html).toContain('Tổng ước tính');
    expect(html).toContain('1.615.000đ');
    expect(html).not.toContain('chưa có dữ liệu');
  });

  it('chưa có điện nước thì có dòng "chưa có dữ liệu" và không cộng điện nước vào tổng', () => {
    const html = renderToStaticMarkup(
      <CostBreakdown {...base} summary={{ ...base.summary, utilities: null }} estimatedPerPerson={1_360_000} />,
    );
    expect(html).toContain('Điện nước');
    expect(html).toContain('chưa có dữ liệu');
    expect(html).toContain('1.360.000đ');
    expect(html).not.toContain('255.000đ');
  });
});

describe('PublicListingView', () => {
  const listing: PublicListingOpen = {
    slug: 'x7Kp2QmA',
    status: 'OPEN',
    closeReason: null,
    publishedAt: '2026-10-04T05:00:00.000Z',
    locationText: 'Hẻm 51 Linh Trung, Thủ Đức',
    genderWanted: 'ANY',
    rentPerMonth: 1_200_000,
    otherFees: [{ name: 'Wifi', amount: 60_000 }],
    summary: {
      memberCount: 4,
      maxMembers: 5,
      slotsOpen: 1,
      utilities: { avgMonthlyTotal: 1_275_000, perPerson: 255_000, monthsUsed: 3 },
    },
    estimatedPerPerson: 1_515_000,
    description: 'Phòng 28m²\n<b>tầng 2</b>',
    roommateExpectations: 'Sạch sẽ',
    photos: { BEDROOM: [], BATHROOM: [], LIVING: [] },
    roster: null,
    contact: { phone: '0901234567' },
  };
  const render = (l: PublicListingOpen = listing) => renderToStaticMarkup(<PublicListingView listing={l} />);

  it('tiêu đề "Còn 1 chỗ ở ghép" có đúng một vệt bút dạ trên "1 chỗ"', () => {
    const html = render();
    expect(html).toContain('Còn ');
    expect(html).toContain('1 chỗ</span>');
    expect(html.match(/rounded-\[2px\] bg-hl/g)).toHaveLength(1);
  });

  it('overline ĐĂNG dd.mm.yyyy, vị trí, giá và câu "đã gồm" đúng', () => {
    const html = render();
    expect(html).toContain('ĐĂNG 04.10.2026');
    expect(html).toContain('Hẻm 51 Linh Trung, Thủ Đức');
    expect(html).toContain('1.515.000đ');
    expect(html).toContain('Đã gồm tiền thuê, điện nước trung bình và wifi.');
  });

  it('mô tả hiện là chữ thuần (không dựng HTML), giữ xuống dòng bằng whitespace-pre-line', () => {
    const html = render();
    expect(html).toContain('whitespace-pre-line');
    expect(html).toContain('&lt;b&gt;tầng 2&lt;/b&gt;');
    expect(html).not.toContain('<b>');
  });

  it('mô tả hoặc mong muốn rỗng thì ẩn mục đó', () => {
    const html = render({ ...listing, description: '  ', roommateExpectations: '' });
    expect(html).not.toContain('Mô tả');
    expect(html).not.toContain('Mong muốn về bạn cùng phòng');
  });

  it('roster = null thì không có thẻ Lịch trực; có roster thì có thẻ', () => {
    expect(render()).not.toContain('Lịch trực tuần này');
    const roster = { weekKey: '2026-W41', rows: [{ title: 'Rửa chén', cells: [['TV1'], [], [], [], [], [], []] }] };
    expect(render({ ...listing, roster })).toContain('Lịch trực tuần này');
  });

  it('mỗi liên kết liên hệ có ở thanh đáy (di động) và thẻ phải (desktop); id không trùng', () => {
    const html = render();
    expect(html.match(/href="https:\/\/zalo\.me\/0901234567"/g)).toHaveLength(2);
    const ids = [...html.matchAll(/ id="([^"]+)"/g)].map((m) => m[1]);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
