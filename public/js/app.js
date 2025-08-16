// API config
const API_BASE_URL = "http://localhost:5000/api";

// DOM elements
const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");
const logoutBtn = document.getElementById("logoutBtn");

// dashboard elements
const journalForm = document.getElementById("journalForm");
const articleForm = document.getElementById("articleForm");
const appointmentForm = document.getElementById("appointmentForm");
const sections = {
  journal: document.getElementById("journalSection"),
  articles: document.getElementById("articleSection"),
  appointments: document.getElementById("appointmentSection"),
};
const tabButtons = {
  journal: document.getElementById("journalsTab"),
  articles: document.getElementById("articlesTab"),
  appointments: document.getElementById("appointmentsTab"),
};

// auth
if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try {
      const response = await fetch(`${API_BASE_URL}/users/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("token", data.token);
        window.location.href = "dashboard.html";
      } else {
        alert(data.message || "Login failed");
      }
    } catch (err) {
      console.error("Login error:", err);
      alert("Login failed. Please try again.");
    }
  });
}

if (registerForm) {
  registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const username = document.getElementById("username").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try {
      const response = await fetch(`${API_BASE_URL}/users/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        alert("Registration successful! Please login.");
        window.location.href = "login.html";
      } else {
        alert(data.message || "Registration failed");
      }
    } catch (err) {
      console.error("Registration error:", err);
      alert("Registration failed. Please try again.");
    }
  });
}

// dashboard
if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("token");
    window.location.href = "index.html";
  });
}

// tab navigation
Object.entries(tabButtons).forEach(([sectionName, button]) => {
  if (button) {
    button.addEventListener("click", () => {
      // Hide all sections
      Object.values(sections).forEach((section) => {
        section.classList.remove("active");
      });

      // selected section
      sections[sectionName].classList.add("active");
    });
  }
});

// authentication on dashboard load
if (window.location.pathname.includes("dashboard.html")) {
  const token = localStorage.getItem("token");

  if (!token) {
    window.location.href = "login.html";
  } else {
    // user data and check role
    fetchUserData();

    // initial data
    loadJournals();
    loadArticles();
    loadAppointments();
  }
}

async function fetchUserData() {
  try {
    const response = await fetch(`${API_BASE_URL}/users/me`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });

    if (response.ok) {
      const user = await response.json();

      // show admin controls if user is admin
      if (user.role === "admin") {
        document.querySelectorAll(".admin-only").forEach((el) => {
          el.style.display = "block";
        });
      }
    }
  } catch (err) {
    console.error("Failed to fetch user data:", err);
  }
}

// journal
async function loadJournals() {
  try {
    const response = await fetch(`${API_BASE_URL}/journals`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });

    if (response.ok) {
      const journals = await response.json();
      const journalEntries = document.getElementById("journalEntries");

      journalEntries.innerHTML = journals
        .map(
          (journal) => `
        <div class="user-card">
          <h3>${journal.title || "Untitled"}</h3>
          <p>${journal.content}</p>
          <small>${new Date(journal.createdAt).toLocaleString()}</small>
          <button onclick="editJournal('${journal.id}')">Edit</button>
          <button onclick="deleteJournal('${journal.id}')">Delete</button>
        </div>
      `
        )
        .join("");
    }
  } catch (err) {
    console.error("Failed to load journals:", err);
  }
}

if (journalForm) {
  journalForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const title = document.getElementById("journalTitle").value;
    const content = document.getElementById("journalContent").value;

    try {
      const response = await fetch(`${API_BASE_URL}/journals`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ title, content }),
      });

      if (response.ok) {
        journalForm.reset();
        loadJournals();
      } else {
        alert("Failed to save journal entry");
      }
    } catch (err) {
      console.error("Journal save error:", err);
    }
  });
}

// article
async function loadArticles(category = "") {
  try {
    const url = category
      ? `${API_BASE_URL}/articles/category/${category}`
      : `${API_BASE_URL}/articles`;

    const response = await fetch(url);

    if (response.ok) {
      const articles = await response.json();
      const articleList = document.getElementById("articleList");

      articleList.innerHTML = articles
        .map(
          (article) => `
        <div class="article-card">
          <div class="article-content">
            <span class="article-category">${article.category}</span>
            <h3>${article.title}</h3>
            <p>${article.content.substring(0, 150)}...</p>
            <small>${new Date(article.createdAt).toLocaleDateString()}</small>
          </div>
        </div>
      `
        )
        .join("");
    }
  } catch (err) {
    console.error("Failed to load articles:", err);
  }
}

// category filter event handler
const categoryFilter = document.getElementById("articleCategoryFilter");
const applyFilter = document.getElementById("applyFilter");

if (applyFilter && categoryFilter) {
  applyFilter.addEventListener("click", () => {
    const selectedCategory = categoryFilter.value;
    if (selectedCategory === "") {
      // load all articles when "All Categories" is selected
      loadArticles();
    } else {
      // load specific category
      loadArticles(selectedCategory);
    }
  });
}

