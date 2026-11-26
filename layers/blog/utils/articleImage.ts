// `sizes` for the article header image. Kept at the value the page always
// used, so the browser picks the very same candidate as before and the image
// looks identical; only its priority changed. One constant, so the preload
// NuxtPicture derives and the rendered <source>/<img> cannot disagree.
export const ARTICLE_HEADER_SIZES = 'xs:300px sm:500px md:700px lg:1200px xl:1920px'
