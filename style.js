
/* Campus Connect student demo account system.
   This is NOT secure authentication. */
(() => {
  "use strict";

  const $ = (id) => document.getElementById(id);

  const modal = $("authModal");
  const authButton = $("authButton");
  const signInForm = $("signInForm");
  const signUpForm = $("signUpForm");
  const message = $("authMessage");
  const welcome = $("studentWelcome");

  const USERS_KEY = "campusConnectDemoUsers";
  const SESSION_KEY = "campusConnectDemoSession";

  // Read demo accounts saved in this browser.
  function getUsers() {
    try {
      return JSON.parse(localStorage.getItem(USERS_KEY) || "[]");
    } catch {
      return [];
    }
  }

  function saveUsers(users) {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  }

  function getSession() {
    try {
      return JSON.parse(sessionStorage.getItem(SESSION_KEY) || "null");
    } catch {
      return null;
    }
  }

  function showMessage(text, isError = false) {
    message.textContent = text;
    message.hidden = false;
    message.style.background = isError ? "#fef2f2" : "#ecfdf3";
    message.style.color = isError ? "#b91c1c" : "#166534";
  }

  function clearMessage() {
    message.textContent = "";
    message.hidden = true;
  }

  function openModal(mode = "signin") {
    modal.hidden = false;
    document.body.style.overflow = "hidden";
    setMode(mode);
  }

  function closeModal() {
    modal.hidden = true;
    document.body.style.overflow = "";
    clearMessage();
  }

  function setMode(mode) {
    const signup = mode === "signup";

    signInForm.hidden = signup;
    signUpForm.hidden = !signup;

    $("showSignIn").classList.toggle("active", !signup);
    $("showSignUp").classList.toggle("active", signup);

    $("authHeading").textContent = signup
      ? "Create your student account"
      : "Welcome back";

    $("authSubtitle").textContent = signup
      ? "Enter your details to join Campus Connect."
      : "Sign in to your campus community.";

    clearMessage();
  }

  function renderStudent() {
    const session = getSession();

    if (session) {
      welcome.hidden = false;
      $("welcomeName").textContent = "Welcome, " + session.name + "!";

      $("welcomeDetails").textContent =
        "Roll Number: " + session.roll +
        " | Branch: " + session.branch +
        " | Class/Section: " + session.className +
        " | Room: " + session.room;

      authButton.textContent = "Sign Out";
    } else {
      welcome.hidden = true;
      $("welcomeName").textContent = "";
      $("welcomeDetails").textContent = "";
      authButton.textContent = "Sign In";
    }
  }

  authButton.addEventListener("click", () => {
    if (getSession()) {
      sessionStorage.removeItem(SESSION_KEY);
      renderStudent();
    } else {
      openModal("signin");
    }
  });

  $("closeAuth").addEventListener("click", closeModal);
  $("authBackdrop").addEventListener("click", closeModal);

  $("showSignIn").addEventListener("click", () => setMode("signin"));
  $("showSignUp").addEventListener("click", () => setMode("signup"));
  $("switchToSignIn").addEventListener("click", () => setMode("signin"));
  $("switchToSignUp").addEventListener("click", () => setMode("signup"));

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !modal.hidden) {
      closeModal();
    }
  });

  // Register a student in this browser.
  signUpForm.addEventListener("submit", (event) => {
    event.preventDefault();
    clearMessage();

    const student = {
      name: $("studentName").value.trim(),
      email: $("studentEmail").value.trim().toLowerCase(),
      roll: $("studentRoll").value.trim(),
      branch: $("studentBranch").value,
      className: $("studentClass").value.trim(),
      room: $("studentRoom").value.trim()
    };

    const password = $("registerPassword").value;
    const confirm = $("confirmPassword").value;

    if (password !== confirm) {
      showMessage("The passwords do not match.", true);
      return;
    }

    const users = getUsers();

    if (users.some((user) => user.email === student.email)) {
      showMessage(
        "This email already has a demo account. Please sign in.",
        true
      );
      return;
    }

    // Password is deliberately not saved.
    // This demo cannot provide secure authentication.
    users.push(student);
    saveUsers(users);

    sessionStorage.setItem(SESSION_KEY, JSON.stringify(student));
    signUpForm.reset();
    renderStudent();

    showMessage("Demo registration successful! Welcome, " + student.name + ".");
    window.setTimeout(closeModal, 1200);
  });

  // Sign in using the email and demo password entered at registration.
  // Since passwords are not stored, this demo only matches registered email.
  signInForm.addEventListener("submit", (event) => {
    event.preventDefault();
    clearMessage();

    const email = $("loginEmail").value.trim().toLowerCase();
    const password = $("loginPassword").value;

    if (password.length < 4) {
      showMessage("Enter a demo password of at least 4 characters.", true);
      return;
    }

    const student = getUsers().find((user) => user.email === email);

    if (!student) {
      showMessage(
        "No demo account found for this email in this browser. Please sign up first.",
        true
      );
      return;
    }

    sessionStorage.setItem(SESSION_KEY, JSON.stringify(student));
    signInForm.reset();
    renderStudent();

    showMessage("Welcome back, " + student.name + "!");
    window.setTimeout(closeModal, 1000);
  });

  $("logoutButton").addEventListener("click", () => {
    sessionStorage.removeItem(SESSION_KEY);
    renderStudent();
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  // Restore the welcome message when the page is refreshed in this tab.
  renderStudent();
})();
