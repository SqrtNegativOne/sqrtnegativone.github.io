import typeMovie from '../../static/icons/type-movie.svg?raw';
import typeShow from '../../static/icons/type-show.svg?raw';
import typeGame from '../../static/icons/type-game.svg?raw';
import typeBook from '../../static/icons/type-book.svg?raw';
import typeDefault from '../../static/icons/type-default.svg?raw';
import statusFinished from '../../static/icons/status-finished.svg?raw';
import statusDropped from '../../static/icons/status-dropped.svg?raw';
import statusShelved from '../../static/icons/status-shelved.svg?raw';
import statusWishlist from '../../static/icons/status-wishlist.svg?raw';
import statusRewishlist from '../../static/icons/status-rewishlist.svg?raw';
import statusNextUp from '../../static/icons/status-next-up.svg?raw';
import statusConsuming from '../../static/icons/status-consuming.svg?raw';

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
};
