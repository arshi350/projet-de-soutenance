import { Calendar, ScanLine, ShieldCheck, Mail, Users } from "lucide-react";

export function ConciergeSection() {

  const widgets = [
    {
      icon: Calendar,
      title: 'Widget "événement actif"',
      desc: "Afterwork Tech Paris : 128 invités inscrits, 92 déjà scannés à l'accueil.",
    },
    {
      icon: ScanLine,
      title: "Widget scan en direct",
      desc: "Dernier scan : Jean Dupont - 19h42. Statut : Présent.",
    },
  ];

  const cards = [
    {
      icon: ShieldCheck,
      title: "Sécurité Maximale",
      className: "col-span-1 row-span-1 bg-gray-100 border-1 border-gray-300",
      iconColor: "text-blue-600",
    },
    {
      icon: Mail,
      title: "Emails Design",
      className: "col-span-1 row-span-1 bg-blue-100 border-1 border-blue-300  ",
      iconColor: "text-orange-500",
    },
    {
      title: "Analytics VIP",
      className: "col-span-1 row-span-1 bg-gray-100  flex items-end p-4",
      image: true,
    },
    {
      icon: Users,
      title: "Gestion CRM",
      className: "col-span-1 row-span-1 bg-[#f3e5e2]",
      iconColor: "text-red-500",
    },
  ];

  return (
    <section className="bg-white relative z-20 px-50 py-20 flex gap-16">
      
      {/* LEFT */}
      <div className="w-[45%]">
        
        <h2 className="text-4xl font-bold text-gray-700 leading-snug">
          Pilotez votre événement <br />
          comme un{" "}
          <span className="text-[#FF5005]">Concierge Digital</span>
        </h2>

        {/* Widgets */}
        <div className="mt-8 flex flex-col gap-4">
          {widgets.map((item, i) => {
            const Icon = item.icon;
            return (
              <div
                key={i}
                className="flex items-start gap-4 bg-gray-100 p-5 rounded-xl"
              >
                <div className="bg-white p-3 rounded-lg shadow-sm">
                  <Icon size={18} className="text-[#FF5005]" />
                </div>

                <div>
                  <p className="font-semibold text-gray-700 text-sm">
                    {item.title}
                  </p>
                  <p className="text-gray-500 text-sm mt-1">
                    {item.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* CTA */}
        <button className="mt-8 bg-[#FF5005] cursor-pointer hover:scale-105 transition duration-300 text-white px-6 py-3 rounded-lg flex items-center gap-2 shadow">
          ▶ Générer toutes les invitations
        </button>
      </div>

      {/* RIGHT GRID */}
      <div className="w-[50%] grid grid-cols-2 gap-6">
        
        {cards.map((item, i) => {
          const Icon = item.icon;

          return (
            <div
              key={i}
              className={`rounded-2xl p-6 h-[180px] flex flex-col justify-between ${item.className}`}
            >
              {item.image ? (
                <div className="h-full w-full bg-[url('../../assets/img1.jpg')] bg-cover bg-center rounded-xl opacity-40"></div>
              ) : (
                <>
                  <div>
                    <Icon className={item.iconColor} size={26} />
                  </div>
                  <p className="text-gray-700 font-medium">
                    {item.title}
                  </p>
                </>
              )}
            </div>
          );
        })}

      </div>
    </section>
  );
}