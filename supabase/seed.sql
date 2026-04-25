-- BunqPal AH Mock Site — Product seed
-- 30 catalog products + 1 membership SKU.
-- Run AFTER schema.sql in the Supabase SQL editor.
-- Idempotent: upserts so re-running won't break existing orders that
-- already reference these product ids via order_items.

delete from public.cart_items;

-- Image paths point to public/products/<id>.jpg in this Next.js app.
-- Prices are intentionally low (~3-4x below RRP) so a topped-up sandbox
-- account can run many demo checkouts without draining.

insert into public.products
(id, slug, name, brand, category, subcategory, description, price, image_url, unit_label, consumable, default_estimated_duration_days, subscription, cycle_days, refundable, refund_window_days)
values

-- Pantry (5)
('pantry_bread',          'volkoren-brood',         'Wholegrain Bread',                'AH',           'pantry',     'bakery',    'Sliced wholegrain bread, baked daily.',         0.79, '/products/pantry_bread.jpg', '800g loaf',          true,  6,   false, null, true, 14),
('pantry_pasta',          'penne-pasta-500g',       'Penne Pasta',                     'AH',           'pantry',     'dry_goods', 'Italian durum wheat penne, 500g.',              0.49, '/products/pantry_pasta.jpg', '500g',               true,  60,  false, null, true, 14),
('pantry_rice',           'basmati-rice-1kg',       'Basmati Rice',                    'AH',           'pantry',     'dry_goods', 'Aromatic long-grain basmati rice, 1kg.',        0.99, '/products/pantry_rice.jpg', '1kg',                true,  90,  false, null, true, 14),
('pantry_cereal',         'crunchy-muesli-500g',    'Crunchy Muesli',                  'AH',           'pantry',     'breakfast', 'Roasted oats, hazelnuts and raisins muesli.',   1.19, '/products/pantry_cereal.jpg', '500g',               true,  20,  false, null, true, 14),
('pantry_peanutbutter',   'pindakaas-naturel',      'Peanut Butter Naturel',           'Calvé',        'pantry',     'spreads',   'Smooth peanut butter, no added sugar.',         1.19, '/products/pantry_peanutbutter.jpg', '350g jar',           true,  30,  false, null, true, 14),

-- Dairy & Eggs (5)
('dairy_milk',            'halfvolle-melk-1l',      'Semi-Skimmed Milk',               'AH',           'dairy',      'milk',      'Fresh semi-skimmed dairy milk, 1 litre.',       0.49, '/products/dairy_milk.jpg', '1L carton',          true,  5,   false, null, true, 14),
('dairy_cheese',          'jong-belegen-kaas',      'Jong Belegen Cheese',             'AH',           'dairy',      'cheese',    'Mild Dutch matured cheese, sliced.',            1.49, '/products/dairy_cheese.jpg', '200g sliced',        true,  14,  false, null, true, 14),
('dairy_eggs',            'scharreleieren-10st',    'Free-Range Eggs',                 'AH',           'dairy',      'eggs',      'Free-range eggs, pack of 10.',                  1.19, '/products/dairy_eggs.jpg', '10 pack',            true,  21,  false, null, true, 14),
('dairy_yogurt',          'volle-yoghurt-1l',       'Full-Fat Yogurt',                 'AH',           'dairy',      'yogurt',    'Creamy full-fat plain yogurt.',                 0.69, '/products/dairy_yogurt.jpg', '1L tub',             true,  10,  false, null, true, 14),
('dairy_butter',          'roomboter-250g',         'Salted Butter',                   'AH',           'dairy',      'butter',    'Traditional Dutch salted creamery butter.',     0.99, '/products/dairy_butter.jpg', '250g block',         true,  30,  false, null, true, 14),

-- Produce (5)
('produce_apples',        'elstar-appels-1kg',      'Elstar Apples',                   'AH',           'produce',    'fruit',     'Crisp Dutch Elstar apples, 1kg.',               0.89, '/products/produce_apples.jpg', '1kg',                true,  10,  false, null, true, 14),
('produce_bananas',       'bananen-1kg',            'Bananas',                         'Chiquita',     'produce',    'fruit',     'Ripe yellow bananas, 1kg.',                     0.69, '/products/produce_bananas.jpg', '1kg',                true,  6,   false, null, true, 14),
('produce_tomatoes',      'cherrytomaten-500g',     'Cherry Tomatoes',                 'AH',           'produce',    'vegetable', 'Sweet on-the-vine cherry tomatoes.',            0.79, '/products/produce_tomatoes.jpg', '500g',               true,  7,   false, null, true, 14),
('produce_lettuce',       'ijsbergsla',             'Iceberg Lettuce',                 'AH',           'produce',    'vegetable', 'Fresh iceberg lettuce head.',                   0.49, '/products/produce_lettuce.jpg', '1 head',             true,  7,   false, null, true, 14),
('produce_potatoes',      'kruimige-aardappels',    'Floury Potatoes',                 'AH',           'produce',    'vegetable', 'Dutch floury potatoes, ideal for mashing.',     0.99, '/products/produce_potatoes.jpg', '2kg net',            true,  21,  false, null, true, 14),

