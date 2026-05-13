// ======================================================
// FILE: apps/admin/components/AdminLayout.js
// PURPOSE:
// Shared layout wrapper for admin pages
// ======================================================

export default function AdminLayout({ children }) {
  return (
    <div className="admin-layout">
      <aside className="sidebar">
        <h2>NovaHub Admin</h2>

        <nav>
          <a href="/dashboard">Dashboard</a>
          <a href="/users">Users</a>
          <a href="/settings">Settings</a>
        </nav>
      </aside>

      <main className="content">{children}</main>
    </div>
  );
}
