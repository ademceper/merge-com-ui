import type RequiredActionProviderRepresentation from "@keycloak/keycloak-admin-client/lib/defs/requiredActionProviderRepresentation";
import type RequiredActionProviderSimpleRepresentation from "@keycloak/keycloak-admin-client/lib/defs/requiredActionProviderSimpleRepresentation";
import { useTranslation } from "@merge-rd/i18n";
import { Button } from "@merge-rd/ui/components/button";
import { FacetedFormFilter } from "@merge-rd/ui/components/faceted-filter/faceted-form-filter";
import { Switch } from "@merge-rd/ui/components/switch";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@merge-rd/ui/components/table";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@merge-rd/ui/components/tooltip";
import { Gear } from "@phosphor-icons/react";
import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";
import {
	getErrorDescription,
	getErrorMessage,
	KeycloakSpinner,
} from "@/shared/keycloak-ui-shared";
import { toKey } from "@/admin/shared/lib/util";
import { useRequiredActions as useRequiredActionsQuery } from "./hooks/use-required-actions";
import { useUpdateRequiredAction } from "./hooks/use-update-required-action";
import { RequiredActionConfigModal } from "./components/required-action-config-modal";

type DataType = RequiredActionProviderRepresentation &
	RequiredActionProviderSimpleRepresentation & {
		configurable?: boolean;
	};

type Row = {
	name?: string;
	enabled: boolean;
	defaultAction: boolean;
	data: DataType;
};

export const RequiredActions = () => {
	const { t } = useTranslation();
	const [selectedAction, setSelectedAction] = useState<DataType>();
	const [search, setSearch] = useState("");

	const { data: actions, isLoading } = useRequiredActionsQuery();
	const { mutateAsync: updateRequiredAction } = useUpdateRequiredAction();

	const updateAction = useCallback(
		async (action: DataType, field: "enabled" | "defaultAction") => {
			try {
				await updateRequiredAction({ action, field });
				toast.success(t("updatedRequiredActionSuccess"));
			} catch (error) {
				toast.error(
					t("updatedRequiredActionError", {
						error: getErrorMessage(error),
					}),
					{ description: getErrorDescription(error) },
				);
			}
		},
		[updateRequiredAction, t],
	);

	const filteredActions = useMemo(
		() =>
			actions
				? search
					? actions.filter((a) =>
							a.name
								?.toLowerCase()
								.includes(search.toLowerCase()),
						)
					: actions
				: [],
		[actions, search],
	);

	if (isLoading || !actions) {
		return <KeycloakSpinner />;
	}

	return (
		<>
			{selectedAction && (
				<RequiredActionConfigModal
					requiredAction={selectedAction}
					onClose={() => setSelectedAction(undefined)}
				/>
			)}
			<div className="space-y-4">
				<FacetedFormFilter
					type="text"
					size="small"
					placeholder={t("searchForAction")}
					value={search}
					onChange={value => setSearch(value)}
				/>
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>{t("action")}</TableHead>
							<TableHead className="w-[120px]">
								{t("enabled")}
							</TableHead>
							<TableHead className="w-[120px]">
								<TooltipProvider>
									<Tooltip>
										<TooltipTrigger asChild>
											<span>
												{t("setAsDefaultAction")}
											</span>
										</TooltipTrigger>
										<TooltipContent>
											{t("authDefaultActionTooltip")}
										</TooltipContent>
									</Tooltip>
								</TooltipProvider>
							</TableHead>
							<TableHead className="w-[80px]">
								{t("configure")}
							</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{filteredActions.length === 0 ? (
							<TableRow>
								<TableCell
									colSpan={4}
									className="text-center text-muted-foreground py-8"
								>
									{t("noRequiredActions")}
								</TableCell>
							</TableRow>
						) : (
							filteredActions.map((row) => (
								<TableRow key={row.name}>
									<TableCell>
										<span className="font-medium">
											{row.name ?? "-"}
										</span>
									</TableCell>
									<TableCell>
										<Switch
											id={`enable-${toKey(row.name ?? "")}`}
											checked={row.enabled}
											onCheckedChange={async () => {
												await updateAction(
													row.data,
													"enabled",
												);
											}}
											aria-label={row.name}
										/>
									</TableCell>
									<TableCell>
										<Switch
											id={`default-${toKey(row.name ?? "")}`}
											disabled={!row.enabled}
											checked={row.defaultAction}
											onCheckedChange={async () => {
												await updateAction(
													row.data,
													"defaultAction",
												);
											}}
											aria-label={row.name}
										/>
									</TableCell>
									<TableCell>
										{row.data.configurable ? (
											<Button
												variant="ghost"
												size="icon"
												aria-label={t("settings")}
												onClick={() =>
													setSelectedAction(row.data)
												}
											>
												<Gear className="size-4" />
											</Button>
										) : (
											"-"
										)}
									</TableCell>
								</TableRow>
							))
						)}
					</TableBody>
				</Table>
			</div>
		</>
	);
};
