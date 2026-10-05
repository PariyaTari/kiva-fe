import { create } from "zustand";
import { Notification } from "@/types/notification.type";
import { generateID } from "@/utils/generateId";

type NotificationState = {
	notifications: Notification[];
	showNotification: (notification: Omit<Notification, "id">) => void;
	dismissNotification: (id: string) => void;
};

export const useNotificationStore = create<NotificationState>()((set, get) => ({
	notifications: [],
	showNotification: (notification) => {
		// Cancelled/aborted requests surface as "canceled" — never toast those.
		if (notification?.message === "canceled") return;

		const id = generateID();
		set((state) => ({ notifications: [...state.notifications, { id, ...notification }] }));

		setTimeout(() => get().dismissNotification(id), notification.duration ?? 5000);
	},
	dismissNotification: (id) => {
		set((state) => ({ notifications: state.notifications.filter((n) => n.id !== id) }));
	},
}));
