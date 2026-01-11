import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Brush, Droplets, Scroll, BoxSelect, PenTool } from 'lucide-react';

const StartPage: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-[#0d0a09] text-white font-serif overflow-x-hidden relative flex flex-col">
            {/* Background Watermark */}
            <div
                className="fixed left-1/2 top-1/2 -translate-x-[40%] -translate-y-[45%] pointer-events-none z-0 opacity-[0.03] text-[90vh] text-[#D4AF37] leading-none select-none"
                style={{ fontFamily: "'Ma Shan Zheng', cursive" }}
            >
                道
            </div>

            {/* Navigation */}
            <nav className="flex items-center justify-between px-12 py-10 w-full max-w-7xl mx-auto relative z-10">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-[#e9c46a] text-[#0d0a09] rounded-xl flex items-center justify-center rotate-12 shadow-[0_0_30px_rgba(233,196,106,0.3)]">
                        <Brush className="w-8 h-8 -rotate-12" />
                    </div>
                    <span
                        className="text-6xl text-[#e9c46a] pt-2"
                        style={{ fontFamily: "'Zhi Mang Xing', cursive" }}
                    >
                        CyBrush
                    </span>
                </div>

                <div className="bg-[#e9c46a] text-[#0d0a09] px-8 py-2 rounded-full font-bold text-sm tracking-widest uppercase shadow-[0_0_25px_rgba(233,196,106,0.4)]">
                    100% Free
                </div>
            </nav>

            <main className="flex-1 flex items-center justify-center px-12 pb-20 relative z-10">
                <div className="max-w-7xl w-full grid lg:grid-cols-2 gap-20 items-center">

                    {/* Left Content */}
                    <div className="space-y-12 flex flex-col items-center lg:items-start">
                        <div className="space-y-2 text-center lg:text-left">
                            <h1 className="text-8xl md:text-[10rem] font-bold leading-[0.85] tracking-tight">
                                Master <br />
                                the
                            </h1>
                            <div
                                className="text-7xl md:text-8xl text-[#d90429] transform -rotate-2 -translate-y-2"
                                style={{ fontFamily: "'Ma Shan Zheng', cursive" }}
                            >
                                Power of Ink.
                            </div>
                        </div>

                        {/* Feature Icons Container */}
                        <div className="flex gap-8 py-6 px-10 bg-[#0a0a0a]/80 backdrop-blur-md rounded-2xl border border-white/5 shadow-2xl">
                            <div className="flex flex-col items-center gap-2">
                                <Brush className="w-6 h-6 text-[#e9c46a] opacity-80" />
                                <span className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">Brush</span>
                            </div>
                            <div className="flex flex-col items-center gap-2">
                                <Droplets className="w-6 h-6 text-[#e9c46a] opacity-80" />
                                <span className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">Ink</span>
                            </div>
                            <div className="flex flex-col items-center gap-2">
                                <Scroll className="w-6 h-6 text-[#e9c46a] opacity-80" />
                                <span className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">Paper</span>
                            </div>
                            <div className="flex flex-col items-center gap-2">
                                <BoxSelect className="w-6 h-6 text-[#e9c46a] opacity-40" />
                                <span className="text-[10px] uppercase tracking-widest text-gray-600 font-bold">Inkstone</span>
                            </div>
                        </div>

                        <p className="text-gray-400 text-lg max-w-sm leading-relaxed text-center lg:text-left">
                            Designed for the weight of the stroke. Experience ultra-responsive ink physics across <span className="text-[#e9c46a] italic">various traditional paper types</span>.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center gap-8 pt-4 w-full justify-center lg:justify-start">
                            <button
                                onClick={() => navigate('/strokes')}
                                className="bg-[#cc0000] text-white px-12 py-5 rounded-md font-bold text-xl flex flex-col items-center justify-center leading-tight hover:bg-[#b20000] active:scale-95 transition-all shadow-[0_10px_40px_rgba(204,0,0,0.3)] min-w-[200px]"
                            >
                                <span className="flex items-center gap-2">
                                    Master the <PenTool className="w-4 h-4" />
                                </span>
                                <span>Stroke</span>
                            </button>

                            <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 group">
                                <div className="w-14 h-10 bg-[#FF0000] rounded-xl flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
                                    <div className="w-0 h-0 border-t-[7px] border-t-transparent border-l-[12px] border-l-white border-b-[7px] border-b-transparent ml-1"></div>
                                </div>
                                <div className="text-left">
                                    <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">YouTube</p>
                                    <p className="text-xl font-black text-white group-hover:text-[#e9c46a] transition-colors">Watch Demo</p>
                                </div>
                            </a>
                        </div>
                    </div>

                    {/* Right Content - Paper Canvas */}
                    <div className="flex justify-center relative">
                        {/* Glow effect */}
                        <div className="absolute inset-0 bg-[#e9c46a]/5 blur-[120px] rounded-full"></div>

                        <div className="relative z-20 bg-black p-1 shadow-[0_30px_80px_rgba(0,0,0,0.8)] transform rotate-2">
                            <div
                                className="bg-[#f2f2f2] border-4 border-[#0a0a0a] aspect-[3/4.2] w-[350px] md:w-[420px] lg:w-[450px] flex items-center justify-center overflow-hidden relative"
                                style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/handmade-paper.png")' }}
                            >
                                <div
                                    className="text-black text-[25rem] md:text-[35rem] lg:text-[40rem] select-none transform transition-all duration-700 hover:scale-105"
                                    style={{ fontFamily: "'Ma Shan Zheng', cursive" }}
                                >
                                    永
                                </div>

                                {/* Seal */}
                                <div className="absolute bottom-10 right-10 w-12 h-12 border-2 border-[#a81c1c] flex flex-col items-center justify-center text-[#a81c1c] font-black rotate-[-2deg] bg-[#a81c1c]/5 leading-none p-1">
                                    <span className="text-[12px]">CY</span>
                                    <span className="text-[12px]">BR</span>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </main>

            <style dangerouslySetInnerHTML={{
                __html: `
                @import url('https://fonts.googleapis.com/css2?family=Ma+Shan+Zheng&family=Zhi+Mang+Xing&family=Noto+Serif+SC:wght@700;900&display=swap');
                
                body {
                    margin: 0;
                    padding: 0;
                    background-color: #0d0a09;
                }
            ` }} />
        </div>
    );
};

export default StartPage;
