import { Button } from "@merge-rd/ui/components/button";
import { BookBookmark, PlusCircle } from "@phosphor-icons/react";
import { useNavigate } from "@tanstack/react-router";
import { LinkButton } from "@/shared/ui/primitives/button-link";
import { EmptyTopicsIllustration } from "@/pages/topics/ui/empty-topics-illustration";

export const RequestLogsEmptyState = () => {
	const navigate = useNavigate();

	const handleCreateWorkflow = () => {
		navigate({ to: "/env/$environmentSlug/workflows" as string });
	};

	return (
		<div className="flex h-full w-full flex-col items-center justify-center gap-6">
			<EmptyTopicsIllustration />
			<div className="flex flex-col items-center gap-2 text-center">
				<span className="text-text-sub text-label-md block font-medium">
					No activity in past 90 days
				</span>
				<p className="text-text-soft text-paragraph-sm max-w-[60ch]">
					Your HTTP requests are empty. Once they start appearing, you'll be
					able to track notifications, troubleshoot issues, and view delivery
					details.
				</p>
			</div>

			<div className="flex items-center justify-center gap-6">
				<a
					href="https://docs.novu.co/platform/concepts/workflows"
					target="_blank"
					rel="noopener"
				>
					<LinkButton variant="gray" trailingIcon={BookBookmark}>
						View Docs
					</LinkButton>
				</a>

				<Button
					variant="primary"
					mode="gradient"
					size="xs"
					leadingIcon={PlusCircle}
					onClick={handleCreateWorkflow}
				>
					Trigger workflow
				</Button>
			</div>
		</div>
	);
};
