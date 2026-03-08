import { useQuery } from "@tanstack/react-query";
import { useAdminClient } from "../../../app/admin-client";
import { useRealm } from "../../../app/providers/realm-context/realm-context";
import { fetchRealmLocalizationTexts } from "../../../api/realm-settings";
import { realmSettingsKeys } from "./keys";

export function useRealmLocalizationTexts(
    locales: string[],
    translationKey: string,
    deps: { first: number; max: number; filter: string }
) {
    const { adminClient } = useAdminClient();
    const { realm } = useRealm();
    return useQuery({
        queryKey: [
            ...realmSettingsKeys.all,
            "translationTexts",
            realm,
            translationKey,
            deps.first,
            deps.max,
            deps.filter
        ] as const,
        queryFn: async () => {
            const selectedLocales = locales.slice(deps.first, deps.first + deps.max + 1);
            const results = await Promise.all(
                selectedLocales.map(selectedLocale =>
                    fetchRealmLocalizationTexts(adminClient, realm, selectedLocale)
                )
            );
            return results.map((result, index) => ({
                locale: selectedLocales[index],
                value: result[translationKey]
            }));
        },
        enabled: locales.length > 0
    });
}
