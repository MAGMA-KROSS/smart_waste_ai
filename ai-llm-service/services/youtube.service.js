/**
 * ai-llm-service/services/youtube.service.js
 *
 * SERVER-ONLY. Real YouTube Data API v3 search only - never fabricates
 * video IDs, thumbnails, or channels. Returns [] on any failure so a
 * broken/missing key never breaks the scan result.
 */

const YOUTUBE_SEARCH_ENDPOINT = "https://www.googleapis.com/youtube/v3/search";
const TIMEOUT_MS = 8000;
const MAX_RESULTS = 6;

function isConfigured() {
  return Boolean(process.env.YOUTUBE_API_KEY);
}

export async function searchTutorialVideos(searchQuery) {
  if (!searchQuery || !isConfigured()) return [];

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const params = new URLSearchParams({
      part: "snippet", q: searchQuery, type: "video",
      maxResults: String(MAX_RESULTS), safeSearch: "strict",
      relevanceLanguage: "en", key: process.env.YOUTUBE_API_KEY,
    });

    const res = await fetch(`${YOUTUBE_SEARCH_ENDPOINT}?${params.toString()}`, { signal: controller.signal });
    if (!res.ok) {
      console.error("[AI] YouTube API error:", res.status);
      return [];
    }

    const data = await res.json();
    const items = Array.isArray(data.items) ? data.items : [];
    return items
      .filter((item) => item?.id?.videoId)
      .map((item) => ({
        videoId: item.id.videoId,
        title: item.snippet?.title || "Untitled",
        thumbnail: item.snippet?.thumbnails?.medium?.url || item.snippet?.thumbnails?.default?.url || "",
        channel: item.snippet?.channelTitle || "Unknown Channel",
        publishedAt: item.snippet?.publishedAt || null,
        url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
      }));
  } catch (err) {
    console.error("[AI] YouTube search failed:", err?.message || err);
    return [];
  } finally {
    clearTimeout(timer);
  }
}
