import { Navigate } from "react-router-dom";
import { useRealm } from "../../app/providers/realm-context/realm-context";

export default function RedirectToOrganizations() {
    const { realm } = useRealm();
    return <Navigate to={`/${realm}/organizations`} replace />;
}
