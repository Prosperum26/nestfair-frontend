import { Eye, EyeOff, Lock } from 'lucide-react';
import { type ComponentProps, useState } from 'react';
import { Input } from './Input.tsx';

type PasswordInputProps = Omit<
  ComponentProps<typeof Input>,
  'type' | 'leftIcon' | 'rightSlot'
>;

export function PasswordInput(props: PasswordInputProps) {
  const [visible, setVisible] = useState(false);
  return (
    <Input
      {...props}
      type={visible ? 'text' : 'password'}
      leftIcon={<Lock />}
      rightSlot={
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
          aria-pressed={visible}
          className="-mr-1 flex size-8 shrink-0 items-center justify-center rounded-btn-sm text-ink-2 hover:bg-paper-2 focus-visible:outline-none focus-visible:shadow-focus [&_svg]:size-[18px]"
        >
          {visible ? <EyeOff /> : <Eye />}
        </button>
      }
    />
  );
}
