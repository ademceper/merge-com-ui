import { useTranslation } from "react-i18next";
import { Badge } from "@merge/ui/components/badge";

type MoreLabelProps = {
    array: unknown[] | undefined;
};

export const MoreLabel = ({ array }: MoreLabelProps) => {
    const { t } = useTranslation();

    if (!array || array.length <= 1) {
        return null;
    }
    return <Badge variant="secondary">{t("more", { count: array.length - 1 })}</Badge>;
};
