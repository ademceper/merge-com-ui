import { DEFAULT_LOCALE } from "@merge-rd/i18n";
import { useMemo } from "react";
import { useRealm } from "../../app/providers/realm-context/realm-context";

export function useLocale() {
    const { realmRepresentation: realm } = useRealm();

    const defaultSupportedLocales = useMemo(() => {
        return realm?.supportedLocales?.length
            ? realm.supportedLocales
            : [DEFAULT_LOCALE];
    }, [realm]);

    const defaultLocales = useMemo(() => {
        return realm?.defaultLocale?.length ? [realm.defaultLocale] : [];
    }, [realm]);

    const combinedLocales = useMemo(() => {
        return Array.from(new Set([...defaultLocales, ...defaultSupportedLocales]));
    }, [defaultLocales, defaultSupportedLocales]);

    return combinedLocales;
}
