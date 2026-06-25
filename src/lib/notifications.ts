import { toast } from 'sonner';

// Prompts device for native web notification permissions
export const setupNotifications = async (): Promise<boolean> => {
  if (typeof window === 'undefined') return false;
  if (!('Notification' in window)) {
    console.warn("Device platform does not support HTML5 Push Notifications.");
    return false;
  }

  try {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  } catch (e) {
    console.warn("Requesting notification permissions was blocked by iframe boundaries.", e);
    return false;
  }
};

// Dispatches a notification to the device and triggers a high-fidelity toast fallback
export const sendAppNotification = (title: string, message: string, icon?: string) => {
  if (typeof window === 'undefined') return;

  // Always render a beautiful, highly stylized in-app Sonner toast first
  const displayIcon = icon || '🔔';
  toast(`${displayIcon} ${title}`, {
    description: message,
    duration: 5000,
  });

  // Attempt to fire native push notifications if granted and permitted by sandbox context
  try {
    if ('Notification' in window && Notification.permission === 'granted') {
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.ready.then((reg) => {
          reg.showNotification(title, {
            body: message,
            tag: 'paytitan-notification',
            icon: '/assets/icon-192.png'
          });
        });
      } else {
        new Notification(title, {
          body: message,
          icon: '/assets/icon-192.png'
        });
      }
    }
  } catch (e) {
    console.warn("Native push notification was restricted by the browser preview container.", e);
  }
};
