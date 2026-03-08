import type GroupRepresentation from "@keycloak/keycloak-admin-client/lib/defs/groupRepresentation";
import { useTranslation } from "@merge-rd/i18n";
import { useLocation } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { getErrorDescription, getErrorMessage } from "../../../shared/keycloak-ui-shared";
import { convertFormValuesToObject } from "../../shared/lib/util";
import {
    type AttributeForm,
    AttributesForm
} from "../../shared/ui/key-value-form/attribute-form";
import { arrayToKeyValue } from "../../shared/ui/key-value-form/key-value-convert";
import { useGroup } from "./hooks/use-group";
import { useUpdateGroup } from "./hooks/use-update-group";
import { getLastId } from "./group-id-utils";

export const GroupAttributes = () => {

    const { t } = useTranslation();
    const form = useForm<AttributeForm>({
        mode: "onChange"
    });

    const location = useLocation();
    const id = getLastId(location.pathname)!;
    const [currentGroup, setCurrentGroup] = useState<GroupRepresentation>();

    const { data: groupData } = useGroup(id);
    const { mutateAsync: updateGroupMutation } = useUpdateGroup(id);

    useEffect(() => {
        if (groupData) {
            form.reset({
                attributes: arrayToKeyValue(groupData.attributes!)
            });
            setCurrentGroup(groupData);
        }
    }, [groupData, form]);

    const save = async (attributeForm: AttributeForm) => {
        try {
            const attributes = convertFormValuesToObject(attributeForm).attributes;
            await updateGroupMutation({ ...currentGroup, attributes });

            setCurrentGroup({ ...currentGroup, attributes });
            toast.success(t("groupUpdated"));
        } catch (error) {
            toast.error(t("groupUpdateError", { error: getErrorMessage(error) }), {
                description: getErrorDescription(error)
            });
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
