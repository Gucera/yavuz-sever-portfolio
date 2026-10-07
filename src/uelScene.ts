import * as THREE from 'three'
import { SVGLoader } from 'three/addons/loaders/SVGLoader.js'
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js'

export type BadgeTheme = {
  /** card background — the gear notches are cut in this colour */
  bg: string
  face: string
  side: string
  rim: string
}

const PLATE = 0.16 // crest thickness
const PX = 0.0092 / 4 // svg units (4× source pixels) → world
const CREST_H = 1676 * PX

const extrude = (shapes: THREE.Shape | THREE.Shape[], depth: number, bevel = 0.012) =>
  new THREE.ExtrudeGeometry(shapes, {
    depth,
    bevelEnabled: true,
    bevelThickness: bevel,
    bevelSize: bevel,
    bevelSegments: 2,
    curveSegments: 20,
  })

async function svgShapes(url: string) {
  const data = new SVGLoader().parse(await (await fetch(url)).text())
  return data.paths.flatMap((p) => SVGLoader.createShapes(p))
}

// The crest is traced 1:1 from the university logo (uel-main.svg).
function crestGeo(shapes: THREE.Shape[], depth: number) {
  const g = extrude(shapes, depth)
  g.scale(PX, -PX, -1) // svg y-down → world y-up (z flip keeps faces outward)
  g.translate(-204 * 4 * PX, 200 * 4 * PX, depth)
  return g
}

// Gear outline measured from the logo: n trapezoid teeth, widths in degrees at
// root and tip, first tooth centred at `phase` (degrees, CCW from +x).
function gearShape(rRoot: number, rTip: number, n: number, wRoot: number, wTip: number, phase: number) {
  const sh = new THREE.Shape()
  const rad = THREE.MathUtils.degToRad
  const per = 360 / n
  const P = (deg: number, r: number): [number, number] => [Math.cos(rad(deg)) * r, Math.sin(rad(deg)) * r]
  for (let i = 0; i < n; i++) {
    const c = phase + i * per
    const pts = [P(c - wRoot / 2, rRoot), P(c - wTip / 2, rTip), P(c + wTip / 2, rTip), P(c + wRoot / 2, rRoot)]
    for (let k = 1; k < 4; k++) pts.push(P(c + wRoot / 2 + ((per - wRoot) * k) / 4, rRoot))
    pts.forEach(([x, y], k) => (i === 0 && k === 0 ? sh.moveTo(x, y) : sh.lineTo(x, y)))
  }
  sh.closePath()
  return sh
}

