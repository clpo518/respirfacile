export default function Loading() {
  return (
    <div className="min-h-screen bg-[#F5F0E8] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 rounded-full border-4 border-[#2D5016] border-t-transparent animate-spin" />
        <p className="text-forest-500 text-sm">Vérification de l'authentification...</p>
      </div>
    </div>
  );
}
