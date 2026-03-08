import type ComponentRepresentation from "@keycloak/keycloak-admin-client/lib/defs/componentRepresentation";
import { useTranslation } from "@merge-rd/i18n";
import { Button } from "@merge-rd/ui/components/button";
import { DropdownMenuItem } from "@merge-rd/ui/components/dropdown-menu";
import {
    Empty,
    EmptyContent,
    EmptyDescription,
    EmptyHeader,
    EmptyTitle
} from "@merge-rd/ui/components/empty";
import { Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
    type ColumnDef,
    DataTable,
    DataTableRowActions
} from "@/admin/shared/ui/data-table";
import {
    getErrorDescription,
    getErrorMessage
} from "../../../../../shared/keycloak-ui-shared";
import { useAdminClient } from "../../../../app/admin-client";
import useLocaleSort, { mapByKey } from "../../../../shared/lib/useLocaleSort";
import { useParams } from "../../../../shared/lib/useParams";
import { useConfirmDialog } from "../../../../shared/ui/confirm-dialog/confirm-dialog";
import { useLdapMappers } from "../../../user-federation/api/use-ldap-mappers";

type LdapMapperListProps = {
    toCreate: string;
    toDetail: (mapperId: string) => string;
};

type MapperLinkProps = ComponentRepresentation & {
    toDetail: (mapperId: string) => string;
};

const MapperLink = ({ toDetail, ...mapper }: MapperLinkProps) => (
    <Link to={toDetail(mapper.id!)}>{mapper.name}</Link>
);

export const LdapMapperList = ({ toCreate, toDetail }: LdapMapperListProps) => {
    const { adminClient } = useAdminClient();

    const { t } = useTranslation();
    const localeSort = useLocaleSort();

    const { id } = useParams<{ id: string }>();

    const [selectedMapper, setSelectedMapper] = useState<ComponentRepresentation>();

    const { data: rawMappers, refetch: refetchMappers } = useLdapMappers(id);
    const refresh = () => {
        refetchMappers();
    };

    const mappers = useMemo(
        () =>
            localeSort(
                (rawMappers || []).map(mapper => ({
                    ...mapper,
                    name: mapper.name,
                    type: mapper.providerId
                })),
                mapByKey("name")
            ),
        [rawMappers, localeSort]
    );

    const [toggleDeleteDialog, DeleteConfirm] = useConfirmDialog({
        titleKey: t("deleteMappingTitle", { mapperId: selectedMapper?.id }),
        messageKey: "deleteMappingConfirm",
        continueButtonLabel: "delete",
        continueButtonVariant: "destructive",
        onConfirm: async () => {
            try {
                await adminClient.components.del({
                    id: selectedMapper!.id!
                });
                refresh();
                toast.success(t("mappingDeletedSuccess"));
                setSelectedMapper(undefined);
            } catch (error) {
                toast.error(t("mappingDeletedError", { error: getErrorMessage(error) }), {
                    description: getErrorDescription(error)
                });
            }
        }
    });

    const columns: ColumnDef<ComponentRepresentation>[] = [
        {
            accessorKey: "name",
            header: t("name"),
            cell: ({ row }) => <MapperLink {...row.original} toDetail={toDetail} />
        },
        { accessorKey: "type", header: t("type") },
        {
            id: "actions",
            cell: ({ row }) => (
                <DataTableRowActions row={row}>
                    <DropdownMenuItem
                        onClick={() => {
                            setSelectedMapper(row.original);
                            toggleDeleteDialog();
                        }}
                        className="text-destructive"
                    >
                        {t("delete")}
                    </DropdownMenuItem>
                </DataTableRowActions>
            )
        }
    ];

    const emptyContent = (
        <Empty className="py-12">
            <EmptyHeader>
                <EmptyTitle>{t("emptyMappers")}</EmptyTitle>
            </EmptyHeader>
            <EmptyContent>
                <EmptyDescription>{t("emptyMappersInstructions")}</EmptyDescription>
            </EmptyContent>
            <Button className="mt-2" asChild>
                <Link to={toCreate}>{t("emptyPrimaryAction")}</Link>
            </Button>
        </Empty>
    );

    return (
        <>
            <DeleteConfirm />
            <DataTable<ComponentRepresentation>
                columns={columns}
                data={mappers}
                searchColumnId="name"
                searchPlaceholder={t("searchForMapper")}
                emptyContent={emptyContent}
                emptyMessage={t("emptyMappers")}
                toolbar={
                    <Button data-testid="add-mapper-btn" asChild>
                        <Link to={toCreate}>{t("addMapper")}</Link>
                    </Button>
                }
            />
        </>
    );
};
