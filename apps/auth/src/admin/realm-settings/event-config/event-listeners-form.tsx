import { FormProvider, UseFormReturn } from "react-hook-form";
import { useTranslation } from "react-i18next";
import {
    KeycloakSpinner,
    useFetch,
    MultiSelectField
} from "../../../shared/keycloak-ui-shared";
import { useState } from "react";
import { fetchAdminUI } from "../../context/auth/admin-ui-endpoint";
import { useAdminClient } from "../../admin-client";

type EventListenerRepresentation = {
    id: string;
};

type EventListenersFormProps = {
    form: UseFormReturn;
    reset: () => void;
};

export const EventListenersForm = ({ form, reset: _reset }: EventListenersFormProps) => {
    const { t } = useTranslation();

    const [eventListeners, setEventListeners] = useState<EventListenerRepresentation[]>();

    const { adminClient } = useAdminClient();

    useFetch(
        () =>
            fetchAdminUI<EventListenerRepresentation[]>(
                adminClient,
                "ui-ext/available-event-listeners"
            ),
        setEventListeners,
        []
    );

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
