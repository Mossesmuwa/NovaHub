// pages/account/profile.js
// Public user profile page with lists showcase

import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Layout from "../../components/Layout";
import SEO from "../../components/SEO";
import Link from "next/link";
import { supabase } from "../../lib/supabase";

export default function ProfilePage() {
  const router = useRouter();
  const { id } = router.query;

  const [profile, setProfile] = useState(null);
  const [lists, setLists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  // Fetch current user for edit check
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setCurrentUser(user);
    });
  }, []);

  // Fetch profile and lists
  useEffect(() => {
    if (!id) return;
    loadProfile(id);
  }, [id]);

  async function loadProfile(userId) {
    setLoading(true);
    setError(null);

    try {
      // Fetch profile
      const { data: profileData, error: profileErr } = await supabase
        .from("profiles")
        .select("id, display_name, avatar_url, is_pro, created_at")
        .eq("id", userId)
        .single();

      if (profileErr || !profileData) {
        setError("Profile not found");
        return;
      }

      setProfile(profileData);

      // Fetch public lists
      const { data: listsData, error: listsErr } = await supabase
        .from("lists")
        .select(
          "id, name, description, is_public, created_at, (select count(*) from list_items where list_id = lists.id) as item_count",
        )
        .eq("user_id", userId)
        .eq("is_public", true)
        .order("created_at", { ascending: false });

      if (!listsErr) {
        setLists(listsData || []);
      }
    } catch (err) {
      console.error("Error loading profile:", err);
      setError("Failed to load profile");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <Layout>
        <SEO title="Profile" />
        <div style={{ padding: "40px 20px", textAlign: "center" }}>
          Loading profile...
        </div>
      </Layout>
    );
  }

  if (error || !profile) {
    return (
      <Layout>
        <SEO title="Profile Not Found" />
        <div
          style={{
            padding: "40px 20px",
            textAlign: "center",
            color: "var(--text-secondary)",
          }}
        >
          <p>{error || "Profile not found"}</p>
          <Link
            href="/discover"
            style={{
              color: "var(--accent)",
              textDecoration: "none",
              marginTop: "20px",
              display: "inline-block",
            }}
          >
            ← Back to Discover
          </Link>
        </div>
      </Layout>
    );
  }

  const isOwnProfile = currentUser?.id === profile.id;
  const joinedDate = profile.created_at
    ? new Date(profile.created_at).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
      })
    : "";

  return (
    <Layout>
      <SEO title={`${profile.display_name || "Profile"} - NovaHub`} />

      <div
        style={{
          maxWidth: "900px",
          margin: "0 auto",
          padding: "40px 20px",
          color: "var(--text-primary)",
        }}
      >
        {/* Profile Header */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: "30px",
            marginBottom: "60px",
            paddingBottom: "40px",
            borderBottom: "1px solid var(--border)",
          }}
        >
          {/* Avatar */}
          <div
            style={{
              flexShrink: 0,
            }}
          >
            {profile.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={profile.display_name}
                style={{
                  width: "120px",
                  height: "120px",
                  borderRadius: "50%",
                  objectFit: "cover",
                  border: "2px solid var(--accent)",
                }}
              />
            ) : (
              <div
                style={{
                  width: "120px",
                  height: "120px",
                  borderRadius: "50%",
                  background: "var(--surface)",
                  border: "2px solid var(--border)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "var(--text-secondary)",
                  fontSize: "48px",
                }}
              >
                ◆
              </div>
            )}
          </div>

          {/* Profile Info */}
          <div style={{ flex: 1 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                marginBottom: "8px",
              }}
            >
              <h1
                style={{
                  fontSize: "28px",
                  fontWeight: "800",
                  margin: "0",
                  color: "var(--text-primary)",
                }}
              >
                {profile.display_name || "Anonymous"}
              </h1>
              {profile.is_pro && (
                <span
                  style={{
                    background: "linear-gradient(140deg, #E8C97A, #C9A84C)",
                    color: "#09090C",
                    padding: "4px 12px",
                    borderRadius: "20px",
                    fontSize: "12px",
                    fontWeight: "700",
                    letterSpacing: "0.5px",
                  }}
                >
                  PRO ✦
                </span>
              )}
            </div>

            <p
              style={{
                color: "var(--text-secondary)",
                fontSize: "14px",
                margin: "0 0 16px 0",
              }}
            >
              Joined {joinedDate}
            </p>

            {isOwnProfile && (
              <Link
                href="/account/dashboard"
                style={{
                  display: "inline-block",
                  padding: "8px 16px",
                  background: "var(--accent)",
                  color: "#09090C",
                  borderRadius: "6px",
                  textDecoration: "none",
                  fontSize: "14px",
                  fontWeight: "600",
                }}
              >
                Edit Profile
              </Link>
            )}
          </div>
        </div>

        {/* Public Lists */}
        <div>
          <h2
            style={{
              fontSize: "20px",
              fontWeight: "700",
              marginBottom: "24px",
              color: "var(--text-primary)",
            }}
          >
            Public Lists ({lists.length})
          </h2>

          {lists.length === 0 ? (
            <p style={{ color: "var(--text-secondary)", fontSize: "14px" }}>
              No public lists yet
            </p>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                gap: "20px",
              }}
            >
              {lists.map((list) => (
                <Link
                  key={list.id}
                  href={`/list/${list.id}`}
                  style={{
                    padding: "20px",
                    background: "var(--surface)",
                    border: "1px solid var(--border)",
                    borderRadius: "12px",
                    textDecoration: "none",
                    color: "inherit",
                    transition: "all 0.2s",
                    cursor: "pointer",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "var(--accent)";
                    e.currentTarget.style.transform = "translateY(-4px)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "var(--border)";
                    e.currentTarget.style.transform = "translateY(0)";
                  }}
                >
                  <h3
                    style={{
                      fontSize: "16px",
                      fontWeight: "700",
                      margin: "0 0 8px 0",
                      color: "var(--text-primary)",
                    }}
                  >
                    {list.name}
                  </h3>
                  {list.description && (
                    <p
                      style={{
                        fontSize: "13px",
                        color: "var(--text-secondary)",
                        margin: "0 0 12px 0",
                        lineHeight: "1.4",
                      }}
                    >
                      {list.description}
                    </p>
                  )}
                  <span
                    style={{
                      fontSize: "12px",
                      color: "var(--text-secondary)",
                    }}
                  >
                    {list.item_count || 0} item
                    {list.item_count !== 1 ? "s" : ""}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
