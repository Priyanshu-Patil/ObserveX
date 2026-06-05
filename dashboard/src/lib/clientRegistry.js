import { CLIENT_REGISTRY_KEY } from '../constants';

function readRegistry() {
    try {
        const raw = localStorage.getItem(CLIENT_REGISTRY_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
}

function writeRegistry(clients) {
    localStorage.setItem(CLIENT_REGISTRY_KEY, JSON.stringify(clients));
}

export function getRegisteredClients() {
    return readRegistry();
}

export function registerClient(client, metadata = {}) {
    const clients = readRegistry();
    const entry = {
        ...client,
        ...metadata,
        _id: client._id || client.id,
        registeredAt: new Date().toISOString(),
    };
    const idx = clients.findIndex((c) => c._id === entry._id);
    if (idx >= 0) {
        clients[idx] = { ...clients[idx], ...entry };
    } else {
        clients.unshift(entry);
    }
    writeRegistry(clients);
    return entry;
}

export function getRegisteredClient(id) {
    return readRegistry().find((c) => c._id === id) ?? null;
}

export function updateRegisteredClient(id, updates) {
    const clients = readRegistry();
    const idx = clients.findIndex((c) => c._id === id);
    if (idx < 0) return null;
    clients[idx] = { ...clients[idx], ...updates };
    writeRegistry(clients);
    return clients[idx];
}

export function removeRegisteredClient(id) {
    const clients = readRegistry().filter((c) => c._id !== id);
    writeRegistry(clients);
}
