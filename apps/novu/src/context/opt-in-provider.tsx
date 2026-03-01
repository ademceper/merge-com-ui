import { PropsWithChildren, useEffect } from 'react';

export const OptInProvider = (props: PropsWithChildren) => {
  const { children } = props;

  useEffect(() => {
    localStorage.setItem('mantine-theme', 'light');
  }, []);

  return <>{children}</>;
};
