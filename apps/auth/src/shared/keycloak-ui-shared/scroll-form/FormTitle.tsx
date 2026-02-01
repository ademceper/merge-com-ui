/**
 * WARNING: Before modifying this file, run the following command:
 *
 * $ npx keycloakify own --path "shared/keycloak-ui-shared/scroll-form/FormTitle.tsx"
 *
 * This file is provided by @keycloakify/keycloak-ui-shared version 260502.0.0.
 * It was copied into your repository by the postinstall script: `keycloakify sync-extensions`.
 */

/* eslint-disable */

// @ts-nocheck

import { Title, TitleProps } from "../../@patternfly/react-core";

import style from "./form-title.module.css";

type FormTitleProps = Omit<TitleProps, "headingLevel"> & {
    id?: string;
    title: string;
    headingLevel?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
};

export const FormTitle = ({
    id,
    title,
    headingLevel = "h1",
    size = "xl",
    ...rest
}: FormTitleProps) => (
    <Title
        headingLevel={headingLevel}
        size={size}
        className={style.title}
        id={id}
        tabIndex={0} // so that jumpLink sends focus to the section for a11y
        {...rest}
    >
        {title}
    </Title>
);
