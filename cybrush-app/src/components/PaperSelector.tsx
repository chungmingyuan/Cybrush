import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Info } from 'lucide-react'

export interface PaperType {
    id: string
    name: string
    url: string
    color: string
    description: string
}

export const PAPERS: PaperType[] = [
    { id: 'pure-white', name: 'White Paper - No Texture', url: '', color: '#ffffff', description: 'Zero Texture: Ultra-sharp edges and high contrast for modern digital art.' },
    { id: 'rice', name: 'White Rice Paper', url: '/rice-paper.png', color: '#fdfdfa', description: 'Traditional Grain: A bright, classic surface that complements elegant cursive.' },
    { id: 'antique', name: 'Antique Xuan', url: '/antique-xuan.png', color: '#f7f1d5', description: 'Vintage Tone: Aged paper aesthetics for a historical calligraphy feel.' },
    { id: 'fiber', name: 'Handmade Fiber', url: '/handmade-fiber.png', color: '#f4f2e9', description: 'Organic Texture: A rich, fibrous backdrop that adds character to every stroke.' },
    { id: 'silk', name: 'Vintage Silk', url: '/vintage-silk.png', color: '#f9f5e6', description: 'Shimmering Surface: Smooth and sophisticated for precise, fluid movements.' },
    { id: 'slate', name: 'Cool Slate', url: '/cool-slate.png', color: '#1a1d1e', description: 'Stone Finish: A moody, dark canvas that makes white and gold ink pop.' },
]

interface PaperSelectorProps {
    onSelect: (paper: PaperType) => void
}

const PaperSelector: React.FC<PaperSelectorProps> = ({ onSelect }) => {
    const [selectedId, setSelectedId] = useState<string | null>(null)

    const handlePaperClick = (paper: PaperType) => {
        setSelectedId(paper.id)
        // Delay selection callback slightly so the user can see the effect
        setTimeout(() => onSelect(paper), 300)
    }

    return (
        <div className="fixed inset-0 bg-[#0a0a0a] z-[1000] flex flex-col items-center justify-center font-sans text-white overflow-y-auto px-10 py-10">

            <div className="w-full max-w-5xl flex flex-col items-center gap-4 mb-10 px-4">
                <Link
                    to="/"
                    className="self-start flex items-center gap-2 text-gray-500 hover:text-white transition-all text-[10px] sm:text-xs uppercase tracking-[0.2em] group"
                >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    <span>Return to Main</span>
                </Link>
                <h1 className="w-full font-light tracking-[0.1em] sm:tracking-[0.15em] text-xl sm:text-2xl md:text-3xl lg:text-4xl uppercase text-[#D4AF37] text-center leading-tight">
                    Select Your Canvas
                </h1>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 w-full max-w-5xl">
                {PAPERS.map((paper) => {
                    const isSelected = selectedId === paper.id
                    const isSlate = paper.id === 'slate'

                    return (
                        <div
                            key={paper.id}
                            onClick={() => handlePaperClick(paper)}
                            className={`
                                cursor-pointer relative rounded-xl overflow-hidden bg-[#161616] shadow-2xl transition-all duration-500
                                hover:scale-[1.02] active:scale-95
                                ${isSelected ? 'scale-[1.02] ring-2 ring-[#D4AF37]' : 'border border-transparent'}
                                ${isSlate ? 'border border-white/10' : ''}
                            `}
                        >
                            <div
                                className="w-full h-44 bg-center bg-cover border-b border-[#222]"
                                style={{
                                    backgroundColor: paper.color,
                                    backgroundImage: paper.url ? `url(${paper.url})` : 'none',
                                }}
                            />

                            <div className="p-6 flex flex-col items-start relative">
                                <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-gray-200 block w-[calc(100%-30px)] whitespace-nowrap overflow-hidden text-ellipsis">
                                    {paper.name}
                                </span>

                                {/* Info Tooltip */}
                                <div className="absolute bottom-5 right-5 group">
                                    <div className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/5 transition-colors">
                                        <Info className="w-4 h-4 text-gray-600 group-hover:text-[#D4AF37] transition-colors" />
                                    </div>
                                    <div className="absolute bottom-full right-0 mb-3 w-56 p-4 bg-[#050505] text-gray-300 text-[11px] rounded-lg border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none translate-y-2 group-hover:translate-y-0 leading-relaxed z-[1002]">
                                        {paper.description}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>

            <div className="mt-20 text-gray-600 text-[10px] font-bold tracking-[0.4em] uppercase opacity-40">
                CyBrush 2026 • Professional Calligraphy Suite
            </div>
        </div>
    )
}

export default PaperSelector
