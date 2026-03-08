import { FileUploadForm, type FileUploadFormProps } from "./file-upload-form";

type JsonFileUploadProps = Omit<
    FileUploadFormProps,
    "onChange" | "language" | "extension"
> & {
    onChange: (obj: object) => void;
};

export const JsonFileUpload = ({ onChange, ...props }: JsonFileUploadProps) => {
    const handleChange = (value: string) => {
        try {
            onChange(JSON.parse(value));
        } catch {
            onChange({});
        }
    };

    return (
        <FileUploadForm
            {...props}
            language="json"
            extension=".json"
            onChange={handleChange}
        />
    );
};
