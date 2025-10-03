export async function onRequest(context) {
  const { request } = context;
  const baseURL = new URL(request.url);
  // Path absolut ke video di repo GitHub/Cloudflare Pages
  const videoURL = `${baseURL.origin}/mp4/vi/hi.mp4`;  // Sesuaikan jika path beda
  const referer = request.headers.get('Referer') || '';
  if (!referer.startsWith(baseURL.origin)) {
    console.log('Access denied: Invalid referer');
    return new Response('Access denied', { status: 403 });
  }
  let videoRes;
  try {
    // Pass range header untuk support streaming/seek
    const fetchHeaders = new Headers(request.headers);
    videoRes = await fetch(videoURL, { headers: fetchHeaders });
    if (!videoRes.ok) {
      throw new Error('Video fetch failed');
    }
  } catch (err) {
    console.error('Error fetching video:', err);
    return new Response('Video not found or error', { status: 404 });
  }
  const headers = new Headers(videoRes.headers);
  // No-cache headers
  headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
  headers.set('Pragma', 'no-cache');
  headers.set('Expires', '0');
  // Inline play, bukan attachment
  headers.set('Content-Disposition', 'inline');
  // CORS restrict ke origin situsmu
  headers.set('Access-Control-Allow-Origin', baseURL.origin);
  // Support range requests untuk streaming
  headers.set('Accept-Ranges', 'bytes');
  console.log('Serving video via proxy');
  return new Response(videoRes.body, { status: videoRes.status, statusText: videoRes.statusText, headers });
      }
