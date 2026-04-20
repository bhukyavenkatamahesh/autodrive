import { ReactNode } from 'react';

const wrap = (children: ReactNode) => (
  <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
    {children}
  </svg>
);

export const brandLogos: Record<string, ReactNode> = {
  'Maruti Suzuki': wrap(
    <>
      <rect x="4" y="4" width="56" height="56" rx="14" stroke="currentColor" strokeWidth="2.5" />
      <path d="M16 44 L24 20 L32 36 L40 20 L48 44" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </>,
  ),

  Hyundai: wrap(
    <>
      <ellipse cx="32" cy="32" rx="26" ry="16" stroke="currentColor" strokeWidth="2.5" />
      <path d="M16 32 Q32 22 48 32" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      <path d="M22 30 L26 38 M38 30 L42 38" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </>,
  ),

  Tata: wrap(
    <>
      <circle cx="32" cy="32" r="26" stroke="currentColor" strokeWidth="2.5" />
      <path d="M14 32 Q32 14 50 32" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      <circle cx="32" cy="34" r="4" fill="currentColor" />
    </>,
  ),

  Honda: wrap(
    <>
      <rect x="6" y="10" width="52" height="44" rx="10" stroke="currentColor" strokeWidth="2.5" />
      <path d="M18 18 V46 M46 18 V46 M18 32 H46" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </>,
  ),

  Toyota: wrap(
    <>
      <ellipse cx="32" cy="32" rx="26" ry="18" stroke="currentColor" strokeWidth="2.5" />
      <ellipse cx="32" cy="32" rx="14" ry="18" stroke="currentColor" strokeWidth="2.5" />
      <ellipse cx="32" cy="24" rx="18" ry="8" stroke="currentColor" strokeWidth="2.5" />
    </>,
  ),

  Kia: wrap(
    <>
      <rect x="4" y="18" width="56" height="28" rx="6" stroke="currentColor" strokeWidth="2.5" />
      <path d="M18 40 V24 M18 32 L28 24 M18 32 L28 40" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M34 40 V24" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" />
      <path d="M42 40 L46 24 L50 40 M43.5 34 H48.5" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
    </>,
  ),

  Mahindra: wrap(
    <>
      <path d="M32 6 L58 20 V44 L32 58 L6 44 V20 Z" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M18 42 V24 L32 38 L46 24 V42" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
    </>,
  ),

  BMW: wrap(
    <>
      <circle cx="32" cy="32" r="26" stroke="currentColor" strokeWidth="2.5" />
      <circle cx="32" cy="32" r="18" stroke="currentColor" strokeWidth="1.5" />
      <path d="M32 14 A18 18 0 0 1 50 32 L32 32 Z" fill="currentColor" opacity="0.85" />
      <path d="M32 50 A18 18 0 0 1 14 32 L32 32 Z" fill="currentColor" opacity="0.85" />
    </>,
  ),
};

export default brandLogos;
