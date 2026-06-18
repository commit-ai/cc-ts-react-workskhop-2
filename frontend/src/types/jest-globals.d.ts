import type { Global } from '@jest/types';
import type importedExpect from 'expect';
import type { TestingLibraryMatchers } from '@testing-library/jest-dom/types/matchers';

declare module 'expect/build/types' {
  interface Matchers<R, T = unknown>
    extends TestingLibraryMatchers<ReturnType<typeof importedExpect.stringContaining>, R> {}
}

declare global {
  const test: Global.GlobalAdditions['test'];
  const it: Global.GlobalAdditions['it'];
  const describe: Global.GlobalAdditions['describe'];
  const beforeAll: Global.GlobalAdditions['beforeAll'];
  const beforeEach: Global.GlobalAdditions['beforeEach'];
  const afterEach: Global.GlobalAdditions['afterEach'];
  const afterAll: Global.GlobalAdditions['afterAll'];
  const expect: typeof importedExpect;
}
