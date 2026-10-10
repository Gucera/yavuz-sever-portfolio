import { useEffect, type RefObject } from 'react'
import gsap from 'gsap'
import { reducedMotion } from '../app/util'

/** Subtle 3D tilt of the whole stack following the mouse (desktop only; touch stays still). */
export function useStackTilt(stackRef: RefObject<HTMLDivElement | null>, openIdx: number, dealing: number) {
  useEffect(() => {
    const stack = stackRef.current
    if (!stack || reducedMotion() || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return
    if (dealing !== -1) return // the deal animation drives the stack (camera) itself
    gsap.set(stack, { transformPerspective: 1800, transformOrigin: '50% 30%' })
    if (openIdx !== -1) {
      gsap.to(stack, { rotationX: 0, rotationY: 0, duration: 0.6, ease: 'power3.out' })
      return
    }
    const rx = gsap.quickTo(stack, 'rotationX', { duration: 0.9, ease: 'power3.out' })
    const ry = gsap.quickTo(stack, 'rotationY', { duration: 0.9, ease: 'power3.out' })
    const onMove = (e: PointerEvent) => {
      ry((e.clientX / window.innerWidth - 0.5) * 5)
      rx(-(e.clientY / window.innerHeight - 0.5) * 3)
    }
    const onLeave = () => {
      rx(0)
      ry(0)
    }
    window.addEventListener('pointermove', onMove)
    document.addEventListener('pointerleave', onLeave)
    return () => {
      window.removeEventListener('pointermove', onMove)
      document.removeEventListener('pointerleave', onLeave)
    }
  }, [stackRef, openIdx, dealing])
}
