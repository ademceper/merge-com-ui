import type { AuthenticationProviderRepresentation } from "@keycloak/keycloak-admin-client/lib/defs/authenticatorConfigRepresentation";
import { useFetch } from "../../../../shared/keycloak-ui-shared";
import { Button } from "@merge/ui/components/button";
import { Input } from "@merge/ui/components/input";
import { MagnifyingGlass } from "@phosphor-icons/react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter
} from "@merge/ui/components/dialog";
import { TablePagination } from "@merge/ui/components/pagination";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useAdminClient } from "../../../admin-client";
import useLocaleSort, { mapByKey } from "../../../utils/useLocaleSort";
import { providerConditionFilter } from "../../FlowDetails";

type AuthenticationProviderListProps = {
    list?: AuthenticationProviderRepresentation[];
    setValue: (provider?: AuthenticationProviderRepresentation) => void;
};

const AuthenticationProviderList = ({
    list,
    setValue
}: AuthenticationProviderListProps) => {
    return (
        <div className="p-6">
            <form>
                {list?.map(provider => (
                    <label key={provider.id} className="flex items-start gap-2 py-1 cursor-pointer">
                        <input
                            type="radio"
                            id={provider.id!}
                            name="provider"
                            data-testid={provider.id}
                            onChange={() => {
                                setValue(provider);
                            }}
                            className="mt-1"
                        />
                        <div>
                            <div>{provider.displayName}</div>
                            {provider.description && <div className="text-sm text-muted-foreground">{provider.description}</div>}
                        </div>
                    </label>
                ))}
            </form>
        </div>
    );
};

export type FlowType = "client" | "form" | "basic" | "condition" | "subFlow";

type AddStepModalProps = {
    name: string;
    type: FlowType;
    onSelect: (value?: AuthenticationProviderRepresentation) => void;
};

export const AddStepModal = ({ name, type, onSelect }: AddStepModalProps) => {
    const { adminClient } = useAdminClient();

    const { t } = useTranslation();

    const [value, setValue] = useState<AuthenticationProviderRepresentation>();
    const [providers, setProviders] = useState<AuthenticationProviderRepresentation[]>();
    const [max, setMax] = useState(10);
    const [first, setFirst] = useState(0);
    const [search, setSearch] = useState("");
    const localeSort = useLocaleSort();

    useFetch(
        async () => {
            switch (type) {
                case "client":
                    return adminClient.authenticationManagement.getClientAuthenticatorProviders();
                case "form":
                    return adminClient.authenticationManagement.getFormActionProviders();
                case "condition": {
                    const providers =
                        await adminClient.authenticationManagement.getAuthenticatorProviders();
                    return providers.filter(providerConditionFilter);
                }
                case "basic":
                default: {
                    const providers =
                        await adminClient.authenticationManagement.getAuthenticatorProviders();
                    return providers.filter(p => !providerConditionFilter(p));
                }
            }
        },
        providers => setProviders(providers),
        []
    );

    const page = useMemo(() => {
        const normalizedSearch = search.trim().toLowerCase();
        return localeSort(providers ?? [], mapByKey("displayName"))
            .filter(
                ({ displayName, description }) =>
                    displayName?.toLowerCase().includes(normalizedSearch) ||
                    description?.toLowerCase().includes(normalizedSearch)
            )
            .slice(first, first + max + 1);
    }, [providers, search, first, max]);

    return (
        <Dialog open onOpenChange={(open) => { if (!open) onSelect(); }}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>
                        {type == "condition"
                            ? t("addConditionTo", { name })
                            : t("addExecutionTo", { name })}
                    </DialogTitle>
                </DialogHeader>
                {providers && (
                    <>
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                            <div className="flex flex-1 min-w-0 items-center gap-1 rounded-lg border border-input bg-transparent px-2">
                                <MagnifyingGlass className="text-muted-foreground size-4 shrink-0" />
                                <Input
                                    placeholder={t("search")}
                                    aria-label={t("search")}
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="border-0 bg-transparent shadow-none focus-visible:ring-0 flex-1 min-w-0"
                                />
                            </div>
                            <TablePagination
                                count={localeSort(providers ?? [], mapByKey("displayName")).filter(
                                    ({ displayName, description }) => {
                                        const n = search.trim().toLowerCase();
                                        return displayName?.toLowerCase().includes(n) || description?.toLowerCase().includes(n);
                                    }
                                ).length}
                                first={first}
                                max={max}
                                onNextClick={setFirst}
                                onPreviousClick={setFirst}
                                onPerPageSelect={(_first, newMax) => {
                                    setMax(newMax);
                                    setFirst(0);
                                }}
                                t={t}
                            />
                        </div>
                        <AuthenticationProviderList
                            list={page.slice(0, max)}
                            setValue={setValue}
                        />
                    </>
                )}
                <DialogFooter>
                    <Button
                        id="modal-add"
                        data-testid="modal-add"
                        key="add"
                        onClick={() => onSelect(value)}
                    >
                        {t("add")}
                    </Button>
                    <Button
                        data-testid="cancel"
                        id="modal-cancel"
                        key="cancel"
                        variant="link"
                        onClick={() => {
                            onSelect();
                        }}
                    >
                        {t("cancel")}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
