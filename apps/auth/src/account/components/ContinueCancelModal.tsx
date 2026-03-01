import { PropsWithChildren } from "react";
import { Button } from "@merge/ui/components/button";
import {
    AlertDialog,
    AlertDialogTrigger,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogAction,
    AlertDialogCancel
} from "@merge/ui/components/alert-dialog";

type ContinueCancelModalProps = {
    buttonTitle: string;
    modalTitle: string;
    continueLabel: string;
    cancelLabel: string;
    buttonVariant?: "default" | "secondary" | "destructive" | "outline" | "ghost" | "link";
    onContinue: () => void;
};

export const ContinueCancelModal = ({
    buttonTitle,
    modalTitle,
    continueLabel,
    cancelLabel,
    buttonVariant = "destructive",
    onContinue,
    children
}: PropsWithChildren<ContinueCancelModalProps>) => {
    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button variant={buttonVariant} size="sm">
                    {buttonTitle}
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{modalTitle}</AlertDialogTitle>
                    <AlertDialogDescription>{children}</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>{cancelLabel}</AlertDialogCancel>
                    <AlertDialogAction variant="destructive" onClick={onContinue}>
                        {continueLabel}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};
