import React from 'react';
import { Card, CardProps } from './Card';

export interface FeatureCardProps extends Omit<CardProps, 'children'> {
  icon: string;
  title: string;
  description: string;
}

export const FeatureCard = React.forwardRef<HTMLDivElement, FeatureCardProps>(
  ({ icon, title, description, ...cardProps }, ref) => {
    return (
      <Card ref={ref} padding="md" shadow="md" {...cardProps}>
        <div className="text-3xl mb-2">{icon}</div>
        <h3 className="font-semibold mb-2">{title}</h3>
        <p className="text-sm text-gray-600">{description}</p>
      </Card>
    );
  }
);

FeatureCard.displayName = 'FeatureCard';
