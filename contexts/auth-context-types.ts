import type { AuthChangeEvent, Session } from '@supabase/supabase-js';
import { createContext, useContext } from "react";

const AuthContext = createContext(/* ... */);

export function useAuth() {
  return useContext(AuthContext);
}

// ...other exports...
