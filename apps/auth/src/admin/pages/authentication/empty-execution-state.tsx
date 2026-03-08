import type AuthenticationFlowRepresentation from "@keycloak/keycloak-admin-client/lib/defs/authenticationFlowRepresentation";
import type { AuthenticationProviderRepresentation } from "@keycloak/keycloak-admin-client/lib/defs/authenticatorConfigRepresentation";
import { useTranslation } from "@merge-rd/i18n";
import { Button } from "@merge-rd/ui/components/button";
import {
    Empty,
    EmptyContent,
    EmptyDescription,
    EmptyHeader,
    EmptyTitle
} from "@merge-rd/ui/components/empty";
import { memo, useState } from "react";
import { AddStepModal } from "./components/modals/add-step-modal";
import { AddSubFlowModal, type Flow } from "./components/modals/add-sub-flow-modal";

const SECTIONS = ["addExecution", "addSubFlow"] as const;
type SectionType = (typeof SECTIONS)[number] | undefined;

type EmptyExecutionStateProps = {
    flow: AuthenticationFlowRepresentation;
    onAddExecution: (type: AuthenticationProviderRepresentation) => void;
    onAddFlow: (flow: Flow) => void;
};

export const EmptyExecutionState = memo(
    ({ flow, onAddExecution, onAddFlow }: EmptyExecutionStateProps) => {
        const { t } = useTranslation();
        const [show, setShow] = useState<SectionType>();

        return (
            <>
                {show === "addExecution" && (
                    <AddStepModal
                        name={flow.alias!}
                        type={flow.providerId === "client-flow" ? "client" : "basic"}
                        onSelect={type => {
                            if (type) {
                                onAddExecution(type);
                            }
                            setShow(undefined);
                        }}
                    />
                )}
                {show === "addSubFlow" && (
                    <AddSubFlowModal
                        name={flow.alias!}
                        onCancel={() => setShow(undefined)}
                        onConfirm={newFlow => {
                            onAddFlow(newFlow);
                            setShow(undefined);
                        }}
                    />
                )}
                <Empty data-testid="empty-state" className="py-12">
                    <EmptyHeader>
                        <EmptyTitle className="text-base font-medium">
                            {t("emptyExecution")}
                        </EmptyTitle>
                    </EmptyHeader>
                    <EmptyContent>
                        <EmptyDescription>
                            {t("emptyExecutionInstructions")}
                        </EmptyDescription>
                    </EmptyContent>
                </Empty>

                <div className="keycloak__empty-execution-state__block">
                    {SECTIONS.map(section => (
                        <div
                            key={section}
                            className="keycloak__empty-execution-state__help flex flex-1 items-center justify-between gap-4"
                        >
                            <div className="flex-1">
                                <h2 className="text-base font-medium">
                                    {t(`${section}Title`)}
                                </h2>
                                <p className="text-sm text-muted-foreground">
                                    {t(section)}
                                </p>
                            </div>
                            <Button
                                data-testid={section}
                                variant="outline"
                                onClick={() => setShow(section)}
                            >
                                {t(section)}
                            </Button>
                        </div>
                    ))}
                </div>
            </>
        );
    }
);
