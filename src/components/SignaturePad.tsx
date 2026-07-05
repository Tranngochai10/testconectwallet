import React, { useState } from 'react';
import { Edit2 } from 'lucide-react';

interface SignaturePadProps {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  hasSignedHandwritten: boolean;
  setHasSignedHandwritten: (val: boolean) => void;
}

export const SignaturePad: React.FC<SignaturePadProps> = ({
  canvasRef,
  hasSignedHandwritten,
  setHasSignedHandwritten
}) => {
  const [isDrawing, setIsDrawing] = useState(false);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.strokeStyle = '#4f46e5';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';

    const rect = canvas.getBoundingClientRect();
    let clientX = 0;
    let clientY = 0;

    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    ctx.beginPath();
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    let clientX = 0;
    let clientY = 0;

    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.stroke();
    setHasSignedHandwritten(true);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignedHandwritten(false);
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-1">
          <Edit2 className="w-3 h-3 text-indigo-500" />
          <span>Signature Board</span>
        </label>
        <button 
          type="button" 
          onClick={clearCanvas} 
          className="text-[10px] font-bold text-indigo-600 hover:text-indigo-700 hover:underline"
        >
          Clear Board
        </button>
      </div>
      
      <div className="border border-slate-200 rounded-2xl bg-slate-50 overflow-hidden h-40 relative">
        <canvas
          ref={canvasRef}
          width={400}
          height={160}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className="w-full h-full cursor-crosshair touch-none"
        />
        {!hasSignedHandwritten && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-xs text-slate-400 select-none">
            Sign here using mouse or touch
          </div>
        )}
      </div>
    </div>
  );
};
