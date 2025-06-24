// Global variables
let currentSlide = 0
let slideInterval
let stripe
let elements
let card
let currentDesign = null
let currentPackage = null
const cart = []

// Add these imports at the top of the file (after the global variables section)
import { supabase, authService, dbService } from "./lib/supabase.js"
import { notificationService } from "./lib/notifications.js"
import { emailService } from "./lib/email-service.js"

// Update the authentication variables section
let currentUser = null
const isEmailVerified = false

// Authentication variables
const users = JSON.parse(localStorage.getItem("inviteu_users") || "[]")
const orders = JSON.parse(localStorage.getItem("inviteu_orders") || "[]")

// Add new DOM elements for password reset and verification
const passwordResetModal = document.getElementById("passwordResetModal")
const emailVerificationModal = document.getElementById("emailVerificationModal")
const adminDashboardModal = document.getElementById("adminDashboardModal")

// DOM Elements
const mobileMenuBtn = document.getElementById("mobileMenuBtn")
const mobileMenu = document.getElementById("mobileMenu")
const closeMenuBtn = document.getElementById("closeMenuBtn")
const navbar = document.querySelector(".navbar")
const currentYearSpan = document.getElementById("currentYear")
const contactForm = document.getElementById("contactForm")
const customizationModal = document.getElementById("customizationModal")
const checkoutModal = document.getElementById("checkoutModal")
const cartSidebar = document.getElementById("cartSidebar")
const cartBtn = document.getElementById("cartBtn")
const cartCount = document.getElementById("cartCount")

// Authentication DOM elements
const authButtons = document.getElementById("authButtons")
const userMenu = document.getElementById("userMenu")
const loginBtn = document.getElementById("loginBtn")
const registerBtn = document.getElementById("registerBtn")
const loginModal = document.getElementById("loginModal")
const registerModal = document.getElementById("registerModal")
const userPanelModal = document.getElementById("userPanelModal")
const loginForm = document.getElementById("loginForm")
const registerForm = document.getElementById("registerForm")
const profileForm = document.getElementById("profileForm")

// Initialize Stripe
if (typeof Stripe !== "undefined") {
  stripe = Stripe("pk_test_your_publishable_key_here") // Replace with your actual Stripe publishable key
}

// Mobile Menu Toggle
function toggleMobileMenu() {
  mobileMenu.classList.toggle("active")
  document.body.style.overflow = mobileMenu.classList.contains("active") ? "hidden" : ""
}

function closeMobileMenu() {
  mobileMenu.classList.remove("active")
  document.body.style.overflow = ""
}

// Event Listeners
if (mobileMenuBtn) mobileMenuBtn.addEventListener("click", toggleMobileMenu)
if (closeMenuBtn) closeMenuBtn.addEventListener("click", closeMobileMenu)

// Close mobile menu when clicking on links
document.querySelectorAll(".mobile-nav-link").forEach((link) => {
  link.addEventListener("click", closeMobileMenu)
})

// Close mobile menu when clicking outside
if (mobileMenu) {
  mobileMenu.addEventListener("click", (e) => {
    if (e.target === mobileMenu) {
      closeMobileMenu()
    }
  })
}

// Navbar scroll effect
function handleScroll() {
  if (window.scrollY > 10) {
    navbar.classList.add("scrolled")
  } else {
    navbar.classList.remove("scrolled")
  }
}

window.addEventListener("scroll", debounce(handleScroll, 10))

// Hero Slider
function initSlider() {
  const slides = document.querySelectorAll(".slide")
  const dots = document.querySelectorAll(".dot")

  if (slides.length === 0) return

  function showSlide(index) {
    slides.forEach((slide, i) => {
      slide.classList.toggle("active", i === index)
    })
    dots.forEach((dot, i) => {
      dot.classList.toggle("active", i === index)
    })
    currentSlide = index
  }

  function nextSlide() {
    currentSlide = (currentSlide + 1) % slides.length
    showSlide(currentSlide)
  }

  // Auto-advance slides
  slideInterval = setInterval(nextSlide, 4000)

  // Dot navigation
  dots.forEach((dot, index) => {
    dot.addEventListener("click", () => {
      clearInterval(slideInterval)
      showSlide(index)
      slideInterval = setInterval(nextSlide, 4000)
    })
  })

  // Pause on hover
  const sliderContainer = document.querySelector(".slider-container")
  if (sliderContainer) {
    sliderContainer.addEventListener("mouseenter", () => clearInterval(slideInterval))
    sliderContainer.addEventListener("mouseleave", () => {
      slideInterval = setInterval(nextSlide, 4000)
    })
  }
}

