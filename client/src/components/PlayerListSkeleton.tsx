export function PlayerListSkeleton() {
    return (
        <div className="bg-white rounded-lg shadow-lg h-full overflow-hidden flex flex-col">
            {/* Header */}
            <div className="p-4 bg-gray-50 border-b border-gray-200">
                <div className="flex items-center justify-between">
                    <div className="h-7 bg-gray-200 rounded animate-pulse w-32"></div>
                    <div className="h-8 bg-gray-200 rounded-full animate-pulse w-8"></div>
                </div>
            </div>

            {/* Loading players */}
            <div className="flex-1 p-4 space-y-3">
                {[...Array(3)].map((_, index) => (
                    <div
                        key={index}
                        className="flex items-center gap-3 p-3 rounded-lg animate-pulse"
                    >
                        {/* Emoji placeholder */}
                        <div className="w-8 h-8 bg-gray-200 rounded-full"></div>

                        {/* Player info */}
                        <div className="flex-1 space-y-2">
                            <div className="h-4 bg-gray-200 rounded w-24"></div>
                            <div className="h-3 bg-gray-200 rounded w-16"></div>
                        </div>

                        {/* Status indicator */}
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-gray-200 rounded-full"></div>
                            <div className="h-3 bg-gray-200 rounded w-12"></div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}