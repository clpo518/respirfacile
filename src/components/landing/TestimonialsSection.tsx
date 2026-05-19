import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    quote: "L'outil qu'il me manquait pour suivre l'observance de mes patients entre les séances. Mes patients s'exercent vraiment à domicile maintenant.",
    author: "Fanny H.",
    role: "Orthophoniste libérale",
    rating: 5,
  },
  {
    quote: "Depuis que je fais mes exercices de respiration nasale régulièrement, je ronfle beaucoup moins. Mon orthophoniste voit mes progrès en direct.",
    author: "Thomas R.",
    role: "Patient SAOS, 47 ans",
    rating: 5,
  },
  {
    quote: "Facile à utiliser même pour moi. 5 minutes par jour et ma respiration s'améliore vraiment. Je me sens suivie même entre les rendez-vous.",
    author: "Sarah M.",
    role: "Patiente, 34 ans",
    rating: 5,
  },
  {
    quote: "Les exercices de cohérence cardiaque m'aident à gérer mon stress au quotidien. Bien conçu, je recommande à mes collègues.",
    author: "Marc D.",
    role: "Infirmier, 38 ans",
    rating: 5,
  },
];

export const TestimonialsSection = () => {
  return (
    <section className="py-20 md:py-28 bg-background">
      <div className="container px-4 md:px-6">
        <motion.div
          className="text-center mb-14"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Ils ont repris le contrôle
          </h2>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Patients et orthophonistes partagent leur expérience.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              className="relative bg-card rounded-2xl p-7 shadow-lg border border-border/50"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Quote className="absolute top-5 right-5 w-7 h-7 text-primary/15" />
              
              <div className="flex gap-0.5 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              
              <p className="text-sm text-foreground mb-5 italic leading-relaxed">
                "{testimonial.quote}"
              </p>
              
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-primary font-semibold text-sm">
                    {testimonial.author.charAt(0)}
                  </span>
                </div>
                <div>
                  <p className="font-semibold text-foreground text-sm">{testimonial.author}</p>
                  <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
