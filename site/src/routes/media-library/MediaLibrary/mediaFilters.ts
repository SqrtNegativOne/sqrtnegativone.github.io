type FilterValue = string | number | boolean;

export function applyFilters<T extends object>(items: T[], filters: { property: string, operator: string, value: FilterValue }[], searchQuery: string): T[] {
  return items.filter(item => {
    const record = item as Record<string, unknown>;

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const titleMatch = typeof record.title === 'string' && record.title.toLowerCase().includes(q);
      const taglineMatch = typeof record.tagline === 'string' && record.tagline.toLowerCase().includes(q);
      const authorMatch = typeof record.author === 'string' && record.author.toLowerCase().includes(q);
      const publisherMatch = typeof record.publisher === 'string' && record.publisher.toLowerCase().includes(q);
      const idMatch = typeof record.id === 'string' && record.id.toLowerCase().includes(q);
      if (!titleMatch && !taglineMatch && !authorMatch && !publisherMatch && !idMatch) return false;
    }
    
    for (const f of filters) {
      const val = record[f.property];
      if (f.operator === 'is') {
        if (val != f.value) return false;
      } else if (f.operator === 'is_not') {
        if (val == f.value) return false;
      } else if (f.operator === '>') {
        if ((val as number) <= (f.value as number)) return false;
      } else if (f.operator === '<') {
        if ((val as number) >= (f.value as number)) return false;
      }
    }
    return true;
  });
}

export function applySorts<T extends object>(items: T[], sorts: { property: string, direction: 'asc' | 'desc' }[]): T[] {
  if (sorts.length === 0) return items; // no sorts applied

  return [...items].sort((a, b) => {
    for (const s of sorts) {
      let valA = (a as Record<string, unknown>)[s.property];
      let valB = (b as Record<string, unknown>)[s.property];
      
      // Handle undefined/nulls
      if (valA === undefined || valA === null) valA = '';
      if (valB === undefined || valB === null) valB = '';

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
