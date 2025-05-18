import { subscribeNotification, unsubscribeNotification } from '../data/api';
import { VAPID_PUBLIC_KEY } from '../config';
import { convertBase64ToUint8Array } from './index';

// Register (subscribe) to push notifications
export async function registerPushNotifications() {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
        console.warn('Notifikasi push tidak didukung oleh browser ini');
        return false;
    }

    try {
        const registration = await navigator.serviceWorker.getRegistration();
        if (!registration) {
            console.warn('Service Worker belum terdaftar');
            return false;
        }

        if (Notification.permission === 'denied') {
            console.warn('Izin notifikasi diblokir oleh pengguna');
            return false;
        }

        if (Notification.permission !== 'granted') {
            const permission = await Notification.requestPermission();
            if (permission !== 'granted') {
                console.warn('Izin notifikasi tidak diberikan');
                return false;
            }
        }

        const subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: convertBase64ToUint8Array(VAPID_PUBLIC_KEY),
        });

        const subscriptionObject = subscription.toJSON();

        const response = await subscribeNotification({
            endpoint: subscriptionObject.endpoint,
            keys: {
                p256dh: subscriptionObject.keys.p256dh,
                auth: subscriptionObject.keys.auth,
            },
        });

        if (response.ok) {
            console.log('Berhasil berlangganan notifikasi push:', response.data);
            return true;
        } else {
            console.error('Gagal berlangganan:', response.message || 'Kesalahan server');
            return false;
        }
    } catch (error) {
        console.error('Error saat mendaftarkan notifikasi push:', error);
        return false;
    }
}

// Unsubscribe from push notifications
export async function unsubscribePushNotifications() {
    try {
        const registration = await navigator.serviceWorker.getRegistration();
        if (!registration) {
            console.warn('Tidak ada Service Worker yang terdaftar');
            return false;
        }

        const subscription = await registration.pushManager.getSubscription();
        if (!subscription) {
            console.warn('Tidak ada langganan push yang ditemukan');
            return false;
        }

        const response = await unsubscribeNotification({
            endpoint: subscription.endpoint,
        });

        if (response.ok) {
            await subscription.unsubscribe();
            console.log('Berhasil membatalkan langganan notifikasi push');
            return true;
        } else {
            console.error('Gagal membatalkan langganan:', response.message || 'Kesalahan server');
            return false;
        }
    } catch (error) {
        console.error('Error saat membatalkan langganan notifikasi push:', error);
        return false;
    }
}

// Set up listener for messages from Service Worker
export function setupNotificationListener() {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.addEventListener('message', (event) => {
            console.log('Pesan dari Service Worker:', event.data);
        });
    }
}