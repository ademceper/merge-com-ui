import type RealmRepresentation from "@keycloak/keycloak-admin-client/lib/defs/realmRepresentation";
import { useTranslation } from "@merge-rd/i18n";
import { useMemo } from "react";
import { useFormContext } from "react-hook-form";
import { ScrollForm } from "../../../shared/keycloak-ui-shared";
import { useIsFeatureEnabled, Feature } from "../../shared/lib/use-is-feature-enabled";
import { TokensTabAccessSection } from "./tokens-tab-access-section";
import { TokensTabActionSection } from "./tokens-tab-action-section";
import { TokensTabGeneralSection } from "./tokens-tab-general-section";
import { TokensTabOid4vciSection } from "./tokens-tab-oid4vci-section";
import { TokensTabRefreshSection } from "./tokens-tab-refresh-section";

type RealmSettingsTokensTabProps = {
    realm: RealmRepresentation;
    save: (realm: RealmRepresentation) => void;
};

export const RealmSettingsTokensTab = ({ realm, save }: RealmSettingsTokensTabProps) => {
    const { t } = useTranslation();
    const isFeatureEnabled = useIsFeatureEnabled();
    const { handleSubmit } = useFormContext<RealmRepresentation>();

    const onSubmit = handleSubmit(save);

    const sections = useMemo(
        () => [
            {
                title: t("general"),
                panel: <TokensTabGeneralSection onSubmit={onSubmit} />
            },
            {
                title: t("refreshTokens"),
                panel: <TokensTabRefreshSection onSubmit={onSubmit} />
            },
            {
                title: t("accessTokens"),
                panel: <TokensTabAccessSection realm={realm} onSubmit={onSubmit} />
            },
            {
                title: t("actionTokens"),
                panel: <TokensTabActionSection realm={realm} onSubmit={onSubmit} />
            },
            {
                title: t("oid4vciAttributes"),
                isHidden: !isFeatureEnabled(Feature.OpenId4VCI),
                panel: <TokensTabOid4vciSection realm={realm} save={save} />
            }
        ],
        [t, realm, save, onSubmit, isFeatureEnabled]
    );

    return (
        <ScrollForm
            label={t("jumpToSection")}
            className="pt-0 pb-4"
            sections={sections}
        />
    );
};