// Event Filtering
function initEventFiltering() {
  const filterButtons = document.querySelectorAll(".filter-btn")
  const eventCards = document.querySelectorAll(".event-card")

  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const filter = button.dataset.filter

      // Update active button
      filterButtons.forEach((btn) => btn.classList.remove("active"))
      button.classList.add("active")

      // Filter cards
      eventCards.forEach((card) => {
        const category = card.dataset.category
        if (filter === "todos" || category === filter) {
          card.classList.remove("hidden")
        } else {
          card.classList.add("hidden")
        }
      })
    })
  })
}

// Dropdown navigation
document.querySelectorAll(".dropdown-content a").forEach((link) => {
  link.addEventListener("click", (e) => {
    e.preventDefault()
    const filter = link.dataset.filter

    // Scroll to events section
    scrollToSection("eventos")

    // Apply filter after scroll
    setTimeout(() => {
      const filterBtn = document.querySelector(`[data-filter="${filter}"]`)
      if (filterBtn) {
        filterBtn.click()
      }
    }, 500)
  })
})

// Customize buttons
document.querySelectorAll(".customize-btn").forEach((btn) => {
  btn.addEventListener("click", (e) => {
    e.stopPropagation()
    const card = btn.closest(".event-card")
    currentDesign = {
      name: card.querySelector(".event-title").textContent,
      category: card.dataset.category,
      design: card.dataset.design,
      price: Number.parseInt(card.dataset.price),
    }
    openCustomizationModal()
  })
})

// Preview buttons
document.querySelectorAll(".preview-btn").forEach((btn) => {
  btn.addEventListener("click", (e) => {
    e.stopPropagation()
    showNotification("Vista previa próximamente disponible")
  })
})

// Package selection
document.querySelectorAll(".package-btn").forEach((btn) => {
  btn.addEventListener("click", (e) => {
    e.preventDefault()
    const packageType = btn.dataset.package
    currentPackage = packageType

    // If no design selected, show design selection
    if (!currentDesign) {
      showNotification("Primero selecciona un diseño de evento")
      scrollToSection("eventos")
      return
    }

    openCustomizationModal()
  })
})

// Modal functions
function openCustomizationModal() {
  if (!customizationModal) return

  customizationModal.classList.add("active")
  document.body.style.overflow = "hidden"

  // Pre-fill package if selected
  if (currentPackage) {
    const packageSelect = document.getElementById("package-select")
    if (packageSelect) {
      packageSelect.value = currentPackage
    }
  }

  // Update preview
  updatePreview()

  // Setup form listeners
  setupCustomizationForm()
}

function closeCustomizationModal() {
  if (!customizationModal) return

  customizationModal.classList.remove("active")
  document.body.style.overflow = ""
}

function openCheckoutModal() {
  if (!checkoutModal) return

  closeCustomizationModal()
  checkoutModal.classList.add("active")
  document.body.style.overflow = "hidden"

  updateOrderSummary()
  initializePayment()
}

function closeCheckoutModal() {
  if (!checkoutModal) return

  checkoutModal.classList.remove("active")
  document.body.style.overflow = ""
}

// Customization form
function setupCustomizationForm() {
  const form = document.getElementById("customizationForm")
  if (!form) return

  const inputs = form.querySelectorAll("input, select, textarea")
  inputs.forEach((input) => {
    input.addEventListener("input", updatePreview)
  })
}

function updatePreview() {
  const title = document.getElementById("event-title")?.value || "Tu Evento Especial"
  const names = document.getElementById("names")?.value || "Nombres"
  const date = document.getElementById("date")?.value || "Fecha"
  const time = document.getElementById("time")?.value || "Hora"
  const location = document.getElementById("location")?.value || "Ubicación"
  const message = document.getElementById("special-message")?.value || "Mensaje especial..."

  // Update preview elements
  const previewTitle = document.getElementById("previewTitle")
  const previewNames = document.getElementById("previewNames")
  const previewDate = document.getElementById("previewDate")
  const previewTime = document.getElementById("previewTime")
  const previewLocation = document.getElementById("previewLocation")
  const previewMessage = document.getElementById("previewMessage")

  if (previewTitle) previewTitle.textContent = title
  if (previewNames) previewNames.textContent = names
  if (previewDate) previewDate.textContent = formatDate(date)
  if (previewTime) previewTime.textContent = time
  if (previewLocation) previewLocation.textContent = location
  if (previewMessage) previewMessage.textContent = message
}

