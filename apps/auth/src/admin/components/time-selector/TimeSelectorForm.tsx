/**
 * WARNING: Before modifying this file, run the following command:
 *
 * $ npx keycloakify own --path "admin/components/time-selector/TimeSelectorForm.tsx"
 *
 * This file is provided by @keycloakify/keycloak-admin-ui version 260502.0.0.
 * It was copied into your repository by the postinstall script: `keycloakify sync-extensions`.
 */

/* eslint-disable */

// @ts-nocheck

import { useController } from "react-hook-form";
import { TimeSelector, TimeSelectorProps } from "./TimeSelector";

type TimeSelectorFormProps = TimeSelectorProps & {
    name: string;
};

export const TimeSelectorForm = (props: TimeSelectorFormProps) => {
    const { field } = useController(props);

    return <TimeSelector {...props} {...field} />;
};
