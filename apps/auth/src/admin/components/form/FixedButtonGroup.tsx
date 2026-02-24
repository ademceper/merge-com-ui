import { useTranslation } from "react-i18next";
import { Button } from "@merge/ui/components/button";

type FixedButtonGroupProps = Omit<React.ComponentProps<"div">, "children"> & {
    name: string;
    save?: () => void;
    saveText?: string;
    reset?: () => void;
    resetText?: string;
    isSubmit?: boolean;
    isDisabled?: boolean;
    children?: React.ReactNode;
};

export const FixedButtonsGroup = ({
    name,
    save,
    saveText,
    reset,
    resetText,
    isSubmit = false,
    isDisabled = false,
    children,
    ...rest
}: FixedButtonGroupProps) => {
    const { t } = useTranslation();
    return (
        <div className="flex w-full justify-end gap-2" {...rest}>
            {(save || isSubmit) && (
                <Button
                    disabled={isDisabled}
                    data-testid={`${name}-save`}
                    onClick={() => save?.()}
                    type={isSubmit ? "submit" : "button"}
                >
                    {!saveText ? t("save") : saveText}
                </Button>
            )}
            {reset && (
                <Button
                    disabled={isDisabled}
                    data-testid={`${name}-revert`}
                    variant="ghost"
                    onClick={() => reset()}
                >
                    {!resetText ? t("revert") : resetText}
                </Button>
            )}
            {children}
        </div>
    );
};
