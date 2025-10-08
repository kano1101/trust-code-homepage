interface PageHeroProps {
  title: string;
  subtitle?: string;
  colorScheme?: 'purple' | 'blue' | 'green' | 'orange' | 'pink';
}

export default function PageHero({ title, subtitle, colorScheme = 'purple' }: PageHeroProps) {
  const colorSchemes = {
    purple: {
      gradient: 'from-purple-900/60 to-purple-600/40',
      bgGradient: 'rgba(139, 69, 19, 0.3), rgba(75, 0, 130, 0.4)',
      titleColor: 'text-yellow-400'
    },
    blue: {
      gradient: 'from-blue-900/60 to-blue-600/40',
      bgGradient: 'rgba(25, 118, 210, 0.3), rgba(13, 71, 161, 0.4)',
      titleColor: 'text-cyan-300'
    },
    green: {
      gradient: 'from-green-900/60 to-green-600/40',
      bgGradient: 'rgba(46, 125, 50, 0.3), rgba(27, 94, 32, 0.4)',
      titleColor: 'text-lime-300'
    },
    orange: {
      gradient: 'from-orange-900/60 to-orange-600/40',
      bgGradient: 'rgba(230, 81, 0, 0.3), rgba(191, 54, 12, 0.4)',
      titleColor: 'text-amber-300'
    },
    pink: {
      gradient: 'from-pink-900/60 to-pink-600/40',
      bgGradient: 'rgba(194, 24, 91, 0.3), rgba(136, 14, 79, 0.4)',
      titleColor: 'text-rose-300'
    }
  };

  const colors = colorSchemes[colorScheme];

  return (
    <section
      className="relative h-64 bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: `linear-gradient(${colors.bgGradient}), url('https://readdy.ai/api/search-image?query=A%20serene%20and%20inspiring%20workspace%20with%20purple%20ambient%20lighting%2C%20golden%20accents%2C%20and%20modern%20technology%20setup%20including%20multiple%20monitors%20displaying%20code%2C%20surrounded%20by%20aquarium%20with%20colorful%20fish%2C%20gadgets%2C%20and%20books%20about%20self-improvement%20and%20programming%2C%20creating%20a%20harmonious%20blend%20of%20technology%20and%20nature%20in%20a%20cozy%20environment&width=1200&height=400&seq=hero-trustcode&orientation=landscape')`
      }}
    >
      <div className={`absolute inset-0 bg-gradient-to-r ${colors.gradient}`}></div>
      <div className="relative max-w-7xl mx-auto px-4 h-full flex items-center">
        <div className="w-full text-center text-white">
          <h1 className="text-3xl md:text-5xl font-bold mb-2">
            <span className={colors.titleColor}>{title}</span>
          </h1>
          {subtitle && (
            <p className="text-lg md:text-xl text-white/90">
              {subtitle}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}