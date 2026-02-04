import type { UserProfileAttribute } from "@keycloak/keycloak-admin-client/lib/defs/userProfileMetadata";
import { KeycloakSelect, SelectVariant } from "../../../shared/keycloak-ui-shared";
import { Button } from "@merge/ui/components/button";
import { Separator } from "@merge/ui/components/separator";
import { Funnel } from "@phosphor-icons/react";
import { SelectOption } from "../../../shared/keycloak-ui-shared";
import { uniqBy } from "lodash-es";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import { useAdminClient } from "../../admin-client";
import { DraggableTable } from "../../authentication/components/DraggableTable";
import { useConfirmDialog } from "../../components/confirm-dialog/ConfirmDialog";
import { KeycloakSpinner } from "../../../shared/keycloak-ui-shared";
import { useRealm } from "../../context/realm-context/RealmContext";
import useLocale from "../../utils/useLocale";
import useToggle from "../../utils/useToggle";
import { toAddAttribute } from "../routes/AddAttribute";
import { toAttribute } from "../routes/Attribute";
import { useUserProfile } from "./UserProfileContext";

const RESTRICTED_ATTRIBUTES = ["username", "email"];

type movedAttributeType = UserProfileAttribute;

type AttributesTabProps = {
    setTableData: React.Dispatch<
        React.SetStateAction<Record<string, string>[] | undefined>
    >;
};

