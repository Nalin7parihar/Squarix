"use client"

import React from 'react'
import { LucideIcon } from 'lucide-react'

interface EmptyProps {
  icon?: LucideIcon
  title: string
  description?: string
  className?: string
}

export function Empty({ 
  icon: Icon, 
  title, 
  description, 
  className = "" 
}: EmptyProps) {
  return (
    <div className={`flex flex-col items-center justify-center p-8 text-center ${className}`}>
      {Icon && (
        <div className="mb-4 rounded-full bg-muted p-3">
          <Icon className="h-6 w-6 text-muted-foreground" />
        </div>
      )}
      <h3 className="mb-1 text-lg font-medium">{title}</h3>
      {description && <p className="text-sm text-muted-foreground">{description}</p>}
    </div>
  )
}