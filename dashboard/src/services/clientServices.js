import api from '../lib/api';

export async function getClients() {
    const response = await api.get('/admin/clients');

    return response.data.data;
}