export const AttributesTab = ({ setTableData }: AttributesTabProps) => {
    const { adminClient } = useAdminClient();
    const { config, save } = useUserProfile();
    const { realm } = useRealm();
    const { t } = useTranslation();
    const combinedLocales = useLocale();
    const navigate = useNavigate();
    const [filter, setFilter] = useState("allGroups");
    const [isFilterTypeDropdownOpen, toggleIsFilterTypeDropdownOpen] = useToggle();
    const [data, setData] = useState(config?.attributes);
    const [attributeToDelete, setAttributeToDelete] = useState("");

    const [toggleDeleteDialog, DeleteConfirm] = useConfirmDialog({
        titleKey: t("deleteAttributeConfirmTitle"),
        messageKey: t("deleteAttributeConfirm", {
            attributeName: attributeToDelete
        }),
        continueButtonLabel: t("delete"),
        continueButtonVariant: "destructive",
        onConfirm: async () => {
            if (!config?.attributes) return;

            const translationsToDelete = config.attributes.find(
                attribute => attribute.name === attributeToDelete
            )?.displayName;

            // Remove the the `${}` from translationsToDelete string
            const formattedTranslationsToDelete = translationsToDelete?.substring(
                2,
                translationsToDelete.length - 1
            );

            try {
                await Promise.all(
                    combinedLocales.map(async locale => {
                        try {
                            const response =
                                await adminClient.realms.getRealmLocalizationTexts({
                                    realm,
                                    selectedLocale: locale
                                });

                            if (response) {
                                await adminClient.realms.deleteRealmLocalizationTexts({
                                    realm,
                                    selectedLocale: locale,
                                    key: formattedTranslationsToDelete
                                });

                                const updatedData =
                                    await adminClient.realms.getRealmLocalizationTexts({
                                        realm,
                                        selectedLocale: locale
                                    });
                                setTableData([updatedData]);
                            }
                        } catch {
                            console.error(`Error removing translations for ${locale}`);
                        }
                    })
                );

                const updatedAttributes = config.attributes.filter(
                    attribute => attribute.name !== attributeToDelete
                );

                await save(
                    { ...config, attributes: updatedAttributes, groups: config.groups },
                    {
                        successMessageKey: "deleteAttributeSuccess",
                        errorMessageKey: "deleteAttributeError"
                    }
                );

                setAttributeToDelete("");
            } catch (error) {
                console.error(
                    `Error removing translations or updating attributes: ${error}`
                );
            }
        }
    });

    if (!config) {
        return <KeycloakSpinner />;
    }

    const attributes = config.attributes ?? [];
    const groups = config.groups ?? [];

    const executeMove = async (attribute: UserProfileAttribute, newIndex: number) => {
        const fromIndex = attributes.findIndex(attr => {
            return attr.name === attribute.name;
        });

        let movedAttribute: movedAttributeType = {};
        movedAttribute = attributes[fromIndex];
        attributes.splice(fromIndex, 1);
        attributes.splice(newIndex, 0, movedAttribute);

        await save(
            { ...config, attributes, groups },
            {
                successMessageKey: "updatedUserProfileSuccess",
                errorMessageKey: "updatedUserProfileError"
            }
        );
    };

    const cellFormatter = (row: UserProfileAttribute) => (
        <Link
            to={toAttribute({
                realm,
                attributeName: row.name!
            })}
            key={row.name}
        >
            {row.name}
        </Link>
    );

    return (
        <>
            <div className="flex flex-wrap items-center gap-4 p-4">
                <div className="flex items-center gap-2">
                    <div>
                        <KeycloakSelect
                            toggleId="kc-group-filter"
                            width={200}
                            data-testid="filter-select"
                            isOpen={isFilterTypeDropdownOpen}
                            variant={SelectVariant.single}
                            onToggle={toggleIsFilterTypeDropdownOpen}
                            toggleIcon={<Funnel className="size-4" />}
                            onSelect={value => {
                                const filter = value.toString();
                                setFilter(filter);
                                setData(
                                    filter === "allGroups"
                                        ? attributes
                                        : attributes.filter(attr => attr.group === filter)
                                );
                                toggleIsFilterTypeDropdownOpen();
                            }}
                            selections={filter === "allGroups" ? t(filter) : filter}
                        >
                            {[
                                <SelectOption
                                    key="allGroups"
                                    data-testid="all-groups"
                                    value="allGroups"
                                >
                                    {t("allGroups")}
                                </SelectOption>,
                                ...uniqBy(
                                    attributes.filter(attr => !!attr.group),
                                    "group"
                                ).map(attr => (
                                    <SelectOption key={attr.group} value={attr.group ?? ""}>
                                        {attr.group}
                                    </SelectOption>
                                ))
                            ]}
                        </KeycloakSelect>
                    </div>
                    <div>
                        <Button
                            data-testid="createAttributeBtn"
                            asChild
                        >
                            <Link to={toAddAttribute({ realm: realm ?? "" })}>
                                {t("createAttribute")}
                            </Link>
                        </Button>
                    </div>
                </div>
            </div>
            <Separator />
            <DeleteConfirm />
            <DraggableTable
                keyField="name"
                onDragFinish={async (nameDragged, items) => {
                    const keys = attributes.map(e => e.name);
                    const newIndex = items.indexOf(nameDragged);
                    const oldIndex = keys.indexOf(nameDragged);
                    const dragged = attributes[oldIndex];
                    if (!dragged.name) return;

                    await executeMove(dragged, newIndex);
                }}
                actions={[
                    {
                        title: t("edit"),
                        onClick: (_event, row) => {
                            const name = row.name ?? "";
                            if (!name) return;
                            navigate(
                                toAttribute({
                                    realm,
                                    attributeName: name
                                })
                            );
                        }
                    },
                    {
                        title: t("delete"),
                        isActionable: ({ name }) =>
                            !RESTRICTED_ATTRIBUTES.includes(name!),
                        onClick: (_event, row) => {
                            setAttributeToDelete(row.name ?? "");
                            toggleDeleteDialog();
                        }
                    }
                ]}
                columns={[
                    {
                        name: "name",
                        displayKey: t("attributeName"),
                        cellRenderer: cellFormatter
                    },
                    {
                        name: "displayName",
                        displayKey: t("attributeDisplayName")
                    },
                    {
                        name: "group",
                        displayKey: t("attributeGroup")
                    }
                ]}
                data={data ?? attributes}
            />
        </>
    );
};
