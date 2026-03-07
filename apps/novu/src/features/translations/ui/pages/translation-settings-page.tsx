import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { TranslationSettingsDrawer } from "@/features/translations/ui/translation-settings-drawer";
import { useOnElementUnmount } from "@/shared/lib/hooks/use-on-element-unmount";

export function TranslationSettingsPage() {
	const [open, setOpen] = useState(true);
	const navigate = useNavigate();

	const { ref: unmountRef } = useOnElementUnmount({
		callback: () => {
			navigate(-1);
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
