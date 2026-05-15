export function extractYouTubeId(url) {
    if (!url) return null;
    const trimmed = String(url).trim();
    if (/^[A-Za-z0-9_-]{11}$/.test(trimmed)) return trimmed;

    try {
        const parsed = new URL(trimmed);
        const host = parsed.hostname.replace(/^www\./, '');

        if (host === 'youtu.be') {
            return parsed.pathname.split('/').filter(Boolean)[0] || null;
        }

        if (host.endsWith('youtube.com')) {
            if (parsed.pathname === '/watch') return parsed.searchParams.get('v');
            const match = parsed.pathname.match(/^\/(embed|shorts|v)\/([A-Za-z0-9_-]{11})/);
            return match?.[2] || null;
        }
    } catch (error) {
        return null;
    }

    return null;
}

export function youtubeEmbedUrl(url) {
    const id = extractYouTubeId(url);
    return id ? `https://www.youtube-nocookie.com/embed/${id}?rel=0&modestbranding=1&playsinline=1` : null;
}

export function youtubeThumbnailUrl(url) {
    const id = extractYouTubeId(url);
    return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : null;
}

export function youtubeSearchUrl(query) {
    return `https://www.youtube.com/results?search_query=${encodeURIComponent(query || '')}`;
}

export function imageSearchUrl(query) {
    return `https://www.google.com/search?tbm=isch&q=${encodeURIComponent(query || '')}`;
}

export function exerciseImageAlt(exercise) {
    return exercise?.imageAlt || `${exercise?.name || 'Exercise'} form preview`;
}
