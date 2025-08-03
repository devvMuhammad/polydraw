import { useRef, useEffect, useState, useCallback } from "react";
import { getSocket, sendMessage } from "../service/websocket";
import type { Message } from "../types";
import { usePlayerStore } from "../stores/playerStore";
import { throttle } from "lodash";


const socket = getSocket();

export function useCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [selectedColor, setSelectedColor] = useState("#FF6B6B");
  const [strokeWidth, setStrokeWidth] = useState(5);
  const { playerInfo } = usePlayerStore();

  // Buffering for path drawing
  const pointsBuffer = useRef<{ x: number; y: number }[]>([]);

  const sendPath = useCallback(() => {
    if (pointsBuffer.current.length > 0 && playerInfo) {
      sendMessage({
        type: "path",
        payload: {
          points: [...pointsBuffer.current],
          id: playerInfo.id,
          playerName: playerInfo.name,
          playerEmoji: playerInfo.emoji,
          color: selectedColor,
          strokeWidth: strokeWidth,
        },
      } as Message).catch(error => {
        console.error("Failed to send path:", error);
      });
      const lastPoint = pointsBuffer.current.at(-1);
      pointsBuffer.current = lastPoint ? [lastPoint] : [];
    }
  }, [playerInfo, selectedColor, strokeWidth]);

  // Throttled version that sends buffered points every 100ms
  const sendPathThrottled = useCallback(
    throttle(sendPath, 150),
    [sendPath]
  );

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
      pointsBuffer.current = [coords];
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDrawing || !playerInfo) return;
      const rect = canvas.getBoundingClientRect();
      const coords = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };

      ctx.lineTo(coords.x, coords.y);
      ctx.stroke();

      // Buffer the point and trigger throttled send
      pointsBuffer.current.push(coords);
      sendPathThrottled();
    };

    const handleMouseUp = () => {
      if (!isDrawing) return;
      ctx.closePath();
      setIsDrawing(false);

      pointsBuffer.current = [];
    };

    function handleDraw(event: MessageEvent) {
      const data = JSON.parse(event.data) as Message;
      console.log("Draw event", data);

      if (data.type === "draw" && ctx) {
        const payload = data.payload;
        ctx.moveTo(payload.x, payload.y);
        ctx.lineTo(payload.x, payload.y);
        ctx.stroke();
      } else if (data.type === "path" && ctx) {
        const payload = data.payload;
        if (payload.points.length > 0) {
          ctx.save();
          ctx.strokeStyle = payload.color;
          ctx.lineWidth = payload.strokeWidth;

          ctx.beginPath();
          ctx.moveTo(payload.points[0].x, payload.points[0].y);
          if (payload.points.length === 1) {
            // Draw a dot for a single point
            ctx.fillStyle = payload.color;
            ctx.arc(payload.points[0].x, payload.points[0].y, payload.strokeWidth / 2, 0, 2 * Math.PI);
            ctx.fill();
          }
          for (let i = 1; i < payload.points.length; i++) {
            ctx.lineTo(payload.points[i].x, payload.points[i].y);
          }
          ctx.stroke();
          ctx.restore();
        }
      } else if (data.type === "clear" && ctx && canvas) {
        // Clear the canvas when receiving a clear event
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }

    socket.addEventListener("message", handleDraw);
    canvas.addEventListener("mousedown", handleMouseDown);
    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mouseup", handleMouseUp);
    canvas.addEventListener("mouseleave", handleMouseUp); // Stop drawing if cursor leaves canvas

    return () => {
      canvas.removeEventListener("mousedown", handleMouseDown);
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("mouseup", handleMouseUp);
      canvas.removeEventListener("mouseleave", handleMouseUp);
      socket.removeEventListener("message", handleDraw);

      // Cancel any pending throttled calls
      sendPathThrottled.cancel();
    };
  }, [isDrawing, playerInfo, selectedColor, strokeWidth, sendPathThrottled]);

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

    // Broadcast clear event to all clients
    if (playerInfo) {
      sendMessage({
        type: "clear",
        payload: {
          id: playerInfo.id,
          playerName: playerInfo.name,
          playerEmoji: playerInfo.emoji,
        },
      } as Message).catch(error => {
        console.error("Failed to send clear event:", error);
      });
    }
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
