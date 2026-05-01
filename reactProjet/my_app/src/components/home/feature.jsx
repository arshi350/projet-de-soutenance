import { Share2, QrCode, BarChart3 } from "lucide-react";

export function FeaturesSection() {

  const features = [
    {
      icon: Share2,
      title: "Automatisation intelligente",
      description:
        "Programmez l'envoi automatique de vos invitations par Email et SMS avec des rappels personnalisés pour maximiser le taux de réponse.",
      bg: "bg-yellow-100",
      iconColor: "text-yellow-600",
    },
    {
      icon: QrCode,
      title: "QR code unique par invité",
      description:
        "Chaque invité reçoit un code personnel. Un scan rapide à l'entrée met à jour instantanément votre base de données et le statut de présence.",
      bg: "bg-orange-100",
      iconColor: "text-orange-500",
    },
    {
      icon: BarChart3,
      title: "Suivi optimisé temps réel",
      description:
        "Visualisez l'affluence en direct depuis votre tableau de bord. Exportez des rapports détaillés dès la fin de votre événement.",
      bg: "bg-red-100",
      iconColor: "text-red-400",
    },
  ];

  return (
    <section className="relative z-10  pb-20 px-50">
      <div className="flex gap-7 ">
        
        {features.map((item, index) => {
          const Icon = item.icon;

          return (
            <div
              key={index}
              className="bg-white rounded-2xl p-15 shadow-md hover:shadow-xl transition duration-300"
            >
              
              {/* ICON */}
              <div
                className={`w-14 h-14 flex items-center justify-center rounded-xl ${item.bg}`}
              >
                <Icon className={`${item.iconColor}`} size={26} />
              </div>

              {/* TITLE */}
              <h3 className="mt-6 text-2xl uppercase font-semibold text-gray-700">
                {item.title}
              </h3>

              {/* TEXT */}
              <p className="mt-4 text-gray-500 text-[15px] leading-relaxed">
                {item.description}
              </p>

            </div>
          );
        })}

      </div>
    </section>
  );
}