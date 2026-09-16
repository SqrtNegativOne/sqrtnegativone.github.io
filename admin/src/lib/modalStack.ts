/**
 * A lightweight stack of currently-open modal instances.
 *
 * Only the top-most modal should react to global shortcuts (Esc, Ctrl+S,
 * Ctrl+K...) so nested dialogs (e.g. the media metadata search) can take over
 * without the modal underneath also closing or saving.
 */
const stack: symbol[] = [];

export function pushModal(id: symbol): void {
  if (!stack.includes(id)) stack.push(id);
}

export function popModal(id: symbol): void {
  const index = stack.lastIndexOf(id);
  if (index !== -1) stack.splice(index, 1);
}

export function isTopModal(id: symbol): boolean {
  return stack.length > 0 && stack[stack.length - 1] === id;
}
