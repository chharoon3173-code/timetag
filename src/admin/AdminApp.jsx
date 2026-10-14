import { useEffect, useState } from 'react';
import AdminLogin from './AdminLogin.jsx';
import Overview from './Overview.jsx';
import Orders from './Orders.jsx';
import Inventory from './Inventory.jsx';
import Collections from './Collections.jsx';
import { isLoggedIn, logout } from '../lib/auth.js';
import { LOW_STOCK, useCatalog, useOrders } from '../lib/store.js';
import { href } from '../lib/router.js';
import './Admin.css';

const TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'orders', label: 'Orders' },
  { id: 'inventory', label: 'Inventory' },
  { id: 'collections', label: 'Collections' },
];

export default function AdminApp() {
  const [authed, setAuthed] = useState(isLoggedIn);
  const [tab, setTab] = useState('overview');
  const [openOrder, setOpenOrder] = useState(null);
  const orders = useOrders();
  const catalog = useCatalog();

  useEffect(() => {
    document.title = 'Admin — TimeTag';
  }, []);

  if (!authed) return <AdminLogin onSuccess={() => setAuthed(true)} />;

  const pending = orders.filter((o) => o.status === 'pending').length;
  const low = catalog.filter((p) => p.stock <= LOW_STOCK).length;
  const noCollection = catalog.filter((p) => !p.collectionId).length;
  const badges = { orders: pending, inventory: low, collections: noCollection };

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
          <a href={href('/')} target="_blank" rel="noreferrer">View store ↗</a>
          <button type="button" onClick={() => { logout(); setAuthed(false); }}>Log out</button>
        </div>
      </aside>

      <main className="adm-main">
        <div className="adm-demo" role="note">
          <strong>Demo mode:</strong> orders and stock are saved in this browser only. Connect a database before launch so
          orders from every customer appear here.
        </div>
        {tab === 'overview' && <Overview orders={orders} catalog={catalog} onOpenOrder={goToOrder} onGo={setTab} />}
        {tab === 'orders' && <Orders orders={orders} catalog={catalog} openId={openOrder} setOpenId={setOpenOrder} />}
        {tab === 'inventory' && <Inventory catalog={catalog} />}
        {tab === 'collections' && <Collections catalog={catalog} onOpenInventory={() => setTab('inventory')} />}
      </main>
    </div>
  );
}
