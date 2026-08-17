/**
 * Notification Service for WaitingRoom
 * In-app toasts, notification center queue, browser desktop alerts, and sound effects.
 */

export class NotificationService {
  constructor() {
    this.notifications = [];
    this.unreadCount = 0;
    this.listeners = new Set();
    this.toastContainer = null;
  }

  init() {
    this.toastContainer = document.getElementById('toast-container');
    if ('Notification' in window && Notification.permission === 'default') {
      // Notification permission can be requested on user interaction
    }
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  _notifyListeners() {
    for (const l of this.listeners) l(this.notifications);
  }

  async requestBrowserPermission() {
    if ('Notification' in window && Notification.permission === 'default') {
      return await Notification.requestPermission();
    }
    return Notification.permission;
  }

  notify(notification) {
    const item = {
      id: notification.id || `notif_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      title: notification.title,
      body: notification.body,
      itemId: notification.itemId || null,
      type: notification.type || 'INFO',
      timestamp: notification.timestamp || new Date().toISOString(),
      read: false
    };

    this.notifications.unshift(item);
    this.unreadCount++;
    this._notifyListeners();

    // Show visual toast
    this.showToast(item);

    // Browser Notification if granted
    if ('Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(item.title, {
          body: item.body,
          icon: '/favicon.ico'
        });
      } catch (e) {
        console.warn('Desktop notification failed', e);
      }
    }

    return item;
  }

  showToast(notif) {
    if (!this.toastContainer) {
      this.toastContainer = document.getElementById('toast-container');
    }
    if (!this.toastContainer) return;

    const toast = document.createElement('div');
    toast.className = 'flex items-start gap-3 p-4 bg-slate-900 border border-indigo-500/30 text-slate-100 rounded-xl shadow-2xl backdrop-blur-md transition-all transform duration-300 translate-y-2 opacity-0 max-w-sm pointer-events-auto';
    
    let icon = 'notifications';
    let iconColor = 'text-indigo-400';
    if (notif.type === 'FOLLOW_UP_DUE') {
      icon = 'alarm';
      iconColor = 'text-amber-400';
    } else if (notif.type === 'ESCALATION') {
      icon = 'warning';
      iconColor = 'text-red-400';
    } else if (notif.type === 'SUCCESS') {
      icon = 'check_circle';
      iconColor = 'text-emerald-400';
    }

    toast.innerHTML = `
      <span class="material-symbols-outlined ${iconColor} text-xl mt-0.5">${icon}</span>
      <div class="flex-1">
        <div class="font-semibold text-sm text-slate-100">${notif.title}</div>
        <div class="text-xs text-slate-400 mt-0.5">${notif.body}</div>
      </div>
      <button class="text-slate-500 hover:text-slate-300 text-xs material-symbols-outlined" onclick="this.parentElement.remove()">close</button>
    `;

    this.toastContainer.appendChild(toast);

    // Animate in
    requestAnimationFrame(() => {
      toast.classList.remove('translate-y-2', 'opacity-0');
      toast.classList.add('translate-y-0', 'opacity-100');
    });

    // Auto dismiss after 5s
    setTimeout(() => {
      toast.classList.add('opacity-0', 'translate-y-2');
      setTimeout(() => toast.remove(), 300);
    }, 5000);
  }

  markAllAsRead() {
    this.notifications.forEach(n => n.read = true);
    this.unreadCount = 0;
    this._notifyListeners();
  }

  clearAll() {
    this.notifications = [];
    this.unreadCount = 0;
    this._notifyListeners();
  }
}
