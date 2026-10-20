import markdownIt from 'markdown-it';
import { getOngoingArcs, type NowBookItem } from '$shared/lib/arcs';

export const prerender = true;

const md = markdownIt({ html: true, linkify: true, typographer: true });

export function load(): { items: NowBookItem[] } {
  const items = getOngoingArcs('professional').map((arc) => ({
    id: arc.id,
    title: arc.title,
    startDate: arc.startDate,
    endDate: arc.endDate,
    html: md.render(arc.description)
  }));

  return { items };
}
