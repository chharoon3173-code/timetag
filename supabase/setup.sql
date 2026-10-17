-- =====================================================================================
-- TimeTag — database setup for Supabase
--
-- How to use: Supabase dashboard → SQL Editor → "New query" → paste this whole file → Run.
-- It's safe to run again later: it won't duplicate anything or delete your data.
--
-- What it creates:
--   1. admins       the email addresses allowed to manage the store
--   2. collections  Rolex, Cartier… (name, logo, order on the home page)
--   3. products     the watches
--   4. settings     the announcement bar text and the Signature Collection picks
--   5. orders       customer orders (private: only admins can read them)
--   6. security rules ("Row Level Security") for all of the above
--   7. place_order / set_order_status: the only ways orders are created and changed,
--      so prices and stock are always checked here, not in the visitor's browser
--   8. an "images" storage folder for watch photos and collection logos
--   9. the starting collections and demo watches
-- =====================================================================================


-- ---------- 1. Admins ----------------------------------------------------------------
-- Only people whose email is in this table can change the store or see orders.
-- After running this file, add yourself (see the last section of this file).
create table if not exists public.admins (
  email text primary key check (email = lower(email))
);
alter table public.admins enable row level security; -- no rules = the website can't read this list

-- true when the signed-in person is an admin
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.admins
    where email = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
$$;


-- ---------- 2. Collections -----------------------------------------------------------
create table if not exists public.collections (
  id         text primary key,                                   -- e.g. 'rolex' (used in the page address)
  title      text not null check (length(trim(title)) between 1 and 40),
  image      text,                                               -- logo: a file on the site or a Storage URL
  sort       integer not null default 0,                         -- order on the home page
  created_at timestamptz not null default now()
);
create unique index if not exists collections_title_unique on public.collections (lower(title));


-- ---------- 3. Watches ----------------------------------------------------------------
create table if not exists public.products (
  id            text primary key,                                -- e.g. 'verdant-gmt' (used in the page address)
  name          text not null check (length(trim(name)) between 1 and 120),
  collection_ids text[] not null default '{}',                    -- e.g. {rolex,automatic}: shown on each of these
                                                                 -- collection pages; the first is the name on the card
  price         integer not null check (price > 0),              -- in rupees
  stock         integer not null default 0 check (stock >= 0),
  badge         text,                                            -- e.g. 'Best Seller'
  description   text not null default '',
  strap         text,
  gender        text[] not null default '{men,women}',
  tags          text[] not null default '{}',                    -- 'best' and/or 'new'
  watch_style   text not null default 'steelChrono',             -- drawing shown until there are photos
  images        text[] not null default '{}',                    -- photo URLs, first one is the main photo
  active        boolean not null default true,                   -- false = hidden from the store
  rating        smallint not null default 5 check (rating between 1 and 5),
  created_at    timestamptz not null default now()
);

