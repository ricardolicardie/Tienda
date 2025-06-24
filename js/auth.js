// Authentication Management
const Auth = {
  currentUser: null,
  supabase: null,

  // Initialize Supabase
  async init() {
    if (typeof supabase !== "undefined") {
      this.supabase = supabase.createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY)

      // Listen for auth changes
      this.supabase.auth.onAuthStateChange((event, session) => {
        this.handleAuthChange(event, session)
      })

      // Check current session
      const {
        data: { session },
      } = await this.supabase.auth.getSession()
      if (session) {
        this.handleAuthChange("SIGNED_IN", session)
      }
    } else {
      // Fallback to localStorage for demo
      this.loadUserFromStorage()
    }

    // Setup event listeners after DOM is ready
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () => this.setupEventListeners())
    } else {
      this.setupEventListeners()
    }
  },

  // Handle auth state changes
  async handleAuthChange(event, session) {
    if (event === "SIGNED_IN" && session) {
      this.currentUser = {
        id: session.user.id,
        email: session.user.email,
        name: session.user.user_metadata?.name || session.user.email,
        phone: session.user.user_metadata?.phone || "",
        email_verified: session.user.email_confirmed_at !== null,
      }

      this.saveUserToStorage()
      window.UI.updateAuthUI(this.currentUser)

      if (!this.currentUser.email_verified) {
        window.UI.showNotification("Por favor verifica tu email para acceder a todas las funciones", "warning")
      }
    } else if (event === "SIGNED_OUT") {
      this.currentUser = null
      this.removeUserFromStorage()
      window.UI.updateAuthUI(null)
    }
  },

  // Register user
  async register(userData) {
    try {
      if (this.supabase) {
        const { data, error } = await this.supabase.auth.signUp({
          email: userData.email,
          password: userData.password,
          options: {
            data: {
              name: userData.name,
              phone: userData.phone,
            },
          },
        })

        if (error) throw error

        window.UI.showNotification("¡Registro exitoso! Verifica tu email para continuar.")
        return { success: true, data }
      } else {
        // Fallback for demo
        const users = Utils.getStorage("inviteu_users") || []

        // Check if user exists
        if (users.find((u) => u.email === userData.email)) {
          throw new Error("El usuario ya existe")
        }

        const newUser = {
          id: Date.now().toString(),
          email: userData.email,
          name: userData.name,
          phone: userData.phone,
          email_verified: false,
          created_at: new Date().toISOString(),
        }

        users.push(newUser)
        Utils.setStorage("inviteu_users", users)

        this.currentUser = newUser
        this.saveUserToStorage()
        window.UI.updateAuthUI(this.currentUser)

        window.UI.showNotification("¡Registro exitoso!")
        return { success: true, data: newUser }
      }
    } catch (error) {
      Utils.handleError(error, "register")
      return { success: false, error: error.message }
    }
  },

  // Login user
  async login(email, password) {
    try {
      if (this.supabase) {
        const { data, error } = await this.supabase.auth.signInWithPassword({
          email,
          password,
        })

        if (error) throw error

        window.UI.showNotification("¡Bienvenido de vuelta!")
        return { success: true, data }
      } else {
        // Fallback for demo
        const users = Utils.getStorage("inviteu_users") || []
        const user = users.find((u) => u.email === email)

        if (!user) {
          throw new Error("Usuario no encontrado")
        }

        this.currentUser = user
        this.saveUserToStorage()
        window.UI.updateAuthUI(this.currentUser)

        window.UI.showNotification("¡Bienvenido de vuelta!")
        return { success: true, data: user }
      }
    } catch (error) {
      Utils.handleError(error, "login")
      return { success: false, error: error.message }
    }
  },

  // Logout user
  async logout() {
    try {
      if (this.supabase) {
        const { error } = await this.supabase.auth.signOut()
        if (error) throw error
      } else {
        this.currentUser = null
        this.removeUserFromStorage()
        window.UI.updateAuthUI(null)
      }

      window.UI.showNotification("Sesión cerrada correctamente")
      return { success: true }
    } catch (error) {
      Utils.handleError(error, "logout")
      return { success: false, error: error.message }
    }
  },

  // Reset password
  async resetPassword(email) {
    try {
      if (this.supabase) {
        const { error } = await this.supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        })

        if (error) throw error

        window.UI.showNotification("Email de recuperación enviado. Revisa tu bandeja de entrada.")
        return { success: true }
      } else {
        // Simulate email sending for demo
        window.UI.showNotification("Email de recuperación enviado (simulado).")
        return { success: true }
      }
    } catch (error) {
      Utils.handleError(error, "resetPassword")
      return { success: false, error: error.message }
    }
  },

  // Storage methods for fallback
  saveUserToStorage() {
    if (this.currentUser) {
      Utils.setStorage("inviteu_current_user", this.currentUser)
    }
  },

  loadUserFromStorage() {
    const user = Utils.getStorage("inviteu_current_user")
    if (user) {
      this.currentUser = user
      window.UI.updateAuthUI(this.currentUser)
    }
  },

  removeUserFromStorage() {
    Utils.removeStorage("inviteu_current_user")
  },

  // Setup event listeners
  setupEventListeners() {
    // Wait for UI to be ready
    if (!window.UI) {
      setTimeout(() => this.setupEventListeners(), 100)
      return
    }

    // Auth buttons
    const loginBtn = Utils.$("#loginBtn")
    const registerBtn = Utils.$("#registerBtn")
    const logoutBtn = Utils.$("#logoutBtn")

    if (loginBtn) {
      loginBtn.addEventListener("click", () => window.UI.openModal("loginModal"))
    }

    if (registerBtn) {
      registerBtn.addEventListener("click", () => window.UI.openModal("registerModal"))
    }

    if (logoutBtn) {
      logoutBtn.addEventListener("click", () => this.logout())
    }

    // Setup form listeners when modals are opened
    document.addEventListener("modalOpened", (e) => {
      if (e.detail.modalId === "loginModal") {
        this.setupLoginForm()
      } else if (e.detail.modalId === "registerModal") {
        this.setupRegisterForm()
      }
    })
  },

  // Setup login form
  setupLoginForm() {
    const loginForm = Utils.$("#loginForm")
    if (!loginForm) return

    const validationRules = {
      email: [{ type: "required" }, { type: "email" }],
      password: [{ type: "required" }],
    }

    Validation.setupValidation(loginForm, validationRules)

    // Remove existing listeners
    const newForm = loginForm.cloneNode(true)
    loginForm.parentNode.replaceChild(newForm, loginForm)

    newForm.addEventListener("submit", async (e) => {
      e.preventDefault()

      if (!Validation.validateForm(newForm, validationRules)) return

      const submitBtn = newForm.querySelector('button[type="submit"]')
      Utils.setLoading(submitBtn, true)

      const formData = new FormData(newForm)
      const result = await this.login(formData.get("email"), formData.get("password"))

      Utils.setLoading(submitBtn, false)

      if (result.success) {
        window.UI.closeModal("loginModal")
        newForm.reset()
      }
    })
  },

  // Setup register form
  setupRegisterForm() {
    const registerForm = Utils.$("#registerForm")
    if (!registerForm) return

    const validationRules = {
      name: [{ type: "required" }],
      email: [{ type: "required" }, { type: "email" }],
      phone: [{ type: "phone" }],
      password: [{ type: "required" }, { type: "minLength", value: CONFIG.VALIDATION.PASSWORD_MIN_LENGTH }],
      confirmPassword: [{ type: "required" }, { type: "match", field: "#registerPassword" }],
    }

    Validation.setupValidation(registerForm, validationRules)

    // Remove existing listeners
    const newForm = registerForm.cloneNode(true)
    registerForm.parentNode.replaceChild(newForm, registerForm)

    newForm.addEventListener("submit", async (e) => {
      e.preventDefault()

      if (!Validation.validateForm(newForm, validationRules)) return

      const submitBtn = newForm.querySelector('button[type="submit"]')
      Utils.setLoading(submitBtn, true)

      const formData = new FormData(newForm)
      const result = await this.register({
        name: formData.get("name"),
        email: formData.get("email"),
        phone: formData.get("phone"),
        password: formData.get("password"),
      })

      Utils.setLoading(submitBtn, false)

      if (result.success) {
        window.UI.closeModal("registerModal")
        newForm.reset()
      }
    })
  },
}

// Make Auth globally available
window.Auth = Auth
