import type GroupRepresentation from "@keycloak/keycloak-admin-client/lib/defs/groupRepresentation";
import { useTranslation } from "@merge-rd/i18n";
import { toast } from "sonner";
import { getErrorDescription, getErrorMessage } from "../../../shared/keycloak-ui-shared";
import { GroupPickerDialog } from "../../shared/ui/group/group-picker-dialog";
import { useMoveGroup } from "./hooks/use-move-group";

type MoveDialogProps = {
    source: GroupRepresentation;
    onClose: () => void;
    refresh: () => void;
};

export const MoveDialog = ({ source, onClose, refresh }: MoveDialogProps) => {
    const { t } = useTranslation();
    const { mutateAsync: moveGroupMutation } = useMoveGroup();

    const moveGroup = async (group?: GroupRepresentation[]) => {
        try {
            await moveGroupMutation({
                source,
                dest: group ? group[0] : undefined
            });
            refresh();
            toast.success(t("moveGroupSuccess"));
            onClose();
        } catch (error) {
            toast.error(t("moveGroupError", { error: getErrorMessage(error) }), {
                description: getErrorDescription(error)
            });
        }
    };

    return (
        <GroupPickerDialog
            type="selectOne"
            filterGroups={[source]}
            text={{
                title: "moveToGroup",
                ok: "moveHere"
            }}
            onClose={onClose}
            onConfirm={moveGroup}
            isMove
        />
    );
};
