import { Button } from "@merge/ui/components/button";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

export const NotFound = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();

    return (
        <div className="flex min-h-screen flex-col">
            <div className="flex items-center justify-center gap-6 px-4 pt-6">
                <img src="/merge-black-text.svg" alt="Merge" className="h-8 w-auto dark:hidden" />
                <img src="/merge-white-text.svg" alt="Merge" className="hidden h-8 w-auto dark:block" />
            </div>
            <div className="absolute top-1/2 left-1/2 mb-16 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center text-center">
                <span className="bg-gradient-to-b from-foreground to-transparent bg-clip-text text-[10rem] font-extrabold leading-none text-transparent">
                404
                </span>
                <h2 className="font-heading my-2 text-2xl font-bold">{t("notFoundTitle")}</h2>
                <p className="text-muted-foreground">{t("notFoundDescription")}</p>
                <div className="mt-8 flex justify-center gap-2">
                    <Button onClick={() => navigate(-1)} variant="default" size="lg">
                        {t("notFoundGoBack")}
                    </Button>
                </div>
            </div>
        </div>
    );
};
