import type { AuthenticationProviderRepresentation } from "@keycloak/keycloak-admin-client/lib/defs/authenticatorConfigRepresentation";
import { useTranslation } from "@merge-rd/i18n";
import { Button } from "@merge-rd/ui/components/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@merge-rd/ui/components/dropdown-menu";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger
} from "@merge-rd/ui/components/tooltip";
import { Plus } from "@phosphor-icons/react";
import { useState } from "react";
import { useFlowProviderId } from "../api/use-flow-provider-id";
import type { ExpandableExecution } from "../execution-model";
import { AddStepModal, type FlowType } from "./modals/add-step-modal";
import { AddSubFlowModal, type Flow } from "./modals/add-sub-flow-modal";

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
    const { t } = useTranslation();

    const [open, setOpen] = useState(false);
    const [type, setType] = useState<FlowType>();
    const { data: providerId } = useFlowProviderId(execution.flowId!);

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
                                        setType(
                                            providerId === "form-flow" ? "form" : "basic"
                                        )
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
                                <DropdownMenuItem
                                    key="addSubFlow"
                                    onClick={() => setType("subFlow")}
                                >
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