function formatDate(dateString) {
  if (!dateString) return "Fecha"

  const date = new Date(dateString)
  return date.toLocaleDateString("es-ES", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

// Order summary
function updateOrderSummary() {
  if (!currentDesign) return

  const packageSelect = document.getElementById("package-select")
  const selectedPackage = packageSelect?.value || "basico"

  const prices = {
    basico: { min: 159, max: 299 },
    intermedio: { min: 299, max: 499 },
    premium: { min: 499, max: 799 },
  }

  const packagePrice = prices[selectedPackage]?.max || 299
  const subtotal = packagePrice
  const tax = Math.round(subtotal * 0.21)
  const total = subtotal + tax

  // Update order display
  const orderDesign = document.getElementById("orderDesign")
  const orderPackage = document.getElementById("orderPackage")
  const orderDetails = document.getElementById("orderDetails")
  const orderPrice = document.getElementById("orderPrice")
  const subtotalEl = document.getElementById("subtotal")
  const taxEl = document.getElementById("tax")
  const totalEl = document.getElementById("total")

  if (orderDesign) orderDesign.textContent = currentDesign.name
  if (orderPackage)
    orderPackage.textContent = `Paquete ${selectedPackage.charAt(0).toUpperCase() + selectedPackage.slice(1)}`
  if (orderDetails) {
    const names = document.getElementById("names")?.value || "Nombres"
    const date = document.getElementById("date")?.value || "Fecha"
    orderDetails.textContent = `${names} - ${formatDate(date)}`
  }
  if (orderPrice) orderPrice.textContent = `€${packagePrice}`
  if (subtotalEl) subtotalEl.textContent = `€${subtotal}`
  if (taxEl) taxEl.textContent = `€${tax}`
  if (totalEl) totalEl.textContent = `€${total}`
}

// Payment initialization
function initializePayment() {
  if (!stripe) {
    console.warn("Stripe not initialized")
    return
  }

  elements = stripe.elements()

  const style = {
    base: {
      color: "#32325d",
      fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
      fontSmoothing: "antialiased",
      fontSize: "16px",
      "::placeholder": {
        color: "#aab7c4",
      },
    },
    invalid: {
      color: "#fa755a",
      iconColor: "#fa755a",
    },
  }

  card = elements.create("card", { style: style })
  card.mount("#card-element")

  card.on("change", ({ error }) => {
    const displayError = document.getElementById("card-errors")
    if (error) {
      displayError.textContent = error.message
    } else {
      displayError.textContent = ""
    }
  })
}

// Payment method selection
document.querySelectorAll(".payment-method").forEach((method) => {
  method.addEventListener("click", () => {
    document.querySelectorAll(".payment-method").forEach((m) => m.classList.remove("active"))
    method.classList.add("active")

    const selectedMethod = method.dataset.method
    const stripePayment = document.getElementById("stripe-payment")
    const paypalPayment = document.getElementById("paypal-payment")

    if (selectedMethod === "stripe") {
      if (stripePayment) stripePayment.style.display = "block"
      if (paypalPayment) paypalPayment.style.display = "none"
    } else {
      if (stripePayment) stripePayment.style.display = "none"
      if (paypalPayment) paypalPayment.style.display = "block"
    }
  })
})

// Complete payment
document.getElementById("completePayment")?.addEventListener("click", async () => {
  const activeMethod = document.querySelector(".payment-method.active")
  const method = activeMethod?.dataset.method || "stripe"

  if (method === "stripe") {
    await handleStripePayment()
  } else {
    handlePayPalPayment()
  }
})

async function handleStripePayment() {
  if (!stripe || !card) {
    showNotification("Error: Sistema de pago no disponible", "error")
    return
  }

  const { token, error } = await stripe.createToken(card)

  if (error) {
    showNotification(`Error: ${error.message}`, "error")
  } else {
    // In a real implementation, you would send the token to your server
    console.log("Stripe token:", token)
    showNotification("¡Pago procesado correctamente!")

    // Simulate successful payment
    setTimeout(() => {
      closeCheckoutModal()
      showSuccessMessage()
    }, 1000)
  }
}

function handlePayPalPayment() {
  // In a real implementation, you would integrate with PayPal SDK
  showNotification("¡Pago con PayPal procesado correctamente!")

  setTimeout(() => {
    closeCheckoutModal()
    showSuccessMessage()
  }, 1000)
}

function showSuccessMessage() {
  // Create order if user is logged in
  if (currentUser && currentDesign) {
    const packageSelect = document.getElementById("package-select")
    const selectedPackage = packageSelect?.value || "basico"

    const prices = {
      basico: { min: 159, max: 299 },
      intermedio: { min: 299, max: 499 },
      premium: { min: 499, max: 799 },
    }

    const packagePrice = prices[selectedPackage]?.max || 299
    const subtotal = packagePrice
    const tax = Math.round(subtotal * 0.21)
    const total = subtotal + tax

    const orderData = {
      designName: currentDesign.name,
      designCategory: currentDesign.category,
      package: selectedPackage,
      eventTitle: document.getElementById("event-title")?.value || "Evento",
      eventDate: document.getElementById("date")?.value || "",
      eventTime: document.getElementById("time")?.value || "",
      eventLocation: document.getElementById("location")?.value || "",
      names: document.getElementById("names")?.value || "",
      specialMessage: document.getElementById("special-message")?.value || "",
      colorScheme: document.getElementById("color-scheme")?.value || "gold-blue",
      subtotal,
      tax,
      total,
    }

    const order = createOrder(orderData)
    if (order) {
      showNotification("¡Pedido confirmado! Puedes ver el estado en tu panel de usuario.")
    }
  } else {
    showNotification("¡Pedido confirmado! Te contactaremos pronto para finalizar los detalles.")
  }

  // Reset form and selections
  currentDesign = null
  currentPackage = null

  // Reset cart
  updateCartCount(0)
}

// Cart functionality
function toggleCart() {
  if (!cartSidebar) return

  cartSidebar.classList.toggle("active")
  document.body.style.overflow = cartSidebar.classList.contains("active") ? "hidden" : ""
}

function closeCart() {
  if (!cartSidebar) return

  cartSidebar.classList.remove("active")
  document.body.style.overflow = ""
}

function updateCartCount(count) {
  if (cartCount) {
    cartCount.textContent = count
  }
}

// Cart event listeners
if (cartBtn) cartBtn.addEventListener("click", toggleCart)
document.getElementById("closeCart")?.addEventListener("click", closeCart)

// Modal event listeners
document.getElementById("closeModal")?.addEventListener("click", closeCustomizationModal)
document.getElementById("closeCheckoutModal")?.addEventListener("click", closeCheckoutModal)
document.getElementById("cancelCustomization")?.addEventListener("click", closeCustomizationModal)
document.getElementById("proceedToCheckout")?.addEventListener("click", openCheckoutModal)
document
  .getElementById("backToCustomization")
  ?.addEventListener("click", () => {
    closeCheckoutModal()
    openCustomizationModal()
  })

// Close modals when clicking outside
;[customizationModal, checkoutModal].forEach((modal) => {
  if (modal) {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        modal.classList.remove("active")
        document.body.style.overflow = ""
      }
    })
  }
})

