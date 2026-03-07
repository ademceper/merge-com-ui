import type { WorkflowTestDataResponseDto } from "@/shared";
import { useQuery } from "@tanstack/react-query";
import { getWorkflowTestData } from "@/entities/workflow/api/workflows";
import { useEnvironment } from "@/app/context/environment/hooks";
import { getIdFromSlug, WORKFLOW_DIVIDER } from "@/shared/lib/id-utils";
import { QueryKeys } from "@/shared/lib/query-keys";

export const useFetchWorkflowTestData = ({
	workflowSlug,
}: {
	workflowSlug: string;
}) => {
	const { currentEnvironment } = useEnvironment();
	const { data, isPending, error } = useQuery<WorkflowTestDataResponseDto>({
		queryKey: [
			QueryKeys.fetchWorkflowTestData,
			currentEnvironment?._id,
			getIdFromSlug({ slug: workflowSlug, divider: WORKFLOW_DIVIDER }),
		],
		queryFn: () =>
			getWorkflowTestData({ environment: currentEnvironment!, workflowSlug }),
		enabled: !!currentEnvironment?._id && !!workflowSlug,
		gcTime: 0,
	});

	return {
		testData: data,
		isPending,
		error,
	};
};
