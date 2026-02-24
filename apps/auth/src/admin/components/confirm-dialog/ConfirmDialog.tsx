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
    /** i18n interpolation for title, e.g. { count: 1 } */
    titleKeyVariables?: Record<string, unknown>;
    messageKey?: string;
    /** i18n interpolation for message, e.g. { count: 1, groupName: "x" } */
    messageKeyVariables?: Record<string, unknown>;
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
    titleKeyVariables,
    messageKey,
    messageKeyVariables,
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
            <DialogContent className="max-w-lg sm:max-w-lg max-h-[80vh] overflow-auto" showCloseButton={true}>
                <DialogHeader>
                    <DialogTitle>{t(titleKey, titleKeyVariables as any)}</DialogTitle>
                </DialogHeader>
                <div className="py-2 break-all whitespace-pre-wrap">
                    {!messageKey && children}
                    {messageKey && t(messageKey, messageKeyVariables as any)}
                </div>
                <DialogFooter className="flex flex-col gap-2 sm:flex-row sm:flex-nowrap sm:items-center sm:justify-end sm:gap-4">
                    <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:shrink-0 sm:items-center">
                        {!noCancelButton && (
                            <Button
                                id="modal-cancel"
                                data-testid="cancel"
                                variant="ghost"
                                className="h-9 min-h-9 w-full text-foreground sm:w-auto"
                                onClick={() => {
                                    if (onCancel) onCancel();
                                    toggleDialog();
                                }}
                            >
                                {t(cancelButtonLabel || "cancel")}
                            </Button>
                        )}
                        <Button
                            id="modal-confirm"
                            data-testid="confirm"
                            disabled={confirmButtonDisabled}
                            variant={continueButtonVariant}
                            className="h-9 min-h-9 w-full sm:w-auto"
                            onClick={() => {
                                onConfirm();
                                toggleDialog();
                            }}
                        >
                            {t(continueButtonLabel || "continue")}
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