// Contact form submission
if (contactForm) {
  contactForm.addEventListener("submit", (e) => {
    e.preventDefault()

    const formData = new FormData(contactForm)
    const name = formData.get("name")
    const email = formData.get("email")
    const phone = formData.get("phone")
    const eventType = formData.get("event-type")
    const eventDate = formData.get("event-date")
    const packageSelected = formData.get("package")
    const message = formData.get("message")

    // Basic validation
    if (!name || !email || !eventType) {
      showNotification("Por favor, completa los campos obligatorios", "error")
      return
    }

    if (!isValidEmail(email)) {
      showNotification("Por favor, introduce un email válido", "error")
      return
    }

    // Simulate form submission
    showNotification("¡Consulta enviada correctamente! Te contactaremos pronto.")
    contactForm.reset()
  })
}

// Utility functions
function scrollToSection(sectionId) {
  const section = document.getElementById(sectionId)
  if (section) {
    section.scrollIntoView({
      behavior: "smooth",
      block: "start",
    })
  }
}

function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

function showNotification(message, type = "success") {
  // Remove existing notifications
  const existingNotification = document.querySelector(".notification")
  if (existingNotification) {
    existingNotification.remove()
  }

  // Create notification element
  const notification = document.createElement("div")
  notification.className = `notification notification-${type}`
  notification.textContent = message

  // Add styles
  Object.assign(notification.style, {
    position: "fixed",
    top: "20px",
    right: "20px",
    background: type === "success" ? "linear-gradient(to right, #d4af37, #1e3a8a)" : "#ef4444",
    color: "white",
    padding: "12px 20px",
    borderRadius: "8px",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
    zIndex: "1001",
    fontSize: "14px",
    fontWeight: "500",
    transform: "translateX(100%)",
    transition: "transform 0.3s ease",
    maxWidth: "300px",
    wordWrap: "break-word",
  })

  document.body.appendChild(notification)

  // Animate in
  setTimeout(() => {
    notification.style.transform = "translateX(0)"
  }, 100)

  // Remove after 4 seconds
  setTimeout(() => {
    notification.style.transform = "translateX(100%)"
    setTimeout(() => {
      if (notification.parentNode) {
        notification.remove()
      }
    }, 300)
  }, 4000)
}

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    e.preventDefault()
    const target = document.querySelector(this.getAttribute("href"))
    if (target) {
      target.scrollIntoView({
        behavior: "smooth",
        block: "start",
      })
    }
  })
})

