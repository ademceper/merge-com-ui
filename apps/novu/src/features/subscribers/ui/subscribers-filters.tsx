import { Button } from "@merge-rd/ui/components/button";
import { FacetedFormFilter } from "@merge-rd/ui/components/faceted-filter/faceted-form-filter";
import { cn } from "@merge-rd/ui/lib/utils";
import { SpinnerGap } from "@phosphor-icons/react";
import { type HTMLAttributes, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import {
	Form,
	FormField,
	FormItem,
	FormRoot,
} from "@/shared/ui/primitives/form/form";
import {
	defaultSubscribersFilter,
	type SubscribersFilter,
} from "@/features/subscribers/lib/use-subscribers-url-state";

export type SubscribersFiltersProps = HTMLAttributes<HTMLFormElement> & {
	onFiltersChange: (filter: SubscribersFilter) => void;
	filterValues: SubscribersFilter;
	onReset?: () => void;
	isFetching?: boolean;
};

export function SubscribersFilters(props: SubscribersFiltersProps) {
	const {
		onFiltersChange,
		filterValues,
		onReset,
		className,
		isFetching,
		...rest
	} = props;

	const form = useForm<SubscribersFilter>({
		values: {
			email: filterValues.email,
			phone: filterValues.phone,
			name: filterValues.name,
			subscriberId: filterValues.subscriberId,
		},
	});

	useEffect(() => {
		const subscription = form.watch((value) => {
			onFiltersChange(value as SubscribersFilter);
		});

		return () => subscription.unsubscribe();
	}, [form, onFiltersChange]);

	const filterHasValue = useMemo(() => {
		return Object.values(form.getValues()).some((value) => value !== "");
	}, [form.getValues]);

	const handleReset = () => {
		form.reset(defaultSubscribersFilter);
		onFiltersChange(defaultSubscribersFilter);
		onReset?.();
	};

	return (
		<Form {...form}>
			<FormRoot className={cn("flex items-center gap-2", className)} {...rest}>
				<FormField
					control={form.control}
					name="email"
					render={({ field }) => (
						<FormItem className="relative">
							<FacetedFormFilter
								type="text"
								size="small"
								title="Email"
								value={field.value}
								onChange={field.onChange}
								placeholder="Search by Email"
							/>
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="phone"
					render={({ field }) => (
						<FormItem className="relative">
							<FacetedFormFilter
								type="text"
								size="small"
								title="Phone"
								value={field.value}
								onChange={field.onChange}
								placeholder="Search by Phone"
							/>
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="name"
					render={({ field }) => (
						<FormItem className="relative">
							<FacetedFormFilter
								type="text"
								size="small"
								title="Name"
								value={field.value}
								onChange={field.onChange}
								placeholder="Search by Name"
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
								placeholder="Search by Subscriber ID"
							/>
						</FormItem>
					)}
				/>

				{filterHasValue && (
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
	);
}
