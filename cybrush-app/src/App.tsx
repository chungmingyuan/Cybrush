import { useState, useRef, useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import CanvasLayer, { CanvasRef } from './components/CanvasLayer'
import ZenToolbar, { Tool } from './components/ZenToolbar'
import PaperSelector, { PaperType, PAPERS } from './components/PaperSelector'
import StartPage from './components/StartPage'

function App() {
    return (
        <Routes>
            <Route path="/" element={<StartPage />} />
            <Route path="/strokes" element={<StrokesView />} />
            {/* Fallback to home */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    )
}

function StrokesView() {
    const [selectedPaper, setSelectedPaper] = useState<PaperType | null>(() => {
        const savedPaperId = localStorage.getItem('cybrush_paper_id')
        if (savedPaperId) {
            return PAPERS.find(p => p.id === savedPaperId) || null
        }
        return null
    })
    const [showSelector, setShowSelector] = useState(!selectedPaper)
    const [pendingPaper, setPendingPaper] = useState<PaperType | null>(null)
    const [currentTool, setCurrentTool] = useState<Tool>('INK')
    const [brushSize, setBrushSize] = useState(40)
    const [brushColor, setBrushColor] = useState('#111111')
    const [wetness, setWetness] = useState(60)
    const [sealText, setSealText] = useState(() => localStorage.getItem('cybrush_seal_text') || 'CY')
    const canvasRef = useRef<CanvasRef>(null)

    useEffect(() => {
        const timer = setTimeout(() => {
            localStorage.setItem('cybrush_seal_text', sealText)
        }, 500)
        return () => clearTimeout(timer)
    }, [sealText])

    // VIEWPORT STABILIZATION for Chrome/Safari on iPad
    useEffect(() => {
        const stabilize = () => {
            // Force scroll reset
            window.scrollTo(0, 0);

            // Lock background height to actual viewport
            if (window.visualViewport) {
                const height = window.visualViewport.height;
                document.body.style.height = `${height}px`;
                document.documentElement.style.height = `${height}px`;
            }
        };

        const viewport = window.visualViewport;
        if (viewport) {
            viewport.addEventListener('resize', stabilize);
            viewport.addEventListener('scroll', stabilize);
        }

        // Handle focus shifts
        window.addEventListener('focusin', stabilize);
        window.addEventListener('focusout', () => {
            // Small delay to let keyboard start retracting
            setTimeout(stabilize, 100);
            setTimeout(stabilize, 300); // Second attempt to catch final state
        });

        stabilize();
        return () => {
            if (viewport) {
                viewport.removeEventListener('resize', stabilize);
                viewport.removeEventListener('scroll', stabilize);
            }
            window.removeEventListener('focusin', stabilize);
            window.removeEventListener('focusout', stabilize);
        };
    }, []);
    useEffect(() => {
        if (selectedPaper) {
            localStorage.setItem('cybrush_paper_id', selectedPaper.id)
            // Small delay to ensure canvas is ready
            setTimeout(() => {
                canvasRef.current?.loadState()
            }, 100)
        } else {
            localStorage.removeItem('cybrush_paper_id')
        }
    }, [selectedPaper])

    const isDarkPaper = selectedPaper ? (() => {
        const hex = selectedPaper.color.replace('#', '')
        const r = parseInt(hex.substring(0, 2), 16)
        const g = parseInt(hex.substring(2, 4), 16)
        const b = parseInt(hex.substring(4, 6), 16)
        const brightness = (r * 299 + g * 587 + b * 114) / 1000
        return brightness < 128
    })() : false

    const handleClear = () => {
        canvasRef.current?.clear()
    }

    const handleDownload = () => {
        canvasRef.current?.download()
    }

    const handleReset = () => {
        setShowSelector(true)
    }

    const handlePaperSelection = (paper: PaperType) => {
        const hasWork = localStorage.getItem('cybrush_autosave')
        if (hasWork) {
            setPendingPaper(paper)
        } else {
            setSelectedPaper(paper)
            setShowSelector(false)
        }
    }

    const confirmSelection = (shouldClear: boolean) => {
        if (pendingPaper) {
            if (shouldClear) {
                localStorage.removeItem('cybrush_autosave')
                canvasRef.current?.clear()
            }
            setSelectedPaper(pendingPaper)
            setPendingPaper(null)
            setShowSelector(false)
        }
    }

    if (showSelector || !selectedPaper) {
        return (
            <>
                <PaperSelector
                    onSelect={handlePaperSelection}
                    onCancel={selectedPaper ? () => setShowSelector(false) : undefined}
                />
                {pendingPaper && (
                    <ZenModal
                        title="Canvas Setup"
                        message="Would you like to start with a fresh canvas or keep your current drawing on the new paper?"
                        onConfirm={() => confirmSelection(true)}
                        onCancel={() => confirmSelection(false)}
                        confirmLabel="Clear & Start Fresh"
                        cancelLabel="Keep Current Strokes"
                    />
                )}
            </>
        )
    }

    return (
        <div style={{
            width: '100vw',
            height: '100vh',
            position: 'absolute',
            top: 0,
            left: 0,
            overflow: 'hidden',
            backgroundColor: '#111' // "The Desk" background
        }}>
            <CanvasLayer
                ref={canvasRef}
                paper={selectedPaper}
                tool={currentTool}
                brushSize={brushSize}
                wetness={wetness}
                brushColor={brushColor}
                sealText={sealText}
            />
            {/* Watermark Overlay - Visible in UI, not in download */}
            <div style={{
                position: 'absolute',
                bottom: '30px',
                right: '30px',
                pointerEvents: 'none',
                fontFamily: '"Inter", sans-serif',
                fontWeight: 'bold',
                fontSize: '16px',
                color: isDarkPaper ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)',
                zIndex: 900 // Below toolbar (1000) but above canvas
            }}>
                CyBrush 2026
            </div>
            <ZenToolbar
                currentTool={currentTool}
                onToolChange={setCurrentTool}
                onClear={handleClear}
                onDownload={handleDownload}
                onReset={handleReset}
                brushSize={brushSize}
                onSizeChange={setBrushSize}
                wetness={wetness}
                onWetnessChange={setWetness}
                brushColor={brushColor}
                onColorChange={setBrushColor}
                isDark={isDarkPaper}
                sealText={sealText}
                onSealTextChange={setSealText}
            />
        </div>
    )
}

const ZenModal: React.FC<{
    title: string,
    message: string,
    onConfirm: () => void,
    onCancel: () => void,
    confirmLabel: string,
    cancelLabel: string
}> = ({ title, message, onConfirm, onCancel, confirmLabel, cancelLabel }) => (
    <div style={{
        position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
        backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 2000,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)'
    }}>
        <div style={{
            backgroundColor: '#1a1a1a', borderRadius: '24px', padding: '40px',
            maxWidth: '400px', width: '90%', textAlign: 'center',
            border: '1px solid rgba(255,255,255,0.1)',
            boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
            fontFamily: '"Inter", sans-serif'
        }}>
            <h2 style={{ color: 'white', marginBottom: '16px', fontWeight: 500 }}>{title}</h2>
            <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '32px', lineHeight: '1.6' }}>{message}</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <button
                    onClick={onConfirm}
                    style={{
                        padding: '16px', borderRadius: '12px', border: 'none',
                        backgroundColor: '#aa1111', color: 'white', fontWeight: 'bold',
                        cursor: 'pointer', transition: 'transform 0.2s'
                    }}
                    onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02)'}
                    onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                >
                    {confirmLabel}
                </button>
                <button
                    onClick={onCancel}
                    style={{
                        padding: '16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.2)',
                        backgroundColor: 'transparent', color: 'white', fontWeight: 500,
                        cursor: 'pointer'
                    }}
                >
                    {cancelLabel}
                </button>
            </div>
        </div>
    </div>
)

export default App
