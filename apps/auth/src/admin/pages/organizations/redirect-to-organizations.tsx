import { Navigate } from "@tanstack/react-router";
import { useRealm } from "../../app/providers/realm-context/realm-context";

export default function RedirectToOrganizations() {
    const { realm } = useRealm();
    return <Navigate to={`/${realm}/organizations` as string} replace />;
}
