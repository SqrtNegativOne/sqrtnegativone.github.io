import mediaProperties from '../../../../static/media-properties.json';
export const TYPE_LABEL = Object.fromEntries(mediaProperties.types.map(t => [t.value, t.label]));
