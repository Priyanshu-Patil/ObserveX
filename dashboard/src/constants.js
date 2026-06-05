export const QUERY_KEYS = {
    DASHBOARD: ['dashboard'],
    STATS: ['stats'],
    API_KEYS: (clientId) => ['apiKeys', clientId],
    CLIENTS: ['clients'],
};

export const REFETCH_INTERVAL = 30_000;

export const CLIENT_REGISTRY_KEY = 'observex_client_registry';

export const ROLES = {
    SUPER_ADMIN: 'super_admin',
    CLIENT_ADMIN: 'client_admin',
    CLIENT_VIEWER: 'client_viewer',
};

export const API_KEY_ENVIRONMENTS = [
    { value: 'production', label: 'Production' },
    { value: 'staging', label: 'Staging' },
    { value: 'development', label: 'Development' },
    { value: 'testing', label: 'Testing' },
];
