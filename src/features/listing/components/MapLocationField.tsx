import { ExternalLink, Link2, LocateFixed, X } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/Button.tsx';
import { Field } from '@/components/ui/Field.tsx';
import { Input } from '@/components/ui/Input.tsx';
import { geolocationErrorMessage, isGoogleMapsUrl, mapsUrlFromCoords } from '../map-location.ts';

const GEO_TIMEOUT_MS = 10_000;

/**
 * Link bản đồ của tin đăng: dán link Google Maps, hoặc lấy vị trí hiện tại (tọa độ làm tròn ~100m rồi mới thành
 * link, để trang công khai không chỉ đúng căn nhà). Chỉ link đã qua luật kiểm mới được đưa thành thẻ `<a>`.
 */
export function MapLocationField({ value, onChange, error }: { value: string; onChange: (next: string) => void; error?: string }) {
  const [locating, setLocating] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);
  const trimmed = value.trim();
  const previewable = isGoogleMapsUrl(trimmed);

  const locate = () => {
    setGeoError(null);
    if (!('geolocation' in navigator)) {
      setGeoError(geolocationErrorMessage('unsupported'));
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocating(false);
        onChange(mapsUrlFromCoords(pos.coords.latitude, pos.coords.longitude));
      },
      (err) => {
        setLocating(false);
        setGeoError(geolocationErrorMessage(err.code));
      },
      { enableHighAccuracy: false, timeout: GEO_TIMEOUT_MS, maximumAge: 60_000 },
    );
  };

  return (
    <Field
      label="Link bản đồ (không bắt buộc)"
      htmlFor="listing-map-url"
      error={error ?? geoError ?? undefined}
      hint="Dán link Google Maps, hoặc lấy vị trí hiện tại. Vị trí hiện tại được làm tròn khoảng 100m để không lộ đúng căn nhà."
    >
      <Input
        id="listing-map-url"
        type="url"
        inputMode="url"
        leftIcon={<Link2 />}
        placeholder="https://maps.app.goo.gl/..."
        autoComplete="off"
        invalid={!!error}
        value={value}
        onChange={(e) => {
          setGeoError(null);
          onChange(e.target.value);
        }}
      />
      <div className="flex flex-wrap items-center gap-2">
        <Button variant="secondary" size="sm" leftIcon={<LocateFixed />} loading={locating} onClick={locate}>
          Lấy vị trí hiện tại
        </Button>
        {previewable && (
          <a
            href={trimmed}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-9 items-center gap-1.5 rounded-btn-sm px-2 text-btns font-semibold text-ink underline decoration-[1.5px] underline-offset-[3px] focus-visible:shadow-focus focus-visible:outline-none [&_svg]:size-4"
          >
            <ExternalLink aria-hidden />
            Xem thử
          </a>
        )}
        {trimmed !== '' && (
          <Button
            variant="ghost"
            size="sm"
            leftIcon={<X />}
            onClick={() => {
              setGeoError(null);
              onChange('');
            }}
          >
            Xóa link
          </Button>
        )}
      </div>
    </Field>
  );
}
