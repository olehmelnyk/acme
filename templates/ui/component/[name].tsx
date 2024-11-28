import React from 'react'
import { cn } from '@/lib/utils'

export interface [name]Props extends React.HTMLAttributes<HTMLDivElement> {
  // Add custom props here
}

export const [name] = React.forwardRef<HTMLDivElement, [name]Props>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          // Add default classes here
          className
        )}
        {...props}
      />
    )
  }
)

[name].displayName = '[name]'
