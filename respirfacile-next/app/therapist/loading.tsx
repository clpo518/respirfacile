export default function TherapistLoading() {
  return (
    <div className="min-h-screen bg-beige-200 bg-texture">
      <div className="h-16 bg-beige-100/90 border-b border-beige-300 animate-pulse" />
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        {/* Titre */}
        <div className="h-10 w-64 bg-beige-300 rounded-2xl animate-pulse" />

        {/* Onglets/navigation */}
        <div className="flex gap-4 border-b border-beige-300">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-8 w-40 bg-beige-100 rounded-t-lg animate-pulse"
            />
          ))}
        </div>

        {/* Contenu principal */}
        <div className="space-y-4">
          <div className="h-12 bg-beige-100 rounded-2xl border border-beige-300 animate-pulse" />
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="h-20 bg-beige-100 rounded-2xl border border-beige-300 animate-pulse"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
