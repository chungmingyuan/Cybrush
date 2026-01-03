import React, { useState, useRef, useEffect } from 'react'

export type Tool = 'INK' | 'RED' | 'ERA'

interface ZenToolbarProps {
    currentTool: Tool
    onToolChange: (tool: Tool) => void
    onClear: () => void
    onDownload: () => void
    brushSize: number
    onSizeChange: (size: number) => void
    wetness: number
    onWetnessChange: (wetness: number) => void
}

const ZenToolbar: React.FC<ZenToolbarProps> = ({
    currentTool, onToolChange, onClear, onDownload, brushSize, onSizeChange, wetness, onWetnessChange
}) => {
    const [isExpanded, setIsExpanded] = useState(true)
    const [isHidden, setIsHidden] = useState(false)
    const [pos, setPos] = useState({ x: window.innerWidth / 2 - 250, y: window.innerHeight - 150 })
    const [lastInk, setLastInk] = useState<'INK' | 'RED'>('INK')

    const dragData = useRef({
        isDragging: false,
        startX: 0,
        startY: 0,
        moved: false
    })
    const toolbarRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const handleMove = (e: TouchEvent) => {
            if (!dragData.current.isDragging) return
            const touch = e.touches[0]
            const dx = touch.clientX - dragData.current.startX
            const dy = touch.clientY - dragData.current.startY

            if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
                dragData.current.moved = true
            }

            if (toolbarRef.current) {
                // Instantly move the element with the finger
                toolbarRef.current.style.transform = `translate(${dx}px, ${dy}px)`
            }
        }

        const handleEnd = (e: TouchEvent) => {
            if (!dragData.current.isDragging) return
            const touch = e.changedTouches[0]
            const dx = touch.clientX - dragData.current.startX
            const dy = touch.clientY - dragData.current.startY

            if (!dragData.current.moved) {
                setIsExpanded(prev => !prev)
            } else {
                // Update the state position
                setPos(prev => ({ x: prev.x + dx, y: prev.y + dy }))
            }

            dragData.current.isDragging = false

            // CRITICAL FIX: Remove transform and transition instantly to prevent the "replay slide"
            if (toolbarRef.current) {
                toolbarRef.current.style.transition = 'none'
                toolbarRef.current.style.transform = 'none'
            }
        }

        window.addEventListener('touchmove', handleMove, { passive: false })
        window.addEventListener('touchend', handleEnd)
        return () => {
            window.removeEventListener('touchmove', handleMove)
            window.removeEventListener('touchend', handleEnd)
        }
    }, [])

    const onStart = (e: React.TouchEvent) => {
        if (isHidden) return
        const target = e.target as HTMLElement
        if (target.closest('input, button:not(#indicator)')) return

        const touch = e.touches[0]
        dragData.current = {
            isDragging: true,
            startX: touch.clientX,
            startY: touch.clientY,
            moved: false
        }

        // Ensure no transition starts when we first touch the bar
        if (toolbarRef.current) {
            toolbarRef.current.style.transition = 'none'
        }
    }

    const curColor = currentTool === 'RED' ? '#b91c1c' : currentTool === 'ERA' ? '#666' : '#111'

    if (isHidden) {
        return <div onClick={() => setIsHidden(false)} style={{ position: 'fixed', bottom: '24px', left: '50%', transform: 'translateX(-50%)', width: '140px', height: '14px', backgroundColor: curColor, borderRadius: '7px', opacity: 0.2, cursor: 'pointer', zIndex: 1000 }} />
    }

    return (
        <div
            ref={toolbarRef}
            style={{
                position: 'fixed',
                left: `${pos.x}px`,
                top: `${pos.y}px`,
                zIndex: 1000,
                touchAction: 'none'
                // Removed ALL transitions from the root mount to ensure zero-lag positioning
            }}
            onTouchStart={onStart}
        >
            <div style={{
                display: 'flex',
                alignItems: 'center',
                // Only animate internal properties (like width expand/collapse)
                transition: 'width 0.4s cubic-bezier(0.19, 1, 0.22, 1), padding 0.4s, opacity 0.4s, background-color 0.4s',
                backgroundColor: 'rgba(255, 255, 255, 0.65)',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
                borderRadius: '50px',
                border: '1px solid rgba(0, 0, 0, 0.1)',
                boxShadow: isExpanded ? '0 12px 40px rgba(0,0,0,0.1)' : '0 2px 10px rgba(0,0,0,0.05)',
                padding: isExpanded ? '14px 28px' : '6px',
                gap: '12px',
                cursor: 'grab'
            }}>
                <button id="indicator" style={{ ...btnStyle, pointerEvents: 'none' }}>
                    {currentTool === 'ERA' ? <StrongEraserIcon /> : <InkDropIcon color={curColor} />}
                </button>

                {isExpanded && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }} onTouchStart={e => e.stopPropagation()}>
                        <div style={{ width: '1px', height: '30px', backgroundColor: 'rgba(0,0,0,0.1)' }} />
                        <button onClick={() => { const next = lastInk === 'INK' ? 'RED' : 'INK'; setLastInk(next); if (currentTool !== 'ERA') onToolChange(next) }} style={btnStyle}><ColorSwapsIcon /></button>
                        <button onClick={() => onToolChange(currentTool === 'ERA' ? lastInk : 'ERA')} style={btnStyle}>{currentTool === 'ERA' ? <BambooBrushIcon /> : <StrongEraserIcon />}</button>
                        <div style={{ width: '1px', height: '30px', backgroundColor: 'rgba(0,0,0,0.1)' }} />
                        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Marker val={2.5} /><input type="range" min="5" max="150" value={brushSize} onChange={e => onSizeChange(parseInt(e.target.value))} style={sldStyle(85)} /><Marker val={8.5} /></div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Marker isWet val={0.3} /><input type="range" min="0" max="100" value={wetness} onChange={e => onWetnessChange(parseInt(e.target.value))} style={sldStyle(70)} /><Marker isWet val={1} /></div>
                        </div>
                        <div style={{ width: '1px', height: '30px', backgroundColor: 'rgba(0,0,0,0.1)' }} />
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <button onClick={onDownload} style={btnStyle}><ActionIcon d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" /></button>
                            <button onClick={onClear} style={btnStyle}><ActionIcon d="M3 6h18M19 6l-1 14H6L5 6M10 11v6M14 11v6M9 6V4h6v2" /></button>
                            <button onClick={() => setIsHidden(true)} style={btnStyle}><ActionIcon d="M7 10l5 5 5-5" /></button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

