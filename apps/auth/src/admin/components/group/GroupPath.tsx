import { useState } from "react";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@merge/ui/components/tooltip";

import type GroupRepresentation from "@keycloak/keycloak-admin-client/lib/defs/groupRepresentation";

type GroupPathProps = React.ComponentProps<"span"> & {
    group: GroupRepresentation;
};

export const GroupPath = ({
    group: { path },
    onMouseEnter: onMouseEnterProp,
    ...props
}: GroupPathProps) => {
    const [tooltip, setTooltip] = useState("");
    const onMouseEnter = (event: React.MouseEvent<HTMLSpanElement>) => {
        setTooltip(path!);
        onMouseEnterProp?.(event);
    };
    const text = (
        <span onMouseEnter={onMouseEnter} {...props}>
            {path}
        </span>
    );

    return tooltip !== "" ? (
        <TooltipProvider>
            <Tooltip open>
                <TooltipTrigger asChild>{text}</TooltipTrigger>
                <TooltipContent>{tooltip}</TooltipContent>
            </Tooltip>
        </TooltipProvider>
    ) : (
        text
    );
};
