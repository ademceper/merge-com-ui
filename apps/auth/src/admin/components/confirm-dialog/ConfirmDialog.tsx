/**
 * WARNING: Before modifying this file, run the following command:
 *
 * $ npx keycloakify own --path "admin/components/confirm-dialog/ConfirmDialog.tsx"
 *
 * This file is provided by @keycloakify/keycloak-admin-ui version 260502.0.0.
 * It was copied into your repository by the postinstall script: `keycloakify sync-extensions`.
 */

/* eslint-disable */

// @ts-nocheck

import { ReactElement, ReactNode, useState } from "react";
import {
    Button,
    ButtonVariant,
    Modal,
    ModalVariant
} from "../../../shared/@patternfly/react-core";
import { useTranslation } from "react-i18next";

export const useConfirmDialog = (
    props: ConfirmDialogProps
): [() => void, () => ReactElement] => {
    const [show, setShow] = useState(false);

    function toggleDialog() {
        setShow(show => !show);
    }

    const Dialog = () => (
        <ConfirmDialogModal
            key="confirmDialog"
            {...props}
            open={show}
            toggleDialog={toggleDialog}
        />
    );
    return [toggleDialog, Dialog];
};

export interface ConfirmDialogModalProps extends ConfirmDialogProps {
    open: boolean;
    toggleDialog: () => void;
}

export type ConfirmDialogProps = {
    titleKey: string;
    messageKey?: string;
    noCancelButton?: boolean;
    confirmButtonDisabled?: boolean;
    cancelButtonLabel?: string;
    continueButtonLabel?: string;
    continueButtonVariant?: ButtonVariant;
    variant?: ModalVariant;
    onConfirm: () => void;
    onCancel?: () => void;
    children?: ReactNode;
};

export const ConfirmDialogModal = ({
    titleKey,
    messageKey,
    noCancelButton,
    cancelButtonLabel,
    continueButtonLabel,
    continueButtonVariant,
    onConfirm,
    onCancel,
    children,
    open = true,
    variant = ModalVariant.small,
    toggleDialog,
    confirmButtonDisabled
}: ConfirmDialogModalProps) => {
    const { t } = useTranslation();
    return (
        <Modal
            title={t(titleKey)}
            isOpen={open}
            onClose={toggleDialog}
            variant={variant}
            actions={[
                <Button
                    id="modal-confirm"
                    data-testid="confirm"
                    key="confirm"
                    isDisabled={confirmButtonDisabled}
                    variant={continueButtonVariant || ButtonVariant.primary}
                    onClick={() => {
                        onConfirm();
                        toggleDialog();
                    }}
                >
                    {t(continueButtonLabel || "continue")}
                </Button>,
                !noCancelButton && (
                    <Button
                        id="modal-cancel"
                        data-testid="cancel"
                        key="cancel"
                        variant={ButtonVariant.link}
                        onClick={() => {
                            if (onCancel) onCancel();
                            toggleDialog();
                        }}
                    >
                        {t(cancelButtonLabel || "cancel")}
                    </Button>
                )
            ]}
        >
            {!messageKey && children}
            {messageKey && t(messageKey)}
        </Modal>
    );
};
