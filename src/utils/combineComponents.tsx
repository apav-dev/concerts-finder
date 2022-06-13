import { ComponentProps, FC } from 'react';

// From: https://medium.com/front-end-weekly/how-to-combine-context-providers-for-cleaner-react-code-9ed24f20225e
export const combineComponents = (...components: FC[]): FC => {
  return components.reduce(
    (AccumulatedComponents, CurrentComponent) => {
      // eslint-disable-next-line react/display-name
      return ({ children }: ComponentProps<FC>): JSX.Element => {
        return (
          <AccumulatedComponents>
            <CurrentComponent>{children}</CurrentComponent>
          </AccumulatedComponents>
        );
      };
    },
    ({ children }) => <>{children}</>
  );
};
