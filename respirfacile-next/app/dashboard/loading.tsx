export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-beige-200 bg-texture">
      <div className="h-16 bg-beige-100/90 border-b border-beige-300 animate-pulse" />
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {/* Titre */}
        <div className="h-10 w-48 bg-beige-300 rounded-2xl animate-pulse" />

        {/* Trois cartes de statistiques */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-32 bg-beige-100 rounded-3xl border border-beige-300 animate-pulse"
            />
          ))}
        </div>

        {/* Graphique ou contenu principal */}
        <div className="h-64 bg-beige-100 rounded-3xl border border-beige-300 animate-pulse" />

        {/* Liste d'exercices */}
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-12 bg-beige-100 rounded-2xl border border-beige-300 animate-pulse"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
