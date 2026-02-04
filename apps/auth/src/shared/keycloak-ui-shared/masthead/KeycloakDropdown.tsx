
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from "@merge/ui/components/dropdown-menu";
import { Button } from "@merge/ui/components/button";
import { DotsThreeVertical } from "@phosphor-icons/react";
import { ReactNode, useState } from "react";

type KeycloakDropdownProps = {
    "data-testid"?: string;
    isKebab?: boolean;
    title?: ReactNode;
    dropDownItems: ReactNode[];
};

export const KeycloakDropdown = ({
    isKebab = false,
    title,
    dropDownItems,
    ...rest
}: KeycloakDropdownProps) => {
    const [open, setOpen] = useState(false);

    return (
        <DropdownMenu open={open} onOpenChange={setOpen}>
            <DropdownMenuTrigger asChild>
                <Button
                    data-testid={rest["data-testid"] ? `${rest["data-testid"]}-toggle` : undefined}
                    variant={isKebab ? "ghost" : "default"}
                    size="sm"
                >
                    {isKebab ? <DotsThreeVertical size={20} /> : title}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                {dropDownItems}
            </DropdownMenuContent>
        </DropdownMenu>
    );
};
