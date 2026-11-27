// src/services/cache.js
// Cache da aba atual: memória rápida e sessionStorage para sobreviver a recargas.

const store = new Map();     // chave -> { data, expires }
const inflight = new Map();  // chave -> Promise em andamento
const generations = new Map();
const STORAGE_PREFIX = 'tambaki:api-cache:v1:';
let cacheEpoch = 0;
let storageWarningShown = false;

function getSessionStorage() {
    if (typeof window === 'undefined') return null;

    try {
        return window.sessionStorage;
    } catch (error) {
        if (!storageWarningShown) {
            console.warn('Não foi possível acessar o cache desta sessão.', error);
            storageWarningShown = true;
        }
        return null;
    }
}

function readEntry(key) {
    if (store.has(key)) return store.get(key);

    const storage = getSessionStorage();
    if (!storage) return null;

    try {
        const serialized = storage.getItem(`${STORAGE_PREFIX}${key}`);
        if (!serialized) return null;

        const entry = JSON.parse(serialized);
        if (!entry || typeof entry.expires !== 'number' || !Object.prototype.hasOwnProperty.call(entry, 'data')) {
            removePersistentEntry(storage, key);
            return null;
        }

        store.set(key, entry);
        return entry;
    } catch (error) {
        console.warn(`Não foi possível ler o cache "${key}".`, error);
        removePersistentEntry(storage, key);
        return null;
    }
}

function persistEntry(key, entry) {
    const storage = getSessionStorage();
    if (!storage) return;

    try {
        storage.setItem(`${STORAGE_PREFIX}${key}`, JSON.stringify(entry));
    } catch (error) {
        console.warn(`Não foi possível salvar o cache "${key}" nesta sessão.`, error);
    }
}

function removePersistentEntry(storage, key) {
    try {
        storage.removeItem(`${STORAGE_PREFIX}${key}`);
    } catch (error) {
        console.warn(`Não foi possível invalidar o cache "${key}".`, error);
    }
}

function getPersistentKeys(storage) {
    try {
        const keys = [];
        for (let index = 0; index < storage.length; index += 1) {
            const key = storage.key(index);
            if (key?.startsWith(STORAGE_PREFIX)) keys.push(key);
        }
        return keys;
    } catch (error) {
        console.warn('Não foi possível listar o cache desta sessão.', error);
        return [];
    }
}

/**
 * Devolve o dado do cache se ainda for válido; senão chama o fetcher.
 * Requisições simultâneas com a mesma chave compartilham a mesma Promise.
 * Erros NÃO são guardados no cache (a próxima chamada tenta de novo).
 */
export function cached(key, fetcher, ttlMs = 5 * 60 * 1000) {
    const hit = readEntry(key);
    if (hit && hit.expires > Date.now()) return Promise.resolve(hit.data);
    if (inflight.has(key)) return inflight.get(key);

    const epoch = cacheEpoch;
    const generation = generations.get(key) || 0;
    let promise;
    promise = Promise.resolve()
        .then(fetcher)
        .then((data) => {
            if (epoch === cacheEpoch && generation === (generations.get(key) || 0)) {
                const entry = { data, expires: Date.now() + ttlMs };
                store.set(key, entry);
                persistEntry(key, entry);
            }
            return data;
        })
        .finally(() => {
            if (inflight.get(key) === promise) inflight.delete(key);
        });

    inflight.set(key, promise);
    return promise;
}

export function getCached(key) {
    return readEntry(key)?.data;
}

export function hasCached(key) {
    return readEntry(key) !== null;
}

/** Marca como desatualizadas as chaves com o prefixo, mantendo dados para render imediato. */
export function invalidate(prefix) {
    const keys = new Set([...store.keys(), ...inflight.keys()]);
    const storage = getSessionStorage();

    if (storage) {
        for (const storageKey of getPersistentKeys(storage)) {
            keys.add(storageKey.slice(STORAGE_PREFIX.length));
        }
    }

    for (const key of keys) {
        if (key.startsWith(prefix)) {
            inflight.delete(key);
            generations.set(key, (generations.get(key) || 0) + 1);

            const entry = readEntry(key);
            if (entry) {
                const staleEntry = { ...entry, expires: 0 };
                store.set(key, staleEntry);
                persistEntry(key, staleEntry);
            } else {
                store.delete(key);
                if (storage) removePersistentEntry(storage, key);
            }
        }
    }
}

/** Limpa tudo. Chame no login e no logout. */
export function clearCache() {
    cacheEpoch += 1;
    store.clear();
    inflight.clear();
    generations.clear();

    const storage = getSessionStorage();
    if (!storage) return;

    for (const key of getPersistentKeys(storage)) {
        try {
            storage.removeItem(key);
        } catch (error) {
            console.warn('Não foi possível limpar completamente o cache da sessão.', error);
        }
    }
}