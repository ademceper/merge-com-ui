import { Button } from "@merge-rd/ui/components/button";
import { FacetedFormFilter } from "@merge-rd/ui/components/faceted-filter/faceted-form-filter";
import { cn } from "@merge-rd/ui/lib/utils";
import { FeatureFlagsKeysEnum } from "@/shared";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { useEnvironment } from "@/app/context/environment/hooks";
import { ContextFilter } from "@/pages/contexts/ui/context-filter";
import { useFeatureFlag } from "@/shared/lib/hooks/use-feature-flag";

type TopicSubscriberFilterProps = {
	topicKey: string;
	onSubscriberIdChange: (subscriberId?: string) => void;
	subscriberId?: string;
	isLoading?: boolean;
	onLoadingChange?: (isLoading: boolean) => void;
	contextKeys?: string[];
	onContextKeysChange?: (contextKeys: string[]) => void;
	className?: string;
};

export function TopicSubscriberFilter({
	topicKey,
	onSubscriberIdChange,
	subscriberId,
	isLoading,
	onLoadingChange,
	contextKeys,
	onContextKeysChange,
	className,
}: TopicSubscriberFilterProps) {
	const isContextPreferencesEnabled = useFeatureFlag(
		FeatureFlagsKeysEnum.IS_CONTEXT_PREFERENCES_ENABLED,
	);
	const queryClient = useQueryClient();
	const { currentEnvironment } = useEnvironment();
	const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
	const [subscriberIdValue, setSubscriberIdValue] = useState(
		subscriberId || "",
	);

	useEffect(() => {
		setSubscriberIdValue(subscriberId || "");
	}, [subscriberId]);

	const clearDebounceTimeout = () => {
		if (debounceTimeoutRef.current) {
			clearTimeout(debounceTimeoutRef.current);
			debounceTimeoutRef.current = null;
		}
	};

	const debouncedSubscriberIdChange = (value: string) => {
		clearDebounceTimeout();

		debounceTimeoutRef.current = setTimeout(() => {
			onLoadingChange?.(true);

			queryClient.cancelQueries({
				queryKey: ["topic-subscriptions", currentEnvironment?._id, topicKey],
			});

			onSubscriberIdChange(value.trim() ? value : undefined);

			debounceTimeoutRef.current = null;
		}, 400);
	};

	const handleSubscriberIdChange = (value: string) => {
		setSubscriberIdValue(value);
		debouncedSubscriberIdChange(value);
	};

	const handleReset = () => {
		clearDebounceTimeout();
		onLoadingChange?.(true);
		setSubscriberIdValue("");
		onSubscriberIdChange(undefined);
	};

	useEffect(() => {
		return clearDebounceTimeout;
	}, [clearDebounceTimeout]);

	return (
		<div
			className={cn(
				"flex items-center gap-2",
				className,
				isLoading ? "pointer-events-none opacity-70" : "",
			)}
		>
			{contextKeys !== undefined &&
				onContextKeysChange &&
				isContextPreferencesEnabled && (
					<ContextFilter
						contextKeys={contextKeys}
						onContextKeysChange={onContextKeysChange}
						defaultOnClear={true}
						size="small"
					/>
				)}

			<FacetedFormFilter
				type="text"
				size="small"
				title="Subscriber ID"
				value={subscriberIdValue}
				onChange={handleSubscriberIdChange}
				placeholder="Search by subscriber ID"
			/>

			{subscriberId && (
				<Button
					variant="secondary"
					mode="ghost"
					size="2xs"
					onClick={handleReset}
					disabled={isLoading}
				>
					Reset
				</Button>
			)}
		</div>
	);
}
