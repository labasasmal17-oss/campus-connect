
(() => {
  "use strict";

  const STORAGE_KEY = "campusConnectReports_v1";

  const CATEGORIES = [
    "Electrical",
    "Water",
    "Cleanliness",
    "Maintenance",
    "Internet",
    "Safety",
    "Other"
  ];

  // Get the HTML elements we need
  const form = document.getElementById("reportForm");
  const titleInput = document.getElementById("issueTitle");
  const categoryInput = document.getElementById("category");
  const locationInput = document.getElementById("location");
  const descriptionInput = document.getElementById("description");

  const formMessage = document.getElementById("formMessage");
  const reportsList = document.getElementById("reportsList");
  const emptyState = document.getElementById("emptyState");

  const categoryFilter = document.getElementById("categoryFilter");
  const statusFilter = document.getElementById("statusFilter");
  const clearFiltersButton = document.getElementById("clearFilters");

  const charCount = document.getElementById("charCount");
  const menuToggle = document.getElementById("menuToggle");
  const mainNav = document.getElementById("mainNav");

  // Load saved reports from the browser
  let reports = loadReports();

  function loadReports() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);

      if (!saved) {
        return [];
      }

      const parsed = JSON.parse(saved);

      if (!Array.isArray(parsed)) {
        return [];
      }

      return parsed.filter((report) =>
        report &&
        typeof report.id === "string" &&
        typeof report.title === "string" &&
        typeof report.category === "string" &&
        CATEGORIES.includes(report.category) &&
        typeof report.location === "string" &&
        typeof report.description === "string" &&
        ["Open", "Resolved"].includes(report.status) &&
        typeof report.createdAt === "string"
      );
    } catch (error) {
      console.error("Error loading reports:", error);
      return [];
    }
  }

  // Save reports in this browser
  function saveReports() {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(reports)
      );

      return true;
    } catch (error) {
      console.error("Error saving reports:", error);

      showMessage(
        "Could not save your report. Check your browser storage.",
        "error"
      );

      return false;
    }
  }

  // Show success or error messages
  function showMessage(message, type) {
    formMessage.textContent = message;

    formMessage.className =
      "notice " +
      (type === "success"
        ? "notice-success"
        : "notice-error");

    formMessage.hidden = false;
  }

  function hideMessage() {
    formMessage.hidden = true;
    formMessage.textContent = "";
    formMessage.className = "notice";
  }

  // Create HTML elements safely
  function makeElement(tag, className, text) {
    const element = document.createElement(tag);

    if (className) {
      element.className = className;
    }

    if (text !== undefined) {
      element.textContent = text;
    }

    return element;
  }

  // Format the date of a report
  function formatDate(dateString) {
    const date = new Date(dateString);

    if (Number.isNaN(date.getTime())) {
      return "Date unavailable";
    }

    return new Intl.DateTimeFormat(undefined, {
      day: "numeric",
      month: "short",
      year: "numeric"
    }).format(date);
  }

  // Display reports and update the dashboard
  function renderReports() {
    const selectedCategory = categoryFilter.value;
    const selectedStatus = statusFilter.value;

    const filteredReports = reports.filter((report) => {
      const categoryMatches =
        selectedCategory === "All" ||
        report.category === selectedCategory;

      const statusMatches =
        selectedStatus === "All" ||
        report.status === selectedStatus;

      return categoryMatches && statusMatches;
    });

    reportsList.replaceChildren();

    emptyState.style.display =
      filteredReports.length > 0 ? "none" : "block";

    filteredReports.forEach((report) => {
      const card = makeElement("article", "report-card");

      // Category and status
      const top = makeElement("div", "report-card-top");

      const category = makeElement(
        "span",
        "category-pill",
        report.category
      );

      const statusClass =
        report.status === "Resolved"
          ? "status-resolved"
          : "status-open";

      const status = makeElement(
        "span",
        "status-pill " + statusClass,
        report.status
      );

      top.append(category, status);

      // Report title and description
      const title = makeElement("h3", "", report.title);

      const description = makeElement(
        "p",
        "report-description",
        report.description
      );

      // Location and date
      const meta = makeElement("div", "report-meta");

      const location = makeElement(
        "span",
        "",
        "⌖ " + report.location
      );

      const date = makeElement(
        "span",
        "",
        "◷ " + formatDate(report.createdAt)
      );

      meta.append(location, date);

      // Buttons
      const actions = makeElement(
        "div",
        "report-card-actions"
      );

      if (report.status === "Open") {
        const resolveButton = makeElement(
          "button",
          "small-button resolve-button",
          "✓ Mark resolved"
        );

        resolveButton.type = "button";

        resolveButton.addEventListener("click", () => {
          updateStatus(report.id);
        });

        actions.append(resolveButton);
      } else {
        const reopenButton = makeElement(
          "button",
          "small-button",
          "↻ Reopen"
        );

        reopenButton.type = "button";

        reopenButton.addEventListener("click", () => {
          updateStatus(report.id);
        });

        actions.append(reopenButton);
      }

      const deleteButton = makeElement(
        "button",
        "small-button delete-button",
        "Delete"
      );

      deleteButton.type = "button";

      deleteButton.addEventListener("click", () => {
        deleteReport(report.id);
      });

      actions.append(deleteButton);

      card.append(
        top,
        title,
        description,
        meta,
        actions
      );

      reportsList.append(card);
    });

    // Update dashboard counts
    document.getElementById("totalCount").textContent =
      reports.length;

    document.getElementById("openCount").textContent =
      reports.filter((report) => report.status === "Open").length;

    document.getElementById("resolvedCount").textContent =
      reports.filter((report) => report.status === "Resolved").length;

    document.getElementById("reportCountPill").textContent =
      reports.length +
      (reports.length === 1 ? " report" : " reports");

    document.getElementById("listSummary").textContent =
      "Showing " +
      filteredReports.length +
      " of " +
      reports.length +
      (reports.length === 1 ? " report" : " reports");
  }

  // Change a report's status
  function updateStatus(id) {
    const report = reports.find((item) => item.id === id);

    if (!report) {
      return;
    }

    report.status =
      report.status === "Open" ? "Resolved" : "Open";

    if (saveReports()) {
      renderReports();
    }
  }

  // Delete a report
  function deleteReport(id) {
    const report = reports.find((item) => item.id === id);

    if (!report) {
      return;
    }

    const confirmed = window.confirm(
      'Delete the report "' + report.title + '"?'
    );

    if (!confirmed) {
      return;
    }

    const previousReports = reports;

    reports = reports.filter((item) => item.id !== id);

    if (saveReports()) {
      renderReports();
    } else {
      reports = previousReports;
    }
  }

  // Validate the form before submitting
  function validateForm() {
    const title = titleInput.value.trim();
    const category = categoryInput.value;
    const location = locationInput.value.trim();
    const description = descriptionInput.value.trim();

    if (title.length < 5 || title.length > 80) {
      showMessage(
        "Title must contain between 5 and 80 characters.",
        "error"
      );

      titleInput.focus();
      return null;
    }

    if (!CATEGORIES.includes(category)) {
      showMessage(
        "Please choose a valid category.",
        "error"
      );

      categoryInput.focus();
      return null;
    }

    if (location.length < 2 || location.length > 100) {
      showMessage(
        "Location must contain between 2 and 100 characters.",
        "error"
      );

      locationInput.focus();
      return null;
    }

    if (
      description.length < 10 ||
      description.length > 500
    ) {
      showMessage(
        "Description must contain between 10 and 500 characters.",
        "error"
      );

      descriptionInput.focus();
      return null;
    }

    return {
      title,
      category,
      location,
      description
    };
  }

  // Handle form submission
  form.addEventListener("submit", (event) => {
    event.preventDefault();

    hideMessage();

    const values = validateForm();

    if (!values) {
      return;
    }

    const report = {
      id:
        window.crypto &&
        typeof window.crypto.randomUUID === "function"
          ? window.crypto.randomUUID()
          : Date.now() +
            "-" +
            Math.random().toString(16).slice(2),

      ...values,

      status: "Open",
      createdAt: new Date().toISOString()
    };

    reports.unshift(report);

    if (!saveReports()) {
      reports = reports.filter(
        (item) => item.id !== report.id
      );

      return;
    }

    form.reset();

    charCount.textContent = "0/500";

    renderReports();

    showMessage(
      "Report submitted successfully! It is saved in this browser only.",
      "success"
    );

    document.getElementById("reports").scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  });

  // Category and status filters
  categoryFilter.addEventListener("change", renderReports);
  statusFilter.addEventListener("change", renderReports);

  // Reset filters
  clearFiltersButton.addEventListener("click", () => {
    categoryFilter.value = "All";
    statusFilter.value = "All";

    renderReports();
  });

  // Live description character counter
  descriptionInput.addEventListener("input", () => {
    charCount.textContent =
      descriptionInput.value.length + "/500";
  });

  // Hide old validation messages when the user edits a field
  [
    titleInput,
    categoryInput,
    locationInput,
    descriptionInput
  ].forEach((field) => {
    field.addEventListener("input", () => {
      if (!formMessage.hidden) {
        hideMessage();
      }
    });

    field.addEventListener("change", () => {
      if (!formMessage.hidden) {
        hideMessage();
      }
    });
  });

  // Mobile navigation menu
  menuToggle.addEventListener("click", () => {
    const isOpen = mainNav.classList.toggle("is-open");

    menuToggle.setAttribute(
      "aria-expanded",
      String(isOpen)
    );

    menuToggle.setAttribute(
      "aria-label",
      isOpen ? "Close navigation" : "Open navigation"
    );
  });

  mainNav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      mainNav.classList.remove("is-open");

      menuToggle.setAttribute("aria-expanded", "false");
      menuToggle.setAttribute("aria-label", "Open navigation");
    });
  });

  // Initial display when the page opens
  renderReports();
})();
