import { isObject } from "./typescript-narrowing.ts";
export function propAt(property: string, o: unknown): unknown {
  return isObject(o) && property in o ? o[property] : undefined;
}

export function valueAtPath(p: string[], o: unknown): unknown {
  for (const current of p) {
    if ((o = propAt(current, o)) === undefined) return undefined;
  }
  return o;
}
