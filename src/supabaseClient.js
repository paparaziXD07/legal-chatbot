// ============================================================
//  supabaseClient.js — Official @supabase/supabase-js Client
// ============================================================

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL || 'https://iwattafwhwyyqrxkappv.supabase.co';
const SUPABASE_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY || process.env.REACT_APP_SUPABASE_PUBLISHABLE_KEY || '';

export const supabase = (SUPABASE_URL && SUPABASE_KEY) ? createClient(SUPABASE_URL, SUPABASE_KEY) : null;

export const supabaseRest = {
  // Query table records (SELECT)
  async select(table, options = {}) {
    if (!supabase) return { data: null, error: new Error('Supabase client not initialized') };
    try {
      let query = supabase.from(table).select('*');
      if (options.order) {
        const [column, direction] = options.order.split('.');
        query = query.order(column, { ascending: direction !== 'desc' });
      }
      const { data, error } = await query;
      return { data, error };
    } catch (err) {
      return { data: null, error: err };
    }
  },

  // Insert table records (INSERT)
  async insert(table, payload) {
    if (!supabase) return { data: null, error: new Error('Supabase client not initialized') };
    try {
      const { data, error } = await supabase.from(table).insert(payload).select();
      return { data, error };
    } catch (err) {
      return { data: null, error: err };
    }
  },

  // Upsert/Update table records (UPSERT / UPDATE)
  async update(table, payload, matchColumn, matchValue) {
    if (!supabase) return { data: null, error: new Error('Supabase client not initialized') };
    try {
      const { data, error } = await supabase.from(table).update(payload).eq(matchColumn, matchValue).select();
      return { data, error };
    } catch (err) {
      return { data: null, error: err };
    }
  },

  async upsert(table, payload, options = {}) {
    if (!supabase) return { data: null, error: new Error('Supabase client not initialized') };
    try {
      const { data, error } = await supabase.from(table).upsert(payload, options).select();
      return { data, error };
    } catch (err) {
      return { data: null, error: err };
    }
  },

  // Delete table records (DELETE)
  async delete(table, matchColumn, matchValue) {
    if (!supabase) return { data: null, error: new Error('Supabase client not initialized') };
    try {
      const { data, error } = await supabase.from(table).delete().eq(matchColumn, matchValue).select();
      return { data, error };
    } catch (err) {
      return { data: null, error: err };
    }
  }
};

export default supabaseRest;

