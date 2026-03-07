import { PermissionsEnum } from "@novu/shared";
import { useState } from "react";
import { useParams } from "react-router-dom";
import { TopicDrawer } from "@/features/topics/components/topic-drawer";
import { useTopicsNavigate } from "@/features/topics/hooks/use-topics-navigate";
import { useHasPermission } from "@/hooks/use-has-permission";
import { useOnElementUnmount } from "@/hooks/use-on-element-unmount";

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
