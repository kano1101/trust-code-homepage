
import { siteConfig } from '../../../config/siteConfig';

export default function Hero() {
  return (
    <section 
      className="relative h-96 bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: `linear-gradient(rgba(139, 69, 19, 0.3), rgba(75, 0, 130, 0.4)), url('https://readdy.ai/api/search-image?query=A%20serene%20and%20inspiring%20workspace%20with%20purple%20ambient%20lighting%2C%20golden%20accents%2C%20and%20modern%20technology%20setup%20including%20multiple%20monitors%20displaying%20code%2C%20surrounded%20by%20aquarium%20with%20colorful%20fish%2C%20gadgets%2C%20and%20books%20about%20self-improvement%20and%20programming%2C%20creating%20a%20harmonious%20blend%20of%20technology%20and%20nature%20in%20a%20cozy%20environment&width=1200&height=400&seq=hero-trustcode&orientation=landscape')`
      }}
    >
      <div className={`absolute inset-0 bg-gradient-to-r ${siteConfig.theme.gradients.hero}`}></div>
      <div className="relative max-w-7xl mx-auto px-4 h-full flex items-center">
        <div className="w-full text-center text-white">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            {siteConfig.tagline.split('コード')[0]}
            <span className="text-yellow-400">コード</span>
            {siteConfig.tagline.split('コード')[1]}
          </h1>
          <p className="text-xl md:text-2xl mb-6 text-purple-100">
            {siteConfig.description}
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            {siteConfig.categories.map((category, index) => (
              <span key={index} className="bg-purple-600/80 px-4 py-2 rounded-full">
                {category.name}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