// update loadArticles function to handle empty category
async function loadArticles(category) {
  try {
    let url = `${API_BASE_URL}/articles`;
    const params = new URLSearchParams();

    if (category && category !== "") {
      params.append("category", category);
    }

    // add pagination parameters
    params.append("page", 1);
    params.append("limit", 100);

    url = `${url}?${params.toString()}`;

    const response = await fetch(url);

    if (response.ok) {
      const data = await response.json();
      const articles = data.data || data; // handle both paginated and non-paginated responses
      const articleList = document.getElementById("articleList");

      if (articles.length === 0) {
        articleList.innerHTML = "<p>No articles found</p>";
        return;
      }

      articleList.innerHTML = articles
        .map(
          (article) => `
        <div class="article-card">
          <div class="article-content">
            <span class="article-category">${article.category}</span>
            <h3>${article.title}</h3>
            <p>${article.content.substring(0, 150)}...</p>
            <small>${new Date(article.createdAt).toLocaleDateString()}</small>
          </div>
        </div>
      `
        )
        .join("");
    } else {
      document.getElementById("articleList").innerHTML =
        "<p>Error loading articles</p>";
    }
  } catch (err) {
    console.error("Failed to load articles:", err);
    document.getElementById("articleList").innerHTML =
      "<p>Failed to load articles</p>";
  }
}

// initialize with all articles
if (window.location.pathname.includes("dashboard.html")) {
  loadArticles();
}

if (articleForm) {
  articleForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const title = document.getElementById("articleTitle").value;
    const content = document.getElementById("articleContent").value;
    const category = document.getElementById("articleCategory").value;

    try {
      const response = await fetch(`${API_BASE_URL}/articles`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ title, content, category }),
      });

      if (response.ok) {
        articleForm.reset();
        loadArticles();
      } else {
        alert("Failed to publish article");
      }
    } catch (err) {
      console.error("Article publish error:", err);
    }
  });
}

// appointment
async function loadAppointments() {
  try {
    // user appointments
    const userResponse = await fetch(`${API_BASE_URL}/appointments`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });

    if (userResponse.ok) {
      const appointments = await userResponse.json();
      const appointmentList = document.getElementById("appointmentList");

      appointmentList.innerHTML = appointments
        .map(
          (appt) => `
        <div class="user-card">
          <p>Status: ${appt.status}</p>
          <p>Time: ${new Date(appt.scheduledAt).toLocaleString()}</p>
          <button onclick="cancelAppointment('${appt.id}')">Cancel</button>
        </div>
      `
        )
        .join("");
    }

    // admin view (all appointments)
    const adminResponse = await fetch(
      `${API_BASE_URL}/appointments/admin/all`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );

    if (adminResponse.ok) {
      const allAppointments = await adminResponse.json();
      const allAppointmentsList = document.getElementById("allAppointments");

      allAppointmentsList.innerHTML = allAppointments
        .map(
          (appt) => `
        <div class="user-card">
          <p>User ID: ${appt.userId}</p>
          <p>Status: ${appt.status}</p>
          <p>Time: ${new Date(appt.scheduledAt).toLocaleString()}</p>
          <button onclick="approveAppointment('${appt.id}')">Approve</button>
          <button onclick="rejectAppointment('${appt.id}')">Reject</button>
        </div>
      `
        )
        .join("");
    }
  } catch (err) {
    console.error("Failed to load appointments:", err);
  }
}

if (appointmentForm) {
  appointmentForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const time = document.getElementById("appointmentTime").value;

    try {
      const response = await fetch(`${API_BASE_URL}/appointments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ scheduledAt: time }),
      });

      if (response.ok) {
        appointmentForm.reset();
        loadAppointments();
      } else {
        alert("Failed to request appointment");
      }
    } catch (err) {
      console.error("Appointment request error:", err);
    }
  });
}

// helper functions
async function editJournal(id) {
  // implementation for editing a journal
  console.log("Edit journal:", id);
}

async function deleteJournal(id) {
  try {
    const response = await fetch(`${API_BASE_URL}/journals/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });

    if (response.ok) {
      loadJournals();
    }
  } catch (err) {
    console.error("Failed to delete journal:", err);
  }
}

async function approveAppointment(id) {
  try {
    const response = await fetch(
      `${API_BASE_URL}/appointments/admin/${id}/status`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ status: "approved" }),
      }
    );

    if (response.ok) {
      loadAppointments();
    }
  } catch (err) {
    console.error("Failed to approve appointment:", err);
  }
}

async function rejectAppointment(id) {
  try {
    const response = await fetch(
      `${API_BASE_URL}/appointments/admin/${id}/status`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ status: "rejected" }),
      }
    );

    if (response.ok) {
      loadAppointments();
    }
  } catch (err) {
    console.error("Failed to reject appointment:", err);
  }
}

async function cancelAppointment(id) {
  try {
    const response = await fetch(`${API_BASE_URL}/appointments/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });

    if (response.ok) {
      loadAppointments();
    }
  } catch (err) {
    console.error("Failed to cancel appointment:", err);
  }
}
