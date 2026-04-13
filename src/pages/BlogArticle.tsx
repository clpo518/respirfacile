import { useParams, Link, Navigate } from "react-router-dom";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, ArrowRight, Clock, User, Activity, Zap, Shield, CheckCircle2, Stethoscope, ChevronRight } from "lucide-react";
import { getBlogPostBySlug, blogPosts } from "@/data/blogPosts";
import BlogInlineCTA from "@/components/blog/BlogInlineCTA";
import BlogSidebar from "@/components/blog/BlogSidebar";
import BlogStickyMobileCTA from "@/components/blog/BlogStickyMobileCTA";
import BlogDemoDialogue from "@/components/blog/BlogDemoDialogue";
import BlogDemoKaraoke from "@/components/blog/BlogDemoKaraoke";
import BlogDemoSpeedGauge from "@/components/blog/BlogDemoSpeedGauge";
import BlogDemoRebus from "@/components/blog/BlogDemoRebus";

export default function BlogArticle() {
  const { slug } = useParams<{ slug: string }>();
  const post = slug ? getBlogPostBySlug(slug) : undefined;

  if (!post) {
    return <Navigate to="/blog" replace />;
  }

  // Better related posts: same category first, then other categories, max 3
  const sameCategoryPosts = blogPosts.filter(p => p.category === post.category && p.id !== post.id);
  const otherPosts = blogPosts.filter(p => p.category !== post.category && p.id !== post.id);
  const relatedPosts = [...sameCategoryPosts, ...otherPosts].slice(0, 3);

  // Contextual CTAs for diagnostic article
  const isDiagnosticArticle = post.slug === 'test-vocal-debit-parole-gratuit';
  const inlineCTALink = isDiagnosticArticle ? '/diagnostic' : undefined;
  const inlineCTALabel = isDiagnosticArticle ? 'Tester mon débit gratuitement' : undefined;
  const bottomCTALink = isDiagnosticArticle ? '/diagnostic' : '/auth?tab=signup';
  const bottomCTALabel = isDiagnosticArticle ? 'Faire le test vocal gratuit' : 'Tester mon débit gratuitement';

  const renderContent = (content: string) => {
    // Split by demo/CTA markers
    const demoMarkers: Record<string, React.ReactNode> = {
      '{{DEMO_DIALOGUE}}': <BlogDemoDialogue key="demo-dialogue" />,
      '{{DEMO_KARAOKE}}': <BlogDemoKaraoke key="demo-karaoke" />,
      '{{DEMO_SPEED_GAUGE}}': <BlogDemoSpeedGauge key="demo-speed" />,
      '{{DEMO_REBUS}}': <BlogDemoRebus key="demo-rebus" />,
    };

    // First split by all demo markers, then by CTA
    const allMarkers = [...Object.keys(demoMarkers), '{{CTA}}'];
    const markerRegex = new RegExp(`(${allMarkers.map(m => m.replace(/[{}]/g, '\\$&')).join('|')})`, 'g');
    const parts = content.split(markerRegex);

    return parts.map((part, partIndex) => {
      // Check if this part is a marker
      if (part === '{{CTA}}') {
        return <BlogInlineCTA key={`cta-${partIndex}`} ctaLink={inlineCTALink} ctaLabel={inlineCTALabel} />;
      }
      if (demoMarkers[part]) {
        return <div key={`demo-${partIndex}`}>{demoMarkers[part]}</div>;
      }

      const elements = part
        .split('\n')
        .map((line, index) => {
          const trimmedLine = line.trim();
          if (!trimmedLine) return <br key={`${partIndex}-${index}`} />;

          if (trimmedLine.startsWith('### ')) {
            return (
              <h3 key={`${partIndex}-${index}`} className="text-xl md:text-2xl font-semibold text-foreground mt-10 mb-4">
                {trimmedLine.replace('### ', '')}
              </h3>
            );
          }

          if (trimmedLine.startsWith('## ')) {
            return (
              <h2 key={`${partIndex}-${index}`} className="text-2xl md:text-3xl font-bold text-foreground mt-12 mb-6 leading-tight">
                {trimmedLine.replace('## ', '')}
              </h2>
            );
          }

          if (trimmedLine.startsWith('> ')) {
            const text = trimmedLine.replace('> ', '');
            return (
              <blockquote
                key={`${partIndex}-${index}`}
                className="border-l-4 border-primary pl-6 py-3 my-8 bg-primary/5 rounded-r-xl italic text-foreground/80 text-lg"
                dangerouslySetInnerHTML={{
                  __html: text
                    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-primary hover:underline font-medium">$1</a>')
                    .replace(/\*\*(.*?)\*\*/g, '<strong class="text-foreground font-semibold not-italic">$1</strong>')
                    .replace(/\*(.*?)\*/g, '<em>$1</em>')
                }}
              />
            );
          }

          if (trimmedLine === '---') {
            return <hr key={`${partIndex}-${index}`} className="my-10 border-border/50" />;
          }

          // Image support: ![alt](src)
          const imgMatch = trimmedLine.match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
          if (imgMatch) {
            return (
              <figure key={`${partIndex}-${index}`} className="my-8">
                <img
                  src={imgMatch[2]}
                  alt={imgMatch[1]}
                  className="w-full rounded-xl border border-border/50 shadow-lg"
                  loading="lazy"
                />
                {imgMatch[1] && (
                  <figcaption className="text-center text-sm text-muted-foreground mt-3">
                    {imgMatch[1]}
                  </figcaption>
                )}
              </figure>
            );
          }

          if (trimmedLine.startsWith('- ')) {
            const text = trimmedLine.replace('- ', '');
            return (
              <li key={`${partIndex}-${index}`} className="text-foreground/80 ml-6 mb-3 list-disc list-outside text-lg leading-relaxed">
                <span dangerouslySetInnerHTML={{
                  __html: text
                    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-primary hover:underline font-medium">$1</a>')
                    .replace(/\*\*(.*?)\*\*/g, '<strong class="text-foreground font-semibold">$1</strong>')
                    .replace(/\*(.*?)\*/g, '<em>$1</em>')
                }} />
              </li>
            );
          }

          return (
            <p
              key={`${partIndex}-${index}`}
              className="text-foreground/80 text-lg leading-[1.8] mb-6"
              dangerouslySetInnerHTML={{
                __html: trimmedLine
                  .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-primary hover:underline font-medium">$1</a>')
                  .replace(/\*\*(.*?)\*\*/g, '<strong class="text-foreground font-semibold">$1</strong>')
                  .replace(/\*(.*?)\*/g, '<em>$1</em>')
              }}
            />
          );
        });

      return <div key={`part-${partIndex}`}>{elements}</div>;
    });
  };


  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-16">
        {/* Breadcrumb + Article Header */}
        <section className="py-12 md:py-16 bg-gradient-to-b from-muted/50 to-background">
          <div className="container px-4 md:px-6">
            <div className="max-w-[65ch] mx-auto">
              {/* Visible Breadcrumb */}
              <nav aria-label="Fil d'Ariane" className="flex items-center gap-1 text-sm text-muted-foreground mb-6 flex-wrap">
                <Link to="/" className="hover:text-primary transition-colors">Accueil</Link>
                <ChevronRight className="w-3 h-3" />
                <Link to="/blog" className="hover:text-primary transition-colors">Blog</Link>
                <ChevronRight className="w-3 h-3" />
                <span className="text-foreground/70 truncate max-w-[200px] md:max-w-none">{post.title}</span>
              </nav>

              <Badge className="mb-4 bg-primary/10 text-primary hover:bg-primary/20">
                {post.category}
              </Badge>

              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground leading-tight mb-6">
                {post.title}
              </h1>

              <div className="flex flex-wrap items-center gap-4 text-muted-foreground">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  <span>{post.author}</span>
                </div>
                <span className="text-muted-foreground/50">•</span>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>{post.readTime} de lecture</span>
                </div>
                <span className="text-muted-foreground/50">•</span>
                <span>{new Date(post.date).toLocaleDateString('fr-FR', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}</span>
              </div>
            </div>
          </div>
        </section>

        {/* Article Content with Sidebar */}
        <section className="py-8 md:py-12">
          <div className="container px-4 md:px-6">
            <div className="max-w-6xl mx-auto flex flex-col lg:flex-row lg:items-start gap-8 lg:gap-12">
              {/* Main Content - 65ch optimal reading width */}
              <article className="flex-1 max-w-[65ch]">
                <div className="prose prose-lg dark:prose-invert max-w-none">
                  {renderContent(post.content)}
                </div>

                {/* Bottom Article CTA */}
                <div className="mt-12 p-8 bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl border border-primary/20">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                      <Zap className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="text-xl font-bold text-foreground">
                      Passez à l'action
                    </h3>
                  </div>
                  <p className="text-muted-foreground mb-6">
                    Ne restez pas dans la théorie. Testez votre débit de parole et commencez votre entraînement dès maintenant. C'est gratuit.
                  </p>
                  <Button asChild size="lg">
                    <Link to={bottomCTALink}>
                      {bottomCTALabel}
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </Link>
                  </Button>
                </div>
              </article>

              {/* Sticky Sidebar */}
              <BlogSidebar 
                relatedPosts={relatedPosts} 
                audience={post.audience} 
                ctaLink={isDiagnosticArticle ? '/diagnostic' : undefined}
                ctaLabel={isDiagnosticArticle ? 'Faire le test vocal (30s)' : undefined}
              />
            </div>
          </div>
        </section>

        {/* Related Articles - Internal Linking */}
        {relatedPosts.length > 0 && (
          <section className="py-12 md:py-16 border-t border-border/50">
            <div className="container px-4 md:px-6">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-8 text-center">
                Articles recommandés
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                {relatedPosts.map((rp) => (
                  <Link
                    key={rp.id}
                    to={`/blog/${rp.slug}`}
                    className="group block p-6 rounded-xl border border-border/50 hover:border-primary/30 hover:shadow-lg transition-all bg-card"
                  >
                    <Badge className="mb-3 bg-primary/10 text-primary text-xs">{rp.category}</Badge>
                    <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2 mb-2">
                      {rp.title}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">{rp.excerpt}</p>
                    <span className="inline-flex items-center gap-1 text-sm text-primary font-medium mt-3">
                      Lire <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Bottom Banner CTA */}
        <section className="py-16 bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10">
          <div className="container px-4 md:px-6 text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
              Passez de la théorie à la pratique
            </h2>
            <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
              Entraînez-vous avec notre outil de biofeedback visuel. Reprenez le contrôle de votre élocution.
            </p>
            <Button asChild size="lg">
              <Link to="/auth?tab=signup">
                Créer mon compte gratuit
                <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </Button>
          </div>
        </section>
      </main>

      {/* Sticky mobile CTA */}
      <BlogStickyMobileCTA />

      <Footer />
    </div>
  );
}
