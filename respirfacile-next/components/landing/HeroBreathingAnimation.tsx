"use client";

/**
 * HeroBreathingAnimation
 *
 * Animação de respiração em CSS puro para a seção hero.
 * Círculos concêntricos que pulsam em sincronismo com o ritmo de respiração.
 */
export function HeroBreathingAnimation() {
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
      {/* Círculo externo, pulse lento */}
      <div
        className="absolute w-96 h-96 rounded-full bg-gradient-to-br from-forest-500/12 to-forest-500/4 animate-breathe-slow"
        style={{ filter: 'blur(60px)' }}
      />

      {/* Círculo médio, pulse padrão */}
      <div
        className="absolute w-64 h-64 rounded-full bg-gradient-to-br from-forest-500/10 to-forest-500/2 animate-breathe"
        style={{ filter: 'blur(40px)', animationDelay: '0.2s' }}
      />

      {/* Círculo interior, pulse mais rápido */}
      <div
        className="absolute w-32 h-32 rounded-full bg-gradient-to-br from-copper-500/8 to-copper-500/2 animate-breathe"
        style={{ filter: 'blur(20px)', animationDelay: '0.4s' }}
      />
    </div>
  );
}
