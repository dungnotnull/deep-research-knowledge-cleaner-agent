import * as fs from 'fs';
import * as path from 'path';

async function scanSecurity() {
  console.log('--- DRKC Security Scan ---');
  
  const files = fs.readdirSync(process.cwd());
  const sensitivePatterns = [
    /sk-ant-.* /, // Anthropic
    /sk-[a-zA-Z0-9]{32}/, // OpenAI
    /AIza[0-9A-Za-z-_]{35}/, // Google
  ];

  let leaks = 0;
  for (const file of files) {
    if (file.endsWith('.md') || file.endsWith('.ts') || file.endsWith('.py')) {
      const content = fs.readFileSync(path.join(process.cwd(), file), 'utf8');
      sensitivePatterns.forEach(pattern => {
        if (pattern.test(content)) {
          console.error(\CRITICAL: API Key leak found in \\);
          leaks++;
        }
      });
    }
  }

  if (leaks === 0) {
    console.log('No API keys leaked in source files. OK.');
  } else {
    console.error(\Found \ leaks. Please clean your source files!\);
  }
}

scanSecurity();
