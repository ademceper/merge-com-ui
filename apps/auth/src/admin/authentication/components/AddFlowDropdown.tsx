/**
 * WARNING: Before modifying this file, run the following command:
 *
 * $ npx keycloakify own --path "admin/authentication/components/AddFlowDropdown.tsx"
 *
 * This file is provided by @keycloakify/keycloak-admin-ui version 260502.0.0.
 * It was copied into your repository by the postinstall script: `keycloakify sync-extensions`.
 */

/* eslint-disable */

// @ts-nocheck

import type { AuthenticationProviderRepresentation } from "@keycloak/keycloak-admin-client/lib/defs/authenticatorConfigRepresentation";
import { useFetch } from "../../../shared/keycloak-ui-shared";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@merge/ui/components/dropdown-menu";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@merge/ui/components/tooltip";
import { Plus } from "@phosphor-icons/react";
import { Button } from "@merge/ui/components/button";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useAdminClient } from "../../admin-client";
import type { ExpandableExecution } from "../execution-model";
import { AddStepModal, FlowType } from "./modals/AddStepModal";
import { AddSubFlowModal, Flow } from "./modals/AddSubFlowModal";

type AddFlowDropdownProps = {
    execution: ExpandableExecution;
    onAddExecution: (
        execution: ExpandableExecution,
        type: AuthenticationProviderRepresentation
    ) => void;
    onAddFlow: (execution: ExpandableExecution, flow: Flow) => void;
};

export const AddFlowDropdown = ({
    execution,
    onAddExecution,
    onAddFlow
}: AddFlowDropdownProps) => {
    const { adminClient } = useAdminClient();

    const { t } = useTranslation();

    const [open, setOpen] = useState(false);
    const [type, setType] = useState<FlowType>();
    const [providerId, setProviderId] = useState<string>();

    useFetch(
        () =>
            adminClient.authenticationManagement.getFlow({
                flowId: execution.flowId!
            }),
        ({ providerId }) => setProviderId(providerId),
        []
    );

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <div>
                        <DropdownMenu open={open} onOpenChange={setOpen}>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    aria-label={t("add")}
                                    data-testid={`${execution.displayName}-edit-dropdown`}
                                >
                                    <Plus className="size-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                    key="addStep"
                                    onClick={() =>
                                        setType(providerId === "form-flow" ? "form" : "basic")
                                    }
                                >
                                    {t("addExecution")}
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    key="addCondition"
                                    onClick={() => setType("condition")}
                                >
                                    {t("addCondition")}
                                </DropdownMenuItem>
                                <DropdownMenuItem key="addSubFlow" onClick={() => setType("subFlow")}>
                                    {t("addSubFlow")}
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </TooltipTrigger>
                <TooltipContent>{t("add")}</TooltipContent>
            </Tooltip>
            {type && type !== "subFlow" && (
                <AddStepModal
                    name={execution.displayName!}
                    type={type}
                    onSelect={type => {
                        if (type) {
                            onAddExecution(execution, type);
                        }
                        setType(undefined);
                    }}
                />
            )}
            {type === "subFlow" && (
                <AddSubFlowModal
                    name={execution.displayName!}
                    onCancel={() => setType(undefined)}
                    onConfirm={flow => {
                        onAddFlow(execution, flow);
                        setType(undefined);
                    }}
                />
            )}
        </TooltipProvider>
    );
};
