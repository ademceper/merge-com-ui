import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRealm } from "../../../app/providers/realm-context/realm-context";
import { deleteRealmLocalizationTexts } from "../../../api/realm-settings";
import { realmSettingsKeys } from "./keys";

export function useDeleteLocalization() {
    const { realm } = useRealm();
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({
            selectedLocale,
            key
        }: {
            selectedLocale: string;
            key: string;
        }) => deleteRealmLocalizationTexts(realm, selectedLocale, key),
        onSuccess: (_data, { selectedLocale }) => {
            queryClient.invalidateQueries({
                queryKey: realmSettingsKeys.realmLocalizationTexts(realm, selectedLocale)
            });
        }
    });
}
