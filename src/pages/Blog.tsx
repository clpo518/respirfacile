import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Wind, Clock, ArrowRight } from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22,1,0.36,1] } },
};
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.10 } } };

const ARTICLES = [
  {
    slug: "ronflement-exercices-gorge",
    category: "Ronflement",
    title: "Ronflement : 5 exercices de gorge prouvés — et pourquoi les sprays ne suffisent pas",
    excerpt: "Votre partenaire dort dans la chambre d'à côté. Votre médecin dit que c'est normal. Ce n'est pas normal — et il existe une solution validée par 13 essais cliniques.",
    readTime: "8 min",
    date: "20 mai 2025",
  },
  {
    slug: "apnee-du-sommeil-sans-cpap-2025",
    category: "SAOS",
    title: "Apnée du sommeil sans CPAP : ce que 13 essais randomisés confirment (et pourquoi votre orthophoniste est sous-utilisé)",
    excerpt: "Le masque CPAP change des vies. Certains ne le supportent pas. Et même ceux qui le portent pourraient aller encore plus loin avec la rééducation myofonctionnelle.",
    readTime: "9 min",
    date: "20 mai 2025",
  },
  {
    slug: "langue-palais-exercice-saos",
    category: "Exercices",
    title: "Où est votre langue en ce moment ? Cet exercice de 2 minutes peut transformer votre sommeil",
    excerpt: "La position de repos de la langue est l'exercice le plus sous-estimé de la rééducation myofonctionnelle. Et le plus puissant.",
    readTime: "7 min",
    date: "20 mai 2025",
  },
  {
    slug: "apnee-du-sommeil-femme-symptomes",
    category: "Santé féminine",
    title: "Apnée du sommeil chez la femme : 7 signes qu'on confond encore trop souvent avec la ménopause",
    excerpt: "Le médecin a dit « c'est le stress ». La gynéco a dit « c'est la ménopause ». Et si c'était votre sommeil qui compromettait tout le reste ?",
    readTime: "8 min",
    date: "20 mai 2025",
  },
  {
    slug: "orthophonie-saos-guide-clinique-2025",
    category: "Pour les pros",
    title: "Orthophonie et SAOS en 2025 : le guide clinique que vos patients vous demandent",
    excerpt: "13 essais randomisés. 716 patients. −50 % d'IAH. Et seulement 35 % des orthophonistes en France se sentent formés pour prendre en charge le SAOS adulte. Ce guide est fait pour changer ça.",
    readTime: "10 min",
    date: "20 mai 2025",
  },
];

const CATEGORY_COLORS: Record<string, string> = {
  "SAOS":            "bg-primary/10 text-primary",
  "TMOF":            "bg-accent/10 text-accent",
  "Ronflement":      "bg-orange-100 text-orange-700",
  "Exercices":       "bg-emerald-100 text-emerald-700",
  "Santé féminine":  "bg-rose-100 text-rose-700",
  "Bien-être":       "bg-green-100 text-green-700",
  "Pour les pros":   "bg-blue-100 text-blue-700",
};

const Blog = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <header className="fixed top-0 inset-x-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="container px-4 md:px-6 h-16 flex items-center justify-between">
          <button onClick={() => navigate("/")} className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center">
              <Wind className="w-4 h-4 text-white" />
            </div>
            <span className="font-display font-semibold text-foreground text-lg">RespirFacile</span>
          </button>
          <button onClick={() => navigate("/auth")} className="btn-forest text-sm px-4 py-2">Connexion</button>
        </div>
      </header>

      <div className="pt-32 pb-24 px-4 md:px-6">
        <div className="container mx-auto max-w-4xl">
          <motion.div variants={stagger} initial="hidden" animate="show">
            <motion.div variants={fadeUp} className="text-center mb-14">
              <h1 className="font-display text-5xl font-semibold text-foreground mb-4">Blog RespirFacile</h1>
              <p className="text-xl text-muted-foreground">Ressources sur la rééducation respiratoire, le SAOS et les TMOF.</p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {ARTICLES.map((article) => (
                <motion.div key={article.slug} variants={fadeUp}>
                  <button
                    onClick={() => navigate(`/blog/${article.slug}`)}
                    className="card-rf p-6 text-left w-full h-full flex flex-col hover:shadow-lg transition-all duration-300"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${CATEGORY_COLORS[article.category] || "bg-muted text-muted-foreground"}`}>
                        {article.category}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        {article.readTime}
                      </span>
                    </div>
                    <h2 className="font-semibold text-foreground text-lg mb-2 leading-snug">{article.title}</h2>
                    <p className="text-sm text-muted-foreground leading-relaxed flex-1">{article.excerpt}</p>
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-border/50">
                      <span className="text-xs text-muted-foreground">{article.date}</span>
                      <span className="text-primary text-sm font-medium flex items-center gap-1">
                        Lire <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </button>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      <footer className="py-8 px-4 border-t border-border/50 text-center">
        <p className="text-xs text-muted-foreground">© 2025 RespirFacile · Fait avec 🌿 en France</p>
      </footer>
    </div>
  );
};

export default Blog;
