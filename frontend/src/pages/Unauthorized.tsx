import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { ROLE_HOME } from "@/utils/roleConfig";

export default function Unauthorized() {
  const { role } = useAuth();
  const navigate = useNavigate();

  const home = role ? ROLE_HOME[role] : "/login";

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
      <p className="text-4xl font-bold text-muted-foreground">403</p>
      <p className="text-lg font-medium">Access Denied</p>
      <p className="text-sm text-muted-foreground">
        You don't have permission to view this page.
      </p>
      <button
        onClick={() => navigate(home)}
        className="rounded bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
      >
        Go to my home
      </button>
    </div>
  );
}
