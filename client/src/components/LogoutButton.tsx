import { useNavigate } from "react-router-dom";
import { usePlayerStore } from "../stores/playerStore";
import { closeSocket } from "../service/websocket";

export function LogoutButton() {
    const { clearPlayerInfo } = usePlayerStore();
    const navigate = useNavigate();

    const handleLogout = () => {
        closeSocket();
        clearPlayerInfo();
        navigate("/");
    };

    return (
        <button
            onClick={handleLogout}
            className="cursor-pointer px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors"
        >
            Logout
        </button>
    );
}
