import { Tooltip, TooltipContent, TooltipTrigger } from "@merge-rd/ui/components/tooltip";
import { Question } from "@phosphor-icons/react";
import type { ReactNode } from "react";
import { useHelp } from "../context/help-context";

type HelpItemProps = {
    helpText: string | ReactNode;
    fieldLabelId: string;
    noVerticalAlign?: boolean;
    unWrap?: boolean;
};

export const HelpItem = ({
    helpText,
    fieldLabelId,
    noVerticalAlign = true,
    unWrap = false
}: HelpItemProps) => {
    const { enabled } = useHelp();
    if (!enabled) return null;
    const icon = (
        <Question size={14} className={noVerticalAlign ? "shrink-0" : ""} aria-hidden />
    );
    return (
        <Tooltip>
            {!unWrap ? (
                <TooltipTrigger asChild>
                    <button
                        type="button"
                        data-testid={`help-label-${fieldLabelId}`}
                        aria-label={fieldLabelId}
                        className="flex size-6 shrink-0 items-center justify-center text-muted-foreground hover:text-foreground rounded outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                        {icon}
                    </button>
                </TooltipTrigger>
            ) : (
                <span>{icon}</span>
            )}
            <TooltipContent className="z-[100] max-w-sm p-3 text-sm" side="top">
                {helpText}
            </TooltipContent>
        </Tooltip>
    );
};
