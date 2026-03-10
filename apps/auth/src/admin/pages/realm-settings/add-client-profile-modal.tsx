import type ClientProfileRepresentation from "@keycloak/keycloak-admin-client/lib/defs/clientProfileRepresentation";
import type RoleRepresentation from "@keycloak/keycloak-admin-client/lib/defs/roleRepresentation";
import { useTranslation } from "@merge-rd/i18n";
import { Badge } from "@merge-rd/ui/components/badge";
import { Button } from "@merge-rd/ui/components/button";
import { Checkbox } from "@merge-rd/ui/components/checkbox";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@merge-rd/ui/components/dialog";
import {
	Empty,
	EmptyContent,
	EmptyDescription,
	EmptyHeader,
	EmptyTitle,
} from "@merge-rd/ui/components/empty";
import { FacetedFormFilter } from "@merge-rd/ui/components/faceted-filter/faceted-form-filter";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@merge-rd/ui/components/table";
import { useEffect, useMemo, useState } from "react";
import { KeycloakSpinner } from "@/shared/keycloak-ui-shared";
import { translationFormatter } from "@/admin/shared/lib/translation-formatter";
import { useClientProfiles } from "./hooks/use-client-profiles";

type ClientProfile = ClientProfileRepresentation & {
	global: boolean;
};

type AddClientProfileModalProps = {
	open: boolean;
	toggleDialog: () => void;
	onConfirm: (newReps: RoleRepresentation[]) => void;
	allProfiles: string[];
};

export const AddClientProfileModal = (props: AddClientProfileModalProps) => {
	const { t } = useTranslation();
	const [selectedRows, setSelectedRows] = useState<ClientProfile[]>([]);
	const [search, setSearch] = useState("");
	const [tableProfiles, setTableProfiles] = useState<
		ClientProfile[] | undefined
	>(undefined);

	const { data: allProfilesData } = useClientProfiles();

	useEffect(() => {
		if (allProfilesData) {
			const globalProfiles = (allProfilesData.globalProfiles ?? []).map(
				(p) => ({
					id: p.name,
					...p,
					global: true,
				}),
			) as ClientProfile[];
			const profiles = (allProfilesData.profiles ?? []).map((p) => ({
				...p,
				global: false,
			})) as ClientProfile[];
			setTableProfiles([...globalProfiles, ...profiles]);
		}
	}, [allProfilesData]);

	const data = useMemo(
		() =>
			(tableProfiles ?? []).filter(
				(item) => !props.allProfiles.includes(item.name!),
			),
		[tableProfiles, props.allProfiles],
	);

	const filteredData = useMemo(
		() =>
			search
				? data.filter((item) =>
						item.name?.toLowerCase().includes(search.toLowerCase()),
					)
				: data,
		[data, search],
	);

	const toggleSelect = (row: ClientProfile) => {
		setSelectedRows((prev) =>
			prev.some((r) => r.name === row.name)
				? prev.filter((r) => r.name !== row.name)
				: [...prev, row],
		);
	};

	if (tableProfiles === undefined) {
		return <KeycloakSpinner />;
	}

	return (
		<Dialog
			open={props.open}
			onOpenChange={(open) => {
				if (!open) props.toggleDialog();
			}}
		>
			<DialogContent data-testid="addClientProfile" className="max-w-4xl">
				<DialogHeader>
					<DialogTitle>{t("addClientProfile")}</DialogTitle>
				</DialogHeader>
				<div className="space-y-4">
					<FacetedFormFilter
						type="text"
						size="small"
						placeholder={t("searchProfile")}
						value={search}
						onChange={value => setSearch(value)}
					/>
					{filteredData.length === 0 ? (
						<Empty className="py-12">
							<EmptyHeader>
								<EmptyTitle>{t("noRoles")}</EmptyTitle>
							</EmptyHeader>
							<EmptyContent>
								<EmptyDescription>
									{t("noRolesInstructions")}
								</EmptyDescription>
								<Button variant="default">
									{t("createRole")}
								</Button>
							</EmptyContent>
						</Empty>
					) : (
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead className="w-10" />
									<TableHead>
										{t("clientProfileName")}
									</TableHead>
									<TableHead>{t("description")}</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{filteredData.map((profile) => (
									<TableRow key={profile.name}>
										<TableCell>
											<Checkbox
												checked={selectedRows.some(
													(r) =>
														r.name === profile.name,
												)}
												onCheckedChange={() =>
													toggleSelect(profile)
												}
											/>
										</TableCell>
										<TableCell>
											{profile.name}{" "}
											{profile.global && (
												<Badge
													variant="secondary"
													className="bg-blue-500/20 text-blue-700 dark:text-blue-300 ml-1"
												>
													{t("global")}
												</Badge>
											)}
										</TableCell>
										<TableCell>
											{
												translationFormatter(t)(
													profile.description,
												) as string
											}
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					)}
				</div>
				<DialogFooter>
					<Button
						data-testid="add-client-profile-button"
						disabled={selectedRows.length === 0}
						onClick={() => {
							props.toggleDialog();
							props.onConfirm(
								selectedRows as unknown as RoleRepresentation[],
							);
						}}
					>
						{t("add")}
					</Button>
					<Button
						variant="ghost"
						onClick={() => props.toggleDialog()}
					>
						{t("cancel")}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};
