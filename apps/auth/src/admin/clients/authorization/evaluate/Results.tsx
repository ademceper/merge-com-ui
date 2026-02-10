import { MagnifyingGlass } from "@phosphor-icons/react";
import { Button } from "@merge/ui/components/button";
import { Input } from "@merge/ui/components/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@merge/ui/components/select";
import { Separator } from "@merge/ui/components/separator";
import {
    Table,
    TableHead,
    TableHeader,
    TableRow
} from "@merge/ui/components/table";
import { KeyboardEvent, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import type EvaluationResultRepresentation from "@keycloak/keycloak-admin-client/lib/defs/evaluationResultRepresentation";
import type PolicyEvaluationResponse from "@keycloak/keycloak-admin-client/lib/defs/policyEvaluationResponse";
import useToggle from "../../../utils/useToggle";
import { FixedButtonsGroup } from "../../../components/form/FixedButtonGroup";
import {
    Empty,
    EmptyContent,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle
} from "@merge/ui/components/empty";
import { AuthorizationDataModal } from "../AuthorizationDataModal";
import { AuthorizationEvaluateResource } from "../AuthorizationEvaluateResource";

type ResultProps = {
    evaluateResult: PolicyEvaluationResponse;
    refresh: () => void;
    back: () => void;
};

enum ResultsFilter {
    All = "ALL",
    StatusDenied = "STATUS_DENIED",
    StatusPermitted = "STATUS_PERMITTED"
}

function filterResults(results: EvaluationResultRepresentation[], filter: ResultsFilter) {
    switch (filter) {
        case ResultsFilter.StatusPermitted:
            return results.filter(({ status }) => status === "PERMIT");
        case ResultsFilter.StatusDenied:
            return results.filter(({ status }) => status === "DENY");
        default:
            return results;
    }
}

export const Results = ({ evaluateResult, refresh, back }: ResultProps) => {
    const { t } = useTranslation();

    const [_filterDropdownOpen, _toggleFilterDropdown] = useToggle();

    const [filter, setFilter] = useState(ResultsFilter.All);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchInput, setSearchInput] = useState("");

    const confirmSearchQuery = () => {
        setSearchQuery(searchInput);
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            confirmSearchQuery();
        }
    };

    const filteredResources = useMemo(
        () =>
            filterResults(evaluateResult.results!, filter).filter(
                ({ resource }) => resource?.name?.includes(searchQuery) ?? false
            ),
        [evaluateResult.results, filter, searchQuery]
    );

    const noEvaluatedData = evaluateResult.results!.length === 0;
    const noFilteredData = filteredResources.length === 0;

    return (
        <div>
            <div className="flex flex-wrap items-center gap-2 providers-toolbar">
                <div className="flex flex-1 min-w-0 gap-1">
                    <Input
                        name="inputGroupName"
                        id="inputGroupName"
                        type="search"
                        aria-label={t("search")}
                        placeholder={t("search")}
                        value={searchInput}
                        onChange={e => setSearchInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        className="flex-1"
                    />
                    <Button
                        variant="secondary"
                        aria-label={t("search")}
                        type="button"
                        onClick={() => confirmSearchQuery()}
                    >
                        <MagnifyingGlass className="size-4" />
                    </Button>
                </div>
                <Select
                    value={filter}
                    onValueChange={value => {
                        setFilter(value as ResultsFilter);
                        refresh();
                    }}
                >
                    <SelectTrigger
                        data-testid="filter-type-select"
                        className="kc-filter-type-select w-[300px]"
                    >
                        <SelectValue>{filter}</SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem
                            data-testid="all-results-option"
                            value={ResultsFilter.All}
                        >
                            {t("allResults")}
                        </SelectItem>
                        <SelectItem
                            data-testid="result-permit-option"
                            value={ResultsFilter.StatusPermitted}
                        >
                            {t("resultPermit")}
                        </SelectItem>
                        <SelectItem
                            data-testid="result-deny-option"
                            value={ResultsFilter.StatusDenied}
                        >
                            {t("resultDeny")}
                        </SelectItem>
                    </SelectContent>
                </Select>
            </div>
            {!noFilteredData && (
                <Table aria-label={t("evaluationResults")}>
                    <TableHeader>
                        <TableRow>
                            <TableHead aria-hidden="true" />
                            <TableHead>{t("resource")}</TableHead>
                            <TableHead>{t("overallResults")}</TableHead>
                            <TableHead>{t("scopes")}</TableHead>
                            <TableHead aria-hidden="true" />
                        </TableRow>
                    </TableHeader>
                    {filteredResources.map((resource, rowIndex) => (
                        <AuthorizationEvaluateResource
                            key={rowIndex}
                            rowIndex={rowIndex}
                            resource={resource}
                            evaluateResults={evaluateResult.results}
                        />
                    ))}
                </Table>
            )}
            {(noFilteredData || noEvaluatedData) && (
                <>
                    <Separator />
                    <Empty className="py-12">
                        <EmptyHeader>
                            <EmptyMedia variant="icon">
                                <MagnifyingGlass className="size-4" />
                            </EmptyMedia>
                            <EmptyTitle>{t("noSearchResults")}</EmptyTitle>
                        </EmptyHeader>
                        <EmptyContent>
                            <EmptyDescription>{t("noSearchResultsInstructions")}</EmptyDescription>
                        </EmptyContent>
                    </Empty>
                </>
            )}
            <form onSubmit={e => e.preventDefault()}>
                <FixedButtonsGroup name="authorization">
                    <Button type="button" data-testid="authorization-eval" id="back-btn" onClick={back}>
                        {t("back")}
                    </Button>
                    <Button
                        type="button"
                        data-testid="authorization-reevaluate"
                        id="reevaluate-btn"
                        variant="secondary"
                        onClick={refresh}
                    >
                        {t("reevaluate")}
                    </Button>
                    <AuthorizationDataModal data={evaluateResult.rpt!} />
                </FixedButtonsGroup>
            </form>
        </div>
    );
};
