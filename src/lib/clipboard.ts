import { toast } from 'sonner';

/** Sao chép rồi báo toast; trình duyệt chặn clipboard thì hiện nội dung để người dùng tự chép. */
export async function copyText(text: string, success: string): Promise<void> {
  try {
    await navigator.clipboard.writeText(text);
    toast(success);
  } catch {
    toast(text);
  }
}
