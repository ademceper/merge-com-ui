import { useTranslation } from "@merge-rd/i18n";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { getErrorDescription, getErrorMessage } from "@/shared/keycloak-ui-shared";
import { useRealm } from "@/admin/app/providers/realm-context/realm-context";
import { toClientScope } from "@/admin/shared/lib/routes/client-scopes";
import { convertFormValuesToObject } from "@/admin/shared/lib/util";
import type { ClientScopeDefaultOptionalType } from "@/admin/shared/ui/client-scope/client-scope-types";
import { useCreateClientScope } from "./hooks/use-create-client-scope";
import { ScopeForm } from "./details/scope-form";

export function CreateClientScope() {

    const { t } = useTranslation();
    const navigate = useNavigate();
    const { realm } = useRealm();
    const { mutateAsync: createClientScope } = useCreateClientScope();

    const onSubmit = async (formData: ClientScopeDefaultOptionalType) => {
        const clientScope = convertFormValuesToObject({
            ...formData,
            name: formData.name?.trim().replace(/ /g, "_")
        });

        try {
            const scope = await createClientScope(clientScope);

            toast.success(t("createClientScopeSuccess"));

            navigate({
                to: toClientScope({
                    realm,
                    id: scope.id!,
                    tab: "settings"
                }) as string
            });
        } catch (error) {
            toast.error(t("createClientScopeError", { error: getErrorMessage(error) }), {
                description: getErrorDescription(error)
            });
        }
    };

    return (
        <div className="p-0">
            <div className="bg-muted/30 p-4">
                <ScopeForm save={onSubmit} />
            </div>
        </div>
    );
}
