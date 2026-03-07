import { PermissionsEnum } from "@/shared";
import { BookBookmark, Path } from "@phosphor-icons/react";
import { Link } from "react-router-dom";
import { AddSubscriberIllustration } from "@/shared/ui/icons/add-subscriber-illustration";
import { LinkButton } from "@/shared/ui/primitives/button-link";
import { PermissionButton } from "@/shared/ui/primitives/permission-button";
import { useSubscribersNavigate } from "@/features/subscribers/lib/use-subscribers-navigate";

export const SubscriberListBlank = () => {
	const { navigateToCreateSubscriberPage } = useSubscribersNavigate();
	return (
		<div className="mt-[100px] flex h-full w-full flex-col items-center justify-center gap-6">
			<AddSubscriberIllustration />
			<div className="flex flex-col items-center gap-2 text-center">
				<span className="text-text-sub text-label-md block font-medium">
					No subscribers yet
				</span>
				<p className="text-text-soft text-paragraph-sm max-w-[60ch]">
					A subscriber represents a notification recipient. Subscribers are
					created automatically while triggering a workflow or can be imported
					via the API.
				</p>
			</div>

			<div className="flex items-center justify-center gap-6">
				<Link
					to="https://docs.novu.co/api-reference/subscribers/create-a-subscriber"
					target="_blank"
				>
					<LinkButton variant="gray" trailingIcon={BookBookmark}>
						Import via API
					</LinkButton>
				</Link>

				<PermissionButton
					permission={PermissionsEnum.SUBSCRIBER_WRITE}
					variant="primary"
					leadingIcon={Path}
					className="gap-2"
					onClick={navigateToCreateSubscriberPage}
				>
					Create subscriber
				</PermissionButton>
			</div>
		</div>
	);
};
