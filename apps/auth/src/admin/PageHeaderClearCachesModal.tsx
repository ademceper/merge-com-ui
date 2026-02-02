/**
 * WARNING: Before modifying this file, run the following command:
 *
 * $ npx keycloakify own --path "admin/PageHeaderClearCachesModal.tsx"
 *
 * This file is provided by @keycloakify/keycloak-admin-ui version 260502.0.0.
 * It was copied into your repository by the postinstall script: `keycloakify sync-extensions`.
 */

/* eslint-disable */

// @ts-nocheck

import { Button } from "@merge/ui/components/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle
} from "@merge/ui/components/dialog";
import { Separator } from "@merge/ui/components/separator";
import { useRealm } from "./context/realm-context/RealmContext";
import { useAdminClient } from "./admin-client";
import { useTranslation } from "react-i18next";
import { AlertVariant, HelpItem, useAlerts } from "../shared/keycloak-ui-shared";

export type ClearCachesModalProps = {
    onClose: () => void;
};
export const PageHeaderClearCachesModal = ({ onClose }: ClearCachesModalProps) => {
    const { realm: realmName } = useRealm();
    const { t } = useTranslation();
    const { adminClient } = useAdminClient();
    const { addError, addAlert } = useAlerts();

    const clearCache =
        (clearCacheFn: typeof adminClient.cache.clearRealmCache) =>
        async (realm: string) => {
            try {
                await clearCacheFn({ realm });
                addAlert(t("clearCacheSuccess"), AlertVariant.success);
            } catch (error) {
                addError("clearCacheError", error);
            }
        };
    const clearRealmCache = clearCache(adminClient.cache.clearRealmCache);
    const clearUserCache = clearCache(adminClient.cache.clearUserCache);
    const clearKeysCache = clearCache(adminClient.cache.clearKeysCache);
    const clearCrlCache = clearCache(adminClient.cache.clearCrlCache);

    const cacheItems = [
        { label: "realmCache", help: "clearRealmCacheHelp", action: clearRealmCache },
        { label: "userCache", help: "clearUserCacheHelp", action: clearUserCache },
        { label: "keysCache", help: "clearKeysCacheHelp", action: clearKeysCache },
        { label: "crlCache", help: "clearCrlCacheHelp", action: clearCrlCache },
    ];

    return (
        <Dialog open onOpenChange={() => onClose()} >
            <DialogContent onClick={e => e.stopPropagation()}>
                <DialogHeader>
                    <DialogTitle>{t("clearCachesTitle")}</DialogTitle>
                </DialogHeader>
                <div className="flex flex-col">
                    {cacheItems.map((item, index) => (
                        <div key={item.label}>
                            {index > 0 && <Separator />}
                            <div className="flex items-center justify-between py-3">
                                <div>
                                    {t(item.label)}{" "}
                                    <HelpItem
                                        helpText={t(item.help)}
                                        fieldLabelId={item.help}
                                    />
                                </div>
                                <Button onClick={() => item.action(realmName)}>
                                    {t("clearButtonTitle")}
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            </DialogContent>
        </Dialog>
    );
};
