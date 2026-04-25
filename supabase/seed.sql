-- BunqPal AH Mock Site — Product seed
-- 30 catalog products + 1 membership SKU.
-- Run AFTER schema.sql in the Supabase SQL editor.
-- Idempotent: clears products & cart_items before inserting.

delete from public.cart_items;
delete from public.products;

-- Image URLs are direct Unsplash CDN links (free for commercial use).
-- Pattern: https://images.unsplash.com/photo-{id}?w=600&h=600&fit=crop&q=80&auto=format

insert into public.products
(id, slug, name, brand, category, subcategory, description, price, image_url, unit_label, consumable, default_estimated_duration_days, subscription, cycle_days, refundable, refund_window_days)
values

-- Pantry (5)
('pantry_bread',          'volkoren-brood',         'Wholegrain Bread',                'AH',           'pantry',     'bakery',    'Sliced wholegrain bread, baked daily.',         2.19, 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&h=600&fit=crop&q=80&auto=format', '800g loaf',          true,  6,   false, null, true, 14),
('pantry_pasta',          'penne-pasta-500g',       'Penne Pasta',                     'AH',           'pantry',     'dry_goods', 'Italian durum wheat penne, 500g.',              1.29, 'https://images.unsplash.com/photo-1551892589-865f69869476?w=600&h=600&fit=crop&q=80&auto=format', '500g',               true,  60,  false, null, true, 14),
('pantry_rice',           'basmati-rice-1kg',       'Basmati Rice',                    'AH',           'pantry',     'dry_goods', 'Aromatic long-grain basmati rice, 1kg.',        2.79, 'https://images.unsplash.com/photo-1604152135912-04a022e23696?w=600&h=600&fit=crop&q=80&auto=format', '1kg',                true,  90,  false, null, true, 14),
('pantry_cereal',         'crunchy-muesli-500g',    'Crunchy Muesli',                  'AH',           'pantry',     'breakfast', 'Roasted oats, hazelnuts and raisins muesli.',   3.49, 'https://images.unsplash.com/photo-1505252585461-04db1eb84625?w=600&h=600&fit=crop&q=80&auto=format', '500g',               true,  20,  false, null, true, 14),
('pantry_peanutbutter',   'pindakaas-naturel',      'Peanut Butter Naturel',           'Calvé',        'pantry',     'spreads',   'Smooth peanut butter, no added sugar.',         3.19, 'https://images.unsplash.com/photo-1568819317551-31051b37f69f?w=600&h=600&fit=crop&q=80&auto=format', '350g jar',           true,  30,  false, null, true, 14),

-- Dairy & Eggs (5)
('dairy_milk',            'halfvolle-melk-1l',      'Semi-Skimmed Milk',               'AH',           'dairy',      'milk',      'Fresh semi-skimmed dairy milk, 1 litre.',       1.19, 'https://images.unsplash.com/photo-1600788886242-5c96aabe3757?w=600&h=600&fit=crop&q=80&auto=format', '1L carton',          true,  5,   false, null, true, 14),
('dairy_cheese',          'jong-belegen-kaas',      'Jong Belegen Cheese',             'AH',           'dairy',      'cheese',    'Mild Dutch matured cheese, sliced.',            4.49, 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=600&h=600&fit=crop&q=80&auto=format', '200g sliced',        true,  14,  false, null, true, 14),
('dairy_eggs',            'scharreleieren-10st',    'Free-Range Eggs',                 'AH',           'dairy',      'eggs',      'Free-range eggs, pack of 10.',                  3.29, 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=600&h=600&fit=crop&q=80&auto=format', '10 pack',            true,  21,  false, null, true, 14),
('dairy_yogurt',          'volle-yoghurt-1l',       'Full-Fat Yogurt',                 'AH',           'dairy',      'yogurt',    'Creamy full-fat plain yogurt.',                 1.89, 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=600&h=600&fit=crop&q=80&auto=format', '1L tub',             true,  10,  false, null, true, 14),
('dairy_butter',          'roomboter-250g',         'Salted Butter',                   'AH',           'dairy',      'butter',    'Traditional Dutch salted creamery butter.',     2.59, 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=600&h=600&fit=crop&q=80&auto=format', '250g block',         true,  30,  false, null, true, 14),

-- Produce (5)
('produce_apples',        'elstar-appels-1kg',      'Elstar Apples',                   'AH',           'produce',    'fruit',     'Crisp Dutch Elstar apples, 1kg.',               2.49, 'https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=600&h=600&fit=crop&q=80&auto=format', '1kg',                true,  10,  false, null, true, 14),
('produce_bananas',       'bananen-1kg',            'Bananas',                         'Chiquita',     'produce',    'fruit',     'Ripe yellow bananas, 1kg.',                     1.79, 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=600&h=600&fit=crop&q=80&auto=format', '1kg',                true,  6,   false, null, true, 14),
('produce_tomatoes',      'cherrytomaten-500g',     'Cherry Tomatoes',                 'AH',           'produce',    'vegetable', 'Sweet on-the-vine cherry tomatoes.',            2.29, 'https://images.unsplash.com/photo-1582284540020-8acbe03f4924?w=600&h=600&fit=crop&q=80&auto=format', '500g',               true,  7,   false, null, true, 14),
('produce_lettuce',       'ijsbergsla',             'Iceberg Lettuce',                 'AH',           'produce',    'vegetable', 'Fresh iceberg lettuce head.',                   1.29, 'https://images.unsplash.com/photo-1622206151226-18ca2c9ab4a1?w=600&h=600&fit=crop&q=80&auto=format', '1 head',             true,  7,   false, null, true, 14),
('produce_potatoes',      'kruimige-aardappels',    'Floury Potatoes',                 'AH',           'produce',    'vegetable', 'Dutch floury potatoes, ideal for mashing.',     2.99, 'https://images.unsplash.com/photo-1582515073490-39981397c445?w=600&h=600&fit=crop&q=80&auto=format', '2kg net',            true,  21,  false, null, true, 14),

-- Drinks (5)
('drinks_coffee',          'koffiebonen-1kg',       'Espresso Coffee Beans',           'Perla',        'drinks',     'coffee',    'Italian-roast espresso whole beans, 1kg.',     12.99, 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=600&h=600&fit=crop&q=80&auto=format', '1kg bag',            true,  60,  false, null, true, 14),
('drinks_tea',             'engelse-thee-20zk',     'English Breakfast Tea',           'Pickwick',     'drinks',     'tea',       '20 tea bags, robust English Breakfast blend.',  2.49, 'https://images.unsplash.com/photo-1597481499750-3e6b22637e12?w=600&h=600&fit=crop&q=80&auto=format', '20 bags',            true,  60,  false, null, true, 14),
('drinks_oj',              'jus-d''orange-1l',      'Fresh Orange Juice',              'AH',           'drinks',     'juice',     'Freshly squeezed orange juice, not from concentrate.', 3.49, 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=600&h=600&fit=crop&q=80&auto=format', '1L', true,  7,   false, null, true, 14),
('drinks_sparkling',       'spa-rood-1.5l',         'Spa Rood Sparkling Water',        'Spa',          'drinks',     'water',     'Belgian sparkling mineral water, 1.5L.',        1.19, 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=600&h=600&fit=crop&q=80&auto=format', '1.5L bottle',        true,  90,  false, null, true, 14),
('drinks_beer',            'heineken-6pack',        'Heineken Lager',                  'Heineken',     'drinks',     'beer',      'Heineken pilsner, 6 × 330ml bottles.',          6.99, 'https://images.unsplash.com/photo-1608270586620-248524c67de9?w=600&h=600&fit=crop&q=80&auto=format', '6 × 330ml',          true,  120, false, null, true, 14),

-- Pet (4)
('pet_dogfood_small',      'dog-food-2-6kg',        'Dog Food 2.6kg',                  'Bonzo',        'pet',        'dog_food',  'Complete food for adult dogs.',                24.99, 'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=600&h=600&fit=crop&q=80&auto=format', '2.6kg bag',          true,  30,  false, null, true, 14),
('pet_dogfood_large',      'dog-food-12kg',         'Dog Food 12kg',                   'Bonzo',        'pet',        'dog_food',  'Complete food for adult dogs, family bag.',    54.99, 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=600&h=600&fit=crop&q=80&auto=format', '12kg bag',           true,  90,  false, null, true, 14),
('pet_dogtreats',          'hondensnack-meatsticks','Dog Treat Meat Sticks',           'Bonzo',        'pet',        'dog_treats','Soft meat sticks for adult dogs, 12-pack.',     3.99, 'https://images.unsplash.com/photo-1568640347023-a616a30bc3bd?w=600&h=600&fit=crop&q=80&auto=format', '12 sticks',          true,  21,  false, null, true, 14),
('pet_catfood',            'kattenvoer-brokjes',    'Cat Food Kibble',                 'Whiskas',      'pet',        'cat_food',  'Complete dry food for adult cats.',            12.99, 'https://images.unsplash.com/photo-1591946614720-90a587da4a36?w=600&h=600&fit=crop&q=80&auto=format', '1.5kg bag',          true,  30,  false, null, true, 14),

-- Household (4)
('home_toiletpaper',       'toiletpapier-12rol',    'Toilet Paper 12-roll',            'AH',           'household',  'paper',     '3-ply soft toilet paper, 12 rolls.',            7.49, 'https://images.unsplash.com/photo-1584556812952-905ffd0c611a?w=600&h=600&fit=crop&q=80&auto=format', '12 rolls',           true,  45,  false, null, true, 14),
('home_kitchenpaper',      'keukenrol-4rol',        'Kitchen Paper Towels 4-roll',     'AH',           'household',  'paper',     'Absorbent kitchen paper towels, 4 rolls.',      3.99, 'https://images.unsplash.com/photo-1581235720704-06d3acfcb36f?w=600&h=600&fit=crop&q=80&auto=format', '4 rolls',            true,  30,  false, null, true, 14),
('home_dishsoap',          'afwasmiddel-citroen',   'Dishwashing Liquid Lemon',        'Dreft',        'household',  'cleaning',  'Concentrated dish soap, lemon scent.',          2.49, 'https://images.unsplash.com/photo-1585421514738-01798e348b17?w=600&h=600&fit=crop&q=80&auto=format', '650ml bottle',       true,  60,  false, null, true, 14),
('home_laundry',           'wasmiddel-color',       'Laundry Detergent Color',         'Robijn',       'household',  'cleaning',  'Colour-protect laundry detergent, 35 washes.',  9.99, 'https://images.unsplash.com/photo-1610557892470-55d9e80c0bce?w=600&h=600&fit=crop&q=80&auto=format', '35 washes',          true,  60,  false, null, true, 14),

-- Snacks (2)
('snacks_stroopwafels',    'stroopwafels-8st',      'Stroopwafels',                    'Daelmans',     'snacks',     'sweet',     'Traditional Dutch caramel waffles, 8-pack.',    2.49, 'https://images.unsplash.com/photo-1612817288484-6f916006741a?w=600&h=600&fit=crop&q=80&auto=format', '8 pack',             true,  20,  false, null, true, 14),
('snacks_chocolate',       'puur-chocolade-100g',   'Pure Chocolate 70%',              'Tony''s Chocolonely', 'snacks', 'sweet',  'Fair trade dark chocolate, 70% cocoa.',         3.49, 'https://images.unsplash.com/photo-1606312619070-d48b4c652a52?w=600&h=600&fit=crop&q=80&auto=format', '180g bar',           true,  30,  false, null, true, 14),

-- Subscription (1) — AH Plus membership
('membership_ahplus',      'ah-plus-membership',    'AH Plus Membership',              'AH',           'subscription','membership','Monthly household benefits.',                   4.99, 'https://images.unsplash.com/photo-1556742502-ec7c0e9f34b1?w=600&h=600&fit=crop&q=80&auto=format', 'monthly',            false, null, true,  30,  true, 14);
