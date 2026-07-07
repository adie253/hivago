import fs from 'fs';

const filePath = 'c:\\Users\\Aditya\\OneDrive\\Desktop\\Celsys\\Hivago\\src\\data\\api.ts';
let content = fs.readFileSync(filePath, 'utf8');

// Normalise all CRLF to LF for index matching
content = content.replace(/\r\n/g, '\n');

// 1. Locate isTokenValid to authFetch block
const startStr = "export const isTokenValid = (): boolean => {";
const endStr = "    return fetch(`${BASE_URL}${endpoint}`, { ...options, headers });\n};";

const startIndex = content.indexOf(startStr);
const endIndex = content.indexOf(endStr);

if (startIndex === -1 || endIndex === -1) {
    console.error("Error: Could not locate isTokenValid or authFetch in api.ts", { startIndex, endIndex });
    process.exit(1);
}

const beforeBlock = content.substring(0, startIndex);
const afterBlock = content.substring(endIndex + endStr.length);

const newAuthBlock = `export const getRememberMe = (): boolean => {
    return localStorage.getItem('remember_me') === 'true';
};

export const setRememberMe = (remember: boolean) => {
    localStorage.setItem('remember_me', remember ? 'true' : 'false');
};

export const getAccessToken = (): string | null => {
    return localStorage.getItem('customer_token') || sessionStorage.getItem('customer_token');
};

export const getRefreshToken = (): string | null => {
    return localStorage.getItem('customer_refresh_token') || sessionStorage.getItem('customer_refresh_token');
};

export const getTokenExpiresAt = (): string | null => {
    return localStorage.getItem('customer_token_expires_at') || sessionStorage.getItem('customer_token_expires_at');
};

export const setAuthSession = (accessToken: string, refreshToken: string | null, expiresAt: string | null, rememberMe: boolean) => {
    localStorage.removeItem('customer_token');
    localStorage.removeItem('customer_refresh_token');
    localStorage.removeItem('customer_token_expires_at');
    sessionStorage.removeItem('customer_token');
    sessionStorage.removeItem('customer_refresh_token');
    sessionStorage.removeItem('customer_token_expires_at');

    setRememberMe(rememberMe);

    const storage = rememberMe ? localStorage : sessionStorage;
    storage.setItem('customer_token', accessToken);
    if (refreshToken) {
        storage.setItem('customer_refresh_token', refreshToken);
    }
    if (expiresAt) {
        storage.setItem('customer_token_expires_at', expiresAt);
    }
};

export const updateAuthSession = (accessToken: string, refreshToken: string | null, expiresAt: string | null) => {
    const rememberMe = getRememberMe();
    const storage = rememberMe ? localStorage : sessionStorage;
    storage.setItem('customer_token', accessToken);
    if (refreshToken) {
        storage.setItem('customer_refresh_token', refreshToken);
    }
    if (expiresAt) {
        storage.setItem('customer_token_expires_at', expiresAt);
    }
};

export const clearAuthSession = () => {
    localStorage.removeItem('customer_token');
    localStorage.removeItem('customer_refresh_token');
    localStorage.removeItem('customer_token_expires_at');
    localStorage.removeItem('customer_phone');
    localStorage.removeItem('customer_id');
    localStorage.removeItem('customer_name');
    localStorage.removeItem('remember_me');

    sessionStorage.removeItem('customer_token');
    sessionStorage.removeItem('customer_refresh_token');
    sessionStorage.removeItem('customer_token_expires_at');
};

export const isTokenValid = (): boolean => {
    const token = getAccessToken();
    const refreshTkn = getRefreshToken();
    if (!token && !refreshTkn) return false;

    const expiresAt = getTokenExpiresAt();
    if (!expiresAt) return true;

    if (new Date(expiresAt).getTime() > Date.now()) {
        return true;
    }

    return !!refreshTkn;
};

let refreshPromise: Promise<string | null> | null = null;

export const getOrPerformTokenRefresh = async (): Promise<string | null> => {
    if (refreshPromise) {
        return refreshPromise;
    }

    const refreshTkn = getRefreshToken();
    if (!refreshTkn) {
        return null;
    }

    refreshPromise = (async () => {
        try {
            const data = await refreshToken();
            if (data && data.accessToken) {
                return data.accessToken;
            }
            return null;
        } catch (error) {
            console.error("Token refresh failed in single-flight handler", error);
            return null;
        } finally {
            refreshPromise = null;
        }
    })();

    return refreshPromise;
};

export const authFetch = async (endpoint: string, options: RequestInit = {}): Promise<Response> => {
    let token = getAccessToken();
    const headers = new Headers(options.headers || {});
    if (token) {
        headers.set('Authorization', 'Bearer ' + token);
    }
    
    let response = await fetch(BASE_URL + endpoint, { ...options, headers });
    
    if (response.status === 401) {
        const newToken = await getOrPerformTokenRefresh();
        if (newToken) {
            const retryHeaders = new Headers(options.headers || {});
            retryHeaders.set('Authorization', 'Bearer ' + newToken);
            response = await fetch(BASE_URL + endpoint, { ...options, headers: retryHeaders });
        } else {
            clearAuthSession();
            window.dispatchEvent(new CustomEvent('auth-logout'));
        }
    }
    
    return response;
};\n`;

content = beforeBlock + newAuthBlock + afterBlock;
console.log("Successfully replaced auth block via indices!");

// 2. Locate and replace refreshToken function
const refreshStartStr = "export const refreshToken = async (): Promise<any> => {";
const refreshEndStr = `    } catch (error) {
        console.error('Error refreshing token:', error);
        return null;
    }
};`;

const rStartIndex = content.indexOf(refreshStartStr);
const rEndIndex = content.indexOf(refreshEndStr, rStartIndex);

if (rStartIndex === -1 || rEndIndex === -1) {
    console.error("Error: Could not locate refreshToken function in api.ts", { rStartIndex, rEndIndex });
    process.exit(1);
}

const beforeRefresh = content.substring(0, rStartIndex);
const afterRefresh = content.substring(rEndIndex + refreshEndStr.length);

const newRefreshTokenStr = `export const refreshToken = async (): Promise<any> => {
    try {
        const token = getAccessToken();
        const refreshTkn = getRefreshToken();
        if (!token) return null;

        // Try standard payload first (with refreshToken if available)
        const payload = refreshTkn 
            ? { refreshToken: refreshTkn }
            : { token: token, accessToken: token };

        const response = await fetch(BASE_URL + '/auth/refresh', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload) 
        });

        if (!response.ok) {
            // Fallback retry with Authorization header and alternative payload
            const fallbackPayload = refreshTkn 
                ? { accessToken: token, refreshToken: refreshTkn }
                : { token: token };

            const retryResponse = await fetch(BASE_URL + '/auth/refresh', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + token
                },
                body: JSON.stringify(fallbackPayload)
            });
            if (!retryResponse.ok) return null;
            
            const data = await retryResponse.json();
            if (data && data.accessToken) {
                updateAuthSession(data.accessToken, data.refreshToken, data.accessTokenExpiresAt);
                return data;
            }
            return null;
        }
        
        const data = await response.json();
        if (data && data.accessToken) {
            updateAuthSession(data.accessToken, data.refreshToken, data.accessTokenExpiresAt);
            return data;
        }
        return null;
    } catch (error) {
        console.error('Error refreshing token:', error);
        return null;
    }
};`;

content = beforeRefresh + newRefreshTokenStr + afterRefresh;
console.log("Successfully replaced refreshToken function!");

fs.writeFileSync(filePath, content, 'utf8');
console.log("Done!");
