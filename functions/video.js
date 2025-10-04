export async function onRequest(context) {
  const { request } = context;
  const baseURL = new URL(request.url);
  const videoURL = `${baseURL.origin}/x/mp4/vi.mp4`;

  const referer = request.headers.get('Referer') || '';
  if (!referer.startsWith(baseURL.origin)) {
    return new Response('Access denied', { status: 403 });
  }

  let videoRes;
  try {
    videoRes = await fetch(videoURL, {
      headers: request.headers
    });
  } catch (err) {
    return new Response('Video not found', { status: 404 });
  }

  const headers = new Headers(videoRes.headers);
  headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
  headers.set('Pragma', 'no-cache');
  headers.set('Expires', '0');
  headers.set('Content-Disposition', 'inline');
  headers.set('Access-Control-Allow-Origin', baseURL.origin);

  return new Response(videoRes.body, {
    status: videoRes.status,
    statusText: videoRes.statusText,
    headers
  });
}
