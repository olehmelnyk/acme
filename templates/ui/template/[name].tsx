import React from 'react'
import { cn } from '@/lib/utils'

interface [name]TemplateProps {
  header?: React.ReactNode
  sidebar?: React.ReactNode
  footer?: React.ReactNode
  children: React.ReactNode
  className?: string
}

export function [name]Template({
  header,
  sidebar,
  footer,
  children,
  className,
}: [name]TemplateProps) {
  return (
    <div className={cn('min-h-screen flex flex-col', className)}>
      {header && (
        <header className="sticky top-0 z-50 w-full">
          {header}
        </header>
      )}
      
      <div className="flex-1 flex">
        {sidebar && (
          <aside className="w-64 flex-shrink-0">
            {sidebar}
          </aside>
        )}
        
        <main className="flex-1">
          {children}
        </main>
      </div>

      {footer && (
        <footer className="mt-auto">
          {footer}
        </footer>
      )}
    </div>
  )
}
