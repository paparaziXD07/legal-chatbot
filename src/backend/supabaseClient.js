const { createClient } = require('@supabase/supabase-js');
const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');

const backendEnv = path.resolve(__dirname, '.env');
if (fs.existsSync(backendEnv)) {
  dotenv.config({ path: backendEnv });
}
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_PUBLISHABLE_KEY || process.env.REACT_APP_SUPABASE_ANON_KEY;

let supabase = null;

if (supabaseUrl && supabaseKey && !supabaseUrl.includes('your-project-id')) {
  try {
    supabase = createClient(supabaseUrl, supabaseKey);
    console.log('✅ [Supabase] Client initialized successfully for:', supabaseUrl);
  } catch (err) {
    console.warn('⚠️ [Supabase] Initialization failed:', err.message);
  }
} else {
  console.log('ℹ️ [Supabase] URL/Key not configured in .env yet. Running in fallback mode.');
}

module.exports = supabase;
