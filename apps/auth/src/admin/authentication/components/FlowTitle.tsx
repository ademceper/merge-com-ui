/**
 * WARNING: Before modifying this file, run the following command:
 *
 * $ npx keycloakify own --path "admin/authentication/components/FlowTitle.tsx"
 *
 * This file is provided by @keycloakify/keycloak-admin-ui version 260502.0.0.
 * It was copied into your repository by the postinstall script: `keycloakify sync-extensions`.
 */

/* eslint-disable */

// @ts-nocheck

import { HelpItem } from "../../../shared/keycloak-ui-shared";
import { Badge } from "@merge/ui/components/badge";
import { GitBranch, MapPin, Robot, ListChecks } from "@phosphor-icons/react";
import { useTranslation } from "react-i18next";
import { useAuthenticationProvider } from "./AuthenticationProviderContext";
import { FlowType } from "./FlowRow";

type FlowTitleProps = {
    id?: string;
    type: FlowType;
    title: string;
    subtitle: string;
    providerId?: string;
};

const FlowIcon = ({ type }: { type: FlowType }) => {
    switch (type) {
        case "condition":
            return <ListChecks className="size-4" />;
        case "flow":
            return <GitBranch className="size-4" />;
        case "execution":
            return <Robot className="size-4" />;
        case "step":
            return <MapPin className="size-4" />;
        default:
            return undefined;
    }
};

function mapTypeToColor(type: FlowType) {
    switch (type) {
        case "condition":
            return "purple";
        case "flow":
            return "green";
        case "execution":
            return "blue";
        case "step":
            return "cyan";
        default:
            return "grey";
    }
}

export const FlowTitle = ({ id, type, title, subtitle, providerId }: FlowTitleProps) => {
    const { t } = useTranslation();
    const { providers } = useAuthenticationProvider();
    const helpText = providers?.find(p => p.id === providerId)?.description || subtitle;
    return (
        <div data-testid={title}>
            <span data-id={id} id={`title-id-${id}`}>
                <Badge variant="secondary" className="gap-1">
                    <FlowIcon type={type} />
                    {t(type)}
                </Badge>{" "}
                {title} {helpText && <HelpItem helpText={helpText} fieldLabelId={id!} />}
            </span>
        </div>
    );
};
