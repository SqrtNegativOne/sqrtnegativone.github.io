export interface FilterRule {
  property: string;
  operator: string;
  value: unknown;
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

export interface HighlightPart {
  text: string;
  match: boolean;
}

function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function highlightMatches(text: string, query: string): HighlightPart[] {
  if (!text || !query?.trim()) {
    return [{ text: text || '', match: false }];
  }

  const tokens = query.trim().split(/\s+/).filter(Boolean).map(escapeRegExp);
  if (tokens.length === 0) {
    return [{ text, match: false }];
  }

  const pattern = new RegExp(`(${tokens.join('|')})`, 'gi');
  const parts = text.split(pattern);

  return parts.filter(Boolean).map(part => ({
    text: part,
    match: tokens.some(t => new RegExp(`^${t}$`, 'i').test(part))
  }));
}

function fieldContainsToken(val: unknown, token: string): boolean {
  if (val === undefined || val === null) return false;
  if (typeof val === 'string') return val.toLowerCase().includes(token);
  if (typeof val === 'number') return String(val).includes(token);
  if (typeof val === 'boolean') {
    return (token === 'true' && val === true) || (token === 'false' && val === false);
  }
  if (Array.isArray(val)) {
    return val.some(v => fieldContainsToken(v, token));
  }
  return false;
}

function calculateRelevanceScore<T>(
  item: T,
  query: string,
  tokens: string[],
  searchFields: (keyof T)[]
): number {
  let score = 0;
  const itemRecord = item as Record<string, unknown>;

  for (let i = 0; i < searchFields.length; i++) {
    const field = searchFields[i] as string;
    const isPrimary = i === 0;
    const rawVal = itemRecord[field];
    if (rawVal === undefined || rawVal === null) continue;

    const valStr = Array.isArray(rawVal)
      ? rawVal.join(' ').toLowerCase()
      : String(rawVal).toLowerCase();

    // Exact match
    if (valStr === query) {
      score += isPrimary ? 120 : 80;
    } else if (valStr.startsWith(query)) {
      score += isPrimary ? 60 : 40;
    } else if (valStr.includes(query)) {
      score += isPrimary ? 30 : 20;
    }

    // Token-level scoring
    for (const token of tokens) {
      if (valStr.includes(token)) {
        const wordRegex = new RegExp(`\\b${escapeRegExp(token)}`, 'i');
        if (wordRegex.test(valStr)) {
          score += isPrimary ? 15 : 8;
        } else {
          score += isPrimary ? 8 : 4;
        }
      }
    }
  }

  return score;
}

function isDateLike(v: unknown): v is string {
  return typeof v === 'string' && /^\d{4}-\d{2}-\d{2}/.test(v.trim());
}

function evaluateFilter(val: unknown, operator: string, targetVal: unknown): boolean {
  // If value is an array (e.g. tags)
  if (Array.isArray(val)) {
    const targetStr = String(targetVal).trim().toLowerCase();
    const hasMatch = val.some(elem => String(elem).trim().toLowerCase() === targetStr);
    if (operator === 'is') return hasMatch;
    if (operator === 'is_not') return !hasMatch;
    return true;
  }

  // Handle null/undefined
  if (val === undefined || val === null) {
    if (operator === 'is') return targetVal === '' || targetVal === null || targetVal === undefined;
    if (operator === 'is_not') return targetVal !== '' && targetVal !== null && targetVal !== undefined;
    return false;
  }

  // Handle booleans
  if (typeof val === 'boolean') {
    const targetBool = targetVal === true || targetVal === 'true' || targetVal === 1;
    if (operator === 'is') return val === targetBool;
    if (operator === 'is_not') return val !== targetBool;
    return false;
  }

  // Handle dates (e.g. YYYY-MM-DD)
  if (isDateLike(val) && isDateLike(targetVal)) {
    const timeA = new Date(val).getTime();
    const timeB = new Date(targetVal).getTime();
    if (!isNaN(timeA) && !isNaN(timeB)) {
      if (operator === 'is') return timeA === timeB;
      if (operator === 'is_not') return timeA !== timeB;
      if (operator === '>') return timeA > timeB;
      if (operator === '<') return timeA < timeB;
    }
  }

  // Handle numbers
  const numA = Number(val);
  const numB = Number(targetVal);
  const bothNumbers = !isNaN(numA) && !isNaN(numB) && typeof val !== 'boolean' && targetVal !== '';
  if (bothNumbers && (operator === '>' || operator === '<')) {
    if (operator === '>') return numA > numB;
    if (operator === '<') return numA < numB;
  }

  // String / General comparison
  const strA = String(val).trim().toLowerCase();
  const strB = String(targetVal).trim().toLowerCase();

  if (operator === 'is') return strA === strB;
  if (operator === 'is_not') return strA !== strB;
  if (operator === '>') return bothNumbers ? numA > numB : strA > strB;
  if (operator === '<') return bothNumbers ? numA < numB : strA < strB;

  return true;
}

function compareValues(valA: unknown, valB: unknown): number {
  const normA = valA === undefined || valA === null ? '' : valA;
  const normB = valB === undefined || valB === null ? '' : valB;

  // Dates
  if (typeof normA === 'string' && typeof normB === 'string') {
    if (isDateLike(normA) && isDateLike(normB)) {
      const tA = new Date(normA).getTime();
      const tB = new Date(normB).getTime();
      if (!isNaN(tA) && !isNaN(tB)) {
        return tA - tB;
      }
    }
    return normA.localeCompare(normB, undefined, { numeric: true, sensitivity: 'base' });
  }

  if (typeof normA === 'number' && typeof normB === 'number') {
    return normA - normB;
  }

  if (normA < normB) return -1;
  if (normA > normB) return 1;
  return 0;
}

export function filterAndSortItems<T>({
  items,
  searchQuery = '',
  searchFields,
  filters = [],
  sorts = []
}: SearchFilterSortConfig<T>): T[] {
  let result = items;
  const q = searchQuery.trim().toLowerCase();
  const tokens = q ? q.split(/\s+/).filter(Boolean) : [];

  // 1. Text Search (Multi-token AND match across fields)
  if (tokens.length > 0) {
    result = result.filter(item => {
      const itemRecord = item as Record<string, unknown>;
      const fields = searchFields || (Object.keys(itemRecord) as (keyof T)[]);
      return tokens.every(token =>
        fields.some(field => fieldContainsToken(itemRecord[field as string], token))
      );
    });
  }

  // 2. Structured Filters
  if (filters.length > 0) {
    result = result.filter(item => {
      const itemRecord = item as Record<string, unknown>;
      for (const f of filters) {
        if (!evaluateFilter(itemRecord[f.property], f.operator, f.value)) {
          return false;
        }
      }
      return true;
    });
  }

  // 3. Sorts or Relevance Ranking
  if (sorts.length > 0) {
    result = [...result].sort((a, b) => {
      const recA = a as Record<string, unknown>;
      const recB = b as Record<string, unknown>;
      for (const s of sorts) {
        const cmp = compareValues(recA[s.property], recB[s.property]);
        if (cmp !== 0) {
          return s.direction === 'asc' ? cmp : -cmp;
        }
      }
      return 0;
    });
  } else if (tokens.length > 0) {
    // If no explicit user sort is chosen, rank by search relevance score!
    const fields =
      searchFields ||
      (items.length > 0 ? (Object.keys(items[0] as Record<string, unknown>) as (keyof T)[]) : []);
    if (fields.length > 0) {
      const scoreMap = new Map<T, number>();
      for (const item of result) {
        scoreMap.set(item, calculateRelevanceScore(item, q, tokens, fields));
      }
      result = [...result].sort((a, b) => (scoreMap.get(b) || 0) - (scoreMap.get(a) || 0));
    }
  }

  return result;
}
