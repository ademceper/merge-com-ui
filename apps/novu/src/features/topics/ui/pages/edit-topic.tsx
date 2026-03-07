import { PermissionsEnum } from "@/shared";
import { useState } from "react";
import { useParams } from "react-router-dom";
import { TopicDrawer } from "@/features/topics/ui/topic-drawer";
import { useTopicsNavigate } from "@/features/topics/lib/use-topics-navigate";
import { useHasPermission } from "@/shared/lib/hooks/use-has-permission";
import { useOnElementUnmount } from "@/shared/lib/hooks/use-on-element-unmount";

export const EditTopicPage = () => {
	const { topicKey } = useParams<{ topicKey: string }>();
	const [open, setOpen] = useState(true);
	const { navigateToTopicsPage } = useTopicsNavigate();
	const has = useHasPermission();

	const isReadOnly = !has({ permission: PermissionsEnum.TOPIC_WRITE });

	const { ref: unmountRef } = useOnElementUnmount({
		callback: () => {
			navigateToTopicsPage();
		},
		condition: !open,
	});

	if (!topicKey) {
		return null;
	}

	return (
		<TopicDrawer
			ref={unmountRef}
			open={open}
			onOpenChange={setOpen}
			topicKey={topicKey}
			readOnly={isReadOnly}
		/>
	);
};
