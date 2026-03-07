import { useQuery } from "@tanstack/react-query";
import { getTopic } from "@/entities/topic/api/topics";
import { useEnvironment } from "@/app/context/environment/hooks";

export function useTopic(topicKey: string) {
	const { currentEnvironment } = useEnvironment();

	return useQuery({
		queryKey: ["topic", currentEnvironment?._id, topicKey],
		queryFn: () => getTopic({ environment: currentEnvironment!, topicKey }),
		enabled: !!currentEnvironment && !!topicKey,
		retry: 0,
	});
}
