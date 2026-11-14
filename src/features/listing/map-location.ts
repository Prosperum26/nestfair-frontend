/** Link bản đồ của tin đăng: tối đa 500 ký tự (khớp backend). */
export const MAP_URL_MAX = 500;

/** Host chỉ nhận khi đường dẫn bắt đầu bằng `/maps` (google.com còn có Search, Gmail...). */
const MAPS_PATH_HOSTS = new Set(['google.com', 'www.google.com', 'google.com.vn', 'www.google.com.vn']);
/** Host chỉ dành cho bản đồ. */
const MAPS_ONLY_HOSTS = new Set(['maps.google.com', 'maps.app.goo.gl']);

/**
 * Link Google Maps hợp lệ (cùng luật với `isGoogleMapsUrl` của backend): https, không user/mật khẩu, không cổng
 * riêng, so khớp nguyên host nên `google.com.evil.com` bị loại.
 */
export function isGoogleMapsUrl(value: string): boolean {
  if (value.length === 0 || value.length > MAP_URL_MAX) return false;
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return false;
  }
  if (url.protocol !== 'https:' || url.username || url.password || url.port) return false;
  const host = url.hostname.toLowerCase();
  if (MAPS_ONLY_HOSTS.has(host)) return true;
  if (host === 'goo.gl') return url.pathname.startsWith('/maps/');
  return MAPS_PATH_HOSTS.has(host) && (url.pathname === '/maps' || url.pathname.startsWith('/maps/'));
}

/** Làm tròn 3 chữ số thập phân (~110m): đủ biết khu vực, không chỉ đúng căn nhà trên trang công khai. */
export function roundCoord(value: number): number {
  const rounded = Math.round(value * 1000) / 1000;
  return Object.is(rounded, -0) ? 0 : rounded;
}

/** Link tìm kiếm Google Maps tới tọa độ đã làm tròn. */
export function mapsUrlFromCoords(latitude: number, longitude: number): string {
  return `https://www.google.com/maps/search/?api=1&query=${roundCoord(latitude)},${roundCoord(longitude)}`;
}

/** Câu báo lỗi theo mã của Geolocation API (1 bị từ chối, 2 không xác định được, 3 quá thời gian). */
export function geolocationErrorMessage(code: number | 'unsupported'): string {
  if (code === 'unsupported') return 'Trình duyệt này không hỗ trợ lấy vị trí. Bạn dán link Google Maps vào ô bên dưới nhé.';
  if (code === 1) return 'Bạn chưa cho phép quyền vị trí. Hãy bật quyền vị trí cho trang này rồi thử lại, hoặc dán link Google Maps.';
  if (code === 3) return 'Lấy vị trí quá lâu. Thử lại ở nơi có sóng tốt hơn, hoặc dán link Google Maps.';
  return 'Không xác định được vị trí hiện tại. Thử lại sau, hoặc dán link Google Maps.';
}
