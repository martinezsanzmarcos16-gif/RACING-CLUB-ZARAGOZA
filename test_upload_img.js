const fs = require('fs');
const env = fs.readFileSync('.env.local', 'utf8');
const url = env.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/)[1].trim();
const key = env.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.*)/)[1].trim();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(url, key);

async function testUpload() {
  // Create a 1x1 transparent png
  const buffer = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=', 'base64');
  const fileExt = 'png';
  const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
  
  const { data, error } = await supabase.storage.from('FOTOS JUGADORES').upload(fileName, buffer, {
    contentType: 'image/png'
  });
  console.log('Upload Image result:', data, error);
}

testUpload();
