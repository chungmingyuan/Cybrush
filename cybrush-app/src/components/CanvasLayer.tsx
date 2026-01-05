import { useEffect, useRef, useImperativeHandle, forwardRef, useCallback, useState } from 'react'
import { Tool } from './ZenToolbar'
import { PaperType } from './PaperSelector'

interface CanvasLayerProps {
    paper: PaperType
    tool: Tool
    brushSize: number
    wetness: number
    brushColor: string
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

const CanvasLayer = forwardRef<CanvasRef, CanvasLayerProps>(({ paper, tool, brushSize, wetness, brushColor }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const ctxRef = useRef<CanvasRenderingContext2D | null>(null)
    const lastXRef = useRef(0)
    const lastYRef = useRef(0)
    const rectRef = useRef<DOMRect | null>(null)

    const toolRef = useRef<Tool>(tool)
    const sizeRef = useRef(brushSize)
    const wetnessRef = useRef(wetness)
    const colorRef = useRef(brushColor)
    const isDrawingRef = useRef(false)

    // VIEW STATE
    const [view, setView] = useState({ scale: 1, x: 0, y: 0 })
    const viewRef = useRef({ scale: 1, x: 0, y: 0 })
    const [showIndicator, setShowIndicator] = useState(false)
    const indicatorTimer = useRef<NodeJS.Timeout | null>(null)

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
        tapStartTime: 0
    })

