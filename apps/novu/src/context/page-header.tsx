import { createContext, ReactNode, useContext, useEffect, useRef, useState } from 'react';

interface PageHeaderContextValue {
  startItems: ReactNode;
  setStartItems: (items: ReactNode) => void;
}

const PageHeaderContext = createContext<PageHeaderContextValue | null>(null);

export function PageHeaderProvider({ children }: { children: ReactNode }) {
  const [startItems, setStartItems] = useState<ReactNode>(null);

  return <PageHeaderContext.Provider value={{ startItems, setStartItems }}>{children}</PageHeaderContext.Provider>;
}

export function usePageHeaderContext() {
  const ctx = useContext(PageHeaderContext);
  if (!ctx) {
    throw new Error('usePageHeaderContext must be used within PageHeaderProvider');
  }

  return ctx;
}

/**
 * Sets the header start items (e.g. page title) for the current page.
 * Items are cleared when the component unmounts.
 *
 * Uses a ref to avoid infinite re-render loops from JSX references.
 */
export function useSetPageHeader(items: ReactNode) {
  const { setStartItems } = usePageHeaderContext();
  const itemsRef = useRef(items);
  itemsRef.current = items;

  // Set on mount, clear on unmount
  useEffect(() => {
    setStartItems(itemsRef.current);

    return () => {
      setStartItems(null);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setStartItems]);
}
