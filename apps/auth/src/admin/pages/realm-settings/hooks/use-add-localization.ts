import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRealm } from "../../../app/providers/realm-context/realm-context";
import { addLocalization } from "../../../api/realm-settings";
import { realmSettingsKeys } from "./keys";

export function useAddLocalization() {
    const { realm } = useRealm();
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({
            selectedLocale,
            key,
            value
        }: {
            selectedLocale: string;
            key: string;
            value: string;
        }) => addLocalization(realm, selectedLocale, key, value),
        onSuccess: (_data, { selectedLocale }) => {
            queryClient.invalidateQueries({
                queryKey: realmSettingsKeys.realmLocalizationTexts(realm, selectedLocale)
            });
        }
    });
}
