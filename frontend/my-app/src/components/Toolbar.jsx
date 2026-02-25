import { Pencil, Eraser, Type, Trash2, Download, Undo, Redo, Image, Monitor, Upload, Video, Palette } from 'lucide-react';
import ScreenShare from './ScreenShare';
import FileShare from './FileShare';
import SessionRecorder from './SessionRecorder';
import ImageUpload from './ImageUpload';
import BackgroundPicker from './BackgroundPicker';

export default function Toolbar({ tool, setTool, color, setColor, brushSize, setBrushSize, socket, roomId, canvasRef, currentUser, context, undoRedoFunctions }) {
  const handleClear = () => {
    if (socket && window.confirm('Clear the entire canvas?')) {
      socket.emit('clear-canvas', { roomId });
    }
  };

  const handleUndo = () => {
    if (undoRedoFunctions && undoRedoFunctions.undo) {
      undoRedoFunctions.undo();
      if (socket) socket.emit('undo', { roomId });
    }
  };

  const handleRedo = () => {
    if (undoRedoFunctions && undoRedoFunctions.redo) {
      undoRedoFunctions.redo();
      if (socket) socket.emit('redo', { roomId });
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
    <div className="flex flex-col items-center py-2 space-y-1 h-full overflow-y-auto">
      {/* Drawing Tools */}
      <button
        onClick={() => setTool('pencil')}
        className={`p-2 rounded-md ${tool === 'pencil' ? 'bg-blue-100 border-2 border-blue-500' : 'hover:bg-gray-100'}`}
        title="Pencil"
      >
        <Pencil className="w-4 h-4" />
      </button>

      <button
        onClick={() => setTool('eraser')}
        className={`p-2 rounded-md ${tool === 'eraser' ? 'bg-blue-100 border-2 border-blue-500' : 'hover:bg-gray-100'}`}
        title="Eraser"
      >
        <Eraser className="w-4 h-4" />
      </button>

      <button
        onClick={() => setTool('text')}
        className={`p-2 rounded-md ${tool === 'text' ? 'bg-blue-100 border-2 border-blue-500' : 'hover:bg-gray-100'}`}
        title="Text"
      >
        <Type className="w-4 h-4" />
      </button>

      {/* Color Picker */}
      <div className="flex flex-col items-center">
        <input
          type="color"
          value={color}
          onChange={(e) => setColor(e.target.value)}
          className="w-8 h-8 rounded cursor-pointer border-2 border-gray-300"
          title="Color"
        />
      </div>

      {/* Background Color */}
      <BackgroundPicker canvasRef={canvasRef} context={context} />

      {/* Brush Size Slider */}
      <div className="flex flex-col items-center space-y-1 py-1">
        <input
          type="range"
          min="1"
          max="20"
          value={brushSize}
          onChange={(e) => setBrushSize(Number(e.target.value))}
          className="h-16 cursor-pointer"
          style={{ 
            writingMode: 'vertical-lr',
            direction: 'rtl',
            width: '30px'
          }}
          title="Brush Size"
        />
        <span className="text-xs font-semibold">{brushSize}</span>
      </div>

      <div className="border-t border-gray-300 w-full"></div>

      {/* Undo */}
      <button
        onClick={handleUndo}
        className="p-2 rounded-md hover:bg-gray-100"
        title="Undo"
      >
        <Undo className="w-4 h-4" />
      </button>

      {/* Redo */}
      <button
        onClick={handleRedo}
        className="p-2 rounded-md hover:bg-gray-100"
        title="Redo"
      >
        <Redo className="w-4 h-4" />
      </button>

      {/* Clear Canvas */}
      <button
        onClick={handleClear}
        className="p-2 rounded-md hover:bg-red-100 text-red-600"
        title="Clear Canvas"
      >
        <Trash2 className="w-4 h-4" />
      </button>

      {/* Download */}
      <button
        onClick={handleDownload}
        className="p-2 rounded-md hover:bg-green-100 text-green-600"
        title="Download"
      >
        <Download className="w-4 h-4" />
      </button>

      <div className="border-t border-gray-300 w-full"></div>

      {/* Image Upload */}
      <ImageUpload canvasRef={canvasRef} context={context} />

      {/* Screen Share */}
      <ScreenShare socket={socket} roomId={roomId} />

      {/* File Share */}
      <FileShare socket={socket} roomId={roomId} currentUser={currentUser} />

      {/* Session Recorder */}
      <SessionRecorder canvasRef={canvasRef} />
    </div>
  );
}