    useEffect(() => {
        toolRef.current = tool
        sizeRef.current = brushSize
        wetnessRef.current = wetness
        colorRef.current = brushColor
    }, [tool, brushSize, wetness, brushColor])

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
        const canvas = canvasRef.current
        if (!canvas) return
        localStorage.setItem(STORAGE_KEY, canvas.toDataURL('image/png'))
    }, [])

    const resetView = useCallback(() => {
        const newView = { scale: 1, x: 0, y: 0 }
        viewRef.current = newView
        setView(newView)
        setShowIndicator(true)
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
                ctxRef.current.restore()
                localStorage.removeItem(STORAGE_KEY)
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
            const dpr = window.devicePixelRatio || 1
            fCtx.save(); fCtx.scale(dpr, dpr)
            fCtx.font = 'bold 16px "Inter", sans-serif'; fCtx.fillStyle = 'rgba(0, 0, 0, 0.4)'
            fCtx.textAlign = 'right'; fCtx.fillText('CyBrush 2026', (final.width / dpr) - 30, (final.height / dpr) - 30)
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
            const w = window.innerWidth, h = window.innerHeight
            const temp = document.createElement('canvas')
            temp.width = canvas.width; temp.height = canvas.height
            temp.getContext('2d')?.drawImage(canvas, 0, 0)
            canvas.width = w * dpr; canvas.height = h * dpr
            canvas.style.width = `${w}px`; canvas.style.height = `${h}px`
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
            ctx.lineCap = 'round'; ctx.lineJoin = 'round'
            ctx.drawImage(temp, 0, 0, w, h)
            rectRef.current = canvas.getBoundingClientRect()
        }

        const getPasses = (wet: number) => {
            const w = wet / 100
            return [{ s: 1 + 3.5 * w, a: 0.005 * w }, { s: 1 + 2.2 * w, a: 0.015 * w }, { s: 1 + 1.4 * w, a: 0.04 * w }, { s: 1 + 0.8 * w, a: 0.08 * w }, { s: 1, a: 0.2 }, { s: 0.8, a: 0.35 }, { s: 0.6, a: 0.55 }, { s: 0.4, a: 0.75 }, { s: 0.2, a: 0.95 }].filter(p => p.a > 0)
        }

        const drawSegment = (x: number, y: number, force: number) => {
            const v = viewRef.current
            const worldX = (x - v.x) / v.scale
            const worldY = (y - v.y) / v.scale
            const p = Math.pow(force || 0.4, 1.3)
            const baseSize = p * sizeRef.current
            const rgb = colorRef.current.startsWith('#') ? hexToRgb(colorRef.current) : colorRef.current
            const passes = getPasses(wetnessRef.current)
            ctx.beginPath(); ctx.moveTo(lastXRef.current, lastYRef.current); ctx.lineTo(worldX, worldY)
            if (toolRef.current === 'ERA') {
                ctx.globalCompositeOperation = 'destination-out'; ctx.lineWidth = baseSize * 1.5; ctx.stroke()
                ctx.globalCompositeOperation = 'source-over'
            } else {
                for (const pass of passes) { ctx.lineWidth = baseSize * pass.s; ctx.strokeStyle = `rgba(${rgb}, ${pass.a})`; ctx.stroke() }
            }
            lastXRef.current = worldX; lastYRef.current = worldY
        }

        const onTouchStart = (e: TouchEvent) => {
            if (!e.touches[0]) return
            if ((e.touches[0] as any).touchType === 'direct') e.preventDefault()
            const v = viewRef.current

            if (e.touches.length >= 2) {
                isDrawingRef.current = false
                const t1 = e.touches[0], t2 = e.touches[1]
                const dist = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY)
                const midX = (t1.clientX + t2.clientX) / 2
                const midY = (t1.clientY + t2.clientY) / 2
                gestureRef.current = {
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
            const worldX = (touch.clientX - v.x) / v.scale
            const worldY = (touch.clientY - v.y) / v.scale
            lastXRef.current = worldX; lastYRef.current = worldY

            const p = Math.pow((touch as any).force || 0.4, 1.3)
            const baseSize = (p * sizeRef.current) / 2
            const rgb = colorRef.current.startsWith('#') ? hexToRgb(colorRef.current) : colorRef.current
            const passes = getPasses(wetnessRef.current)

            if (toolRef.current === 'SEAL') {
                const sealSize = 60
                ctx.save(); ctx.translate(worldX, worldY); ctx.rotate(-0.05)
                ctx.fillStyle = '#aa1111'; ctx.fillRect(-sealSize / 2, -sealSize / 2, sealSize, sealSize)
                ctx.globalCompositeOperation = 'destination-out'
                for (let i = 0; i < 5; i++) { ctx.beginPath(); ctx.arc((Math.random() - 0.5) * sealSize, (Math.random() - 0.5) * sealSize, 1 + Math.random() * 2, 0, Math.PI * 2); ctx.fill() }
                ctx.globalCompositeOperation = 'source-over'; ctx.font = 'bold 24px "Inter", serif'
                ctx.fillStyle = 'rgba(255,255,255,0.9)'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('CY', 0, 0); ctx.restore(); saveToStorage()
            } else {
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
                const g = gestureRef.current
                const dist = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY)
                const midX = (t1.clientX + t2.clientX) / 2
                const midY = (t1.clientY + t2.clientY) / 2
                const scaleM = dist / g.startDist
                const newScale = Math.max(0.1, Math.min(g.startScale * scaleM, 15))
                const newX = midX - g.worldMidX * newScale
                const newY = midY - g.worldMidY * newScale
                if (Math.abs(dist - g.startDist) > 5 || Math.abs(midX - (g.startX1 + g.startX2) / 2) > 5) g.moved = true
                const newView = { scale: newScale, x: newX, y: newY }
                viewRef.current = newView; setView(newView); setShowIndicator(true)
                if (indicatorTimer.current) clearTimeout(indicatorTimer.current)
                indicatorTimer.current = setTimeout(() => setShowIndicator(false), 2000)
                return
            }
            if (!isDrawingRef.current || toolRef.current === 'SEAL' || !e.touches[0] || (e.touches[0] as any).touchType !== 'stylus') return
            e.preventDefault(); drawSegment(e.touches[0].clientX, e.touches[0].clientY, (e.touches[0] as any).force)
        }

        const onTouchEnd = (e: TouchEvent) => {
            const g = gestureRef.current
            const duration = Date.now() - g.tapStartTime
            if (!g.moved && duration < 300) {
                if (e.touches.length === 0 && e.changedTouches.length === 2) undo()
                else if (e.touches.length === 0 && e.changedTouches.length === 3) redo()
            }
            if (isDrawingRef.current) { isDrawingRef.current = false; saveToStorage() }
        }

        canvas.addEventListener('touchstart', onTouchStart, { passive: false })
        canvas.addEventListener('touchmove', onTouchMove, { passive: false })
        canvas.addEventListener('touchend', onTouchEnd)
        window.addEventListener('resize', resize); resize()
        return () => {
            canvas.removeEventListener('touchstart', onTouchStart); canvas.removeEventListener('touchmove', onTouchMove); canvas.removeEventListener('touchend', onTouchEnd); window.removeEventListener('resize', resize)
        }
    }, [undo, redo, saveHistory])

    return (
        <div style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden' }}>
            {/* THE TRANSFORMED CANVAS + PAPER STACK */}
            <div style={{
                position: 'fixed', top: 0, left: 0,
                width: '100vw', height: '100vh',
                transform: `translate(${view.x}px, ${view.y}px) scale(${view.scale})`,
                transformOrigin: '0 0',
                willChange: 'transform',
                zIndex: 1,
                backgroundColor: paper.color,
                backgroundImage: paper.url ? `url(${paper.url})` : 'none',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                boxShadow: '0 10px 50px rgba(0,0,0,0.8)', // Border visibility
                border: '1px solid rgba(255,255,255,0.05)'
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
                    <span onClick={() => resetView()} style={{ marginLeft: '10px', color: '#ff4d4d', cursor: 'pointer', pointerEvents: 'auto', borderLeft: '1px solid rgba(255,255,255,0.3)', paddingLeft: '10px' }}>
                        Reset
                    </span>
                )}
            </div>

            <div style={{
                position: 'fixed', bottom: '30px', right: '30px', fontFamily: '"Inter", sans-serif',
                fontSize: '18px', fontWeight: 'bold', color: 'rgba(0, 0, 0, 0.4)',
                userSelect: 'none', pointerEvents: 'none', zIndex: 2, fontStyle: 'italic'
            }}>
                CyBrush 2026
            </div>
        </div>
    )
})

export default CanvasLayer
