import { useTranslation } from "@merge-rd/i18n";
import type { CSSProperties } from "react";

import { TimeSelectorControl } from "../../../shared/ui/time-selector/time-selector-control";

export const Time = ({
    name,
    style,
    min
}: {
    name: string;
    style?: CSSProperties;
    min?: number;
}) => {
    const { t } = useTranslation();
    return (
        <TimeSelectorControl
            name={name}
            style={style}
            label={t(name)}
            labelIcon={t(`${name}Help`)}
            min={min}
            controller={{
                defaultValue: "",
                rules: { required: t("required"), min: min }
            }}
        />
    );
};
