// pages/account/dashboard.js
// User dashboard with favorites, saved lists, and activity
import Head from 'next/head';
import Link from 'next/link';
import { useState } from 'react';
import { colors } from '@lib/design';
import Navbar from '@components/Navbar';
import Footer from '@components/Footer';

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState('favorites');
  const [userInfo] = useState({
    name: 'John Doe',
    email: 'john@example.com',
    plan: 'pro',
    joinDate: 'Jan 15, 2024',
    avatar: null,
  });

  // Mock data
  const favorites = [
    { name: 'Cursor', category: 'AI Coding', score: 91, saves: 12000 },
    { name: 'Claude AI', category: 'AI Assistant', score: 92, saves: 15000 },
    { name: 'Copilot', category: 'AI Coding', score: 88, saves: 18000 },
  ];

  const savedLists = [
    { name: 'My AI Tools', count: 12, created: 'Mar 10, 2024' },
    { name: 'Productivity Stack', count: 8, created: 'Mar 5, 2024' },
    { name: 'Game Recommendations', count: 5, created: 'Feb 28, 2024' },
  ];

  const recentActivity = [
    { action: 'Saved', item: 'Cursor', time: '2 hours ago' },
    { action: 'Compared', item: 'Claude vs Copilot', time: '5 hours ago' },
    { action: 'Created list', item: 'My AI Tools', time: '1 day ago' },
    { action: 'Viewed', item: 'Midjourney', time: '2 days ago' },
  ];

  const tabs = [
    { id: 'favorites', label: '❤️ Favorites' },
    { id: 'lists', label: '📚 Lists' },
    { id: 'activity', label: '📊 Activity' },
    { id: 'settings', label: '⚙️ Settings' },
  ];

  return (
    <>
      <Head>
        <title>Dashboard | Intelligence Platform</title>
        <meta name="description" content="Your personal intelligence dashboard" />
      </Head>

      <Navbar />

      <div style={{ background: colors.bg, minHeight: '100vh' }}>
        {/* Header */}
        <div style={{
          background: `linear-gradient(135deg, ${colors.bg2} 0%, ${colors.bg3} 100%)`,
          padding: '40px 24px',
          borderBottom: `1px solid ${colors.bg3}`,
        }}>
          <div style={{ maxWidth: 1200, margin: '0 auto' }}>
            <h1 style={{
              fontSize: 32,
              fontWeight: 900,
              margin: 0,
              marginBottom: 8,
              color: colors.t1,
            }}>
              👋 Welcome back, {userInfo.name}!
            </h1>
            <p style={{
              fontSize: 14,
              color: colors.t3,
              margin: 0,
            }}>
              Plan: <span style={{ color: colors.gold, fontWeight: 700 }}>{userInfo.plan.toUpperCase()}</span>
            </p>
          </div>
        </div>

        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 24px' }}>
          {/* User stats */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 16,
            marginBottom: 40,
          }}>
            {[
              { label: 'Favorites', value: favorites.length, icon: '❤️' },
              { label: 'Lists', value: savedLists.length, icon: '📚' },
              { label: 'Comparisons', value: 8, icon: '⚔️' },
              { label: 'Member Since', value: userInfo.joinDate, icon: '📅' },
            ].map((stat, idx) => (
              <div
                key={idx}
                style={{
                  padding: 20,
                  background: colors.bg2,
                  borderRadius: 12,
                  border: `1px solid ${colors.bg3}`,
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: 24, marginBottom: 8 }}>
                  {stat.icon}
                </div>
                <div style={{
                  fontSize: 20,
                  fontWeight: 800,
                  color: colors.gold,
                  marginBottom: 4,
                }}>
                  {stat.value}
                </div>
                <div style={{ fontSize: 12, color: colors.t3 }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div style={{
            display: 'flex',
            gap: 8,
            borderBottom: `1px solid ${colors.bg3}`,
            marginBottom: 32,
            overflowX: 'auto',
            paddingBottom: 16,
          }}>
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  padding: '10px 16px',
                  borderBottom: activeTab === tab.id ? `2px solid ${colors.gold}` : 'none',
                  background: 'none',
                  border: 'none',
                  color: activeTab === tab.id ? colors.gold : colors.t3,
                  fontWeight: 700,
                  fontSize: 13,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  whiteSpace: 'nowrap',
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Favorites Tab */}
          {activeTab === 'favorites' && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: 20,
            }}>
              {favorites.length > 0 ? (
                favorites.map((item, idx) => (
                  <Link key={idx} href={`/item/${item.name.toLowerCase()}`}>
                    <a style={{
                      padding: 16,
                      background: colors.bg2,
                      borderRadius: 12,
                      border: `1px solid ${colors.bg3}`,
                      textDecoration: 'none',
                      color: 'inherit',
                      transition: 'all 0.3s ease',
                    }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-4px)';
                        e.currentTarget.style.borderColor = colors.gold;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.borderColor = colors.bg3;
                      }}
                    >
                      <div style{{
                        fontSize: 16,
                        fontWeight: 800,
                        marginBottom: 8,
                        color: colors.t1,
                      }}>
                        {item.name}
                      </div>
                      <div style={{
                        fontSize: 12,
                        color: colors.t3,
                        marginBottom: 12,
                      }}>
                        {item.category}
                      </div>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        fontSize: 12,
                        paddingTop: 8,
                        borderTop: `1px solid ${colors.bg3}`,
                      }}>
                        <span style={{ color: colors.gold, fontWeight: 700 }}>
                          ⭐ {item.score}
                        </span>
                        <span style={{ color: colors.t3 }}>
                          ❤️ {item.saves.toLocaleString()}
                        </span>
                      </div>
                    </a>
                  </Link>
                ))
              ) : (
                <div style={{
                  gridColumn: '1 / -1',
                  textAlign: 'center',
                  padding: 40,
                  color: colors.t3,
                }}>
                  <div style={{ fontSize: 28, marginBottom: 12 }}>❤️</div>
                  <div style={{ fontWeight: 700, marginBottom: 4 }}>No favorites yet</div>
                  <Link href="/discover">
                    <a style={{ color: colors.gold, textDecoration: 'none' }}>
                      Explore and save items →
                    </a>
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* Lists Tab */}
          {activeTab === 'lists' && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: 20,
            }}>
              {savedLists.map((list, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: 20,
                    background: colors.bg2,
                    borderRadius: 12,
                    border: `1px solid ${colors.bg3}`,
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.borderColor = colors.gold;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.borderColor = colors.bg3;
                  }}
                >
                  <div style={{
                    fontSize: 16,
                    fontWeight: 800,
                    marginBottom: 8,
                    color: colors.t1,
                  }}>
                    📚 {list.name}
                  </div>
                  <div style={{
                    fontSize: 12,
                    color: colors.t3,
                    marginBottom: 12,
                  }}>
                    {list.count} items • Created {list.created}
                  </div>
                  <button style={{
                    width: '100%',
                    padding: 10,
                    background: colors.gold + '20',
                    color: colors.gold,
                    border: `1px solid ${colors.gold}40`,
                    borderRadius: 8,
                    fontWeight: 700,
                    fontSize: 12,
                    cursor: 'pointer',
                  }}>
                    View List →
                  </button>
                </div>
              ))}
              <div
                style={{
                  padding: 20,
                  background: colors.bg3,
                  borderRadius: 12,
                  border: `2px dashed ${colors.gold}40`,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minHeight: 160,
                  textAlign: 'center',
                }}
              >
                <div>
                  <div style={{ fontSize: 24, marginBottom: 8 }}>➕</div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: colors.gold }}>
                    Create new list
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Activity Tab */}
          {activeTab === 'activity' && (
            <div style={{
              maxWidth: 600,
              background: colors.bg2,
              borderRadius: 12,
              border: `1px solid ${colors.bg3}`,
              overflow: 'hidden',
            }}>
              {recentActivity.map((activity, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: 16,
                    borderBottom: idx < recentActivity.length - 1 ? `1px solid ${colors.bg3}` : 'none',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <div>
                    <div style={{
                      fontSize: 13,
                      fontWeight: 700,
                      color: colors.t1,
                      marginBottom: 4,
                    }}>
                      {activity.action} <span style={{ color: colors.gold }}>
                        {activity.item}
                      </span>
                    </div>
                    <div style={{ fontSize: 11, color: colors.t3 }}>
                      {activity.time}
                    </div>
                  </div>
                  <span style={{ fontSize: 16 }}>→</span>
                </div>
              ))}
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div style={{
              maxWidth: 600,
              display: 'grid',
              gap: 20,
            }}>
              {/* Account Settings */}
              <div style={{
                padding: 20,
                background: colors.bg2,
                borderRadius: 12,
                border: `1px solid ${colors.bg3}`,
              }}>
                <h3 style={{
                  fontSize: 14,
                  fontWeight: 800,
                  margin: 0,
                  marginBottom: 16,
                  color: colors.t1,
                }}>
                  Account Settings
                </h3>
                <div style={{ display: 'grid', gap: 12 }}>
                  <div style={{
                    padding: 12,
                    background: colors.bg,
                    borderRadius: 8,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}>
                    <span style={{ fontSize: 13, color: colors.t2 }}>Email: {userInfo.email}</span>
                    <button style={{
                      background: 'none',
                      border: 'none',
                      color: colors.gold,
                      fontWeight: 700,
                      fontSize: 12,
                      cursor: 'pointer',
                    }}>
                      Change
                    </button>
                  </div>
                  <button style={{
                    padding: 12,
                    background: colors.bg,
                    border: `1px solid ${colors.bg3}`,
                    borderRadius: 8,
                    color: colors.t2,
                    fontWeight: 700,
                    fontSize: 13,
                    cursor: 'pointer',
                  }}>
                    Change Password
                  </button>
                </div>
              </div>

              {/* Notifications */}
              <div style={{
                padding: 20,
                background: colors.bg2,
                borderRadius: 12,
                border: `1px solid ${colors.bg3}`,
              }}>
                <h3 style={{
                  fontSize: 14,
                  fontWeight: 800,
                  margin: 0,
                  marginBottom: 16,
                  color: colors.t1,
                }}>
                  Notifications
                </h3>
                <label style={{
                  display: 'flex',
                  gap: 8,
                  alignItems: 'center',
                  marginBottom: 12,
                  cursor: 'pointer',
                }}>
                  <input type="checkbox" defaultChecked />
                  <span style={{ fontSize: 13, color: colors.t2 }}>
                    Weekly intelligence digest
                  </span>
                </label>
                <label style={{
                  display: 'flex',
                  gap: 8,
                  alignItems: 'center',
                  cursor: 'pointer',
                }}>
                  <input type="checkbox" />
                  <span style={{ fontSize: 13, color: colors.t2 }}>
                    Item recommendations
                  </span>
                </label>
              </div>

              {/* Danger zone */}
              <div style={{
                padding: 20,
                background: colors.red + '10',
                borderRadius: 12,
                border: `1px solid ${colors.red}40`,
              }}>
                <h3 style={{
                  fontSize: 14,
                  fontWeight: 800,
                  margin: 0,
                  marginBottom: 12,
                  color: colors.red,
                }}>
                  Danger Zone
                </h3>
                <button style={{
                  width: '100%',
                  padding: 10,
                  background: colors.red + '20',
                  border: `1px solid ${colors.red}40`,
                  color: colors.red,
                  borderRadius: 8,
                  fontWeight: 700,
                  fontSize: 12,
                  cursor: 'pointer',
                }}>
                  Delete account
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </>
  );
}