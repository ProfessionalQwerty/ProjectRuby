import { ArrowUpRight } from 'lucide-react'
import { Button } from './button'
import { cn } from '../../lib/utils'

interface ButtonColorfulProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label?: string
}

export function ButtonColorful({
  className,
  label = 'Get Started',
  ...props
}: ButtonColorfulProps) {
  return (
    <Button
      className={cn(
        'relative h-11 overflow-hidden border border-neutral-300 bg-white px-6 shadow-md',
        'group hover:border-neutral-400 hover:shadow-lg',
        className
      )}
      {...props}
    >
      <div
        className={cn(
          'absolute inset-0 bg-gradient-to-r from-violet-500 via-fuchsia-500 to-amber-400',
          'opacity-[0.18] transition-opacity duration-300 group-hover:opacity-[0.28]'
        )}
      />
      <div className="relative flex items-center justify-center gap-2">
        <span className="font-semibold text-neutral-900">{label}</span>
        <ArrowUpRight className="h-3.5 w-3.5 text-neutral-700" />
      </div>
    </Button>
  )
}
