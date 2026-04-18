/** Mirrors `DashboardStats` / `Activity` from useDashboardData (kept local to avoid import cycles). */
export const SHOWCASE_DASHBOARD_STATS = {
  clients: { total: 12, active: 9 },
  reports: { total: 28, completed: 24, recent: 4 },
  newsletters: { total: 6, published: 4, recent: 2 },
  integration: {
    status: "connected",
    yuki_connected: true,
    email_connected: true,
  },
  system_health: { score: 88, status: "operational" },
};

export const SHOWCASE_RECENT_ACTIVITY = [
  {
    id: "s1",
    type: "report",
    title: "Q4 consolidated report",
    description: "Generated and shared with client",
    timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    status: "completed",
  },
  {
    id: "s2",
    type: "email",
    title: "Invoice reminder batch",
    description: "Scheduled send",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
    status: "pending",
  },
  {
    id: "s3",
    type: "system",
    title: "Yuki sync",
    description: "Balances updated",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString(),
    status: "completed",
  },
  {
    id: "s4",
    type: "newsletter",
    title: "Monthly client update",
    description: "Draft ready for review",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 50).toISOString(),
    status: "draft",
  },
] as const;
