const KEY = 'nf-wheel-sound';

/** Lựa chọn bật/tắt tiếng đã lưu; chưa chọn thì null (mặc định: bật cho người quay, tắt cho người xem). */
export function readSoundPref(): boolean | null {
  try {
    const v = localStorage.getItem(KEY);
    return v === 'on' ? true : v === 'off' ? false : null;
  } catch {
    return null;
  }
}

export function writeSoundPref(on: boolean) {
  try {
    localStorage.setItem(KEY, on ? 'on' : 'off');
  } catch {
    // Trình duyệt chặn lưu trữ: chỉ giữ trong phiên.
  }
}

let ctx: AudioContext | null = null;

/** Tiếng "tích" ngắn (Web Audio). Chỉ tạo AudioContext sau tương tác của người dùng (LW-21). */
export function tick(pitch = 1) {
  try {
    ctx ??= new AudioContext();
    if (ctx.state === 'suspended') void ctx.resume();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'square';
    osc.frequency.value = 900 * pitch;
    gain.gain.setValueAtTime(0.06, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.04);
    osc.connect(gain).connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.05);
  } catch {
    // Không có Web Audio: bỏ qua tiếng.
  }
}
