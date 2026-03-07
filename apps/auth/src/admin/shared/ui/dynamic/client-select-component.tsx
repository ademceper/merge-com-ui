import type { ComponentProps } from "./components";
import { ClientSelect } from "../client/client-select";

export const ClientSelectComponent = (props: ComponentProps) => (
    <ClientSelect {...props} name={props.convertToName(props.name!)} />
);
