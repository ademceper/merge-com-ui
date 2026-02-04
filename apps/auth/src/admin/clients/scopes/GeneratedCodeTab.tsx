import type UserRepresentation from "@keycloak/keycloak-admin-client/lib/defs/userRepresentation";
import { Textarea } from "@merge/ui/components/textarea";
import { useTranslation } from "react-i18next";
import { CopyToClipboardButton } from "../../components/copy-to-clipboard-button/CopyToClipboardButton";

type GeneratedCodeTabProps = {
    user?: UserRepresentation;
    text: string;
    label: string;
};

export const GeneratedCodeTab = ({ text, user, label }: GeneratedCodeTabProps) => {
    const { t } = useTranslation();

    return user ? (
        <div id={label} className="relative">
            <div className="absolute top-2 right-2">
                <CopyToClipboardButton id="code" text={text} label={label} />
            </div>
            <Textarea
                id={`text-area-${label}`}
                rows={20}
                value={text}
                aria-label={label}
                readOnly
                className="font-mono text-sm"
            />
        </div>
    ) : (
        <div className="flex flex-col items-center justify-center p-12 text-center" id={label}>
            <h2 className="text-lg font-semibold">{t(`${label}No`)}</h2>
            <p className="text-sm text-muted-foreground mt-2">{t(`${label}IsDisabled`)}</p>
        </div>
    );
};
