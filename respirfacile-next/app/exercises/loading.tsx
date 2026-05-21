export default function ExercisesLoading() {
  return (
    <div className="min-h-screen bg-beige-200 bg-texture">
      <div className="h-16 bg-beige-100/90 border-b border-beige-300 animate-pulse" />
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {/* Titre */}
        <div className="h-10 w-64 bg-beige-300 rounded-2xl animate-pulse" />

        {/* Filtres ou tabs */}
        <div className="flex gap-3 flex-wrap">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-10 w-32 bg-beige-100 rounded-full border border-beige-300 animate-pulse"
            />
          ))}
        </div>

        {/* Liste d'exercices */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="h-48 bg-beige-100 rounded-3xl border border-beige-300 animate-pulse"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
