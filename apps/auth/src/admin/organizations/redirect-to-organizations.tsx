import { Navigate } from "react-router-dom";
import { useRealm } from "../context/realm-context/RealmContext";

export default function RedirectToOrganizations() {
    const { realm } = useRealm();
    return <Navigate to={`/${realm}/organizations`} replace />;
}
