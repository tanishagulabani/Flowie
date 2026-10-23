import React, { ReactNode } from 'react';

interface Props {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  noPad?: boolean;
  className?: string;
}

export function PageWrapper({ children, title, subtitle, noPad, className = '' }: Props) {
  return (
    <div
      className={`min-h-dvh pb-24 ${noPad ? '' : 'px-4'} ${className}`}
      style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
    >
      {title && (
        <div className={`pt-8 pb-4 ${noPad ? 'px-4' : ''}`}>
          <h1 style={{ fontSize: 26, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 2 }}>
            {title}
          </h1>
          {subtitle && (
            <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginTop: 4 }}>{subtitle}</p>
          )}
        </div>
      )}
      {children}
    </div>
  );
}
