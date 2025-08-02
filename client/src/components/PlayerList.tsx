import { usePlayerStore } from "../stores/playerStore";

interface Player {
  id: string;
  name: string;
  emoji: string;
  isOnline: boolean;
}

const connectedPlayers: Player[] = [];

export function PlayerList() {
  const { playerInfo } = usePlayerStore();

  const onlinePlayers = connectedPlayers.filter((p) => p.isOnline);
  const totalPlayers = onlinePlayers.length + (playerInfo ? 1 : 0); // +1 for current user

  return (
    <div className="bg-white rounded-lg shadow-lg h-full overflow-hidden flex flex-col">
      {/* Header */}
      <div className="p-4 bg-gray-50 border-b border-gray-200">
        <h2 className="text-gray-700 font-bold text-lg flex items-center justify-between">
          Active Players
          <span className="bg-blue-500 text-white text-sm font-bold px-3 py-1 rounded-full">
            {totalPlayers}
          </span>
        </h2>
      </div>

      {/* All players list */}
      <div className="flex-1 p-4 overflow-y-auto">
        <div className="space-y-3">
          {playerInfo && (
            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <span className="text-xl">{playerInfo.emoji}</span>
              <div className="flex-1">
                <div className="font-medium text-gray-800">
                  {playerInfo.name}
                </div>
                <div className="text-blue-600 text-sm">You</div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-green-600 text-sm font-medium">
                  Online
                </span>
              </div>
            </div>
          )}

          {connectedPlayers.map((player) => (
            <div
              key={player.id}
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50"
            >
              <span className="text-xl">{player.emoji}</span>
              <div className="flex-1">
                <div className="font-medium text-gray-800">{player.name}</div>
              </div>
              <div className="flex items-center gap-2">
                <div
                  className={`w-3 h-3 rounded-full ${player.isOnline ? "bg-green-500" : "bg-gray-400"
                    }`}
                ></div>
                <span
                  className={`text-sm font-medium ${player.isOnline ? "text-green-600" : "text-gray-500"
                    }`}
                >
                  {player.isOnline ? "Online" : "Offline"}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
