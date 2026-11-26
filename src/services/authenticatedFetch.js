export function authenticatedFetch(input, init = {}) {
    const headers = new Headers(init.headers);
    const token = localStorage.getItem('accessToken');
    if (token) headers.set('Authorization', `Bearer ${token}`);

    return fetch(input, { ...init, headers });
}
