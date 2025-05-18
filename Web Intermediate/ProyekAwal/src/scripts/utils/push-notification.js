
import { subscribeNotification } from '../data/api';
import { VAPID_PUBLIC_KEY } from '../config';
import { convertBase64ToUint8Array } from './index';

export async function registerPushNotifications() {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
        console.warn('Push notifications not supported');
        return;
    }

    try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        console.log('Service Worker registered:', registration);

        if (Notification.permission === 'denied') {
            console.warn('Notifications blocked by user');
            return;
        }

        if (Notification.permission !== 'granted') {
            const permission = await Notification.requestPermission();
            if (permission !== 'granted') {
                console.warn('Notification permission not granted');
                return;
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

        if (response.ok && !response.error) {
            console.log('Subscribed to push notifications:', response.data);
        } else {
            console.error('Failed to subscribe:', response.message);
        }
    } catch (error) {
        console.error('Error registering push notifications:', error);
    }
}

export async function unsubscribePushNotifications() {
    try {
        const registration = await navigator.serviceWorker.getRegistration();
        if (!registration) {
            console.warn('No service worker registered');
            return;
        }

        const subscription = await registration.pushManager.getSubscription();
        if (!subscription) {
            console.warn('No push subscription found');
            return;
        }

        const response = await unsubscribeNotification({
            endpoint: subscription.endpoint,
        });

        if (response.ok && !response.error) {
            await subscription.unsubscribe();
            console.log('Unsubscribed from push notifications');
        } else {
            console.error('Failed to unsubscribe:', response.message);
        }
    } catch (error) {
        console.error('Error unsubscribing push notifications:', error);
    }
}