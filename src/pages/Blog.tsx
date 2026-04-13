import { Link } from "react-router-dom";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { ArrowRight, Clock, BookOpen } from "lucide-react";
import { blogPosts } from "@/data/blogPosts";

export default function Blog() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-16">
        {/* Hero Section */}
        <section className="py-16 md:py-24 bg-gradient-to-b from-muted/50 to-background">
          <div className="container px-4 md:px-6 text-center">
            <Badge variant="outline" className="mb-4">
              <BookOpen className="w-3 h-3 mr-1" />
              Ressources
            </Badge>
            <h1 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
              Ressources & Outils
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Articles techniques et guides pour le débit et la fluidité.
            </p>
          </div>
        </section>

        {/* Blog Grid */}
        <section className="py-12 md:py-16">
          <div className="container px-4 md:px-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {blogPosts.map((post) => (
                <Card 
                  key={post.id} 
                  className="group overflow-hidden border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-lg"
                >
                  <CardHeader className="pb-2">
                    <Badge 
                      className="w-fit mb-3 bg-primary/10 text-primary hover:bg-primary/20"
                    >
                      {post.category}
                    </Badge>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                      <Clock className="w-4 h-4" />
                      <span>{post.readTime} de lecture</span>
                      <span className="text-muted-foreground/50">•</span>
                      <span>{new Date(post.date).toLocaleDateString('fr-FR', { 
                        day: 'numeric', 
                        month: 'long', 
                        year: 'numeric' 
                      })}</span>
                    </div>
                    <h3 className="text-xl font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2">
                      {post.title}
                    </h3>
                  </CardHeader>

                  <CardContent className="pb-4">
                    <p className="text-muted-foreground line-clamp-3">
                      {post.excerpt}
                    </p>
                  </CardContent>

                  <CardFooter>
                    <Button asChild variant="ghost" className="group/btn p-0 h-auto">
                      <Link to={`/blog/${post.slug}`} className="flex items-center gap-2 text-primary font-medium">
                        Lire la suite
                        <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Newsletter CTA */}
        <section className="py-16 bg-muted/30">
          <div className="container px-4 md:px-6 text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
              Passez de la théorie à la pratique
            </h2>
            <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
              Commencez votre entraînement dès aujourd'hui avec le code de votre orthophoniste.
            </p>
            <Button asChild size="lg">
              <Link to="/auth?tab=signup">
                Créer mon compte patient
                <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </Button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
