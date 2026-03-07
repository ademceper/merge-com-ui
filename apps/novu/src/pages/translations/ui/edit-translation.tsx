import { useEffect, useState } from "react";
import { useNavigate, useParams, useSearch } from "@tanstack/react-router";
import { useEnvironment } from "@/app/context/environment/hooks";
import { TranslationDrawer } from "@/pages/translations/ui/translation-drawer/translation-drawer";
import { useOnElementUnmount } from "@/shared/lib/hooks/use-on-element-unmount";
import type { LocalizationResourceEnum } from "@/shared/model/translations";
import { buildRoute, ROUTES } from "@/shared/lib/routes";

export const EditTranslationPage = () => {
	const { resourceType, resourceId, locale } = useParams({ strict: false });
	const [open, setOpen] = useState(true);
	const [currentLocale, setCurrentLocale] = useState(locale);
	const navigate = useNavigate();
	const search = useSearch({ strict: false });
	const { currentEnvironment } = useEnvironment();

	// Sync currentLocale with URL param when component mounts or URL changes
	useEffect(() => {
		setCurrentLocale(locale);
	}, [locale]);

	const navigateToTranslationsPage = () => {
		if (currentEnvironment?.slug) {
			const currentSearchParams = new URLSearchParams(search as Record<string, string>).toString();
			navigate({
				to: buildRoute(ROUTES.TRANSLATIONS, {
					environmentSlug: currentEnvironment.slug,
				}) + (currentSearchParams ? `?${currentSearchParams}` : ""),
			});
		}
	};

	const handleLocaleChange = (newLocale: string) => {
		setCurrentLocale(newLocale);

		if (currentEnvironment?.slug && resourceType && resourceId) {
			// Update URL without triggering navigation/re-render
			const newUrl = buildRoute(ROUTES.TRANSLATIONS_EDIT, {
				environmentSlug: currentEnvironment.slug,
				resourceType,
				resourceId,
				locale: newLocale,
			});
			window.history.replaceState(null, "", newUrl);
		}
	};

	const { ref: unmountRef } = useOnElementUnmount({
		callback: navigateToTranslationsPage,
		condition: !open,
	});

	if (!resourceType || !resourceId || !locale) {
		return null;
	}

	return (
		<TranslationDrawer
			ref={unmountRef}
			isOpen={open}
			onOpenChange={setOpen}
			resourceType={resourceType}
			resourceId={resourceId}
			initialLocale={currentLocale}
			onLocaleChange={handleLocaleChange}
		/>
	);
};
