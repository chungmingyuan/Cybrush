import { useState, useRef } from 'react'
import CanvasLayer, { CanvasRef } from './components/CanvasLayer'
import ZenToolbar, { Tool } from './components/ZenToolbar'

function App() {
    const [currentTool, setCurrentTool] = useState<Tool>('INK')
    const canvasRef = useRef<CanvasRef>(null)

    const handleClear = () => {
        canvasRef.current?.clear()
    }

    return (
        <div style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden' }}>
            <CanvasLayer
                ref={canvasRef}
                tool={currentTool}
            />
            <ZenToolbar
                currentTool={currentTool}
                onToolChange={setCurrentTool}
                onClear={handleClear}
            />
        </div>
    )
}

export default App
