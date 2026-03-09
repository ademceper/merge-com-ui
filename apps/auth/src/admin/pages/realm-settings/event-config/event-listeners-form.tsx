import { useTranslation } from "@merge-rd/i18n";
import { FormProvider, type UseFormReturn } from "react-hook-form";
import { KeycloakSpinner, MultiSelectField } from "@/shared/keycloak-ui-shared";
import { useAvailableEventListeners } from "../hooks/use-available-event-listeners";

type EventListenersFormProps = {
    form: UseFormReturn;
    reset: () => void;
};

export const EventListenersForm = ({ form, reset: _reset }: EventListenersFormProps) => {
    const { t } = useTranslation();

    const { data: eventListeners } = useAvailableEventListeners();

    if (!eventListeners) {
        return <KeycloakSpinner />;
    }

    return (
        <FormProvider {...form}>
            <MultiSelectField
                name="eventsListeners"
                label={t("eventListeners")}
                labelIcon={t("eventListenersHelpTextHelp")}
                defaultValue={[]}
                className="kc_eventListeners_select"
                options={eventListeners.map(value => value.id)}
            />
        </FormProvider>
    );
};
