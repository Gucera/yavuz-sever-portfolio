import { useEffect, useState } from 'react'
import type { Viewport } from '../layout'

const MOBILE_BP = 768

const readViewport = (): Viewport => ({
  w: window.innerWidth,
  h: window.innerHeight,
  mobile: window.innerWidth < MOBILE_BP,
})

/** The window size, plus where the header ends (it wraps on narrow windows and the content
 *  below it has to start lower). */
export function useViewport(): Viewport {
  const [vp, setVp] = useState(readViewport)
  useEffect(() => {
    const header = document.querySelector('.header')
    const measure = () => {
      const next = { ...readViewport(), headerBottom: header ? Math.round(header.getBoundingClientRect().bottom) : undefined }
      setVp((v) => (v.w === next.w && v.h === next.h && v.headerBottom === next.headerBottom ? v : next))
    }
    measure()
    const ro = new ResizeObserver(measure)
    if (header) ro.observe(header)
    window.addEventListener('resize', measure)
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', measure)
    }
  }, [])
  return vp
}
