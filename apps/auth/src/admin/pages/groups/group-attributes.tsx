import GroupRepresentation from "@keycloak/keycloak-admin-client/lib/defs/groupRepresentation";
import { getErrorDescription, getErrorMessage, useFetch } from "../../../shared/keycloak-ui-shared";
import { toast } from "sonner";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "@merge-rd/i18n";
import { useLocation } from "@tanstack/react-router";
import { useAdminClient } from "../../app/admin-client";
import {
    AttributeForm,
    AttributesForm
} from "../../shared/ui/key-value-form/attribute-form";
import { arrayToKeyValue } from "../../shared/ui/key-value-form/key-value-convert";
import { convertFormValuesToObject } from "../../shared/lib/util";
import { getLastId } from "./groupIdUtils";

export const GroupAttributes = () => {
    const { adminClient } = useAdminClient();

    const { t } = useTranslation();
const form = useForm<AttributeForm>({
        mode: "onChange"
    });

    const location = useLocation();
    const id = getLastId(location.pathname)!;
    const [currentGroup, setCurrentGroup] = useState<GroupRepresentation>();

    useFetch(
        () => adminClient.groups.findOne({ id }),
        group => {
            form.reset({
                attributes: arrayToKeyValue(group?.attributes!)
            });
            setCurrentGroup(group);
        },
        [id]
    );

    const save = async (attributeForm: AttributeForm) => {
        try {
            const attributes = convertFormValuesToObject(attributeForm).attributes;
            await adminClient.groups.update({ id: id! }, { ...currentGroup, attributes });

            setCurrentGroup({ ...currentGroup, attributes });
            toast.success(t("groupUpdated"));
        } catch (error) {
            toast.error(t("groupUpdateError", { error: getErrorMessage(error) }), { description: getErrorDescription(error) });
        }
    };

    return (
        <div className="p-6">
            <AttributesForm
                form={form}
                save={save}
                fineGrainedAccess={currentGroup?.access?.manage}
                reset={() =>
                    form.reset({
                        attributes: arrayToKeyValue(currentGroup?.attributes!)
                    })
                }
            />
        </div>
    );
};
