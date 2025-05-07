const createRegisterTemplate = ({ error = null, isLoading = false }) => {
  const errorComponent = error
    ? `
      <div class="auth-error">
        <i class="fas fa-exclamation-circle"></i>
        <p>${error}</p>
      </div>
    `
    : "";

  const buttonContent = isLoading
    ? '<i class="fas fa-spinner fa-spin"></i> Registering...'
    : '<i class="fas fa-user-plus"></i> Register';

  const inputState = isLoading ? "disabled" : "";

  return `
    <section class="auth">
      <div class="auth-container">
        <h2 class="auth__title">Register</h2>

        ${errorComponent}

        <form id="registerForm" class="auth-form">
          <div class="form-group">
            <label for="name" class="form-label">Name</label>
            <input 
              type="text" 
              id="name" 
              name="name" 
              class="form-input" 
              placeholder="Your name" 
              required
              ${inputState}
            />
          </div>

          <div class="form-group">
            <label for="email" class="form-label">Email</label>
            <input 
              type="email" 
              id="email" 
              name="email" 
              class="form-input" 
              placeholder="your.email@example.com" 
              required
              ${inputState}
            />
          </div>

          <div class="form-group">
            <label for="password" class="form-label">Password</label>
            <input 
              type="password" 
              id="password" 
              name="password" 
              class="form-input" 
              placeholder="Min. 8 characters" 
              required
              minlength="8"
              ${inputState}
            />
            <p class="form-hint">Password must be at least 8 characters</p>
          </div>

          <div class="form-group">
            <label for="confirmPassword" class="form-label">Confirm Password</label>
            <input 
              type="password" 
              id="confirmPassword" 
              name="confirmPassword" 
              class="form-input" 
              placeholder="Confirm your password" 
              required
              minlength="8"
              ${inputState}
            />
          </div>

          <div class="form-actions">
            <button 
              type="submit" 
              id="registerButton" 
              class="button"
              ${inputState}
            >
              ${buttonContent}
            </button>
          </div>
        </form>

        <div class="auth-footer">
          <p>Already have an account?</p>
          <a href="#/login" class="auth-link">Login here</a>
        </div>
      </div>
    </section>
  `;
};

export default createRegisterTemplate;