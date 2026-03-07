import type { GetSubscriptionDto, IEnvironment } from "@/shared";
import { get } from "@/shared/api/api.client";

export async function getSubscription({
	environment,
}: {
	environment: IEnvironment;
}) {
	const { data } = await get<{ data: GetSubscriptionDto }>(
		"/billing/subscription",
		{ environment },
	);
	return data;
}
