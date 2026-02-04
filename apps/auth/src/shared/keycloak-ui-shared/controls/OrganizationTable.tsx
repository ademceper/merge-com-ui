import OrganizationRepresentation from "@keycloak/keycloak-admin-client/lib/defs/organizationRepresentation";
import { Badge } from "@merge/ui/components/badge";
import { FunctionComponent, PropsWithChildren, ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { KeycloakDataTable, LoaderFunction } from "./table/KeycloakDataTable";

type OrgDetailLinkProps = {
    link: FunctionComponent<
        PropsWithChildren<{ organization: OrganizationRepresentation }>
    >;
    organization: OrganizationRepresentation;
};

const OrgDetailLink = ({ link, organization }: OrgDetailLinkProps) => {
    const { t } = useTranslation();
    const Component = link;
    return (
        <span className="truncate block">
            <Component organization={organization}>
                {organization.name}
                {!organization.enabled && (
                    <Badge
                        key={`${organization.id}-disabled`}
                        variant="secondary"
                        className="ml-2"
                    >
                        {t("disabled")}
                    </Badge>
                )}
            </Component>
        </span>
    );
};

const Domains = (org: OrganizationRepresentation) => {
    return (
        <div className="flex flex-wrap gap-1">
            {org.domains?.map(dn => {
                const name = typeof dn === "string" ? dn : dn.name;
                return (
                    <Badge key={name} variant="secondary">
                        {name}
                    </Badge>
                );
            })}
        </div>
    );
};

export type OrganizationTableProps = PropsWithChildren & {
    loader: LoaderFunction<OrganizationRepresentation> | OrganizationRepresentation[];
    link: FunctionComponent<
        PropsWithChildren<{ organization: OrganizationRepresentation }>
    >;
    toolbarItem?: ReactNode;
    isPaginated?: boolean;
    isSearching?: boolean;
    searchPlaceholderKey?: string;
    onSelect?: (orgs: OrganizationRepresentation[]) => void;
    onDelete?: (org: OrganizationRepresentation) => void;
    deleteLabel?: string;
};

export const OrganizationTable = ({
    loader,
    toolbarItem,
    isPaginated = false,
    isSearching = false,
    searchPlaceholderKey,
    onSelect,
    onDelete,
    deleteLabel = "delete",
    link,
    children
}: OrganizationTableProps) => {
    const { t } = useTranslation();

    return (
        <KeycloakDataTable
            loader={loader}
            isPaginated={isPaginated}
            isSearching={isSearching}
            ariaLabelKey="organizationList"
            searchPlaceholderKey={searchPlaceholderKey}
            toolbarItem={toolbarItem}
            onSelect={onSelect}
            canSelectAll={onSelect !== undefined}
            actions={
                onDelete
                    ? [
                          {
                              title: t(deleteLabel),
                              onRowClick: onDelete
                          }
                      ]
                    : undefined
            }
            columns={[
                {
                    name: "name",
                    displayKey: "name",
                    cellRenderer: row => <OrgDetailLink link={link} organization={row} />
                },
                {
                    name: "domains",
                    displayKey: "domains",
                    cellRenderer: Domains
                },
                {
                    name: "description",
                    displayKey: "description"
                },
                {
                    name: "membershipType",
                    displayKey: "membershipType"
                }
            ]}
            emptyState={children}
        />
    );
};
