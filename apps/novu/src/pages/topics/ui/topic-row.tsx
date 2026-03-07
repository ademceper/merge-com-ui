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
import { PermissionsEnum } from "@/shared";
import { Copy, DotsThree, Pulse, Trash } from "@phosphor-icons/react";
import { useQueryClient } from "@tanstack/react-query";
import { type ComponentProps, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ConfirmationModal } from "@/shared/ui/confirmation-modal";
import { CompactButton } from "@/shared/ui/primitives/button-compact";
import { CopyButton } from "@/shared/ui/primitives/copy-button";
import { showErrorToast } from "@/shared/ui/primitives/sonner-helpers";
import { TimeDisplayHoverCard } from "@/shared/ui/time-display-hover-card";
import { useEnvironment } from "@/app/context/environment/hooks";
import { useDeleteTopic } from "@/pages/topics/api/use-delete-topic";
import { useTopicsNavigate } from "@/pages/topics/model/use-topics-navigate";
import { formatDateSimple } from "@/shared/lib/format-date";
import { Protect } from "@/shared/lib/protect";
import { QueryKeys } from "@/shared/lib/query-keys";
import { buildRoute, ROUTES } from "@/shared/lib/routes";
import type { Topic } from "./types";

type TopicRowProps = {
	topic: Topic;
};

type TopicTableCellProps = ComponentProps<typeof TableCell>;

const TopicTableCell = (props: TopicTableCellProps) => {
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
			<span className="sr-only">Edit topic</span>
		</TableCell>
	);
};

export const TopicRow = ({ topic }: TopicRowProps) => {
	const { currentEnvironment } = useEnvironment();
	const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
	const { deleteTopic, isDeleting } = useDeleteTopic();
	const queryClient = useQueryClient();
	const { navigateToEditTopicPage } = useTopicsNavigate();

	const stopPropagation = (e: React.MouseEvent) => {
		e.stopPropagation();
	};

	const handleDeletion = async () => {
		try {
			await deleteTopic(topic.key);

			setIsDeleteModalOpen(false);

			queryClient.invalidateQueries({
				queryKey: [QueryKeys.fetchTopics],
				exact: false,
				refetchType: "all",
			});
		} catch (_error) {
			// Error is already handled by the useDeleteTopic hook
			showErrorToast("Failed to delete topic");
		}
	};

	return (
		<>
			<TableRow
				className="group relative isolate cursor-pointer"
				onClick={() => {
					navigateToEditTopicPage(topic.key);
				}}
			>
				<TopicTableCell>
					<div className="flex items-center">
						<span className="max-w-[300px] truncate font-medium">
							{topic.name}
						</span>
					</div>
				</TopicTableCell>
				<TopicTableCell>
					<div className="flex items-center gap-1">
						<div className="font-code text-text-soft max-w-[300px] truncate">
							{topic.key}
						</div>
						<CopyButton
							className="z-10 flex size-2 p-0 px-1 opacity-0 group-hover:opacity-100"
							valueToCopy={topic.key}
							size="2xs"
						/>
					</div>
				</TopicTableCell>
				<TopicTableCell>
					{topic.createdAt && (
						<TimeDisplayHoverCard date={topic.createdAt}>
							{formatDateSimple(topic.createdAt)}
						</TimeDisplayHoverCard>
					)}
				</TopicTableCell>
				<TopicTableCell>
					{topic.updatedAt && (
						<TimeDisplayHoverCard date={topic.updatedAt}>
							{formatDateSimple(topic.updatedAt)}
						</TimeDisplayHoverCard>
					)}
				</TopicTableCell>
				<TopicTableCell className="w-1">
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<CompactButton
								icon={DotsThree}
								variant="ghost"
								className="z-10 h-8 w-8 p-0"
							/>
						</DropdownMenuTrigger>
						<DropdownMenuContent className="w-44" onClick={stopPropagation}>
							<DropdownMenuGroup>
								<DropdownMenuItem
									className="cursor-pointer"
									onClick={() => {
										navigator.clipboard.writeText(topic.key);
									}}
								>
									<Copy />
									Copy identifier
								</DropdownMenuItem>
								<Protect permission={PermissionsEnum.NOTIFICATION_READ}>
									<DropdownMenuItem asChild className="cursor-pointer">
										<Link
											to={
												buildRoute(ROUTES.ACTIVITY_FEED, {
													environmentSlug: currentEnvironment?.slug ?? "",
												}) +
												"?" +
												new URLSearchParams({ topicKey: topic.key }).toString()
											}
										>
											<Pulse weight="fill" />
											View activity
										</Link>
									</DropdownMenuItem>
								</Protect>
								<Protect permission={PermissionsEnum.TOPIC_WRITE}>
									<DropdownMenuItem
										className="text-destructive cursor-pointer"
										onClick={() => {
											setTimeout(() => setIsDeleteModalOpen(true), 0);
										}}
									>
										<Trash />
										Delete topic
									</DropdownMenuItem>
								</Protect>
							</DropdownMenuGroup>
						</DropdownMenuContent>
					</DropdownMenu>
				</TopicTableCell>
			</TableRow>
			<ConfirmationModal
				open={isDeleteModalOpen}
				onOpenChange={setIsDeleteModalOpen}
				onConfirm={handleDeletion}
				title={`Delete topic`}
				description={
					<span>
						Are you sure you want to delete topic{" "}
						<span className="font-bold">{topic.name}</span>? This action cannot
						be undone.
					</span>
				}
				confirmButtonText="Delete topic"
				isLoading={isDeleting}
			/>
		</>
	);
};

export const TopicRowSkeleton = () => {
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
