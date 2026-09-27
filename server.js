const express = require("express");
const path = require("path");
const fs = require("fs");

require("dotenv").config();

const app = express();

const port = Number(process.env.PORT) || 3000;
const googleSheetsUrl = process.env.GOOGLE_SHEETS_WEBHOOK_URL;
const leadsFilePath = path.join(__dirname, "data", "leads.json");

app.use(express.json({ limit: "20kb" }));
app.use(express.static(__dirname));

// Đảm bảo file data/leads.json luôn sẵn sàng
function getLocalLeads() {
  try {
    if (!fs.existsSync(leadsFilePath)) {
      fs.writeFileSync(leadsFilePath, JSON.stringify([], null, 2), "utf8");
      return [];
    }
    const data = fs.readFileSync(leadsFilePath, "utf8");
    return JSON.parse(data || "[]");
  } catch (error) {
    console.error("Lỗi khi đọc file leads:", error.message);
    return [];
  }
}

function saveLocalLead(lead) {
  try {
    const leads = getLocalLeads();
    leads.unshift(lead);
    fs.writeFileSync(leadsFilePath, JSON.stringify(leads, null, 2), "utf8");
    return true;
  } catch (error) {
    console.error("Lỗi khi lưu lead local:", error.message);
    return false;
  }
}

// Kiểm tra server + Google Sheets
app.get("/api/health", (_request, response) => {
  response.json({
    ok: true,
    storage: googleSheetsUrl ? "google-sheets-and-local" : "local-file",
    googleSheetsConfigured: Boolean(googleSheetsUrl)
  });
});

// Xem danh sách leads (dành cho quản trị)
app.get("/api/leads", (_request, response) => {
  const leads = getLocalLeads();
  response.json({
    ok: true,
    total: leads.length,
    leads
  });
});

// Nhận thông tin khách hàng đăng ký tư vấn
app.post("/api/leads", async (request, response) => {
  const {
    name,
    phone,
    email = "",
    service = "",
    budget = "",
    message = ""
  } = request.body || {};

  const cleanName = typeof name === "string" ? name.trim() : "";
  const cleanPhone = typeof phone === "string" ? phone.trim() : "";
  const cleanEmail = typeof email === "string" ? email.trim() : "";
  const cleanService = typeof service === "string" ? service.trim() : "";
  const cleanBudget = typeof budget === "string" ? budget.trim() : "";
  const cleanMessage = typeof message === "string" ? message.trim() : "";

  // Kiểm tra họ tên + số điện thoại
  if (!cleanName || !cleanPhone) {
    return response.status(400).json({
      error: "Vui lòng nhập họ tên và số điện thoại liên hệ."
    });
  }

  // Kiểm tra định dạng số điện thoại Việt Nam cơ bản (ít nhất 9-11 số)
  const phoneDigits = cleanPhone.replace(/\D/g, "");
  if (phoneDigits.length < 9 || phoneDigits.length > 12) {
    return response.status(400).json({
      error: "Số điện thoại không đúng định dạng. Vui lòng kiểm tra lại."
    });
  }

  // Kiểm tra email nếu có nhập
  if (cleanEmail && !/^\S+@\S+\.\S+$/.test(cleanEmail)) {
    return response.status(400).json({
      error: "Địa chỉ email không hợp lệ."
    });
  }

  const newLead = {
    id: "lead_" + Date.now(),
    name: cleanName,
    phone: cleanPhone,
    email: cleanEmail,
    service: cleanService || "Tư vấn tổng thể",
    budget: cleanBudget,
    message: cleanMessage,
    submittedAt: new Date().toISOString()
  };

  // Luôn lưu bản sao vào data/leads.json
  saveLocalLead(newLead);
  console.log(`[LEAD MỚI] ${cleanName} - ${cleanPhone} (${cleanService || "Chưa chọn dịch vụ"})`);

  // Nếu đã cấu hình Google Sheets URL, gửi đồng bộ
  if (googleSheetsUrl) {
    try {
      const upstreamResponse = await fetch(googleSheetsUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newLead)
      });

      const upstreamText = await upstreamResponse.text();
      let upstreamResult = {};
      if (upstreamText.trim()) {
        try {
          upstreamResult = JSON.parse(upstreamText);
        } catch {
          upstreamResult = { raw: upstreamText };
        }
      }

      if (!upstreamResponse.ok || upstreamResult.ok === false) {
        console.warn("Google Sheets đồng bộ lỗi nhẹ:", upstreamResult.error || upstreamResponse.status);
      }
    } catch (err) {
      console.warn("Không gửi được sang Google Sheets webhook, nhưng lead đã lưu local:", err.message);
    }
  }

  return response.status(201).json({
    ok: true,
    message: "Đăng ký thành công! Chuyên gia POPIT sẽ liên hệ tư vấn chiến lược trong vòng 15 phút."
  });
});

// Xử lý lỗi API
app.use("/api", (error, _request, response, _next) => {
  if (error instanceof SyntaxError && error.status === 400 && "body" in error) {
    return response.status(400).json({
      error: "Dữ liệu gửi lên không đúng định dạng JSON."
    });
  }

  console.error("API error:", error.message);
  return response.status(500).json({
    error: "Máy chủ gặp sự cố nhỏ. Vui lòng liên hệ trực tiếp hotline 0866 640 425."
  });
});

app.listen(port, () => {
  console.log(`POPIT server is running at http://localhost:${port}`);
  console.log("Google Sheets Webhook:", googleSheetsUrl ? "CONFIGURED" : "FALLBACK TO LOCAL JSON");
});