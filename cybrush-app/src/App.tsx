import { useState, useRef } from 'react'
import CanvasLayer, { CanvasRef } from './components/CanvasLayer'
import ZenToolbar, { Tool } from './components/ZenToolbar'

function App() {
    const [currentTool, setCurrentTool] = useState<Tool>('INK')
    const [brushSize, setBrushSize] = useState(40)
    const [wetness, setWetness] = useState(60)
    const canvasRef = useRef<CanvasRef>(null)

    const handleClear = () => {
        canvasRef.current?.clear()
    }

    const handleDownload = () => {
        canvasRef.current?.download()
    }

    return (
        <div style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden' }}>
            <CanvasLayer
                ref={canvasRef}
                tool={currentTool}
                brushSize={brushSize}
                wetness={wetness}
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
            />
        </div>
    )
}

export default App
