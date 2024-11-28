import React from 'react'
import { cn } from '@/lib/utils'

interface [name]Props {
  children?: React.ReactNode
  className?: string
}

export function [name]({
  children,
  className,
}: [name]Props) {
  return (
    <div
      className={cn(
        'relative',
        className
      )}
    >
      {/* Add molecule components here */}
      {children}
    </div>
  )
}
