export function applyFilters<T extends Record<string, any>>(items: T[], filters: { property: string, operator: string, value: any }[], searchQuery: string): T[] {
  return items.filter(item => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const titleMatch = typeof item.title === 'string' && item.title.toLowerCase().includes(q);
      const taglineMatch = typeof item.tagline === 'string' && item.tagline.toLowerCase().includes(q);
      const authorMatch = typeof item.author === 'string' && item.author.toLowerCase().includes(q);
      const publisherMatch = typeof item.publisher === 'string' && item.publisher.toLowerCase().includes(q);
      const idMatch = typeof item.id === 'string' && item.id.toLowerCase().includes(q);
      if (!titleMatch && !taglineMatch && !authorMatch && !publisherMatch && !idMatch) return false;
    }
    
    for (const f of filters) {
      const val = item[f.property];
      if (f.operator === 'is') {
        if (val != f.value) return false;
      } else if (f.operator === 'is_not') {
        if (val == f.value) return false;
      } else if (f.operator === '>') {
        if (val <= f.value) return false;
      } else if (f.operator === '<') {
        if (val >= f.value) return false;
      }
    }
    return true;
  });
}

export function applySorts<T extends Record<string, any>>(items: T[], sorts: { property: string, direction: 'asc' | 'desc' }[]): T[] {
  if (sorts.length === 0) return items; // no sorts applied

  return [...items].sort((a, b) => {
    for (const s of sorts) {
      let valA = a[s.property];
      let valB = b[s.property];
      
      // Handle undefined/nulls
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
    return 0; // Tie
  });
}
