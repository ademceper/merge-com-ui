import { useTranslation } from "react-i18next";
import { Label } from "@merge/ui/components/label";
import { RadioGroup, RadioGroupItem } from "@merge/ui/components/radio-group";
import { HelpItem } from "../../../shared/keycloak-ui-shared";
import { useFormContext } from "react-hook-form";
import { useState, type JSX } from "react";
import { GroupSelect } from "./GroupSelect";
import { UserSelect } from "../../components/users/UserSelect";
import { RoleSelect } from "./RoleSelect";
import { ClientSelectComponent } from "./ClientSelectComponent";

type ResourceTypeProps = {
    withEnforceAccessTo?: boolean;
    resourceType: string;
};

export const COMPONENTS: {
    [index: string]: (props: any) => JSX.Element;
} = {
    users: UserSelect,
    clients: ClientSelectComponent,
    groups: GroupSelect,
    roles: RoleSelect
} as const;

export const isValidComponentType = (value: string) => value in COMPONENTS;

export const ResourceType = ({
    resourceType,
    withEnforceAccessTo = true
}: ResourceTypeProps) => {
    const { t } = useTranslation();
    const form = useFormContext();
    const resourceIds: string[] = form.getValues("resources");
    const normalizedResourceType = resourceType.toLowerCase();

    const [isSpecificResources, setIsSpecificResources] = useState(
        resourceIds?.some(id => id !== resourceType) || !withEnforceAccessTo
    );

    function getComponentType() {
        if (isValidComponentType(normalizedResourceType)) {
            return COMPONENTS[normalizedResourceType];
        }
        return null;
    }

    const ComponentType = getComponentType();

    return (
        <>
            {withEnforceAccessTo && (
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <Label htmlFor="EnforceAccessTo">{t("enforceAccessTo")} *</Label>
                        <HelpItem
                            helpText={t("enforceAccessToHelpText")}
                            fieldLabelId="enforce-access-to"
                        />
                    </div>
                    <RadioGroup
                        value={isSpecificResources ? "specificResources" : "allResources"}
                        onValueChange={(v) => {
                            setIsSpecificResources(v === "specificResources");
                            form.setValue("resources", []);
                        }}
                        className="flex flex-col gap-2"
                    >
                        <div className="flex items-center gap-2">
                            <RadioGroupItem value="allResources" id="allResources" data-testid="allResources" />
                            <Label htmlFor="allResources" className="cursor-pointer">{t(`allResourceType`, { resourceType })}</Label>
                        </div>
                        <div className="flex items-center gap-2">
                            <RadioGroupItem value="specificResources" id="specificResources" data-testid="specificResources" />
                            <Label htmlFor="specificResources" className="cursor-pointer">{t(`specificResourceType`, { resourceType })}</Label>
                        </div>
                    </RadioGroup>
                </div>
            )}
            {isSpecificResources && ComponentType && (
                <ComponentType
                    name={withEnforceAccessTo ? "resources" : "resource"}
                    label={`${normalizedResourceType}Resources`}
                    helpText={t("resourceTypeHelpText", {
                        resourceType: normalizedResourceType
                    })}
                    defaultValue={[]}
                    variant={withEnforceAccessTo ? "typeaheadMulti" : "typeahead"}
                    isRequired={withEnforceAccessTo}
                    isRadio={!withEnforceAccessTo}
                />
            )}
        </>
    );
};
