import { useState, useRef } from 'react'
import CanvasLayer, { CanvasRef } from './components/CanvasLayer'
import ZenToolbar, { Tool } from './components/ZenToolbar'
import PaperSelector, { PaperType } from './components/PaperSelector'

function App() {
    const [selectedPaper, setSelectedPaper] = useState<PaperType | null>(null)
    const [currentTool, setCurrentTool] = useState<Tool>('INK')
    const [brushSize, setBrushSize] = useState(40)
    const [brushColor, setBrushColor] = useState('#111111')
    const [wetness, setWetness] = useState(60)
    const canvasRef = useRef<CanvasRef>(null)

    const handleClear = () => {
        canvasRef.current?.clear()
    }

    const handleDownload = () => {
        canvasRef.current?.download()
    }

    if (!selectedPaper) {
        return <PaperSelector onSelect={setSelectedPaper} />
    }

    return (
        <div style={{
            width: '100%',
            height: '100%',
            position: 'relative',
            overflow: 'hidden',
            backgroundColor: selectedPaper.color,
            backgroundImage: selectedPaper.url ? `url(${selectedPaper.url})` : 'none',
            backgroundSize: 'cover',
            backgroundPosition: 'center'
        }}>
            <CanvasLayer
                ref={canvasRef}
                tool={currentTool}
                brushSize={brushSize}
                wetness={wetness}
                brushColor={brushColor}
            />
            <ZenToolbar
                currentTool={currentTool}
                onToolChange={setCurrentTool}
                onClear={handleClear}
                onDownload={handleDownload}
                brushSize={brushSize}
                onSizeChange={setBrushSize}
                wetness={wetness}
                onWetnessChange={setWetness}
                brushColor={brushColor}
                onColorChange={setBrushColor}
            />
        </div>
    )
}

export default App
