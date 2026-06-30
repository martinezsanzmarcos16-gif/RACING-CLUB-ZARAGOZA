const { execSync } = require('child_process');

const url = 'https://itsgjfhxwrhpwqqkolmz.supabase.co';
const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml0c2dqZmh4d3JocHdxcWtvbG16Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI4Mjg2NjksImV4cCI6MjA5ODQwNDY2OX0.PVQTq6mEdyaEkALHhyh0W7w17sW6lDM1SnOqZpwSKSI';

try {
  execSync('cmd.exe /c npx vercel env add NEXT_PUBLIC_SUPABASE_URL production', { input: url });
  console.log('Added NEXT_PUBLIC_SUPABASE_URL');
} catch (e) {
  console.error(e.stdout?.toString());
  console.error(e.stderr?.toString());
}

try {
  execSync('cmd.exe /c npx vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production', { input: anonKey });
  console.log('Added NEXT_PUBLIC_SUPABASE_ANON_KEY');
} catch (e) {
  console.error(e.stdout?.toString());
  console.error(e.stderr?.toString());
}
