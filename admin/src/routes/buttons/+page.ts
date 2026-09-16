import { readData } from '$lib/db';
import type { ButtonItem } from '../../../../shared/types';
export type { ButtonItem };

export const load = async () => {
  const res = await readData<ButtonItem>('buttons');
  return { buttons: res.unwrapOr([] as ButtonItem[]) };
};
