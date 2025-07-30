interface ToolbarProps {
  selectedColor: string;
  onColorChange: (color: string) => void;
  strokeWidth: number;
  onStrokeWidthChange: (width: number) => void;
  onClear: () => void;
  onCopy: () => void;
  onDownload: () => void;
}

const colors = [
  "#FF6B6B", // Red
  "#4ECDC4", // Turquoise
  "#45B7D1", // Blue
  "#96CEB4", // Green
  "#FFEAA7", // Yellow
  "#DDA0DD", // Plum
  "#FFA07A", // Orange
];

const strokeWidths = [
  { size: 3, label: "Thin" },
  { size: 5, label: "Medium" },
  { size: 8, label: "Thick" },
  { size: 12, label: "Extra Thick" },
];

export function Toolbar({
  selectedColor,
  onColorChange,
  strokeWidth,
  onStrokeWidthChange,
  onClear,
  onCopy,
  onDownload,
}: ToolbarProps) {
  return (
    <div className="bg-white rounded-lg shadow-lg p-4 flex flex-wrap items-center justify-center gap-4 w-full max-w-[600px]">
      <div className="flex flex-col items-center">
        <h3 className="text-gray-600 font-bold text-sm mb-2">Color</h3>
        <div className="flex flex-wrap gap-2">
          {colors.map((color) => (
            <button
              key={color}
              onClick={() => onColorChange(color)}
              className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${
                selectedColor === color
                  ? "border-blue-500 scale-110"
                  : "border-white"
              }`}
              style={{ backgroundColor: color }}
              title={`Select ${color}`}
            />
          ))}
        </div>
      </div>

      <div className="flex flex-col items-center">
        <h3 className="text-gray-600 font-bold text-sm mb-2">Brush Size</h3>
        <div className="flex gap-2">
          {strokeWidths.map((width) => (
            <button
              key={width.size}
              onClick={() => onStrokeWidthChange(width.size)}
              className={`w-10 h-10 rounded-full border-2 transition-transform flex items-center justify-center ${
                strokeWidth === width.size
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 bg-white"
              }`}
              title={width.label}
            >
              <div
                className="rounded-full bg-gray-700"
                style={{
                  width: `${width.size}px`,
                  height: `${width.size}px`,
                }}
              />
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col items-center gap-2">
        <h3 className="text-gray-600 font-bold text-sm mb-2">Actions</h3>
        <div className="flex gap-2">
          <button
            onClick={onClear}
            className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-md font-semibold text-sm transition-colors"
          >
            Clear
          </button>
          <button
            onClick={onCopy}
            className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-md font-semibold text-sm transition-colors"
          >
            Copy
          </button>
          <button
            onClick={onDownload}
            className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-md font-semibold text-sm transition-colors"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
