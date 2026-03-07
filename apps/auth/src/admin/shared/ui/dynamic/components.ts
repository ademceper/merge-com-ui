import type { ConfigPropertyRepresentation } from "@keycloak/keycloak-admin-client/lib/defs/authenticatorConfigInfoRepresentation";
import { FunctionComponent } from "react";

import { BooleanComponent } from "./boolean-component";
import { ClientSelectComponent } from "./client-select-component";
import { ClaimDisplayComponent } from "./claim-display-component";
import { IdentityProviderMultiSelectComponent } from "./identity-provider-multi-select-component";
import { FileComponent } from "./file-component";
import { GroupComponent } from "./group-component";
import { ListComponent } from "./list-component";
import { MapComponent } from "./map-component";
import { MultiValuedListComponent } from "./multivalued-list-component";
import { MultiValuedStringComponent } from "./multivalued-string-component";
import { PasswordComponent } from "./password-component";
import { RoleComponent } from "./role-component";
import { ScriptComponent } from "./script-component";
import { StringComponent } from "./string-component";
import { TextComponent } from "./text-component";
import { UrlComponent } from "./url-component";
import { UserProfileAttributeListComponent } from "./user-profile-attribute-list-component";
import { IntComponent } from "./int-component";
import { NumberComponent } from "./number-component";

/** Optional layout overrides for dynamic form fields (e.g. hide label, help after control). */
export type ComponentLayoutOptions = {
    /** Do not show the label (e.g. for select). */
    hideLabel?: boolean;
    /** Render help icon after the control instead of next to label. */
    helpIconAfterControl?: boolean;
    /** Boolean only: layout as [Label] [On/Off text] [Switch] [Help]. */
    booleanLabelTextSwitchHelp?: boolean;
};

export type ComponentProps = Omit<ConfigPropertyRepresentation, "type"> & {
    isDisabled?: boolean;
    isNew?: boolean;
    stringify?: boolean;
    convertToName: (name: string) => string;
    onSearch?: (search: string) => void;
} & Partial<ComponentLayoutOptions>;

export type NumberComponentProps = ComponentProps & {
    min?: number;
    max?: number;
};

type ComponentType =
    | "String"
    | "Text"
    | "Integer"
    | "Number"
    | "boolean"
    | "List"
    | "Role"
    | "Script"
    | "Map"
    | "Group"
    | "MultivaluedList"
    | "ClientList"
    | "IdentityProviderMultiList"
    | "UserProfileAttributeList"
    | "MultivaluedString"
    | "File"
    | "Password"
    | "Url"
    | "ClaimDisplay";

export const COMPONENTS: {
    [index in ComponentType]: FunctionComponent<ComponentProps>;
} = {
    String: StringComponent,
    Text: TextComponent,
    boolean: BooleanComponent,
    Integer: IntComponent,
    Number: NumberComponent,
    List: ListComponent,
    Role: RoleComponent,
    Script: ScriptComponent,
    Map: MapComponent,
    Group: GroupComponent,
    ClientList: ClientSelectComponent,
    IdentityProviderMultiList: IdentityProviderMultiSelectComponent,
    UserProfileAttributeList: UserProfileAttributeListComponent,
    MultivaluedList: MultiValuedListComponent,
    MultivaluedString: MultiValuedStringComponent,
    File: FileComponent,
    Password: PasswordComponent,
    Url: UrlComponent,
    ClaimDisplay: ClaimDisplayComponent
} as const;

export const isValidComponentType = (value: string): value is ComponentType =>
    value in COMPONENTS;
