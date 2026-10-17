// Single source of truth for the "what do these mean?" legend shown next to the
// media library on both the public site and the admin dashboard.

export interface MediaStatusInfo {
  value: string;
  label: string;
  definition: string;
}

export interface MediaRatingInfo {
  value: number;
  label: string;
  definition: string;
}

export const STATUS_INFO: MediaStatusInfo[] = [
  { value: 'finished', label: 'Finished', definition: 'Consumed all the way to the end.' },
  { value: 'dropped', label: 'Dropped', definition: 'Started but gave up on it for good.' },
  { value: 'shelved', label: 'Shelved', definition: 'Paused and set aside for later.' },
  { value: 'wishlist', label: 'Wishlist', definition: 'Want to consume sometime in the future.' },
  { value: 'rewishlist', label: 'Rewishlist', definition: 'Already consumed before; want to consume it again.' },
  { value: 'next up', label: 'Next Up', definition: 'Queued up to consume next.' },
  { value: 'consuming', label: 'Consuming', definition: 'Currently in progress.' },
  { value: 'waiting for', label: 'Waiting For', definition: 'Not out yet, or waiting on a release.' }
];

export const RATING_INFO: MediaRatingInfo[] = [
  { value: 0, label: '0', definition: 'actually ruined my life. the director needs to be put in front of a firing squad.' },
  { value: 1, label: '1', definition: 'very bad.' },
  { value: 2, label: '2', definition: 'bad, but no need to go out of your way to not see this — like if your friend was showing it to you at their home, maybe.' },
  { value: 3, label: '3', definition: 'eh. ymmv. feel free to adjust these ratings to your own brain (e.g. if you enjoy romance more, boost this one up a bit).' },
  { value: 4, label: '4', definition: 'good, but no need to go out of your way.' },
  { value: 5, label: '5', definition: 'very good. go out of your way to see this.' },
  { value: 6, label: '6', definition: 'masterpiece. actually just changed my life.' }
];
