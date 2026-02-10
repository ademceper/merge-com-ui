import { useFetch } from "../../../shared/keycloak-ui-shared";
import { Button } from "@merge/ui/components/button";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@merge/ui/components/dialog";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@merge/ui/components/popover";
import { DataTable, type ColumnDef } from "@merge/ui/components/table";
import { CheckCircle } from "@phosphor-icons/react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useAdminClient } from "../../admin-client";
import { fetchUsedBy } from "../../components/role-mapping/resource";
import { useRealm } from "../../context/realm-context/RealmContext";
import useToggle from "../../utils/useToggle";
import { AuthenticationType, REALM_FLOWS } from "../constants";

type UsedByProps = {
    authType: AuthenticationType;
};

const Label = ({ label }: { label: string }) => (
    <>
        <CheckCircle className="size-4 inline mr-1" /> {label}
    </>
);

type UsedByModalProps = {
    id: string;
    onClose: () => void;
    isSpecificClient: boolean;
};

const UsedByModal = ({ id, isSpecificClient, onClose }: UsedByModalProps) => {
    const { adminClient } = useAdminClient();
    const { t } = useTranslation();
    const [list, setList] = useState<{ name: string }[]>([]);
    useFetch(
        () =>
            fetchUsedBy(adminClient, {
                id,
                type: isSpecificClient ? "clients" : "idp",
                first: 0,
                max: 500,
                search: undefined
            }).then(names => names.map(name => ({ name }))),
        setList,
        [id, isSpecificClient]
    );

    const columns: ColumnDef<{ name: string }>[] = [
        { accessorKey: "name", header: t("name") }
    ];

    return (
        <Dialog open onOpenChange={open => !open && onClose()}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>{t("flowUsedBy")}</DialogTitle>
                    <p className="text-sm text-muted-foreground">
                        {t("flowUsedByDescription", {
                            value: isSpecificClient ? t("clients") : t("identiyProviders")
                        })}
                    </p>
                </DialogHeader>
                <DataTable
                    columns={columns}
                    data={list ?? []}
                    searchColumnId="name"
                    searchPlaceholder={t("search")}
                    emptyMessage={t("noResults")}
                />
                <DialogFooter>
                    <Button
                        data-testid="cancel"
                        id="modal-cancel"
                        variant="ghost"
                        onClick={onClose}
                    >
                        {t("close")}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export const UsedBy = ({ authType: { id, usedBy } }: UsedByProps) => {
    const { t } = useTranslation();
    const { realmRepresentation: realm } = useRealm();
    const [open, toggle] = useToggle();

    const key = Object.entries(realm!).find(e => e[1] === usedBy?.values[0])?.[0];

    return (
        <>
            {open && (
                <UsedByModal
                    id={id!}
                    onClose={toggle}
                    isSpecificClient={usedBy?.type === "SPECIFIC_CLIENTS"}
                />
            )}
            {(usedBy?.type === "SPECIFIC_PROVIDERS" ||
                usedBy?.type === "SPECIFIC_CLIENTS") &&
                (usedBy.values.length <= 8 ? (
                    <Popover key={id}>
                        <PopoverTrigger asChild>
                            <Button variant="ghost" className="h-auto p-0">
                                <Label label={t(`used.${usedBy.type}`)} />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent aria-label={t("usedBy")}>
                            <div key={`usedBy-${id}-${usedBy.values}`}>
                                {t(
                                    "appliedBy" +
                                        (usedBy.type === "SPECIFIC_CLIENTS"
                                            ? "Clients"
                                            : "Providers")
                                )}{" "}
                                {usedBy.values.map((used, index) => (
                                    <span key={index}>
                                        <strong>{used}</strong>
                                        {index < usedBy.values.length - 1 ? ", " : ""}
                                    </span>
                                ))}
                            </div>
                        </PopoverContent>
                    </Popover>
                ) : (
                    <Button variant="ghost" className="h-auto p-0" onClick={toggle}>
                        <Label label={t(`used.${usedBy.type}`)} />
                    </Button>
                ))}
            {usedBy?.type === "DEFAULT" && (
                <Label label={t(`flow.${REALM_FLOWS.get(key!)}`)} />
            )}
            {!usedBy?.type && t("used.notInUse")}
        </>
    );
};