// Intersection Observer for animations
const observerOptions = {
  threshold: 0.1,
  rootMargin: "0px 0px -50px 0px",
}

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.style.animationPlayState = "running"
      entry.target.classList.add("animate")
    }
  })
}, observerOptions)

// Observe animated elements
document.querySelectorAll(".event-card, .package-card, .testimonial-card").forEach((el) => {
  observer.observe(el)
})

// Performance optimization: Debounce function
function debounce(func, wait) {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

// Keyboard navigation support
document.addEventListener("keydown", (e) => {
  // Close modals and menus with Escape key
  if (e.key === "Escape") {
    if (mobileMenu?.classList.contains("active")) {
      closeMobileMenu()
    }
    if (customizationModal?.classList.contains("active")) {
      closeCustomizationModal()
    }
    if (checkoutModal?.classList.contains("active")) {
      closeCheckoutModal()
    }
    if (cartSidebar?.classList.contains("active")) {
      closeCart()
    }
  }
})

// Authentication Functions
// Replace the existing initAuth function with this enhanced version:
async function initAuth() {
  // Initialize Supabase auth state listener
  supabase.auth.onAuthStateChange(async (event, session) => {
    if (event === "SIGNED_IN" && session) {
      currentUser = {
        id: session.user.id,
        email: session.user.email,
        name: session.user.user_metadata.name,
        phone: session.user.user_metadata.phone,
        email_verified: session.user.email_confirmed_at !== null,
      }

      // Sync with local database
      await syncUserData(currentUser)
      updateAuthUI()

      if (!currentUser.email_verified) {
        showEmailVerificationPrompt()
      }

      // Request push notification permission
      await setupPushNotifications()
    } else if (event === "SIGNED_OUT") {
      currentUser = null
      updateAuthUI()
    }
  })

  // Check if user is already logged in
  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (session) {
    // Trigger the auth state change handler
    supabase.auth.onAuthStateChange(async (event, session) => {})
  }

  // Event listeners for modals
  setupAuthEventListeners()

  // Initialize notifications
  await notificationService.requestPermission()
}

// New function to sync user data with database
async function syncUserData(userData) {
  try {
    // Check if user exists in our database
    const { data: existingUser, error } = await dbService.getUserByEmail(userData.email)

    if (error && error.code === "PGRST116") {
      // User doesn't exist, create them
      await dbService.createUser({
        id: userData.id,
        email: userData.email,
        name: userData.name,
        phone: userData.phone,
        email_verified: userData.email_verified,
      })
    } else if (!error && existingUser) {
      // Update existing user data
      await dbService.updateUser(userData.id, {
        name: userData.name,
        phone: userData.phone,
        email_verified: userData.email_verified,
      })
    }
  } catch (error) {
    console.error("Error syncing user data:", error)
  }
}

// Enhanced register function
async function handleRegister(e) {
  e.preventDefault()

  const formData = new FormData(registerForm)
  const name = formData.get("name")
  const email = formData.get("email")
  const phone = formData.get("phone")
  const password = formData.get("password")
  const confirmPassword = formData.get("confirmPassword")

  // Validation
  if (password !== confirmPassword) {
    showNotification("Las contraseñas no coinciden", "error")
    return
  }

  if (password.length < 6) {
    showNotification("La contraseña debe tener al menos 6 caracteres", "error")
    return
  }

  try {
    const { data, error } = await authService.register({
      email,
      password,
      name,
      phone,
    })

    if (error) {
      showNotification(`Error: ${error.message}`, "error")
      return
    }

    closeModal(registerModal)
    showEmailVerificationModal(email)
    registerForm.reset()

    showNotification("¡Registro exitoso! Verifica tu email para continuar.")
  } catch (error) {
    showNotification("Error al crear la cuenta", "error")
    console.error("Registration error:", error)
  }
}

// Enhanced login function
async function handleLogin(e) {
  e.preventDefault()

  const formData = new FormData(loginForm)
  const email = formData.get("email")
  const password = formData.get("password")

  try {
    const { data, error } = await authService.login(email, password)

    if (error) {
      showNotification(`Error: ${error.message}`, "error")
      return
    }

    closeModal(loginModal)
    showNotification("¡Bienvenido de vuelta!")
    loginForm.reset()
  } catch (error) {
    showNotification("Error al iniciar sesión", "error")
    console.error("Login error:", error)
  }
}

// Enhanced logout function
async function logout() {
  try {
    const { error } = await authService.logout()

    if (error) {
      console.error("Logout error:", error)
    }

    currentUser = null
    updateAuthUI()
    closeModal(userPanelModal)
    showNotification("Sesión cerrada correctamente")
  } catch (error) {
    console.error("Logout error:", error)
  }
}

// New password reset function
async function handlePasswordReset(e) {
  e.preventDefault()

  const formData = new FormData(e.target)
  const email = formData.get("email")

  try {
    const { data, error } = await authService.resetPassword(email)

    if (error) {
      showNotification(`Error: ${error.message}`, "error")
      return
    }

    showNotification("Email de recuperación enviado. Revisa tu bandeja de entrada.")
    closeModal(passwordResetModal)
    e.target.reset()
  } catch (error) {
    showNotification("Error al enviar email de recuperación", "error")
    console.error("Password reset error:", error)
  }
}

// Email verification functions
function showEmailVerificationPrompt() {
  if (currentUser && !currentUser.email_verified) {
    setTimeout(() => {
      showNotification("Por favor verifica tu email para acceder a todas las funciones", "warning")
    }, 2000)
  }
}

function showEmailVerificationModal(email) {
  const modal = document.getElementById("emailVerificationModal")
  const emailSpan = document.getElementById("verificationEmail")

  if (modal && emailSpan) {
    emailSpan.textContent = email
    openModal(modal)
  }
}

async function resendVerificationEmail() {
  if (!currentUser) return

  try {
    const { data, error } = await authService.resendVerification(currentUser.email)

    if (error) {
      showNotification(`Error: ${error.message}`, "error")
      return
    }

    showNotification("Email de verificación reenviado")
  } catch (error) {
    showNotification("Error al reenviar email de verificación", "error")
    console.error("Resend verification error:", error)
  }
}

// Push notification setup
async function setupPushNotifications() {
  if (!currentUser) return

  try {
    const hasPermission = await notificationService.requestPermission()

    if (hasPermission) {
      await notificationService.subscribeUser(currentUser.id)

      // Show welcome notification
      await notificationService.showNotification("¡Bienvenido a InviteU Digital!", {
        body: "Recibirás notificaciones sobre el estado de tus pedidos.",
        icon: "/favicon.ico",
      })
    }
  } catch (error) {
    console.error("Push notification setup error:", error)
  }
}

// Enhanced order creation with notifications
async function createOrder(orderData) {
  if (!currentUser) {
    showNotification("Debes iniciar sesión para realizar un pedido", "error")
    return false
  }

  try {
    const fullOrderData = {
      ...orderData,
      user_id: currentUser.id,
      status: "pending",
      payment_status: "pending",
    }

    const { data, error } = await dbService.createOrder(fullOrderData)

    if (error) {
      showNotification("Error al crear el pedido", "error")
      console.error("Order creation error:", error)
      return false
    }

    // Send confirmation email
    await emailService.sendOrderConfirmation(currentUser.email, data[0])

    // Show push notification
    await notificationService.showNotification("¡Pedido confirmado!", {
      body: `Tu pedido #${data[0].id.substring(0, 8)} ha sido creado exitosamente.`,
      icon: "/favicon.ico",
    })

    return data[0]
  } catch (error) {
    console.error("Error creating order:", error)
    return false
  }
}

// Enhanced load user orders function
async function loadUserOrders() {
  if (!currentUser) return

  try {
    const { data: userOrders, error } = await dbService.getUserOrders(currentUser.id)

    if (error) {
      console.error("Error loading orders:", error)
      return
    }

    const ordersContainer = document.getElementById("userOrders")
    if (!ordersContainer) return

    if (userOrders.length === 0) {
      ordersContainer.innerHTML = `
        <div class="empty-orders">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="8" cy="21" r="1"/>
            <circle cx="19" cy="21" r="1"/>
            <path d="m2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/>
          </svg>
          <h4>No tienes pedidos aún</h4>
          <p>Cuando realices tu primer pedido, aparecerá aquí</p>
          <button class="btn btn-primary" onclick="scrollToSection('eventos'); closeModal(userPanelModal)">
            Ver Diseños
          </button>
        </div>
      `
      return
    }

    ordersContainer.innerHTML = userOrders
      .map(
        (order) => `
        <div class="order-card">
          <div class="order-header">
            <div class="order-info">
              <h4>${order.design_name}</h4>
              <p>Pedido #${order.id.substring(0, 8)}</p>
            </div>
            <span class="order-status ${order.status}">${getStatusText(order.status)}</span>
          </div>
          <div class="order-details">
            <div class="order-detail">
              <span class="order-detail-label">Evento</span>
              <span class="order-detail-value">${order.event_title}</span>
            </div>
            <div class="order-detail">
              <span class="order-detail-label">Fecha del Evento</span>
              <span class="order-detail-value">${formatDate(order.event_date)}</span>
            </div>
            <div class="order-detail">
              <span class="order-detail-label">Paquete</span>
              <span class="order-detail-value">${order.package}</span>
            </div>
            <div class="order-detail">
              <span class="order-detail-label">Total</span>
              <span class="order-detail-value">€${order.total}</span>
            </div>
          </div>
          <div class="order-actions">
            <button class="btn btn-outline btn-sm" onclick="viewOrderDetails('${order.id}')">
              Ver Detalles
            </button>
            ${
              order.status === "completed"
                ? `
              <button class="btn btn-primary btn-sm" onclick="downloadInvitation('${order.id}')">
                Descargar Invitación
              </button>
            `
                : ""
            }
          </div>
        </div>
      `,
      )
      .join("")
  } catch (error) {
    console.error("Error loading user orders:", error)
  }
}

// Add the new event listeners function
function setupAuthEventListeners() {
  // Existing event listeners
  if (loginBtn) loginBtn.addEventListener("click", () => openModal(loginModal))
  if (registerBtn) registerBtn.addEventListener("click", () => openModal(registerModal))

  // Modal close listeners
  document.getElementById("closeLoginModal")?.addEventListener("click", () => closeModal(loginModal))
  document.getElementById("closeRegisterModal")?.addEventListener("click", () => closeModal(registerModal))
  document.getElementById("closePasswordResetModal")?.addEventListener("click", () => closeModal(passwordResetModal))
  document
    .getElementById("closeEmailVerificationModal")
    ?.addEventListener("click", () => closeModal(emailVerificationModal))
  document.getElementById("closeUserPanelModal")?.addEventListener("click", () => closeModal(userPanelModal))

  // Switch between modals
  document.getElementById("switchToRegister")?.addEventListener("click", (e) => {
    e.preventDefault()
    closeModal(loginModal)
    openModal(registerModal)
  })

  document.getElementById("switchToLogin")?.addEventListener("click", (e) => {
    e.preventDefault()
    closeModal(registerModal)
    openModal(loginModal)
  })

  document.getElementById("showPasswordReset")?.addEventListener("click", (e) => {
    e.preventDefault()
    closeModal(loginModal)
    openModal(passwordResetModal)
  })

  // User menu actions
  document.getElementById("userPanelBtn")?.addEventListener("click", (e) => {
    e.preventDefault()
    openUserPanel()
  })

  document.getElementById("myOrdersBtn")?.addEventListener("click", (e) => {
    e.preventDefault()
    openUserPanel("orders")
  })

  document.getElementById("logoutBtn")?.addEventListener("click", (e) => {
    e.preventDefault()
    logout()
  })

  // Form submissions
  if (loginForm) loginForm.addEventListener("submit", handleLogin)
  if (registerForm) registerForm.addEventListener("submit", handleRegister)
  if (profileForm) profileForm.addEventListener("submit", handleProfileUpdate)

  // Password reset form
  const passwordResetForm = document.getElementById("passwordResetForm")
  if (passwordResetForm) {
    passwordResetForm.addEventListener("submit", handlePasswordReset)
  }

  // Email verification actions
  document.getElementById("resendVerificationBtn")?.addEventListener("click", resendVerificationEmail)

  // Panel navigation
  document.querySelectorAll(".panel-nav-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const section = btn.dataset.section
      switchPanelSection(section)
    })
  })

  // Notification settings
  document.getElementById("emailNotifications")?.addEventListener("change", updateNotificationSettings)
  document.getElementById("pushNotifications")?.addEventListener("change", updateNotificationSettings)
}

