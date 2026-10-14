create type public.app_role as enum ('admin','user');
create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role app_role not null,
  unique (user_id, role)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;
create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean language sql stable security definer set search_path = public
as $$ select exists (select 1 from public.user_roles where user_id = _user_id and role = _role) $$;
create policy "own roles readable" on public.user_roles for select to authenticated using (user_id = auth.uid());

-- First account to sign up becomes the shop owner (admin)
create or replace function public.handle_first_admin()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if not exists (select 1 from public.user_roles where role = 'admin') then
    insert into public.user_roles(user_id, role) values (new.id, 'admin');
  end if;
  return new;
end $$;
create trigger on_auth_user_created_admin after insert on auth.users
for each row execute function public.handle_first_admin();

create table public.products (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  description text not null default '',
  fragrance text not null default '',
  family text not null default 'warm',
  moods text[] not null default '{}',
  rooms text[] not null default '{}',
  price numeric(10,2) not null default 0,
  size text not null default '',
  stock integer not null default 0,
  image text not null default 'candle-1',
  is_featured boolean not null default false,
  is_bestseller boolean not null default false,
  is_new boolean not null default false,
  is_gift_set boolean not null default false,
  is_sample boolean not null default true,
  active boolean not null default true,
  created_at timestamptz not null default now()
);
grant select on public.products to anon, authenticated;
grant insert, update, delete on public.products to authenticated;
grant all on public.products to service_role;
alter table public.products enable row level security;
create policy "public reads active products" on public.products for select to anon, authenticated using (active or public.has_role(auth.uid(),'admin'));
create policy "admins insert products" on public.products for insert to authenticated with check (public.has_role(auth.uid(),'admin'));
create policy "admins update products" on public.products for update to authenticated using (public.has_role(auth.uid(),'admin'));
create policy "admins delete products" on public.products for delete to authenticated using (public.has_role(auth.uid(),'admin'));

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  customer_name text not null,
  customer_email text not null,
  customer_phone text,
  address text not null,
  items jsonb not null,
  total numeric(10,2) not null,
  status text not null default 'demo - pending',
  marketing_consent boolean not null default false,
  created_at timestamptz not null default now()
);
grant insert on public.orders to anon, authenticated;
grant select, update on public.orders to authenticated;
grant all on public.orders to service_role;
alter table public.orders enable row level security;
create policy "anyone places order" on public.orders for insert to anon, authenticated with check (length(customer_name) between 1 and 120 and length(customer_email) between 3 and 255 and jsonb_array_length(items) > 0);
create policy "admins read orders" on public.orders for select to authenticated using (public.has_role(auth.uid(),'admin'));
create policy "admins update orders" on public.orders for update to authenticated using (public.has_role(auth.uid(),'admin'));

create table public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  birthday_offers boolean not null default false,
  created_at timestamptz not null default now()
);
grant insert on public.newsletter_subscribers to anon, authenticated;
grant select on public.newsletter_subscribers to authenticated;
grant all on public.newsletter_subscribers to service_role;
alter table public.newsletter_subscribers enable row level security;
create policy "anyone subscribes" on public.newsletter_subscribers for insert to anon, authenticated with check (length(email) between 3 and 255);
create policy "admins read subs" on public.newsletter_subscribers for select to authenticated using (public.has_role(auth.uid(),'admin'));

create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references public.products(id) on delete cascade,
  name text not null,
  rating int not null default 5,
  comment text not null,
  order_email text not null,
  approved boolean not null default false,
  created_at timestamptz not null default now()
);
grant select, insert on public.reviews to anon, authenticated;
grant update, delete on public.reviews to authenticated;
grant all on public.reviews to service_role;
alter table public.reviews enable row level security;
create policy "approved reviews public" on public.reviews for select to anon, authenticated using (approved or public.has_role(auth.uid(),'admin'));
create policy "anyone submits review" on public.reviews for insert to anon, authenticated with check (approved = false and rating between 1 and 5 and length(comment) between 2 and 1000);
create policy "admins moderate reviews" on public.reviews for update to authenticated using (public.has_role(auth.uid(),'admin'));
create policy "admins delete reviews" on public.reviews for delete to authenticated using (public.has_role(auth.uid(),'admin'));

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  name text not null, email text not null, message text not null,
  created_at timestamptz not null default now()
);
grant insert on public.messages to anon, authenticated;
grant select on public.messages to authenticated;
grant all on public.messages to service_role;
alter table public.messages enable row level security;
create policy "anyone contacts" on public.messages for insert to anon, authenticated with check (length(message) between 2 and 2000);
create policy "admins read messages" on public.messages for select to authenticated using (public.has_role(auth.uid(),'admin'));

insert into public.products (slug,name,description,fragrance,family,moods,rooms,price,size,stock,image,is_featured,is_bestseller,is_new,is_gift_set) values
('lavender-sage-calm','Lavender & Sage Calm','Sample product — a soothing candle for winding down after a long day.','Lavender & Sage','floral','{relaxation,comfort}','{bedroom,bathroom}',249,'200g',20,'candle-1',true,true,false,false),
('vanilla-honey-glow','Vanilla Honey Glow','Sample product — a sweet, cosy candle for slow evenings.','Vanilla & Honey','sweet','{comfort,romance}','{living room,bedroom}',229,'200g',15,'candle-2',true,true,false,false),
('cedar-ember','Cedar Ember','Sample product — a grounding woody candle for focus and warmth.','Cedarwood & Cinnamon','woody','{comfort,energy}','{office,living room}',269,'250g',12,'candle-4',true,false,true,false),
('citrus-mint-morning','Citrus Mint Morning','Sample product — a bright, uplifting candle to refresh any room.','Lemon & Mint','fresh','{freshness,energy}','{bathroom,office}',199,'150g',25,'candle-5',false,false,true,false),
('rose-amber-evening','Rose Amber Evening','Sample product — a warm, romantic candle for special moments.','Rose & Amber','warm','{romance,relaxation}','{bedroom,living room}',289,'250g',10,'candle-2',false,true,false,false),
('little-light-trio','Little Light Gift Trio','Sample product — three mini candles in calming, sweet and floral scents.','Assorted trio','floral','{relaxation,comfort,romance}','{gift}',449,'3 x 80g',8,'candle-3',true,false,true,true);