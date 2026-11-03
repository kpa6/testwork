export type FormState<Values> = {
  values: Values;
  errors: Partial<Record<keyof Values | 'root', string>>;
};
