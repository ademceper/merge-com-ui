import { Button } from "@merge-rd/ui/components/button";
import { BookBookmark, PlusCircle } from "@phosphor-icons/react";
import { Link, useNavigate } from "react-router-dom";
import { LinkButton } from "@/components/primitives/button-link";
import { EmptyTopicsIllustration } from "@/features/topics/components/empty-topics-illustration";

export const RequestLogsEmptyState = () => {
	const navigate = useNavigate();

	const handleCreateWorkflow = () => {
		navigate("/workflows");
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
				<Link
					to="https://docs.novu.co/platform/concepts/workflows"
					target="_blank"
				>
					<LinkButton variant="gray" trailingIcon={BookBookmark}>
						View Docs
					</LinkButton>
				</Link>

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
