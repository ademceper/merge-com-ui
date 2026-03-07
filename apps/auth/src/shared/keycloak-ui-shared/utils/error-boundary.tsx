import {
    Component,
    type ComponentType,
    type FunctionComponent,
    type GetDerivedStateFromError,
    type ReactNode
} from "react";
import { createNamedContext } from "./createNamedContext";
import { useRequiredContext } from "./useRequiredContext";

interface ErrorBoundaryContextValue {
    error?: Error;
    showBoundary: (error?: Error) => void;
}

const ErrorBoundaryContext = createNamedContext<ErrorBoundaryContextValue | undefined>(
    "ErrorBoundaryContext",
    undefined
);

export const useErrorBoundary = () => useRequiredContext(ErrorBoundaryContext);

interface ErrorBoundaryProviderProps {
    children: ReactNode;
}

interface ErrorBoundaryProviderState {
    error?: Error;
}

export class ErrorBoundaryProvider extends Component<
    ErrorBoundaryProviderProps,
    ErrorBoundaryProviderState
> {
    state: ErrorBoundaryProviderState = {};

    static getDerivedStateFromError: GetDerivedStateFromError<
        ErrorBoundaryProviderProps,
        ErrorBoundaryProviderState
    > = error => {
        return { error };
    };

    showBoundary = (error?: Error) => {
        this.setState({ error });
    };

    render() {
        return (
            <ErrorBoundaryContext.Provider
                value={{ error: this.state.error, showBoundary: this.showBoundary }}
            >
                {this.props.children}
            </ErrorBoundaryContext.Provider>
        );
    }
}

export interface FallbackProps {
    error: Error;
}

interface ErrorBoundaryFallbackProps {
    fallback: ComponentType<FallbackProps>;
    children: ReactNode;
}

export const ErrorBoundaryFallback: FunctionComponent<ErrorBoundaryFallbackProps> = ({
    children,
    fallback: FallbackComponent
}) => {
    const { error } = useErrorBoundary();

    if (error) {
        return <FallbackComponent error={error} />;
    }

    return children;
};
