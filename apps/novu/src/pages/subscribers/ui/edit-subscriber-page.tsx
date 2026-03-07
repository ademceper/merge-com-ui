import { PermissionsEnum } from "@/shared";
import { useParams } from "@tanstack/react-router";
import { SubscriberTabs } from "@/pages/subscribers/ui/subscriber-tabs";
import { useHasPermission } from "@/shared/lib/hooks/use-has-permission";

export function EditSubscriberPage() {
	const { subscriberId } = useParams({ strict: false });
	const has = useHasPermission();
	const isReadOnly = !has({ permission: PermissionsEnum.SUBSCRIBER_WRITE });

	if (!subscriberId) {
		return null;
	}

	return <SubscriberTabs subscriberId={subscriberId} readOnly={isReadOnly} />;
}
