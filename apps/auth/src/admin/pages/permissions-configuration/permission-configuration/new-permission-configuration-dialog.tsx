import type { ResourceTypesRepresentation } from "@keycloak/keycloak-admin-client/lib/defs/resourceServerRepresentation";
import { useTranslation } from "@merge-rd/i18n";
import { Alert, AlertTitle } from "@merge-rd/ui/components/alert";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle
} from "@merge-rd/ui/components/dialog";
import { cn } from "@merge-rd/ui/lib/utils";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@merge-rd/ui/components/table";

type NewPermissionConfigurationDialogProps = {
    resourceTypes?: ResourceTypesRepresentation[];
    toggleDialog: () => void;
    onSelect: (resourceType: ResourceTypesRepresentation) => void;
};

export const NewPermissionConfigurationDialog = ({
    resourceTypes,
    onSelect,
    toggleDialog
}: NewPermissionConfigurationDialogProps) => {
    const { t } = useTranslation();

    return (
        <Dialog open={true} onOpenChange={v => !v && toggleDialog()}>
            <DialogContent
                showCloseButton
                className="sm:max-w-lg"
                aria-label={t("createPermission")}
            >
                <DialogHeader>
                    <DialogTitle>{t("chooseAResourceType")}</DialogTitle>
                    <Alert className="mt-2">
                        <AlertTitle>{t("chooseAResourceTypeInstructions")}</AlertTitle>
                    </Alert>
                </DialogHeader>
                <Table aria-label={t("permissions")} className="text-sm">
                    <TableHeader>
                        <TableRow>
                            <TableHead>{t("resourceType")}</TableHead>
                            <TableHead>{t("description")}</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {Object.keys(resourceTypes || {}).map((key: any) => {
                            const resourceType = resourceTypes![key];
                            return (
                                <TableRow
                                    key={resourceType.type}
                                    data-testid={resourceType.type}
                                    onClick={() => onSelect(resourceType)}
                                    className={cn("cursor-pointer")}
                                >
                                    <TableCell>{resourceType.type}</TableCell>
                                    <TableCell className="whitespace-normal">
                                        {t(`resourceType.${resourceType.type}`)}
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </DialogContent>
        </Dialog>
    );
};
