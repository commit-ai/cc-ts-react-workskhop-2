declare namespace React {
  type ReactNode =
    | ReactElement
    | string
    | number
    | boolean
    | null
    | undefined
    | ReactNode[];

  interface ReactElement<P = unknown> {
    type: string | ComponentType<P>;
    props: P;
    key: string | null;
  }

  type ComponentType<P = Record<string, unknown>> =
    | FC<P>
    | ComponentClass<P>;

  type FC<P = Record<string, unknown>> = (props: P) => ReactElement | null;

  interface ComponentClass<P = Record<string, unknown>> {
    new (props: P): Component<P>;
  }

  class Component<P = Record<string, unknown>, S = Record<string, unknown>> {
    constructor(props: P);
    props: Readonly<P>;
    state: Readonly<S>;
    setState(state: Partial<S>): void;
    render(): ReactNode;
  }

  function createElement(
    type: string | ComponentType,
    props?: Record<string, unknown> | null,
    ...children: ReactNode[]
  ): ReactElement;

  function useState<T>(initialState: T | (() => T)): [T, (value: T | ((prev: T) => T)) => void];
  function useEffect(effect: () => void | (() => void), deps?: unknown[]): void;
  function useCallback<T extends (...args: unknown[]) => unknown>(callback: T, deps: unknown[]): T;
  function useMemo<T>(factory: () => T, deps: unknown[]): T;
  function useRef<T>(initialValue: T): { current: T };
  function useRef<T = undefined>(): { current: T | undefined };
  function useContext<T>(context: Context<T>): T;

  interface Context<T> {
    Provider: ComponentType<{ value: T; children?: ReactNode }>;
    Consumer: ComponentType<{ children: (value: T) => ReactNode }>;
  }

  function createContext<T>(defaultValue: T): Context<T>;

  const StrictMode: ComponentType<{ children?: ReactNode }>;

  namespace JSX {
    interface Element extends ReactElement {}
    interface IntrinsicElements {
      [elemName: string]: Record<string, unknown>;
    }
    interface ElementChildrenAttribute {
      children: Record<string, unknown>;
    }
  }
}

export = React;
export as namespace React;
