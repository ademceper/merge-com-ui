import { IdentityProviderSelect } from "../identity-provider/identity-provider-select";
import type { ComponentProps } from "./components";

export const IdentityProviderMultiSelectComponent = (props: ComponentProps) => (
    <IdentityProviderSelect
        {...props}
        convertToName={props.convertToName}
        name={props.name!}
    />
);
