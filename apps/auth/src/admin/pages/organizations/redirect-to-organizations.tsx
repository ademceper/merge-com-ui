import { Navigate } from "@tanstack/react-router";
import { useRealm } from "@/admin/app/providers/realm-context/realm-context";

export function RedirectToOrganizations() {
    const { realm } = useRealm();
    return <Navigate to={`/${realm}/organizations` as string} replace />;
}
