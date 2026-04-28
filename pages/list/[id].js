// pages/list/[id].js
// NovaHub — Public List View & Share Page

import { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { supabase } from "../../lib/supabase";

export default function ListPage() {
  const router = useRouter();
  const { id } = router.query;

  const [list, setList] = useState(null);
  const [items, setItems] = useState([]);
  const [owner, setOwner] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!id) return;
    loadList(id);
  }, [id]);

  async function loadList(listId) {
    setLoading(true);
    setError(null);

    try {
      // Fetch list + owner profile
      const { data: listData, error: listErr } = await supabase
        .from("lists")
        .select("*, profiles(display_name, avatar_url, is_pro)")
        .eq("id", listId)
        .single();

      if (listErr || !listData) {
        setError("List not found.");
        return;
      }

      setList(listData);
      setOwner(listData.profiles);

      // Fetch list items via junction table
      const { data: listItems } = await supabase
        .from("list_items")
        .select("*, items(*)")
        .eq("list_id", listId)
        .order("created_at", { ascending: true });

      setItems((listItems || []).map((li) => li.items).filter(Boolean));
    } catch (err) {
      setError("Something went wrong loading this list.");
    } finally {
      setLoading(false);
    }
  }

  function copyLink() {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (loading)
    return (
      <div className="list-page">
        <div className="loading-state">Loading list...</div>
      </div>
    );

  if (error)
    return (
      <div className="list-page">
        <div className="error-state">
          <h2>{error}</h2>
          <Link href="/">Back to Nova</Link>
        </div>
      </div>
    );

  return (
    <>
      <Head>
        <title>{list.name} — NovaHub</title>
        <meta
          name="description"
          content={list.description || `A curated list on NovaHub`}
        />
        <meta property="og:title" content={`${list.name} — NovaHub`} />
      </Head>

      <div className="list-page">
        {/* Header */}
        <header className="list-header">
          <div className="list-meta">
            {owner && (
              <div className="list-owner">
                {owner.avatar_url && (
                  <img
                    src={owner.avatar_url}
                    alt={owner.display_name}
                    className="owner-avatar"
                  />
                )}
                <span className="owner-name">
                  {owner.display_name || "Anonymous"}
                </span>
                {owner.is_pro && <span className="pro-badge">Pro</span>}
              </div>
            )}
            <div className="list-count">{items.length} items</div>
          </div>

          <h1 className="list-title">{list.name}</h1>
          {list.description && (
            <p className="list-description">{list.description}</p>
          )}

          <button className="btn-share" onClick={copyLink}>
            {copied ? "Link copied!" : "Share list"}
          </button>
        </header>

        {/* Items grid */}
        {items.length === 0 ? (
          <div className="empty-state">This list has no items yet.</div>
        ) : (
          <div className="list-grid">
            {items.map((item) => (
              <Link
                key={item.id}
                href={`/item/${item.slug}`}
                className="list-card"
              >
                {item.image && (
                  <div className="card-image">
                    <img src={item.image} alt={item.name} loading="lazy" />
                  </div>
                )}
                <div className="card-body">
                  <div className="card-category">{item.category_id}</div>
                  <h3 className="card-name">{item.name}</h3>
                  {item.short_desc && (
                    <p className="card-desc">{item.short_desc.slice(0, 100)}</p>
                  )}
                  {item.rating && (
                    <div className="card-rating">{item.rating} / 10</div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <style jsx>{`
        .list-page {
          max-width: 1000px;
          margin: 0 auto;
          padding: 60px 24px 100px;
        }
        .loading-state,
        .error-state,
        .empty-state {
          text-align: center;
          padding: 80px 0;
          color: var(--text-secondary, #888);
        }
        .error-state a {
          display: block;
          margin-top: 16px;
          color: var(--accent, #7c3aed);
          text-decoration: none;
        }
        .list-header {
          margin-bottom: 48px;
        }
        .list-meta {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 16px;
        }
        .list-owner {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          color: var(--text-secondary, #888);
        }
        .owner-avatar {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          object-fit: cover;
        }
        .owner-name {
          font-weight: 500;
        }
        .pro-badge {
          background: var(--accent, #7c3aed);
          color: #fff;
          font-size: 10px;
          font-weight: 700;
          padding: 2px 6px;
          border-radius: 4px;
          letter-spacing: 0.05em;
        }
        .list-count {
          font-size: 13px;
          color: var(--text-secondary, #666);
        }
        .list-title {
          font-size: clamp(1.8rem, 4vw, 2.6rem);
          font-weight: 800;
          color: var(--text-primary, #fff);
          margin: 0 0 12px;
          line-height: 1.1;
        }
        .list-description {
          font-size: 15px;
          color: var(--text-secondary, #aaa);
          margin: 0 0 24px;
          max-width: 600px;
        }
        .btn-share {
          background: transparent;
          border: 1px solid var(--border, #333);
          color: var(--text-secondary, #aaa);
          padding: 8px 20px;
          border-radius: 8px;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.15s;
        }
        .btn-share:hover {
          border-color: var(--text-primary, #fff);
          color: var(--text-primary, #fff);
        }
        .list-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
          gap: 20px;
        }
        .list-card {
          background: var(--surface, #111);
          border: 1px solid var(--border, #222);
          border-radius: 12px;
          overflow: hidden;
          text-decoration: none;
          transition:
            border-color 0.15s,
            transform 0.15s;
          display: block;
        }
        .list-card:hover {
          border-color: var(--accent, #7c3aed);
          transform: translateY(-2px);
        }
        .card-image {
          aspect-ratio: 16/9;
          overflow: hidden;
          background: var(--surface-elevated, #1a1a1a);
        }
        .card-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .card-body {
          padding: 16px;
        }
        .card-category {
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: var(--accent, #7c3aed);
          margin-bottom: 6px;
        }
        .card-name {
          font-size: 15px;
          font-weight: 700;
          color: var(--text-primary, #fff);
          margin: 0 0 6px;
          line-height: 1.3;
        }
        .card-desc {
          font-size: 13px;
          color: var(--text-secondary, #888);
          margin: 0 0 8px;
          line-height: 1.5;
        }
        .card-rating {
          font-size: 12px;
          color: var(--text-secondary, #666);
        }
      `}</style>
    </>
  );
}
