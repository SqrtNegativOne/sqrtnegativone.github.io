import typeMovie from './icons/type-movie.svg?raw';
import typeShow from './icons/type-show.svg?raw';
import typeGame from './icons/type-game.svg?raw';
import typeBook from './icons/type-book.svg?raw';
import typeDefault from './icons/type-default.svg?raw';
import statusFinished from './icons/status-finished.svg?raw';
import statusDropped from './icons/status-dropped.svg?raw';
import statusShelved from './icons/status-shelved.svg?raw';
import statusWishlist from './icons/status-wishlist.svg?raw';
import statusRewishlist from './icons/status-rewishlist.svg?raw';
import statusNextUp from './icons/status-next-up.svg?raw';
import statusConsuming from './icons/status-consuming.svg?raw';
import statusWaitingFor from './icons/status-waiting-for.svg?raw';

export const icons: Record<string, string> = {
  'type-movie': typeMovie.trim(),
  'type-show': typeShow.trim(),
  'type-game': typeGame.trim(),
  'type-book': typeBook.trim(),
  'type-default': typeDefault.trim(),
  'status-finished': statusFinished.trim(),
  'status-dropped': statusDropped.trim(),
  'status-shelved': statusShelved.trim(),
  'status-wishlist': statusWishlist.trim(),
  'status-rewishlist': statusRewishlist.trim(),
  'status-next-up': statusNextUp.trim(),
  'status-consuming': statusConsuming.trim(),
  'status-waiting-for': statusWaitingFor.trim(),
};
