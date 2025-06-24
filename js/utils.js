// Utility Functions
const Utils = {
  // DOM Utilities
  $(selector) {
    return document.querySelector(selector)
  },

  $$(selector) {
    return document.querySelectorAll(selector)
  },

  createElement(tag, className, content) {
    const element = document.createElement(tag)
    if (className) element.className = className
    if (content) element.innerHTML = content
    return element
  },

  // Event Utilities
  debounce(func, wait) {
    let timeout
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout)
        func(...args)
      }
      clearTimeout(timeout)
      timeout = setTimeout(later, wait)
    }
  },

  throttle(func, limit) {
    let inThrottle
    return function () {
      const args = arguments
      
      if (!inThrottle) {
        func.apply(this, args)
        inThrottle = true
        setTimeout(() => (inThrottle = false), limit)
      }
    }
  },

  // Validation Utilities
  isValidEmail(email) {
    return window.CONFIG.VALIDATION.EMAIL_REGEX.test(email)
  },

  isValidPhone(phone) {
    return window.CONFIG.VALIDATION.PHONE_REGEX.test(phone)
  },

  // Format Utilities
  formatDate(dateString) {
    if (!dateString) return "Fecha"
    const date = new Date(dateString)
    return date.toLocaleDateString("es-ES", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  },

  formatPrice(price) {
    return `€${price.toLocaleString("es-ES")}`
  },

  // Animation Utilities
  scrollToSection(sectionId) {
    const section = this.$(sectionId.startsWith("#") ? sectionId : `#${sectionId}`)
    if (section) {
      section.scrollIntoView({
        behavior: "smooth",
        block: "start",
      })
    }
  },

  // Storage Utilities
  setStorage(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch (error) {
      console.error("Error saving to localStorage:", error)
    }
  },

  getStorage(key) {
    try {
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : null
    } catch (error) {
      console.error("Error reading from localStorage:", error)
      return null
    }
  },

  removeStorage(key) {
    try {
      localStorage.removeItem(key)
    } catch (error) {
      console.error("Error removing from localStorage:", error)
    }
  },

  // Loading state utilities
  setLoading(element, isLoading) {
    const btnText = element.querySelector(".btn-text")
    const spinner = element.querySelector(".loading-spinner")

    if (isLoading) {
      element.disabled = true
      if (btnText) btnText.style.display = "none"
      if (spinner) spinner.style.display = "inline-block"
    } else {
      element.disabled = false
      if (btnText) btnText.style.display = "inline"
      if (spinner) spinner.style.display = "none"
    }
  },

  // Error handling
  handleError(error, context = "") {
    console.error(`Error in ${context}:`, error)

    let message = "Ha ocurrido un error inesperado"

    if (error.message) {
      message = error.message
    } else if (typeof error === "string") {
      message = error
    }

    window.UI.showNotification(message, "error")
  },
}

// Make Utils globally available
window.Utils = Utils
