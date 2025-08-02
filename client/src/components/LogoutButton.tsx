import { useNavigate } from "react-router-dom";
import { usePlayerStore } from "../stores/playerStore";

export function LogoutButton() {
    const { clearPlayerInfo } = usePlayerStore();
    const navigate = useNavigate();

    const handleLogout = () => {
        clearPlayerInfo();
        navigate("/");
    };

    return (
        <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors"
        >
            Logout
        </button>
    );
}
