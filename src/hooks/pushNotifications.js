import { useCallback } from 'react';
import Cookies from 'js-cookie';

const PUBLIC_VAPID_KEY = 'BGGaz8v39wfwoxIwMc8xw8zSCMitviFqbkn9G_ccxrD18a0tCxVf-HEDhAYihvnfBvWNPtMD5DHA0M8SpZ450QM';

export function usePushNotifications() {
  const subscribeToPush = useCallback(async () => {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      const token = Cookies.get('authToken');
      try {
        // 1. Register service worker
        const registration = await navigator.serviceWorker.register('/sw.js');
        console.log('Service Worker registered:', registration);

        // 2. Ask permission
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') {
          throw new Error('Notification permission not granted.');
        }

        // 3. Subscribe to push
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(PUBLIC_VAPID_KEY)
        });

        // 4. Send subscription to backend
        await fetch(`${import.meta.env.VITE_API_URL}/api/notifications/subscribe`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            authorization: `${token}`
          },
          credentials: 'include',
          body: JSON.stringify(subscription)
        });

        console.log('✅ Push subscription successful');
      } catch (error) {
        console.error('❌ Push subscription failed:', error);
      }
    } else {
      console.warn('❗ Push messaging is not supported in this browser.');
    }
  }, []);

  return { subscribeToPush };
}

// Converts VAPID public key from base64 string to UInt8Array
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map(char => char.charCodeAt(0)));
}
