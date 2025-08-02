import { useEffect } from "react";
import { useCanvas } from "../hooks/useCanvas";
import { Toolbar } from "../components/Toolbar";
import { CurrentSelection } from "../components/CurrentSelection";
import { ChatPanel } from "../components/ChatPanel";
import { PlayerList } from "../components/PlayerList";
import { Toaster } from "sonner";

import { LogoutButton } from "../components/LogoutButton";
import { getSocket } from "../service/websocket";


export function GamePage() {
  const {
    canvasRef,
    selectedColor,
    setSelectedColor,
    strokeWidth,
    setStrokeWidth,
    clearCanvas,
    copyCanvas,
    downloadCanvas,
  } = useCanvas();

  // Initialize websocket connection when game page loads
  useEffect(() => {
    getSocket();
  }, []);

  return (
    <main className="bg-gray-100 min-h-screen p-4">
      <Toaster />

      {/* Center the main content */}
      <div className="flex items-center justify-center min-h-full">
        <div className="flex flex-col lg:flex-row gap-4 items-start">
          {/* Player List - Left side */}
          <div className="w-full flex flex-col gap-4 lg:w-64 h-[600px]">
            <PlayerList />
            <LogoutButton />
          </div>

          {/* Canvas and tools */}
          <div className="flex flex-col items-center gap-4">
            <Toolbar
              selectedColor={selectedColor}
              onColorChange={setSelectedColor}
              strokeWidth={strokeWidth}
              onStrokeWidthChange={setStrokeWidth}
              onClear={clearCanvas}
              onCopy={copyCanvas}
              onDownload={downloadCanvas}
            />

            <div className="relative">
              <canvas
                ref={canvasRef}
                width={600}
                height={600}
                className="bg-white rounded-lg shadow-lg border-2 border-gray-200 cursor-crosshair"
                style={{ touchAction: "none" }}
              />
            </div>

            <CurrentSelection
              selectedColor={selectedColor}
              strokeWidth={strokeWidth}
            />
          </div>

          {/* Chat Panel - Right side */}
          <div className="w-full lg:w-96 h-[800px]">
            <ChatPanel />
          </div>
        </div>
      </div>
    </main>
  );
}
