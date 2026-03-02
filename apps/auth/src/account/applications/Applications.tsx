/**
 * This file has been claimed for ownership from @keycloakify/keycloak-account-ui version 260502.0.2.
 * To relinquish ownership and restore this file to its original content, run the following command:
 *
 * $ npx keycloakify own --path "account/applications/Applications.tsx" --revert
 */

/* eslint-disable */

// @ts-nocheck

import {
    label,
    useEnvironment
} from "../../shared/keycloak-ui-shared";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger
} from "@merge/ui/components/alert-dialog";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { deleteConsent, getApplications } from "../api/methods";
import { ClientRepresentation } from "../api/representations";
import { Page } from "../components/page/Page";
import { TFuncKey } from "../i18n";
import { formatDate } from "../utils/formatDate";
import { useAccountAlerts } from "../utils/useAccountAlerts";
import { usePromise } from "../utils/usePromise";
import { Button } from "@merge/ui/components/button";
import { Badge } from "@merge/ui/components/badge";
import { AppWindow, ArrowSquareOut, Check, Info, CaretDown, CaretUp } from "@phosphor-icons/react";

type Application = ClientRepresentation & {
    open: boolean;
};

export const Applications = () => {
    const { t } = useTranslation();
    const context = useEnvironment();
    const { addAlert, addError } = useAccountAlerts();

    const [applications, setApplications] = useState<Application[]>();
    const [key, setKey] = useState(1);
    const refresh = () => setKey(key + 1);

    usePromise(
        signal => getApplications({ signal, context }),
        clients => setApplications(clients.map(c => ({ ...c, open: false }))),
        [key]
    );

    const toggleOpen = (clientId: string) => {
        setApplications([
            ...applications!.map(a =>
                a.clientId === clientId ? { ...a, open: !a.open } : a
            )
        ]);
    };

    const removeConsent = async (id: string) => {
        try {
            await deleteConsent(context, id);
            refresh();
            addAlert(t("removeConsentSuccess"));
        } catch (error) {
            addError("removeConsentError", error);
        }
    };

    if (!applications) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
        );
    }

    return (
        <Page title={t("application")} description={t("applicationsIntroMessage")}>
            <div id="applications-list" className="space-y-4">
                {applications.map(application => (
                    <div
                        key={application.clientId}
                        className="rounded-md border"
                        data-testid="applications-list-item"
                    >
                        <div
                            className="flex items-center gap-4 p-4 cursor-pointer hover:bg-muted/50 transition-colors"
                            onClick={() => toggleOpen(application.clientId)}
                        >
                            <button
                                type="button"
                                className="shrink-0 text-muted-foreground"
                                id={`toggle-${application.clientId}`}
                                aria-controls={`content-${application.clientId}`}
                                aria-expanded={application.open}
                            >
                                {application.open ? (
                                    <CaretUp className="h-4 w-4" />
                                ) : (
                                    <CaretDown className="h-4 w-4" />
                                )}
                            </button>
                            <div className="flex items-center gap-3 min-w-0 flex-1">
                                <div className="p-2 rounded bg-primary/10 shrink-0">
                                    <AppWindow className="h-5 w-5 text-primary" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    {application.effectiveUrl ? (
                                        <button
                                            type="button"
                                            className="text-sm font-medium text-primary hover:underline inline-flex items-center gap-1"
                                            onClick={e => {
                                                e.stopPropagation();
                                                window.open(application.effectiveUrl);
                                            }}
                                        >
                                            {label(
                                                t,
                                                application.clientName ||
                                                    application.clientId
                                            )}
                                            <ArrowSquareOut className="h-3.5 w-3.5" />
                                        </button>
                                    ) : (
                                        <span className="text-sm font-medium">
                                            {label(
                                                t,
                                                application.clientName ||
                                                    application.clientId
                                            )}
                                        </span>
                                    )}
                                </div>
                            </div>
                            <div className="hidden sm:block text-sm text-muted-foreground min-w-0 flex-1">
                                {application.userConsentRequired
                                    ? t("thirdPartyApp")
                                    : t("internalApp")}
                                {application.offlineAccess
                                    ? ", " + t("offlineAccess")
                                    : ""}
                            </div>
                            <Badge variant={application.inUse ? "default" : "secondary"} className="shrink-0">
                                {application.inUse ? t("inUse") : t("notInUse")}
                            </Badge>
                        </div>

                        {application.open && (
                            <div
                                id={`content-${application.clientId}`}
                                className="border-t px-4 py-4 space-y-4"
                            >
                                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
                                    <div>
                                        <dt className="font-medium">{t("client")}</dt>
                                        <dd className="text-muted-foreground">{application.clientId}</dd>
                                    </div>
                                    {application.description && (
                                        <div>
                                            <dt className="font-medium">{t("description")}</dt>
                                            <dd className="text-muted-foreground">
                                                {application.description}
                                            </dd>
                                        </div>
                                    )}
                                    {application.effectiveUrl && (
                                        <div>
                                            <dt className="font-medium">URL</dt>
                                            <dd className="text-muted-foreground break-all">
                                                {application.effectiveUrl.split('"')}
                                            </dd>
                                        </div>
                                    )}
                                </dl>
                                {application.consent && (
                                    <div className="space-y-3">
                                        <div>
                                            <div className="text-sm font-medium mb-2">
                                                {t("hasAccessTo")}
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                {application.consent.grantedScopes.map(
                                                    scope => (
                                                        <Badge
                                                            key={`scope${scope.id}`}
                                                            variant="secondary"
                                                            className="text-xs inline-flex items-center gap-1"
                                                        >
                                                            <Check className="h-3 w-3" />
                                                            {t(
                                                                scope.name as TFuncKey,
                                                                scope.displayText
                                                            )}
                                                        </Badge>
                                                    )
                                                )}
                                            </div>
                                        </div>
                                        {application.tosUri && (
                                            <div className="text-sm">
                                                <span className="font-medium">{t("termsOfService")}: </span>
                                                <span className="text-muted-foreground">{application.tosUri}</span>
                                            </div>
                                        )}
                                        {application.policyUri && (
                                            <div className="text-sm">
                                                <span className="font-medium">{t("privacyPolicy")}: </span>
                                                <span className="text-muted-foreground">{application.policyUri}</span>
                                            </div>
                                        )}
                                        {application.logoUri && (
                                            <div>
                                                <div className="text-sm font-medium mb-1">{t("logo")}</div>
                                                <img src={application.logoUri} className="h-10" />
                                            </div>
                                        )}
                                        <div className="text-sm text-muted-foreground">
                                            {t("accessGrantedOn")}:{" "}
                                            {formatDate(
                                                new Date(application.consent.createdDate)
                                            )}
                                        </div>
                                    </div>
                                )}
                                {(application.consent || application.offlineAccess) && (
                                    <div className="pt-4 border-t space-y-3">
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button variant="secondary" size="sm">
                                                    {t("removeAccess")}
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>{t("removeAccess")}</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        {t("removeModalMessage", {
                                                            name: application.clientId
                                                        })}
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
                                                    <AlertDialogAction variant="destructive" onClick={() => removeConsent(application.clientId)}>
                                                        {t("confirm")}
                                                    </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                                            <Info className="h-4 w-4 shrink-0" />
                                            {t("infoMessage")}
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </Page>
    );
};

export default Applications;
