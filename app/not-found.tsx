export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-6">
      <h1 className="text-4xl font-bold mb-4 text-white">
        404 – Page Not Found
      </h1>
      <p className="text-gray-400 mb-6">
        Looks like that room doesn’t exist—or the beat dropped off. Try again.
      </p>
      <a href="/" className="text-blue-500 hover:underline text-lg">
        Return to Home
      </a>
    </div>
  );
}
