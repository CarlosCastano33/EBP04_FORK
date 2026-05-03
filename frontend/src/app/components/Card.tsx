import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  title?: string;
  maxWidth?: string;
}

export function Card({ children, title, maxWidth = 'max-w-md' }: CardProps) {
  return (
    <div className={`${maxWidth} w-full bg-white rounded-2xl shadow-lg p-8`}>
      {title && <h2 className="mb-6 text-center">{title}</h2>}
      {children}
    </div>
  );
}
