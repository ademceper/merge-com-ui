import type {
	WorkflowListResponseDto,
	WorkflowResponseDto,
} from "@/shared";
import { ConfirmationModal } from "@/shared/ui/confirmation-modal";
import TruncatedText from "@/shared/ui/truncated-text";

type DeleteWorkflowDialogProps = {
	workflow: WorkflowResponseDto | WorkflowListResponseDto;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onConfirm: () => void;
	isLoading?: boolean;
};

export const DeleteWorkflowDialog = ({
	workflow,
	open,
	onOpenChange,
	onConfirm,
	isLoading,
}: DeleteWorkflowDialogProps) => {
	return (
		<ConfirmationModal
			open={open}
			onOpenChange={onOpenChange}
			onConfirm={onConfirm}
			title="Are you sure?"
			description={
				<>
					You're about to delete the{" "}
					<TruncatedText className="max-w-[32ch] font-semibold">
						{workflow.name}
					</TruncatedText>{" "}
					workflow, this action is permanent. <br />
					<br />
					You won't be able to trigger this workflow anymore.
				</>
			}
			confirmButtonText="Delete"
			isLoading={isLoading}
		/>
	);
};
