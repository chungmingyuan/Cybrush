import React, { useState, useRef, useEffect } from 'react'

export type Tool = 'INK' | 'RED' | 'ERA' | 'SEAL'

interface ZenToolbarProps {
    currentTool: Tool
    onToolChange: (tool: Tool) => void
    onClear: () => void
    onDownload: () => void
    onReset: () => void
    brushSize: number
    onSizeChange: (size: number) => void
    wetness: number
    onWetnessChange: (wetness: number) => void
    brushColor: string
    onColorChange: (color: string) => void
    isDark?: boolean
}

const ZenToolbar: React.FC<ZenToolbarProps> = ({
    currentTool, onToolChange, onClear, onDownload, onReset, brushSize, onSizeChange, wetness, onWetnessChange, brushColor, onColorChange, isDark
}) => {
    const [isExpanded, setIsExpanded] = useState(true)
    const [isHidden, setIsHidden] = useState(false)
    const [showLabels, setShowLabels] = useState(false)
    const [pos, setPos] = useState({ x: -1000, y: -1000 }) // Start off-screen to avoid jump
    const dragData = useRef({
        isDragging: false,
        startX: 0,
        startY: 0,
        moved: false
    })
    const toolbarRef = useRef<HTMLDivElement>(null)

    // INITIAL CENTERING logic (run once)
    useEffect(() => {
        if (toolbarRef.current && pos.x === -1000) {
            const rect = toolbarRef.current.getBoundingClientRect()
            setPos({
                x: (window.innerWidth - rect.width) / 2,
                y: window.innerHeight - rect.height - 40
            })
        }
    }, [])

    // HANDLE ROTATION / RESIZE
    useEffect(() => {
        const handleResize = () => {
            if (!toolbarRef.current) return
            const rect = toolbarRef.current.getBoundingClientRect()
            setPos(prev => {
                // If it hasn't been moved much, keep it centered bottom
                if (Math.abs(prev.x - (window.innerWidth - rect.width) / 2) < 50) {
                    return {
                        x: (window.innerWidth - rect.width) / 2,
                        y: window.innerHeight - rect.height - 40
                    }
                }
                // Otherwise clamp to keep it visible
                return {
                    x: Math.max(10, Math.min(prev.x, window.innerWidth - rect.width - 10)),
                    y: Math.max(10, Math.min(prev.y, window.innerHeight - rect.height - 10))
                }
            })
        }
        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    }, [])

    useEffect(() => {
        const handleMove = (e: TouchEvent) => {
            if (!dragData.current.isDragging) return
            const touch = e.touches[0]
            if (!touch) return
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
            if (!touch) return
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
        if (!touch) return
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

    const curColor = currentTool === 'ERA' ? '#666' : (currentTool === 'SEAL' ? '#aa1111' : brushColor)

    if (isHidden) {
        return <div onClick={() => setIsHidden(false)} style={{ position: 'fixed', bottom: '24px', left: '50%', transform: 'translateX(-50%)', width: '140px', height: '14px', backgroundColor: curColor, borderRadius: '7px', opacity: 0.2, cursor: 'pointer', zIndex: 1000 }} />
    }

    const themeBase = isDark ? 'rgba(30, 30, 30, 0.75)' : 'rgba(255, 255, 255, 0.65)'
    const themeBorder = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
    const themeIconColor = isDark ? '#eee' : '#222'

    // Responsive constants
    const isNarrow = window.innerWidth < 1000
    const isUltraNarrow = window.innerWidth < 800
    const mainPadding = isExpanded
        ? (isUltraNarrow ? '8px 12px' : (isNarrow ? '10px 16px' : '14px 28px'))
        : (isUltraNarrow ? '4px' : '6px')
    const mainGap = isExpanded ? (isUltraNarrow ? '2px' : (isNarrow ? '6px' : '12px')) : '0px'

    // Size constants
    const bSize = isUltraNarrow ? 36 : (isNarrow ? 42 : 48)
    const iconScale = isUltraNarrow ? 0.8 : 1
    const sldWidthSize = isUltraNarrow ? 35 : (isNarrow ? 60 : 85)
    const sldWidthWet = isUltraNarrow ? 35 : (isNarrow ? 50 : 70)

    const rBtnStyle = {
        ...btnStyle,
        width: `${bSize}px`,
        height: `${bSize}px`,
        transform: `scale(${iconScale})`
    }

    return (
        <div
            ref={toolbarRef}
            style={{
                position: 'fixed',
                left: `${pos.x}px`,
                top: `${pos.y}px`,
                zIndex: 1000,
                touchAction: 'none',
                // Restore transition only when NOT dragging to enable smooth expand/collapse centering
                transition: dragData.current.isDragging ? 'none' : 'left 0.4s cubic-bezier(0.19, 1, 0.22, 1), top 0.4s cubic-bezier(0.19, 1, 0.22, 1)'
            }}
            onTouchStart={onStart}
        >
            <div style={{
                display: 'flex',
                alignItems: 'center',
                // Only animate internal properties (like width expand/collapse)
                transition: 'width 0.4s cubic-bezier(0.19, 1, 0.22, 1), padding 0.4s, opacity 0.4s, background-color 0.4s',
                backgroundColor: themeBase,
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                borderRadius: '50px',
                border: `1px solid ${themeBorder}`,
                boxShadow: isExpanded ? (isDark ? '0 12px 40px rgba(0,0,0,0.4)' : '0 12px 40px rgba(0,0,0,0.1)') : '0 2px 10px rgba(0,0,0,0.05)',
                padding: mainPadding,
                gap: mainGap,
                cursor: 'grab',
                maxWidth: '96vw',
                boxSizing: 'border-box'
            }}>
                <button id="indicator" style={{ ...rBtnStyle, pointerEvents: 'none', position: 'relative' }}>
                    {currentTool === 'ERA' ? <StrongEraserIcon /> : (currentTool === 'SEAL' ? <SealIcon color="#aa1111" /> : <InkDropIcon color={curColor} />)}
                    {showLabels && <div style={{ ...labelStyle(isDark), left: '50%', transform: 'translateX(-50%)' }}>Tool</div>}
                </button>

                {isExpanded && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: mainGap, flexShrink: 1, minWidth: 0 }} onTouchStart={e => e.stopPropagation()}>
                        <div style={{ width: '1px', height: '24px', backgroundColor: themeBorder, flexShrink: 0 }} />
                        <div style={{ position: 'relative', width: `${bSize}px`, height: `${bSize}px`, flexShrink: 0 }}>
                            <div style={{ ...rBtnStyle, position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }}>
                                <PaletteIcon color={brushColor} stroke={themeIconColor} />
                                {showLabels && <div style={{ ...labelStyle(isDark), left: '50%', transform: 'translateX(-50%)' }}>Color</div>}
                            </div>
                            <input
                                type="color"
                                value={brushColor}
                                onChange={(e) => onColorChange(e.target.value)}
                                style={{
                                    position: 'absolute',
                                    top: 0, left: 0,
                                    width: '100%', height: '100%',
                                    opacity: 0,
                                    cursor: 'pointer',
                                    border: 'none',
                                    padding: 0,
                                    WebkitAppearance: 'none'
                                }}
                            />
                        </div>
                        <div style={{ display: 'flex', gap: '2px', flexShrink: 0 }}>
                            <button onClick={() => onToolChange('INK')} style={{ ...rBtnStyle, position: 'relative', backgroundColor: currentTool === 'INK' ? 'rgba(0,0,0,0.05)' : 'transparent' }} title="Ink Brush">
                                <BambooBrushIcon />
                                {showLabels && <div style={{ ...labelStyle(isDark), left: '50%', transform: 'translateX(-50%)' }}>Ink</div>}
                            </button>
                            <button onClick={() => onToolChange('ERA')} style={{ ...rBtnStyle, position: 'relative', backgroundColor: currentTool === 'ERA' ? 'rgba(0,0,0,0.05)' : 'transparent' }} title="Eraser">
                                <StrongEraserIcon />
                                {showLabels && <div style={{ ...labelStyle(isDark), left: '50%', transform: 'translateX(-50%)' }}>Erase</div>}
                            </button>
                            <button onClick={() => onToolChange('SEAL')} style={{ ...rBtnStyle, position: 'relative', backgroundColor: currentTool === 'SEAL' ? 'rgba(0,0,0,0.05)' : 'transparent' }} title="Seal Stamp">
                                <SealIcon color="#aa1111" />
                                {showLabels && <div style={{ ...labelStyle(isDark), left: '50%', transform: 'translateX(-50%)' }}>Seal</div>}
                            </button>
                        </div>
                        <div style={{ width: '1px', height: '24px', backgroundColor: themeBorder, flexShrink: 0 }} />
                        <div style={{ display: 'flex', gap: isNarrow ? '2px' : '6px', alignItems: 'center', flexShrink: 1, minWidth: 0 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '2px', position: 'relative' }}>
                                <SizeRangeIcon color={themeIconColor} />
                                <input type="range" min="5" max="150" value={brushSize} onChange={e => onSizeChange(parseInt(e.target.value))} style={sldStyle(sldWidthSize, isDark)} />
                                {showLabels && <div style={{ ...labelStyle(isDark), left: '50%', transform: 'translateX(-50%)' }}>Size</div>}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '2px', position: 'relative' }}>
                                <WetRangeIcon color={themeIconColor} />
                                <input type="range" min="0" max="100" value={wetness} onChange={e => onWetnessChange(parseInt(e.target.value))} style={sldStyle(sldWidthWet, isDark)} />
                                {showLabels && <div style={{ ...labelStyle(isDark), left: '50%', transform: 'translateX(-50%)' }}>Wet</div>}
                            </div>
                        </div>
                        <div style={{ width: '1px', height: '24px', backgroundColor: themeBorder, flexShrink: 0 }} />
                        <div style={{ display: 'flex', gap: '2px', flexShrink: 0 }}>
                            <button onClick={onDownload} style={{ ...rBtnStyle, position: 'relative' }} title="Download">
                                <ActionIcon d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" stroke={themeIconColor} />
                                {showLabels && <div style={{ ...labelStyle(isDark), left: '50%', transform: 'translateX(-50%)' }}>Save</div>}
                            </button>
                            <button onClick={onClear} style={{ ...rBtnStyle, position: 'relative' }} title="Clear Masterpiece">
                                <ActionIcon d="M3 6h18M19 6l-1 14H6L5 6M10 11v6M14 11v6M9 6V4h6v2" stroke={themeIconColor} />
                                {showLabels && <div style={{ ...labelStyle(isDark), left: '50%', transform: 'translateX(-50%)' }}>Clear</div>}
                            </button>
                            <button onClick={onReset} style={{ ...rBtnStyle, position: 'relative' }} title="Change Paper">
                                <ActionIcon d="M11 15l-3-3 3-3m-8 3h12a5 5 0 010 10" stroke={themeIconColor} />
                                {showLabels && <div style={{ ...labelStyle(isDark), left: '50%', transform: 'translateX(-50%)' }}>Paper</div>}
                            </button>
                            <button onClick={() => setShowLabels(!showLabels)} style={{ ...rBtnStyle, position: 'relative', backgroundColor: showLabels ? 'rgba(0,0,0,0.05)' : 'transparent' }} title="Toggle Labels">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={themeIconColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
                                {showLabels && <div style={{ ...labelStyle(isDark), left: '50%', transform: 'translateX(-50%)' }}>Help</div>}
                            </button>
                            <button onClick={() => setIsHidden(true)} style={{ ...rBtnStyle, position: 'relative' }} title="Minimize">
                                <ActionIcon d="M7 10l5 5 5-5" stroke={themeIconColor} />
                                {showLabels && <div style={{ ...labelStyle(isDark), left: '50%', transform: 'translateX(-50%)' }}>Hide</div>}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

const SizeRangeIcon = ({ color }: { color: string }) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <circle cx="6" cy="18" r="1.5" fill={color} />
        <circle cx="18" cy="6" r="4" fill={color} />
        <path d="M7.5 16.5L14.5 9.5" stroke={color} strokeWidth="1" opacity="0.4" />
    </svg>
)
const WetRangeIcon = ({ color }: { color: string }) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" stroke={color} strokeWidth="2" strokeLinecap="round" />
        <path d="M12 13c-1 0-1.8 0.8-1.8 1.8s0.8 1.8 1.8 1.8 1.8-0.8 1.8-1.8-0.8-1.8-1.8-1.8z" fill={color} />
        <path d="M10 15.5c1-1 3-1 4 0" stroke={color} strokeWidth="1" opacity="0.5" />
    </svg>
)

const InkDropIcon = ({ color }: { color: string }) => (<svg width="28" height="28" viewBox="0 0 24 24" fill={color}><path d="M12 2.5C12 2.5 6 10.5 6 16C6 19.3 8.7 22 12 22C15.3 22 18 19.3 18 16C18 10.5 12 2.5 12 2.5Z" /><path d="M14.5 14.5C14.5 14.5 15.5 15.5 15.5 17C15.5 18.5 14 19.5 14 19.5" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.4" /></svg>)
const BambooBrushIcon = () => (<svg width="28" height="28" viewBox="0 0 24 24" fill="none"><rect x="10.5" y="2" width="3" height="11" rx="0.5" fill="#d2b48c" stroke="#5d2906" strokeWidth="1" /><rect x="10" y="13" width="4" height="2" rx="0.3" fill="#222" /><path d="M12 15C10 17 10 20 12 22C14 20 14 17 12 15Z" fill="#fff" stroke="#222" strokeWidth="1" /></svg>)
const StrongEraserIcon = () => (<svg width="28" height="28" viewBox="0 0 24 24" fill="none"><rect x="6" y="9" width="12" height="9" rx="1.5" fill="#ff4d4d" stroke="#111" strokeWidth="2.5" transform="rotate(-15 12 13.5)" /><rect x="6" y="9" width="5" height="9" rx="1.5" fill="#fff" stroke="#111" strokeWidth="2.5" transform="rotate(-15 12 13.5)" /></svg>)
const ActionIcon = ({ d, stroke = '#222' }: { d: string, stroke?: string }) => (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d={d} /></svg>)
const PaletteIcon = ({ color, stroke = '#222' }: { color: string, stroke?: string }) => (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="13.5" cy="6.5" r=".5" fill={color} />
        <circle cx="17.5" cy="10.5" r=".5" fill={color} />
        <circle cx="8.5" cy="7.5" r=".5" fill={color} />
        <circle cx="6.5" cy="12.5" r=".5" fill={color} />
        <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.647-.494 2.152-1.127a2.49 2.49 0 0 0 .5-1.921c-.139-.773.08-1.577.567-2.115l.08-.088c.451-.497 1.157-.749 1.831-.749h1.12c1.944 0 3.75-1.547 3.75-3.5 0-5.247-4.5-9.5-10-9.5z" stroke={stroke} />
        <circle cx="12" cy="12" r="3" fill={color} opacity="0.5" />
    </svg>
)
const SealIcon = ({ color }: { color: string }) => (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
        <rect x="4" y="4" width="16" height="16" rx="2" fill={color} opacity="0.9" />
        <path d="M8 8h8M8 12h8M8 16h4" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="15" cy="16" r="1.5" stroke="white" strokeWidth="1.5" />
    </svg>
)

const btnStyle: React.CSSProperties = {
    width: '48px', height: '48px', borderRadius: '24px', border: 'none', backgroundColor: 'transparent',
    display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: 'pointer', flexShrink: 0,
    transition: 'background-color 0.2s'
}

const sldStyle = (w: number, isDark?: boolean): React.CSSProperties => ({
    WebkitAppearance: 'none', width: `${w}px`, height: '6px', borderRadius: '3px', background: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.15)', outline: 'none'
})

const labelStyle = (isDark?: boolean): React.CSSProperties => ({
    position: 'absolute',
    top: '-24px',
    fontSize: '10px',
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.5)',
    whiteSpace: 'nowrap',
    pointerEvents: 'none',
    backgroundColor: isDark ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.3)',
    padding: '2px 6px',
    borderRadius: '4px'
})

export default ZenToolbar
