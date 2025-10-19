-- Restore original garment types that were in the migration
-- This will add the missing garment types without affecting the new ones

INSERT INTO garment_type (code, name, category, icon, is_common, is_active) VALUES
-- Women's Clothing
('DRESS', 'Dress', 'womens', '👗', true, true),
('SKIRT', 'Skirt', 'womens', '👗', true, true),
('BLOUSE', 'Blouse', 'womens', '👚', true, true),
('PANTS', 'Pants', 'womens', '👖', true, true),
('JEANS', 'Jeans', 'womens', '👖', true, true),
('SHORTS', 'Shorts', 'womens', '🩳', true, true),
('LEGGINGS', 'Leggings', 'womens', '👖', false, true),
('JUMPSUIT', 'Jumpsuit', 'womens', '👗', false, true),
('ROMPER', 'Romper', 'womens', '👗', false, true),

-- Men's Clothing
('SHIRT', 'Shirt', 'mens', '👔', true, true),
('DRESS_SHIRT', 'Dress Shirt', 'mens', '👔', true, true),
('POLO', 'Polo Shirt', 'mens', '👕', true, true),
('T_SHIRT', 'T-Shirt', 'mens', '👕', true, true),
('TROUSERS', 'Trousers', 'mens', '👖', true, true),
('DRESS_PANTS', 'Dress Pants', 'mens', '👖', true, true),
('CHINOS', 'Chinos', 'mens', '👖', false, true),
('CARGO_PANTS', 'Cargo Pants', 'mens', '👖', false, true),

-- Outerwear
('JACKET', 'Jacket', 'outerwear', '🧥', true, true),
('BLAZER', 'Blazer', 'outerwear', '👔', true, true),
('COAT', 'Coat', 'outerwear', '🧥', true, true),
('SWEATER', 'Sweater', 'outerwear', '🧥', true, true),
('CARDIGAN', 'Cardigan', 'outerwear', '🧥', false, true),
('HOODIE', 'Hoodie', 'outerwear', '👕', false, true),
('VEST', 'Vest', 'outerwear', '🦺', false, true),

-- Formal Wear
('SUIT', 'Suit', 'formal', '👔', true, true),
('TUXEDO', 'Tuxedo', 'formal', '🎩', false, true),
('EVENING_GOWN', 'Evening Gown', 'formal', '👗', false, true),
('COCKTAIL_DRESS', 'Cocktail Dress', 'formal', '👗', false, true),

-- Activewear
('ATHLETIC_WEAR', 'Athletic Wear', 'activewear', '🏃', false, true),
('YOGA_PANTS', 'Yoga Pants', 'activewear', '🧘', false, true),
('SPORTS_JERSEY', 'Sports Jersey', 'activewear', '⚽', false, true),

-- Other
('OTHER', 'Other', 'other', '👕', true, true)

-- Only insert if they don't already exist
ON CONFLICT (code) DO NOTHING;