// SUPPORT COMPONENTS (LINT FIX)
const InkDropIcon = ({ color }: { color: string }) => (<svg width="28" height="28" viewBox="0 0 24 24" fill={color}><path d="M12 2.5C12 2.5 6 10.5 6 16C6 19.3 8.7 22 12 22C15.3 22 18 19.3 18 16C18 10.5 12 2.5 12 2.5Z" /><path d="M14.5 14.5C14.5 14.5 15.5 15.5 15.5 17C15.5 18.5 14 19.5 14 19.5" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.4" /></svg>)
const ColorSwapsIcon = () => (<svg width="30" height="30" viewBox="0 0 24 24" fill="none"><path d="M10 4C10 4 5 10 5 14.5C5 17.5 7.2 19.5 10 19.5C12.8 19.5 15 17.5 15 14.5C15 10 10 4 10 4Z" fill="#111" stroke="white" strokeWidth="1.2" /><path d="M15 8C15 8 11 13 11 16.5C11 19 12.8 21 15 21C17.2 21 19 19 19 16.5C19 13 15 8 15 8Z" fill="#b91c1c" stroke="white" strokeWidth="1.2" /></svg>)
const BambooBrushIcon = () => (<svg width="28" height="28" viewBox="0 0 24 24" fill="none"><rect x="10.5" y="2" width="3" height="11" rx="0.5" fill="#d2b48c" stroke="#5d2906" strokeWidth="1" /><rect x="10" y="13" width="4" height="2" rx="0.3" fill="#222" /><path d="M12 15C10 17 10 20 12 22C14 20 14 17 12 15Z" fill="#fff" stroke="#222" strokeWidth="1" /></svg>)
const StrongEraserIcon = () => (<svg width="28" height="28" viewBox="0 0 24 24" fill="none"><rect x="6" y="9" width="12" height="9" rx="1.5" fill="#ff4d4d" stroke="#111" strokeWidth="2.5" transform="rotate(-15 12 13.5)" /><rect x="6" y="9" width="5" height="9" rx="1.5" fill="#fff" stroke="#111" strokeWidth="2.5" transform="rotate(-15 12 13.5)" /></svg>)
const ActionIcon = ({ d }: { d: string }) => (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#222" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d={d} /></svg>)
const Marker = ({ isWet, val }: { isWet?: boolean, val: number }) => (<svg width="20" height="20" viewBox="0 0 24 24" fill="#444" style={{ opacity: isWet ? val : 1 }}>{isWet ? <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" /> : <circle cx="12" cy="12" r={val} />}</svg>)

const btnStyle: React.CSSProperties = {
    width: '48px', height: '48px', borderRadius: '24px', border: 'none', backgroundColor: 'transparent',
    display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: 'pointer', flexShrink: 0
}

const sldStyle = (w: number): React.CSSProperties => ({
    WebkitAppearance: 'none', width: `${w}px`, height: '6px', borderRadius: '3px', background: 'rgba(0,0,0,0.15)', outline: 'none'
})

export default ZenToolbar
