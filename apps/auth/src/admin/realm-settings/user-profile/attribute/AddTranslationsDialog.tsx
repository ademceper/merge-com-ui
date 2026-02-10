import { useFetch } from "../../../../shared/keycloak-ui-shared";
import { MagnifyingGlass } from "@phosphor-icons/react";
import {
    Empty,
    EmptyContent,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle
} from "@merge/ui/components/empty";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from "@merge/ui/components/dialog";
import { Badge } from "@merge/ui/components/badge";
import { Button } from "@merge/ui/components/button";
import { Input } from "@merge/ui/components/input";
import { Label } from "@merge/ui/components/label";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@merge/ui/components/table";
import { TablePagination } from "@merge/ui/components/pagination";
import { useState } from "react";
import { useFormContext } from "react-hook-form";
import { Trans, useTranslation } from "react-i18next";
import { useAdminClient } from "../../../admin-client";
import { useRealm } from "../../../context/realm-context/RealmContext";
import { useWhoAmI } from "../../../context/whoami/WhoAmI";
import { beerify, localeToDisplayName } from "../../../util";
import useLocale from "../../../utils/useLocale";
import { Translation, TranslationForm } from "./TranslatableField";

type AddTranslationsDialogProps = {
    orgKey: string;
    translationKey: string;
    fieldName: string;
    toggleDialog: () => void;
    predefinedAttributes?: string[];
};

