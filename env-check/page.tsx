'use client';

export default function EnvCheckPage() {
  // Client-side environment check
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Environment Variables Check</h1>
      
      <div className="space-y-4">
        <div className="p-4 bg-gray-100 rounded">
          <h3 className="font-semibold mb-2">NEXT_PUBLIC_SUPABASE_URL:</h3>
          <p className="text-sm font-mono break-all">
            {supabaseUrl ? `✅ ${supabaseUrl}` : '❌ NOT SET'}
          </p>
        </div>
        
        <div className="p-4 bg-gray-100 rounded">
          <h3 className="font-semibold mb-2">NEXT_PUBLIC_SUPABASE_ANON_KEY:</h3>
          <p className="text-sm font-mono break-all">
            {supabaseKey ? `✅ ${supabaseKey.substring(0, 50)}...` : '❌ NOT SET'}
          </p>
        </div>
        
        <div className="p-4 bg-blue-100 rounded">
          <h3 className="font-semibold mb-2">Status:</h3>
          <p className="text-sm">
            {supabaseUrl && supabaseKey 
              ? '✅ Environment variables are properly loaded' 
              : '❌ Environment variables are missing - check your .env.local file'}
          </p>
        </div>
        
        {(!supabaseUrl || !supabaseKey) && (
          <div className="p-4 bg-red-100 rounded">
            <h3 className="font-semibold mb-2">🔧 Fix Steps:</h3>
            <ol className="text-sm space-y-1 list-decimal list-inside">
              <li>Check if .env.local file exists in your project root</li>
              <li>Verify variables start with NEXT_PUBLIC_</li>
              <li>Restart your development server (npm run dev)</li>
              <li>Refresh this page</li>
            </ol>
          </div>
        )}
      </div>
    </div>
  );
}
