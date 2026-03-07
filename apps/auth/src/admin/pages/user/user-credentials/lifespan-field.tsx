import { useTranslation } from "react-i18next";
import { TimeSelectorControl } from "../../../shared/ui/time-selector/time-selector-control";

export const LifespanField = () => {
    const { t } = useTranslation();

    return (
        <TimeSelectorControl
            name="lifespan"
            label={t("lifespan")}
            labelIcon={t("lifespanHelp")}
            units={["minute", "hour", "day"]}
            controller={{}}
        />
    );
};
