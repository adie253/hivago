const raw = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');
export const API_ROOT = raw.endsWith('/api') ? raw.slice(0, -4) : raw; // origin only
export const API_BASE_URL = `${API_ROOT}/api`;                        // for REST calls
export const VERSION_URL = `${API_ROOT}/version`;                       // for backend version check

