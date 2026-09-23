const navbar = document.getElementById("navbar");
const menuToggle = document.getElementById("menuToggle");
const navMenu = document.getElementById("navMenu");
const contactSection = document.getElementById("contact");
document.querySelector(".footer")?.before(contactSection);
const problemSection = document.getElementById("common-problems");
const servicesSection = document.getElementById("services");
servicesSection?.before(problemSection);
const solutionStrip = document.querySelector(".solution-strip");
servicesSection?.before(solutionStrip);

menuToggle?.addEventListener("click", () => navMenu.classList.toggle("open"));
document.querySelectorAll(".nav-menu a").forEach(a => a.addEventListener("click", () => navMenu.classList.remove("open")));

window.addEventListener("scroll", () => {
  navbar.classList.toggle("scrolled", window.scrollY > 20);
});

document.querySelectorAll(".tab").forEach(tab => {
  tab.addEventListener("click", () => {
    document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
    document.querySelectorAll(".pricing-panel").forEach(p => p.classList.remove("active"));
    tab.classList.add("active");
    document.getElementById(tab.dataset.target).classList.add("active");
  });
});

document.querySelectorAll("[data-pricing-target]").forEach(link => {
  link.addEventListener("click", event => {
    event.preventDefault();
    const target = link.dataset.pricingTarget;
    const targetTab = document.querySelector(`.tab[data-target="${target}"]`);
    targetTab?.click();
    document.getElementById("pricing")?.scrollIntoView({ behavior: "smooth", block: "start" });
  });
});

document.querySelectorAll(".faq-item button").forEach(button => {
  button.addEventListener("click", () => {
    const item = button.parentElement;
    document.querySelectorAll(".faq-item").forEach(other => {
      if (other !== item) other.classList.remove("open");
    });
    item.classList.toggle("open");
  });
});

const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add("show");
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll(".reveal").forEach(el => observer.observe(el));

document.getElementById("leadForm")?.addEventListener("submit", async e => {
  e.preventDefault();
  const message = document.getElementById("formMessage");
  const submitButton = e.target.querySelector("button[type=submit]");
  const formData = Object.fromEntries(new FormData(e.target));

  message.textContent = "Đang gửi yêu cầu...";
  submitButton.disabled = true;

  try {
    const response = await fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData)
    });
    const responseText = await response.text();
    let result = {};

    if (responseText.trim()) {
      try {
        result = JSON.parse(responseText);
      } catch {
        throw new Error("Máy chủ trả về phản hồi không hợp lệ. Vui lòng chạy website bằng npm start.");
      }
    }

    if (!response.ok) {
      throw new Error(result.error || "Không thể gửi yêu cầu.");
    }

    message.textContent = "Đã nhận yêu cầu! POPIT sẽ liên hệ với bạn sớm.";
    e.target.reset();
  } catch (error) {
    message.textContent = error.message || "Không thể kết nối máy chủ. Vui lòng thử lại.";
  } finally {
    submitButton.disabled = false;
  }
});
