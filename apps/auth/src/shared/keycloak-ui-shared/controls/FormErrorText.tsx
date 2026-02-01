/**
 * WARNING: Before modifying this file, run the following command:
 *
 * $ npx keycloakify own --path "shared/keycloak-ui-shared/controls/FormErrorText.tsx"
 *
 * This file is provided by @keycloakify/keycloak-ui-shared version 260502.0.0.
 * It was copied into your repository by the postinstall script: `keycloakify sync-extensions`.
 */

/* eslint-disable */

// @ts-nocheck

import {
    FormHelperText,
    FormHelperTextProps,
    HelperText,
    HelperTextItem
} from "../../@patternfly/react-core";
import { ExclamationCircleIcon } from "../../@patternfly/react-icons";

export type FormErrorTextProps = FormHelperTextProps & {
    message: string;
};

export const FormErrorText = ({ message, ...props }: FormErrorTextProps) => {
    return (
        <FormHelperText {...props}>
            <HelperText>
                <HelperTextItem icon={<ExclamationCircleIcon />} variant="error">
                    {message}
                </HelperTextItem>
            </HelperText>
        </FormHelperText>
    );
};
