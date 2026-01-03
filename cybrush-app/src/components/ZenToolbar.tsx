import React, { useState } from 'react'

export type Tool = 'INK' | 'RED' | 'ERA'

interface ZenToolbarProps {
    currentTool: Tool
    onToolChange: (tool: Tool) => void
    onClear: () => void
}

const ZenToolbar: React.FC<ZenToolbarProps> = ({ currentTool, onToolChange, onClear }) => {
    const [isExpanded, setIsExpanded] = useState(false)

    const InkIcon = ({ color }: { color: string }) => (
        <svg width="24" height="24" viewBox="0 0 24 24" fill={color}>
            <path d="M12 2C12 2 6 10 6 15C6 18.3137 8.68629 21 12 21C15.3137 21 18 18.3137 18 15C18 10 12 2 12 2Z" />
        </svg>
    )

    const EraIcon = () => (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 20H7L3 16C2 15 2 13 3 12L13 2L21 10L17 14L21 18L20 20Z" />
        </svg>
    )

    const ClearIcon = () => (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 6H5H21" /><path d="M19 6L18.1 19.3333C18.0333 20.2667 17.2333 21 16.3 21H7.7C6.76667 21 5.96667 20.2667 5.9 19.3333L5 6" /><path d="M10 11V17" /><path d="M14 11V17" /><path d="M9 6V4C9 3.44772 9.44772 3 10 3H14C14.5523 3 15 3.44772 15 4V6" />
        </svg>
    )

    const currentToolColor = currentTool === 'RED' ? '#b91c1c' : currentTool === 'ERA' ? '#666' : '#111'

    return (
        <div style={{
            position: 'fixed',
            bottom: '24px',
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            zIndex: 1000,
        }}>
            {/* NO BLUR (LAG FIX): Use solid(ish) background for speed */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: isExpanded ? '8px 16px' : '4px',
                borderRadius: '40px',
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                boxShadow: isExpanded ? '0 8px 32px rgba(0,0,0,0.1)' : '0 2px 10px rgba(0,0,0,0.05)',
                border: '1px solid rgba(0, 0, 0, 0.1)',
                transition: 'all 0.3s ease',
                maxWidth: isExpanded ? '500px' : '100px',
                pointerEvents: 'auto'
            }}>
                {!isExpanded ? (
                    <div
                        onClick={() => setIsExpanded(true)}
                        style={{
                            width: '80px',
                            height: '4px',
                            backgroundColor: currentToolColor,
                            borderRadius: '2px',
                            opacity: 0.6,
                            cursor: 'pointer',
                            margin: '8px'
                        }}
                    />
                ) : (
                    <>
                        <button onClick={() => onToolChange('INK')} style={buttonStyle(currentTool === 'INK')}>
                            <InkIcon color="#111" />
                        </button>

                        <button onClick={() => onToolChange('RED')} style={buttonStyle(currentTool === 'RED')}>
                            <InkIcon color="#b91c1c" />
                        </button>

                        <button onClick={() => onToolChange('ERA')} style={buttonStyle(currentTool === 'ERA')}>
                            <EraIcon />
                        </button>

                        <div style={{ width: '1px', height: '24px', backgroundColor: 'rgba(0,0,0,0.1)', margin: '0 8px' }} />

                        <button onClick={onClear} style={buttonStyle(false)}>
                            <ClearIcon />
                        </button>

                        <button
                            onClick={() => setIsExpanded(false)}
                            style={buttonStyle(false)}
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M6 9l6 6 6-6" /></svg>
                        </button>
                    </>
                )}
            </div>
        </div>
    )
}

const buttonStyle = (active: boolean): React.CSSProperties => ({
    width: '44px',
    height: '44px',
    borderRadius: '22px',
    border: 'none',
    backgroundColor: active ? 'rgba(0,0,0,0.05)' : 'transparent',
    color: active ? 'inherit' : '#555',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    cursor: 'pointer',
    transition: 'transform 0.2s',
    transform: active ? 'scale(1.1)' : 'scale(1)',
})

export default ZenToolbar
