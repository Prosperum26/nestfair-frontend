export interface FaqItem {
  question: string;
  answer: string;
}

export const FAQ_ITEMS: FaqItem[] = [
  {
    question: 'NestFair có giữ tiền của nhà mình không?',
    answer:
      'Không. NestFair chỉ ghi sổ và tạo mã VietQR; tiền chuyển thẳng giữa tài khoản ngân hàng của các bạn.',
  },
  {
    question: 'Chia lẻ không tròn thì sao?',
    answer:
      'Phần lẻ 1–2 đồng được cộng lần lượt cho từng người từ đầu danh sách, nên tổng các phần luôn bằng đúng tổng hóa đơn.',
  },
  {
    question: 'Ai duyệt việc nhà đã làm?',
    answer:
      'Bạn cùng phòng. Người làm gửi ảnh làm bằng chứng, một bạn khác trong nhà bấm duyệt. Quá hạn mà chưa ai làm thì ca được tính là quá hạn.',
  },
  {
    question: 'Rời nhà khi còn nợ được không?',
    answer:
      'Chỉ rời được khi số dư của bạn về 0, tức là đã trả hết hoặc đã nhận đủ. Lịch sử chi tiêu của nhà vẫn được giữ nguyên sau khi bạn rời.',
  },
];

/** Accordion chỉ mở một câu một lúc: bấm câu đang mở thì đóng, bấm câu khác thì chuyển sang câu đó. */
export function nextOpenIndex(current: number | null, clicked: number): number | null {
  return current === clicked ? null : clicked;
}
