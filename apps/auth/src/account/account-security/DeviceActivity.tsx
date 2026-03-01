/**
 * This file has been claimed for ownership from @keycloakify/keycloak-account-ui version 260502.0.2.
 * To relinquish ownership and restore this file to its original content, run the following command:
 *
 * $ npx keycloakify own --path "account/account-security/DeviceActivity.tsx" --revert
 */

/* eslint-disable */

// @ts-nocheck

import {
    useEnvironment,
    label
} from "../../shared/keycloak-ui-shared";
import { ContinueCancelModal } from "../components/ContinueCancelModal";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { deleteSession, getDevices } from "../api/methods";
import {
    ClientRepresentation,
    DeviceRepresentation,
    SessionRepresentation
} from "../api/representations";
import { Page } from "../components/page/Page";
import { formatDate } from "../utils/formatDate";
import { useAccountAlerts } from "../utils/useAccountAlerts";
import { usePromise } from "../utils/usePromise";
import { Button } from "@merge/ui/components/button";
import { Badge } from "@merge/ui/components/badge";
import { Monitor, DeviceMobile, ArrowsClockwise } from "@phosphor-icons/react";

export const DeviceActivity = () => {
    const { t } = useTranslation();
    const context = useEnvironment();
    const { addAlert, addError } = useAccountAlerts();

    const [devices, setDevices] = useState<DeviceRepresentation[]>();
    const [key, setKey] = useState(0);
    const refresh = () => setKey(key + 1);

    const moveCurrentToTop = (devices: DeviceRepresentation[]) => {
        let currentDevice = devices[0];

        const index = devices.findIndex(d => d.current);
        currentDevice = devices.splice(index, 1)[0];
        devices.unshift(currentDevice);

        const sessionIndex = currentDevice.sessions.findIndex(s => s.current);
        const currentSession = currentDevice.sessions.splice(sessionIndex, 1)[0];
        currentDevice.sessions.unshift(currentSession);

        setDevices(devices);
    };

    usePromise(signal => getDevices({ signal, context }), moveCurrentToTop, [key]);

    const signOutAll = async () => {
        await deleteSession(context);
        await context.keycloak.logout();
    };

    const signOutSession = async (
        session: SessionRepresentation,
        device: DeviceRepresentation
    ) => {
        try {
            await deleteSession(context, session.id);
            addAlert(t("signedOutSession", { browser: session.browser, os: device.os }));
            refresh();
        } catch (error) {
            addError("errorSignOutMessage", error);
        }
    };

    const makeClientsString = (clients: ClientRepresentation[]): string => {
        let clientsString = "";
        clients.forEach((client, index) => {
            let clientName: string;
            if (client.clientName !== "") {
                clientName = label(t, client.clientName);
            } else {
                clientName = client.clientId;
            }

            clientsString += clientName;

            if (clients.length > index + 1) clientsString += ", ";
        });

        return clientsString;
    };

    if (!devices) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
        );
    }

    return (
        <Page title={t("deviceActivity")} description={t("signedInDevicesExplanation")}>
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">{t("signedInDevices")}</h2>
                <div className="flex items-center gap-2">
                    <Button
                        id="refresh-page"
                        variant="ghost"
                        size="sm"
                        onClick={() => refresh()}
                        className="inline-flex items-center gap-1"
                    >
                        <ArrowsClockwise className="h-4 w-4" />
                        {t("refreshPage")}
                    </Button>

                    {(devices.length > 1 || devices[0].sessions.length > 1) && (
                        <ContinueCancelModal
                            buttonTitle={t("signOutAllDevices")}
                            modalTitle={t("signOutAllDevices")}
                            continueLabel={t("confirm")}
                            cancelLabel={t("cancel")}
                            onContinue={() => signOutAll()}
                        >
                            {t("signOutAllDevicesWarning")}
                        </ContinueCancelModal>
                    )}
                </div>
            </div>
            <div className="space-y-4">
                {devices.map(device =>
                    device.sessions.map((session, index) => (
                        <div
                            key={`${device.id}-${index}`}
                            className="rounded-md border p-4"
                            data-testid={`row-${index}`}
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded bg-primary/10">
                                        {device.mobile ? (
                                            <DeviceMobile className="h-5 w-5 text-primary" />
                                        ) : (
                                            <Monitor className="h-5 w-5 text-primary" />
                                        )}
                                    </div>
                                    <div>
                                        <div className="text-base font-medium flex items-center gap-2">
                                            {device.os
                                                .toLowerCase()
                                                .includes("unknown")
                                                ? t("unknownOperatingSystem")
                                                : device.os}{" "}
                                            {!device.osVersion
                                                .toLowerCase()
                                                .includes("unknown") &&
                                                device.osVersion}{" "}
                                            / {session.browser}
                                            {session.current && (
                                                <Badge variant="default" className="text-xs">
                                                    {t("currentSession")}
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                {!session.current && (
                                    <ContinueCancelModal
                                        buttonTitle={t("signOut")}
                                        modalTitle={t("signOut")}
                                        continueLabel={t("confirm")}
                                        cancelLabel={t("cancel")}
                                        buttonVariant="secondary"
                                        onContinue={() =>
                                            signOutSession(session, device)
                                        }
                                    >
                                        {t("signOutWarning")}
                                    </ContinueCancelModal>
                                )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                <div>
                                    <div className="text-muted-foreground">{t("ipAddress")}</div>
                                    <div className="font-medium">{session.ipAddress}</div>
                                </div>
                                <div>
                                    <div className="text-muted-foreground">{t("lastAccessedOn")}</div>
                                    <div className="font-medium">
                                        {formatDate(new Date(session.lastAccess * 1000))}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-muted-foreground">{t("started")}</div>
                                    <div className="font-medium">
                                        {formatDate(new Date(session.started * 1000))}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-muted-foreground">{t("expires")}</div>
                                    <div className="font-medium">
                                        {formatDate(new Date(session.expires * 1000))}
                                    </div>
                                </div>
                            </div>

                            {session.clients && session.clients.length > 0 && (
                                <div className="mt-4 pt-4 border-t">
                                    <div className="text-sm text-muted-foreground mb-2">
                                        {t("clients")}
                                    </div>
                                    <div className="text-sm font-medium">
                                        {makeClientsString(session.clients)}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </Page>
    );
};

export default DeviceActivity;
