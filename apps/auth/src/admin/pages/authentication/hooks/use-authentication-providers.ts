import { useQuery } from "@tanstack/react-query";
import { fetchAuthenticationProviders } from "../../../api/authentication";
import { authenticationKeys } from "./keys";

export function useAuthenticationProviders() {
    return useQuery({
        queryKey: authenticationKeys.providers(),
        queryFn: () => fetchAuthenticationProviders()
    });
}
