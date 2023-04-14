// Narrowing value of type unknown with typeof value === "object" &&
// value !== null will yield object type. But Typescript is not glad to
// work with the object type for instance as function parameter.
// So this function narrows to Record<string, unknown> instead.
export function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

// Narrowing value of type unknown with Array.isArray(value)
// will yield any[] type. But most of the time we prefer the
// unknown[] type.
export function isArray(value: unknown): value is unknown[] {
  return Array.isArray(value);
}
