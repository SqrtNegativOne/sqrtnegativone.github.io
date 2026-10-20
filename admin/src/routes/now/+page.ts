import { readData, type NowArc } from '$lib/db';

export const load = async () => {
  const res = await readData<NowArc>('now');
  return {
    arcs: res.unwrapOr([])
  };
};
