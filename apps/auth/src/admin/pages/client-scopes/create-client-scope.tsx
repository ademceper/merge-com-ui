import { useTranslation } from "@merge-rd/i18n";
import { useNavigate } from "@tanstack/react-router";
import { useAdminClient } from "../../app/admin-client";
import { getErrorDescription, getErrorMessage } from "../../../shared/keycloak-ui-shared";
import { toast } from "sonner";
import {
    ClientScopeDefaultOptionalType,
    changeScope
} from "../../shared/ui/client-scope/client-scope-types";
import { useRealm } from "../../app/providers/realm-context/realm-context";
import { convertFormValuesToObject } from "../../shared/lib/util";
import { ScopeForm } from "./details/scope-form";
import { toClientScope } from "./routes/client-scope";

export default function CreateClientScope() {
    const { adminClient } = useAdminClient();

    const { t } = useTranslation();
    const navigate = useNavigate();
    const { realm } = useRealm();
const onSubmit = async (formData: ClientScopeDefaultOptionalType) => {
        const clientScope = convertFormValuesToObject({
            ...formData,
            name: formData.name?.trim().replace(/ /g, "_")
        });

        try {
            await adminClient.clientScopes.create(clientScope);

            const scope = await adminClient.clientScopes.findOneByName({
                name: clientScope.name!
            });

            if (!scope) {
                throw new Error(t("notFound"));
            }

            await changeScope(
                adminClient,
                { ...clientScope, id: scope.id },
                clientScope.type
            );

            toast.success(t("createClientScopeSuccess"));

            navigate({
                to: toClientScope({
                    realm,
                    id: scope.id!,
                    tab: "settings"
                }) as string
            });
        } catch (error) {
            toast.error(t("createClientScopeError", { error: getErrorMessage(error) }), { description: getErrorDescription(error) });
        }
    };

    return (
        <>
                        <div className="p-0">
                <div className="bg-muted/30 p-4">
                    <ScopeForm save={onSubmit} />
                </div>
            </div>
        </>
    );
}
