import * as React from 'react';

export declare function jsx(
  type: string | React.ComponentType,
  props: Record<string, unknown>,
  key?: string | number | null
): React.ReactElement;

export declare function jsxs(
  type: string | React.ComponentType,
  props: Record<string, unknown>,
  key?: string | number | null
): React.ReactElement;

export declare const Fragment: unique symbol;

export namespace JSX {
  type Element = React.ReactElement;
  interface ElementClass {
    render(): React.ReactNode;
  }
  interface ElementChildrenAttribute {
    children: Record<string, unknown>;
  }
  interface IntrinsicAttributes {
    key?: string | number | null;
  }
  interface IntrinsicElements {
    [elemName: string]: Record<string, unknown>;
  }
}
