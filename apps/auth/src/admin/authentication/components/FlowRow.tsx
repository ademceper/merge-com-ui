/**
 * WARNING: Before modifying this file, run the following command:
 *
 * $ npx keycloakify own --path "admin/authentication/components/FlowRow.tsx"
 *
 * This file is provided by @keycloakify/keycloak-admin-ui version 260502.0.0.
 * It was copied into your repository by the postinstall script: `keycloakify sync-extensions`.
 */

/* eslint-disable */

// @ts-nocheck

import type { AuthenticationProviderRepresentation } from "@keycloak/keycloak-admin-client/lib/defs/authenticatorConfigRepresentation";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
    TooltipProvider,
} from "@merge/ui/components/tooltip";
import { Button } from "@merge/ui/components/button";
import {
    TableCell,
    TableRow,
} from "@merge/ui/components/table";
import { Trash } from "@phosphor-icons/react";
import { useTranslation } from "react-i18next";
import type { ExpandableExecution } from "../execution-model";
import { AddFlowDropdown } from "./AddFlowDropdown";
import { EditFlow } from "./EditFlow";
import { ExecutionConfigModal } from "./ExecutionConfigModal";
import { FlowRequirementDropdown } from "./FlowRequirementDropdown";
import { FlowTitle } from "./FlowTitle";
import type { Flow } from "./modals/AddSubFlowModal";

type FlowRowProps = {
    builtIn: boolean;
    execution: ExpandableExecution;
    onRowClick: (execution: ExpandableExecution) => void;
    onRowChange: (execution: ExpandableExecution) => void;
    onAddExecution: (
        execution: ExpandableExecution,
        type: AuthenticationProviderRepresentation
    ) => void;
    onAddFlow: (execution: ExpandableExecution, flow: Flow) => void;
    onDelete: (execution: ExpandableExecution) => void;
};

export type FlowType = "flow" | "condition" | "execution" | "step";

const convertToType = (execution: ExpandableExecution): FlowType => {
    if (execution.authenticationFlow) {
        return "flow";
    }
    if (execution.displayName!.startsWith("Condition -")) {
        return "condition";
    }
    if (execution.level === 0) {
        return "execution";
    }
    return "step";
};

export const FlowRow = ({
    builtIn,
    execution,
    onRowClick,
    onRowChange,
    onAddExecution,
    onAddFlow,
    onDelete,
}: FlowRowProps) => {
    const { t } = useTranslation();
    const hasSubList = !!execution.executionList?.length;

    return (
        <>
            <TableRow
                key={`row-${execution.id}`}
                className="keycloak__authentication__flow-row"
                aria-level={(execution.level ?? 0) + 1}
                aria-labelledby={execution.id}
                aria-setsize={hasSubList ? execution.executionList!.length : 0}
                data-expanded={!execution.isCollapsed}
            >
                <TableCell className="w-10" />
                <TableCell>
                    <FlowTitle
                        id={execution.id}
                        type={convertToType(execution)}
                        key={execution.id}
                        subtitle={
                            (execution.authenticationFlow
                                ? execution.description
                                : execution.alias) || ""
                        }
                        providerId={execution.providerId!}
                        title={execution.displayName!}
                    />
                </TableCell>
                <TableCell>
                    <FlowRequirementDropdown
                        flow={execution}
                        onChange={onRowChange}
                    />
                </TableCell>
                {(!execution.authenticationFlow || builtIn) && (
                    <>
                        <TableCell className="w-10" />
                        <TableCell className="w-10" />
                    </>
                )}
                <TableCell className="w-10">
                    <ExecutionConfigModal execution={execution} />
                </TableCell>

                {execution.authenticationFlow && !builtIn && (
                    <>
                        <TableCell className="w-10">
                            <AddFlowDropdown
                                execution={execution}
                                onAddExecution={onAddExecution}
                                onAddFlow={onAddFlow}
                            />
                        </TableCell>
                        <TableCell className="w-10">
                            <EditFlow
                                execution={execution}
                                onRowChange={onRowChange}
                            />
                        </TableCell>
                    </>
                )}
                <TableCell className="w-10">
                    {!builtIn && (
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8"
                                        data-testid={`${execution.displayName}-delete`}
                                        aria-label={t("delete")}
                                        onClick={() => onDelete(execution)}
                                    >
                                        <Trash className="size-4" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>{t("delete")}</TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    )}
                </TableCell>
            </TableRow>
            {!execution.isCollapsed &&
                hasSubList &&
                execution.executionList?.map(ex => (
                    <FlowRow
                        builtIn={builtIn}
                        key={ex.id}
                        execution={ex}
                        onRowClick={onRowClick}
                        onRowChange={onRowChange}
                        onAddExecution={onAddExecution}
                        onAddFlow={onAddFlow}
                        onDelete={onDelete}
                    />
                ))}
        </>
    );
};