-- Databases set up before 17 Oct 2026 had one collection per watch (collection_id): move it into the list.
alter table public.products add column if not exists collection_ids text[] not null default '{}';
do $$
begin
  if exists (select 1 from information_schema.columns
             where table_schema = 'public' and table_name = 'products' and column_name = 'collection_id') then
    execute 'update public.products set collection_ids = array[collection_id]
             where collection_id is not null and collection_ids = ''{}''';
    alter table public.products drop column collection_id;
  end if;
end;
$$;

-- A watch can be in several collections. A list can't "reference" another table the way a single
-- column can, so these two rules keep it tidy instead:
-- (a) only existing collections can be added to a watch (and each only once);
create or replace function public.check_product_collections()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.collection_ids := coalesce((
    select array_agg(c order by first_pos)
    from (select c, min(pos) as first_pos
          from unnest(new.collection_ids) with ordinality as u(c, pos)
          where c is not null and c <> ''
          group by c) as t
  ), '{}');
  if exists (select 1 from unnest(new.collection_ids) as c
             where not exists (select 1 from public.collections where id = c)) then
    raise exception 'One of the chosen collections doesn''t exist any more. Refresh the page and try again.';
  end if;
  return new;
end;
$$;
drop trigger if exists products_check_collections on public.products;
create trigger products_check_collections
  before insert or update of collection_ids on public.products
  for each row execute function public.check_product_collections();

-- (b) deleting a collection takes it off every watch (the watches themselves are kept).
create or replace function public.remove_collection_from_watches()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if tg_op = 'DELETE' then
    update public.products set collection_ids = array_remove(collection_ids, old.id)
    where old.id = any (collection_ids);
    return old;
  end if;
  -- a collection's id changed: follow it
  update public.products set collection_ids = array_replace(collection_ids, old.id, new.id)
  where old.id = any (collection_ids);
  return new;
end;
$$;
drop trigger if exists collections_remove_from_watches on public.collections;
create trigger collections_remove_from_watches
  after delete or update of id on public.collections
  for each row execute function public.remove_collection_from_watches();


-- ---------- 4. Settings -----------------------------------------------------------------
create table if not exists public.settings (
  key        text primary key,   -- 'announcement' = { show, messages }, 'signature' = ["watch-id", …]
  value      jsonb not null,
  updated_at timestamptz not null default now()
);


-- ---------- 5. Orders ---------------------------------------------------------------------
create sequence if not exists public.order_number_seq start 1001;

create table if not exists public.orders (
  id         text primary key,                                   -- e.g. 'TT-1001'
  number     integer not null unique,
  created_at timestamptz not null default now(),
  status     text not null default 'pending'
             check (status in ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled')),
  customer   jsonb not null,                                     -- name, contact, phone, address…
  newsletter boolean not null default false,
  shipping   jsonb not null,                                     -- { id, label, detail, price }
  payment    jsonb not null,                                     -- { id, label }
  items      jsonb not null,                                     -- [{ id, name, collection, price, qty }]
  subtotal   integer not null,
  total      integer not null,
  history    jsonb not null default '[]'                         -- [{ status, at }]
);
create index if not exists orders_created_idx on public.orders (created_at desc);


-- ---------- 6. Security rules ------------------------------------------------------------
-- With Row Level Security on, nobody can read or change a table unless a rule below allows it.
alter table public.collections enable row level security;
alter table public.products    enable row level security;
alter table public.settings    enable row level security;
alter table public.orders      enable row level security;

-- Collections: everyone can see them; only admins can add, change or delete.
drop policy if exists "Anyone can view collections" on public.collections;
create policy "Anyone can view collections" on public.collections
  for select using (true);
drop policy if exists "Admins manage collections" on public.collections;
create policy "Admins manage collections" on public.collections
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- Watches: everyone can see visible watches; admins also see hidden ones and can change them.
drop policy if exists "Anyone can view visible watches" on public.products;
create policy "Anyone can view visible watches" on public.products
  for select using (active or public.is_admin());
drop policy if exists "Admins manage watches" on public.products;
create policy "Admins manage watches" on public.products
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- Settings: everyone can read them (the store needs the bar text); only admins can change them.
drop policy if exists "Anyone can view settings" on public.settings;
create policy "Anyone can view settings" on public.settings
  for select using (true);
drop policy if exists "Admins manage settings" on public.settings;
create policy "Admins manage settings" on public.settings
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- Orders: only admins can read them. Nobody writes to this table directly:
-- customers use place_order() and admins use set_order_status() (section 7).
drop policy if exists "Admins view orders" on public.orders;
create policy "Admins view orders" on public.orders
  for select to authenticated using (public.is_admin());

-- What the website's two kinds of visitors may attempt (the rules above still apply on top).
grant usage on schema public to anon, authenticated;
grant select on public.collections, public.products, public.settings to anon, authenticated;
grant insert, update, delete on public.collections, public.products, public.settings to authenticated;
revoke all on public.orders from anon;
revoke insert, update, delete on public.orders from authenticated;
grant select on public.orders to authenticated;
revoke all on public.admins from anon, authenticated;
grant execute on function public.is_admin() to anon, authenticated;


-- ---------- 7. Placing and updating orders ----------------------------------------------
-- Called by the checkout page. Takes the watch ids and quantities from the bag, then — inside
-- the database — checks each watch is available, takes the price from the products table (so it
-- can't be changed in the browser), reduces stock and saves the order, all in one step.
-- Keep the shipping prices here in sync with SHIPPING_METHODS in src/lib/store.js.
create or replace function public.place_order(
  items       jsonb,
  customer    jsonb,
  shipping_id text default 'standard',
  payment_id  text default 'cod',
  newsletter  boolean default false
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_line     jsonb;
  v_product  public.products;
  v_qty      integer;
  v_items    jsonb := '[]';
  v_subtotal integer := 0;
  v_shipping jsonb;
  v_payment  jsonb;
  v_number   integer;
  v_order    public.orders;
  v_field    text;
begin
  -- the bag
  if items is null or jsonb_typeof(items) <> 'array' or jsonb_array_length(items) = 0 then
    raise exception 'Your bag is empty.';
  end if;
  if jsonb_array_length(items) > 20 then
    raise exception 'Too many different watches in one order.';
  end if;

  -- the customer's details
  if customer is null or jsonb_typeof(customer) <> 'object' then
    raise exception 'Please fill in your delivery details.';
  end if;
  foreach v_field in array array['contact', 'firstName', 'lastName', 'address', 'city', 'phone'] loop
    if length(trim(coalesce(customer ->> v_field, ''))) = 0 then
      raise exception 'Please fill in all required delivery details.';
    end if;
  end loop;
  if exists (select 1 from jsonb_each_text(customer) where length(value) > 300) then
    raise exception 'One of your delivery details is too long.';
  end if;

  -- shipping and payment
  v_shipping := case shipping_id
    when 'standard' then '{"id": "standard", "label": "Standard delivery", "detail": "3–5 business days", "price": 0}'::jsonb
  end;
  if v_shipping is null then raise exception 'Please choose a shipping method.'; end if;
  v_payment := case payment_id
    when 'cod'  then '{"id": "cod", "label": "Cash on Delivery (COD)"}'::jsonb
    when 'bank' then '{"id": "bank", "label": "Bank transfer"}'::jsonb
  end;
  if v_payment is null then raise exception 'Please choose a payment method.'; end if;

  -- each watch: lock it (so two people can't buy the last one at once), check stock, take the price
  for v_line in select value from jsonb_array_elements(items) loop
    v_qty := case when (v_line ->> 'qty') ~ '^[0-9]{1,2}$' then (v_line ->> 'qty')::integer end;
    if v_qty is null or v_qty < 1 or v_qty > 5 then
      raise exception 'Please check the quantities in your bag (1 to 5 of each watch).';
    end if;

    select * into v_product from public.products
    where id = v_line ->> 'id' and active
    for update;
    if not found then
      raise exception 'One of the watches in your bag is no longer available. Please update your bag.';
    end if;
    if v_product.stock = 0 then
      raise exception 'Sorry — % has just sold out. Please update your bag.', v_product.name;
    end if;
    if v_qty > v_product.stock then
      raise exception 'Sorry — only % left of %. Please update your bag.', v_product.stock, v_product.name;
    end if;

    update public.products set stock = stock - v_qty where id = v_product.id;

    v_items := v_items || jsonb_build_object(
      'id', v_product.id,
      'name', v_product.name,
      'collection', coalesce((select title from public.collections where id = v_product.collection_ids[1]), ''),
      'price', v_product.price,
      'qty', v_qty
    );
    v_subtotal := v_subtotal + v_product.price * v_qty;
  end loop;

  -- save the order
  v_number := nextval('public.order_number_seq');
  insert into public.orders (id, number, customer, newsletter, shipping, payment, items, subtotal, total)
  values (
    'TT-' || v_number, v_number, customer, coalesce(newsletter, false), v_shipping, v_payment,
    v_items, v_subtotal, v_subtotal + (v_shipping ->> 'price')::integer
  )
  returning * into v_order;

  return to_jsonb(v_order);
end;
$$;

-- Called by the admin's Orders page. Cancelling puts the watches back into stock.
create or replace function public.set_order_status(order_id text, new_status text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order public.orders;
  v_line  jsonb;
begin
  if not public.is_admin() then
    raise exception 'Only TimeTag admins can change orders.';
  end if;
  if new_status not in ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled') then
    raise exception 'Unknown order status.';
  end if;

  select * into v_order from public.orders where id = order_id for update;
  if not found then raise exception 'Order % was not found.', order_id; end if;
  if v_order.status = 'cancelled' then raise exception 'Cancelled orders can''t be changed.'; end if;
  if v_order.status = new_status then return to_jsonb(v_order); end if;

  if new_status = 'cancelled' then
    for v_line in select value from jsonb_array_elements(v_order.items) loop
      update public.products set stock = stock + (v_line ->> 'qty')::integer where id = v_line ->> 'id';
    end loop;
  end if;

  update public.orders
  set status = new_status,
      history = history || jsonb_build_array(jsonb_build_object('status', new_status, 'at', now()))
  where id = order_id
  returning * into v_order;

  return to_jsonb(v_order);
end;
$$;

revoke execute on function public.place_order(jsonb, jsonb, text, text, boolean) from public;
grant execute on function public.place_order(jsonb, jsonb, text, text, boolean) to anon, authenticated;
revoke execute on function public.set_order_status(text, text) from public, anon;
grant execute on function public.set_order_status(text, text) to authenticated;


-- ---------- 8. Image storage ------------------------------------------------------------------
-- A public "images" folder: anyone can view the files through their links; only admins can
-- list, upload, replace or delete them.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('images', 'images', true, 5242880, array['image/webp', 'image/jpeg', 'image/png'])
on conflict (id) do nothing;

drop policy if exists "Admins list images" on storage.objects;
create policy "Admins list images" on storage.objects
  for select to authenticated using (bucket_id = 'images' and public.is_admin());
drop policy if exists "Admins upload images" on storage.objects;
create policy "Admins upload images" on storage.objects
  for insert to authenticated with check (bucket_id = 'images' and public.is_admin());
drop policy if exists "Admins update images" on storage.objects;
create policy "Admins update images" on storage.objects
  for update to authenticated using (bucket_id = 'images' and public.is_admin());
drop policy if exists "Admins delete images" on storage.objects;
create policy "Admins delete images" on storage.objects
  for delete to authenticated using (bucket_id = 'images' and public.is_admin());


-- ---------- 9. Starting data (skipped if it's already there) ----------------------------------
insert into public.collections (id, title, image, sort) values
  ('rolex',          'Rolex',             'brand/collections/rolex.png',          1),
  ('patek-philippe', 'Patek Philippe',    'brand/collections/patek-philippe.png', 2),
  ('hublot',         'Hublot',            'brand/collections/hublot.png',         3),
  ('cartier',        'Cartier',           'brand/collections/cartier.png',        4),
  ('bestwin',        'Bestwin',           'brand/collections/bestwin.png',        5),
  ('automatic',      'Automatic Watches', 'brand/collections/automatic.png',      6),
  ('master-grade',   'Master Grade',      'brand/collections/master-grade.png',   7)
on conflict (id) do nothing;

-- The 6 demo watches (drawn, no photos). Delete or edit them in Admin → Inventory once you add real ones.
insert into public.products (id, name, badge, description, price, stock, gender, tags, watch_style, created_at) values
  ('chronograph-x1',     'TimeTag Chronograph X1', 'Best Seller', 'Precision engineered for those who make every second count.',      64999, 8,  '{men}',       '{best}',     'steelChrono',  now() - interval '1 minute'),
  ('heritage-classique', 'Heritage Classique',     'Best Seller', 'Ivory dial and warm gold — the quiet confidence of a classic.',   58500, 5,  '{women,men}', '{best}',     'heritageGold', now() - interval '2 minutes'),
  ('meridian-automatic', 'Meridian Automatic',     'New Arrival', 'A midnight dial that reads like a clear night sky.',              72000, 12, '{men,women}', '{new}',      'midnight',     now() - interval '3 minutes'),
  ('aurelia-34',         'Aurelia 34',             'New Arrival', 'Champagne warmth, sized for a refined wrist.',                    46999, 3,  '{women}',     '{new}',      'champagne',    now() - interval '4 minutes'),
  ('noir-chronograph',   'Noir Chronograph',       'Best Seller', 'Blacked-out steel with gold detailing, made for after dark.',     54999, 10, '{men}',       '{best,new}', 'noir',         now() - interval '5 minutes'),
  ('verdant-gmt',        'Verdant GMT',            'New Arrival', 'Forest-green dial, gold case, two time zones at a glance.',       89000, 4,  '{men,women}', '{new,best}', 'verdant',      now() - interval '6 minutes')
on conflict (id) do nothing;


-- ---------- Finally: make yourself an admin ------------------------------------------------
-- 1. Supabase dashboard → Authentication → Users → "Add user" → "Create new user":
--    enter your email and a strong password, tick "Auto Confirm User", and create it.
-- 2. Then run this line on its own in the SQL Editor, with YOUR email (lowercase):
--
--    insert into public.admins (email) values ('your-email@example.com');
