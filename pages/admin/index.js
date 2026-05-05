// pages/admin/index.js - Nova Admin Platform (Main Entry)
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { supabase } from "../../lib/supabase";
import AdminLayout from "../../components/AdminLayout";
import OverviewTab from "../../components/admin/OverviewTab";
import ProvidersTab from "../../components/admin/ProvidersTab";
import IntelligenceTab from "../../components/admin/IntelligenceTab";
import SecurityTab from "../../components/admin/SecurityTab";
import SettingsTab from "../../components/admin/SettingsTab";

export default function AdminDashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [stats, setStats] = useState({
    totalItems: 0,
    approvedItems: 0,
    pendingItems: 0,
    totalUsers: 0,
    proUsers: 0,
    bySource: [],
    byCategory: [],
  });
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();
    if (!authUser) {
      router.replace("/account/login");
      return;
    }
    setUser(authUser);

    const { data: profile } = await supabase
      .from("profiles")
      .select("is_admin,display_name,avatar_url")
      .eq("id", authUser.id)
      .single();

    if (!profile?.is_admin) {
      router.replace("/");
      return;
    }

    setProfile(profile);
    setAuthLoading(false);
    loadStats();
  }

  async function loadStats() {
    const [itemsRes, usersRes, sourceRes, catRes] = await Promise.all([
      supabase.from("items").select("id, approved"),
      supabase.from("profiles").select("id, is_pro"),
      supabase.from("items").select("source_name").eq("approved", true),
      supabase.from("items").select("category_id").eq("approved", true),
    ]);

    const items = itemsRes.data || [];
    const users = usersRes.data || [];
    const sourceData = sourceRes.data || [];
    const catData = catRes.data || [];

    const bySource = Object.entries(
      sourceData.reduce((a, r) => {
        a[r.source_name] = (a[r.source_name] || 0) + 1;
        return a;
      }, {}),
    ).sort((a, b) => b[1] - a[1]);

    const byCategory = Object.entries(
      catData.reduce((a, r) => {
        a[r.category_id] = (a[r.category_id] || 0) + 1;
        return a;
      }, {}),
    ).sort((a, b) => b[1] - a[1]);

    setStats({
      totalItems: items.length,
      approvedItems: items.filter((i) => i.approved).length,
      pendingItems: items.filter((i) => !i.approved).length,
      totalUsers: users.length,
      proUsers: users.filter((u) => u.is_pro).length,
      bySource,
      byCategory,
    });
  }

  if (authLoading) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          background: "#09090C",
          color: "#F2F2F7",
        }}
      >
        <div>Loading...</div>
      </div>
    );
  }

  const tabs = [
    { id: "overview", label: "📊 Overview" },
    { id: "providers", label: "⚙️ Providers" },
    { id: "intelligence", label: "🧠 Intelligence" },
    { id: "security", label: "🔒 Security" },
    { id: "settings", label: "⚡ Settings" },
  ];

  return (
    <AdminLayout profile={profile}>
      {/* Tab Navigation */}
      <div
        style={{
          display: "flex",
          gap: 8,
          marginBottom: 32,
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          paddingBottom: 16,
          flexWrap: "wrap",
        }}
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: "8px 16px",
              borderRadius: 8,
              border:
                activeTab === tab.id
                  ? "1px solid #C9A84C"
                  : "1px solid transparent",
              background:
                activeTab === tab.id ? "rgba(201,168,76,0.15)" : "transparent",
              color: activeTab === tab.id ? "#C9A84C" : "#636366",
              fontSize: 12,
              fontWeight: 700,
              cursor: "pointer",
              transition: "all 0.2s",
            }}
          >
            {tab.label}
          </button>
        ))}
        <button
          onClick={() => {
            loadStats();
            setRefreshKey((k) => k + 1);
          }}
          style={{
            marginLeft: "auto",
            padding: "8px 12px",
            borderRadius: 8,
            border: "1px solid rgba(255,255,255,0.06)",
            background: "transparent",
            color: "#636366",
            cursor: "pointer",
            fontSize: 12,
          }}
        >
          🔄 Refresh
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === "overview" && <OverviewTab stats={stats} />}
      {activeTab === "providers" && (
        <ProvidersTab key={refreshKey} onRefresh={loadStats} />
      )}
      {activeTab === "intelligence" && (
        <IntelligenceTab onRefresh={loadStats} />
      )}
      {activeTab === "security" && <SecurityTab />}
      {activeTab === "settings" && <SettingsTab />}
    </AdminLayout>
  );
}
