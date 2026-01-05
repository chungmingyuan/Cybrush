import { useEffect, useRef, useImperativeHandle, forwardRef, useCallback } from 'react'
import { Tool } from './ZenToolbar'

interface CanvasLayerProps {
    tool: Tool
    brushSize: number
    wetness: number
    brushColor: string
}

export interface CanvasRef {
    clear: () => void
    download: () => void
}

const MAX_HISTORY = 40

const hexToRgb = (hex: string) => {
    if (!hex.startsWith('#')) return hex
    const r = parseInt(hex.slice(1, 3), 16)
    const g = parseInt(hex.slice(3, 5), 16)
    const b = parseInt(hex.slice(5, 7), 16)
    return `${r}, ${g}, ${b}`
}

const CanvasLayer = forwardRef<CanvasRef, CanvasLayerProps>(({ tool, brushSize, wetness, brushColor }, ref) => {
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

        const snapshot = document.createElement('canvas')
        snapshot.width = canvas.width
        snapshot.height = canvas.height
        snapshot.getContext('2d')?.drawImage(canvas, 0, 0)
        redoStackRef.current.push(snapshot)

        const last = historyRef.current.pop()!
        ctx.save()
        ctx.setTransform(1, 0, 0, 1, 0, 0)
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        ctx.drawImage(last, 0, 0)
        ctx.restore()
    }, [])

    const redo = useCallback(() => {
        const canvas = canvasRef.current
        const ctx = ctxRef.current
        if (!canvas || !ctx || redoStackRef.current.length === 0) return

        const snapshot = document.createElement('canvas')
        snapshot.width = canvas.width
        snapshot.height = canvas.height
        snapshot.getContext('2d')?.drawImage(canvas, 0, 0)
        historyRef.current.push(snapshot)

        const next = redoStackRef.current.pop()!
        ctx.save()
        ctx.setTransform(1, 0, 0, 1, 0, 0)
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        ctx.drawImage(next, 0, 0)
        ctx.restore()
    }, [])

    useImperativeHandle(ref, () => ({
        clear: () => {
            const canvas = canvasRef.current
            if (canvas && ctxRef.current) {
                saveHistory()
                ctxRef.current.clearRect(0, 0, canvas.width, canvas.height)
            }
        },
        download: async () => {
            const canvas = canvasRef.current
            if (!canvas) return

            const final = document.createElement('canvas')
            final.width = canvas.width
            final.height = canvas.height
            const fCtx = final.getContext('2d')
            if (!fCtx) return

            fCtx.fillStyle = '#fdfcf0'
            fCtx.fillRect(0, 0, final.width, final.height)
            fCtx.drawImage(canvas, 0, 0)

            const w = final.width / (window.devicePixelRatio || 1)
            const h = final.height / (window.devicePixelRatio || 1)
            fCtx.save()
            const dpr = window.devicePixelRatio || 1
            fCtx.scale(dpr, dpr)
            fCtx.font = 'bold 16px "Inter", sans-serif'
            fCtx.fillStyle = 'rgba(0, 0, 0, 0.4)'
            fCtx.textAlign = 'right'
            fCtx.fillText('CyBrush 2026', w - 30, h - 30)
            fCtx.restore()

            const fileName = `cybrush-${new Date().getTime()}.png`

            // --- NATIVE SAVE TO FILE DIALOG (iPad/Safari) ---
            try {
                final.toBlob(async (blob) => {
                    if (!blob) return
                    const file = new File([blob], fileName, { type: 'image/png' })

                    // Use navigator.share if available (Triggers native Save to Files/Photos on iPad)
                    if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
                        await navigator.share({
                            files: [file],
                            title: 'CyBrush Masterpiece',
                        })
                    } else {
                        // Fallback for browsers that don't support sharing files
                        const link = document.createElement('a')
                        link.download = fileName
                        link.href = URL.createObjectURL(blob)
                        link.click()
                    }
                }, 'image/png')
            } catch (err) {
                console.error('Save failed:', err)
            }
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

        const getPasses = (_t: Tool, wet: number) => {
            const w = wet / 100
            return [
                { s: 1 + 3.5 * w, a: 0.005 * w },
                { s: 1 + 2.2 * w, a: 0.015 * w },
                { s: 1 + 1.4 * w, a: 0.04 * w },
                { s: 1 + 0.8 * w, a: 0.08 * w },
                { s: 1.0, a: 0.20 },
                { s: 0.8, a: 0.35 },
                { s: 0.6, a: 0.55 },
                { s: 0.4, a: 0.75 },
                { s: 0.2, a: 0.95 }
            ].filter(p => p.a > 0)
        }

        const drawSegment = (x: number, y: number, force: number) => {
            const p = Math.pow(force || 0.4, 1.3)
            const baseSize = p * sizeRef.current
            const rgb = colorRef.current.startsWith('#') ? hexToRgb(colorRef.current) : colorRef.current
            const passes = getPasses(toolRef.current, wetnessRef.current)

            ctx.beginPath()
            ctx.moveTo(lastXRef.current, lastYRef.current)
            ctx.lineTo(x, y)

            if (toolRef.current === 'ERA') {
                ctx.globalCompositeOperation = 'destination-out'
                ctx.lineWidth = baseSize * 1.5; ctx.stroke()
                ctx.globalCompositeOperation = 'source-over'
            } else {
                ctx.globalCompositeOperation = 'source-over'
                for (let i = 0; i < passes.length; i++) {
                    const pass = passes[i];
                    if (!pass) continue;
                    ctx.lineWidth = baseSize * pass.s
                    ctx.strokeStyle = `rgba(${rgb}, ${pass.a})`
                    ctx.stroke()
                }
            }
            lastXRef.current = x; lastYRef.current = y
        }

        const onTouchStart = (e: TouchEvent) => {
            if (!e.touches[0]) return
            if ((e.touches[0] as any).touchType === 'direct') e.preventDefault()

            if (e.touches.length === 2) {
                undo(); isDrawingRef.current = false; return
            }
            if (e.touches.length === 3) {
                redo(); isDrawingRef.current = false; return
            }

            if (!e.touches[0] || (e.touches[0] as any).touchType !== 'stylus') return
            e.preventDefault()

            saveHistory()
            isDrawingRef.current = true
            const touch = e.touches[0]
            if (!touch) return
            if (!rectRef.current) rectRef.current = canvas.getBoundingClientRect()
            const x = touch.clientX - (rectRef.current?.left || 0)
            const y = touch.clientY - (rectRef.current?.top || 0)
            lastXRef.current = x; lastYRef.current = y

            const p = Math.pow((touch as any).force || 0.4, 1.3)
            const baseSize = (p * sizeRef.current) / 2
            const rgb = colorRef.current.startsWith('#') ? hexToRgb(colorRef.current) : colorRef.current
            const passes = getPasses(toolRef.current, wetnessRef.current)

            if (toolRef.current === 'ERA') {
                ctx.globalCompositeOperation = 'destination-out'
                ctx.beginPath(); ctx.arc(x, y, baseSize * 1.5, 0, Math.PI * 2); ctx.fill()
                ctx.globalCompositeOperation = 'source-over'
            } else {
                for (let i = 0; i < passes.length; i++) {
                    const p = passes[i];
                    if (!p) continue;
                    ctx.beginPath()
                    ctx.fillStyle = `rgba(${rgb}, ${p.a})`
                    ctx.arc(x, y, baseSize * p.s, 0, Math.PI * 2)
                    ctx.fill()
                }
            }
        }

        const onTouchMove = (e: TouchEvent) => {
            if (!isDrawingRef.current || !e.touches[0] || (e.touches[0] as any).touchType !== 'stylus') return
            e.preventDefault()
            const touch = e.touches[0]
            if (!touch) return
            const x = touch.clientX - (rectRef.current?.left || 0)
            const y = touch.clientY - (rectRef.current?.top || 0)
            drawSegment(x, y, (touch as any).force)
        }

        const onTouchEnd = () => { isDrawingRef.current = false }

        canvas.addEventListener('touchstart', onTouchStart, { passive: false })
        canvas.addEventListener('touchmove', onTouchMove, { passive: false })
        canvas.addEventListener('touchend', onTouchEnd)
        window.addEventListener('resize', resize); resize()

        return () => {
            canvas.removeEventListener('touchstart', onTouchStart)
            canvas.removeEventListener('touchmove', onTouchMove)
            canvas.removeEventListener('touchend', onTouchEnd)
            window.removeEventListener('resize', resize)
        }
    }, [undo, redo, saveHistory])

    return (
        <div style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden' }}>
            <canvas ref={canvasRef} style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', touchAction: 'none', zIndex: 1 }} />
            <div style={{
                position: 'fixed',
                bottom: '30px',
                right: '30px',
                fontFamily: '"Inter", sans-serif',
                fontSize: '18px',
                fontWeight: 'bold',
                color: 'rgba(0, 0, 0, 0.4)',
                userSelect: 'none',
                pointerEvents: 'none',
                zIndex: 2,
                fontStyle: 'italic'
            }}>
                CyBrush 2026
            </div>
        </div>
    )
})

export default CanvasLayer
