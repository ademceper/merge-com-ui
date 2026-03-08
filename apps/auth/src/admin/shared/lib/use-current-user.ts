import { useCurrentUser as useCurrentUserQuery } from "../api/use-current-user";

export function useCurrentUser() {
    const { data: currentUser } = useCurrentUserQuery();
    return currentUser;
}
