import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

const TownsSection = () => {
  const navigate = useNavigate();

  const towns = [
    { name: 'Tamarindo', count: 67, image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400', route: 'tamarindo' },
    { name: 'Nosara', count: 45, image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400', route: 'nosara' },
    { name: 'Flamingo', count: 38, image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400', route: 'flamingo' },
    { name: 'Playa Grande', count: 29, image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400', route: 'playa-grande' },
    { name: 'Potrero', count: 52, image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400', route: 'flamingo' },
    { name: 'Samara', count: 41, image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400', route: 'samara' }
  ];

  return (
    <section className="py-16 bg-gradient-to-br from-slate-50 to-cyan-50/30">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-slate-900 mb-4">Explore by Town</h2>
          <p className="text-xl text-slate-600">Discover Costa Rica's most sought-after beach communities</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {towns.map((town, i) => (
            <div
              key={i}
              onClick={() => navigate(`/${town.route}`)}
              className="group relative h-72 rounded-2xl overflow-hidden cursor-pointer shadow-lg hover:shadow-2xl transition-all duration-500"
            >
              <img
                src={town.image}
                alt={town.name}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
              <div className="absolute inset-0 flex flex-col justify-end p-6">
                <h3 className="text-3xl font-bold text-white mb-2">{town.name}</h3>
                <div className="flex items-center justify-between">
                  <p className="text-cyan-300 font-semibold">{town.count} Properties</p>
                  <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center group-hover:bg-white/30 transition-all duration-300">
                    <ChevronRight className="w-5 h-5 text-white" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TownsSection;