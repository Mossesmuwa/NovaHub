import { useState, useEffect } from "react";
import Layout from "../../components/Layout";
import SEO from "../../components/SEO";
import Link from "next/link";
import { useRouter } from "next/router";
import { supabase } from "../../lib/supabase";
import * as Auth from "../../lib/auth";
import * as Favorites from "../../lib/favorites";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [tab, setTab] = useState("favorites");
  const [favs, setFavs] = useState([]);
  const [lists, setLists] = useState([]);
  const [sName, setSName] = useState("");
  const [sBio, setSBio] = useState("");
  const [sWeb, setSWeb] = useState("");
  const [profileMsg, setProfileMsg] = useState("");
  const [pw, setPw] = useState("");
  const [pwMsg, setPwMsg] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const {
        data: { user: u },
      } = await supabase.auth.getUser();
      if (!u) {
        router.replace("/account/login?return=/account/dashboard");
        return;
      }
      setUser(u);

      const { data: p } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", u.id)
        .single();

      if (p) {
        setProfile(p);
        setSName(p.display_name || "");
        setSBio(p.bio || "");
        setSWeb(p.website || "");
      }

      const items = await Favorites.getAllFavorites();
      setFavs(items || []);

      const { data: ls } = await supabase
        .from("lists")
        .select("*")
        .eq("user_id", u.id)
        .order("created_at", { ascending: false });
      setLists(ls || []);

      setLoading(false);
    })();
  }, []);

  const displayName =
    profile?.display_name || user?.email?.split("@")[0] || "User";
  const initial = displayName.charAt(0).toUpperCase();

  async function removeSaved(itemId) {
    await Favorites.removeFavorite(itemId);
    setFavs((prev) => prev.filter((i) => i.id !== itemId));
  }

  async function createList() {
    const n = prompt("Name your new list:");
    if (!n?.trim() || !user) return;
    await supabase.from("lists").insert({ user_id: user.id, name: n.trim() });
    const { data } = await supabase
      .from("lists")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    setLists(data || []);
  }

  async function saveProfile() {
    if (!user) return;
    const { error } = await supabase
      .from("profiles")
      .update({
        display_name: sName,
        bio: sBio,
        website: sWeb,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);
    setProfileMsg(error ? "Error saving. Try again." : "✦ Saved!");
    setTimeout(() => setProfileMsg(""), 3000);
  }

  async function changePassword() {
    if (pw.length < 8) {
      setPwMsg("Password must be at least 8 characters.");
      return;
    }
    const { error } = await supabase.auth.updateUser({ password: pw });
    setPwMsg(error ? error.message : "✦ Password updated!");
    if (!error) setPw("");
    setTimeout(() => setPwMsg(""), 3000);
  }

  function FavCard({ item }) {
    const href = `/item/${encodeURIComponent(item.slug || item.id)}`;
    const isPoster = ["movie", "book", "game", "tv"].includes(item.type);
    const isFree = (item.pricing || "").toLowerCase().includes("free");

    if (isPoster) {
      return (
        <div style={{ position: "relative" }}>
          <Link href={href} className="card-poster">
            <div
              className="bg-zoom"
              style={{ backgroundImage: `url('${item.image || ""}')` }}
            />
            <div className="card-poster-content">
              <div className="card-poster-title">{item.name}</div>
              {item.rating && (
                <div className="card-poster-rating">★ {item.rating}</div>
              )}
            </div>
          </Link>
          <button
            className="remove-btn"
            onClick={() => removeSaved(item.id)}
            title="Remove"
          >
            ✕
          </button>
        </div>
      );
    }

    return (
      <div
        className="card"
        style={{ position: "relative", cursor: "pointer" }}
        onClick={() => router.push(href)}
      >
        <button
          className="remove-btn"
          onClick={(e) => {
            e.stopPropagation();
            removeSaved(item.id);
          }}
          title="Remove"
        >
          ✕
        </button>
        <div className="card-icon">{(item.name || "?").charAt(0)}</div>
        <div className="card-title">{item.name}</div>
        {item.pricing && (
          <span
            className={isFree ? "tag-free" : "tag-paid"}
            style={{ display: "inline-block", marginBottom: 8 }}
          >
            {item.pricing}
          </span>
        )}
        <p className="card-desc">{item.short_desc || ""}</p>
      </div>
    );
  }

  if (loading)
    return (
      <Layout>
        <SEO title="Dashboard — NovaHub" />
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "60vh",
            flexDirection: "column",
            gap: 16,
          }}
        >
          <div
            style={{
              width: 32,
              height: 32,
              border: "2px solid var(--border2)",
              borderTopColor: "var(--gold)",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
            }}
          />
          <span style={{ color: "var(--t3)", fontSize: 14 }}>
            Loading your dashboard…
          </span>
        </div>
      </Layout>
    );

  const TABS = [
    { key: "favorites", icon: "♥", label: "Saved" },
    { key: "lists", icon: "◫", label: "Lists" },
    { key: "settings", icon: "◎", label: "Settings" },
  ];

  return (
    <Layout>
      <SEO title="Dashboard — NovaHub" />

      {/* ── Header ── */}
      <div className="dash-header">
        <div className="dash-bg" />
        <div className="container" style={{ position: "relative", zIndex: 1 }}>
          <div
            style={{
              display: "flex",
              alignItems: "flex-end",
              gap: 20,
              flexWrap: "wrap",
            }}
          >
            <div className="avatar-lg">{initial}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="dash-name">{displayName}</div>
              <div className="dash-email">{user?.email}</div>
            </div>
          </div>

          <div className="dash-stats" style={{ marginTop: 24 }}>
            <div className="dash-stat">
              <span className="dash-stat-num">{favs.length}</span>
              <div className="dash-stat-label">Saved</div>
            </div>
            <div className="dash-stat">
              <span className="dash-stat-num">{lists.length}</span>
              <div className="dash-stat-label">Lists</div>
            </div>
            <div className="dash-stat">
              <span className="dash-stat-num">
                {user?.created_at
                  ? new Date(user.created_at).getFullYear()
                  : "—"}
              </span>
              <div className="dash-stat-label">Member since</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Tabs + Content ── */}
      <div style={{ paddingBottom: 80 }}>
        <div className="container">
          {/* Tab bar */}
          <div className="dash-tabs">
            {TABS.map((t) => (
              <button
                key={t.key}
                className={`dash-tab${tab === t.key ? " active" : ""}`}
                onClick={() => setTab(t.key)}
              >
                <span style={{ marginRight: 6, fontSize: 14 }}>{t.icon}</span>
                {t.label}
              </button>
            ))}
          </div>

          {/* ── Saved items ── */}
          {tab === "favorites" && (
            <div style={{ minHeight: 200 }}>
              {favs.length === 0 ? (
                <div className="empty-state">
                  <span className="empty-icon">♡</span>
                  <h3>Nothing saved yet</h3>
                  <p>Browse NovaHub and tap the heart on anything you love.</p>
                  <Link href="/" className="btn-primary">
                    Start Discovering
                  </Link>
                </div>
              ) : (
                <>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: 20,
                    }}
                  >
                    <p style={{ color: "var(--t3)", fontSize: 13 }}>
                      <span style={{ color: "var(--gold)", fontWeight: 700 }}>
                        {favs.length}
                      </span>{" "}
                      saved item{favs.length !== 1 ? "s" : ""}
                    </p>
                    <Link
                      href="/account/favorites"
                      style={{
                        fontSize: 13,
                        color: "var(--gold)",
                        fontWeight: 600,
                      }}
                    >
                      View all →
                    </Link>
                  </div>
                  <div
                    className={
                      favs.some((i) =>
                        ["movie", "book", "game", "tv"].includes(i.type),
                      )
                        ? "grid-4"
                        : "grid-3"
                    }
                  >
                    {favs.slice(0, 12).map((item) => (
                      <FavCard key={item.id} item={item} />
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {/* ── Lists ── */}
          {tab === "lists" && (
            <div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 20,
                  flexWrap: "wrap",
                  gap: 10,
                }}
              >
                <div>
                  <h3
                    style={{ fontSize: 18, fontWeight: 800, marginBottom: 2 }}
                  >
                    My Lists
                  </h3>
                  <p style={{ fontSize: 13, color: "var(--t3)" }}>
                    Curate and share collections
                  </p>
                </div>
                <button
                  className="btn-primary"
                  style={{ fontSize: 13, padding: "9px 18px", width: "auto" }}
                  onClick={createList}
                >
                  + New List
                </button>
              </div>

              {lists.length === 0 ? (
                <div className="empty-state">
                  <span className="empty-icon">◫</span>
                  <h3>No lists yet</h3>
                  <p>Create curated lists to organise and share your finds.</p>
                  <button className="btn-primary" onClick={createList}>
                    Create First List
                  </button>
                </div>
              ) : (
                <div className="grid-3">
                  {lists.map((l) => (
                    <div className="card" key={l.id}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          marginBottom: 10,
                        }}
                      >
                        <div className="card-icon" style={{ margin: 0 }}>
                          ◫
                        </div>
                        <span
                          style={{
                            fontSize: 11,
                            padding: "2px 8px",
                            borderRadius: 99,
                            background: "var(--surf)",
                            border: "1px solid var(--border)",
                            color: "var(--t3)",
                          }}
                        >
                          {l.is_public ? "🌍 Public" : "🔒 Private"}
                        </span>
                      </div>
                      <div className="card-title">{l.name}</div>
                      <p className="card-desc">
                        {l.description || "No description"} &middot;{" "}
                        {l.item_count || 0} items
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── Settings ── */}
          {tab === "settings" && (
            <div style={{ maxWidth: 560 }}>
              {/* Profile */}
              <div className="settings-card">
                <h3>Profile</h3>
                <div className="form-group">
                  <label className="form-label">Display Name</label>
                  <input
                    className="form-input"
                    type="text"
                    value={sName}
                    onChange={(e) => setSName(e.target.value)}
                    placeholder="Your name"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Bio</label>
                  <input
                    className="form-input"
                    type="text"
                    value={sBio}
                    onChange={(e) => setSBio(e.target.value)}
                    placeholder="Tell people about yourself"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Website</label>
                  <input
                    className="form-input"
                    type="url"
                    value={sWeb}
                    onChange={(e) => setSWeb(e.target.value)}
                    placeholder="https://yoursite.com"
                  />
                </div>
                <button
                  className="btn-primary"
                  style={{
                    fontSize: 13,
                    padding: "10px 22px",
                    width: "auto",
                    display: "inline-flex",
                  }}
                  onClick={saveProfile}
                >
                  Save Changes
                </button>
                {profileMsg && (
                  <div
                    style={{
                      marginTop: 10,
                      fontSize: 13,
                      color: profileMsg.includes("Error")
                        ? "#FF453A"
                        : "#30D158",
                    }}
                  >
                    {profileMsg}
                  </div>
                )}
              </div>

              {/* Password */}
              <div className="settings-card">
                <h3>Change Password</h3>
                <div className="form-group">
                  <label className="form-label">New Password</label>
                  <input
                    className="form-input"
                    type="password"
                    value={pw}
                    onChange={(e) => setPw(e.target.value)}
                    placeholder="At least 8 characters"
                  />
                </div>
                <button
                  className="btn-primary"
                  style={{
                    fontSize: 13,
                    padding: "10px 22px",
                    width: "auto",
                    display: "inline-flex",
                  }}
                  onClick={changePassword}
                >
                  Update Password
                </button>
                {pwMsg && (
                  <div
                    style={{
                      marginTop: 10,
                      fontSize: 13,
                      color: pwMsg.includes("✦") ? "#30D158" : "#FF453A",
                    }}
                  >
                    {pwMsg}
                  </div>
                )}
              </div>

              {/* Danger zone */}
              <div className="danger-zone">
                <h3>Danger Zone</h3>
                <p>Signing out will end your session on this device.</p>
                <button
                  className="btn-danger"
                  onClick={async () => {
                    await Auth.logout();
                    router.push("/");
                  }}
                >
                  Sign Out of NovaHub
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
