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

    this.setupEventListeners()
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
      UI.updateAuthUI(this.currentUser)

      if (!this.currentUser.email_verified) {
        UI.showNotification("Por favor verifica tu email para acceder a todas las funciones", "warning")
      }
    } else if (event === "SIGNED_OUT") {
      this.currentUser = null
      this.removeUserFromStorage()
      UI.updateAuthUI(null)
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

        UI.showNotification("¡Registro exitoso! Verifica tu email para continuar.")
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
        UI.updateAuthUI(this.currentUser)

        UI.showNotification("¡Registro exitoso!")
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

        UI.showNotification("¡Bienvenido de vuelta!")
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
        UI.updateAuthUI(this.currentUser)

        UI.showNotification("¡Bienvenido de vuelta!")
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
        UI.updateAuthUI(null)
      }

      UI.showNotification("Sesión cerrada correctamente")
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

        UI.showNotification("Email de recuperación enviado. Revisa tu bandeja de entrada.")
        return { success: true }
      } else {
        // Simulate email sending for demo
        UI.showNotification("Email de recuperación enviado (simulado).")
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
      UI.updateAuthUI(this.currentUser)
    }
  },

  removeUserFromStorage() {
    Utils.removeStorage("inviteu_current_user")
  },

  // Setup event listeners
  setupEventListeners() {
    // Login form
    const loginForm = Utils.$("#loginForm")
    if (loginForm) {
      const validationRules = {
        email: [{ type: "required" }, { type: "email" }],
        password: [{ type: "required" }],
      }

      Validation.setupValidation(loginForm, validationRules)

      loginForm.addEventListener("submit", async (e) => {
        e.preventDefault()

        if (!Validation.validateForm(loginForm, validationRules)) return

        const submitBtn = loginForm.querySelector('button[type="submit"]')
        Utils.setLoading(submitBtn, true)

        const formData = new FormData(loginForm)
        const result = await this.login(formData.get("email"), formData.get("password"))

        Utils.setLoading(submitBtn, false)

        if (result.success) {
          UI.closeModal("loginModal")
          loginForm.reset()
        }
      })
    }

    // Register form
    const registerForm = Utils.$("#registerForm")
    if (registerForm) {
      const validationRules = {
        name: [{ type: "required" }],
        email: [{ type: "required" }, { type: "email" }],
        phone: [{ type: "phone" }],
        password: [{ type: "required" }, { type: "minLength", value: CONFIG.VALIDATION.PASSWORD_MIN_LENGTH }],
        confirmPassword: [{ type: "required" }, { type: "match", field: "#registerPassword" }],
      }

      Validation.setupValidation(registerForm, validationRules)

      registerForm.addEventListener("submit", async (e) => {
        e.preventDefault()

        if (!Validation.validateForm(registerForm, validationRules)) return

        const submitBtn = registerForm.querySelector('button[type="submit"]')
        Utils.setLoading(submitBtn, true)

        const formData = new FormData(registerForm)
        const result = await this.register({
          name: formData.get("name"),
          email: formData.get("email"),
          phone: formData.get("phone"),
          password: formData.get("password"),
        })

        Utils.setLoading(submitBtn, false)

        if (result.success) {
          UI.closeModal("registerModal")
          registerForm.reset()
        }
      })
    }

    // Auth buttons
    const loginBtn = Utils.$("#loginBtn")
    const registerBtn = Utils.$("#registerBtn")
    const logoutBtn = Utils.$("#logoutBtn")

    if (loginBtn) {
      loginBtn.addEventListener("click", () => UI.openModal("loginModal"))
    }

    if (registerBtn) {
      registerBtn.addEventListener("click", () => UI.openModal("registerModal"))
    }

    if (logoutBtn) {
      logoutBtn.addEventListener("click", () => this.logout())
    }
  },
}

// Make Auth globally available
window.Auth = Auth
