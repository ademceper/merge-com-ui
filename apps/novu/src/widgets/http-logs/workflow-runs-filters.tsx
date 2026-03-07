import { Button } from "@merge-rd/ui/components/button";
import { FacetedFormFilter } from "@merge-rd/ui/components/faceted-filter/faceted-form-filter";
import { cn } from "@merge-rd/ui/lib/utils";
import { SpinnerGap } from "@phosphor-icons/react";
import type { HTMLAttributes } from "react";
import { useForm } from "react-hook-form";
import type { ActivityFilters } from "@/entities/activity/api/activity";
import {
	Form,
	FormField,
	FormItem,
	FormRoot,
} from "@/shared/ui/primitives/form/form";
import { useDebouncedForm } from "@/shared/lib/hooks/use-debounced-form";
import { defaultWorkflowRunsFilter } from "./model/use-workflow-runs-url-state";

type WorkflowRunsFiltersProps = HTMLAttributes<HTMLDivElement> & {
	onFiltersChange: (filter: ActivityFilters) => void;
	filterValues: ActivityFilters;
	onReset?: () => void;
	isFetching?: boolean;
};

export function WorkflowRunsFilters(props: WorkflowRunsFiltersProps) {
	const {
		onFiltersChange,
		filterValues,
		onReset,
		className,
		isFetching,
		...rest
	} = props;

	const form = useForm<ActivityFilters>({
		values: filterValues,
		defaultValues: {
			...filterValues,
		},
	});
	const { formState, watch } = form;

	useDebouncedForm(watch, onFiltersChange, 400);

	const handleReset = () => {
		form.reset(defaultWorkflowRunsFilter);
		onFiltersChange(defaultWorkflowRunsFilter);
		onReset?.();
	};

	const isResetButtonVisible =
		formState.isDirty ||
		filterValues.channels?.length ||
		filterValues.subscriberId !== "";

	return (
		<div
			className={cn("flex items-center gap-2 px-2.5 py-1.5", className)}
			{...rest}
		>
			<Form {...form}>
				<FormRoot className="flex items-center gap-2">
					<FormField
						control={form.control}
						name="channels"
						render={({ field }) => (
							<FormItem className="relative">
								<FacetedFormFilter
									type="multi"
									size="small"
									title="Channels"
									options={[
										{ label: "Email", value: "email" },
										{ label: "SMS", value: "sms" },
										{ label: "Push", value: "push" },
										{ label: "In-App", value: "in_app" },
										{ label: "Chat", value: "chat" },
									]}
									selected={field.value || []}
									onSelect={field.onChange}
								/>
							</FormItem>
						)}
					/>

					<FormField
						control={form.control}
						name="subscriberId"
						render={({ field }) => (
							<FormItem className="relative">
								<FacetedFormFilter
									type="text"
									size="small"
									title="Subscriber ID"
									value={field.value}
									onChange={field.onChange}
									placeholder="Search by subscriber ID..."
								/>
							</FormItem>
						)}
					/>

					{isResetButtonVisible && (
						<div className="flex items-center gap-1">
							<Button
								variant="secondary"
								mode="ghost"
								size="2xs"
								onClick={handleReset}
							>
								Reset
							</Button>
							{isFetching && (
								<SpinnerGap className="h-3 w-3 animate-spin text-neutral-400" />
							)}
						</div>
					)}
				</FormRoot>
			</Form>
		</div>
	);
}
