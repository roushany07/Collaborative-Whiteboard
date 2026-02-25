import { useEffect, useRef, useState } from 'react';

export default function Canvas({ socket, roomId, tool, color, brushSize, canvasData }) {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [context, setContext] = useState(null);
  const [history, setHistory] = useState([]);
  const [historyStep, setHistoryStep] = useState(-1);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    setContext(ctx);
    saveState();
  }, []);

  useEffect(() => {
    if (!socket) return;

    socket.on('draw', (drawData) => {
      drawLine(drawData, false);
    });

    socket.on('clear-canvas', () => {
      clearCanvas(false);
    });

    socket.on('load-canvas', (data) => {
      if (data && context) {
        const img = new Image();
        img.onload = () => {
          context.drawImage(img, 0, 0);
          saveState();
        };
        img.src = data;
      }
    });

    socket.on('undo', () => {
      undo(false);
    });

    socket.on('redo', () => {
      redo(false);
    });

    return () => {
      socket.off('draw');
      socket.off('clear-canvas');
      socket.off('load-canvas');
      socket.off('undo');
      socket.off('redo');
    };
  }, [socket, context]);

  const saveState = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const newHistory = history.slice(0, historyStep + 1);
    newHistory.push(canvas.toDataURL());
    setHistory(newHistory);
    setHistoryStep(newHistory.length - 1);
  };

  const startDrawing = (e) => {
    setIsDrawing(true);
    const { offsetX, offsetY } = getCoordinates(e);
    context.beginPath();
    context.moveTo(offsetX, offsetY);
  };

  const draw = (e) => {
    if (!isDrawing) return;

    const { offsetX, offsetY } = getCoordinates(e);
    
    const drawData = {
      x0: context.currentX || offsetX,
      y0: context.currentY || offsetY,
      x1: offsetX,
      y1: offsetY,
      color: tool === 'eraser' ? '#FFFFFF' : color,
      brushSize: tool === 'eraser' ? brushSize * 3 : brushSize
    };

    drawLine(drawData, true);
    
    if (socket) {
      socket.emit('draw', { roomId, drawData });
    }

    context.currentX = offsetX;
    context.currentY = offsetY;
  };

  const stopDrawing = () => {
    if (isDrawing) {
      setIsDrawing(false);
      context.currentX = null;
      context.currentY = null;
      saveState();
    }
  };

  const drawLine = (drawData, isLocal) => {
    if (!context) return;

    context.strokeStyle = drawData.color;
    context.lineWidth = drawData.brushSize;
    
    context.beginPath();
    context.moveTo(drawData.x0, drawData.y0);
    context.lineTo(drawData.x1, drawData.y1);
    context.stroke();
  };

  const clearCanvas = (emit = true) => {
    const canvas = canvasRef.current;
    context.clearRect(0, 0, canvas.width, canvas.height);
    saveState();
    
    if (emit && socket) {
      socket.emit('clear-canvas', { roomId });
    }
  };

  const undo = (emit = true) => {
    if (historyStep > 0) {
      const newStep = historyStep - 1;
      setHistoryStep(newStep);
      restoreState(newStep);
      
      if (emit && socket) {
        socket.emit('undo', { roomId });
      }
    }
  };

  const redo = (emit = true) => {
    if (historyStep < history.length - 1) {
      const newStep = historyStep + 1;
      setHistoryStep(newStep);
      restoreState(newStep);
      
      if (emit && socket) {
        socket.emit('redo', { roomId });
      }
    }
  };

  const restoreState = (step) => {
    const canvas = canvasRef.current;
    const img = new Image();
    img.onload = () => {
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.drawImage(img, 0, 0);
    };
    img.src = history[step];
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
      offsetX: e.nativeEvent.offsetX,
      offsetY: e.nativeEvent.offsetY
    };
  };

  const saveCanvas = async () => {
    const canvas = canvasRef.current;
    const dataURL = canvas.toDataURL();
    
    const link = document.createElement('a');
    link.download = `whiteboard-${Date.now()}.png`;
    link.href = dataURL;
    link.click();
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
      className="w-full h-full cursor-crosshair bg-white"
    />
  );
}
