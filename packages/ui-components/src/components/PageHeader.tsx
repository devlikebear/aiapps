import React from 'react';

export interface PageHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  subtitle?: string;
  gradient?: {
    from: string;
    to: string;
  };
}

export const PageHeader = React.forwardRef<HTMLDivElement, PageHeaderProps>(
  ({ title, subtitle, gradient, className = '', ...props }, ref) => {
    const gradientStyle = gradient
      ? `bg-gradient-to-r from-${gradient.from} to-${gradient.to}`
      : 'bg-gradient-to-r from-blue-600 to-purple-600';

    return (
      <div ref={ref} className={`text-center ${className}`} {...props}>
        <h1
          className={`text-5xl font-bold mb-4 bg-clip-text text-transparent ${gradientStyle}`}
        >
          {title}
        </h1>
        {subtitle && <p className="text-xl text-gray-600 mb-8">{subtitle}</p>}
      </div>
    );
  }
);

PageHeader.displayName = 'PageHeader';
