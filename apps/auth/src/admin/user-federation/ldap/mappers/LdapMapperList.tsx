import type ComponentRepresentation from "@keycloak/keycloak-admin-client/lib/defs/componentRepresentation";
import { getErrorDescription, getErrorMessage, Action,
    KeycloakDataTable,
    ListEmptyState,
    useFetch } from "../../../../shared/keycloak-ui-shared";
import { toast } from "@merge/ui/components/sonner";
import { Button } from "@merge/ui/components/button";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, To, useNavigate, useParams } from "react-router-dom";
import { useAdminClient } from "../../../admin-client";
import { useConfirmDialog } from "../../../components/confirm-dialog/ConfirmDialog";
import useLocaleSort, { mapByKey } from "../../../utils/useLocaleSort";

export type LdapMapperListProps = {
    toCreate: To;
    toDetail: (mapperId: string) => To;
};

type MapperLinkProps = ComponentRepresentation & {
    toDetail: (mapperId: string) => To;
};

const MapperLink = ({ toDetail, ...mapper }: MapperLinkProps) => (
    <Link to={toDetail(mapper.id!)}>{mapper.name}</Link>
);

export const LdapMapperList = ({ toCreate, toDetail }: LdapMapperListProps) => {
    const { adminClient } = useAdminClient();

    const navigate = useNavigate();
    const { t } = useTranslation();
const [key, setKey] = useState(0);
    const refresh = () => setKey(key + 1);

    const [mappers, setMappers] = useState<ComponentRepresentation[]>([]);
    const localeSort = useLocaleSort();

    const { id } = useParams<{ id: string }>();

    const [selectedMapper, setSelectedMapper] = useState<ComponentRepresentation>();

    useFetch(
        () =>
            adminClient.components.find({
                parent: id,
                type: "org.keycloak.storage.ldap.mappers.LDAPStorageMapper"
            }),
        mapper => {
            setMappers(
                localeSort(
                    mapper.map(mapper => ({
                        ...mapper,
                        name: mapper.name,
                        type: mapper.providerId
                    })),
                    mapByKey("name")
                )
            );
        },
        [key]
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
                toast.error(t("mappingDeletedError", { error: getErrorMessage(error) }), { description: getErrorDescription(error) });
            }
        }
    });

    return (
        <>
            <DeleteConfirm />
            <KeycloakDataTable
                key={key}
                loader={mappers}
                ariaLabelKey="ldapMappersList"
                searchPlaceholderKey="searchForMapper"
                toolbarItem={
                    <div>
                        <Button
                            data-testid="add-mapper-btn"
                            asChild
                        >
                            <Link to={toCreate}>{t("addMapper")}</Link>
                        </Button>
                    </div>
                }
                actions={[
                    {
                        title: t("delete"),
                        onRowClick: mapper => {
                            setSelectedMapper(mapper);
                            toggleDeleteDialog();
                        }
                    } as Action<ComponentRepresentation>
                ]}
                columns={[
                    {
                        name: "name",
                        cellRenderer: row => <MapperLink {...row} toDetail={toDetail} />
                    },
                    {
                        name: "type"
                    }
                ]}
                emptyState={
                    <ListEmptyState
                        message={t("emptyMappers")}
                        instructions={t("emptyMappersInstructions")}
                        primaryActionText={t("emptyPrimaryAction")}
                        onPrimaryAction={() => navigate(toCreate)}
                    />
                }
            />
        </>
    );
};
