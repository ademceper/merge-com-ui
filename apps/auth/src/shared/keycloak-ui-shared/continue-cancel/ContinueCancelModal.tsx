import { ReactNode, useState } from "react";
import { Button } from "@merge/ui/components/button";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@merge/ui/components/dialog";

type ButtonVariant = React.ComponentProps<typeof Button>["variant"];

export type ContinueCancelModalProps = {
    modalTitle: string;
    continueLabel: string;
    cancelLabel: string;
    buttonTitle: string | ReactNode;
    buttonVariant?: ButtonVariant;
    buttonTestRole?: string;
    isDisabled?: boolean;
    onContinue: () => void;
    component?: React.ElementType<any> | React.ComponentType<any>;
    children?: ReactNode;
};

const mapPfVariantToUi = (variant?: string): ButtonVariant => {
    if (variant === "primary") return "default";
    if (variant === "danger") return "destructive";
    if (variant === "link") return "link";
    return "default";
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
    component: Component = Button,
    children,
}: ContinueCancelModalProps) => {
    const [open, setOpen] = useState(false);

    const handleContinue = () => {
        setOpen(false);
        onContinue();
    };

    return (
        <>
            <Component
                variant={typeof buttonVariant === "string" ? mapPfVariantToUi(buttonVariant) : buttonVariant}
                onClick={() => setOpen(true)}
                disabled={isDisabled}
                data-testrole={buttonTestRole}
            >
                {buttonTitle}
            </Component>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent showCloseButton={true} className="sm:max-w-sm">
                    <DialogHeader>
                        <DialogTitle>{modalTitle}</DialogTitle>
                    </DialogHeader>
                    {children}
                    <DialogFooter>
                        <Button
                            id="modal-confirm"
                            variant="default"
                            onClick={handleContinue}
                        >
                            {continueLabel}
                        </Button>
                        <Button
                            id="modal-cancel"
                            variant="outline"
                            onClick={() => setOpen(false)}
                        >
                            {cancelLabel}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
};
