import UserSessionRepresentation from "@keycloak/keycloak-admin-client/lib/defs/userSessionRepresentation";
import { KeycloakSelect } from "../../shared/keycloak-ui-shared";
import { SelectOption } from "../../shared/keycloak-ui-shared";
import { Funnel } from "@phosphor-icons/react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useAdminClient } from "../admin-client";
import { getErrorDescription, getErrorMessage } from "../../shared/keycloak-ui-shared";
import { toast } from "@merge/ui/components/sonner";
import { useConfirmDialog } from "../components/confirm-dialog/ConfirmDialog";
import { ViewHeader } from "../components/view-header/ViewHeader";
import { fetchAdminUI } from "../context/auth/admin-ui-endpoint";
import { useRealm } from "../context/realm-context/RealmContext";
import helpUrls from "../help-urls";
import useToggle from "../utils/useToggle";
import { RevocationModal } from "./RevocationModal";
import SessionsTable from "./SessionsTable";

type FilterType = "ALL" | "REGULAR" | "OFFLINE";

type SessionFilterProps = {
    filterType: FilterType;
    onChange: (filterType: FilterType) => void;
};

const SessionFilter = ({ filterType, onChange }: SessionFilterProps) => {
    const { t } = useTranslation();

    const [open, toggle] = useToggle();

    return (
        <KeycloakSelect
            data-testid="filter-session-type-select"
            isOpen={open}
            onToggle={toggle}
            toggleIcon={<Funnel className="size-4" />}
            onSelect={value => {
                const filter = value as FilterType;
                onChange(filter);
                toggle();
            }}
            selections={filterType}
        >
            <SelectOption data-testid="all-sessions-option" value="ALL">
                {t("sessionsType.allSessions")}
            </SelectOption>
            <SelectOption data-testid="regular-sso-option" value="REGULAR">
                {t("sessionsType.regularSSO")}
            </SelectOption>
            <SelectOption data-testid="offline-option" value="OFFLINE">
                {t("sessionsType.offline")}
            </SelectOption>
        </KeycloakSelect>
    );
};

export default function SessionsSection() {
    const { adminClient } = useAdminClient();

    const { t } = useTranslation();

    const [key, setKey] = useState(0);
    const refresh = () => setKey(key + 1);
    const { realm } = useRealm();

    const [revocationModalOpen, setRevocationModalOpen] = useState(false);
    const [filterType, setFilterType] = useState<FilterType>("ALL");
    const [noSessions, setNoSessions] = useState(false);

    const handleRevocationModalToggle = () => {
        setRevocationModalOpen(!revocationModalOpen);
    };

    const loader = async (first?: number, max?: number, search?: string) => {
        const data = await fetchAdminUI<UserSessionRepresentation[]>(
            adminClient,
            "ui-ext/sessions",
            {
                first: `${first}`,
                max: `${max}`,
                type: filterType,
                search: search || ""
            }
        );
        setNoSessions(data.length === 0);
        return data;
    };

    const [toggleLogoutDialog, LogoutConfirm] = useConfirmDialog({
        titleKey: "logoutAllSessions",
        messageKey: "logoutAllDescription",
        continueButtonLabel: "confirm",
        onConfirm: async () => {
            try {
                await adminClient.realms.logoutAll({ realm });
                refresh();
            } catch (error) {
                toast.error(t("logoutAllSessionsError", { error: getErrorMessage(error) }), { description: getErrorDescription(error) });
            }
        }
    });

    return (
        <>
            <LogoutConfirm />
            <ViewHeader
                dropdownItems={[
                    <button
                        key="toggle-modal"
                        data-testid="revocation"
                        type="button"
                        onClick={() => handleRevocationModalToggle()}
                    >
                        {t("revocation")}
                    </button>,
                    <button
                        key="delete-role"
                        data-testid="logout-all"
                        type="button"
                        disabled={noSessions}
                        onClick={toggleLogoutDialog}
                    >
                        {t("signOutAllActiveSessions")}
                    </button>
                ]}
                titleKey="titleSessions"
                subKey="sessionExplain"
                helpUrl={helpUrls.sessionsUrl}
            />
            <div className="bg-muted/30 p-0">
                {revocationModalOpen && (
                    <RevocationModal
                        handleModalToggle={handleRevocationModalToggle}
                        save={() => {
                            handleRevocationModalToggle();
                        }}
                    />
                )}
                <SessionsTable
                    key={key}
                    loader={loader}
                    isSearching={filterType !== "ALL"}
                    isPaginated
                    filter={
                        <SessionFilter
                            filterType={filterType}
                            onChange={type => {
                                setFilterType(type);
                                refresh();
                            }}
                        />
                    }
                />
            </div>
        </>
    );
}
