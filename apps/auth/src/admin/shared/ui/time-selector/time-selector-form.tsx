import { useController } from "react-hook-form";
import { TimeSelector, TimeSelectorProps } from "./time-selector";

type TimeSelectorFormProps = TimeSelectorProps & {
    name: string;
};

export const TimeSelectorForm = (props: TimeSelectorFormProps) => {
    const { field } = useController(props);

    return <TimeSelector {...props} {...field} />;
};
