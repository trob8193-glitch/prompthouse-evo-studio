import React from 'react';
import { IDEPageLayout } from '../components/layouts/IDEPageLayout.jsx';
const EmojiGallery = () => {
  const images = [
    {
      src: '/assets/emojis/a_collection_of_nine_2d_rendered_digital_emojis_of.png',
      title: 'Collection of 9 Emojis',
      desc: 'Part 01 Asset - Animal expressions'
    },
    {
      src: '/assets/emojis/evo_bot_emoji_expressions_display.png',
      title: 'Evo Bot Expressions',
      desc: 'Part 02 Asset - Bot avatars'
    }
  ];

  return (
    <IDEPageLayout
      title="Evo Studio Asset Gallery"
      description="Extracted and analyzed by OpenAI & Antigravity Team. These assets are now available for the studio."
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {images.map((img, index) => (
          <div key={index} className="group relative bg-slate-800 rounded-xl overflow-hidden border border-slate-700 transition-all duration-300 hover:border-cyan-500 hover:shadow-lg hover:shadow-cyan-500/10">
            <div className="aspect-square overflow-hidden bg-slate-900 flex items-center justify-center p-4">
              <img 
                src={img.src} 
                alt={img.title} 
                className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105"
              />
            </div>
            <div className="p-4 bg-slate-850">
              <h3 className="text-sm font-semibold text-white group-hover:text-cyan-400 transition-colors">
                {img.title}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                {img.desc}
              </p>
            </div>
          </div>
        ))}
      </div>
    </IDEPageLayout>
  );
};

export default EmojiGallery;
