/* ==========================================================================
   POPIT DIGITAL MARKETING SOLUTIONS - JAVASCRIPT
   Xử lý tương tác mượt mà, tối ưu chuyển đổi & trải nghiệm người dùng
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
  // Elements
  const navbar = document.getElementById("navbar");
  const menuToggle = document.getElementById("menuToggle");
  const navMenu = document.getElementById("navMenu");
  const contactModal = document.getElementById("contactModal");
  const modalCloseBtn = document.getElementById("modalCloseBtn");
  const floatConsultBtn = document.getElementById("floatConsultBtn");
  const backToTopBtn = document.getElementById("backToTop");
  const liveToast = document.getElementById("liveToast");
  const toastClose = document.getElementById("toastClose");

  // ==================== 1. NAVBAR SCROLL & MOBILE MENU ====================
  window.addEventListener("scroll", () => {
    if (window.scrollY > 30) {
      navbar?.classList.add("scrolled");
      backToTopBtn?.classList.add("visible");
    } else {
      navbar?.classList.remove("scrolled");
      backToTopBtn?.classList.remove("visible");
    }
  });

  menuToggle?.addEventListener("click", () => {
    navMenu?.classList.toggle("open");
  });

  // Đóng mobile menu khi bấm vào link
  document.querySelectorAll(".nav-menu a").forEach(link => {
    link.addEventListener("click", () => {
      navMenu?.classList.remove("open");
    });
  });

  // Back to top
  backToTopBtn?.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  // ==================== 2. PRICING TABS SWITCHER ====================
  const tabButtons = document.querySelectorAll(".tab-btn");
  const pricingPanels = document.querySelectorAll(".pricing-panel");

  tabButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      const targetId = btn.dataset.tabTarget;

      // Update active tab button
      tabButtons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");

      // Update active panel
      pricingPanels.forEach(panel => {
        if (panel.id === targetId) {
          panel.classList.add("active");
        } else {
          panel.classList.remove("active");
        }
      });
    });
  });

  // ==================== 3. MODAL POPUP & DYNAMIC SERVICE SELECT ====================
  const openModal = (serviceName = "") => {
    if (!contactModal) return;
    contactModal.classList.add("open");
    document.body.classList.add("modal-open");

    if (serviceName) {
      const modalSelect = document.getElementById("modalService");
      if (modalSelect) {
        // Tìm option tương ứng hoặc tạo mới nếu cần
        let found = false;
        for (let i = 0; i < modalSelect.options.length; i++) {
          if (modalSelect.options[i].value === serviceName || modalSelect.options[i].text.includes(serviceName)) {
            modalSelect.selectedIndex = i;
            found = true;
            break;
          }
        }
        if (!found) {
          const newOpt = new Option(serviceName, serviceName, true, true);
          modalSelect.add(newOpt);
        }
      }
    }
  };

  const closeModal = () => {
    if (!contactModal) return;
    contactModal.classList.remove("open");
    document.body.classList.remove("modal-open");
  };

  modalCloseBtn?.addEventListener("click", closeModal);
  floatConsultBtn?.addEventListener("click", () => openModal("Tư vấn chiến lược tổng thể"));

  contactModal?.addEventListener("click", e => {
    if (e.target === contactModal) {
      closeModal();
    }
  });

  document.addEventListener("keydown", e => {
    if (e.key === "Escape" && contactModal?.classList.contains("open")) {
      closeModal();
    }
  });

  // Gán sự kiện cho tất cả các nút có attribute [data-service-select]
  document.querySelectorAll("[data-service-select]").forEach(trigger => {
    trigger.addEventListener("click", e => {
      const serviceName = trigger.getAttribute("data-service-select");

      // Đồng bộ vào form trên trang chính trước
      const inlineServiceSelect = document.getElementById("formService");
      if (inlineServiceSelect && serviceName) {
        let found = false;
        for (let i = 0; i < inlineServiceSelect.options.length; i++) {
          if (inlineServiceSelect.options[i].value === serviceName || inlineServiceSelect.options[i].text.includes(serviceName)) {
            inlineServiceSelect.selectedIndex = i;
            found = true;
            break;
          }
        }
        if (!found) {
          const newOpt = new Option(serviceName, serviceName, true, true);
          inlineServiceSelect.add(newOpt);
        }
      }

      // Nếu là nút package hoặc button thì mở modal để điền nhanh
      if (trigger.classList.contains("btn-package-select") || trigger.classList.contains("btn-choose-service")) {
        e.preventDefault();
        openModal(serviceName);
      }
    });
  });

  // ==================== 4. FORM SUBMISSION (INLINE & MODAL) ====================
  const handleLeadSubmit = async (form, messageElement) => {
    const submitBtn = form.querySelector(".btn-form-submit");
    const originalBtnHtml = submitBtn.innerHTML;

    messageElement.className = "form-message";
    messageElement.textContent = "Đang gửi thông tin đăng ký...";
    submitBtn.disabled = true;
    submitBtn.innerHTML = `Đang xử lý...`;

    const formData = new FormData(form);
    const payload = Object.fromEntries(formData.entries());

    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      const responseData = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(responseData.error || "Gửi yêu cầu không thành công. Vui lòng thử lại.");
      }

      messageElement.className = "form-message success";
      messageElement.textContent = responseData.message || "Đăng ký thành công! Chuyên viên POPIT sẽ liên hệ lại với bạn trong 15 phút.";
      form.reset();

      // Nếu trong modal thì tự động đóng sau 3.5 giây
      if (form.id === "leadModalForm") {
        setTimeout(() => {
          closeModal();
          messageElement.textContent = "";
          messageElement.className = "form-message";
        }, 3500);
      }
    } catch (error) {
      messageElement.className = "form-message error";
      messageElement.textContent = error.message || "Có lỗi xảy ra khi kết nối máy chủ. Vui lòng liên hệ hotline 0866 640 425.";
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalBtnHtml;
    }
  };

  // Form chính trên trang
  const contactInfoForm = document.getElementById("contactInfoForm");
  const contactFormMessage = document.getElementById("contactFormMessage");
  contactInfoForm?.addEventListener("submit", e => {
    e.preventDefault();
    handleLeadSubmit(contactInfoForm, contactFormMessage);
  });

  // Form trong modal
  const leadModalForm = document.getElementById("leadModalForm");
  const modalFormMessage = document.getElementById("modalFormMessage");
  leadModalForm?.addEventListener("submit", e => {
    e.preventDefault();
    handleLeadSubmit(leadModalForm, modalFormMessage);
  });

  // ==================== 5. FAQ ACCORDION ====================
  const faqItems = document.querySelectorAll(".faq-item");
  faqItems.forEach(item => {
    const questionBtn = item.querySelector(".faq-question");
    questionBtn?.addEventListener("click", () => {
      const isOpen = item.classList.contains("open");
      // Đóng các câu hỏi khác
      faqItems.forEach(other => other.classList.remove("open"));
      // Toggle câu hiện tại
      if (!isOpen) {
        item.classList.add("open");
      }
    });
  });

  // ==================== 6. SCROLL REVEAL ANIMATIONS ====================
  const revealElements = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("show");
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: "0px 0px -40px 0px"
    });

    revealElements.forEach(el => revealObserver.observe(el));
  } else {
    // Fallback cho trình duyệt cũ
    revealElements.forEach(el => el.classList.add("show"));
  }

  // ==================== INSIGHTS CAROUSEL ====================
  const insightsCarousel = document.querySelector(".insight-carousel");
  const insightsTrack = insightsCarousel?.querySelector(".insight-grid");
  let insightsTimer;
  let insightsStopped = false;
  let insightsSlidingCount = 0;

  const stopInsightsCarousel = () => {
    window.clearInterval(insightsTimer);
    insightsTimer = undefined;
  };

  const advanceInsights = () => {
    if (!insightsTrack || insightsTrack.classList.contains("is-sliding")) return;

    insightsSlidingCount = 1;
    const movingCards = [...insightsTrack.children].slice(0, insightsSlidingCount);
    if (movingCards.length < insightsSlidingCount) return;

    const gap = Number.parseFloat(window.getComputedStyle(insightsTrack).gap) || 0;
    const distance = movingCards.reduce((total, card) => total + card.getBoundingClientRect().width, 0) + gap * insightsSlidingCount;
    insightsTrack.classList.add("is-sliding");
    insightsTrack.style.transform = `translateX(-${distance}px)`;
    window.setTimeout(finishInsightsSlide, 900);
  };

  const finishInsightsSlide = () => {
    if (!insightsTrack?.classList.contains("is-sliding")) return;
    const movingCards = [...insightsTrack.children].slice(0, insightsSlidingCount);
    movingCards.forEach(card => insightsTrack.append(card));
    insightsSlidingCount = 0;
    insightsTrack.classList.remove("is-sliding");
    insightsTrack.style.transition = "none";
    insightsTrack.style.transform = "translateX(0)";
    insightsTrack.offsetHeight;
    insightsTrack.style.transition = "";
  };

  insightsTrack?.addEventListener("transitionend", event => {
    if (event.target !== insightsTrack || event.propertyName !== "transform") return;
    finishInsightsSlide();
  });

  const startInsightsCarousel = () => {
    if (!insightsTrack || insightsStopped || insightsTimer) return;
    insightsTimer = window.setInterval(advanceInsights, 2000);
  };

  insightsCarousel?.addEventListener("pointerenter", stopInsightsCarousel);
  insightsCarousel?.addEventListener("pointerleave", startInsightsCarousel);
  insightsCarousel?.addEventListener("focusin", stopInsightsCarousel);
  insightsCarousel?.addEventListener("focusout", event => {
    if (!insightsCarousel.contains(event.relatedTarget)) startInsightsCarousel();
  });
  insightsTrack?.addEventListener("click", event => {
    const card = event.target.closest(".insight-card");
    if (!card) return;

    insightsStopped = true;
    stopInsightsCarousel();
    if (!event.target.closest("a") && card.dataset.articleUrl) {
      window.location.href = card.dataset.articleUrl;
    }
  });

  startInsightsCarousel();

  // ==================== 7. LIVE SOCIAL PROOF TOAST (FOMO NOTIFICATION) ====================
  const mockLeads = [
    { name: "Anh Hoàng", loc: "Hà Nội", action: "vừa đăng ký gói Tiểu Phú Hào - Facebook (2.490.000đ/tháng)", time: "1 phút trước" },
    { name: "Chị Mai", loc: "TP. Hồ Chí Minh", action: "vừa đăng ký gói Tiểu Phú Hào - TikTok (3.890.000đ/tháng)", time: "3 phút trước" },
    { name: "Anh Tuấn", loc: "Đà Nẵng", action: "vừa chọn gói Nhị Phú Hào - Facebook & TikTok (5.990.000đ/tháng)", time: "5 phút trước" },
    { name: "Chị Thu Hà", loc: "Hải Phòng", action: "vừa đăng ký gói Tam Phú Hào - Facebook, TikTok & Video AI (6.990.000đ/tháng)", time: "2 phút trước" },
    { name: "Anh Quốc Bảo", loc: "Cần Thơ", action: "vừa đăng ký gói Đại Phú Hào - Facebook, TikTok, Website & Video AI (7.990.000đ/tháng)", time: "6 phút trước" }
  ];

  let toastIndex = 0;
  let toastTimer;

  const showNextToast = () => {
    if (!liveToast) return;
    const current = mockLeads[toastIndex];
    toastIndex = (toastIndex + 1) % mockLeads.length;

    const toastAvatar = document.getElementById("toastAvatar");
    const toastName = document.getElementById("toastName");
    const toastAction = document.getElementById("toastAction");
    const toastTime = document.getElementById("toastTime");

    if (toastAvatar) toastAvatar.textContent = current.name.charAt(current.name.indexOf(" ") + 1) || "P";
    if (toastName) toastName.textContent = `${current.name} (${current.loc})`;
    if (toastAction) toastAction.textContent = current.action;
    if (toastTime) toastTime.textContent = current.time;

    liveToast.classList.add("show");

    setTimeout(() => {
      liveToast.classList.remove("show");
    }, 5500);
  };

  toastClose?.addEventListener("click", () => {
    liveToast?.classList.remove("show");
  });

  // Bắt đầu chu kỳ hiển thị thông báo sau 4 giây đầu tiên
  setTimeout(() => {
    showNextToast();
    toastTimer = setInterval(showNextToast, 16000);
  }, 4000);
});
