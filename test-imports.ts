// TypeScript test to check import resolution with relative paths
import { supabase } from './lib/supabase/client';
import { Input } from './components/ui/input';
import { Button } from './components/ui/button';

// This file should compile without errors if paths are resolved correctly
console.log('Imports working:', { supabase, Input, Button });
