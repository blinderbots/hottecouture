-- Simple Master Import Script for Hotte Couture Catalog
-- This script imports ALL data from the catalog JSON file without conflicts
-- Run this script in Supabase SQL Editor to import complete catalog data

-- ========================================
-- STEP 1: Create New Tables
-- ========================================

-- 1. Create materials table
CREATE TABLE IF NOT EXISTS material (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(200) NOT NULL,
    price_cents INTEGER NOT NULL,
    category VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create accessories table
CREATE TABLE IF NOT EXISTS accessory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(200) NOT NULL,
    price_cents INTEGER NOT NULL,
    category VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create project_pricing table
CREATE TABLE IF NOT EXISTS project_pricing (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(200) NOT NULL,
    price_cents INTEGER NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Create pricing_rules table
CREATE TABLE IF NOT EXISTS pricing_rule (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(200) NOT NULL,
    rule_type VARCHAR(50) NOT NULL,
    base_price_cents INTEGER NOT NULL,
    unit_type VARCHAR(20),
    min_quantity INTEGER DEFAULT 1,
    max_quantity INTEGER,
    category VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- STEP 2: Update Existing Tables
-- ========================================

-- Update garment_type table
ALTER TABLE garment_type 
ADD COLUMN IF NOT EXISTS base_price_cents INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS pricing_model VARCHAR(20) DEFAULT 'fixed',
ADD COLUMN IF NOT EXISTS unit_type VARCHAR(20) DEFAULT 'piece',
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS is_material BOOLEAN DEFAULT FALSE;

-- Update service table
ALTER TABLE service 
ADD COLUMN IF NOT EXISTS pricing_model VARCHAR(20) DEFAULT 'fixed',
ADD COLUMN IF NOT EXISTS base_unit VARCHAR(20) DEFAULT 'piece',
ADD COLUMN IF NOT EXISTS min_quantity INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS max_quantity INTEGER,
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS estimated_hours DECIMAL(4,2);

-- ========================================
-- STEP 3: Clear existing data (optional)
-- ========================================

-- Uncomment these lines if you want to clear existing data first
-- DELETE FROM material;
-- DELETE FROM accessory;
-- DELETE FROM project_pricing;
-- DELETE FROM pricing_rule;

-- ========================================
-- STEP 4: Import ALL Materials (26 items)
-- ========================================

INSERT INTO material (name, price_cents, category, is_active) VALUES
('Aurore 110"', 1600, 'fabric', true),
('Blackout Dim-Out 110"', 4350, 'fabric', true),
('Blackout Dim-Out 54" Blanc', 2100, 'fabric', true),
('Blackout Dim-Out 54" Noir', 2800, 'fabric', true),
('Blackout Nightfall 110"', 3450, 'fabric', true),
('Blackout Nightfall 54"', 2500, 'fabric', true),
('Blackout Nightfall 54" Beige', 1750, 'fabric', true),
('Cordura Denier 500', 1600, 'fabric', true),
('Coton', 50, 'fabric', true),
('Coton blanc 45"', 850, 'fabric', true),
('Cuirette', 150, 'fabric', true),
('Dim-Out', 100, 'fabric', true),
('Doublure Aurore 110"', 1550, 'fabric', true),
('Doublure nylon imperméable', 950, 'fabric', true),
('Hydro Fend 60"', 3500, 'fabric', true),
('Kodel', 460, 'fabric', true),
('Morceau de tissu pour réparation (exemple Cordura)', 500, 'fabric', true),
('Phifertex (rouleau en stock)', 3000, 'fabric', true),
('Rembourrage', 150, 'fabric', true),
('Saletex Chardonnay (avec fil de plomb) 118"', 3000, 'fabric', true),
('Sunbrella', 250, 'fabric', true),
('Sunbrella (rouleau en stock)', 3000, 'fabric', true),
('Tissu Adrien 100% coton', 1200, 'fabric', true),
('Typar', 125, 'fabric', true),
('Velours', 150, 'fabric', true),
('Voilage', 100, 'fabric', true);

-- ========================================
-- STEP 5: Import ALL Accessories (100+ items)
-- ========================================

INSERT INTO accessory (name, price_cents, category, is_active) VALUES
-- Tools
('Aiguilles à machine', 699, 'tools', true),
('Boite de craie', 1135, 'tools', true),
('Craie', 175, 'tools', true),
('Fabric Gard Canette', 3000, 'tools', true),
('Fabric Gard Spray', 6000, 'tools', true),
('Fil Tex 60 (Bobine 3750v)', 1200, 'tools', true),
('Fil à surjeter Bobine 150m (meuble à l''avant)', 300, 'tools', true),
('Fil à surjeteuse Tex 27 (Bobine 6000v)', 600, 'tools', true),
('Fil élastique - Bobine 1000m', 800, 'tools', true),
('Fils à jeans Tex80 - Bobine 200m', 700, 'tools', true),
('mètre', 160, 'tools', true),
('Patch à genoux 4'' x 6"', 475, 'tools', true),

-- Hardware - Rails and Supports
('Rail 1-1/8" Ripplefold 10 pieds', 0, 'hardware', true),
('Rail 1-1/8" Ripplefold 12 pieds', 0, 'hardware', true),
('Rail 1-1/8" Ripplefold 16 pieds', 0, 'hardware', true),
('Rail 1-1/8" Ripplefold 6 pieds', 0, 'hardware', true),
('Rail 1-1/8" Ripplefold 8 pieds', 0, 'hardware', true),
('Rail 1-3/8" Ripplefold', 0, 'hardware', true),
('Rail CRS 28mm Blanc', 0, 'hardware', true),
('Rail CRS 28mm Inox/Gold/Blanc/Taupe/Bronze/Graphite', 0, 'hardware', true),
('Rail CRS 28mm Noir / Gris / Or / Bronze', 0, 'hardware', true),
('Rail DS blanche', 450, 'hardware', true),
('Rail KS Noir / Gris / Ivoire', 0, 'hardware', true),
('RAIL MEDICTRACK', 550, 'hardware', true),
('RAIL RKS - Recessed noir', 0, 'hardware', true),
('Support Murs 3-1/2"', 0, 'hardware', true),
('Support Murs 3-1/2" (Rond chic))', 0, 'hardware', true),
('Support Murs Blanc', 0, 'hardware', true),
('Support Plafond Blanc', 100, 'hardware', true),
('Support Suspension 12"', 0, 'hardware', true),
('Support Suspension 24"', 0, 'hardware', true),
('Support Suspension 36"', 0, 'hardware', true),
('Support Suspension 48"', 0, 'hardware', true),
('Support Suspension 60"', 0, 'hardware', true),
('Support Suspension 72"', 0, 'hardware', true),
('Tringle lisse 144"', 0, 'hardware', true),

-- Hardware - Rods and Tracks
('Bâton fibre 30" Clear', 0, 'hardware', true),
('Bâton fibre 36" Blanc', 0, 'hardware', true),
('Bâton fibre 48" Blanc', 0, 'hardware', true),
('Bâton fibre 48" Clear', 0, 'hardware', true),
('Bâton fibre 60" Blanc', 0, 'hardware', true),
('Bâton fibre 96" Blanc', 0, 'hardware', true),
('Bâton transparent 30"', 0, 'hardware', true),

-- Hardware - Carriers and Hooks
('Chariot Crochets', 200, 'hardware', true),
('Chariot Maitre', 0, 'hardware', true),
('Chariot Ripplefold Blanc 60%', 80, 'hardware', true),
('Chariot Ripplefold Blanc 80%', 0, 'hardware', true),
('Crochet rideaux métal 1-3/8"', 15, 'hardware', true),
('Crochets à rideau de type Wave', 25, 'hardware', true),
('Master carriers Start (3 snaps)', 0, 'hardware', true),

-- Hardware - Cords and Strings
('Corde plombée', 60, 'hardware', true),
('Corde à capuchon', 60, 'hardware', true),
('Corde à piping', 35, 'hardware', true),
('Corde à piping 1/2', 225, 'hardware', true),
('Corde à piping 5/16', 100, 'hardware', true),
('Cordon élastique (rond) blanc ou noir', 115, 'hardware', true),

-- Hardware - Straps and Webbing
('Courroie nylon 1po', 75, 'hardware', true),
('Courroie polypropylène 1.5po (Webbing)', 195, 'hardware', true),
('Courroie polypropylène 1po (Webbing)', 145, 'hardware', true),

-- Hardware - Sliders and Zippers
('Curseur #3 ou #5', 50, 'hardware', true),
('Curseur #7 ou #10', 50, 'hardware', true),
('Snap antique Brass (2 parties)', 75, 'hardware', true),

-- Hardware - Trim and Binding
('Bande élastique 1po', 295, 'hardware', true),
('Biais', 120, 'hardware', true),
('Biais Sunbrella', 400, 'hardware', true),
('Galon croisé 3/4po', 109, 'hardware', true),
('Pelon 4po', 75, 'hardware', true),
('Pelon 6po', 90, 'hardware', true),
('Ruban ripplefold blanc', 300, 'hardware', true),
('Ruban ripplefold transparent', 400, 'hardware', true),
('Tête de rideau de type entoilage multifonction', 200, 'hardware', true),
('Tête de rideau de type entoilage multifonction (2,5v)', 175, 'hardware', true),

-- Hardware - Velcro
('Velcros 1-1/2"', 118, 'hardware', true),
('Velcros autocollant 1" (mâle ou femelle)', 290, 'hardware', true),
('Velcros autocollant 1-1/2" (mâle ou femelle)', 400, 'hardware', true),
('Velcros autocollant 2" (mâle ou femelle)', 550, 'hardware', true),
('Velcros à coudre 1" (mâle ou femelle)', 140, 'hardware', true),
('Velcros à coudre 1-1/2" (mâle ou femelle)', 225, 'hardware', true),
('Velcros à coudre 2" (mâle ou femelle)', 275, 'hardware', true),

-- Hardware - Elastic
('Élastique 4mm blanc', 75, 'hardware', true),
('Élastique 6mm blanc ou noir', 100, 'hardware', true),
('Élastique Bretelle 1-1/2"', 370, 'hardware', true),
('Élastique tricoté 1"', 75, 'hardware', true),
('Élastique tricoté 1-1/2"', 125, 'hardware', true),
('Élastique tricoté 1-1/4"', 85, 'hardware', true),
('Élastique tricoté 2"', 150, 'hardware', true),

-- Hardware - Brackets and Mounts
('Bracket 2-1/4" à 5-1/8" Ajustable', 0, 'hardware', true),
('Bracket ajustable', 0, 'hardware', true),
('Embout d''arret et capuchon blanc', 0, 'hardware', true),
('Embout décoratif (pair)', 0, 'hardware', true),

-- Miscellaneous
('Description', 10, 'misc', true),
('Frais admin', 0, 'misc', true),
('Frais admin KLAUDE', 10, 'misc', true),
('Prix unitaire', 100, 'misc', true),
('Shipping', 0, 'misc', true),

-- Additional items from garment_types
('Bâton fibre 36" Blanc', 200, 'hardware', true),
('Bâton fibre 48" Blanc', 0, 'hardware', true),
('Bâton fibre 60" Blanc', 0, 'hardware', true),
('Bâton fibre 96" Blanc', 0, 'hardware', true),
('Bâton transparent 30"', 0, 'hardware', true),
('Chariot Maitre', 0, 'hardware', true),
('Chariot Ripplefold Blanc 60%', 80, 'hardware', true),
('Corde légèrement plombée', 0, 'hardware', true),
('Corde Piping', 0, 'hardware', true),
('Courbe CS', 0, 'hardware', true),
('Courbe DS', 0, 'hardware', true),
('Courbe KS', 0, 'hardware', true),
('Curseur', 30, 'hardware', true),
('Curseur fermeture éclair', 30, 'hardware', true),
('Embout d''arret et capuchon blanc', 180, 'hardware', true),
('Entoilage rideaux', 0, 'hardware', true),
('Fermetures éclairs', 83, 'hardware', true),
('Rail DS blanche', 0, 'hardware', true),
('Rail KS Noir / Gris / Ivoire', 500, 'hardware', true),
('Ruban Ripplefold noir ou transparent', 0, 'hardware', true),
('Ruban à pression 4.50" RT75.25', 0, 'hardware', true),
('Support Murs Blanc', 300, 'hardware', true),
('Support Plafond Blanc', 0, 'hardware', true),

-- Foam and Cushion Materials
('Foam Assise 1.8 - 1"', 0, 'materials', true),
('Foam Assise 1.8 - 2"', 0, 'materials', true),
('Foam Assise 1.8 - 3"', 0, 'materials', true),
('Foam Assise 1.8 - 4"', 2000, 'materials', true),
('Foam Assise 1.8 - 5"', 0, 'materials', true),
('Foam Assise 1.8 - 6"', 0, 'materials', true),
('Foam Dossier 1118', 0, 'materials', true),
('Foam extérieur Ennis', 0, 'materials', true),
('Polyester Foam - KODEL', 460, 'materials', true),

-- Fabric Materials
('Dune 019', 175, 'materials', true),
('Intimate 040 - 58"', 100, 'materials', true),
('Maxwell', 1150, 'materials', true),
('Nightfall 54"', 0, 'materials', true),
('Pelon Wave', 170, 'materials', true),

-- Pricing and Admin
('Prix par Store', 100, 'misc', true),
('Prix unitaire', 10505, 'misc', true),
('Prix unitaire RETAIL', 9792, 'misc', true),
('Frais Admin', 5, 'misc', true),
('Frais admin', 10, 'misc', true),
('SHIPPING', 0, 'misc', true),
('Shipping', 33, 'misc', true),
('SUNBRELLA', 556, 'materials', true),
('Temps', 175, 'misc', true),
('Temps FOAM', 125, 'misc', true),
('Tissu dessous', 0, 'materials', true),
('Tissu piping', 0, 'materials', true),
('à la verge', 13, 'misc', true),
('Étiquette', 30, 'misc', true),

-- Services from garment_types
('Confection couture', 300, 'services', true),
('Confection couture incluant ganse', 800, 'services', true);

-- ========================================
-- STEP 6: Import ALL Services (16 items)
-- ========================================

INSERT INTO service (code, name, base_price_cents, category, is_custom, pricing_model, base_unit, min_quantity, description, estimated_hours) VALUES
('AJOUT_ENTOILAGE', 'AJOUT D''UN ENTOILAGE', 2750, 'curtains', false, 'fixed', 'piece', 1, 'Add lining to curtains', 2.0),
('AJOUT_INSERTION', 'AJOUT D''UNE INSERTION', 3500, 'curtains', false, 'fixed', 'piece', 1, 'Add insertion to curtains', 2.5),
('AVEC_PIPING', 'Avec Piping', 5500, 'curtains', false, 'fixed', 'piece', 1, 'Add piping to curtains', 3.0),
('BORD_RIDEAU', 'BORD DE RIDEAU (54" large)', 1500, 'curtains', false, 'per_linear_foot', 'linear_foot', 1, 'Add border to curtains', 1.0),
('RIDEAU_AUTRES_PLIS', 'RIDEAU AUTRES PLIS', 11500, 'curtains', false, 'fixed', 'piece', 1, 'Other pleat styles for curtains', 4.0),
('VOILAGE', 'VOILAGE (54" large)', 4000, 'curtains', false, 'per_linear_foot', 'linear_foot', 1, 'Sheer curtain treatment', 2.0),
('STORE_ROMAIN', 'STORE ROMAIN (prix au P.C.)', 700, 'roman_shades', false, 'per_square_foot', 'square_foot', 1, 'Roman shade construction', 1.5),
('COUSSIN_STANDARD', 'COUSSIN STANDARD', 3000, 'upholstery', false, 'fixed', 'piece', 1, 'Standard cushion construction', 2.0),
('MODIFICATION_PLIS', 'MODIFICATION DE PLIS', 3500, 'upholstery', false, 'fixed', 'piece', 1, 'Modify pleats on upholstery', 2.0),
('JUPES_LIT_PLIS', 'JUPES DE LIT AVEC PLIS', 11000, 'bedding', false, 'fixed', 'piece', 1, 'Bed skirt with pleats', 4.0),
('JUPES_LIT_SANS_PLIS', 'JUPES DE LIT SANS PLIS', 8000, 'bedding', false, 'fixed', 'piece', 1, 'Bed skirt without pleats', 3.0),
('TETE_LIT', 'TÊTE DE LIT', 3500, 'bedding', false, 'fixed', 'piece', 1, 'Headboard treatment', 2.5),
('TETE_ENTOILAGE', 'TÊTE ENTOILAGE', 4500, 'bedding', false, 'fixed', 'piece', 1, 'Headboard with lining', 3.0),
('BOUTONS_RECOUVERT', 'BOUTONS RECOUVERT', 175, 'general', false, 'per_piece', 'piece', 1, 'Cover buttons', 0.5),
('BRETELLE_CACHEE', 'BRETELLE CACHÉE', 6000, 'general', false, 'fixed', 'piece', 1, 'Hidden strap construction', 3.0),
('PASSE_POLE', 'PASSE POLE', 4000, 'general', false, 'per_linear_foot', 'linear_foot', 1, 'Pole pocket construction', 1.5),
('STANDARD', 'Standard', 3500, 'general', false, 'fixed', 'piece', 1, 'Standard alteration service', 2.0);

-- ========================================
-- STEP 7: Import Project Pricing (1 item)
-- ========================================

INSERT INTO project_pricing (name, price_cents, is_active) VALUES
('création d''un patron', 19500, true);

-- ========================================
-- STEP 8: Create Indexes
-- ========================================

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_material_name ON material(name);
CREATE INDEX IF NOT EXISTS idx_material_category ON material(category);
CREATE INDEX IF NOT EXISTS idx_material_is_active ON material(is_active);

CREATE INDEX IF NOT EXISTS idx_accessory_name ON accessory(name);
CREATE INDEX IF NOT EXISTS idx_accessory_category ON accessory(category);
CREATE INDEX IF NOT EXISTS idx_accessory_is_active ON accessory(is_active);

CREATE INDEX IF NOT EXISTS idx_project_pricing_name ON project_pricing(name);
CREATE INDEX IF NOT EXISTS idx_project_pricing_is_active ON project_pricing(is_active);

CREATE INDEX IF NOT EXISTS idx_pricing_rule_name ON pricing_rule(name);
CREATE INDEX IF NOT EXISTS idx_pricing_rule_type ON pricing_rule(rule_type);
CREATE INDEX IF NOT EXISTS idx_pricing_rule_category ON pricing_rule(category);
CREATE INDEX IF NOT EXISTS idx_pricing_rule_is_active ON pricing_rule(is_active);

-- ========================================
-- COMPLETION MESSAGE
-- ========================================

-- This will show a success message when the script completes
DO $$
BEGIN
    RAISE NOTICE '🎉 COMPLETE Catalog import completed successfully!';
    RAISE NOTICE '📊 Summary:';
    RAISE NOTICE '  - Materials: % items', (SELECT COUNT(*) FROM material);
    RAISE NOTICE '  - Accessories: % items', (SELECT COUNT(*) FROM accessory);
    RAISE NOTICE '  - Services: % items', (SELECT COUNT(*) FROM service);
    RAISE NOTICE '  - Project Pricing: % items', (SELECT COUNT(*) FROM project_pricing);
    RAISE NOTICE '  - All catalog data imported successfully!';
    RAISE NOTICE '✅ System ready for use!';
END $$;
