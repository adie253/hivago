import { HubConnection, HubConnectionBuilder, LogLevel } from '@microsoft/signalr';

const BASE_URL = import.meta.env.MODE === 'production'
    ? 'https://rally-production-2004.up.railway.app'
    : '';

const HUB_URL = `${BASE_URL}/hubs/notifications`;

class SignalRService {
    private connection: HubConnection | null = null;
    private onStatusUpdateCallbacks: Array<(payload: any) => void> = [];

    public async start(): Promise<void> {
        if (this.connection && this.connection.state !== 'Disconnected') return;

        const token = localStorage.getItem('customer_token') || '';
        const urlWithToken = `${HUB_URL}${HUB_URL.includes('?') ? '&' : '?'}access_token=${token}`;

        this.connection = new HubConnectionBuilder()
            .withUrl(urlWithToken)
            .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])
            .configureLogging(LogLevel.Warning)
            .build();

        this.connection.on('OrderStatusUpdate', (payload) => {
            console.log('[SignalR] OrderStatusUpdate received:', payload);
            this.onStatusUpdateCallbacks.forEach(cb => cb(payload));
        });

        try {
            await this.connection.start();
            console.log('[SignalR] Connected successfully');
        } catch (err) {
            console.error('[SignalR] Connection failed: ', err);
            // Retry after 5s if initial start fails
            setTimeout(() => this.start(), 5000);
        }
    }

    public onStatusUpdate(callback: (payload: any) => void) {
        this.onStatusUpdateCallbacks.push(callback);
        return () => {
            this.onStatusUpdateCallbacks = this.onStatusUpdateCallbacks.filter(cb => cb !== callback);
        };
    }

    public stop() {
        if (this.connection) {
            this.connection.stop();
            this.connection = null;
        }
    }
}

export const signalRService = new SignalRService();
