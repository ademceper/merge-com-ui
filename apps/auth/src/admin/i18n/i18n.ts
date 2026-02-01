/**
 * This file has been claimed for ownership from @keycloakify/keycloak-admin-ui version 260502.0.0.
 * To relinquish ownership and restore this file to its original content, run the following command:
 *
 * $ npx keycloakify own --path "admin/i18n/i18n.ts" --revert
 */

/* eslint-disable */

// @ts-nocheck

import { createInstance } from "i18next";
import type { i18n as i18nType } from "i18next";
import FetchBackend from "i18next-fetch-backend";
import { initReactI18next } from "react-i18next";

import { environment } from "../environment";
import { joinPath } from "../utils/joinPath";

type KeyValue = { key: string; value: string };

export const DEFAULT_LOCALE = "en";
export const KEY_SEPARATOR = ".";

export const i18n: i18nType = createInstance({
    fallbackLng: ["tr", "en"],
    supportedLngs: ["tr", "en"],
    keySeparator: KEY_SEPARATOR,
    nsSeparator: false,
    interpolation: {
        escapeValue: false
    },
    defaultNS: [environment.realm],
    ns: [environment.realm],
    backend: {
        loadPath: joinPath(environment.adminBaseUrl, `resources/{{ns}}/admin/{{lng}}`),
        parse: (data: string) => {
            const messages: KeyValue[] = JSON.parse(data);
            return Object.fromEntries(messages.map(({ key, value }) => [key, value]));
        }
    }
});

i18n.use(FetchBackend);
i18n.use(initReactI18next);

// Account gibi özel çeviriler (sunucu çevirilerini override eder)
const customTranslations = {
    en: {
        logo: "Identity",
        brandName: "Identity Admin",
        manageAccount: "Manage Account",
        realmInfo: "Realm info",
        clearCachesTitle: "Clear caches",
        helpEnabled: "Help enabled",
        helpDisabled: "Help disabled",
        signOut: "Sign out"
    },
    tr: {
        logo: "Identity",
        brandName: "Identity Yönetim",
        manageAccount: "Hesabı Yönet",
        realmInfo: "Realm bilgisi",
        clearCachesTitle: "Önbelleği temizle",
        helpEnabled: "Yardım açık",
        helpDisabled: "Yardım kapalı",
        signOut: "Çıkış yap"
    }
};

const originalInit = i18n.init.bind(i18n);
i18n.init = function (options?: object) {
    return originalInit(options).then(() => {
        const realm = environment.realm;
        i18n.addResourceBundle("en", realm, customTranslations.en, true, true);
        i18n.addResourceBundle("tr", realm, customTranslations.tr, true, true);
        return i18n;
    }) as ReturnType<typeof originalInit>;
};
