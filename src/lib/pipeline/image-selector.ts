interface UnsplashImage {
  url: string;
  alt: string;
  credit: string;
}

export async function fetchUnsplashImage(
  searchTerms: string
): Promise<UnsplashImage | null> {
  const accessKey = process.env.UNSPLASH_ACCESS_KEY;
  if (!accessKey) return null;

  try {
    const res = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(
        searchTerms
      )}&per_page=1&orientation=landscape`,
      {
        headers: { Authorization: `Client-ID ${accessKey}` },
      }
    );

    if (!res.ok) return null;

    const data = await res.json();
    const photo = data.results?.[0];
    if (!photo) return null;

    return {
      url: photo.urls.regular,
      alt: photo.alt_description || searchTerms,
      credit: photo.user.name,
    };
  } catch {
    return null;
  }
}
