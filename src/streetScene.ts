import * as THREE from 'three'

/**
 * Street view for the UK Customer Map case study: a first-person walk at eye height down a
 * made-up high street in the map's "clay model" style. Customer buildings are purple, the
 * selected shop is lime, prospect shops are marked on the pavement. Drag to look, WASD or the
 * arrow keys to walk (while the pointer is over the view), Esc to leave. Illustrative only.
 */
type Options = { onReady: () => void; onExit: () => void }

const EYE = 1.8
const ROAD = 10 // carriageway width (m)
const PAVE = 3.2
const FRONT = ROAD / 2 + PAVE + 0.4 // building line
const CROSS = [-70, -150, -235, -320] // side streets
const START_Z = 26
const END_Z = -380

/** Tiny deterministic random, so the street is the same every time. */
function rng(seed: number) {
  let s = seed
  return () => {
    s = (s * 16807) % 2147483647
    return s / 2147483647
  }
}

export function mountStreet(host: HTMLElement, { onReady, onExit }: Options) {
  const renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.outputColorSpace = THREE.SRGBColorSpace
  host.appendChild(renderer.domElement)
  renderer.domElement.style.display = 'block'
  renderer.domElement.style.width = '100%'
  renderer.domElement.style.height = '100%'

  const scene = new THREE.Scene()
  scene.background = new THREE.Color('#dde7ec')
  scene.fog = new THREE.Fog('#e8e5dc', 40, 230)

  const camera = new THREE.PerspectiveCamera(68, 1, 0.1, 600)
  scene.add(new THREE.HemisphereLight('#ffffff', '#cbbfa9', 1.9))
  const sun = new THREE.DirectionalLight('#fff7ea', 1.6)
  sun.position.set(-40, 70, 25)
  scene.add(sun)

  const disposables: { dispose: () => void }[] = []
  const mat = (color: string) => {
    const m = new THREE.MeshLambertMaterial({ color })
    disposables.push(m)
    return m
  }
  const plane = (w: number, d: number, color: string, x: number, z: number, y = 0) => {
    const g = new THREE.PlaneGeometry(w, d)
    disposables.push(g)
    const m = new THREE.Mesh(g, mat(color))
    m.rotation.x = -Math.PI / 2
    m.position.set(x, y, z)
    scene.add(m)
  }

  // ground, road, pavements, side streets
  plane(900, 900, '#e4ddcd', 0, -180)
  plane(ROAD, 900, '#fbfaf7', 0, -180, 0.01)
  for (const side of [-1, 1]) plane(PAVE, 900, '#efe9dc', side * (ROAD / 2 + PAVE / 2), -180, 0.06)
  for (const z of CROSS) plane(900, 12, '#fbfaf7', 0, z, 0.02)
  // centre line dashes
  {
    const g = new THREE.PlaneGeometry(0.18, 3)
    disposables.push(g)
    const dashes = new THREE.InstancedMesh(g, mat('#ddd6c8'), 140)
    const o = new THREE.Object3D()
    for (let i = 0; i < 140; i++) {
      o.position.set(0, 0.03, START_Z - i * 6)
      o.rotation.set(-Math.PI / 2, 0, 0)
      o.updateMatrix()
      dashes.setMatrixAt(i, o.matrix)
    }
    scene.add(dashes)
  }

  // buildings: terraces on both sides, taller blocks behind; one instanced mesh for all
  type B = { x: number; z: number; w: number; d: number; h: number; color: string }
  const rnd = rng(11)
  const blocks: B[] = []
  const clay = ['#f6f3ec', '#f1ece2', '#ece6da', '#f8f6f1']
  const CUSTOMER = '#9686da'
  const inCross = (z: number, half: number) => CROSS.some((c) => Math.abs(z - c) < 7 + half)
  let n = 0
  for (const side of [-1, 1]) {
    let z = START_Z + 10
    while (z > END_Z - 40) {
      const w = 5 + rnd() * 4
      const zc = z - w / 2
      if (!inCross(zc, w / 2)) {
        const h = rnd() < 0.12 ? 14 + rnd() * 16 : 6 + rnd() * 5
        const d = 11 + rnd() * 4
        n++
        blocks.push({ x: side * (FRONT + d / 2), z: zc, w: w - 0.25, d, h, color: n % 9 === 4 ? CUSTOMER : clay[Math.floor(rnd() * clay.length)] })
      }
      z -= w
    }
    // a second, taller row behind for a skyline
    for (let zz = START_Z; zz > END_Z; zz -= 14 + rnd() * 10) {
      if (inCross(zz, 6)) continue
      blocks.push({ x: side * (FRONT + 22 + rnd() * 10), z: zz, w: 10 + rnd() * 6, d: 12, h: 10 + rnd() * 30, color: clay[Math.floor(rnd() * clay.length)] })
    }
  }
  // the selected shop: lime, on the right, a short walk ahead
  const front = blocks.filter((b) => b.x > 0 && b.x < FRONT + 12)
  const picked = front.reduce((best, b) => (Math.abs(b.z + 48) < Math.abs(best.z + 48) ? b : best), front[0])
  picked.color = '#c3dc68'

  {
    const g = new THREE.BoxGeometry(1, 1, 1)
    disposables.push(g)
    const mesh = new THREE.InstancedMesh(g, mat('#ffffff'), blocks.length)
    const o = new THREE.Object3D()
    const c = new THREE.Color()
    blocks.forEach((b, i) => {
      o.position.set(b.x, b.h / 2, b.z)
      o.scale.set(b.d, b.h, b.w)
      o.updateMatrix()
      mesh.setMatrixAt(i, o.matrix)
      mesh.setColorAt(i, c.set(b.color))
    })
    scene.add(mesh)
  }

  // prospect shops: purple discs on the pavement, and a pin over the selected shop
  {
    const g = new THREE.CylinderGeometry(0.55, 0.55, 0.05, 24)
    disposables.push(g)
    const marks = blocks.filter((b) => Math.abs(b.x) < FRONT + 10 && b.color !== CUSTOMER && b !== picked).filter((_, i) => i % 6 === 2)
    const mesh = new THREE.InstancedMesh(g, mat('#6a59b5'), marks.length)
    const o = new THREE.Object3D()
    marks.forEach((b, i) => {
      o.position.set(Math.sign(b.x) * (ROAD / 2 + PAVE * 0.6), 0.1, b.z)
      o.updateMatrix()
      mesh.setMatrixAt(i, o.matrix)
    })
    scene.add(mesh)
    const pinG = new THREE.SphereGeometry(0.7, 20, 14)
    disposables.push(pinG)
    const pin = new THREE.Mesh(pinG, mat('#6a59b5'))
    pin.position.set(FRONT - 1.2, picked.h + 2.2, picked.z)
    scene.add(pin)
  }

  // ---- camera and controls ----
  const pos = new THREE.Vector3(-1.6, EYE, START_Z)
  let yaw = 0
  let pitch = 0.02
  let auto = true // stroll forward until the visitor takes over
  const keys = new Set<string>()
  let hover = false
  const WALK = ['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright']
  const onKey = (e: KeyboardEvent) => {
    if (!hover) return
    const k = e.key.toLowerCase()
    if (k === 'escape') {
      e.preventDefault()
      e.stopPropagation() // don't let the portfolio close the tab as well
      if (e.type === 'keydown') onExit()
      return
    }
    if (!WALK.includes(k)) return
    e.preventDefault()
    e.stopPropagation()
    auto = false
    if (e.type === 'keydown') keys.add(k)
    else keys.delete(k)
  }
  // capture phase on window runs before the portfolio's own keyboard shortcuts
  window.addEventListener('keydown', onKey, true)
  window.addEventListener('keyup', onKey, true)

  const el = renderer.domElement
  el.style.cursor = 'grab'
  el.style.touchAction = 'none'
  let drag: { x: number; y: number; yaw: number; pitch: number } | null = null
  const onDown = (e: PointerEvent) => {
    auto = false
    drag = { x: e.clientX, y: e.clientY, yaw, pitch }
    el.setPointerCapture(e.pointerId)
    el.style.cursor = 'grabbing'
  }
  const onMove = (e: PointerEvent) => {
    if (!drag) return
    yaw = drag.yaw + (e.clientX - drag.x) * 0.005
    pitch = THREE.MathUtils.clamp(drag.pitch + (e.clientY - drag.y) * 0.004, -0.6, 0.7)
  }
  const onUp = () => {
    drag = null
    el.style.cursor = 'grab'
  }
  const onEnter = () => (hover = true)
  const onLeave = () => {
    hover = false
    keys.clear()
  }
  el.addEventListener('pointerdown', onDown)
  el.addEventListener('pointermove', onMove)
  el.addEventListener('pointerup', onUp)
  el.addEventListener('pointercancel', onUp)
  host.addEventListener('pointerenter', onEnter)
  host.addEventListener('pointerleave', onLeave)

  const fit = () => {
    const w = host.clientWidth || 1
    const h = host.clientHeight || 1
    renderer.setSize(w, h, false)
    camera.aspect = w / h
    camera.updateProjectionMatrix()
  }
  fit()
  const ro = new ResizeObserver(fit)
  ro.observe(host)

  let visible = true
  const io = new IntersectionObserver(([entry]) => (visible = entry.isIntersecting))
  io.observe(host)

  const clock = new THREE.Clock()
  const look = new THREE.Vector3()
  let first = true
  renderer.setAnimationLoop(() => {
    const dt = Math.min(clock.getDelta(), 0.05)
    if (!visible) return
    // walking: forward is where the camera faces, flattened onto the ground
    const fwd = (keys.has('w') || keys.has('arrowup') ? 1 : 0) - (keys.has('s') || keys.has('arrowdown') ? 1 : 0)
    const strafe = (keys.has('d') ? 1 : 0) - (keys.has('a') ? 1 : 0)
    yaw += ((keys.has('arrowleft') ? 1 : 0) - (keys.has('arrowright') ? 1 : 0)) * 1.4 * dt
    const speed = auto ? 2.4 : 6
    const f = auto ? 1 : fwd
    pos.x += (-Math.sin(yaw) * f + Math.cos(yaw) * strafe) * speed * dt
    pos.z += (-Math.cos(yaw) * f - Math.sin(yaw) * strafe) * speed * dt
    pos.x = THREE.MathUtils.clamp(pos.x, -(ROAD / 2 + PAVE - 0.6), ROAD / 2 + PAVE - 0.6)
    pos.z = THREE.MathUtils.clamp(pos.z, END_Z, START_Z + 4)
    if (auto && pos.z <= END_Z + 1) auto = false
    // a gentle head bob while walking
    const moving = auto || fwd !== 0 || strafe !== 0
    const bob = moving ? Math.sin(clock.elapsedTime * 7) * 0.03 : 0
    camera.position.set(pos.x, EYE + bob, pos.z)
    look.set(pos.x - Math.sin(yaw) * Math.cos(pitch), EYE + bob + Math.sin(pitch), pos.z - Math.cos(yaw) * Math.cos(pitch))
    camera.lookAt(look)
    renderer.render(scene, camera)
    if (first) {
      first = false
      onReady()
    }
  })

  return () => {
    renderer.setAnimationLoop(null)
    window.removeEventListener('keydown', onKey, true)
    window.removeEventListener('keyup', onKey, true)
    host.removeEventListener('pointerenter', onEnter)
    host.removeEventListener('pointerleave', onLeave)
    ro.disconnect()
    io.disconnect()
    scene.traverse((o) => {
      if (o instanceof THREE.InstancedMesh) o.dispose()
    })
    disposables.forEach((d) => d.dispose())
    renderer.dispose()
    el.remove()
  }
}
