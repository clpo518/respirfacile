export default function HistoryLoading() {
  return (
    <div className="min-h-screen bg-beige-200 bg-texture">
      <div className="h-16 bg-beige-100/90 border-b border-beige-300 animate-pulse" />
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {/* Titre */}
        <div className="h-10 w-48 bg-beige-300 rounded-2xl animate-pulse" />

        {/* Filtres de date */}
        <div className="flex gap-3 flex-wrap">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-10 w-28 bg-beige-100 rounded-full border border-beige-300 animate-pulse"
            />
          ))}
        </div>

        {/* Graphique de progression */}
        <div className="h-64 bg-beige-100 rounded-3xl border border-beige-300 animate-pulse" />

        {/* Liste des séances */}
        <div className="space-y-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="h-16 bg-beige-100 rounded-2xl border border-beige-300 animate-pulse"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
