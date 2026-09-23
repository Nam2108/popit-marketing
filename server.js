const express = require("express");
const path = require("path");

require("dotenv").config();

const app = express();

const port = Number(process.env.PORT) || 3000;

const googleSheetsUrl = process.env.GOOGLE_SHEETS_WEBHOOK_URL;

app.use(express.json({ limit: "20kb" }));

app.use(express.static(__dirname));

// Kiểm tra server + Google Sheets
app.get("/api/health", (_request, response) => {
  response.json({
    ok: Boolean(googleSheetsUrl),
    storage: googleSheetsUrl ? "google-sheets" : "not-configured"
  });
});

// Nhận thông tin khách hàng
app.post("/api/leads", async (request, response) => {
  const {
    name,
    phone,
    email = "",
    service = "",
    message = ""
  } = request.body || {};

  const cleanName =
    typeof name === "string" ? name.trim() : "";

  const cleanPhone =
    typeof phone === "string" ? phone.trim() : "";

  const cleanEmail =
    typeof email === "string" ? email.trim() : "";

  const cleanService =
    typeof service === "string" ? service.trim() : "";

  const cleanMessage =
    typeof message === "string" ? message.trim() : "";

  // Kiểm tra họ tên + số điện thoại
  if (!cleanName || !cleanPhone) {
    return response.status(400).json({
      error: "Vui lòng nhập họ tên và số điện thoại."
    });
  }

  // Kiểm tra email
  if (
    cleanEmail &&
    !/^\S+@\S+\.\S+$/.test(cleanEmail)
  ) {
    return response.status(400).json({
      error: "Email không hợp lệ."
    });
  }

  try {
    // Kiểm tra Google Sheets URL
    if (!googleSheetsUrl) {
      return response.status(503).json({
        error:
          "Chưa cấu hình Google Sheets. Hãy tạo file .env và thêm GOOGLE_SHEETS_WEBHOOK_URL."
      });
    }

    // Gửi dữ liệu sang Google Apps Script
    const upstreamResponse = await fetch(
      googleSheetsUrl,
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json"
        },

        body: JSON.stringify({
          name: cleanName,
          phone: cleanPhone,
          email: cleanEmail,
          service: cleanService,
          message: cleanMessage,
          submittedAt: new Date().toISOString()
        })
      }
    );

    const upstreamText =
      await upstreamResponse.text();

    let upstreamResult = {};

    if (upstreamText.trim()) {
      try {
        upstreamResult =
          JSON.parse(upstreamText);
      } catch {
        upstreamResult = {
          raw: upstreamText
        };
      }
    }

    if (
      !upstreamResponse.ok ||
      upstreamResult.ok === false
    ) {
      throw new Error(
        upstreamResult.error ||
        `Google Sheets trả về HTTP ${upstreamResponse.status}.`
      );
    }

    console.log(
      "Lead saved:",
      cleanName,
      cleanPhone
    );

    return response.status(201).json({
      ok: true,
      message: "Gửi yêu cầu thành công."
    });

  } catch (error) {

    console.error(
      "Could not send lead to Google Sheets:",
      error.message
    );

    return response.status(503).json({
      error:
        "Không thể lưu yêu cầu vào Google Sheets. Hãy kiểm tra URL Apps Script và quyền triển khai."
    });
  }
});

// Xử lý lỗi API
app.use(
  "/api",
  (error, _request, response, _next) => {

    if (
      error instanceof SyntaxError &&
      error.status === 400 &&
      "body" in error
    ) {
      return response.status(400).json({
        error: "Dữ liệu gửi lên không hợp lệ."
      });
    }

    console.error(
      "API error:",
      error.message
    );

    return response.status(500).json({
      error:
        "Máy chủ gặp lỗi. Vui lòng thử lại."
    });
  }
);

app.listen(port, () => {
  console.log(
    `POPIT server is running at http://localhost:${port}`
  );

  console.log(
    "Google Sheets:",
    googleSheetsUrl
      ? "CONFIGURED"
      : "NOT CONFIGURED"
  );
});