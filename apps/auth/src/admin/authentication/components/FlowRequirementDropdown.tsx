/**
 * WARNING: Before modifying this file, run the following command:
 *
 * $ npx keycloakify own --path "admin/authentication/components/FlowRequirementDropdown.tsx"
 *
 * This file is provided by @keycloakify/keycloak-admin-ui version 260502.0.0.
 * It was copied into your repository by the postinstall script: `keycloakify sync-extensions`.
 */

/* eslint-disable */

// @ts-nocheck

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@merge/ui/components/dropdown-menu";
import { Button } from "@merge/ui/components/button";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import type { ExpandableExecution } from "../execution-model";

type FlowRequirementDropdownProps = {
    flow: ExpandableExecution;
    onChange: (flow: ExpandableExecution) => void;
};

export const FlowRequirementDropdown = ({
    flow,
    onChange
}: FlowRequirementDropdownProps) => {
    const { t } = useTranslation();
    const [open, setOpen] = useState(false);

    return (
        <>
            {flow.requirementChoices && flow.requirementChoices.length > 1 && (
                <DropdownMenu open={open} onOpenChange={setOpen}>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="outline"
                            className="keycloak__authentication__requirement-dropdown"
                        >
                            {t(`requirements.${flow.requirement}`)}
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        {flow.requirementChoices!.map((option, index) => (
                            <DropdownMenuItem
                                key={index}
                                onClick={() => {
                                    flow.requirement = option;
                                    onChange(flow);
                                    setOpen(false);
                                }}
                            >
                                {t(`requirements.${option}`)}
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>
            )}
            {(!flow.requirementChoices || flow.requirementChoices.length <= 1) && (
                <>{t(`requirements.${flow.requirement}`)}</>
            )}
        </>
    );
};
