import { useRef, useEffect, useState } from "react";

export function useCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [selectedColor, setSelectedColor] = useState("#FF6B6B");
  const [strokeWidth, setStrokeWidth] = useState(5);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.strokeStyle = selectedColor;
    ctx.lineWidth = strokeWidth;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    const handleMouseDown = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const coords = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
      ctx.beginPath();
      ctx.moveTo(coords.x, coords.y);
      setIsDrawing(true);
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDrawing) return;
      const rect = canvas.getBoundingClientRect();
      const coords = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
      ctx.lineTo(coords.x, coords.y);
      ctx.stroke();
    };

    const handleMouseUp = () => {
      if (!isDrawing) return;
      ctx.closePath();
      setIsDrawing(false);
    };

    canvas.addEventListener("mousedown", handleMouseDown);
    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mouseup", handleMouseUp);
    canvas.addEventListener("mouseleave", handleMouseUp); // Stop drawing if cursor leaves canvas

    return () => {
      canvas.removeEventListener("mousedown", handleMouseDown);
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("mouseup", handleMouseUp);
      canvas.removeEventListener("mouseleave", handleMouseUp);
    };
  }, [isDrawing, selectedColor, strokeWidth]);

  const canvasToBlob = (canvas: HTMLCanvasElement): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (blob) resolve(blob);
        else reject(new Error("Failed to convert canvas to blob"));
      });
    });
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const copyCanvas = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const blob = await canvasToBlob(canvas);
    await navigator.clipboard.write([new ClipboardItem({ [blob.type]: blob })]);
  };

  const downloadCanvas = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const blob = await canvasToBlob(canvas);
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "my-drawing.png";
    a.click();
    URL.revokeObjectURL(url);
  };

  return {
    canvasRef,
    selectedColor,
    setSelectedColor,
    strokeWidth,
    setStrokeWidth,
    clearCanvas,
    copyCanvas,
    downloadCanvas,
  };
}
