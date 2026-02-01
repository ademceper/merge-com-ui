/**
 * WARNING: Before modifying this file, run the following command:
 *
 * $ npx keycloakify own --path "shared/keycloak-ui-shared/continue-cancel/ContinueCancelModal.tsx"
 *
 * This file is provided by @keycloakify/keycloak-ui-shared version 260502.0.0.
 * It was copied into your repository by the postinstall script: `keycloakify sync-extensions`.
 */

/* eslint-disable */

// @ts-nocheck

import { ReactNode, useState } from "react";
import { Button, ButtonProps, Modal, ModalProps } from "../../@patternfly/react-core";

export type ContinueCancelModalProps = Omit<ModalProps, "ref" | "children"> & {
    modalTitle: string;
    continueLabel: string;
    cancelLabel: string;
    buttonTitle: string | ReactNode;
    buttonVariant?: ButtonProps["variant"];
    buttonTestRole?: string;
    isDisabled?: boolean;
    onContinue: () => void;
    component?: React.ElementType<any> | React.ComponentType<any>;
    children?: ReactNode;
};

export const ContinueCancelModal = ({
    modalTitle,
    continueLabel,
    cancelLabel,
    buttonTitle,
    isDisabled,
    buttonVariant,
    buttonTestRole,
    onContinue,
    component = Button,
    children,
    ...rest
}: ContinueCancelModalProps) => {
    const [open, setOpen] = useState(false);
    const Component = component;

    return (
        <>
            <Component
                variant={buttonVariant}
                onClick={() => setOpen(true)}
                isDisabled={isDisabled}
                data-testrole={buttonTestRole}
            >
                {buttonTitle}
            </Component>
            <Modal
                variant="small"
                {...rest}
                title={modalTitle}
                isOpen={open}
                onClose={() => setOpen(false)}
                actions={[
                    <Button
                        id="modal-confirm"
                        key="confirm"
                        variant="primary"
                        onClick={() => {
                            setOpen(false);
                            onContinue();
                        }}
                    >
                        {continueLabel}
                    </Button>,
                    <Button
                        id="modal-cancel"
                        key="cancel"
                        variant="secondary"
                        onClick={() => setOpen(false)}
                    >
                        {cancelLabel}
                    </Button>
                ]}
            >
                {children}
            </Modal>
        </>
    );
};
