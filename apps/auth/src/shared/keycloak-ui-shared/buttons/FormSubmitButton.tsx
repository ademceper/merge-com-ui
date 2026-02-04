import { Button } from "@merge/ui/components/button";
import { PropsWithChildren } from "react";
import { FieldValues, FormState } from "react-hook-form";

export type FormSubmitButtonProps = Omit<React.ComponentProps<typeof Button>, "disabled"> & {
    formState: FormState<FieldValues>;
    allowNonDirty?: boolean;
    allowInvalid?: boolean;
    isDisabled?: boolean;
};

const isSubmittable = (
    formState: FormState<FieldValues>,
    allowNonDirty: boolean,
    allowInvalid: boolean
) => {
    return (
        (formState.isValid || allowInvalid) &&
        (formState.isDirty || allowNonDirty) &&
        !formState.isLoading &&
        !formState.isValidating &&
        !formState.isSubmitting
    );
};

export const FormSubmitButton = ({
    formState,
    isDisabled = false,
    allowInvalid = false,
    allowNonDirty = false,
    children,
    ...rest
}: PropsWithChildren<FormSubmitButtonProps>) => {
    return (
        <Button
            variant="default"
            disabled={
                (formState && !isSubmittable(formState, allowNonDirty, allowInvalid)) ||
                isDisabled
            }
            {...rest}
            type="submit"
        >
            {children}
        </Button>
    );
};
