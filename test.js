const fs = require('fs');
const env = fs.readFileSync('.env.local', 'utf8');
const url = env.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/)[1].trim();
const key = env.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.*)/)[1].trim();

fetch(`${url}/rest/v1/?apikey=${key}`).then(r => r.json()).then(data => {
  fs.writeFileSync('schema.json', JSON.stringify(data, null, 2));
  console.log('Schema saved to schema.json');
}).catch(console.error);
