import { useState } from "react";
import { CreateTopicDrawer } from "@/pages/topics/ui/create-topic-drawer";
import { useTopicsNavigate } from "@/pages/topics/model/use-topics-navigate";
import { useOnElementUnmount } from "@/shared/lib/hooks/use-on-element-unmount";

export const CreateTopicPage = () => {
	const [isOpen, setIsOpen] = useState(true);
	const { navigateToTopicsPage } = useTopicsNavigate();

	const { ref: unmountRef } = useOnElementUnmount({
		callback: () => {
			navigateToTopicsPage();
		},
		condition: !isOpen,
	});

	return (
		<CreateTopicDrawer
			ref={unmountRef}
			isOpen={isOpen}
			onOpenChange={setIsOpen}
			onSuccess={() => navigateToTopicsPage()}
			onCancel={() => navigateToTopicsPage()}
		/>
	);
};
