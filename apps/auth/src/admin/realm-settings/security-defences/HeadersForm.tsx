import type RealmRepresentation from "@keycloak/keycloak-admin-client/lib/defs/realmRepresentation";
import { useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { FormPanel } from "../../../shared/keycloak-ui-shared";
import { FormAccess } from "../../components/form/FormAccess";
import { FixedButtonsGroup } from "../../components/form/FixedButtonGroup";
import { HelpLinkTextInput } from "./HelpLinkTextInput";

type HeadersFormProps = {
    realm: RealmRepresentation;
    save: (realm: RealmRepresentation) => void;
};

export const HeadersForm = ({ realm, save }: HeadersFormProps) => {
    const { t } = useTranslation();
    const form = useFormContext<RealmRepresentation>();
    const { reset, formState, handleSubmit } = form;

    return (
        <FormAccess
            isHorizontal
            role="manage-realm"
            className="mt-6 space-y-6"
            onSubmit={handleSubmit(save)}
        >
            <FormPanel title={t("headers")} className="space-y-6">
                <div className="space-y-4">
                    <HelpLinkTextInput
                        fieldName="browserSecurityHeaders.xFrameOptions"
                        url="https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Frame-Options"
                    />
                    <HelpLinkTextInput
                        fieldName="browserSecurityHeaders.contentSecurityPolicy"
                        url="https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy"
                    />
                    <HelpLinkTextInput
                        fieldName="browserSecurityHeaders.contentSecurityPolicyReportOnly"
                        url="https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy-Report-Only"
                    />
                    <HelpLinkTextInput
                        fieldName="browserSecurityHeaders.xContentTypeOptions"
                        url="https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Content-Type-Options"
                    />
                    <HelpLinkTextInput
                        fieldName="browserSecurityHeaders.xRobotsTag"
                        url="https://developers.google.com/search/docs/advanced/robots/robots_meta_tag"
                    />
                    <HelpLinkTextInput
                        fieldName="browserSecurityHeaders.strictTransportSecurity"
                        url="https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Strict-Transport-Security"
                    />
                    <HelpLinkTextInput
                        fieldName="browserSecurityHeaders.referrerPolicy"
                        url="https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Referrer-Policy"
                    />
                </div>
            </FormPanel>
            <FixedButtonsGroup
                name="headers"
                reset={() => reset(realm)}
                isSubmit
                isDisabled={!formState.isDirty}
            />
        </FormAccess>
    );
};
