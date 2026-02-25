import { Pencil, Eraser, Trash2, Download, Undo, Redo } from 'lucide-react';

export default function Toolbar({ tool, setTool, color, setColor, brushSize, setBrushSize, socket, roomId }) {
  const handleClear = () => {
    if (socket && window.confirm('Clear the entire canvas?')) {
      socket.emit('clear-canvas', { roomId });
    }
  };

  const handleUndo = () => {
    if (socket) {
      socket.emit('undo', { roomId });
    }
  };

  const handleRedo = () => {
    if (socket) {
      socket.emit('redo', { roomId });
    }
  };

  const handleDownload = () => {
    const canvas = document.querySelector('canvas');
    const link = document.createElement('a');
    link.download = `whiteboard-${Date.now()}.png`;
    link.href = canvas.toDataURL();
    link.click();
  };

  return (
    <div className="flex flex-col items-center py-4 space-y-4">
      <button
        onClick={() => setTool('pencil')}
        className={`p-3 rounded-md ${tool === 'pencil' ? 'bg-blue-100 border-2 border-blue-500' : 'hover:bg-gray-100'}`}
        title="Pencil"
      >
        <Pencil className="w-5 h-5" />
      </button>

      <button
        onClick={() => setTool('eraser')}
        className={`p-3 rounded-md ${tool === 'eraser' ? 'bg-blue-100 border-2 border-blue-500' : 'hover:bg-gray-100'}`}
        title="Eraser"
      >
        <Eraser className="w-5 h-5" />
      </button>

      <div className="flex flex-col items-center space-y-2">
        <input
          type="color"
          value={color}
          onChange={(e) => setColor(e.target.value)}
          className="w-10 h-10 rounded cursor-pointer"
          title="Color"
        />
      </div>

      <div className="flex flex-col items-center space-y-2">
        <input
          type="range"
          min="1"
          max="20"
          value={brushSize}
          onChange={(e) => setBrushSize(Number(e.target.value))}
          className="w-10 h-24 cursor-pointer"
          style={{ writingMode: 'bt-lr', WebkitAppearance: 'slider-vertical' }}
          title="Brush Size"
        />
        <span className="text-xs">{brushSize}</span>
      </div>

      <div className="border-t-2 border-gray-300 w-full"></div>

      <button
        onClick={handleUndo}
        className="p-3 rounded-md hover:bg-gray-100"
        title="Undo"
      >
        <Undo className="w-5 h-5" />
      </button>

      <button
        onClick={handleRedo}
        className="p-3 rounded-md hover:bg-gray-100"
        title="Redo"
      >
        <Redo className="w-5 h-5" />
      </button>

      <button
        onClick={handleClear}
        className="p-3 rounded-md hover:bg-red-100 text-red-600"
        title="Clear Canvas"
      >
        <Trash2 className="w-5 h-5" />
      </button>

      <button
        onClick={handleDownload}
        className="p-3 rounded-md hover:bg-green-100 text-green-600"
        title="Download"
      >
        <Download className="w-5 h-5" />
      </button>
    </div>
  );
}
