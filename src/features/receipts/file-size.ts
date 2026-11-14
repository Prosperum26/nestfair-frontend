/** "0,8MB": một chữ số thập phân, dấu phẩy kiểu Việt (chỉ dùng cho dung lượng, không dùng cho tiền). */
export function formatFileSize(bytes: number): string {
  return `${(bytes / (1024 * 1024)).toFixed(1).replace('.', ',')}MB`;
}
