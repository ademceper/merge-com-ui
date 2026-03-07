/**
 * The required format for a boolean flag key.
 */

type BooleanFlagKey =
	| `IS_${Uppercase<string>}_ENABLED`
	| `IS_${Uppercase<string>}_DISABLED`;
type NumericFlagKey = `${Uppercase<string>}_NUMBER`;

type FlagKey = BooleanFlagKey | NumericFlagKey;

type FlagType<T> = T extends BooleanFlagKey
	? boolean
	: T extends NumericFlagKey
		? number
		: never;

/**
 * Helper function to test that enum keys and values match correct format.
 *
 * It is not possible as of Typescript 5.2 to declare a type for an enum key or value in-line.
 * Therefore, we must test the enum via a helper function that abstracts the enum to an object.
 *
 * If the test fails, you should review your `enum` to verify that both the
 * keys and values match the format specified by the `FlagKey` template literal type.
 * ref: https://stackoverflow.com/a/58181315
 *
 * @param testEnum - the Enum to type check
 */
function testFlagEnumValidity<
	TEnum extends IFlags,
	IFlags = Record<FlagKey, FlagKey>,
>(
	_: TEnum &
		Record<
			Exclude<keyof TEnum, keyof IFlags>,
			["Key must follow `FlagKey` format"]
		>,
) {}

export enum FeatureFlagsKeysEnum {
	// Boolean flags
	IS_V2_ENABLED = "IS_V2_ENABLED",
	IS_SLACK_TEAMS_ENABLED = "IS_SLACK_TEAMS_ENABLED",

	IS_WORKFLOW_NODE_PREVIEW_ENABLED = "IS_WORKFLOW_NODE_PREVIEW_ENABLED",
	IS_WEBHOOKS_MANAGEMENT_ENABLED = "IS_WEBHOOKS_MANAGEMENT_ENABLED",
	IS_HTTP_LOGS_PAGE_ENABLED = "IS_HTTP_LOGS_PAGE_ENABLED",
	IS_INBOUND_WEBHOOKS_ENABLED = "IS_INBOUND_WEBHOOKS_ENABLED",
	IS_INBOUND_WEBHOOKS_CONFIGURATION_ENABLED = "IS_INBOUND_WEBHOOKS_CONFIGURATION_ENABLED",
	IS_WORKFLOW_RUN_PAGE_MIGRATION_ENABLED = "IS_WORKFLOW_RUN_PAGE_MIGRATION_ENABLED",
	IS_WORKFLOW_RUN_TREND_FROM_TRACES_ENABLED = "IS_WORKFLOW_RUN_TREND_FROM_TRACES_ENABLED",
	IS_SUBSCRIBERS_SCHEDULE_ENABLED = "IS_SUBSCRIBERS_SCHEDULE_ENABLED",
	IS_THROTTLE_STEP_ENABLED = "IS_THROTTLE_STEP_ENABLED",
	IS_REGION_SELECTOR_ENABLED = "IS_REGION_SELECTOR_ENABLED",
	IS_PUSH_UNREAD_COUNT_ENABLED = "IS_PUSH_UNREAD_COUNT_ENABLED",
	IS_ANALYTICS_WORKFLOW_FILTER_ENABLED = "IS_ANALYTICS_WORKFLOW_FILTER_ENABLED",
	IS_CONTEXTUAL_HELP_DRAWER_ENABLED = "IS_CONTEXTUAL_HELP_DRAWER_ENABLED",
	IS_SUBSCRIPTION_PREFERENCES_ENABLED = "IS_SUBSCRIPTION_PREFERENCES_ENABLED",
	IS_CONTEXT_PREFERENCES_ENABLED = "IS_CONTEXT_PREFERENCES_ENABLED",
	IS_AI_WORKFLOW_GENERATION_ENABLED = "IS_AI_WORKFLOW_GENERATION_ENABLED",
	IS_STEP_RESOLVER_ENABLED = "IS_STEP_RESOLVER_ENABLED",

	// String flags
	// Values: "off" | "shadow" | "live" | "complete"
	// Values: "bullmq" | "shadow" | "live" | "complete"
	// Numeric flags
	MAX_DATE_ANALYTICS_ENABLED_NUMBER = "MAX_DATE_ANALYTICS_ENABLED_NUMBER",
	IS_ANALYTICS_PAGE_ENABLED = "IS_ANALYTICS_PAGE_ENABLED",
	}

enum CloudflareSchedulerMode {
	OFF = "off",
	SHADOW = "shadow",
	LIVE = "live",
	COMPLETE = "complete",
}

enum QueueBackendMode {
	BULLMQ = "bullmq",
	SHADOW = "shadow",
	LIVE = "live",
	COMPLETE = "complete",
}

export type FeatureFlags = {
	[key in FeatureFlagsKeysEnum]: boolean | number | string | undefined;
};
