import { Button } from "@merge-rd/ui/components/button";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from "@merge-rd/ui/components/dialog";
import { Input } from "@merge-rd/ui/components/input";
import { Label } from "@merge-rd/ui/components/label";

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

import { useTranslation } from "@merge-rd/i18n";
import {
    type ChangeEvent,
    type DragEvent as ReactDragEvent,
    type MouseEvent as ReactMouseEvent,
    useState
} from "react";
import CodeEditor from "../form/code-editor";

type FileUploadType = {
    value: string;
    filename: string;
    isLoading: boolean;
    modal: boolean;
};

type FileUploadEvent =
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
                <Dialog
                    open
                    onOpenChange={open => {
                        if (!open) removeDialog();
                    }}
                >
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
                        onChange={e => {
                            const file = e.target.files?.[0];
                            if (file) {
                                setFileUpload({
                                    ...fileUpload,
                                    filename: file.name,
                                    isLoading: true
                                });
                                const reader = new FileReader();
                                reader.onload = () => {
                                    handleTextOrDataChange(String(reader.result ?? ""));
                                    setFileUpload(prev => ({
                                        ...prev,
                                        isLoading: false
                                    }));
                                };
                                reader.readAsText(file);
                            }
                        }}
                    />
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleClear}
                    >
                        {t("clear")}
                    </Button>
                </div>
            )}
            {!unWrap && (
                <div className="space-y-2">
                    <Label htmlFor={`${id}-filename`}>{t("resourceFile")}</Label>
                    <Input
                        data-testid={id}
                        id={id}
                        type="file"
                        accept={extension}
                        className="mb-2"
                        onChange={e => {
                            const file = e.target.files?.[0];
                            if (file) {
                                setFileUpload({
                                    ...fileUpload,
                                    filename: file.name,
                                    isLoading: true
                                });
                                const reader = new FileReader();
                                reader.onload = () => {
                                    handleTextOrDataChange(String(reader.result ?? ""));
                                    setFileUpload(prev => ({
                                        ...prev,
                                        isLoading: false
                                    }));
                                };
                                reader.readAsText(file);
                            }
                        }}
                    />
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleClear}
                        className="mb-2"
                    >
                        {t("clear")}
                    </Button>
                    {!rest.hideDefaultPreview &&
                        (!fileUpload.value ||
                        fileUpload.value.length < previewMaxLength ? (
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
