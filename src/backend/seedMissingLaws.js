const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');

const backendEnv = path.resolve(__dirname, '.env');
if (fs.existsSync(backendEnv)) {
  dotenv.config({ path: backendEnv });
}
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config();

const supabase = require('./supabaseClient');

// Read all laws from seedSupabase.js
const seedContent = fs.readFileSync(path.join(__dirname, 'seedSupabase.js'), 'utf8');

// Load LAWS array using node require
// To do this cleanly, extract LAWS
const seedModule = require('./seedSupabase');

async function seedMissingLaws() {
  console.log('🔄 Checking existing laws in Supabase...');
  const { data: existing, error } = await supabase.from('laws').select('section');
  if (error) {
    console.error('Error fetching existing laws:', error.message);
    return;
  }

  const existingSections = new Set((existing || []).map(l => l.section));
  console.log(`Current existing sections in Supabase: ${existingSections.size}`);

  // Fetch full law list from supabase_schema.sql or parse
  // Let's get the LAWS from seedSupabase
  const vm = require('vm');
  const code = fs.readFileSync(path.join(__dirname, 'seedSupabase.js'), 'utf8');
  // Extract LAWS array
  const lawsMatch = code.match(/const LAWS = (\[[\s\S]*?\n\]);/);
  if (!lawsMatch) {
    console.error('Could not find LAWS array in seedSupabase.js');
    return;
  }

  const LAWS = eval(lawsMatch[1]);
  console.log(`Total defined laws in seedSupabase.js: ${LAWS.length}`);

  const missing = LAWS.filter(l => !existingSections.has(l.section));
  console.log(`Missing laws to insert: ${missing.length}`);

  if (missing.length === 0) {
    console.log('✅ All laws already exist in Supabase!');
    return;
  }

  // Insert in batches of 10
  for (let i = 0; i < missing.length; i += 10) {
    const chunk = missing.slice(i, i + 10);
    const { data, error: insertError } = await supabase.from('laws').insert(chunk).select('section');
    if (insertError) {
      console.error(`❌ Batch error:`, insertError.message);
      // Try one by one
      for (const item of chunk) {
        const { error: singleErr } = await supabase.from('laws').insert(item);
        if (singleErr) {
          console.error(`  Failed on ${item.section}: ${singleErr.message}`);
        } else {
          console.log(`  ✅ Inserted ${item.section}: ${item.title}`);
        }
      }
    } else {
      console.log(`✅ Inserted batch: ${chunk.map(c => c.section).join(', ')}`);
    }
  }

  const { count } = await supabase.from('laws').select('id', { count: 'exact', head: true });
  console.log(`\n🎉 Total laws in Supabase now: ${count}`);
}

seedMissingLaws();
