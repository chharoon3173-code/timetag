import { useEffect, useState } from 'react';
import AdminLogin from './AdminLogin.jsx';
import Overview from './Overview.jsx';
import Orders from './Orders.jsx';
import Inventory from './Inventory.jsx';
import Collections from './Collections.jsx';
import Settings from './Settings.jsx';
import { logout, useAdminSession } from '../lib/auth.js';
import { LOW_STOCK, loadCatalog, loadOrders, useCatalog, useCatalogError, useOrders, useOrdersError } from '../lib/store.js';
import { href } from '../lib/router.js';
import './Admin.css';

const TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'orders', label: 'Orders' },
  { id: 'inventory', label: 'Inventory' },
  { id: 'collections', label: 'Collections' },
  { id: 'settings', label: 'Settings' },
];

const CHECK_ORDERS_EVERY = 60 * 1000; // new orders appear without refreshing the page

export default function AdminApp() {
  const session = useAdminSession();
  const [tab, setTab] = useState('overview');
  const [openOrder, setOpenOrder] = useState(null);
  const orders = useOrders();
  const catalog = useCatalog();
  const catalogError = useCatalogError();
  const ordersError = useOrdersError();

  useEffect(() => {
    document.title = 'Admin — TimeTag';
  }, []);

  // once signed in: load everything (including hidden watches), then keep checking for new orders
  useEffect(() => {
    if (!session) return;
    loadCatalog();
    loadOrders();
    const t = setInterval(() => document.visibilityState === 'visible' && loadOrders(), CHECK_ORDERS_EVERY);
    return () => clearInterval(t);
  }, [!!session]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!session) return <AdminLogin />;

  const pending = orders.filter((o) => o.status === 'pending').length;
  const low = catalog.filter((p) => p.stock <= LOW_STOCK).length;
  const noCollection = catalog.filter((p) => !p.collectionId).length;
  const badges = { orders: pending, inventory: low, collections: noCollection };
  const problem = ordersError || catalogError;

  const goToOrder = (id) => {
    setTab('orders');
    setOpenOrder(id);
  };

  return (
    <div className="adm">
      <aside className="adm-side">
        <div className="adm-brand">
          <span className="adm-mono"><img src="brand/lion.png" alt="" /></span>
          <div><strong>TIMETAG</strong><small>Admin</small></div>
        </div>
        <nav className="adm-nav" aria-label="Admin">
          {TABS.map((t) => (
            <button key={t.id} type="button" className={tab === t.id ? 'is-active' : ''} aria-current={tab === t.id ? 'page' : undefined} onClick={() => setTab(t.id)}>
              {t.label}
              {badges[t.id] > 0 && <span className="adm-badge">{badges[t.id]}</span>}
            </button>
          ))}
        </nav>
        <div className="adm-side__foot">
          <span className="adm-side__who" title={session.user?.email}>{session.user?.email}</span>
          <a href={href('/')} target="_blank" rel="noreferrer">View store ↗</a>
          <button type="button" onClick={logout}>Log out</button>
        </div>
      </aside>

      <main className="adm-main">
        {problem && (
          <div className="adm-notice adm-notice--error" role="alert">
            <strong>Couldn’t load the latest data:</strong> {problem}{' '}
            <button type="button" className="adm-linkbtn" onClick={() => { loadCatalog(); loadOrders(); }}>Try again</button>
          </div>
        )}
        {tab === 'overview' && <Overview orders={orders} catalog={catalog} onOpenOrder={goToOrder} onGo={setTab} />}
        {tab === 'orders' && <Orders orders={orders} catalog={catalog} openId={openOrder} setOpenId={setOpenOrder} />}
        {tab === 'inventory' && <Inventory catalog={catalog} />}
        {tab === 'collections' && <Collections catalog={catalog} onOpenInventory={() => setTab('inventory')} />}
        {tab === 'settings' && <Settings />}
      </main>
    </div>
  );
}
