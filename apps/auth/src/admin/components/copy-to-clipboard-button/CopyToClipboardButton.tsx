import { useSetTimeout } from "../../../shared/keycloak-ui-shared";
import { Button } from "@merge/ui/components/button";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@merge/ui/components/tooltip";
import { Copy } from "@phosphor-icons/react";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import useQueryPermission from "../../utils/useQueryPermission";

enum CopyState {
    Ready,
    Copied,
    Error
}

type CopyToClipboardButtonProps = {
    id: string;
    label: string;
    text: string;
    variant?: "ghost" | "outline";
};

export const CopyToClipboardButton = ({
    id,
    label: _label,
    text,
    variant = "ghost"
}: CopyToClipboardButtonProps) => {
    const { t } = useTranslation();
    const setTimeout = useSetTimeout();
    const permission = useQueryPermission("clipboard-write" as PermissionName);
    const permissionDenied = permission?.state === "denied";
    const [copyState, setCopyState] = useState(CopyState.Ready);

    // Determine the message to use for the copy button.
    const copyMessageKey = useMemo(() => {
        if (permissionDenied) {
            return "clipboardCopyDenied";
        }

        switch (copyState) {
            case CopyState.Ready:
                return "copyToClipboard";
            case CopyState.Copied:
                return "copySuccess";
            case CopyState.Error:
                return "clipboardCopyError";
        }
    }, [permissionDenied, copyState]);

    // Reset the message of the copy button after copying to the clipboard.
    useEffect(() => {
        if (copyState !== CopyState.Ready) {
            return setTimeout(() => setCopyState(CopyState.Ready), 1000);
        }
    }, [copyState, setTimeout]);

    const copyToClipboard = async (text: string) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopyState(CopyState.Copied);
        } catch {
            setCopyState(CopyState.Error);
        }
    };

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button
                        id={`copy-button-${id}`}
                        aria-label={t("copyToClipboard")}
                        onClick={() => copyToClipboard(text)}
                        variant={variant}
                        size="sm"
                        disabled={permissionDenied}
                    >
                        <Copy className="size-4" />
                    </Button>
                </TooltipTrigger>
                <TooltipContent>{t(copyMessageKey)}</TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
};
