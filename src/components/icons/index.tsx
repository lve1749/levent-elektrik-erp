import React from 'react'

// SVG dosyalarını React component olarak import et
import Grid2Icon from './grid-2.svg'
import CircleArrowUpIcon from './circle-arrow-up.svg'
import CircleArrowDownIcon from './circle-arrow-down.svg'
import TriangleWarningIcon from './triangle-warning.svg'
import StackPerspectiveIcon from './stack-perspective.svg'

interface IconProps {
  width?: number
  height?: number
  className?: string
}

// SVG'leri doğrudan React component olarak kullan
export const Grid2: React.FC<IconProps> = ({ width = 24, height = 24, className }) => (
  <Grid2Icon width={width} height={height} className={className} />
)

export const CircleArrowUp: React.FC<IconProps> = ({ width = 24, height = 24, className }) => (
  <CircleArrowUpIcon width={width} height={height} className={className} />
)

export const CircleArrowDown: React.FC<IconProps> = ({ width = 24, height = 24, className }) => (
  <CircleArrowDownIcon width={width} height={height} className={className} />
)

export const TriangleWarning: React.FC<IconProps> = ({ width = 24, height = 24, className }) => (
  <TriangleWarningIcon width={width} height={height} className={className} />
)

export const StackPerspective: React.FC<IconProps> = ({ width = 24, height = 24, className }) => (
  <StackPerspectiveIcon width={width} height={height} className={className} />
)