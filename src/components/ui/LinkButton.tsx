import type { ReactNode } from 'react';
import { Link, type LinkProps } from 'react-router';
import { cn } from '@/lib/cn.ts';
import { buttonClass } from './button-class.ts';

type ButtonStyle = Parameters<typeof buttonClass>[0];

/** Liên kết điều hướng trong app nhưng trông như nút (không lồng <button> trong <a>). */
export function LinkButton({
  variant,
  size,
  fullWidth,
  leftIcon,
  rightIcon,
  className,
  children,
  ...props
}: LinkProps & ButtonStyle & { leftIcon?: ReactNode; rightIcon?: ReactNode }) {
  return (
    <Link className={cn(buttonClass({ variant, size, fullWidth }), className)} {...props}>
      {leftIcon}
      {children}
      {rightIcon}
    </Link>
  );
}
