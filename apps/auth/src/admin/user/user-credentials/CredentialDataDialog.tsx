import { useTranslation } from "react-i18next";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@merge/ui/components/dialog";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@merge/ui/components/table";

type CredentialDataDialogProps = {
    title: string;
    credentialData: [string, string][];
    onClose: () => void;
};

export const CredentialDataDialog = ({
    title,
    credentialData,
    onClose
}: CredentialDataDialogProps) => {
    const { t } = useTranslation();
    return (
        <Dialog open={true} onOpenChange={(v) => !v && onClose()}>
            <DialogContent showCloseButton className="sm:max-w-lg" data-testid="passwordDataDialog">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                </DialogHeader>
                <Table aria-label={title} data-testid="password-data-dialog" className="text-sm">
                    <TableHeader>
                        <TableRow>
                            <TableHead>{t("showPasswordDataName")}</TableHead>
                            <TableHead>{t("showPasswordDataValue")}</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {credentialData.map((cred, index) => (
                            <TableRow key={index}>
                                <TableCell>{cred[0]}</TableCell>
                                <TableCell>{cred[1]}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </DialogContent>
        </Dialog>
    );
};
