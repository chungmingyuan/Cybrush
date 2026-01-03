import { useEffect, useRef } from 'react'

const CanvasLayer: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null)

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return

        const ctx = canvas.getContext('2d', { desynchronized: true, alpha: false })
        if (!ctx) return

        let lastX = 0
        let lastY = 0
        let rect = canvas.getBoundingClientRect()

        const resize = () => {
            const dpr = window.devicePixelRatio || 1
            const w = window.innerWidth
            const h = window.innerHeight
            canvas.width = w * dpr
            canvas.height = h * dpr
            canvas.style.width = `${w}px`
            canvas.style.height = `${h}px`
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
            ctx.lineCap = 'round'
            ctx.lineJoin = 'round'
            ctx.strokeStyle = '#222'
            ctx.fillStyle = '#fdfdfa'
            ctx.fillRect(0, 0, w, h)
            rect = canvas.getBoundingClientRect()
        }

        const drawSegment = (x: number, y: number, force: number) => {
            ctx.beginPath()
            ctx.lineWidth = (force || 0.5) * 18
            ctx.moveTo(lastX, lastY)
            ctx.lineTo(x, y)
            ctx.stroke()
            lastX = x
            lastY = y
        }

        const drawDot = (x: number, y: number, force: number) => {
            ctx.beginPath()
            ctx.arc(x, y, (force || 0.5) * 9, 0, Math.PI * 2)
            ctx.fillStyle = '#222'
            ctx.fill()
        }

        const handleStart = (e: TouchEvent) => {
            e.preventDefault()
            const touch = e.touches[0]
            const x = touch.clientX - rect.left
            const y = touch.clientY - rect.top
            lastX = x
            lastY = y
            drawDot(x, y, (touch as any).force || 0.5)
        }

        const handleMove = (e: TouchEvent) => {
            e.preventDefault()
            const touch = e.touches[0]
            const x = touch.clientX - rect.left
            const y = touch.clientY - rect.top
            drawSegment(x, y, (touch as any).force || 0.5)
        }

        // TOUCH EVENTS solve the hover issue and are usually faster in Safari
        canvas.addEventListener('touchstart', handleStart, { passive: false })
        canvas.addEventListener('touchmove', handleMove, { passive: false })

        window.addEventListener('resize', resize)
        resize()

        return () => {
            canvas.removeEventListener('touchstart', handleStart)
            canvas.removeEventListener('touchmove', handleMove)
            window.removeEventListener('resize', resize)
        }
    }, [])

    return (
        <canvas
            ref={canvasRef}
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                backgroundColor: '#fdfdfa',
                touchAction: 'none'
            }}
        />
    )
}

export default CanvasLayer
