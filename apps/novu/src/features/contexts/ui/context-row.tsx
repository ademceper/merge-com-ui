import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@merge-rd/ui/components/dropdown-menu";
import { Skeleton } from "@merge-rd/ui/components/skeleton";
import { TableCell, TableRow } from "@merge-rd/ui/components/table";
import { cn } from "@merge-rd/ui/lib/utils";
import type { GetContextResponseDto } from "@novu/api/models/components";
import { PermissionsEnum } from "@/shared";
import { DotsThree, Pulse, Trash } from "@phosphor-icons/react";
import { type ComponentProps, useState } from "react";
import { Link } from "react-router-dom";
import { ConfirmationModal } from "@/shared/ui/confirmation-modal";
import { CompactButton } from "@/shared/ui/primitives/button-compact";
import { CopyButton } from "@/shared/ui/primitives/copy-button";
import { TimeDisplayHoverCard } from "@/shared/ui/time-display-hover-card";
import { useEnvironment } from "@/app/context/environment/hooks";
import { useContextsNavigate } from "@/features/contexts/lib/use-contexts-navigate";
import { useDeleteContext } from "@/features/contexts/lib/use-delete-context";
import { formatDateSimple } from "@/shared/lib/format-date";
import { Protect } from "@/shared/lib/protect";
import { buildRoute, ROUTES } from "@/shared/lib/routes";

type ContextRowProps = {
	context: GetContextResponseDto;
};

type ContextTableCellProps = ComponentProps<typeof TableCell>;

const ContextTableCell = (props: ContextTableCellProps) => {
	const { children, className, ...rest } = props;

	return (
		<TableCell
			className={cn(
				"group-hover:bg-neutral-alpha-50 text-text-sub relative",
				className,
			)}
			{...rest}
		>
			{children}
		</TableCell>
	);
};

export const ContextRow = ({ context }: ContextRowProps) => {
	const { navigateToEditContextPage } = useContextsNavigate();
	const { currentEnvironment } = useEnvironment();
	const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
	const { deleteContext, isPending: isDeleting } = useDeleteContext();

	const stopPropagation = (e: React.MouseEvent) => {
		e.stopPropagation();
	};

	const handleDeletion = async () => {
		try {
			await deleteContext({
				type: context.type,
				id: context.id,
			});
			setIsDeleteModalOpen(false);
		} catch {
			// Error is already handled by the useDeleteContext hook
		}
	};

	return (
		<>
			<TableRow
				className="group relative isolate cursor-pointer"
				onClick={() => {
					navigateToEditContextPage(context.type, context.id);
				}}
			>
				<ContextTableCell>
					<span className="max-w-[300px] truncate font-medium">
						{context.type}
					</span>
				</ContextTableCell>
				<ContextTableCell>
					<div className="flex items-center gap-1">
						<div className="font-code text-text-soft max-w-[300px] truncate">
							{context.id}
						</div>
						<CopyButton
							className="z-10 flex size-2 p-0 px-1 opacity-0 group-hover:opacity-100"
							valueToCopy={context.id}
							size="2xs"
						/>
					</div>
				</ContextTableCell>
				<ContextTableCell>
					{context.createdAt && (
						<TimeDisplayHoverCard date={context.createdAt}>
							{formatDateSimple(context.createdAt)}
						</TimeDisplayHoverCard>
					)}
				</ContextTableCell>
				<ContextTableCell>
					{context.updatedAt && (
						<TimeDisplayHoverCard date={context.updatedAt}>
							{formatDateSimple(context.updatedAt)}
						</TimeDisplayHoverCard>
					)}
				</ContextTableCell>
				<ContextTableCell className="w-1">
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<CompactButton
								icon={DotsThree}
								variant="ghost"
								className="z-10 h-8 w-8 p-0"
								onClick={stopPropagation}
							/>
						</DropdownMenuTrigger>
						<DropdownMenuContent className="w-44" onClick={stopPropagation}>
							<DropdownMenuGroup>
								<Protect permission={PermissionsEnum.NOTIFICATION_READ}>
									<DropdownMenuItem asChild className="cursor-pointer">
										<Link
											to={
												buildRoute(ROUTES.ACTIVITY_FEED, {
													environmentSlug: currentEnvironment?.slug ?? "",
												}) +
												"?" +
												new URLSearchParams({
													contextKeys: `${context.type}:${context.id}`,
												}).toString()
											}
										>
											<Pulse weight="fill" />
											View activity
										</Link>
									</DropdownMenuItem>
								</Protect>
								<Protect permission={PermissionsEnum.WORKFLOW_WRITE}>
									<DropdownMenuItem
										className="text-destructive cursor-pointer"
										onClick={() => {
											setTimeout(() => setIsDeleteModalOpen(true), 0);
										}}
									>
										<Trash />
										Delete context
									</DropdownMenuItem>
								</Protect>
							</DropdownMenuGroup>
						</DropdownMenuContent>
					</DropdownMenu>
				</ContextTableCell>
			</TableRow>
			<ConfirmationModal
				open={isDeleteModalOpen}
				onOpenChange={setIsDeleteModalOpen}
				onConfirm={handleDeletion}
				title="Delete context"
				description={
					<span>
						Are you sure you want to delete context{" "}
						<span className="font-bold">{context.id}</span>? This action cannot
						be undone.
					</span>
				}
				confirmButtonText="Delete context"
				isLoading={isDeleting}
			/>
		</>
	);
};

export const ContextRowSkeleton = () => {
	return (
		<TableRow>
			<TableCell>
				<Skeleton className="h-6 w-32" />
			</TableCell>
			<TableCell>
				<Skeleton className="h-6 w-24" />
			</TableCell>
			<TableCell>
				<Skeleton className="h-6 w-32" />
			</TableCell>
			<TableCell>
				<Skeleton className="h-6 w-32" />
			</TableCell>
			<TableCell className="w-1">
				<DotsThree weight="fill" className="size-4 opacity-50" />
			</TableCell>
		</TableRow>
	);
};
