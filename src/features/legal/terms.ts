import type { LegalDoc } from './types.ts';

/** Bản nháp: nhóm sẽ rà soát lại nội dung trước khi nộp. */
export const TERMS: LegalDoc = {
  title: 'Điều khoản sử dụng',
  updated: '03.11.2026',
  intro:
    'NestFair là sổ chung cho nhà trọ sinh viên, được xây dựng như đồ án môn MSIS207 tại UIT. Khi tạo tài khoản hoặc dùng NestFair, bạn đồng ý với các điều khoản dưới đây. Chúng tôi viết ngắn gọn, dễ hiểu và chỉ nói về những gì ứng dụng thật sự làm.',
  sections: [
    {
      id: 'gioi-thieu',
      title: 'NestFair là gì',
      paragraphs: [
        'NestFair giúp những người ở chung ghi chi tiêu, chia tiền, xoay vòng việc nhà, rút gọn nợ qua lại và hỏi trợ lý AI về chuyện sinh hoạt.',
        'NestFair là dự án học tập, không phải dịch vụ tài chính hay ngân hàng, và có thể thay đổi hoặc ngừng hoạt động khi đồ án kết thúc.',
      ],
    },
    {
      id: 'tai-khoan',
      title: 'Tài khoản của bạn',
      paragraphs: ['Bạn đăng ký bằng email và mật khẩu, hoặc bằng tài khoản Google. Để dùng NestFair, bạn cần:'],
      items: [
        'Cung cấp thông tin đúng và tự bảo quản mật khẩu của mình.',
        'Chịu trách nhiệm cho mọi hoạt động diễn ra dưới tài khoản của bạn.',
        'Báo cho chúng tôi nếu nghi ngờ tài khoản bị người khác dùng.',
      ],
    },
    {
      id: 'nha-va-thanh-vien',
      title: 'Nhà và thành viên',
      paragraphs: [
        'Mỗi nhà có một trưởng phòng (Admin) và các thành viên. Người mới vào nhà bằng mã mời 6 ký tự do thành viên trong nhà chia sẻ, vì vậy hãy chỉ gửi mã cho người bạn tin tưởng.',
        'Trưởng phòng có thêm quyền quản lý nhà như đổi cài đặt, xử lý ca việc có tranh chấp. Thành viên chỉ rời nhà được khi số dư của họ bằng 0.',
      ],
    },
    {
      id: 'chi-tieu-va-no',
      title: 'Chi tiêu, chia tiền và rút gọn nợ',
      paragraphs: [
        'NestFair chỉ ghi sổ và tính toán. NestFair không giữ tiền, không chuyển tiền và không đứng ra bảo đảm khoản nợ nào giữa các thành viên.',
      ],
      items: [
        'Mọi số tiền là số nguyên đồng VNĐ; tổng các phần chia luôn bằng đúng tổng khoản chi.',
        'Kết quả rút gọn nợ là gợi ý đường trả ngắn nhất dựa trên dữ liệu các bạn đã nhập.',
        'Mã VietQR chỉ là cách điền sẵn số tiền và nội dung. Việc chuyển khoản diễn ra trong ứng dụng ngân hàng của bạn.',
        'Một khoản chỉ được tính là đã trả khi người nhận bấm xác nhận đã nhận tiền.',
        'Hãy kiểm tra lại số tiền và tài khoản người nhận trước khi chuyển. Mọi tranh chấp tiền bạc là việc giữa các thành viên với nhau.',
      ],
    },
    {
      id: 'viec-nha',
      title: 'Việc nhà và đổi ca',
      paragraphs: [
        'Lịch việc nhà tự xoay vòng theo quy tắc công bằng. Bạn gửi ảnh làm bằng chứng và bạn cùng phòng duyệt. Bạn có thể đổi ca, nhờ trực dùm hoặc đăng lên Chợ ca theo các quy tắc hiển thị trong ứng dụng.',
        'Điểm chăm chỉ chỉ để xem, không có giá trị quy đổi thành tiền hay phần thưởng.',
      ],
    },
    {
      id: 'tro-ly-va-ocr',
      title: 'Trợ lý AI và quét hóa đơn',
      paragraphs: [
        'Trợ lý AI và tính năng quét hóa đơn dùng mô hình Gemini của Google. Chúng chỉ đưa ra gợi ý hoặc bản nháp, không bao giờ tự ghi dữ liệu thay bạn: bạn xem lại và bấm xác nhận thì dữ liệu mới được lưu.',
      ],
      items: [
        'AI có thể sai. Hãy kiểm tra số tiền, ngày và tên món trước khi lưu khoản chi.',
        'Lời khuyên của trợ lý chỉ mang tính tham khảo, không thay thế tư vấn pháp lý, y tế hay kỹ thuật.',
        'Có giới hạn số lượt dùng mỗi ngày để tránh lạm dụng.',
        'Ảnh hóa đơn và nội dung chat chỉ được gửi cho Gemini sau khi bạn đồng ý.',
      ],
    },
    {
      id: 'noi-dung-cua-ban',
      title: 'Nội dung bạn đăng tải',
      paragraphs: [
        'Ảnh hóa đơn, ảnh bằng chứng và nội dung bạn nhập vẫn thuộc về bạn. Bạn cho phép NestFair lưu và hiển thị chúng cho những thành viên trong nhà để ứng dụng hoạt động.',
        'Chỉ đăng tải nội dung bạn có quyền sử dụng, không chứa thông tin nhạy cảm của người khác.',
      ],
    },
    {
      id: 'hanh-vi-khong-duoc-phep',
      title: 'Điều bạn không được làm',
      items: [
        'Dùng NestFair để lừa đảo, quấy rối hoặc đe dọa người khác.',
        'Cố truy cập dữ liệu của nhà khác hoặc làm gián đoạn hệ thống.',
        'Tải lên ảnh vi phạm pháp luật hoặc xâm phạm quyền riêng tư của người khác.',
        'Dùng công cụ tự động để gửi hàng loạt yêu cầu tới hệ thống.',
      ],
    },
    {
      id: 'tin-dang-o-ghep',
      title: 'Tin đăng tìm người ở ghép',
      paragraphs: [
        'Tính năng này sắp ra mắt. Khi có, tin đăng công khai sẽ không hiển thị email, số tài khoản hay họ tên thành viên. Bạn tự chịu trách nhiệm về nội dung tin mình đăng và về việc gặp gỡ, thỏa thuận với người liên hệ.',
      ],
    },
    {
      id: 'mien-tru',
      title: 'Giới hạn trách nhiệm',
      paragraphs: [
        'NestFair được cung cấp theo hiện trạng, không kèm cam kết về độ sẵn sàng liên tục hay kết quả tuyệt đối. Trong phạm vi pháp luật cho phép, nhóm phát triển không chịu trách nhiệm cho thiệt hại phát sinh từ việc nhập sai dữ liệu, chuyển khoản nhầm, tranh chấp giữa các thành viên hoặc gián đoạn dịch vụ.',
      ],
    },
    {
      id: 'thay-doi-dieu-khoan',
      title: 'Thay đổi điều khoản',
      paragraphs: [
        'Chúng tôi có thể cập nhật điều khoản này. Ngày cập nhật gần nhất luôn ghi ở đầu trang. Nếu bạn tiếp tục dùng NestFair sau khi điều khoản đổi, bạn được xem là đồng ý với bản mới.',
      ],
    },
    {
      id: 'lien-he',
      title: 'Liên hệ',
      paragraphs: ['Có thắc mắc về điều khoản, bạn gửi email cho nhóm phát triển tại trang Liên hệ.'],
    },
  ],
};
