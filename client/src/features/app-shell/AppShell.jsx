import { useState } from 'react';
import { Outlet } from 'react-router';

import { useAuth } from '../../lib/authContext.jsx';
import { Drawer } from './Drawer.jsx';
import { MobileNav } from './MobileNav.jsx';
import { navItemsForRole } from './navConfig.js';
import { Sidebar } from './Sidebar.jsx';
import { SignOutConfirmDialog } from './SignOutConfirmDialog.jsx';
import { Topbar } from './Topbar.jsx';

export function AppShell() {
  const { user, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [signOutOpen, setSignOutOpen] = useState(false);

  const items = navItemsForRole(user?.role);

  return (
    <div className="stfy-shell">
      <Sidebar
        items={items}
        user={user}
        collapsed={collapsed}
        onToggleCollapsed={() => setCollapsed((v) => !v)}
        onRequestSignOut={() => setSignOutOpen(true)}
      />

      <div className="stfy-main">
        <Topbar onOpenDrawer={() => setDrawerOpen(true)} />
        <main className="stfy-content">
          <Outlet />
        </main>
        <MobileNav items={items} />
      </div>

      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} items={items} />
      <SignOutConfirmDialog
        open={signOutOpen}
        onCancel={() => setSignOutOpen(false)}
        onConfirm={() => {
          setSignOutOpen(false);
          logout();
        }}
      />

      <style>{`
        .stfy-shell { min-height: 100vh; display: flex; background: var(--color-bg); }
        .stfy-main { flex: 1; display: flex; flex-direction: column; min-width: 0; }
        .stfy-content { flex: 1; padding: var(--space-6); max-width: 1200px; width: 100%; margin: 0 auto; }
        @media (max-width: 767px) {
          .stfy-content { padding: var(--space-4); padding-bottom: calc(var(--space-4) + 72px); }
        }

        /* ---- Sidebar ---- */
        .stfy-sidebar { width: 248px; flex: none; background: var(--color-dark); display: flex; flex-direction: column; overflow: hidden; transition: width 220ms ease; }
        .stfy-sidebar.is-collapsed { width: 64px; }
        .stfy-sidebar-header { display: flex; align-items: center; justify-content: space-between; padding: var(--space-4); flex: none; }
        .stfy-sidebar.is-collapsed .stfy-sidebar-header { justify-content: center; }
        .stfy-sidebar-brand { display: flex; align-items: center; }
        .stfy-sidebar-logo-mark { display: none; }
        .stfy-sidebar.is-collapsed .stfy-sidebar-logo-full { display: none; }
        .stfy-sidebar.is-collapsed .stfy-sidebar-logo-mark { display: block; }
        .stfy-sidebar-toggle { background: transparent; border: none; color: var(--color-on-dark-muted); padding: 4px; border-radius: var(--radius-sm); display: inline-flex; cursor: pointer; }
        .stfy-sidebar-nav-wrap { position: relative; padding: 0 var(--space-2); flex: 1; }
        .stfy-sidebar-pill { position: absolute; left: var(--space-2); right: var(--space-2); top: 0; height: 42px; background: var(--color-accent); border-radius: var(--radius-md); opacity: 0; }
        .stfy-sidebar-item { position: relative; z-index: 1; display: flex; align-items: center; gap: var(--space-3); height: 42px; padding: 0 var(--space-3); margin-bottom: var(--space-1); border-radius: var(--radius-md); color: var(--color-on-dark-muted); font-size: var(--font-size-sm); font-weight: 600; text-decoration: none; }
        .stfy-sidebar-item.is-active { color: var(--color-accent-contrast); }
        .stfy-sidebar-item-icon { display: flex; flex: none; }
        .stfy-sidebar-label { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .stfy-sidebar.is-collapsed .stfy-sidebar-item { justify-content: center; }
        .stfy-sidebar.is-collapsed .stfy-sidebar-label { display: none; }
        .stfy-sidebar-footer { padding: var(--space-2); border-top: 1px solid var(--color-dark-border); flex: none; }

        /* ---- User menu ---- */
        .stfy-usermenu { position: relative; }
        .stfy-usermenu-trigger { width: 100%; display: flex; align-items: center; gap: var(--space-3); background: transparent; border: none; padding: var(--space-2); border-radius: var(--radius-md); cursor: pointer; }
        .stfy-usermenu-avatar { width: 30px; height: 30px; border-radius: var(--radius-full); background: var(--color-success); color: var(--color-primary); display: inline-flex; align-items: center; justify-content: center; font-weight: 700; font-size: var(--font-size-xs); flex: none; }
        .stfy-usermenu-text { text-align: left; overflow: hidden; flex: 1; display: flex; flex-direction: column; }
        .stfy-usermenu-name { color: var(--color-accent-contrast); font-size: var(--font-size-sm); font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .stfy-usermenu-role { color: var(--color-on-dark-muted); font-size: var(--font-size-xs); text-transform: capitalize; }
        .stfy-usermenu-chevron { color: var(--color-on-dark-muted); flex: none; }
        .stfy-sidebar.is-collapsed .stfy-usermenu-text,
        .stfy-sidebar.is-collapsed .stfy-usermenu-chevron { display: none; }
        .stfy-usermenu-panel { position: absolute; bottom: calc(100% + 6px); left: 0; right: 0; background: var(--color-surface); border-radius: var(--radius-md); box-shadow: var(--shadow-md); overflow: hidden; z-index: var(--z-dropdown); }
        .stfy-sidebar.is-collapsed .stfy-usermenu-panel { left: -6px; right: auto; width: 180px; }
        .stfy-usermenu-item { display: block; width: 100%; text-align: left; padding: var(--space-3) var(--space-4); border: none; background: transparent; font-size: var(--font-size-sm); font-weight: 500; color: var(--color-text); text-decoration: none; cursor: pointer; }
        .stfy-usermenu-item + .stfy-usermenu-item { border-top: 1px solid var(--color-border); }

        @media (max-width: 1023px) {
          .stfy-sidebar { width: 64px !important; }
          .stfy-sidebar-header { justify-content: center !important; }
          .stfy-sidebar-logo-full { display: none !important; }
          .stfy-sidebar-logo-mark { display: block !important; }
          .stfy-sidebar-toggle { display: none !important; }
          .stfy-sidebar-item { justify-content: center !important; }
          .stfy-sidebar-label { display: none !important; }
          .stfy-usermenu-text, .stfy-usermenu-chevron { display: none !important; }
          .stfy-usermenu-panel { left: -6px; right: auto; width: 180px; }
        }
        @media (max-width: 767px) {
          .stfy-sidebar { display: none !important; }
        }

        /* ---- Topbar ---- */
        .stfy-topbar { flex: none; display: flex; align-items: center; justify-content: space-between; gap: var(--space-3); padding: var(--space-4) var(--space-6); border-bottom: 1px solid var(--color-border); background: var(--color-surface); }
        .stfy-topbar-left { display: flex; align-items: center; gap: var(--space-3); min-width: 0; }
        .stfy-drawer-toggle { display: none; background: transparent; border: none; padding: 4px; border-radius: var(--radius-sm); color: var(--color-text); cursor: pointer; }
        @media (min-width: 768px) and (max-width: 1023px) {
          .stfy-drawer-toggle { display: inline-flex; }
        }
        .stfy-topbar-title { font-family: var(--font-display); font-weight: 700; font-size: var(--font-size-xl); color: var(--color-text); margin: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .stfy-topbar-clock { display: flex; align-items: center; gap: var(--space-2); flex: none; color: var(--color-text-muted); }
        .stfy-topbar-clock-time { font-size: var(--font-size-sm); font-weight: 600; color: var(--color-text); font-variant-numeric: tabular-nums; }
        .stfy-topbar-clock-date { font-size: var(--font-size-xs); color: var(--color-text-muted-2); }
        @media (max-width: 767px) {
          .stfy-topbar { padding: var(--space-3) var(--space-4); }
          .stfy-topbar-title { font-size: var(--font-size-lg); }
          .stfy-topbar-clock-date { display: none; }
        }

        /* ---- Tablet drawer ---- */
        .stfy-drawer-overlay { position: fixed; inset: 0; background: rgba(12, 42, 32, 0.4); z-index: var(--z-modal); }
        .stfy-drawer-panel { position: fixed; top: 0; left: 0; bottom: 0; width: 240px; background: var(--color-dark); z-index: calc(var(--z-modal) + 1); padding: var(--space-4) var(--space-2); display: flex; flex-direction: column; gap: var(--space-1); }
        .stfy-drawer-header { display: flex; align-items: center; gap: var(--space-2); padding: var(--space-2) var(--space-2) var(--space-4); }
        .stfy-drawer-close { margin-left: auto; background: transparent; border: none; color: var(--color-on-dark-muted); padding: 4px; cursor: pointer; }
        .stfy-drawer-item { display: flex; align-items: center; gap: var(--space-3); padding: var(--space-3) var(--space-3); border-radius: var(--radius-md); color: var(--color-on-dark-muted); font-size: var(--font-size-sm); font-weight: 600; text-decoration: none; }
        .stfy-drawer-item.is-active { background: var(--color-accent); color: var(--color-accent-contrast); }

        /* ---- Mobile bottom nav ---- */
        .stfy-mobile-nav { display: none; position: fixed; left: 0; right: 0; bottom: 0; border-top: 1px solid var(--color-border); background: var(--color-surface); z-index: var(--z-dropdown); }
        @media (max-width: 767px) {
          .stfy-mobile-nav { display: flex; }
        }
        .stfy-mobile-nav-item { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 3px; padding: var(--space-2) 2px calc(var(--space-2) + 2px); background: transparent; border: none; color: var(--color-text-muted-2); min-height: 48px; font-size: var(--font-size-xs); font-weight: 600; text-decoration: none; cursor: pointer; }
        .stfy-mobile-nav-item.is-active { color: var(--color-accent); }

        /* ---- Mobile "More" sheet ---- */
        .stfy-sheet-overlay { position: fixed; inset: 0; background: rgba(12, 42, 32, 0.4); z-index: var(--z-modal); }
        .stfy-sheet { position: fixed; left: 0; right: 0; bottom: 0; background: var(--color-surface); border-radius: var(--radius-lg) var(--radius-lg) 0 0; z-index: calc(var(--z-modal) + 1); padding: var(--space-2) var(--space-2) var(--space-4); }
        .stfy-sheet-handle { width: 36px; height: 4px; background: var(--color-border); border-radius: var(--radius-full); margin: var(--space-2) auto var(--space-3); }
        .stfy-sheet-item { display: flex; align-items: center; gap: var(--space-3); width: 100%; text-align: left; padding: var(--space-3) var(--space-4); border: none; background: transparent; font-size: var(--font-size-base); font-weight: 600; color: var(--color-text); border-radius: var(--radius-md); text-decoration: none; }

        /* ---- Sign-out confirm modal ---- */
        .stfy-modal-overlay { position: fixed; inset: 0; background: rgba(12, 42, 32, 0.4); z-index: var(--z-modal); display: flex; align-items: center; justify-content: center; padding: var(--space-4); }
        .stfy-modal { max-width: 340px; width: 100%; padding: var(--space-6); box-shadow: var(--shadow-md); }
        .stfy-modal-title { font-family: var(--font-display); font-weight: 700; font-size: var(--font-size-lg); color: var(--color-text); margin: 0 0 var(--space-2); }
        .stfy-modal-body { font-size: var(--font-size-sm); color: var(--color-text-muted); line-height: 1.5; margin: 0 0 var(--space-6); }
        .stfy-modal-actions { display: flex; gap: var(--space-2); justify-content: flex-end; }
      `}</style>
    </div>
  );
}
