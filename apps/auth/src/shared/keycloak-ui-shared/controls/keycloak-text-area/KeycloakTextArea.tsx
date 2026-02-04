import { Textarea } from "@merge/ui/components/textarea";
import { type ComponentProps, forwardRef } from "react";

export type KeycloakTextAreaProps = Omit<ComponentProps<typeof Textarea>, "disabled" | "required"> & {
    isDisabled?: boolean;
    isRequired?: boolean;
};

export const KeycloakTextArea = forwardRef<HTMLTextAreaElement, KeycloakTextAreaProps>(
    ({ isDisabled, isRequired, ...props }, ref) => (
    <Textarea ref={ref} disabled={isDisabled} required={isRequired} {...props} />
)
);
KeycloakTextArea.displayName = "KeycloakTextArea";