export const AddTranslationsDialog = ({
    orgKey,
    translationKey,
    fieldName,
    toggleDialog,
    predefinedAttributes
}: AddTranslationsDialogProps) => {
    const { adminClient } = useAdminClient();
    const { t } = useTranslation();
    const { realm: realmName, realmRepresentation: realm } = useRealm();
    const combinedLocales = useLocale();
    const { whoAmI } = useWhoAmI();
    const [max, setMax] = useState(10);
    const [first, setFirst] = useState(0);
    const [filter, setFilter] = useState("");
    const [translations, setTranslations] = useState<TranslationForm[]>([]);
    const prefix = `translation.${beerify(translationKey)}`;

    const {
        register,
        setValue,
        getValues,
        formState: { isValid }
    } = useFormContext();

    const setupForm = (translation: Translation) => {
        translation[translationKey].forEach((translation, rowIndex) => {
            const valueKey = `${prefix}.${rowIndex}.value`;
            setValue(`${prefix}.${rowIndex}.locale`, translation.locale || "");
            setValue(
                valueKey,
                getValues(valueKey) ||
                    translation.value ||
                    (t(orgKey) !== orgKey ? t(orgKey) : "")
            );
        });
    };

    useFetch(
        async () => {
            const selectedLocales = combinedLocales
                .filter(l =>
                    localeToDisplayName(l, whoAmI.locale)
                        ?.toLocaleLowerCase(realm?.defaultLocale)
                        ?.includes(filter.toLocaleLowerCase(realm?.defaultLocale))
                )
                .slice(first, first + max + 1);

            const results = await Promise.all(
                selectedLocales.map(selectedLocale =>
                    adminClient.realms.getRealmLocalizationTexts({
                        realm: realmName,
                        selectedLocale
                    })
                )
            );

            return results.map((result, index) => ({
                locale: selectedLocales[index],
                value: result[translationKey]
            }));
        },
        fetchedData => {
            setTranslations(fetchedData);
            setupForm({ [translationKey]: fetchedData });
        },
        [combinedLocales, first, max, filter]
    );

    return (
        <Dialog open onOpenChange={open => !open && toggleDialog()}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>{t("addTranslationsModalTitle")}</DialogTitle>
                </DialogHeader>
                <div className="flex flex-col gap-4">
                    <Trans
                        i18nKey="addTranslationsModalTitle"
                        values={{ fieldName: t(fieldName) }}
                    >
                        You are able to translate the fieldName based on your locale or
                        <strong>location</strong>
                    </Trans>
                    <form id="add-translation" data-testid="addTranslationForm" className="flex flex-col gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="translationKey">{t("translationKey")}</Label>
                            <Input
                                id="translationKey"
                                data-testid="translation-key"
                                disabled
                                value={
                                    predefinedAttributes?.includes(orgKey)
                                        ? `\${${orgKey}}`
                                        : `\${${translationKey}}`
                                }
                                readOnly
                                className="bg-muted"
                            />
                        </div>
                        <div>
                            <p className="text-sm font-semibold">
                                {t("translationsTableHeading")}
                            </p>
                            <div className="flex flex-wrap items-center gap-2 mb-2">
                                <div className="flex flex-1 min-w-0 items-center gap-1 rounded-lg border border-input bg-transparent px-2">
                                    <MagnifyingGlass className="text-muted-foreground size-4 shrink-0" />
                                    <Input
                                        placeholder={t("searchForLanguage")}
                                        aria-label={t("search")}
                                        className="border-0 bg-transparent shadow-none focus-visible:ring-0 flex-1 min-w-0"
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter") {
                                                setFilter((e.target as HTMLInputElement).value);
                                                setFirst(0);
                                                setMax(10);
                                            }
                                        }}
                                    />
                                </div>
                                <TablePagination
                                    count={translations.length}
                                    first={first}
                                    max={max}
                                    onNextClick={setFirst}
                                    onPreviousClick={setFirst}
                                    onPerPageSelect={(_first, newMax) => {
                                        setMax(newMax);
                                        setFirst(0);
                                    }}
                                    t={t}
                                />
                            </div>
                            {translations.length === 0 && filter && (
                                <Empty className="py-8">
                                    <EmptyMedia><MagnifyingGlass className="size-12 text-muted-foreground" /></EmptyMedia>
                                    <EmptyHeader><EmptyTitle>{t("noSearchResults")}</EmptyTitle></EmptyHeader>
                                    <EmptyContent><EmptyDescription>{t("noLanguagesSearchResultsInstructions")}</EmptyDescription></EmptyContent>
                                </Empty>
                            )}
                            {translations.length !== 0 && (
                                    <Table
                                        aria-label={t("addTranslationsDialogRowsTable")}
                                        data-testid="add-translations-dialog-rows-table"
                                        className="text-sm"
                                    >
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead className="py-2">
                                                    {t(
                                                        "supportedLanguagesTableColumnName"
                                                    )}
                                                </TableHead>
                                                <TableHead className="py-2">
                                                    {t("translationTableColumnName")}
                                                </TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {translations
                                                .slice(0, max)
                                                .map((translation, index) => (
                                                    <TableRow key={index}>
                                                        <TableCell
                                                            data-label={t(
                                                                "supportedLanguage"
                                                            )}
                                                        >
                                                            {localeToDisplayName(
                                                                translation.locale,
                                                                whoAmI.locale
                                                            )}
                                                            {translation.locale ===
                                                                realm?.defaultLocale && (
                                                                <Badge variant="secondary" className="ml-1">
                                                                    {t("defaultLanguage")}
                                                                </Badge>
                                                            )}
                                                        </TableCell>
                                                        <TableCell>
                                                            <Input
                                                                id={`${prefix}.${index}.value`}
                                                                data-testid={`translation-value-${index}`}
                                                                {...register(
                                                                    `${prefix}.${index}.value`,
                                                                    {
                                                                        required: {
                                                                            value:
                                                                                translation.locale ===
                                                                                realm?.defaultLocale,
                                                                            message:
                                                                                t(
                                                                                    "required"
                                                                                )
                                                                        }
                                                                    }
                                                                )}
                                                            />
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                        </TableBody>
                                    </Table>
                                )}
                        </div>
                    </form>
                </div>
                <DialogFooter>
                    <Button
                        data-testid="cancelTranslationBtn"
                        variant="link"
                        onClick={() => {
                            setupForm({ [translationKey]: translations });
                            toggleDialog();
                        }}
                    >
                        {t("cancel")}
                    </Button>
                    <Button
                        data-testid="okTranslationBtn"
                        form="add-translation"
                        disabled={!isValid}
                        onClick={toggleDialog}
                    >
                        {t("addTranslationDialogOkBtn")}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
