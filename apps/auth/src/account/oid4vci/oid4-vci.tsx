/**
 * This file has been claimed for ownership from @keycloakify/keycloak-account-ui version 260502.0.2.
 * To relinquish ownership and restore this file to its original content, run the following command:
 *
 * $ npx keycloakify own --path "account/oid4vci/Oid4Vci.tsx" --revert
 */

/* eslint-disable */

// @ts-nocheck

import { useEnvironment } from "../../shared/keycloak-ui-shared";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { CaretDown } from "@phosphor-icons/react";

import { getIssuer, requestVCOffer } from "../api";
import { CredentialsIssuer } from "../api/representations";
import { Page } from "../components/page/Page";
import { usePromise } from "../utils/usePromise";

export const Oid4Vci = () => {
    const context = useEnvironment();

    const { t } = useTranslation();

    const initialSelected = t("verifiableCredentialsSelectionDefault");

    const [selected, setSelected] = useState<string>(initialSelected);
    const [qrCode, setQrCode] = useState<string>("");
    const [offerQRVisible, setOfferQRVisible] = useState<boolean>(false);
    const [credentialsIssuer, setCredentialsIssuer] = useState<CredentialsIssuer>();

    usePromise(() => getIssuer(context), setCredentialsIssuer);

    const selectOptions = useMemo(() => {
        if (typeof credentialsIssuer !== "undefined") {
            return credentialsIssuer.credential_configurations_supported;
        }
        return {};
    }, [credentialsIssuer]);

    const dropdownItems = useMemo(() => {
        if (typeof selectOptions !== "undefined") {
            return Array.from(Object.keys(selectOptions));
        }
        return [];
    }, [selectOptions]);

    useEffect(() => {
        if (initialSelected !== selected && credentialsIssuer !== undefined) {
            requestVCOffer(context, selectOptions[selected], credentialsIssuer).then(
                blob => {
                    const reader = new FileReader();
                    reader.readAsDataURL(blob);
                    reader.onloadend = function () {
                        const result = reader.result;
                        if (typeof result === "string") {
                            setQrCode(result);
                            setOfferQRVisible(true);
                        }
                    };
                }
            );
        }
    }, [selected]);

    return (
        <Page
            title={t("verifiableCredentialsTitle")}
            description={t("verifiableCredentialsDescription")}
        >
            <div className="space-y-6">
                <div className="relative w-full max-w-sm">
                    <select
                        data-testid="credential-select"
                        value={selected}
                        onChange={e => setSelected(e.target.value)}
                        className="h-10 w-full appearance-none rounded-md border bg-background px-3 pr-8 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                        <option value={initialSelected}>{initialSelected}</option>
                        {dropdownItems.map(option => (
                            <option key={option} value={option} data-testid={option}>
                                {option}
                            </option>
                        ))}
                    </select>
                    <CaretDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                </div>

                {offerQRVisible && (
                    <div>
                        <img
                            width="500"
                            height="500"
                            src={qrCode}
                            data-testid="qr-code"
                            className="rounded-md border"
                            alt="QR Code"
                        />
                    </div>
                )}
            </div>
        </Page>
    );
};

export default Oid4Vci;
