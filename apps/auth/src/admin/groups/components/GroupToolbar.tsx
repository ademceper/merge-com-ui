import { Button } from "@merge/ui/components/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@merge/ui/components/dropdown-menu";
import { DotsThreeVertical } from "@phosphor-icons/react";
import { useTranslation } from "react-i18next";
import { useAccess } from "../../context/access/Access";
import useToggle from "../../utils/useToggle";
import { useSubGroups } from "../SubGroupsContext";

type GroupToolbarProps = {
    toggleCreate: () => void;
    toggleDelete: () => void;
    kebabDisabled: boolean;
};

export const GroupToolbar = ({
    toggleCreate,
    toggleDelete,
    kebabDisabled
}: GroupToolbarProps) => {
    const { t } = useTranslation();
    const { currentGroup } = useSubGroups();
    const { hasAccess } = useAccess();
    const isManager = hasAccess("manage-users") || currentGroup()?.access?.manage;

    const [openKebab, toggleKebab] = useToggle();

    if (!isManager) return <div />;

    return (
        <>
            <div>
                <Button
                    data-testid="openCreateGroupModal"
                    variant="default"
                    onClick={toggleCreate}
                >
                    {t("createGroup")}
                </Button>
            </div>
            <div>
                <DropdownMenu open={openKebab} onOpenChange={toggleKebab}>
                    <DropdownMenuTrigger asChild>
                        <Button
                            data-testid="kebab"
                            variant="ghost"
                            disabled={kebabDisabled}
                            aria-label="Actions"
                        >
                            <DotsThreeVertical className="size-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <DropdownMenuItem
                            onClick={() => {
                                toggleDelete();
                                toggleKebab();
                            }}
                        >
                            {t("delete")}
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </>
    );
};
