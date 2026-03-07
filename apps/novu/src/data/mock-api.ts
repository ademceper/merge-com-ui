import activityData from "./activity.json";
import contextsData from "./contexts.json";
import environmentsData from "./environments.json";
import integrationsData from "./integrations.json";
import layoutsData from "./layouts.json";
import subscribersData from "./subscribers.json";
import topicsData from "./topics.json";
import translationsData from "./translations.json";
import workflowsData from "./workflows.json";

export const MOCK_ENABLED = true;

type MockRoute = {
	pattern: RegExp;
	response: unknown;
};

const routes: MockRoute[] = [
	{ pattern: /^\/v2\/workflows\?/, response: workflowsData },
	{ pattern: /^\/v2\/workflows$/, response: workflowsData },
	{ pattern: /^\/v2\/subscribers\?/, response: subscribersData },
	{ pattern: /^\/v2\/subscribers$/, response: subscribersData },
	{ pattern: /^\/v2\/topics\?/, response: topicsData },
	{ pattern: /^\/v2\/topics$/, response: topicsData },
	{ pattern: /^\/v1\/notifications\?/, response: activityData },
	{ pattern: /^\/v1\/notifications$/, response: activityData },
	{ pattern: /^\/v1\/integrations$/, response: integrationsData },
	{ pattern: /^\/v2\/layouts\?/, response: layoutsData },
	{ pattern: /^\/v2\/layouts$/, response: layoutsData },
	{ pattern: /^\/v2\/translations\/list\?/, response: translationsData },
	{ pattern: /^\/v2\/translations\/list$/, response: translationsData },
	{ pattern: /^\/v2\/contexts\?/, response: contextsData },
	{ pattern: /^\/v2\/contexts$/, response: contextsData },
	{ pattern: /^\/v1\/environments$/, response: environmentsData },
	{
		pattern: /^\/v1\/environments\/api-keys$/,
		response: {
			data: [
				{
					_id: "key_001",
					key: "mock-api-key-dev-xxxxx",
					_environmentId: "env_dev_001",
				},
			],
		},
	},
	{
		pattern: /^\/v2\/environments\/[^/]+\/tags$/,
		response: {
			data: [
				{ name: "onboarding" },
				{ name: "transactional" },
				{ name: "security" },
				{ name: "billing" },
				{ name: "social" },
			],
		},
	},
	{
		pattern: /^\/v1\/billing\/subscription$/,
		response: {
			data: {
				apiServiceLevel: "free",
				isActive: true,
				hasPaymentMethod: false,
				status: "active",
				trial: {
					isActive: false,
					start: "2026-01-01",
					end: "2026-01-14",
					daysTotal: 14,
				},
				currentPeriodStart: "2026-03-01",
				currentPeriodEnd: "2026-04-01",
			},
		},
	},
	{ pattern: /^\/v1\/telemetry/, response: { data: {} } },
	{
		pattern: /^\/v2\/environments\/[^/]+\/diff$/,
		response: { data: { changes: [] } },
	},
];

export function getMockResponse(url: string): unknown | null {
	// Extract path from full URL (remove base URL)
	const path = url.replace(/^https?:\/\/[^/]+/, "");

	for (const route of routes) {
		if (route.pattern.test(path)) {
			return route.response;
		}
	}

	return null;
}
