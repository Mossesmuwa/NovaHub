// components/AddToList.js
// NovaHub — Add Item to List component
// Shows a dropdown of the user's lists and lets them add the current item.
// Pro users only — shows upgrade prompt for free users.

import { useState, useEffect, useRef } from "react";
import { supabase } from "../lib/supabase";

export default function AddToList({ itemId, itemName }) {
  const [open, setOpen] = useState(false);
  const [lists, setLists] = useState([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({}); // { listId: 'added' | 'exists' | 'error' }
  const [isPro, setIsPro] = useState(false);
  const [user, setUser] = useState(null);
  const [creating, setCreating] = useState(false);
  const [newListName, setNewListName] = useState("");
  const ref = useRef(null);

  // Close on outside click
  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      if (user) loadUserData(user.id);
    });
  }, []);

  async function loadUserData(userId) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("is_pro")
      .eq("id", userId)
      .single();
    setIsPro(profile?.is_pro || false);

    if (profile?.is_pro) {
      loadLists(userId);
    }
  }

  async function loadLists(userId) {
    setLoading(true);
    const { data } = await supabase
      .from("lists")
      .select("id, name")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    setLists(data || []);
    setLoading(false);
  }

  async function addToList(listId) {
    if (!user || !itemId) return;

    try {
      const { error } = await supabase
        .from("list_items")
        .insert({ list_id: listId, item_id: itemId });

      if (error) {
        if (error.code === "23505") {
          setStatus((s) => ({ ...s, [listId]: "exists" }));
        } else {
          setStatus((s) => ({ ...s, [listId]: "error" }));
        }
      } else {
        setStatus((s) => ({ ...s, [listId]: "added" }));
      }
    } catch {
      setStatus((s) => ({ ...s, [listId]: "error" }));
    }

    // Clear status after 2s
    setTimeout(() => {
      setStatus((s) => {
        const next = { ...s };
        delete next[listId];
        return next;
      });
    }, 2000);
  }

  async function createList() {
    if (!newListName.trim() || !user) return;
    setLoading(true);

    const { data, error } = await supabase
      .from("lists")
      .insert({ name: newListName.trim(), user_id: user.id })
      .select()
      .single();

    if (!error && data) {
      setLists((l) => [data, ...l]);
      setNewListName("");
      setCreating(false);
      // Auto-add item to the new list
      await addToList(data.id);
    }
    setLoading(false);
  }

  // Not logged in
  if (!user) {
    return (
      <div className="atl-wrap" ref={ref}>
        <button
          className="atl-trigger"
          onClick={() => (window.location.href = "/auth/login")}
        >
          + Add to list
        </button>
      </div>
    );
  }

  // Free user
  if (!isPro) {
    return (
      <div className="atl-wrap" ref={ref}>
        <button
          className="atl-trigger atl-trigger--locked"
          onClick={() => (window.location.href = "/pro")}
        >
          + Add to list <span className="pro-tag">Pro</span>
        </button>
      </div>
    );
  }

  return (
    <div className="atl-wrap" ref={ref}>
      <button
        className={`atl-trigger ${open ? "atl-trigger--open" : ""}`}
        onClick={() => setOpen((o) => !o)}
      >
        + Add to list
      </button>

      {open && (
        <div className="atl-dropdown">
          <div className="atl-header">Save to list</div>

          {loading && <div className="atl-loading">Loading...</div>}

          {!loading && lists.length === 0 && !creating && (
            <div className="atl-empty">No lists yet.</div>
          )}

          {!loading &&
            lists.map((list) => {
              const s = status[list.id];
              return (
                <button
                  key={list.id}
                  className={`atl-list-item ${s ? `atl-list-item--${s}` : ""}`}
                  onClick={() => addToList(list.id)}
                  disabled={!!s}
                >
                  <span className="list-name">{list.name}</span>
                  <span className="list-action">
                    {s === "added"
                      ? "Added!"
                      : s === "exists"
                        ? "Already in list"
                        : s === "error"
                          ? "Error"
                          : "+"}
                  </span>
                </button>
              );
            })}

          {creating ? (
            <div className="atl-create">
              <input
                autoFocus
                type="text"
                placeholder="List name..."
                value={newListName}
                onChange={(e) => setNewListName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && createList()}
                className="atl-input"
                maxLength={60}
              />
              <div className="atl-create-actions">
                <button
                  className="btn-create-confirm"
                  onClick={createList}
                  disabled={loading}
                >
                  Create
                </button>
                <button
                  className="btn-create-cancel"
                  onClick={() => setCreating(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button className="atl-new-list" onClick={() => setCreating(true)}>
              + New list
            </button>
          )}
        </div>
      )}

      <style jsx>{`
        .atl-wrap {
          position: relative;
          display: inline-block;
        }
        .atl-trigger {
          background: transparent;
          border: 1px solid var(--border, #333);
          color: var(--text-secondary, #aaa);
          padding: 8px 16px;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.15s;
          display: flex;
          align-items: center;
          gap: 6px;
          white-space: nowrap;
        }
        .atl-trigger:hover,
        .atl-trigger--open {
          border-color: var(--accent, #7c3aed);
          color: var(--text-primary, #fff);
        }
        .atl-trigger--locked {
          opacity: 0.7;
        }
        .pro-tag {
          background: var(--accent, #7c3aed);
          color: #fff;
          font-size: 9px;
          font-weight: 700;
          padding: 1px 5px;
          border-radius: 3px;
          letter-spacing: 0.05em;
        }
        .atl-dropdown {
          position: absolute;
          top: calc(100% + 8px);
          left: 0;
          min-width: 220px;
          background: var(--surface-elevated, #1a1a1a);
          border: 1px solid var(--border, #2a2a2a);
          border-radius: 12px;
          overflow: hidden;
          z-index: 100;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
        }
        .atl-header {
          padding: 12px 16px 8px;
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: var(--text-secondary, #666);
          border-bottom: 1px solid var(--border, #222);
        }
        .atl-loading,
        .atl-empty {
          padding: 16px;
          font-size: 13px;
          color: var(--text-secondary, #666);
          text-align: center;
        }
        .atl-list-item {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 11px 16px;
          background: transparent;
          border: none;
          cursor: pointer;
          transition: background 0.1s;
          text-align: left;
        }
        .atl-list-item:hover {
          background: var(--surface, #111);
        }
        .atl-list-item:disabled {
          cursor: default;
        }
        .list-name {
          font-size: 14px;
          color: var(--text-primary, #fff);
          font-weight: 500;
          truncate: true;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          max-width: 140px;
        }
        .list-action {
          font-size: 12px;
          color: var(--text-secondary, #666);
          flex-shrink: 0;
        }
        .atl-list-item--added .list-action {
          color: #22c55e;
        }
        .atl-list-item--exists .list-action {
          color: var(--text-secondary, #888);
        }
        .atl-list-item--error .list-action {
          color: #ef4444;
        }
        .atl-create {
          padding: 12px 16px;
          border-top: 1px solid var(--border, #222);
        }
        .atl-input {
          width: 100%;
          background: var(--surface, #111);
          border: 1px solid var(--border, #333);
          border-radius: 6px;
          padding: 8px 10px;
          font-size: 13px;
          color: var(--text-primary, #fff);
          outline: none;
          box-sizing: border-box;
          margin-bottom: 8px;
        }
        .atl-input:focus {
          border-color: var(--accent, #7c3aed);
        }
        .atl-create-actions {
          display: flex;
          gap: 8px;
        }
        .btn-create-confirm {
          flex: 1;
          background: var(--accent, #7c3aed);
          color: #fff;
          border: none;
          border-radius: 6px;
          padding: 7px 0;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
        }
        .btn-create-confirm:disabled {
          opacity: 0.5;
        }
        .btn-create-cancel {
          flex: 1;
          background: transparent;
          color: var(--text-secondary, #888);
          border: 1px solid var(--border, #333);
          border-radius: 6px;
          padding: 7px 0;
          font-size: 13px;
          cursor: pointer;
        }
        .atl-new-list {
          width: 100%;
          padding: 11px 16px;
          background: transparent;
          border: none;
          border-top: 1px solid var(--border, #222);
          color: var(--accent, #7c3aed);
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          text-align: left;
          transition: background 0.1s;
        }
        .atl-new-list:hover {
          background: var(--surface, #111);
        }
      `}</style>
    </div>
  );
}