-- Drinks (5)
('drinks_coffee',          'koffiebonen-1kg',       'Espresso Coffee Beans',           'Perla',        'drinks',     'coffee',    'Italian-roast espresso whole beans, 1kg.',      3.99, '/products/drinks_coffee.jpg', '1kg bag',            true,  60,  false, null, true, 14),
('drinks_tea',             'engelse-thee-20zk',     'English Breakfast Tea',           'Pickwick',     'drinks',     'tea',       '20 tea bags, robust English Breakfast blend.',  0.89, '/products/drinks_tea.jpg', '20 bags',            true,  60,  false, null, true, 14),
('drinks_oj',              'jus-d''orange-1l',      'Fresh Orange Juice',              'AH',           'drinks',     'juice',     'Freshly squeezed orange juice, not from concentrate.', 1.19, '/products/drinks_oj.jpg', '1L', true,  7,   false, null, true, 14),
('drinks_sparkling',       'spa-rood-1.5l',         'Spa Rood Sparkling Water',        'Spa',          'drinks',     'water',     'Belgian sparkling mineral water, 1.5L.',        0.49, '/products/drinks_sparkling.jpg', '1.5L bottle',        true,  90,  false, null, true, 14),
('drinks_beer',            'heineken-6pack',        'Heineken Lager',                  'Heineken',     'drinks',     'beer',      'Heineken pilsner, 6 × 330ml bottles.',          2.49, '/products/drinks_beer.jpg', '6 × 330ml',          true,  120, false, null, true, 14),

-- Pet (4)
('pet_dogfood_small',      'dog-food-2-6kg',        'Dog Food 2.6kg',                  'Bonzo',        'pet',        'dog_food',  'Complete food for adult dogs.',                 5.99, '/products/pet_dogfood_small.jpg', '2.6kg bag',          true,  30,  false, null, true, 14),
('pet_dogfood_large',      'dog-food-12kg',         'Dog Food 12kg',                   'Bonzo',        'pet',        'dog_food',  'Complete food for adult dogs, family bag.',    12.99, '/products/pet_dogfood_large.jpg', '12kg bag',           true,  90,  false, null, true, 14),
('pet_dogtreats',          'hondensnack-meatsticks','Dog Treat Meat Sticks',           'Bonzo',        'pet',        'dog_treats','Soft meat sticks for adult dogs, 12-pack.',     1.49, '/products/pet_dogtreats.jpg', '12 sticks',          true,  21,  false, null, true, 14),
('pet_catfood',            'kattenvoer-brokjes',    'Cat Food Kibble',                 'Whiskas',      'pet',        'cat_food',  'Complete dry food for adult cats.',             3.49, '/products/pet_catfood.jpg', '1.5kg bag',          true,  30,  false, null, true, 14),

-- Household (4)
('home_toiletpaper',       'toiletpapier-12rol',    'Toilet Paper 12-roll',            'AH',           'household',  'paper',     '3-ply soft toilet paper, 12 rolls.',            2.49, '/products/home_toiletpaper.jpg', '12 rolls',           true,  45,  false, null, true, 14),
('home_kitchenpaper',      'keukenrol-4rol',        'Kitchen Paper Towels 4-roll',     'AH',           'household',  'paper',     'Absorbent kitchen paper towels, 4 rolls.',      1.49, '/products/home_kitchenpaper.jpg', '4 rolls',            true,  30,  false, null, true, 14),
('home_dishsoap',          'afwasmiddel-citroen',   'Dishwashing Liquid Lemon',        'Dreft',        'household',  'cleaning',  'Concentrated dish soap, lemon scent.',          0.99, '/products/home_dishsoap.jpg', '650ml bottle',       true,  60,  false, null, true, 14),
('home_laundry',           'wasmiddel-color',       'Laundry Detergent Color',         'Robijn',       'household',  'cleaning',  'Colour-protect laundry detergent, 35 washes.',  2.99, '/products/home_laundry.jpg', '35 washes',          true,  60,  false, null, true, 14),

-- Snacks (2)
('snacks_stroopwafels',    'stroopwafels-8st',      'Stroopwafels',                    'Daelmans',     'snacks',     'sweet',     'Traditional Dutch caramel waffles, 8-pack.',    0.99, '/products/snacks_stroopwafels.jpg', '8 pack',             true,  20,  false, null, true, 14),
('snacks_chocolate',       'puur-chocolade-100g',   'Pure Chocolate 70%',              'Tony''s Chocolonely', 'snacks', 'sweet',  'Fair trade dark chocolate, 70% cocoa.',         1.19, '/products/snacks_chocolate.jpg', '180g bar',           true,  30,  false, null, true, 14),

-- Subscription (1) — AH Plus membership
('membership_ahplus',      'ah-plus-membership',    'AH Plus Membership',              'AH',           'subscription','membership','Monthly household benefits.',                   1.99, '/products/membership_ahplus.jpg', 'monthly',            false, null, true,  30,  true, 14)
on conflict (id) do update set
  slug                            = excluded.slug,
  name                            = excluded.name,
  brand                           = excluded.brand,
  category                        = excluded.category,
  subcategory                     = excluded.subcategory,
  description                     = excluded.description,
  price                           = excluded.price,
  image_url                       = excluded.image_url,
  unit_label                      = excluded.unit_label,
  consumable                      = excluded.consumable,
  default_estimated_duration_days = excluded.default_estimated_duration_days,
  subscription                    = excluded.subscription,
  cycle_days                      = excluded.cycle_days,
  refundable                      = excluded.refundable,
  refund_window_days              = excluded.refund_window_days;
