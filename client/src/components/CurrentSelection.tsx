interface CurrentSelectionProps {
  selectedColor: string;
  strokeWidth: number;
}

export function CurrentSelection({
  selectedColor,
  strokeWidth,
}: CurrentSelectionProps) {
  return (
    <div className="mt-4 bg-white rounded-lg shadow-md px-4 py-2 flex items-center gap-4">
      <div className="flex items-center gap-2">
        <span className="text-gray-600 font-bold text-sm">Color:</span>
        <div
          className="w-5 h-5 rounded-full border-2 border-gray-200"
          style={{ backgroundColor: selectedColor }}
        />
      </div>
      <div className="flex items-center gap-2">
        <span className="text-gray-600 font-bold text-sm">Size:</span>
        <div
          className="rounded-full bg-gray-500"
          style={{
            width: `${strokeWidth}px`,
            height: `${strokeWidth}px`,
          }}
        />
      </div>
    </div>
  );
}
