"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { billAPI } from "@/lib/api/bill.api";
import { useAuth } from "@/context/auth-context";

interface NotificationContextType {
  unreadCount: number;
  refresh: () => void;
}

const NotificationContext = createContext<NotificationContextType>({
  unreadCount: 0,
  refresh: () => {},
});

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchCount = () => {
    if (!user) return;
    billAPI
      .getMyBills()
      .then((r) => {
        const pending = (r.data ?? []).filter(
          (b: any) => b.status === "pending" || b.status === "overdue",
        );
        setUnreadCount(pending.length);
      })
      .catch(() => {});
  };

  useEffect(() => {
    fetchCount();
  }, [user]);

  return (
    <NotificationContext.Provider value={{ unreadCount, refresh: fetchCount }}>
      {children}
    </NotificationContext.Provider>
  );
}

export const useNotification = () => useContext(NotificationContext);
