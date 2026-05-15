async function request(path, options = {}) {
    const method = options.method || 'GET';

    let response;
    try {
        response = await fetch(`/api${path}`, {
            headers: {
                'Content-Type': 'application/json',
                ...(options.headers || {})
            },
            ...options
        });
    } catch (error) {
        throw new Error(`Could not reach the Hunter Tracker API while ${method} ${path}. Make sure the server is running and try again.`);
    }

    const contentType = response.headers.get('content-type') || '';
    const body = response.status === 204
        ? null
        : contentType.includes('application/json')
            ? await response.json()
            : await response.text();

    if (!response.ok) {
        const message = typeof body === 'string' ? body : body?.error || body?.message;
        throw new Error(message || `Hunter Tracker API failed to save (${response.status}) while ${method} ${path}.`);
    }

    return body;
}

export const api = {
    get: (path) => request(path),
    post: (path, body) => request(path, { method: 'POST', body: JSON.stringify(body ?? {}) }),
    put: (path, body) => request(path, { method: 'PUT', body: JSON.stringify(body ?? {}) }),
    del: (path) => request(path, { method: 'DELETE' })
};
