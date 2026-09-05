import { readData } from '$lib/db';
import type { PageLoad } from './$types';
import type { QuoteItem } from '../../../../shared/types';

export const load: PageLoad = async () => {
  const res = await readData<QuoteItem>('quotes');
  return { quotes: res.unwrapOr([]) };
};
