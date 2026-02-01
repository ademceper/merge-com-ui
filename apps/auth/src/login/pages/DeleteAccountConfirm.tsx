import type { PageProps } from "keycloakify/login/pages/PageProps";
import type { KcContext } from "../KcContext";
import type { I18n } from "../i18n";
import AuthLayout from "../components/AuthLayout";
import { Alert, AlertDescription } from "@merge/ui/components/alert";

const primaryButtonClassName =
    "w-full h-12 rounded-lg bg-black text-white font-medium text-sm hover:bg-black/90 transition-colors disabled:opacity-50";
const secondaryButtonClassName =
    "w-full h-12 rounded-lg bg-gray-100 text-black font-medium text-sm hover:bg-gray-200 transition-colors border-0";

export default function DeleteAccountConfirm(
    props: PageProps<Extract<KcContext, { pageId: "delete-account-confirm.ftl" }>, I18n>
) {
    const { kcContext, i18n } = props;

    const { url, triggered_from_aia } = kcContext;

    const { msg, msgStr } = i18n;

    return (
        <AuthLayout>
            <div className="space-y-5">
                <h1 className="text-xl font-semibold text-black tracking-tight">
                    {msg("deleteAccountConfirm")}
                </h1>

                <Alert variant="default" className="rounded-lg border-amber-200 bg-amber-50 text-amber-900">
                    <AlertDescription>{msg("irreversibleAction")}</AlertDescription>
                </Alert>

                <p className="text-sm text-gray-600">{msg("deletingImplies")}</p>
                <ul className="list-inside list-disc space-y-1 text-sm text-gray-600">
                    <li>{msg("loggingOutImmediately")}</li>
                    <li>{msg("errasingData")}</li>
                </ul>
                <p className="text-sm text-gray-600">{msg("finalDeletionConfirmation")}</p>

                <form action={url.loginAction} method="post" className="pt-2">
                    <div className="flex gap-3 justify-between">
                        {triggered_from_aia && (
                            <button
                                type="submit"
                                name="cancel-aia"
                                value="true"
                                className={secondaryButtonClassName}
                            >
                                {msgStr("doCancel")}
                            </button>
                        )}
                        <button type="submit" className={primaryButtonClassName}>
                            {msgStr("doConfirmDelete")}
                        </button>
                    </div>
                </form>
            </div>
        </AuthLayout>
    );
}