/** Mounts the 3D UEL crest into `host`. Resolves to a cleanup function. */
export async function mountUelBadge(host: HTMLElement, theme: BadgeTheme): Promise<() => void> {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.setClearColor(0x000000, 0)
  host.appendChild(renderer.domElement)

  const scene = new THREE.Scene()
  const pmrem = new THREE.PMREMGenerator(renderer)
  const envTex = pmrem.fromScene(new RoomEnvironment(), 0.04).texture
  scene.environment = envTex
  scene.environmentIntensity = 0.9

  const camera = new THREE.PerspectiveCamera(28, 1, 0.1, 100)

  const key = new THREE.DirectionalLight(0xffffff, 1.5)
  key.position.set(3, 4, 6)
  const rim = new THREE.PointLight(new THREE.Color(theme.rim), 26, 20)
  rim.position.set(-3.2, -2.4, 2.6)
  scene.add(key, rim)

  const faceMat = new THREE.MeshStandardMaterial({ color: theme.face, metalness: 0.55, roughness: 0.3 })
  const sideMat = new THREE.MeshStandardMaterial({ color: theme.side, metalness: 0.45, roughness: 0.5 })
  const cutMat = new THREE.MeshBasicMaterial({ color: theme.bg, toneMapped: false })
  const mats = [faceMat, sideMat]

  const badge = new THREE.Group()
  scene.add(badge)

  const [crestShapes, lensShapes] = await Promise.all([
    svgShapes('/assets/uel-main.svg'),
    svgShapes('/assets/uel-lens.svg'),
  ])

  const geos: THREE.BufferGeometry[] = []
  const add = (geo: THREE.BufferGeometry, mat: THREE.Material | THREE.Material[]) => {
    geos.push(geo)
    const m = new THREE.Mesh(geo, mat)
    badge.add(m)
    return m
  }

  add(crestGeo(crestShapes, PLATE), mats)

  // The two gear notches are filled in the trace; static background-coloured
  // gears re-cut them so the crest reads like the original logo.
  const GEAR = { x: 132.3 * 0.0092, y: -(332.3 - 200) * 0.0092 }
  for (const side of [-1, 1]) {
    const shape = gearShape(52 * 0.0092, 67 * 0.0092, 9, 33, 12, side < 0 ? 35.5 : 24.5)
    const cut = add(new THREE.ExtrudeGeometry(shape, { depth: PLATE + 0.04, bevelEnabled: false, curveSegments: 4 }), cutMat)
    cut.position.set(side * GEAR.x, GEAR.y, -0.01)
  }
  for (const sh of lensShapes) {
    const lens = add(crestGeo([sh], PLATE), mats)
    lens.position.z = 0.035
  }

  let drawn = false // a still frame has been rendered (see tick)

  // ---- sizing ----
  const fit = () => {
    const w = host.clientWidth || 1
    const h = host.clientHeight || 1
    renderer.setSize(w, h, false)
    renderer.domElement.style.width = '100%'
    renderer.domElement.style.height = '100%'
    camera.aspect = w / h
    const vFov = THREE.MathUtils.degToRad(camera.fov)
    const fitH = (CREST_H * 1.3) / 2 / Math.tan(vFov / 2)
    const fitW = fitH / Math.min(1, camera.aspect / (1696 / 1676))
    camera.position.set(0, 0, Math.max(fitH, fitW))
    camera.updateProjectionMatrix()
  }
  fit()
  // resizing clears the canvas, so let the loop draw a fresh frame even while idle
  const ro = new ResizeObserver(() => {
    fit()
    drawn = false
  })
  ro.observe(host)

  // ---- motion: gentle float + tilt towards the pointer ----
  const target = { x: 0, y: 0 }
  const onPointer = (e: PointerEvent) => {
    const r = host.getBoundingClientRect()
    target.y = THREE.MathUtils.clamp((e.clientX - (r.left + r.width / 2)) / r.width, -1, 1) * 0.45
    target.x = THREE.MathUtils.clamp((e.clientY - (r.top + r.height / 2)) / r.height, -1, 1) * 0.3
  }
  window.addEventListener('pointermove', onPointer)

  let visible = true
  const io = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting
  })
  io.observe(host)

  const clock = new THREE.Clock()
  // Only animate while the Education tab is actually open; otherwise draw one still frame.
  // (In the stack the card is on screen but covered, and rendering it at 60fps costs a lot
  // on phones.)
  const card = host.closest('.card')
  const tick = () => {
    if (!visible || document.documentElement.dataset.flying) return
    const open = card?.getAttribute('role') === 'dialog'
    if (!open && drawn) return
    drawn = true
    const t = clock.getElapsedTime()
    if (!reduced) {
      badge.rotation.y += (target.y + Math.sin(t * 0.5) * 0.12 - badge.rotation.y) * 0.05
      badge.rotation.x += (target.x + Math.sin(t * 0.7) * 0.04 - badge.rotation.x) * 0.05
      badge.position.y = Math.sin(t * 0.9) * 0.05
    }
    renderer.render(scene, camera)
  }
  renderer.setAnimationLoop(tick)

  return () => {
    renderer.setAnimationLoop(null)
    window.removeEventListener('pointermove', onPointer)
    ro.disconnect()
    io.disconnect()
    geos.forEach((g) => g.dispose())
    ;[faceMat, sideMat, cutMat].forEach((m) => m.dispose())
    envTex.dispose()
    pmrem.dispose()
    renderer.dispose()
    renderer.domElement.remove()
  }
}
