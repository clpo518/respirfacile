export function DailyTip() {
  const tips = [
    { icon: "👃", text: "Respirez par le nez autant que possible, il filtre, humidifie et réchauffe l'air, réduisant le travail de vos poumons." },
    { icon: "🫁", text: "La Pause Contrôlée mesure votre tolérance au CO₂. Plus elle est longue, meilleure est votre efficacité respiratoire." },
    { icon: "⏰", text: "3 séances de 5 minutes valent mieux qu'une seule de 20. La régularité est la clé de la rééducation respiratoire." },
    { icon: "🌙", text: "Respirer par la bouche la nuit perturbe le sommeil. La respiration nasale favorise un sommeil plus réparateur." },
    { icon: "💓", text: "La cohérence cardiaque (5 secondes inspiration / 5 secondes expiration) régule le système nerveux en quelques minutes." },
    { icon: "🧘", text: "Le diaphragme est votre muscle respiratoire principal. En respiration abdominale, votre ventre doit se soulever, pas votre poitrine." },
    { icon: "🏃", text: "Essayez de marcher en respirant exclusivement par le nez. Si vous devez ouvrir la bouche, ralentissez le pas." },
    { icon: "💧", text: "Une bonne hydratation fluidifie les mucosités nasales et facilite la respiration nasale. Buvez suffisamment tout au long de la journée." },
    { icon: "🌬️", text: "Le CO₂ n'est pas un déchet, c'est lui qui signal à votre cerveau de respirer. Bien le tolérer améliore tout votre système." },
    { icon: "😴", text: "Dormir sur le côté plutôt que sur le dos réduit les ronflements et les épisodes d'apnée pour beaucoup de personnes." },
    { icon: "🎵", text: "La respiration ralentie à 6 cycles par minute maximise la variabilité de la fréquence cardiaque et diminue le stress." },
    { icon: "👅", text: "La posture de la langue au repos est cruciale : elle doit être collée au palais, bouche fermée, pour maintenir les voies respiratoires ouvertes." },
    { icon: "🌿", text: "Les plantes d'intérieur améliorent modestement la qualité de l'air. Aérer 10 minutes par jour reste plus efficace." },
    { icon: "📏", text: "Un score de Pause Contrôlée supérieur à 40 pas est associé à une bonne efficacité respiratoire. Suivez votre progression semaine après semaine." },
    { icon: "🔇", text: "Ronfler est un signal que les voies respiratoires se rétrécissent. Les exercices myofonctionnels peuvent aider à les tonifier." },
    { icon: "⚡", text: "La fatigue chronique peut venir d'une mauvaise oxygénation nocturne. Une respiration optimale la nuit change tout." },
    { icon: "🤸", text: "Les muscles de la gorge et du palais peuvent se renforcer avec des exercices réguliers, comme n'importe quel muscle du corps." },
    { icon: "🕯️", text: "Avant de dormir, 5 minutes de respiration abdominale lente activent le système parasympathique et facilitent l'endormissement." },
    { icon: "☀️", text: "Le matin, quelques minutes de Pause Contrôlée réveillent le système nerveux et préparent le corps à la journée." },
    { icon: "📊", text: "Votre score de Pause Contrôlée varie selon la fatigue, le stress ou une maladie, c'est normal. Comparez des semaines, pas des jours." },
    { icon: "🧠", text: "La respiration nasale stimule la production d'oxyde nitrique, qui dilate les vaisseaux sanguins et améliore l'oxygénation cérébrale." },
    { icon: "🍃", text: "Après un repas, attendez 30 minutes avant de faire des exercices de respiration intenses pour éviter les inconforts digestifs." },
    { icon: "🏋️", text: "Pendant l'effort physique, essayez de maintenir la respiration nasale le plus longtemps possible, cela entraîne votre tolérance au CO₂." },
    { icon: "🌊", text: "La respiration est le seul système autonome que vous pouvez contrôler consciemment. C'est votre porte d'entrée sur le système nerveux." },
    { icon: "🔄", text: "Si vous ressentez des vertiges pendant un exercice, reposez-vous et reprenez plus doucement. Ne forcez jamais sur la respiration." },
    { icon: "💪", text: "Les progrès en rééducation respiratoire sont graduels. La patience et la régularité donnent des résultats durables." },
    { icon: "🌡️", text: "Par temps froid, respirez par le nez : il réchauffe et humidifie l'air avant qu'il atteigne les poumons, évitant les irritations." },
    { icon: "📱", text: "Évitez les écrans dans l'heure avant le coucher : la lumière bleue perturbe la mélatonine et la qualité du sommeil." },
    { icon: "🎯", text: "Fixez-vous un seul exercice prioritaire par semaine. Maîtriser un exercice vaut mieux qu'en faire plusieurs à moitié." },
    { icon: "🌟", text: "Chaque séance compte, même courte. Votre corps s'adapte progressivement, la transformation est réelle, même si elle est lente." },
  ];

  // Rotation chronologique : 1 tip différent garanti par jour de l'année
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000
  );
  const tip = tips[dayOfYear % tips.length];

  return (
    <div className="bg-copper-50 border border-copper-200 rounded-2xl p-4">
      <p className="text-sm font-semibold text-copper-700 mb-2">
        {tip.icon} Astuce du jour
      </p>
      <p className="text-sm text-copper-600 leading-relaxed">{tip.text}</p>
    </div>
  );
}
