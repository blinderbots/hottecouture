const fs = require('fs');
const path = require('path');

// Read the JSON file
const jsonPath = '/Users/raj/Downloads/LISTE-PRIX-BOUTIQUE-2025 (2).items.json';
const jsonData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

// Map categories from French to English
const categoryMap = {
  'PRIX PROJET': 'projects',
  'PRIX ALTÉRATIONS ': 'alterations',
  'PRIX ACCESSOIRES': 'accessories',
  'PRIX TISSUS': 'fabrics',
  'PRIX RIDEAUX': 'curtains',
  'PRIX CUSTOM': 'custom',
};

// Generate SQL insert statements
const services = [];
let serviceId = 1;

jsonData.items.forEach((item, index) => {
  const category = categoryMap[item.category] || 'custom';
  const name = item.name.trim();
  const priceCents = Math.round(item.price * 100); // Convert to cents

  // Generate a unique code
  const code = `SVC_${String(serviceId).padStart(3, '0')}`;

  // Determine pricing model
  let pricingModel = 'fixed';
  let hourlyRateCents = null;

  if (
    name.toLowerCase().includes('heure') ||
    name.toLowerCase().includes('hourly')
  ) {
    pricingModel = 'hourly';
    hourlyRateCents = priceCents;
  } else if (
    name.toLowerCase().includes('minute') ||
    name.toLowerCase().includes('5 minutes')
  ) {
    pricingModel = 'per_minute';
    hourlyRateCents = Math.round(priceCents * 12); // Convert per-5-minutes to hourly rate
  }

  services.push({
    id: `service-${serviceId}`,
    code,
    name,
    description: null,
    base_price_cents: pricingModel === 'hourly' ? 0 : priceCents,
    category,
    pricing_model: pricingModel,
    hourly_rate_cents: hourlyRateCents,
    time_increment_minutes: 5,
    display_order: index,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });

  serviceId++;
});

// Generate SQL
const sqlStatements = [
  '-- Import services from JSON file',
  '-- Generated on ' + new Date().toISOString(),
  '',
  '-- Clear existing services (optional - comment out if you want to keep existing)',
  '-- DELETE FROM service;',
  '',
  '-- Insert new services',
  'INSERT INTO service (id, code, name, description, base_price_cents, category, pricing_model, hourly_rate_cents, time_increment_minutes, display_order, is_active, created_at, updated_at) VALUES',
];

// Add INSERT statements
services.forEach((service, index) => {
  const isLast = index === services.length - 1;
  const comma = isLast ? ';' : ',';

  sqlStatements.push(
    `  ('${service.id}', '${service.code}', '${service.name.replace(/'/g, "''")}', ${service.description ? `'${service.description.replace(/'/g, "''")}'` : 'NULL'}, ${service.base_price_cents}, '${service.category}', '${service.pricing_model}', ${service.hourly_rate_cents || 'NULL'}, ${service.time_increment_minutes}, ${service.display_order}, ${service.is_active}, '${service.created_at}', '${service.updated_at}')${comma}`
  );
});

// Add summary
sqlStatements.push('');
sqlStatements.push('-- Summary:');
sqlStatements.push(`-- Total services: ${services.length}`);
sqlStatements.push('-- Categories:');
Object.entries(
  services.reduce((acc, service) => {
    acc[service.category] = (acc[service.category] || 0) + 1;
    return acc;
  }, {})
).forEach(([category, count]) => {
  sqlStatements.push(`--   ${category}: ${count} services`);
});

// Write to file
const outputPath = path.join(__dirname, 'import-services.sql');
fs.writeFileSync(outputPath, sqlStatements.join('\n'));

console.log(`✅ Generated SQL file: ${outputPath}`);
console.log(`📊 Total services: ${services.length}`);
console.log('📋 Categories:');
Object.entries(
  services.reduce((acc, service) => {
    acc[service.category] = (acc[service.category] || 0) + 1;
    return acc;
  }, {})
).forEach(([category, count]) => {
  console.log(`   ${category}: ${count} services`);
});

console.log('\n🔧 Next steps:');
console.log('1. Review the generated SQL file');
console.log('2. Run it in your Supabase SQL editor');
console.log('3. Test the services step in your app');
