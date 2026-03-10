import type OrganizationRepresentation from "@keycloak/keycloak-admin-client/lib/defs/organizationRepresentation";
import { useTranslation } from "@merge-rd/i18n";
import { Button } from "@merge-rd/ui/components/button";
import { Checkbox } from "@merge-rd/ui/components/checkbox";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from "@merge-rd/ui/components/dialog";
import { FacetedFormFilter } from "@merge-rd/ui/components/faceted-filter/faceted-form-filter";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@merge-rd/ui/components/table";
import { differenceBy } from "lodash-es";
import { useMemo, useState } from "react";
import { useOrganizations } from "./hooks/use-organizations";

type OrganizationModalProps = {
    isJoin?: boolean;
    existingOrgs: OrganizationRepresentation[];
    onAdd: (orgs: OrganizationRepresentation[]) => Promise<void>;
    onClose: () => void;
};

const COLUMN_COUNT = 3;

export const OrganizationModal = ({
    isJoin = true,
    existingOrgs,
    onAdd,
    onClose
}: OrganizationModalProps) => {
    const { t } = useTranslation();
    const [selectedRows, setSelectedRows] = useState<OrganizationRepresentation[]>([]);
    const { data: allOrgs = [] } = useOrganizations();
    const orgs = differenceBy(allOrgs, existingOrgs, "id");
    const [search, setSearch] = useState("");

    const toggleSelect = (org: OrganizationRepresentation) => {
        setSelectedRows(prev =>
            prev.some(o => o.id === org.id)
                ? prev.filter(o => o.id !== org.id)
                : [...prev, org]
        );
    };

    const filteredOrgs = useMemo(() => {
        if (!search) return orgs;
        const lower = search.toLowerCase();
        return orgs.filter(o => o.name?.toLowerCase().includes(lower));
    }, [orgs, search]);

    return (
        <Dialog open onOpenChange={open => !open && onClose()}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle>
                        {isJoin ? t("joinOrganization") : t("sendInvitation")}
                    </DialogTitle>
                </DialogHeader>
                <FacetedFormFilter
                    type="text"
                    size="small"
                    title={t("search")}
                    value={search}
                    onChange={value => setSearch(value)}
                    placeholder={t("searchOrganization")}
                />
                <Table className="table-fixed">
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-10" />
                            <TableHead className="w-[45%]">
                                {t("organizationName")}
                            </TableHead>
                            <TableHead className="w-[45%]">
                                {t("description")}
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredOrgs.length === 0 ? (
                            <TableRow>
                                <TableCell
                                    colSpan={COLUMN_COUNT}
                                    className="text-center text-muted-foreground"
                                >
                                    {t("noResults")}
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredOrgs.map(org => (
                                <TableRow key={org.id}>
                                    <TableCell>
                                        <Checkbox
                                            checked={selectedRows.some(
                                                o => o.id === org.id
                                            )}
                                            onCheckedChange={() => toggleSelect(org)}
                                        />
                                    </TableCell>
                                    <TableCell className="truncate">
                                        {org.name}
                                    </TableCell>
                                    <TableCell>
                                        <span className="truncate block">
                                            {org.description ?? ""}
                                        </span>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
                <DialogFooter>
                    <Button data-testid="cancel" variant="ghost" onClick={onClose}>
                        {t("cancel")}
                    </Button>
                    <Button
                        data-testid="join"
                        disabled={selectedRows.length === 0}
                        onClick={async () => {
                            await onAdd(selectedRows);
                            onClose();
                        }}
                    >
                        {isJoin ? t("join") : t("send")}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
