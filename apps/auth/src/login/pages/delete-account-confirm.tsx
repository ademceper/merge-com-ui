import type { PageProps } from "keycloakify/login/pages/PageProps";
import type { KcContext } from "../kc-context";
import type { I18n } from "../i18n";
import AuthLayout from "../components/auth-layout";
import { Button } from "@merge-rd/ui/components/button";
import { Alert, AlertDescription } from "@merge-rd/ui/components/alert";

export default function DeleteAccountConfirm(props: PageProps<Extract<KcContext, { pageId: "delete-account-confirm.ftl" }>, I18n>) {
    const { kcContext, i18n } = props;

    const { url, triggered_from_aia } = kcContext;

    const { msg, msgStr } = i18n;

    return (
        <AuthLayout>
            <div className="space-y-5">
                <h1 className="text-xl font-semibold text-foreground tracking-tight">{msg("deleteAccountConfirm")}</h1>

                <Alert variant="default" className="rounded-lg border-border bg-muted text-foreground">
                    <AlertDescription>{msg("irreversibleAction")}</AlertDescription>
                </Alert>

                <p className="text-sm text-muted-foreground">{msg("deletingImplies")}</p>
                <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
                    <li>{msg("loggingOutImmediately")}</li>
                    <li>{msg("errasingData")}</li>
                </ul>
                <p className="text-sm text-muted-foreground">{msg("finalDeletionConfirmation")}</p>

                <form action={url.loginAction} method="post" className="pt-2">
                    <div className="flex flex-col gap-3">
                        <Button type="submit" size="xl" className="w-full">
                            {msgStr("doConfirmDelete")}
                        </Button>
                        {triggered_from_aia ? (
                            <Button type="submit" name="cancel-aia" value="true" variant="secondary" size="xl" className="w-full">
                                {msgStr("doCancel")}
                            </Button>
                        ) : (
                            <Button variant="secondary" size="xl" className="w-full" asChild>
                                <a href={url.loginRestartFlowUrl}>{msgStr("doCancel")}</a>
                            </Button>
                        )}
                    </div>
                </form>
            </div>
        </AuthLayout>
    );
}
