const fs = require('fs');
const env = fs.readFileSync('.env.local', 'utf8');
const url = env.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/)[1].trim();
const key = env.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.*)/)[1].trim();

async function testDemarcacion(val) {
  const r = await fetch(`${url}/rest/v1/jugadores`, {
    method: 'POST',
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation'
    },
    body: JSON.stringify({
      nombre: 'Test ' + val,
      dorsal: 99,
      demarcacion: val,
      edad: 25,
      forma_fisica: 100,
      foto_url: ''
    })
  });
  const text = await r.text();
  console.log(`Testing ${val}: `, r.status, text.slice(0, 100));
}

async function run() {
  await testDemarcacion('medio');
  await testDemarcacion('mediocentro');
  await testDemarcacion('centro');
}
run();