// New notification settings function
async function updateNotificationSettings(e) {
  if (!currentUser) return

  const setting = e.target.id
  const enabled = e.target.checked

  try {
    const updateData = {}
    updateData[setting.replace("Notifications", "_notifications")] = enabled

    await dbService.updateUser(currentUser.id, updateData)

    showNotification(`Configuración de ${setting === "emailNotifications" ? "email" : "push"} actualizada`)
  } catch (error) {
    console.error("Error updating notification settings:", error)
    e.target.checked = !enabled // Revert the change
  }
}

// Initialize everything when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  // Add loaded class to body for CSS animations
  document.body.classList.add("loaded")

  // Initialize components
  initSlider()
  initEventFiltering()

  // Set current year in footer
  if (currentYearSpan) {
    currentYearSpan.textContent = new Date().getFullYear()
  }

  // Initialize any elements that need immediate animation
  const heroElements = document.querySelectorAll(".hero-text > *")
  heroElements.forEach((el, index) => {
    el.style.animationDelay = `${index * 0.1}s`
  })

  // En la función DOMContentLoaded existente, agrega:
  initAuth()
})

console.log("InviteU.Digital multipurpose website loaded successfully! 🎉")

function updateAuthUI() {
  if (currentUser) {
    // User is logged in
    authButtons.style.display = "none"
    userMenu.style.display = "flex"

    // Update user info in panel
    document.getElementById("userName").textContent = currentUser.name
    document.getElementById("userEmail").textContent = currentUser.email

    // Load user orders
    loadUserOrders()
  } else {
    // User is logged out
    authButtons.style.display = "flex"
    userMenu.style.display = "none"
  }
}

