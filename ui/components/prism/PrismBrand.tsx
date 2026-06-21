import React from 'react'
import { assetUrl } from '../../lib/asset-url'

type PrismBrandSize = 'nav' | 'hero' | 'footer'

interface PrismBrandProps {
  size?: PrismBrandSize
  showText?: boolean
  className?: string
}

const sizeConfig: Record<
  PrismBrandSize,
  { box: string; scale: string; text: string; gap: string }
> = {
  nav: {
    box: 'h-14 w-14',
    scale: 'scale-[1.35]',
    text: 'text-[22px] font-bold tracking-[0.12em]',
    gap: 'gap-3.5',
  },
  hero: {
    box: 'h-32 w-32 md:h-40 md:w-40',
    scale: 'scale-[1.2]',
    text: 'text-5xl md:text-6xl font-bold tracking-[0.14em]',
    gap: 'gap-0',
  },
  footer: {
    box: 'h-9 w-9',
    scale: 'scale-[1.25]',
    text: 'text-[14px] font-medium',
    gap: 'gap-2.5',
  },
}

const LOGO_SRC = assetUrl('prism-logo.png')

export function PrismBrand({ size = 'nav', showText = true, className = '' }: PrismBrandProps) {
  const cfg = sizeConfig[size]

  return (
    <div className={`inline-flex items-center justify-center ${cfg.gap} ${className}`}>
      <div className={`relative shrink-0 ${cfg.box}`}>
        <img
          src={LOGO_SRC}
          alt="PRISM"
          className={`absolute left-1/2 top-1/2 h-full w-full max-w-none -translate-x-1/2 -translate-y-1/2 object-contain ${cfg.scale} drop-shadow-lg`}
          onError={(e) => {
            const img = e.currentTarget
            if (!img.dataset.fallback) {
              img.dataset.fallback = '1'
              img.src = assetUrl('prism-logo.svg')
            }
          }}
        />
      </div>
      {showText && (
        <span className={`leading-none text-neutral-900 ${cfg.text}`}>PRISM</span>
      )}
    </div>
  )
}
