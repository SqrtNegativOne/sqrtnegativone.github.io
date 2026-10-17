type FilterValue = string | number | boolean | (string | number | boolean)[];

/** Case-insensitive normalisation so tags/statuses/types match regardless of casing. */
function norm(value: unknown): string {
  return String(value).trim().toLowerCase();
}

/** An item value may be a scalar or an array (e.g. `tags: string[]`). */
function itemValues(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [value];
}

export function applyFilters<T extends object>(
  items: T[],
  filters: { property: string; operator: string; value: FilterValue }[],
  searchQuery: string
): T[] {
  return items.filter((item) => {
    const record = item as Record<string, unknown>;

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const textFields = ['title', 'tagline', 'author', 'publisher', 'id']
        .map((k) => record[k])
        .filter((v): v is string => typeof v === 'string');
      const tagMatch =
        Array.isArray(record.tags) &&
        record.tags.some((t) => String(t).toLowerCase().includes(q));
      const fieldMatch = textFields.some((v) => v.toLowerCase().includes(q));
      if (!fieldMatch && !tagMatch) return false;
    }

    for (const f of filters) {
      const val = record[f.property];

      // Numeric comparison operators only make sense on scalar values.
      if (f.operator === '>' || f.operator === '<') {
        const numVal = Number(val);
        const numTarget = Number(f.value);
        if (f.operator === '>' && !(numVal > numTarget)) return false;
        if (f.operator === '<' && !(numVal < numTarget)) return false;
        continue;
      }

      const targets = Array.isArray(f.value) ? f.value : [f.value];
      // An empty multi-select is inactive and matches everything.
      if (targets.length === 0) continue;

      const matched = targets.some((target) =>
        itemValues(val).some((v) => norm(v) === norm(target))
      );

      if (f.operator === 'is' && !matched) return false;
      if (f.operator === 'is_not' && matched) return false;
    }
    return true;
  });
}

export function applySorts<T extends object>(
  items: T[],
  sorts: { property: string; direction: 'asc' | 'desc' }[]
): T[] {
  if (sorts.length === 0) return items; // no sorts applied

  return [...items].sort((a, b) => {
    for (const s of sorts) {
      const valA = (a as Record<string, unknown>)[s.property];
      const valB = (b as Record<string, unknown>)[s.property];

      // Handle undefined/nulls
      const isNullA = valA === undefined || valA === null;
      const isNullB = valB === undefined || valB === null;
      if (isNullA && isNullB) continue;
      if (isNullA) return 1;
      if (isNullB) return -1;

      let cmp = 0;
      if (typeof valA === 'string' && typeof valB === 'string') {
        cmp = valA.localeCompare(valB);
      } else if (typeof valA === 'number' && typeof valB === 'number') {
        cmp = valA - valB;
      } else {
        const numA = Number(valA);
        const numB = Number(valB);
        if (numA < numB) cmp = -1;
        if (numA > numB) cmp = 1;
      }

      if (cmp !== 0) {
        return s.direction === 'asc' ? cmp : -cmp;
      }
    }
    return 0; // Tie
  });
}
