import { useState } from 'react';
import { Palette } from 'lucide-react';

export default function BackgroundPicker({ canvasRef, context }) {
  const [isOpen, setIsOpen] = useState(false);

  const colors = [
    '#FFFFFF', '#F3F4F6', '#E5E7EB', '#D1D5DB',
    '#FEE2E2', '#FECACA', '#FCA5A5', '#F87171',
    '#DBEAFE', '#BFDBFE', '#93C5FD', '#60A5FA',
    '#D1FAE5', '#A7F3D0', '#6EE7B7', '#34D399',
    '#FEF3C7', '#FDE68A', '#FCD34D', '#FBBF24'
  ];

  const changeBackground = (color) => {
    if (!canvasRef.current || !context) return;
    
    const canvas = canvasRef.current;
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    tempCtx.drawImage(canvas, 0, 0);
    
    context.fillStyle = color;
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(tempCanvas, 0, 0);
    
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-md hover:bg-gray-100"
        title="Background Color"
      >
        <Palette className="w-4 h-4" />
      </button>

      {isOpen && (
        <div className="absolute left-full ml-2 top-0 bg-white border-2 border-gray-300 rounded-lg p-2 shadow-lg z-50">
          <div className="grid grid-cols-4 gap-1 w-36">
            {colors.map((color) => (
              <button
                key={color}
                onClick={() => changeBackground(color)}
                className="w-7 h-7 rounded border border-gray-300 hover:border-blue-500"
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
