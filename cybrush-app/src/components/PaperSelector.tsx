import React from 'react'

export interface PaperType {
    id: string
    name: string
    url: string
    color: string
}

export const PAPERS: PaperType[] = [
    { id: 'pure-white', name: 'White Paper - No Texture', url: '', color: '#ffffff' },
    { id: 'rice', name: 'White Rice Paper', url: '/rice-paper.png', color: '#fdfdfa' },
    { id: 'antique', name: 'Antique Xuan', url: '/antique-xuan.png', color: '#f7f1d5' },
    { id: 'fiber', name: 'Handmade Fiber', url: '/handmade-fiber.png', color: '#f4f2e9' },
    { id: 'silk', name: 'Vintage Silk', url: '/vintage-silk.png', color: '#f9f5e6' },
    { id: 'slate', name: 'Cool Slate', url: '/cool-slate.png', color: '#1a1d1e' },
]

interface PaperSelectorProps {
    onSelect: (paper: PaperType) => void
    onCancel?: () => void
}

const PaperSelector: React.FC<PaperSelectorProps> = ({ onSelect, onCancel }) => {
    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: '#111',
            zIndex: 1000,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: '"Inter", sans-serif',
            color: 'white',
            overflowY: 'auto',
            padding: '40px 20px'
        }}>
            <h1 style={{ marginBottom: '40px', fontWeight: 300, letterSpacing: '2px', fontSize: '2rem' }}>Select Your Canvas</h1>

            {onCancel && (
                <button
                    onClick={onCancel}
                    style={{
                        position: 'absolute',
                        top: '40px',
                        left: '40px',
                        backgroundColor: 'transparent',
                        border: '1px solid rgba(255,255,255,0.3)',
                        color: 'white',
                        padding: '10px 20px',
                        borderRadius: '25px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        fontSize: '14px',
                        fontWeight: 300,
                        transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)'
                        e.currentTarget.style.borderColor = 'white'
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent'
                        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)'
                    }}
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
                    Return to Canvas
                </button>
            )}

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '30px',
                width: '100%',
                maxWidth: '1000px'
            }}>
                {PAPERS.map((paper) => (
                    <div
                        key={paper.id}
                        onClick={() => onSelect(paper)}
                        style={{
                            cursor: 'pointer',
                            transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                            borderRadius: '12px',
                            overflow: 'hidden',
                            backgroundColor: '#222',
                            boxShadow: '0 4px 20px rgba(0,0,0,0.5)'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-10px)'
                            e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.7)'
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)'
                            e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.5)'
                        }}
                    >
                        <div style={{
                            width: '100%',
                            height: '150px',
                            backgroundColor: paper.color,
                            backgroundImage: paper.url ? `url(${paper.url})` : 'none',
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            borderBottom: '1px solid #333'
                        }} />
                        <div style={{
                            padding: '20px',
                            textAlign: 'center',
                            fontSize: '16px',
                            fontWeight: 500,
                            letterSpacing: '0.5px'
                        }}>
                            {paper.name}
                        </div>
                    </div>
                ))}
            </div>

            <div style={{ marginTop: '50px', color: 'rgba(255,255,255,0.4)', fontSize: '14px', fontStyle: 'italic' }}>
                CyBrush 2026 • Professional Calligraphy Suite
            </div>
        </div>
    )
}

export default PaperSelector
