<div className="space-y-3">
  <button
    onClick={() => handleOAuth('google')}
    className="w-full flex items-center justify-center gap-2 border border-gray-300 py-2 rounded text-sm bg-white text-black hover:bg-gray-100"
  >
    <Image src="/icons/google.svg" alt="Google" width={20} height={20} />
    Continue with Google
  </button>

  <button
    onClick={() => handleOAuth('facebook')}
    className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-2 rounded hover:bg-blue-700 text-sm"
  >
    <Image src="/icons/facebook.svg" alt="Facebook" width={20} height={20} />
    Continue with Facebook
  </button>
</div>
