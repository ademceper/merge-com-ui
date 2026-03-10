import { useTranslation } from "@merge-rd/i18n";
import { Button } from "@merge-rd/ui/components/button";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@merge-rd/ui/components/dialog";
import { FacetedFormFilter } from "@merge-rd/ui/components/faceted-filter/faceted-form-filter";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@merge-rd/ui/components/popover";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@merge-rd/ui/components/table";
import { CheckCircle } from "@phosphor-icons/react";
import { memo, useMemo, useState } from "react";
import { useRealm } from "@/admin/app/providers/realm-context/realm-context";
import { useToggle } from "@/admin/shared/lib/use-toggle";
import { useUsedBy } from "../hooks/use-used-by";
import { type AuthenticationType, REALM_FLOWS } from "../constants";

type UsedByProps = {
	authType: AuthenticationType;
};

const Label = ({ label }: { label: string }) => (
	<>
		<CheckCircle className="size-4 inline mr-1" /> {label}
	</>
);

type UsedByModalProps = {
	id: string;
	onClose: () => void;
	isSpecificClient: boolean;
};

const UsedByModal = ({ id, isSpecificClient, onClose }: UsedByModalProps) => {
	const { t } = useTranslation();
	const { data: list = [] } = useUsedBy(id, isSpecificClient);
	const [search, setSearch] = useState("");

	const filteredList = useMemo(
		() =>
			search
				? list.filter((item) =>
						item.name.toLowerCase().includes(search.toLowerCase()),
					)
				: list,
		[list, search],
	);

	return (
		<Dialog open onOpenChange={(open) => !open && onClose()}>
			<DialogContent className="max-w-2xl">
				<DialogHeader>
					<DialogTitle>{t("flowUsedBy")}</DialogTitle>
					<p className="text-sm text-muted-foreground">
						{t("flowUsedByDescription", {
							value: isSpecificClient
								? t("clients")
								: t("identiyProviders"),
						})}
					</p>
				</DialogHeader>
				<div className="space-y-4">
					<FacetedFormFilter
						type="text"
						size="small"
						placeholder={t("search")}
						value={search}
						onChange={value => setSearch(value)}
					/>
					{filteredList.length === 0 ? (
						<p className="text-center text-muted-foreground py-8">
							{t("noResults")}
						</p>
					) : (
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>{t("name")}</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{filteredList.map((item) => (
									<TableRow key={item.name}>
										<TableCell>{item.name}</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					)}
				</div>
				<DialogFooter>
					<Button
						data-testid="cancel"
						id="modal-cancel"
						variant="ghost"
						onClick={onClose}
					>
						{t("close")}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};

export const UsedBy = memo(({ authType: { id, usedBy } }: UsedByProps) => {
	const { t } = useTranslation();
	const { realmRepresentation: realm } = useRealm();
	const [open, toggle] = useToggle();

	const key = Object.entries(realm!).find(
		(e) => e[1] === usedBy?.values[0],
	)?.[0];

	return (
		<>
			{open && (
				<UsedByModal
					id={id!}
					onClose={toggle}
					isSpecificClient={usedBy?.type === "SPECIFIC_CLIENTS"}
				/>
			)}
			{(usedBy?.type === "SPECIFIC_PROVIDERS" ||
				usedBy?.type === "SPECIFIC_CLIENTS") &&
				(usedBy.values.length <= 8 ? (
					<Popover key={id}>
						<PopoverTrigger asChild>
							<Button variant="ghost" className="h-auto p-0">
								<Label label={t(`used.${usedBy.type}`)} />
							</Button>
						</PopoverTrigger>
						<PopoverContent aria-label={t("usedBy")}>
							<div key={`usedBy-${id}-${usedBy.values}`}>
								{t(
									`appliedBy${
										usedBy.type === "SPECIFIC_CLIENTS"
											? "Clients"
											: "Providers"
									}`,
								)}{" "}
								{usedBy.values.map((used, index) => (
									<span key={index}>
										<strong>{used}</strong>
										{index < usedBy.values.length - 1
											? ", "
											: ""}
									</span>
								))}
							</div>
						</PopoverContent>
					</Popover>
				) : (
					<Button
						variant="ghost"
						className="h-auto p-0"
						onClick={toggle}
					>
						<Label label={t(`used.${usedBy.type}`)} />
					</Button>
				))}
			{usedBy?.type === "DEFAULT" && (
				<Label label={t(`flow.${REALM_FLOWS.get(key!)}`)} />
			)}
			{!usedBy?.type && t("used.notInUse")}
		</>
	);
});
