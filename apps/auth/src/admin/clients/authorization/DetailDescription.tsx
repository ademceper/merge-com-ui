import { useTranslation } from "react-i18next";
import { Link, Path } from "react-router-dom";

type DetailDescriptionProps<T> = {
    name: string;
    array?: string[] | T[];
    convert?: (obj: T) => string;
};

export function DetailDescription<T>(props: DetailDescriptionProps<T>) {
    return <DetailDescriptionLink {...props} />;
}

type DetailDescriptionLinkProps<T> = DetailDescriptionProps<T> & {
    link?: (element: T) => Partial<Path>;
};

export function DetailDescriptionLink<T>({
    name,
    array,
    convert,
    link
}: DetailDescriptionLinkProps<T>) {
    const { t } = useTranslation();
    return (
        <>
            <dt className="font-medium text-muted-foreground">{t(name)}</dt>
            <dd>
                {array?.map(element => {
                    const value =
                        typeof element === "string" ? element : convert!(element);
                    return link ? (
                        <Link
                            key={value}
                            to={link(element as T)}
                            className="pr-2"
                        >
                            {value}
                        </Link>
                    ) : (
                        <span key={value} className="pr-2">
                            {value}
                        </span>
                    );
                })}
                {array?.length === 0 && <i>{t("none")}</i>}
            </dd>
        </>
    );
}
