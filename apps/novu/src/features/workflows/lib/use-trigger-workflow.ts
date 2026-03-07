import type { IEnvironment } from "@/shared";
import { useMutation } from "@tanstack/react-query";
import { triggerWorkflow } from "@/entities/workflow/api/workflows";
import { useEnvironment } from "@/app/context/environment/hooks";

export const useTriggerWorkflow = (environmentHint?: IEnvironment) => {
	const { currentEnvironment } = useEnvironment();
	const { mutateAsync, isPending, error, data } = useMutation({
		mutationFn: async ({
			name,
			to,
			payload,
			context,
		}: {
			name: string;
			to: unknown;
			payload: unknown;
			context?: unknown;
		}) =>
			triggerWorkflow({
				environment:
					environmentHint ?? currentEnvironment ?? ({} as IEnvironment),
				name,
				to,
				payload,
				context,
			}),
	});

	return {
		triggerWorkflow: mutateAsync,
		isPending,
		error,
		data,
	};
};
