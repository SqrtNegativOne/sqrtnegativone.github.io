import questionsMarkdown from '../../data/questions.md?raw';

export const prerender = true;

export function GET() {
  return new Response(questionsMarkdown, {
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8'
    }
  });
}
