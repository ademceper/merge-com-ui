import { Button } from "@merge-rd/ui/components/button";
import type { PageProps } from "keycloakify/login/pages/PageProps";
import AuthLayout from "../components/auth-layout";
import type { I18n } from "../i18n";
import type { KcContext } from "../kc-context";

export default function DeleteCredential(
    props: PageProps<Extract<KcContext, { pageId: "delete-credential.ftl" }>, I18n>
) {
    const { kcContext, i18n } = props;

    const { url, credentialLabel } = kcContext;

    const { msg, msgStr } = i18n;

    return (
        <AuthLayout>
            <div className="space-y-5">
                <h1 className="text-xl font-semibold text-foreground tracking-tight">
                    {msg("deleteCredentialTitle", credentialLabel)}
                </h1>

                <p className="text-sm text-muted-foreground">
                    {msg("deleteCredentialMessage", credentialLabel)}
                </p>

                <form
                    action={url.loginAction}
                    method="post"
                    className="flex flex-col gap-3 pt-2"
                >
                    <Button
                        type="submit"
                        name="accept"
                        variant="destructive"
                        size="xl"
                        className="w-full"
                    >
                        {msgStr("doConfirmDelete")}
                    </Button>
                    <Button
                        type="submit"
                        name="cancel-aia"
                        value="true"
                        variant="secondary"
                        size="xl"
                        className="w-full"
                    >
                        {msgStr("doCancel")}
                    </Button>
                </form>
            </div>
        </AuthLayout>
    );
}
