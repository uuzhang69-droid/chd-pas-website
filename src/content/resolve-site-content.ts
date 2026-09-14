import { copy, type CopyId } from "./copy";

const COPY_PREFIX = "@@COPY:";

function isCopyRef(value: unknown): value is string {
  return typeof value === "string" && value.startsWith(COPY_PREFIX);
}

export function resolveSiteContent<T>(structure: T, strings: Record<string, string> = copy): T {
  return resolveValue(structure, strings) as T;
}

function resolveValue(value: unknown, strings: Record<string, string>): unknown {
  if (isCopyRef(value)) {
    const id = value.slice(COPY_PREFIX.length);
    const text = strings[id];
    if (text === undefined) {
      console.warn(`Missing copy string for id: ${id}`);
      return `[MISSING: ${id}]`;
    }
    return text;
  }

  if (Array.isArray(value)) {
    return value.map((item) => resolveValue(item, strings));
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, child]) => [key, resolveValue(child, strings)]),
    );
  }

  return value;
}

/** Read a single copy string by id — for components that need direct access. */
export function getCopy(id: CopyId): string {
  return copy[id];
}
