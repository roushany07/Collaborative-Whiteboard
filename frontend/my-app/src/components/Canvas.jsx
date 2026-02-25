import { useEffect, useRef, useState, forwardRef } from 'react';
import api from '../api/axios';

const Canvas = forwardRef(({ socket, roomId, tool, color, brushSize, canvasData, onContextReady, onUndoRedo }, ref) => {
  const canvasRef = ref || useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [context, setContext] = useState(null);
  const [history, setHistory] = useState([]);
  const [historyStep, setHistoryStep] = useState(-1);
  const [textBoxes, setTextBoxes] = useState([]);
  const saveTimeoutRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    const resizeCanvas = () => {
      const parent = canvas.parentElement;
      canvas.width = parent.clientWidth;
      canvas.height = parent.clientHeight;
      
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      if (canvasData) {
        const img = new Image();
        img.onload = () => {
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          saveToHistory();
        };
        img.src = canvasData;
      } else {
        saveToHistory();
      }
    };
    
    resizeCanvas();
    setContext(ctx);
    if (onContextReady) onContextReady(ctx);
    
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, []);

  useEffect(() => {
    if (onUndoRedo) {
      onUndoRedo({
        undo: () => {
          if (historyStep > 0) {
            const newStep = historyStep - 1;
            setHistoryStep(newStep);
            restoreFromHistory(newStep);
          }
        },
        redo: () => {
          if (historyStep < history.length - 1) {
            const newStep = historyStep + 1;
            setHistoryStep(newStep);
            restoreFromHistory(newStep);
          }
        }
      });
    }
  }, [historyStep, history, onUndoRedo]);

  useEffect(() => {
    if (!socket || !context) return;

    const handleDraw = (drawData) => {
      drawLine(drawData);
    };

    const handleClear = () => {
      clearCanvas(false);
    };

    const handleUndo = () => {
      if (historyStep > 0) {
        const newStep = historyStep - 1;
        setHistoryStep(newStep);
        restoreFromHistory(newStep);
      }
    };

    const handleRedo = () => {
      if (historyStep < history.length - 1) {
        const newStep = historyStep + 1;
        setHistoryStep(newStep);
        restoreFromHistory(newStep);
      }
    };

    socket.on('draw', handleDraw);
    socket.on('clear-canvas', handleClear);
    socket.on('undo', handleUndo);
    socket.on('redo', handleRedo);

    return () => {
      socket.off('draw', handleDraw);
      socket.off('clear-canvas', handleClear);
      socket.off('undo', handleUndo);
      socket.off('redo', handleRedo);
    };
  }, [socket, context, history, historyStep]);

  const saveToHistory = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const newHistory = history.slice(0, historyStep + 1);
    newHistory.push(canvas.toDataURL());
    setHistory(newHistory);
    setHistoryStep(newHistory.length - 1);

    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => {
      saveToDatabase(canvas.toDataURL());
    }, 2000);
  };

  const restoreFromHistory = (step) => {
    if (!context || !history[step]) return;
    const canvas = canvasRef.current;
    const img = new Image();
    img.onload = () => {
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.drawImage(img, 0, 0);
    };
    img.src = history[step];
  };

  const saveToDatabase = async (data) => {
    try {
      await api.post(`/api/rooms/${roomId}/save`, { canvasData: data });
      console.log('Canvas saved');
    } catch (error) {
      console.error('Save failed:', error);
    }
  };

  const startDrawing = (e) => {
    if (tool === 'text') {
      const rect = canvasRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const text = prompt('Enter text:');
      if (text) {
        context.font = '20px Arial';
        context.fillStyle = color;
        context.fillText(text, x, y);
        saveToHistory();
      }
      return;
    }

    setIsDrawing(true);
    const { offsetX, offsetY } = getCoordinates(e);
    context.beginPath();
    context.moveTo(offsetX, offsetY);
    context.currentX = offsetX;
    context.currentY = offsetY;
  };

  const draw = (e) => {
    if (!isDrawing || tool === 'text') return;

    const { offsetX, offsetY } = getCoordinates(e);
    
    const drawData = {
      x0: context.currentX,
      y0: context.currentY,
      x1: offsetX,
      y1: offsetY,
      color: tool === 'eraser' ? '#FFFFFF' : color,
      brushSize: tool === 'eraser' ? brushSize * 3 : brushSize
    };

    drawLine(drawData);
    
    if (socket) {
      socket.emit('draw', { roomId, drawData });
    }

    context.currentX = offsetX;
    context.currentY = offsetY;
  };

  const stopDrawing = () => {
    if (isDrawing) {
      setIsDrawing(false);
      saveToHistory();
    }
  };

  const drawLine = (drawData) => {
    if (!context) return;

    context.strokeStyle = drawData.color;
    context.lineWidth = drawData.brushSize;
    context.beginPath();
    context.moveTo(drawData.x0, drawData.y0);
    context.lineTo(drawData.x1, drawData.y1);
    context.stroke();
  };

  const clearCanvas = (emit = true) => {
    if (!context) return;
    const canvas = canvasRef.current;
    context.fillStyle = '#FFFFFF';
    context.fillRect(0, 0, canvas.width, canvas.height);
    saveToHistory();
    
    if (emit && socket) {
      socket.emit('clear-canvas', { roomId });
    }
  };

  const getCoordinates = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    
    if (e.touches) {
      return {
        offsetX: e.touches[0].clientX - rect.left,
        offsetY: e.touches[0].clientY - rect.top
      };
    }
    
    return {
      offsetX: e.clientX - rect.left,
      offsetY: e.clientY - rect.top
    };
  };

  return (
    <canvas
      ref={canvasRef}
      onMouseDown={startDrawing}
      onMouseMove={draw}
      onMouseUp={stopDrawing}
      onMouseLeave={stopDrawing}
      onTouchStart={startDrawing}
      onTouchMove={draw}
      onTouchEnd={stopDrawing}
      className="w-full h-full cursor-crosshair"
      style={{ display: 'block', backgroundColor: '#FFFFFF' }}
    />
  );
});

Canvas.displayName = 'Canvas';

export default Canvas;
