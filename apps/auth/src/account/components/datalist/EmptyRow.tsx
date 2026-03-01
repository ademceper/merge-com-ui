/**
 * This file has been claimed for ownership from @keycloakify/keycloak-account-ui version 260502.0.2.
 * To relinquish ownership and restore this file to its original content, run the following command:
 *
 * $ npx keycloakify own --path "account/components/datalist/EmptyRow.tsx" --revert
 */

type EmptyRowProps = {
    message: string;
    "data-testid"?: string;
};

export const EmptyRow = ({ message, ...props }: EmptyRowProps) => {
    return (
        <div
            className="py-8 text-center text-sm text-muted-foreground"
            {...props}
        >
            {message}
        </div>
    );
};
