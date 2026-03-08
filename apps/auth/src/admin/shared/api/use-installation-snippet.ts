import { useQuery } from "@tanstack/react-query";
import { fetchInstallationSnippet } from "../../api/shared";
import { useRealm } from "../../app/providers/realm-context/realm-context";
import { sharedKeys } from "./keys";

export function useInstallationSnippet(
    id: string,
    selected: string,
    mediaType: string | undefined
) {
    const { realm } = useRealm();
    return useQuery({
        queryKey: sharedKeys.installationProviders.snippet(id, selected),
        queryFn: (): Promise<string | ArrayBuffer> =>
            fetchInstallationSnippet(id, selected, mediaType, realm)
    });
}
