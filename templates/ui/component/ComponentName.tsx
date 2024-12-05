import React from 'react';

interface ComponentNameProps {
  className?: string;
}

export const ComponentName: React.FC<ComponentNameProps> = ({ className }) => {
  return (
    <div data-testid="component-name" className={className}>
      {/* Add your component content here */}
    </div>
  );
};
