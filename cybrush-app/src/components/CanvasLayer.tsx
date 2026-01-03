import { useEffect, useRef, useImperativeHandle, forwardRef } from 'react'
import { Tool } from './ZenToolbar'

interface CanvasLayerProps {
    tool: Tool
}

export interface CanvasRef {
    clear: () => void
}

const CanvasLayer = forwardRef<CanvasRef, CanvasLayerProps>(({ tool }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const ctxRef = useRef<CanvasRenderingContext2D | null>(null)
    const lastXRef = useRef(0)
    const lastYRef = useRef(0)
    const rectRef = useRef<DOMRect | null>(null)
    const toolRef = useRef<Tool>(tool)

    // Sync tool ref without re-triggering the main useEffect
    useEffect(() => {
        toolRef.current = tool
    }, [tool])

    useImperativeHandle(ref, () => ({
        clear: () => {
            const canvas = canvasRef.current
            const ctx = ctxRef.current
            if (canvas && ctx) {
                ctx.clearRect(0, 0, canvas.width, canvas.height)
            }
        }
    }))

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return

        const ctx = canvas.getContext('2d', {
            desynchronized: true,
            alpha: true
        })
        if (!ctx) return
        ctxRef.current = ctx

        const resize = () => {
            const dpr = window.devicePixelRatio || 1
            const w = window.innerWidth
            const h = window.innerHeight

            // 1. BACKUP existing content
            const temp = document.createElement('canvas')
            temp.width = canvas.width
            temp.height = canvas.height
            temp.getContext('2d')?.drawImage(canvas, 0, 0)

            // 2. RESIZE
            canvas.width = w * dpr
            canvas.height = h * dpr
            canvas.style.width = `${w}px`
            canvas.style.height = `${h}px`

            // 3. RESTORE
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
            ctx.lineCap = 'round'
            ctx.lineJoin = 'round'
            ctx.drawImage(temp, 0, 0, w, h)

            rectRef.current = canvas.getBoundingClientRect()
        }

        const getToolConfig = (currentTool: Tool) => {
            if (currentTool === 'RED') {
                return {
                    rgb: '185, 28, 28',
                    passes: [
                        { s: 3.5, a: 0.01 }, { s: 2.5, a: 0.03 },
                        { s: 1.8, a: 0.08 }, { s: 1.2, a: 0.20 },
                        { s: 0.8, a: 0.45 }, { s: 0.5, a: 0.75 }
                    ]
                }
            }
            return {
                rgb: '0, 0, 0',
                passes: [
                    { s: 4.8, a: 0.003 }, { s: 4.2, a: 0.005 }, { s: 3.6, a: 0.008 },
                    { s: 3.1, a: 0.015 }, { s: 2.6, a: 0.025 }, { s: 2.1, a: 0.04 },
                    { s: 1.7, a: 0.07 }, { s: 1.4, a: 0.12 }, { s: 1.1, a: 0.20 },
                    { s: 0.8, a: 0.35 }, { s: 0.5, a: 0.60 }, { s: 0.2, a: 0.90 }
                ]
            }
        }

        const drawSegment = (x: number, y: number, force: number) => {
            const p = Math.pow(force || 0.4, 1.4)
            const baseSize = p * 44
            const config = getToolConfig(toolRef.current)

            ctx.beginPath()
            ctx.moveTo(lastXRef.current, lastYRef.current)
            ctx.lineTo(x, y)

            if (toolRef.current === 'ERA') {
                ctx.globalCompositeOperation = 'destination-out'
                ctx.lineWidth = baseSize * 1.5
                ctx.strokeStyle = 'black'
                ctx.stroke()
                ctx.globalCompositeOperation = 'source-over'
            } else {
                // Connect segments more smoothly by drawing slightly overlapping ends
                for (let i = 0; i < config.passes.length; i++) {
                    const pass = config.passes[i]
                    ctx.lineWidth = baseSize * pass.s
                    ctx.strokeStyle = `rgba(${config.rgb}, ${pass.a})`
                    ctx.stroke()
                }
            }

            lastXRef.current = x
            lastYRef.current = y
        }

        const drawDot = (x: number, y: number, force: number) => {
            const p = Math.pow(force || 0.4, 1.4)
            const baseSize = p * 22
            const config = getToolConfig(toolRef.current)

            if (toolRef.current === 'ERA') {
                ctx.globalCompositeOperation = 'destination-out'
                ctx.beginPath()
                ctx.arc(x, y, baseSize * 1.5, 0, Math.PI * 2)
                ctx.fill()
                ctx.globalCompositeOperation = 'source-over'
            } else {
                for (let i = 0; i < config.passes.length; i++) {
                    const pass = config.passes[i]
                    ctx.beginPath()
                    ctx.fillStyle = `rgba(${config.rgb}, ${pass.a})`
                    ctx.arc(x, y, (baseSize * pass.s) / 2, 0, Math.PI * 2)
                    ctx.fill()
                }
            }
        }

        const handleStart = (e: TouchEvent) => {
            if (e.touches[0].touchType !== 'stylus') return
            e.preventDefault()
            const touch = e.touches[0]
            if (!rectRef.current) rectRef.current = canvas.getBoundingClientRect()
            const x = touch.clientX - rectRef.current.left
            const y = touch.clientY - rectRef.current.top
            lastXRef.current = x
            lastYRef.current = y
            drawDot(x, y, (touch as any).force)
        }

        const handleMove = (e: TouchEvent) => {
            if (e.touches[0].touchType !== 'stylus') return
            e.preventDefault()
            const touch = e.touches[0]
            if (!rectRef.current) rectRef.current = canvas.getBoundingClientRect()
            const x = touch.clientX - rectRef.current.left
            const y = touch.clientY - rectRef.current.top
            drawSegment(x, y, (touch as any).force)
        }

        canvas.addEventListener('touchstart', handleStart, { passive: false })
        canvas.addEventListener('touchmove', handleMove, { passive: false })

        window.addEventListener('resize', resize)
        resize()

        return () => {
            canvas.removeEventListener('touchstart', handleStart)
            canvas.removeEventListener('touchmove', handleMove)
            window.removeEventListener('resize', resize)
        }
    }, []) // EMPTY DEPENDENCY ARRAY - Never clear on re-render

    return (
        <canvas
            ref={canvasRef}
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                touchAction: 'none',
                zIndex: 1
            }}
        />
    )
})

export default CanvasLayer
