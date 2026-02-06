import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Brush, Droplets, Scroll, BoxSelect } from 'lucide-react';

const StartPage: React.FC = () => {
    const navigate = useNavigate();

    // Use effect to ensure Lucide icons are initialized if they don't render automatically
    // (though lucide-react should handle this, the original HTML used lucide.createIcons())
    useEffect(() => {
        // No-op, just to mirror the original script's presence if needed
    }, []);

    return (
        <div
            className="fixed inset-0 bg-[#080808] text-white overflow-hidden relative flex flex-col items-center"
            style={{
                fontFamily: "'Noto Serif SC', serif",
                width: '100dvw',
                height: '100dvh'
            }}
        >
            {/* Table Surface Background */}
            <div
                className="fixed inset-0 z-[-1]"
                style={{
                    background: 'radial-gradient(circle at 50% 50%, #1e120e 0%, #050505 100%)'
                }}
            />

            {/* Background Watermark */}
            <div
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-0 select-none"
                style={{
                    fontFamily: "'Ma Shan Zheng', cursive",
                    fontSize: '90vmin',
                    color: 'rgba(212, 175, 55, 0.15)'
                }}
            >
                道
            </div>

            {/* Navigation */}
            <nav className="flex items-center justify-between px-6 py-4 md:px-10 md:py-6 w-full max-w-5xl relative z-10 shrink-0">
                <div className="flex items-center gap-4 md:gap-6">
                    <div className="w-10 h-10 md:w-16 md:h-16 bg-[#D4AF37] text-black rounded-sm flex items-center justify-center rotate-45 shadow-[0_0_30px_rgba(212,175,55,0.4)] shrink-0">
                        <Brush className="w-6 h-6 md:w-10 md:h-10 -rotate-45" />
                    </div>
                    <span
                        className="leading-none pt-1 md:pt-2 text-5xl md:text-7xl tracking-[1px] text-[#D4AF37]"
                        style={{
                            fontFamily: "'Zhi Mang Xing', cursive",
                            textShadow: '0 4px 15px rgba(0, 0, 0, 0.8)'
                        }}
                    >
                        CyBrush
                    </span>
                    <img
                        src="/logo-chinese-transparent.png"
                        alt="Chinese Logo"
                        className="h-14 md:h-24 ml-4 object-contain"
                    />
                </div>

                <div className="hidden sm:flex flex-col items-end">
                    <div className="bg-[#D4AF37] text-black px-6 py-2.5 rounded-full font-black text-sm md:text-base tracking-widest uppercase shadow-[0_0_20px_rgba(212,175,55,0.6)]">
                        100% Free
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="flex-1 flex items-center justify-center w-full max-w-5xl px-6 md:px-10 relative z-10 overflow-hidden">
                <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center md:text-left text-center w-full">

                    <div className="flex flex-col items-center md:items-start space-y-4 md:space-y-6 lg:space-y-8">
                        <h1 className="text-3xl sm:text-4xl md:text-4xl lg:text-7xl font-black leading-none tracking-tighter">
                            Master the <br />
                            <span
                                className="text-[#cc0000]"
                                style={{ fontFamily: "'Ma Shan Zheng', cursive" }}
                            >
                                Power of Ink.
                            </span>
                        </h1>

                        {/* Icon Set Section */}
                        <div className="flex justify-center gap-4 md:gap-6 py-3 md:py-4 border-y border-white/10 bg-black/60 backdrop-blur-xl rounded-2xl px-6 md:px-8 w-fit mx-auto md:mx-0">
                            <div className="flex flex-col items-center gap-1">
                                <Brush className="w-4 h-4 md:w-5 md:h-5 text-[#D4AF37]" />
                                <span className="text-[7px] md:text-[8px] uppercase tracking-widest text-gray-400 font-bold">Brush</span>
                            </div>
                            <div className="flex flex-col items-center gap-1">
                                <Droplets className="w-4 h-4 md:w-5 md:h-5 text-[#D4AF37]" />
                                <span className="text-[7px] md:text-[8px] uppercase tracking-widest text-gray-400 font-bold">Ink</span>
                            </div>
                            <div className="flex flex-col items-center gap-1">
                                <Scroll className="w-4 h-4 md:w-5 md:h-5 text-[#D4AF37]" />
                                <span className="text-[7px] md:text-[8px] uppercase tracking-widest text-gray-400 font-bold">Paper</span>
                            </div>
                            <div className="flex flex-col items-center gap-1">
                                <BoxSelect
                                    className="w-4 h-4 md:w-5 md:h-5 text-[#D4AF37]"
                                    strokeWidth={2.5}
                                />
                                <span className="text-[7px] md:text-[8px] uppercase tracking-widest text-gray-400 font-bold">Inkstone</span>
                            </div>
                        </div>

                        <p className="hidden md:block text-gray-400 text-sm lg:text-base max-w-sm leading-relaxed">
                            Designed for the weight of the stroke. Experience ultra-responsive ink physics across <span className="text-[#D4AF37] italic">various traditional paper types</span>.
                        </p>

                        {/* Call to Action */}
                        <div className="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-6 md:gap-8 pt-6 w-full sm:w-auto">
                            <button
                                onClick={() => {
                                    localStorage.removeItem('cybrush_paper_id');
                                    navigate('/strokes');
                                }}
                                className="group relative bg-[#cc0000] text-white w-full sm:w-auto px-16 py-6 rounded-sm font-black text-2xl md:text-3xl flex items-center justify-center gap-6 transition-all duration-500 hover:bg-[#e60000] hover:scale-[1.07] active:scale-95 shadow-[0_20px_50px_-10px_rgba(204,0,0,0.5)] hover:shadow-[0_40px_80px_-10px_rgba(204,0,0,0.8)] overflow-hidden border border-white/10 hover:border-[#D4AF37]/50"
                                style={{ animation: 'pulse-red 3s infinite' }}
                            >
                                {/* Moving Shimmer Effect */}
                                <div className="absolute inset-0 z-0 pointer-events-none">
                                    <div
                                        className="absolute top-0 h-full w-[200%] bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-0 group-hover:opacity-100"
                                        style={{
                                            animation: 'shimmer 2s infinite',
                                            transform: 'skewX(-20deg)'
                                        }}
                                    />
                                </div>

                                {/* Backglow Glow Effect */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                                <span className="relative z-10 tracking-[0.15em] uppercase italic drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)]">Master the Stroke</span>
                                <div className="relative z-10 flex items-center justify-center w-12 h-12 bg-white/10 rounded-full group-hover:bg-[#D4AF37]/30 transition-all duration-500 border border-white/5 group-hover:border-[#D4AF37]/50 shadow-inner">
                                    <Brush
                                        className="w-8 h-8 transition-all duration-500 group-hover:rotate-[20deg] group-hover:scale-110 text-[#d2b48c] group-hover:text-[#D4AF37]"
                                        strokeWidth={1.5}
                                    />
                                </div>
                            </button>

                            <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="group flex items-center gap-4 hover:scale-105 transition-transform duration-300">
                                <div className="w-12 h-8 bg-[#FF0000] rounded-lg flex items-center justify-center shadow-lg group-hover:shadow-[#FF0000]/40 transition-shadow">
                                    <div className="w-0 h-0 border-t-[6px] border-t-transparent border-l-[10px] border-l-white border-b-[6px] border-b-transparent ml-0.5"></div>
                                </div>
                                <div className="text-left leading-tight">
                                    <p className="text-[8px] font-bold text-gray-500 uppercase tracking-[0.2em]">YouTube</p>
                                    <p className="text-lg font-black text-white group-hover:text-[#D4AF37] transition-colors">Watch Demo</p>
                                </div>
                            </a>
                        </div>
                    </div>

                    {/* Right Side: Paper Preview */}
                    <div className="canvas-container flex justify-center relative scale-[0.6] sm:scale-75 md:scale-90 lg:scale-100 origin-center md:origin-right">
                        <div className="absolute inset-x-[-40px] inset-y-[-40px] bg-[#D4AF37]/5 blur-[80px] rounded-full"></div>
                        <div className="relative z-20 p-[1px] bg-[#111] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.9)] transform rotate-1">
                            <div
                                className="bg-[#fdfbf7] border-[8px] md:border-[10px] aspect-[3/4] w-[240px] lg:w-[380px] flex items-center justify-center overflow-hidden relative"
                                style={{
                                    backgroundImage: 'url("https://www.transparenttextures.com/patterns/handmade-paper.png")',
                                    borderColor: '#0a0a0a'
                                }}
                            >
                                <img
                                    src="https://upload.wikimedia.org/wikipedia/commons/3/39/%E6%B0%B8-calligraphic-order.gif"
                                    alt="Yong Calligraphy Animation"
                                    className="w-[110%] h-auto opacity-95 select-none transform translate-y-[-10px] mix-blend-multiply"
                                />

                                <div
                                    className="absolute bottom-[15px] right-[15px] md:bottom-[20px] md:right-[20px] lg:bottom-[30px] lg:right-[30px] w-[45px] h-[45px] lg:w-[70px] lg:h-[70px] border-[2px] lg:border-[3px] border-[#a81c1c] flex flex-col items-center justify-center text-[#a81c1c] font-black rotate-[-3deg] bg-[rgba(168,28,28,0.05)]"
                                >
                                    <span className="text-[10px] lg:text-[16px] leading-[0.9]">CY</span>
                                    <span className="text-[10px] lg:text-[16px] leading-[0.9]">BR</span>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </main>

            {/* Global Styles for Custom Fonts */}
            <style dangerouslySetInnerHTML={{
                __html: `
                @import url('https://fonts.googleapis.com/css2?family=Ma+Shan+Zheng&family=Zhi+Mang+Xing&family=Liu+Jian+Mao+Cao&family=Noto+Serif+SC:wght@700;900&display=swap');
                
                body {
                    margin: 0;
                    padding: 0;
                }

                @keyframes shimmer {
                    0% { transform: translateX(-150%) skewX(-20deg); }
                    100% { transform: translateX(150%) skewX(-20deg); }
                }

                @keyframes pulse-red {
                    0% { box-shadow: 0 0 0 0 rgba(204, 0, 0, 0.4); }
                    70% { box-shadow: 0 0 0 15px rgba(204, 0, 0, 0); }
                    100% { box-shadow: 0 0 0 0 rgba(204, 0, 0, 0); }
                }
            ` }} />
        </div>
    );
};

export default StartPage;
