const fs = require('fs');
const files = [
  'src/components/partidos/PlanPartidoTab.tsx',
  'src/components/partidos/InformeRivalTab.tsx',
  'src/app/partidos/[id]/page.tsx'
];

files.forEach(f => {
  if (fs.existsSync(f)) {
    let content = fs.readFileSync(f, 'utf8');
    content = content.replace(/\\\`/g, '`').replace(/\\\${/g, '${');
    fs.writeFileSync(f, content);
    console.log('Fixed', f);
  }
});
