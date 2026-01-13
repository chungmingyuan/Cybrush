import { useEffect, useRef, useImperativeHandle, forwardRef, useCallback, useState } from 'react'
import { Tool } from './ZenToolbar'
import { PaperType } from './PaperSelector'

interface CanvasLayerProps {
    paper: PaperType
    tool: Tool
    brushSize: number
    wetness: number
    brushColor: string
    sealText: string
}

export interface CanvasRef {
    clear: () => void
    download: () => void
    saveState: () => void
    loadState: () => void
}

const MAX_HISTORY = 40
const STORAGE_KEY = 'cybrush_autosave'

const hexToRgb = (hex: string) => {
    if (!hex.startsWith('#')) return hex
    const r = parseInt(hex.slice(1, 3), 16)
    const g = parseInt(hex.slice(3, 5), 16)
    const b = parseInt(hex.slice(5, 7), 16)
    return `${r}, ${g}, ${b}`
}

const CanvasLayer = forwardRef<CanvasRef, CanvasLayerProps>(({ paper, tool, brushSize, wetness, brushColor, sealText }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const ctxRef = useRef<CanvasRenderingContext2D | null>(null)
    const lastXRef = useRef(0)
    const lastYRef = useRef(0)
    const pointsRef = useRef<{ x: number, y: number, p: number }[]>([])
    const pressureBufferRef = useRef<number[]>([])
    // For tapering
    const lastVelocityRef = useRef(0)
    const lastTimeRef = useRef(0)

    const sealCacheRef = useRef<{ canvas: HTMLCanvasElement, text: string } | null>(null)
    const autosaveTimerRef = useRef<any>(null)

    const toolRef = useRef<Tool>(tool)
    const sizeRef = useRef(brushSize)
    const wetnessRef = useRef(wetness)
    const colorRef = useRef(brushColor)
    const sealTextRef = useRef(sealText)
    const isDrawingRef = useRef(false)

    // VIEW STATE
    const [view, setView] = useState({ scale: 1, x: 0, y: 0 })
    const viewRef = useRef({ scale: 1, x: 0, y: 0 })
    const [showIndicator, setShowIndicator] = useState(false)
    const indicatorTimer = useRef<any>(null)

    const gestureRef = useRef({
        startX1: 0, startY1: 0,
        startX2: 0, startY2: 0,
        startDist: 0,
        startScale: 1,
        startViewX: 0,
        startViewY: 0,
        worldMidX: 0,
        worldMidY: 0,
        moved: false,
        tapStartTime: 0,
        lastTwoFingerTapTime: 0
    })

    useEffect(() => {
        toolRef.current = tool
        sizeRef.current = brushSize
        wetnessRef.current = wetness
        colorRef.current = brushColor
        sealTextRef.current = sealText
    }, [tool, brushSize, wetness, brushColor, sealText])

    const historyRef = useRef<HTMLCanvasElement[]>([])
    const redoStackRef = useRef<HTMLCanvasElement[]>([])

    const saveHistory = useCallback(() => {
        const canvas = canvasRef.current
        if (!canvas) return
        const snapshot = document.createElement('canvas')
        snapshot.width = canvas.width
        snapshot.height = canvas.height
        const sCtx = snapshot.getContext('2d')
        if (sCtx) {
            sCtx.drawImage(canvas, 0, 0)
            historyRef.current.push(snapshot)
            if (historyRef.current.length > MAX_HISTORY) historyRef.current.shift()
            redoStackRef.current = []
        }
    }, [])

    const undo = useCallback(() => {
        const canvas = canvasRef.current
        const ctx = ctxRef.current
        if (!canvas || !ctx || historyRef.current.length === 0) return
        const last = historyRef.current.pop()!
        const snapshot = document.createElement('canvas')
        snapshot.width = canvas.width; snapshot.height = canvas.height
        snapshot.getContext('2d')?.drawImage(canvas, 0, 0)
        redoStackRef.current.push(snapshot)
        ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0)
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        ctx.drawImage(last, 0, 0)
        ctx.restore()
    }, [])

    const redo = useCallback(() => {
        const canvas = canvasRef.current
        const ctx = ctxRef.current
        if (!canvas || !ctx || redoStackRef.current.length === 0) return
        const next = redoStackRef.current.pop()!
        const snapshot = document.createElement('canvas')
        snapshot.width = canvas.width; snapshot.height = canvas.height
        snapshot.getContext('2d')?.drawImage(canvas, 0, 0)
        historyRef.current.push(snapshot)
        ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0)
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        ctx.drawImage(next, 0, 0)
        ctx.restore()
    }, [])

    const saveToStorage = useCallback(() => {
        if (autosaveTimerRef.current) clearTimeout(autosaveTimerRef.current)
        autosaveTimerRef.current = setTimeout(() => {
            const canvas = canvasRef.current
            if (!canvas) return
            localStorage.setItem(STORAGE_KEY, canvas.toDataURL('image/png'))
        }, 1000)
    }, [])

    const resetView = useCallback(() => {
        const newView = { scale: 1, x: 0, y: 0 }
        viewRef.current = newView; setView(newView); setShowIndicator(true)
        if (indicatorTimer.current) clearTimeout(indicatorTimer.current)
        indicatorTimer.current = setTimeout(() => setShowIndicator(false), 2000)
    }, [])

    useImperativeHandle(ref, () => ({
        clear: () => {
            const canvas = canvasRef.current
            if (canvas && ctxRef.current) {
                saveHistory()
                ctxRef.current.save(); ctxRef.current.setTransform(1, 0, 0, 1, 0, 0)
                ctxRef.current.clearRect(0, 0, canvas.width, canvas.height)
                ctxRef.current.restore(); localStorage.removeItem(STORAGE_KEY)
            }
        },
        saveState: () => saveToStorage(),
        loadState: () => {
            const data = localStorage.getItem(STORAGE_KEY)
            const canvas = canvasRef.current
            if (data && ctxRef.current && canvas) {
                const img = new Image()
                img.onload = () => {
                    const ctx = ctxRef.current
                    if (!ctx) return
                    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0)
                    ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
                    ctx.restore(); saveHistory()
                }
                img.src = data
            }
        },
        download: async () => {
            const canvas = canvasRef.current
            if (!canvas) return
            const final = document.createElement('canvas')
            final.width = canvas.width; final.height = canvas.height
            const fCtx = final.getContext('2d')
            if (!fCtx) return
            fCtx.fillStyle = paper.color; fCtx.fillRect(0, 0, final.width, final.height)
            if (paper.url) {
                const pImg = new Image(); pImg.src = paper.url
                await new Promise(r => pImg.onload = r)
                fCtx.drawImage(pImg, 0, 0, final.width, final.height)
            }
            fCtx.drawImage(canvas, 0, 0)
            fCtx.restore()
            const fileName = `cybrush-${new Date().getTime()}.png`
            final.toBlob(async (blob) => {
                if (!blob) return
                const file = new File([blob], fileName, { type: 'image/png' })
                if (navigator.share && navigator.canShare({ files: [file] })) await navigator.share({ files: [file], title: 'CyBrush Masterpiece' })
                else { const link = document.createElement('a'); link.download = fileName; link.href = URL.createObjectURL(blob); link.click() }
            }, 'image/png')
        }
    }))

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return
        const ctx = canvas.getContext('2d', { desynchronized: true, alpha: true })
        if (!ctx) return
        ctxRef.current = ctx

        const resize = () => {
            const dpr = window.devicePixelRatio || 1
            const parent = canvas.parentElement?.parentElement
            const rect = parent ? parent.getBoundingClientRect() : { width: window.innerWidth, height: window.innerHeight }
            const w = rect.width, h = rect.height
            const temp = document.createElement('canvas')
            temp.width = canvas.width; temp.height = canvas.height
            temp.getContext('2d')?.drawImage(canvas, 0, 0)
            canvas.width = w * dpr; canvas.height = h * dpr
            canvas.style.width = `${w}px`; canvas.style.height = `${h}px`
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
            ctx.lineCap = 'round'; ctx.lineJoin = 'round'
            ctx.drawImage(temp, 0, 0, w, h)
        }

        const generateSealTexture = (text: string) => {
            const sealHeight = 64
            const sealWidth = 64 + Math.max(0, (text.length - 2) * 28)
            const halfW = sealWidth / 2
            const halfHeight = sealHeight / 2
            const pad = 4
            const cacheCanvas = document.createElement('canvas')
            cacheCanvas.width = sealWidth + pad * 2
            cacheCanvas.height = sealHeight + pad * 2
            const cCtx = cacheCanvas.getContext('2d')
            if (!cCtx) return null
            cCtx.translate(halfW + pad, halfHeight + pad)
            cCtx.beginPath()
            const roughness = 2.0
            for (let i = -halfW; i <= halfW; i += 4) cCtx.lineTo(i, -halfHeight + (Math.random() - 0.5) * roughness)
            for (let i = -halfHeight; i <= halfHeight; i += 4) cCtx.lineTo(halfW + (Math.random() - 0.5) * roughness, i)
            for (let i = halfW; i >= -halfW; i -= 4) cCtx.lineTo(i, halfHeight + (Math.random() - 0.5) * roughness)
            for (let i = halfHeight; i >= -halfHeight; i -= 4) cCtx.lineTo(-halfW + (Math.random() - 0.5) * roughness, i)
            cCtx.closePath(); cCtx.fillStyle = '#b52a1c'; cCtx.fill()
            cCtx.globalCompositeOperation = 'destination-out'
            const gap = 5; cCtx.lineWidth = 1.5; cCtx.beginPath()
            cCtx.moveTo(-halfW + gap, -halfHeight + gap); cCtx.lineTo(halfW - gap, -halfHeight + gap)
            cCtx.lineTo(halfW - gap, halfHeight - gap); cCtx.lineTo(-halfW + gap, halfHeight - gap)
            cCtx.closePath(); cCtx.strokeStyle = 'rgba(0,0,0,1)'; cCtx.setLineDash([15, 2]); cCtx.stroke(); cCtx.setLineDash([])
            for (let i = 0; i < 150; i++) {
                const rx = (Math.random() - 0.5) * sealWidth; const ry = (Math.random() - 0.5) * sealHeight
                const r = Math.random() < 0.2 ? 1.5 : 0.5
                cCtx.beginPath(); cCtx.arc(rx, ry, r, 0, Math.PI * 2); cCtx.fill()
            }
            const fontSize = text.length > 3 ? 24 : 28
            cCtx.font = `700 ${fontSize}px "Inter", serif`; cCtx.textAlign = 'center'; cCtx.textBaseline = 'middle'; cCtx.fillText(text, 0, 2)
            return cacheCanvas
        }

        const getPasses = (wet: number) => {
            const w = wet / 100
            return [{ s: 1 + 3.5 * w, a: 0.005 * w }, { s: 1 + 2.2 * w, a: 0.015 * w }, { s: 1 + 1.4 * w, a: 0.04 * w }, { s: 1 + 0.8 * w, a: 0.08 * w }, { s: 1, a: 0.2 }, { s: 0.8, a: 0.35 }, { s: 0.6, a: 0.55 }, { s: 0.4, a: 0.75 }, { s: 0.2, a: 0.95 }].filter(p => p.a > 0)
        }

        const drawCurveSegment = (x1: number, y1: number, x2: number, y2: number, x3: number, y3: number, force: number) => {
            const p = Math.pow(force || 0.5, 1.3); const baseSize = p * sizeRef.current
            const rgb = colorRef.current.startsWith('#') ? hexToRgb(colorRef.current) : colorRef.current
            const passes = getPasses(wetnessRef.current)
            const xc = (x2 + x3) / 2; const yc = (y2 + y3) / 2
            ctx.beginPath(); ctx.moveTo(x1, y1); ctx.quadraticCurveTo(x2, y2, xc, yc)
            if (toolRef.current === 'ERA') {
                ctx.globalCompositeOperation = 'destination-out'; ctx.lineWidth = baseSize * 1.5; ctx.stroke()
                ctx.globalCompositeOperation = 'source-over'
            } else {
                for (const pass of passes) { ctx.lineWidth = baseSize * pass.s; ctx.strokeStyle = `rgba(${rgb}, ${pass.a})`; ctx.stroke() }
            }
            lastXRef.current = xc; lastYRef.current = yc
        }

        const drawLineLast = (x: number, y: number, force: number) => {
            const p = Math.pow(force || 0.5, 1.3); const baseSize = p * sizeRef.current
            const rgb = colorRef.current.startsWith('#') ? hexToRgb(colorRef.current) : colorRef.current
            const passes = getPasses(wetnessRef.current)
            ctx.beginPath(); ctx.moveTo(lastXRef.current, lastYRef.current); ctx.lineTo(x, y)
            if (toolRef.current === 'ERA') {
                ctx.globalCompositeOperation = 'destination-out'; ctx.lineWidth = baseSize * 1.5; ctx.stroke()
                ctx.globalCompositeOperation = 'source-over'
            } else {
                for (const pass of passes) { ctx.lineWidth = baseSize * pass.s; ctx.strokeStyle = `rgba(${rgb}, ${pass.a})`; ctx.stroke() }
            }
        }

        const onTouchStart = (e: TouchEvent) => {
            if (!e.touches[0]) return
            if ((e.touches[0] as any).touchType === 'direct') e.preventDefault()
            const v = viewRef.current
            if (e.touches.length >= 2) {
                isDrawingRef.current = false
                const t1 = e.touches[0], t2 = e.touches[1]
                if (!t2) return
                const dist = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY)
                const midX = (t1.clientX + t2.clientX) / 2; const midY = (t1.clientY + t2.clientY) / 2
                gestureRef.current = {
                    ...gestureRef.current,
                    startX1: t1.clientX, startY1: t1.clientY,
                    startX2: t2.clientX, startY2: t2.clientY,
                    startDist: dist,
                    startScale: v.scale,
                    startViewX: v.x,
                    startViewY: v.y,
                    worldMidX: (midX - v.x) / v.scale,
                    worldMidY: (midY - v.y) / v.scale,
                    moved: false,
                    tapStartTime: Date.now()
                }
                return
            }
            if ((e.touches[0] as any).touchType !== 'stylus') return
            e.preventDefault(); saveHistory(); isDrawingRef.current = true
            const touch = e.touches[0]
            const rect = canvas.getBoundingClientRect()
            const dpr = window.devicePixelRatio || 1
            const worldX = ((touch.clientX - rect.left) / (rect.width || 1)) * (canvas.width / dpr)
            const worldY = ((touch.clientY - rect.top) / (rect.height || 1)) * (canvas.height / dpr)
            lastXRef.current = worldX; lastYRef.current = worldY
            const force = (touch as any).force || 0.5
            pressureBufferRef.current = [force, force, force, force, force]
            lastVelocityRef.current = 0
            lastTimeRef.current = Date.now()
            pointsRef.current = [{ x: worldX, y: worldY, p: force }]
            if (toolRef.current === 'SEAL') {
                const text = sealTextRef.current || 'CY'
                if (!sealCacheRef.current || sealCacheRef.current.text !== text) {
                    const cache = generateSealTexture(text)
                    if (cache) sealCacheRef.current = { canvas: cache, text }
                }
                if (sealCacheRef.current) {
                    const { canvas: cachedCanvas } = sealCacheRef.current
                    ctx.save()
                    ctx.translate(worldX, worldY)
                    ctx.rotate((Math.random() - 0.5) * 0.15)
                    ctx.drawImage(cachedCanvas, -cachedCanvas.width / 2, -cachedCanvas.height / 2)
                    ctx.restore()
                }
                saveToStorage()
            } else {
                const p = Math.pow((touch as any).force || 0.4, 1.3); const baseSize = (p * sizeRef.current) / 2
                const rgb = colorRef.current.startsWith('#') ? hexToRgb(colorRef.current) : colorRef.current
                const passes = getPasses(wetnessRef.current)
                if (toolRef.current === 'ERA') {
                    ctx.globalCompositeOperation = 'destination-out'; ctx.beginPath(); ctx.arc(worldX, worldY, baseSize * 1.5, 0, Math.PI * 2); ctx.fill(); ctx.globalCompositeOperation = 'source-over'
                } else {
                    for (const pass of passes) { ctx.beginPath(); ctx.fillStyle = `rgba(${rgb}, ${pass.a})`; ctx.arc(worldX, worldY, baseSize * pass.s, 0, Math.PI * 2); ctx.fill() }
                }
            }
        }

        const onTouchMove = (e: TouchEvent) => {
            if (e.touches.length >= 2) {
                e.preventDefault()
                const t1 = e.touches[0], t2 = e.touches[1]
                if (!t1 || !t2) return
                const g = gestureRef.current; const dist = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY)
                const midX = (t1.clientX + t2.clientX) / 2; const midY = (t1.clientY + t2.clientY) / 2
                const scaleM = dist / g.startDist
                const newScale = Math.max(0.1, Math.min(g.startScale * scaleM, 15))
                const newX = midX - g.worldMidX * newScale; const newY = midY - g.worldMidY * newScale
                if (Math.abs(dist - g.startDist) > 5 || Math.abs(midX - (g.startX1 + g.startX2) / 2) > 5) g.moved = true
                const newView = { scale: newScale, x: newX, y: newY }
                viewRef.current = newView; setView(newView); setShowIndicator(true)
                if (indicatorTimer.current) clearTimeout(indicatorTimer.current)
                indicatorTimer.current = setTimeout(() => setShowIndicator(false), 2000)
                return
            }
            if (!isDrawingRef.current || toolRef.current === 'SEAL' || !e.touches[0] || (e.touches[0] as any).touchType !== 'stylus') return
            e.preventDefault()
            const events = (e as any).getCoalescedEvents ? (e as any).getCoalescedEvents() : [e]
            const rect = canvas.getBoundingClientRect(); const dpr = window.devicePixelRatio || 1
            const canvasW = canvas.width / dpr; const canvasH = canvas.height / dpr
            for (const ev of events) {
                const t = ev.touches ? ev.touches[0] : ev; if (!t) continue
                const worldX = ((t.clientX - rect.left) / (rect.width || 1)) * canvasW
                const worldY = ((t.clientY - rect.top) / (rect.height || 1)) * canvasH
                const lastPoint = pointsRef.current.length > 0 ? pointsRef.current[pointsRef.current.length - 1]! : { x: lastXRef.current, y: lastYRef.current }
                const distSq = (worldX - lastPoint.x) ** 2 + (worldY - lastPoint.y) ** 2
                if (distSq < 2) continue
                const rawForce = (t as any).force || 0.5
                pressureBufferRef.current.push(rawForce); pressureBufferRef.current.shift()
                const avgForce = pressureBufferRef.current.reduce((a, b) => a + b, 0) / pressureBufferRef.current.length
                const now = Date.now(); const dt = now - lastTimeRef.current
                if (dt > 0) { lastVelocityRef.current = Math.sqrt(distSq) / dt }
                lastTimeRef.current = now
                pointsRef.current.push({ x: worldX, y: worldY, p: avgForce })
                while (pointsRef.current.length >= 3) {
                    const p2 = pointsRef.current[1]!; const p3 = pointsRef.current[2]!
                    drawCurveSegment(lastXRef.current, lastYRef.current, p2.x, p2.y, p3.x, p3.y, p2.p)
                    pointsRef.current.shift()
                }
            }
        }

        const onTouchEnd = (e: TouchEvent) => {
            const g = gestureRef.current
            const duration = Date.now() - g.tapStartTime
            if (!g.moved && duration < 300) {
                if (e.touches.length === 0 && e.changedTouches.length === 2) {
                    const now = Date.now()
                    if (now - g.lastTwoFingerTapTime < 300) resetView()
                    else undo()
                    g.lastTwoFingerTapTime = now
                } else if (e.touches.length === 0 && e.changedTouches.length === 3) redo()
            }
            if (isDrawingRef.current) {
                if (pointsRef.current.length > 0) {
                    const last = pointsRef.current[pointsRef.current.length - 1]!
                    drawLineLast(last.x, last.y, last.p)
                    if (lastVelocityRef.current > 0.5) {
                        const dx = last.x - lastXRef.current; const dy = last.y - lastYRef.current; const len = Math.sqrt(dx * dx + dy * dy)
                        if (len > 0) {
                            const taperLen = Math.min(len * 2, 20); const ux = dx / len; const uy = dy / len
                            const t1x = last.x + ux * (taperLen * 0.5); const t1y = last.y + uy * (taperLen * 0.5)
                            drawCurveSegment(last.x, last.y, t1x, t1y, t1x, t1y, last.p * 0.5)
                            const t2x = last.x + ux * taperLen; const t2y = last.y + uy * taperLen
                            drawCurveSegment(t1x, t1y, t2x, t2y, t2x, t2y, 0.01)
                        }
                    }
                }
                isDrawingRef.current = false; saveToStorage()
            }
        }
        canvas.addEventListener('touchstart', onTouchStart, { passive: false })
        canvas.addEventListener('touchmove', onTouchMove, { passive: false })
        canvas.addEventListener('touchend', onTouchEnd)
        window.addEventListener('resize', resize); resize()
        return () => {
            canvas.removeEventListener('touchstart', onTouchStart); canvas.removeEventListener('touchmove', onTouchMove); canvas.removeEventListener('touchend', onTouchEnd); window.removeEventListener('resize', resize)
        }
    }, [undo, redo, saveHistory, resetView])

    return (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', overflow: 'hidden' }}>
            <div style={{
                position: 'absolute', top: 0, left: 0, width: '100vw', height: '100vh',
                transform: `translate(${view.x}px, ${view.y}px) scale(${view.scale})`,
                transformOrigin: '0 0', willChange: 'transform', zIndex: 1,
                backgroundColor: paper.color, backgroundImage: paper.url ? `url(${paper.url})` : 'none',
                backgroundSize: 'cover', backgroundPosition: 'center', boxShadow: '0 10px 50px rgba(0,0,0,0.8)'
            }}>
                <canvas ref={canvasRef} style={{ width: '100%', height: '100%', touchAction: 'none' }} />
            </div>

            <div style={{
                position: 'fixed', top: '20px', left: '50%', transform: 'translateX(-50%)',
                backgroundColor: 'rgba(0,0,0,0.6)', color: 'white', padding: '8px 16px', borderRadius: '20px',
                fontFamily: '"Inter", sans-serif', fontSize: '14px', zIndex: 1001,
                pointerEvents: 'none', transition: 'opacity 0.3s',
                opacity: showIndicator ? 1 : 0, fontWeight: 500, letterSpacing: '1px'
            }}>
                {Math.round(view.scale * 100)}%
                {view.scale !== 1 && (
                    <span onClick={() => { resetView() }} style={{ marginLeft: '10px', color: '#ff4d4d', cursor: 'pointer', pointerEvents: 'auto', borderLeft: '1px solid rgba(255,255,255,0.3)', paddingLeft: '10px' }}>
                        Reset
                    </span>
                )}
            </div>
        </div>
    )
})

export default CanvasLayer
