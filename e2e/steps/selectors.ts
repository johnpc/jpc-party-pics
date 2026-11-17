// Every stored object key starts with public/, and the components render the
// key as the <img alt>, so these selectors are backend-agnostic (real S3 or
// the fake). Shared by the gallery and modal step files.
export const galleryImg = 'img[alt^="public/"]';
export const modalImg = `.MuiModal-root ${galleryImg}`;
