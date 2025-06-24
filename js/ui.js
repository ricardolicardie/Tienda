// UI Management
const UI = {
  currentSlide: 0,
  slideInterval: null,

  // Initialize UI components
  init() {
    this.initSlider()
    this.initEventFiltering()
    this.loadEvents()
    this.loadPackages()
    this.loadTestimonials()
    this.setupNavigation()
    this.setupContactForm()
    this.setupModals()
    this.updateCurrentYear()
  },

  // Initialize hero slider
  initSlider() {
    const slides = Utils.$$(".slide")
    const dots = Utils.$$(".dot")

    if (slides.length === 0) return

    const showSlide = (index) => {
      slides.forEach((slide, i) => {
        slide.classList.toggle("active", i === index)
      })
      dots.forEach((dot, i) => {
        dot.classList.toggle("active", i === index)
      })
      this.currentSlide = index
    }

    const nextSlide = () => {
      this.currentSlide = (this.currentSlide + 1) % slides.length
      showSlide(this.currentSlide)
    }

    // Auto-advance slides
    this.slideInterval = setInterval(nextSlide, CONFIG.SLIDER_INTERVAL)

    // Dot navigation
    dots.forEach((dot, index) => {
      dot.addEventListener("click", () => {
        clearInterval(this.slideInterval)
        showSlide(index)
        this.slideInterval = setInterval(nextSlide, CONFIG.SLIDER_INTERVAL)
      })
    })

    // Pause on hover
    const sliderContainer = Utils.$(".slider-container")
    if (sliderContainer) {
      sliderContainer.addEventListener("mouseenter", () => {
        clearInterval(this.slideInterval)
      })
      sliderContainer.addEventListener("mouseleave", () => {
        this.slideInterval = setInterval(nextSlide, CONFIG.SLIDER_INTERVAL)
      })
    }
  },

  // Initialize event filtering
  initEventFiltering() {
    const filterButtons = Utils.$$(".filter-btn")

    filterButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const filter = button.dataset.filter

        // Update active button
        filterButtons.forEach((btn) => btn.classList.remove("active"))
        button.classList.add("active")

        // Filter events
        this.filterEvents(filter)
      })
    })

    // Dropdown navigation
    Utils.$$(".dropdown-content a").forEach((link) => {
      link.addEventListener("click", (e) => {
        e.preventDefault()
        const filter = link.dataset.filter

        Utils.scrollToSection("eventos")

        setTimeout(() => {
          const filterBtn = Utils.$(`[data-filter="${filter}"]`)
          if (filterBtn) {
            filterBtn.click()
          }
        }, 500)
      })
    })
  },

  // Filter events by category
  filterEvents(category) {
    const eventCards = Utils.$$(".event-card")

    eventCards.forEach((card) => {
      const cardCategory = card.dataset.category
      if (category === "todos" || cardCategory === category) {
        card.classList.remove("hidden")
      } else {
        card.classList.add("hidden")
      }
    })
  },

  // Load events dynamically
  loadEvents() {
    const eventsGrid = Utils.$("#eventsGrid")
    if (!eventsGrid) return

    const eventsHTML = Data.events
      .map(
        (event) => `
      <div class="event-card" data-category="${event.category}" data-design="${event.id}" data-price="${event.price}">
        <div class="event-image">
          <img src="${event.image}" alt="${event.name}" loading="lazy">
          <div class="event-overlay">
            <button class="btn btn-primary customize-btn" data-event-id="${event.id}">Personalizar</button>
            <button class="btn btn-outline preview-btn" data-event-id="${event.id}">Vista Previa</button>
          </div>
        </div>
        <div class="event-info">
          <h3 class="event-title">${event.name}</h3>
          <p class="event-description">${event.description}</p>
          <div class="event-price">Desde ${Utils.formatPrice(event.price)}</div>
        </div>
      </div>
    `,
      )
      .join("")

    eventsGrid.innerHTML = eventsHTML

    // Setup event listeners
    Utils.$$(".customize-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation()
        const eventId = btn.dataset.eventId
        this.openCustomizationModal(eventId)
      })
    })

    Utils.$$(".preview-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation()
        this.showNotification("Vista previa próximamente disponible")
      })
    })
  },

  // Load packages dynamically
  loadPackages() {
    const packagesGrid = Utils.$("#packagesGrid")
    if (!packagesGrid) return

    const packagesHTML = Data.packages
      .map(
        (pkg) => `
      <div class="package-card ${pkg.featured ? "featured" : ""}">
        ${pkg.featured ? '<div class="package-badge">Más Popular</div>' : ""}
        <div class="package-header">
          <h3 class="package-name">${pkg.name}</h3>
          <div class="package-price">
            <span class="price">${Utils.formatPrice(pkg.price.max)}</span>
            <span class="price-note">${Utils.formatPrice(pkg.price.min)}</span>
          </div>
        </div>
        <div class="package-features">
          ${pkg.features
            .map(
              (feature) => `
            <div class="feature included">
              <svg class="feature-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="20,6 9,17 4,12"/>
              </svg>
              <span>${feature}</span>
            </div>
          `,
            )
            .join("")}
        </div>
        <button class="btn ${pkg.featured ? "btn-primary" : "btn-outline"} btn-full package-btn" data-package="${pkg.id}">
          Elegir ${pkg.name}
        </button>
      </div>
    `,
      )
      .join("")

    packagesGrid.innerHTML = packagesHTML

    // Setup package button listeners
    Utils.$$(".package-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault()
        const packageType = btn.dataset.package
        this.selectPackage(packageType)
      })
    })
  },

  // Load testimonials dynamically
  loadTestimonials() {
    const testimonialsGrid = Utils.$("#testimonialsGrid")
    if (!testimonialsGrid) return

    const testimonialsHTML = Data.testimonials
      .map(
        (testimonial) => `
      <div class="testimonial-card">
        <div class="testimonial-rating">
          <div class="stars">
            ${Array(testimonial.rating)
              .fill()
              .map(
                () => `
              <svg class="star filled" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
              </svg>
            `,
              )
              .join("")}
          </div>
        </div>
        <p class="testimonial-text">"${testimonial.text}"</p>
        <div class="testimonial-author">
          <img src="${testimonial.photo}" alt="${testimonial.name}" class="author-photo" loading="lazy">
          <div class="author-info">
            <h4 class="author-name">${testimonial.name}</h4>
            <p class="author-date">${testimonial.event}</p>
          </div>
        </div>
      </div>
    `,
      )
      .join("")

    testimonialsGrid.innerHTML = testimonialsHTML
  },

  // Setup navigation
  setupNavigation() {
    const navbar = Utils.$("#navbar")
    const mobileMenuBtn = Utils.$("#mobileMenuBtn")
    const mobileMenu = Utils.$("#mobileMenu")
    const closeMenuBtn = Utils.$("#closeMenuBtn")

    // Mobile menu toggle
    if (mobileMenuBtn) {
      mobileMenuBtn.addEventListener("click", () => {
        mobileMenu.classList.add("active")
        document.body.style.overflow = "hidden"
      })
    }

    if (closeMenuBtn) {
      closeMenuBtn.addEventListener("click", () => {
        mobileMenu.classList.remove("active")
        document.body.style.overflow = ""
      })
    }

    // Close mobile menu when clicking on links
    Utils.$$(".mobile-nav-link").forEach((link) => {
      link.addEventListener("click", () => {
        mobileMenu.classList.remove("active")
        document.body.style.overflow = ""
      })
    })

    // Close mobile menu when clicking outside
    if (mobileMenu) {
      mobileMenu.addEventListener("click", (e) => {
        if (e.target === mobileMenu) {
          mobileMenu.classList.remove("active")
          document.body.style.overflow = ""
        }
      })
    }

    // Navbar scroll effect
    const handleScroll = Utils.throttle(() => {
      if (window.scrollY > 10) {
        navbar.classList.add("scrolled")
      } else {
        navbar.classList.remove("scrolled")
      }
    }, 10)

    window.addEventListener("scroll", handleScroll)

    // Smooth scrolling for anchor links
    Utils.$$('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener("click", function (e) {
        e.preventDefault()
        const target = Utils.$(this.getAttribute("href"))
        if (target) {
          target.scrollIntoView({
            behavior: "smooth",
            block: "start",
          })
        }
      })
    })
  },

  // Setup contact form
  setupContactForm() {
    const contactForm = Utils.$("#contactForm")
    if (!contactForm) return

    const validationRules = {
      name: [{ type: "required" }],
      email: [{ type: "required" }, { type: "email" }],
      phone: [{ type: "phone" }],
      "event-type": [{ type: "required" }],
    }

    Validation.setupValidation(contactForm, validationRules)

    contactForm.addEventListener("submit", async (e) => {
      e.preventDefault()

      if (!Validation.validateForm(contactForm, validationRules)) return

      const submitBtn = contactForm.querySelector('button[type="submit"]')
      Utils.setLoading(submitBtn, true)

      // Simulate form submission
      await new Promise((resolve) => setTimeout(resolve, 1000))

      Utils.setLoading(submitBtn, false)
      this.showNotification("¡Consulta enviada correctamente! Te contactaremos pronto.")
      contactForm.reset()
    })
  },

  // Modal management
  setupModals() {
    // Close modals with Escape key
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        this.closeAllModals()
      }
    })
  },

  openModal(modalId) {
    this.loadModalContent(modalId).then(() => {
      const modal = Utils.$(`#${modalId}`)
      if (modal) {
        modal.classList.add("active")
        document.body.style.overflow = "hidden"

        // Dispatch custom event
        document.dispatchEvent(
          new CustomEvent("modalOpened", {
            detail: { modalId },
          }),
        )
      }
    })
  },

  closeModal(modalId) {
    const modal = Utils.$(`#${modalId}`)
    if (modal) {
      modal.classList.remove("active")
      document.body.style.overflow = ""
    }
  },

  closeAllModals() {
    Utils.$$(".modal.active").forEach((modal) => {
      modal.classList.remove("active")
    })
    document.body.style.overflow = ""
  },

  // Load modal content dynamically
  async loadModalContent(modalId) {
    const modalContainer = Utils.$("#modalContainer")
    if (!modalContainer) return

    // Check if modal already exists
    if (Utils.$(`#${modalId}`)) return

    let modalHTML = ""

    switch (modalId) {
      case "loginModal":
        modalHTML = this.getLoginModalHTML()
        break
      case "registerModal":
        modalHTML = this.getRegisterModalHTML()
        break
      case "customizationModal":
        modalHTML = this.getCustomizationModalHTML()
        break
      case "checkoutModal":
        modalHTML = this.getCheckoutModalHTML()
        break
      default:
        return
    }

    modalContainer.insertAdjacentHTML("beforeend", modalHTML)

    // Setup modal close listeners
    const modal = Utils.$(`#${modalId}`)
    const closeBtn = modal.querySelector(".close-modal")

    if (closeBtn) {
      closeBtn.addEventListener("click", () => this.closeModal(modalId))
    }

    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        this.closeModal(modalId)
      }
    })
  },

  // Modal HTML templates
  getLoginModalHTML() {
    return `
      <div id="loginModal" class="modal">
        <div class="modal-content">
          <div class="modal-header">
            <h2>Iniciar Sesión</h2>
            <button class="close-modal">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" x2="6" y1="6" y2="18"/>
                <line x1="6" x2="18" y1="6" y2="18"/>
              </svg>
            </button>
          </div>
          <div class="modal-body">
            <form id="loginForm" class="auth-form">
              <div class="form-group">
                <label for="loginEmail">Email *</label>
                <input type="email" id="loginEmail" name="email" required>
                <div class="form-error"></div>
              </div>
              <div class="form-group">
                <label for="loginPassword">Contraseña *</label>
                <input type="password" id="loginPassword" name="password" required>
                <div class="form-error"></div>
              </div>
              <button type="submit" class="btn btn-primary btn-full"></button>
            </form>
          </div>
        </div>
      </div>
    `
  },

  showNotification(message) {
    const notification = document.createElement("div")
    notification.classList.add("notification")
    notification.textContent = message
    document.body.appendChild(notification)

    setTimeout(() => {
      notification.classList.add("show")
    }, 100)

    setTimeout(() => {
      notification.classList.remove("show")
      setTimeout(() => {
        document.body.removeChild(notification)
      }, 300)
    }, 3000)
  },

  openCustomizationModal(eventId) {
    // Placeholder for opening customization modal
    this.showNotification(`Opening customization modal for event ID: ${eventId}`)
  },

  selectPackage(packageType) {
    // Placeholder for package selection logic
    this.showNotification(`Selected package type: ${packageType}`)
  },

  updateCurrentYear() {
    const yearElements = document.querySelectorAll(".current-year")
    yearElements.forEach((element) => {
      element.textContent = new Date().getFullYear()
    })
  },
}

// Initialize UI after DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  UI.init()
})
