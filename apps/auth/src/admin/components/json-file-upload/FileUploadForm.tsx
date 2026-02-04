import { Button } from "@merge/ui/components/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter
} from "@merge/ui/components/dialog";
import { Label } from "@merge/ui/components/label";
import { Input } from "@merge/ui/components/input";
/** Local type replacing PatternFly FileUploadProps; only used for Omit. */
type FileUploadProps = {
    id?: string;
    value?: string;
    filename?: string;
    onChange?: (value: string) => void;
    onClear?: () => void;
    isDisabled?: boolean;
    hideDefaultPreview?: boolean;
    allowEditingUploadedText?: boolean;
};
import {
    ChangeEvent,
    DragEvent as ReactDragEvent,
    MouseEvent as ReactMouseEvent,
    useState
} from "react";
import { useTranslation } from "react-i18next";
import CodeEditor from "../form/CodeEditor";

type FileUploadType = {
    value: string;
    filename: string;
    isLoading: boolean;
    modal: boolean;
};

export type FileUploadEvent =
    | ReactDragEvent<HTMLElement> // User dragged/dropped a file
    | ChangeEvent<HTMLTextAreaElement> // User typed in the TextArea
    | ReactMouseEvent<HTMLButtonElement, MouseEvent>; // User clicked Clear button

export type FileUploadFormProps = Omit<FileUploadProps, "onChange"> & {
    id: string;
    extension: string;
    onChange: (value: string) => void;
    helpText?: string;
    unWrap?: boolean;
    language?: string;
    previewMaxLength?: number;
    validated?: string;
};

export const FileUploadForm = ({
    id,
    onChange,
    helpText = "helpFileUpload",
    unWrap = false,
    previewMaxLength = 102400, // 100KB
    language,
    extension,
    ...rest
}: FileUploadFormProps) => {
    const { t } = useTranslation();
    const defaultUpload: FileUploadType = {
        value: "",
        filename: "",
        isLoading: false,
        modal: false
    };
    const [fileUpload, setFileUpload] = useState<FileUploadType>(defaultUpload);
    const removeDialog = () => setFileUpload({ ...fileUpload, modal: false });

    const handleTextOrDataChange = (value: string) => {
        setFileUpload({ ...fileUpload, value });
        onChange(value);
    };

    const handleClear = () => {
        setFileUpload({ ...fileUpload, modal: true });
    };

    return (
        <>
            {fileUpload.modal && (
                <Dialog open onOpenChange={(open) => { if (!open) removeDialog(); }}>
                    <DialogContent className="max-w-md">
                        <DialogHeader>
                            <DialogTitle>{t("clearFile")}</DialogTitle>
                        </DialogHeader>
                        <p>{t("clearFileExplain")}</p>
                        <DialogFooter>
                            <Button
                                key="confirm"
                                data-testid="clear-button"
                                onClick={() => {
                                    setFileUpload(defaultUpload);
                                    onChange("");
                                }}
                            >
                                {t("clear")}
                            </Button>
                            <Button
                                data-testid="cancel"
                                key="cancel"
                                variant="ghost"
                                onClick={removeDialog}
                            >
                                {t("cancel")}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            )}
            {unWrap && (
                <div className="space-y-2">
                    <Input
                        id={id}
                        type="file"
                        accept={extension}
                        onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                                setFileUpload({ ...fileUpload, filename: file.name, isLoading: true });
                                const reader = new FileReader();
                                reader.onload = () => {
                                    handleTextOrDataChange(String(reader.result ?? ""));
                                    setFileUpload(prev => ({ ...prev, isLoading: false }));
                                };
                                reader.readAsText(file);
                            }
                        }}
                    />
                    <Button type="button" variant="outline" size="sm" onClick={handleClear}>
                        {t("clear")}
                    </Button>
                </div>
            )}
            {!unWrap && (
                <div className="space-y-2">
                    <Label htmlFor={id + "-filename"}>{t("resourceFile")}</Label>
                    <Input
                        data-testid={id}
                        id={id}
                        type="file"
                        accept={extension}
                        className="mb-2"
                        onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                                setFileUpload({ ...fileUpload, filename: file.name, isLoading: true });
                                const reader = new FileReader();
                                reader.onload = () => {
                                    handleTextOrDataChange(String(reader.result ?? ""));
                                    setFileUpload(prev => ({ ...prev, isLoading: false }));
                                };
                                reader.readAsText(file);
                            }
                        }}
                    />
                    <Button type="button" variant="outline" size="sm" onClick={handleClear} className="mb-2">
                        {t("clear")}
                    </Button>
                    {!rest.hideDefaultPreview &&
                        (!fileUpload.value || fileUpload.value.length < previewMaxLength ? (
                            <CodeEditor
                                aria-label="File content"
                                value={fileUpload.value}
                                language={language}
                                onChange={value => handleTextOrDataChange(value)}
                                readOnly={!rest.allowEditingUploadedText}
                            />
                        ) : (
                            <CodeEditor
                                aria-label="File content"
                                value={t("fileUploadPreviewDisabled")}
                                readOnly
                            />
                        ))}
                    <p className="text-sm text-muted-foreground">{t(helpText)}</p>
                </div>
            )}
        </>
    );
};
