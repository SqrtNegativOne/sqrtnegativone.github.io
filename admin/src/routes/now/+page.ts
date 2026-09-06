import { readData, type NowEntry } from '$lib/db';

export const load = async () => {
  const res = await readData<NowEntry>('now');
  return {
    entries: res.unwrapOr([])
  };
};
