import { PermissionsEnum } from "@/shared";
import { useState } from "react";
import { useParams } from "react-router-dom";
import { ContextDrawer } from "@/features/contexts/ui/context-drawer";
import { useContextsNavigate } from "@/features/contexts/lib/use-contexts-navigate";
import { useHasPermission } from "@/shared/lib/hooks/use-has-permission";
import { useOnElementUnmount } from "@/shared/lib/hooks/use-on-element-unmount";

export const EditContextPage = () => {
	const { type, id } = useParams<{ type: string; id: string }>();
	const [open, setOpen] = useState(true);
	const { navigateToContextsPage } = useContextsNavigate();
	const has = useHasPermission();

	const isReadOnly = !has({ permission: PermissionsEnum.WORKFLOW_WRITE });

	const { ref: unmountRef } = useOnElementUnmount({
		callback: () => {
			navigateToContextsPage();
		},
		condition: !open,
	});

	if (!type || !id) {
		return null;
	}

	return (
		<ContextDrawer
			ref={unmountRef}
			open={open}
			onOpenChange={setOpen}
			type={type}
			id={id}
			readOnly={isReadOnly}
		/>
	);
};
