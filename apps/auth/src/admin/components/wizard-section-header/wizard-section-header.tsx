export type WizardSectionHeaderProps = {
    title: string;
    description?: string;
    showDescription?: boolean;
};

export const WizardSectionHeader = ({
    title,
    description,
    showDescription = false
}: WizardSectionHeaderProps) => {
    return (
        <>
            <h2
                className={
                    showDescription
                        ? "kc-wizard-section-header__title--has-description text-2xl font-semibold"
                        : "kc-wizard-section-header__title text-2xl font-semibold"
                }
            >
                {title}
            </h2>
            {showDescription && (
                <p className="kc-wizard-section-header__description text-muted-foreground mt-1">
                    {description}
                </p>
            )}
        </>
    );
};
