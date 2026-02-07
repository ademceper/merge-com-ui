import UserSessionRepresentation from "@keycloak/keycloak-admin-client/lib/defs/userSessionRepresentation";
import { DropdownMenuItem } from "@merge/ui/components/dropdown-menu";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@merge/ui/components/select";
import { DotsThreeVertical, SignOut, ProhibitInset } from "@phosphor-icons/react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useAdminClient } from "../admin-client";
import { getErrorDescription, getErrorMessage, useFetch } from "../../shared/keycloak-ui-shared";
import { toast } from "@merge/ui/components/sonner";
import { useConfirmDialog } from "../components/confirm-dialog/ConfirmDialog";
import { ViewHeader } from "../components/view-header/ViewHeader";
import { fetchAdminUI } from "../context/auth/admin-ui-endpoint";
import { useRealm } from "../context/realm-context/RealmContext";
import helpUrls from "../help-urls";
import { RevocationModal } from "./RevocationModal";
import SessionsTable from "./SessionsTable";

type FilterType = "ALL" | "REGULAR" | "OFFLINE";

type SessionFilterProps = {
    filterType: FilterType;
    onChange: (filterType: FilterType) => void;
};

const SessionFilter = ({ filterType, onChange }: SessionFilterProps) => {
    const { t } = useTranslation();

    return (
        <Select
            value={filterType}
            onValueChange={value => onChange(value as FilterType)}
            data-testid="filter-session-type-select"
        >
            <SelectTrigger className="h-9 min-h-9 w-[180px]">
                <SelectValue />
            </SelectTrigger>
            <SelectContent>
                <SelectItem data-testid="all-sessions-option" value="ALL">
                    {t("sessionsType.allSessions")}
                </SelectItem>
                <SelectItem data-testid="regular-sso-option" value="REGULAR">
                    {t("sessionsType.regularSSO")}
                </SelectItem>
                <SelectItem data-testid="offline-option" value="OFFLINE">
                    {t("sessionsType.offline")}
                </SelectItem>
            </SelectContent>
        </Select>
    );
};

export default function SessionsSection() {
    const { adminClient } = useAdminClient();
    const { t } = useTranslation();
    const { realm } = useRealm();

    const [key, setKey] = useState(0);
    const refresh = () => setKey((k) => k + 1);
    const [revocationModalOpen, setRevocationModalOpen] = useState(false);
    const [filterType, setFilterType] = useState<FilterType>("ALL");
    const [sessions, setSessions] = useState<UserSessionRepresentation[]>([]);
    const [noSessions, setNoSessions] = useState(false);

    const handleRevocationModalToggle = () => {
        setRevocationModalOpen(!revocationModalOpen);
    };

    useFetch(
        async () => {
            const data = await fetchAdminUI<UserSessionRepresentation[]>(
                adminClient,
                "ui-ext/sessions",
                {
                    first: "0",
                    max: "1000",
                    type: filterType,
                    search: ""
                }
            );
            setNoSessions(data.length === 0);
            return data;
        },
        (data) => setSessions(data),
        [key, filterType]
    );

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
                titleKey="titleSessions"
                subKey="sessionExplain"
                helpUrl={helpUrls.sessionsUrl}
                divider
                dropdownIcon={<DotsThreeVertical className="size-5" />}
                dropdownItems={[
                    <DropdownMenuItem
                        key="revocation"
                        data-testid="revocation"
                        onClick={handleRevocationModalToggle}
                    >
                        <ProhibitInset className="size-4 shrink-0" />
                        {t("revocation")}
                    </DropdownMenuItem>,
                    <DropdownMenuItem
                        key="logout-all"
                        data-testid="logout-all"
                        disabled={noSessions}
                        onClick={toggleLogoutDialog}
                    >
                        <SignOut className="size-4 shrink-0" />
                        {t("signOutAllActiveSessions")}
                    </DropdownMenuItem>
                ]}
            />
            <div className="py-6 px-0">
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
                    sessions={sessions}
                    refresh={refresh}
                    toolbar={
                        <SessionFilter
                            filterType={filterType}
                            onChange={type => {
                                setFilterType(type);
                                refresh();
                            }}
                        />
                    }
                    emptyMessage={t("noSessions")}
                />
            </div>
        </>
    );
}
