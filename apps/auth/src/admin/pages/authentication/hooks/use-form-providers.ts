import { useQuery } from "@tanstack/react-query";
import { fetchFormProviders } from "../../../api/authentication";
import { authenticationKeys } from "./keys";

export function useFormProviders() {
    return useQuery({
        queryKey: authenticationKeys.formProviders(),
        queryFn: () => fetchFormProviders()
    });
}
