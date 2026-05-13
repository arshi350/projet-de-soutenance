import React from 'react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-15 px-8 pb-10 font">
      {/* CTA Card Section */}
      <div className="bg-white rounded-3xl p-10 mb-12 shadow-sm border border-slate-100 flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="max-w-2xl">
          <h2 className="text-2xl font-black text-slate-900 mb-3 tracking-tight">
            Besoin d'aide pour votre prochain gala ?
          </h2>
          <p className="text-slate-500 font-medium leading-relaxed">
            Laissez l'intelligence artificielle d'EventFlow planifier vos invitations et optimiser votre placement de table en quelques clics.
          </p>
        </div>
        
        <button className="whitespace-nowrap border-2 border-orange-500 text-orange-600 font-bold px-8 py-4 rounded-2xl hover:bg-orange-50 transition-colors text-lg">
          Lancer l'Assistant IA
        </button>
      </div>

      {/* Bottom Footer Bar */}
      <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-slate-100 gap-6">
        <div className="flex items-center gap-2">
          <span className="text-orange-600 font-black text-lg tracking-tight"><span className='text-gray-700'>ARSHI</span>EVENT </span>
          <span className="text-slate-400 text-sm font-medium ml-2">
            © {currentYear} ARSHIEVENT AI. All rights reserved.
          </span>
        </div>

        <nav className="flex items-center gap-8">
          {['Privacy Policy', 'Terms of Service', 'Support', 'API Docs'].map((link) => (
            <a
              key={link}
              href={`#${link.toLowerCase().replace(/\s+/g, '-')}`}
              className="text-slate-400 hover:text-slate-600 text-sm font-bold transition-colors"
            >
              {link}
            </a>
          ))}
        </nav>
      </div>
    </footer>
  );
};

export default Footer;