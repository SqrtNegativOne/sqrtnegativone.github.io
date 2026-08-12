export function applyFilters(items: any[], filters: any[], searchQuery: string) {
  return items.filter(item => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const titleMatch = item.title?.toLowerCase().includes(q);
      const taglineMatch = item.tagline?.toLowerCase().includes(q);
      const idMatch = item.id?.toLowerCase().includes(q);
      if (!titleMatch && !taglineMatch && !idMatch) return false;
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

export function applySorts(items: any[], sorts: any[]) {
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
