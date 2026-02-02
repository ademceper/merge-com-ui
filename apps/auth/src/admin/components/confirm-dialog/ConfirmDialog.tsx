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
import { Button } from "@merge/ui/components/button";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@merge/ui/components/dialog";
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
    continueButtonVariant?: React.ComponentProps<typeof Button>["variant"];
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
    continueButtonVariant = "default",
    onConfirm,
    onCancel,
    children,
    open = true,
    toggleDialog,
    confirmButtonDisabled
}: ConfirmDialogModalProps) => {
    const { t } = useTranslation();
    return (
        <Dialog open={open} onOpenChange={(v) => { if (!v) toggleDialog(); }}>
            <DialogContent showCloseButton={true}>
                <DialogHeader>
                    <DialogTitle>{t(titleKey)}</DialogTitle>
                </DialogHeader>
                <div className="py-2">
                    {!messageKey && children}
                    {messageKey && t(messageKey)}
                </div>
                <DialogFooter>
                    <Button
                        id="modal-confirm"
                        data-testid="confirm"
                        disabled={confirmButtonDisabled}
                        variant={continueButtonVariant}
                        onClick={() => {
                            onConfirm();
                            toggleDialog();
                        }}
                    >
                        {t(continueButtonLabel || "continue")}
                    </Button>
                    {!noCancelButton && (
                        <Button
                            id="modal-cancel"
                            data-testid="cancel"
                            variant="ghost"
                            onClick={() => {
                                if (onCancel) onCancel();
                                toggleDialog();
                            }}
                        >
                            {t(cancelButtonLabel || "cancel")}
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
