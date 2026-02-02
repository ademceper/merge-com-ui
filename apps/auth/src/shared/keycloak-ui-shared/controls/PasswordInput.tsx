/**
 * WARNING: Before modifying this file, run the following command:
 *
 * $ npx keycloakify own --path "shared/keycloak-ui-shared/controls/PasswordInput.tsx"
 *
 * This file is provided by @keycloakify/keycloak-ui-shared version 260502.0.0.
 * It was copied into your repository by the postinstall script: `keycloakify sync-extensions`.
 */

/* eslint-disable */

// @ts-nocheck

import {
    InputGroup,
    InputGroupButton,
    InputGroupInput,
} from "@merge/ui/components/input-group";
import { Eye, EyeSlash } from "@phosphor-icons/react";
import { MutableRefObject, Ref, forwardRef, useState } from "react";
import { useTranslation } from "react-i18next";

export type PasswordInputProps = Omit<
    React.ComponentProps<typeof InputGroupInput>,
    "type"
> & {
    hasReveal?: boolean;
};

const PasswordInputBase = ({
    hasReveal = true,
    innerRef,
    ...rest
}: PasswordInputProps & { innerRef?: Ref<HTMLInputElement> }) => {
    const { t } = useTranslation();
    const [hidePassword, setHidePassword] = useState(true);
    return (
        <InputGroup>
            <InputGroupInput
                {...rest}
                type={hidePassword ? "password" : "text"}
                ref={innerRef as MutableRefObject<HTMLInputElement>}
            />
            {hasReveal && (
                <InputGroupButton
                    type="button"
                    variant="ghost"
                    size="xs"
                    aria-label={t("showPassword")}
                    onClick={() => setHidePassword(!hidePassword)}
                >
                    {hidePassword ? <Eye className="size-4" /> : <EyeSlash className="size-4" />}
                </InputGroupButton>
            )}
        </InputGroup>
    );
};

export const PasswordInput = forwardRef(
    (props: PasswordInputProps, ref: Ref<HTMLInputElement>) => (
        <PasswordInputBase {...props} innerRef={ref} />
    )
);
PasswordInput.displayName = "PasswordInput";
