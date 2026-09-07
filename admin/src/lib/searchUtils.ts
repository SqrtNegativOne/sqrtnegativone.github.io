export interface FilterRule {
  property: string;
  operator: string;
  value: any;
}

export interface SortRule {
  property: string;
  direction: 'asc' | 'desc';
}

export interface FilterProperty {
  value: string;
  label: string;
  type?: 'text' | 'select' | 'number';
  options?: { value: string; label: string }[];
}

export interface SearchFilterSortConfig<T> {
  items: T[];
  searchQuery?: string;
  searchFields?: (keyof T)[];
  filters?: FilterRule[];
  sorts?: SortRule[];
}

export function filterAndSortItems<T extends Record<string, any>>({
  items,
  searchQuery = '',
  searchFields,
  filters = [],
  sorts = []
}: SearchFilterSortConfig<T>): T[] {
  let result = items;

  // 1. Text Search
  const q = searchQuery.trim().toLowerCase();
  if (q) {
    result = result.filter(item => {
      const fields = searchFields || (Object.keys(item) as (keyof T)[]);
      return fields.some(field => {
        const val = item[field];
        if (typeof val === 'string') return val.toLowerCase().includes(q);
        if (typeof val === 'number') return String(val).includes(q);
        if (Array.isArray(val)) {
          return val.some((v: any) => typeof v === 'string' && v.toLowerCase().includes(q));
        }
        return false;
      });
    });
  }

  // 2. Structured Filters
  if (filters.length > 0) {
    result = result.filter(item => {
      for (const f of filters) {
        const val = item[f.property];
        if (Array.isArray(val)) {
          if (f.operator === 'is' && !val.includes(f.value)) return false;
          if (f.operator === 'is_not' && val.includes(f.value)) return false;
        } else {
          if (f.operator === 'is') {
            if (val != f.value) return false;
          } else if (f.operator === 'is_not') {
            if (val == f.value) return false;
          } else if (f.operator === '>') {
            if (Number(val) <= Number(f.value)) return false;
          } else if (f.operator === '<') {
            if (Number(val) >= Number(f.value)) return false;
          }
        }
      }
      return true;
    });
  }

  // 3. Sorts
  if (sorts.length > 0) {
    result = [...result].sort((a, b) => {
      for (const s of sorts) {
        let valA = a[s.property];
        let valB = b[s.property];

        if (valA === undefined || valA === null) valA = '';
        if (valB === undefined || valB === null) valB = '';

        let cmp = 0;
        if (typeof valA === 'string' && typeof valB === 'string') {
          cmp = valA.localeCompare(valB);
        } else if (typeof valA === 'number' && typeof valB === 'number') {
          cmp = valA - valB;
        } else {
          if (valA < valB) cmp = -1;
          if (valA > valB) cmp = 1;
        }

        if (cmp !== 0) {
          return s.direction === 'asc' ? cmp : -cmp;
        }
      }
      return 0;
    });
  }

  return result;
}
