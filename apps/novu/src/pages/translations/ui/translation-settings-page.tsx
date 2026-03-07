import { useState } from "react";
import { TranslationSettingsDrawer } from "@/pages/translations/ui/translation-settings-drawer";
import { useOnElementUnmount } from "@/shared/lib/hooks/use-on-element-unmount";

export function TranslationSettingsPage() {
	const [open, setOpen] = useState(true);

	const { ref: unmountRef } = useOnElementUnmount({
		callback: () => {
			window.history.back();
		},
		condition: !open,
	});

	const handleOpenChange = (isOpen: boolean) => {
		setOpen(isOpen);
	};

	return (
		<TranslationSettingsDrawer
			ref={unmountRef}
			isOpen={open}
			onOpenChange={handleOpenChange}
		/>
	);
}