function openModal(modal) {
  modal.classList.add("active")
  document.body.style.overflow = "hidden"
}

function closeModal(modal) {
  modal.classList.remove("active")
  document.body.style.overflow = ""
}

async function handleProfileUpdate(e) {
  e.preventDefault()

  const formData = new FormData(profileForm)
  const name = formData.get("name")
  const phone = formData.get("phone")

  try {
    const { data, error } = await authService.updateProfile({
      name,
      phone,
    })

    if (error) {
      showNotification(`Error: ${error.message}`, "error")
      return
    }

    // Update current user object
    currentUser = {
      ...currentUser,
      name,
      phone,
    }

    // Sync with local database
    await syncUserData(currentUser)

    updateAuthUI()
    closeModal(userPanelModal)
    showNotification("Perfil actualizado correctamente")
  } catch (error) {
    showNotification("Error al actualizar el perfil", "error")
    console.error("Profile update error:", error)
  }
}

function openUserPanel(section = "profile") {
  openModal(userPanelModal)
  switchPanelSection(section)
}

function switchPanelSection(section) {
  // Hide all sections
  document.querySelectorAll(".panel-section").forEach((s) => s.classList.remove("active"))
  document.querySelectorAll(".panel-nav-btn").forEach((btn) => btn.classList.remove("active"))

  // Show selected section
  document.getElementById(`${section}Section`).classList.add("active")
  document.querySelector(`.panel-nav-btn[data-section="${section}"]`).classList.add("active")

  // Load orders if selected
  if (section === "orders") {
    loadUserOrders()
  }
}

function getStatusText(status) {
  switch (status) {
    case "pending":
      return "Pendiente"
    case "processing":
      return "En Proceso"
    case "completed":
      return "Completado"
    case "cancelled":
      return "Cancelado"
    default:
      return "Desconocido"
  }
}
