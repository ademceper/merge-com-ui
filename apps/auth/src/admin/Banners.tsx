/**
 * WARNING: Before modifying this file, run the following command:
 *
 * $ npx keycloakify own --path "admin/Banners.tsx"
 *
 * This file is provided by @keycloakify/keycloak-admin-ui version 260502.0.0.
 * It was copied into your repository by the postinstall script: `keycloakify sync-extensions`.
 */

/* eslint-disable */

// @ts-nocheck

import { Alert, AlertDescription } from "@merge/ui/components/alert";
import { Warning } from "@phosphor-icons/react";
import { useWhoAmI } from "./context/whoami/WhoAmI";
import { useTranslation } from "react-i18next";
import { cn } from "@merge/ui/lib/utils";

type WarnBannerProps = {
    msg: string;
    className?: string;
};

type EventsBannerType = "userEvents" | "adminEvents";

const WarnBanner = ({ msg, className }: WarnBannerProps) => {
    const { t } = useTranslation();

    return (
        <Alert
            role="status"
            aria-live="polite"
            className={cn(
                "border-amber-500/50 bg-amber-500/10 flex flex-wrap items-center gap-2",
                className
            )}
        >
            <Warning className="size-4 shrink-0" aria-hidden />
            <AlertDescription className="text-foreground mb-0">
                {t(msg)}
            </AlertDescription>
        </Alert>
    );
};

export const Banners = () => {
    const { whoAmI } = useWhoAmI();

    if (whoAmI.temporary) return <WarnBanner msg="loggedInAsTempAdminUser" />;
    return null;
};

export const EventsBanners = ({ type }: { type: EventsBannerType }) => {
    const msg = type === "userEvents" ? "savingUserEventsOff" : "savingAdminEventsOff";

    return <WarnBanner msg={msg} className="mt-4 mx-4" />;
};
