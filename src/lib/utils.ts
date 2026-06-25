import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { toast } from "sonner";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Triggers the device haptic vibration motor safely
export function hapticFeedback(type: 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error' | 'keypad' | string = 'light') {
  if (typeof window === 'undefined' || !navigator.vibrate) return;
  
  try {
    switch (type) {
      case 'light':
      case 'keypad':
        navigator.vibrate(15);
        break;
      case 'medium':
        navigator.vibrate(30);
        break;
      case 'heavy':
        navigator.vibrate(60);
        break;
      case 'success':
        navigator.vibrate([30, 40, 30]);
        break;
      case 'warning':
        navigator.vibrate([50, 100, 50]);
        break;
      case 'error':
        navigator.vibrate([100, 50, 100]);
        break;
      default:
        navigator.vibrate(20);
    }
  } catch (e) {
    console.debug("Haptic vibration blocked or unsupported.", e);
  }
}

// Uses native device share sheet if supported, otherwise copies to clipboard with toast feedback
export async function safeShare(data: { title: string; text: string; url?: string }, fallbackMessage?: string): Promise<boolean | string> {
  if (typeof window === 'undefined') return false;
  
  if (navigator.share) {
    try {
      await navigator.share(data);
      return true;
    } catch (e) {
      if ((e as Error).name !== 'AbortError') {
        console.warn("Native share failure:", e);
      } else {
        return false;
      }
    }
  }

  // Clipboard copy fallback
  try {
    const copyText = `${data.title}\n${data.text}${data.url ? `\n${data.url}` : ''}`;
    await navigator.clipboard.writeText(copyText);
    toast.success(fallbackMessage || "Copied receipt details to clipboard!");
    return 'copied';
  } catch (e) {
    console.error("Clipboard copy failure:", e);
    return false;
  }
}

// Cleans numeric inputs, stripping any invalid character and preserving only a single optional decimal point
export function cleanNumericalInput(val: string): string {
  let sanitized = val.replace(/[^0-9.]/g, '');
  const parts = sanitized.split('.');
  if (parts.length > 2) {
    sanitized = parts[0] + '.' + parts.slice(1).join('');
  }
  return sanitized;
}
