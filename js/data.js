// Data Management
const Data = {
  // Events data
  events: [
    {
      id: "boda-elegante",
      name: "Boda Elegante",
      category: "bodas",
      price: 299,
      description: "Diseño romántico con toques dorados",
      image: "/placeholder.svg?height=300&width=400",
    },
    {
      id: "boda-rustica",
      name: "Boda Rústica",
      category: "bodas",
      price: 299,
      description: "Estilo campestre y natural",
      image: "/placeholder.svg?height=300&width=400",
    },
    {
      id: "cumple-festivo",
      name: "Cumpleaños Festivo",
      category: "cumpleanos",
      price: 199,
      description: "Colorido y lleno de diversión",
      image: "/placeholder.svg?height=300&width=400",
    },
    {
      id: "cumple-elegante",
      name: "Cumpleaños Elegante",
      category: "cumpleanos",
      price: 199,
      description: "Sofisticado para adultos",
      image: "/placeholder.svg?height=300&width=400",
    },
    {
      id: "bautizo-angelical",
      name: "Bautizo Angelical",
      category: "bautizos",
      price: 179,
      description: "Tierno y celestial",
      image: "/placeholder.svg?height=300&width=400",
    },
    {
      id: "bautizo-moderno",
      name: "Bautizo Moderno",
      category: "bautizos",
      price: 179,
      description: "Contemporáneo y minimalista",
      image: "/placeholder.svg?height=300&width=400",
    },
    {
      id: "baby-dulce",
      name: "Baby Shower Dulce",
      category: "baby-shower",
      price: 159,
      description: "Colores pastel y ternura",
      image: "/placeholder.svg?height=300&width=400",
    },
    {
      id: "baby-safari",
      name: "Baby Shower Safari",
      category: "baby-shower",
      price: 159,
      description: "Aventura y diversión",
      image: "/placeholder.svg?height=300&width=400",
    },
  ],

  // Packages data
  packages: [
    {
      id: "basico",
      name: "Básico",
      price: { min: 159, max: 299 },
      features: [
        "Desarrollo web personalizado",
        "Subdominio exclusivo",
        "Acceso por 3 meses",
        "Música de fondo incluida",
        "Diseño responsive",
        "RSVP básico integrado",
      ],
      featured: false,
    },
    {
      id: "intermedio",
      name: "Intermedio",
      price: { min: 299, max: 499 },
      features: [
        "Todo lo del paquete Básico",
        "Sistema RSVP avanzado",
        "Galería de fotos",
        "Cronograma del evento",
        "Personalización avanzada",
        "Mapa de ubicación",
      ],
      featured: true,
    },
    {
      id: "premium",
      name: "Premium",
      price: { min: 499, max: 799 },
      features: [
        "Todo lo del paquete Intermedio",
        "Animaciones personalizadas",
        "Video de fondo",
        "Lista de regalos integrada",
        "Chat en vivo para invitados",
        "Soporte prioritario 24/7",
      ],
      featured: false,
    },
  ],

  // Testimonials data
  testimonials: [
    {
      id: 1,
      name: "María y Carlos",
      event: "Boda en Sevilla, 2024",
      rating: 5,
      text: "Nuestra invitación de boda fue absolutamente perfecta. El diseño capturó exactamente lo que queríamos y nuestros invitados quedaron encantados. ¡Altamente recomendado!",
      photo: "/placeholder.svg?height=60&width=60",
    },
    {
      id: 2,
      name: "Carmen López",
      event: "Cumpleaños en Valencia, 2024",
      rating: 5,
      text: "Para el cumpleaños de mi hija elegimos el diseño festivo y fue un éxito total. Los invitados se divirtieron mucho con la invitación interactiva.",
      photo: "/placeholder.svg?height=60&width=60",
    },
    {
      id: 3,
      name: "Rosa Martín",
      event: "Baby Shower en Madrid, 2024",
      rating: 5,
      text: "El baby shower de mi nieta fue perfecto gracias a la invitación digital. El diseño dulce y la facilidad para confirmar asistencia hicieron todo más sencillo.",
      photo: "/placeholder.svg?height=60&width=60",
    },
  ],

  // Get methods
  getEventById(id) {
    return this.events.find((event) => event.id === id)
  },

  getEventsByCategory(category) {
    if (category === "todos") return this.events
    return this.events.filter((event) => event.category === category)
  },

  getPackageById(id) {
    return this.packages.find((pkg) => pkg.id === id)
  },

  // Status text mapping
  getStatusText(status) {
    const statusMap = {
      pending: "Pendiente",
      processing: "En Proceso",
      completed: "Completado",
      cancelled: "Cancelado",
    }
    return statusMap[status] || "Desconocido"
  },
}

// Make Data globally available
window.Data = Data
