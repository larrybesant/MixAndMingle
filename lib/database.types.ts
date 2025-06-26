// Placeholder Database type for Supabase typesafety
// Replace with your actual database schema types as needed

export type Database = {
  public: {
    Tables: Record<string, any>;
    Views: Record<string, any>;
    Functions: Record<string, any>;
  };
};
