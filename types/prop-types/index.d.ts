declare module 'prop-types' {
  type ValidatorFn = (...args: unknown[]) => unknown;
  interface PropTypesExports {
    [key: string]: ValidatorFn;
  }

  const PropTypes: PropTypesExports;
  export default PropTypes;
  export type Validator = ValidatorFn;
}

export {};
