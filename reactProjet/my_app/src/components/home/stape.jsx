import React from 'react';
import img from '../../assets/bg2.png'

const steps = [
  { id: 1, label: 'Créez', description:'' },
  { id: 2, label: 'Importez', description:'' },
  { id: 3, label: 'Générez QR', description:'' },
  { id: 4, label: 'Envoyez', description:'' },
  { id: 5, label: 'Scannez', description:'' },
  { id: 6, label: 'Analysez', description:'' },
];

export default function CommentCaMarche() {
  return (
    <section className="bg-gradient-to-r from-[#004FB7] to-[#0084FF] relative z-10 mb-10  overflow-hidden">
        {/* <img className='absolute z-0 ' src={img} alt="" /> */}
      <div className="max-w-4xl relative z-10 my-20  mx-auto text-center">
        {/* Titre */}
        <h2 className="text-white text-3xl md:text-4xl font-bold mb-12">
          Comment ça marche ?
          <div className="w-16 h-1 bg-white mx-auto mt-4 rounded-full" />
        </h2>

        {/* Liste des étapes */}
        <div className="flex flex-wrap justify-center gap-6 md:gap-15">
          {steps.map((step) => (
            <div key={step.id} className="flex flex-col items-center">
              {/* Cercle */}
              <div
                className={`w-16 h-16 md:w-20 md:h-20 flex items-center justify-center rounded-full text-xl font-bold mb-3 transition-colors duration-300 ${
                  step.id === 6 
                    ? 'bg-orange-300 text-white' 
                    : 'bg-white text-blue-600'
                }`}
              >
                {step.id}
              </div>
              {/* Texte */}
              <span className="text-white font-medium text-sm md:text-base">
                {step.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}