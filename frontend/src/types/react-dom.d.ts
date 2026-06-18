import * as React from 'react';

declare namespace ReactDOM {
  function render(element: React.ReactElement, container: Element | null): void;
  function unmountComponentAtNode(container: Element): boolean;

  namespace TestUtils {
    function act(callback: () => void | Promise<void>): Promise<void>;
    function act(callback: () => void): void;
  }
}

export = ReactDOM;
export as namespace ReactDOM;
