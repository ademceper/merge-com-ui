import { useTranslation } from "react-i18next";
import { capitalize } from "lodash-es";
import { Badge } from "@merge/ui/components/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@merge/ui/components/popover";

type AuthorizationScopesDetailsProps = {
    row: {
        resourceType: string;
        associatedScopes?: { name: string }[];
    };
};

export const AuthorizationScopesDetails = ({ row }: AuthorizationScopesDetailsProps) => {
    const { t } = useTranslation();

    const associatedScopes = row.associatedScopes || [];

    return (
        <div className="flex flex-wrap gap-1">
            {associatedScopes.map((scope, index) => (
                <Popover key={index}>
                    <PopoverTrigger asChild>
                        <Badge variant="secondary" className="cursor-pointer">
                            {capitalize(scope.name)}
                        </Badge>
                    </PopoverTrigger>
                    <PopoverContent>
                        <p className="font-bold text-md">
                            {t("authorizationScopeDetailsTitle")}
                        </p>
                        <p className="text-sm">
                            {t("authorizationScopeDetailsSubtitle")}
                        </p>
                        <dl className="text-sm mt-2">
                            <dt className="font-medium">
                                {t("authorizationScopeDetailsName")}
                            </dt>
                            <dd>
                                {capitalize(scope.name)}
                            </dd>
                            <dt className="font-medium mt-1">
                                {t("authorizationScopeDetailsDescription")}
                            </dt>
                            <dd>
                                {t(
                                    `authorizationScope.${row.resourceType}.${scope.name}`
                                )}
                            </dd>
                        </dl>
                    </PopoverContent>
                </Popover>
            ))}
        </div>
    );
};
