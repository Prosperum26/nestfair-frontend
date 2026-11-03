import type { LegalDoc } from './types.ts';

/** Bản nháp: nhóm sẽ rà soát lại nội dung trước khi nộp. */
export const PRIVACY: LegalDoc = {
  title: 'Chính sách quyền riêng tư',
  updated: '03.11.2026',
  intro:
    'Chính sách này giải thích NestFair thu thập dữ liệu gì, dùng để làm gì, chia sẻ với ai và bạn kiểm soát nó ra sao. NestFair là đồ án học tập của nhóm sinh viên UIT, nên chúng tôi chỉ thu thập những gì ứng dụng cần để hoạt động.',
  sections: [
    {
      id: 'chung-toi-la-ai',
      title: 'Ai chịu trách nhiệm về dữ liệu của bạn',
      paragraphs: [
        'Nhóm phát triển NestFair (đồ án môn MSIS207, Trường Đại học Công nghệ Thông tin, ĐHQG-HCM) vận hành ứng dụng và là bên xử lý dữ liệu của bạn. Bạn liên hệ nhóm qua trang Liên hệ.',
      ],
    },
    {
      id: 'du-lieu-thu-thap',
      title: 'Dữ liệu chúng tôi thu thập',
      items: [
        'Tài khoản: họ tên, email, ảnh đại diện (nếu đăng nhập bằng Google) và mật khẩu đã được mã hóa một chiều.',
        'Nhà và thành viên: tên nhà, vai trò, thời điểm vào và rời nhà, thông tin ngân hàng bạn tự nhập để tạo mã VietQR.',
        'Chi tiêu và thanh toán: khoản chi, cách chia, số dư, các lần báo chuyển tiền và ảnh bằng chứng bạn đính kèm.',
        'Việc nhà: lịch trực, ảnh làm bằng chứng, kết quả duyệt, yêu cầu đổi ca và vòng quay.',
        'Trợ lý AI: tin nhắn trò chuyện và các nhắc nhở bạn tạo.',
        'Hóa đơn: ảnh hóa đơn bạn tải lên để quét và bản nháp nội dung đọc được.',
        'Kỹ thuật: nhật ký lỗi và thông tin phiên đăng nhập cần cho bảo mật.',
      ],
    },
    {
      id: 'muc-dich',
      title: 'Chúng tôi dùng dữ liệu để làm gì',
      paragraphs: ['Chúng tôi không bán dữ liệu của bạn và không hiển thị quảng cáo. Dữ liệu chỉ được dùng để:'],
      items: [
        'Cung cấp các tính năng bạn dùng: chia tiền, rút gọn nợ, lịch việc nhà, nhắc nhở.',
        'Đồng bộ thời gian thực cho cả nhà khi có thay đổi.',
        'Bảo vệ tài khoản và ngăn lạm dụng.',
        'Sửa lỗi và cải thiện ứng dụng trong khuôn khổ đồ án.',
      ],
    },
    {
      id: 'chia-se',
      title: 'Chia sẻ với bên thứ ba',
      paragraphs: ['NestFair dùng một số dịch vụ bên ngoài để vận hành. Chúng tôi chỉ gửi đi phần dữ liệu cần thiết:'],
      items: [
        'Google Gemini: nhận ảnh hóa đơn khi bạn quét, và nội dung chat khi bạn hỏi trợ lý. Chỉ gửi sau khi bạn đồng ý riêng cho từng tính năng; bạn có thể từ chối và vẫn nhập tay.',
        'Cloudinary: lưu ảnh bạn tải lên (hóa đơn, bằng chứng, ảnh đại diện).',
        'Google (đăng nhập): xác thực khi bạn chọn đăng nhập bằng Google.',
        'Nhà cung cấp máy chủ và cơ sở dữ liệu: lưu trữ dữ liệu của ứng dụng.',
        'VietQR: mã QR được tạo từ số tiền, tài khoản người nhận và nội dung chuyển khoản; NestFair không nhận lại thông tin giao dịch từ ngân hàng.',
      ],
    },
    {
      id: 'ai-thay-gi',
      title: 'Ai trong nhà nhìn thấy gì',
      items: [
        'Thành viên cùng nhà thấy chi tiêu, số dư, lịch việc nhà và hoạt động của nhà.',
        'Tin nhắn với Trợ lý AI là riêng tư: chỉ bạn xem được, kể cả trưởng phòng.',
        'Ảnh bằng chứng việc nhà chỉ hiển thị cho thành viên trong nhà.',
        'Trang tin đăng công khai (khi ra mắt) không hiển thị email, số tài khoản hay họ tên thành viên; lịch trực hiển thị ẩn danh.',
      ],
    },
    {
      id: 'luu-tru',
      title: 'Lưu trữ và xóa dữ liệu',
      paragraphs: [
        'Khi bạn rời nhà, chúng tôi không xóa bạn khỏi lịch sử chi tiêu để số liệu của cả nhà vẫn khớp; bạn chỉ được đánh dấu là đã rời. Bảng tin hoạt động của nhà chỉ giữ trong 30 ngày.',
        'Bạn có thể yêu cầu xóa tài khoản và dữ liệu cá nhân bằng cách liên hệ nhóm. Phần số liệu chi tiêu chung của nhà có thể được giữ ở dạng không gắn với danh tính của bạn.',
      ],
    },
    {
      id: 'bao-mat',
      title: 'Cách chúng tôi bảo vệ dữ liệu',
      items: [
        'Mật khẩu được băm bằng bcrypt, không lưu dạng gốc.',
        'Phiên đăng nhập dùng mã truy cập ngắn hạn; mã làm mới nằm trong cookie httpOnly và được xoay vòng mỗi lần dùng.',
        'Mỗi yêu cầu trong nhà đều được kiểm tra bạn có thuộc nhà đó không.',
        'Ảnh tải lên chỉ nhận định dạng JPEG, PNG, WebP và tối đa 5MB.',
        'Dữ liệu được truyền qua kết nối mã hóa HTTPS.',
      ],
      paragraphs: ['Không hệ thống nào an toàn tuyệt đối. Nếu phát hiện sự cố, chúng tôi sẽ thông báo cho người bị ảnh hưởng.'],
    },
    {
      id: 'cookie',
      title: 'Cookie và bộ nhớ trình duyệt',
      paragraphs: [
        'NestFair dùng cookie đăng nhập (httpOnly) để giữ phiên của bạn. Trình duyệt cũng lưu vài lựa chọn tiện ích như kiểu xem lịch hay trạng thái đã bấm gợi ý. Chúng tôi không dùng cookie quảng cáo hay theo dõi.',
      ],
    },
    {
      id: 'quyen-cua-ban',
      title: 'Quyền của bạn',
      items: [
        'Xem và sửa thông tin hồ sơ của bạn ngay trong ứng dụng.',
        'Từ chối gửi ảnh hóa đơn hoặc nội dung chat cho Gemini; các tính năng đó sẽ chuyển sang nhập tay hoặc tạm khóa.',
        'Yêu cầu xuất hoặc xóa dữ liệu cá nhân qua email liên hệ.',
        'Đăng xuất bất cứ lúc nào để thu hồi phiên trên thiết bị.',
      ],
    },
    {
      id: 'thay-doi-chinh-sach',
      title: 'Thay đổi chính sách',
      paragraphs: [
        'Khi ứng dụng thêm tính năng mới (ví dụ tin đăng tìm người ở ghép) chúng tôi sẽ cập nhật chính sách này và ghi rõ ngày cập nhật ở đầu trang.',
      ],
    },
    {
      id: 'lien-he',
      title: 'Liên hệ',
      paragraphs: ['Mọi câu hỏi về quyền riêng tư, bạn gửi email cho nhóm phát triển tại trang Liên hệ. Chúng tôi cố gắng phản hồi trong vòng vài ngày làm việc.'],
    },
  ],
};
