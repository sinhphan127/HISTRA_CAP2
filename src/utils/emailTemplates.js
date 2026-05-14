// utils/emailTemplates.js

export const getEmailTemplate = (content, title = "Hành trình mới đang chờ bạn!") => {
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body { 
        margin: 0; 
        padding: 0; 
        background: #f4f7f6;
        font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
        -webkit-font-smoothing: antialiased;
      }
      
      .email-wrapper {
        padding: 40px 15px;
        background-color: #f4f7f6;
      }
      
      .container { 
        width: 100%; 
        max-width: 600px; 
        margin: 0 auto; 
        background: #ffffff;
        border-radius: 12px;
        overflow: hidden;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
      }
      
      .header { 
        background: linear-gradient(135deg, #2D5A27 0%, #1e3d1a 100%); /* Xanh lá đậm chất trekking */
        padding: 45px 30px;
        text-align: center;
        position: relative;
      }
      
      /* Họa tiết trang trí gợi nhớ bản đồ hoặc địa hình */
      .header::before {
        content: '';
        position: absolute;
        top: -20%;
        right: -10%;
        width: 180px;
        height: 180px;
        background: rgba(255, 255, 255, 0.05);
        border-radius: 50%;
      }
      
      .logo {
        position: relative;
        z-index: 1;
      }
      
      .logo h1 { 
        color: #EBC06F; /* Màu vàng đồng cổ điển cho chất lịch sử */
        margin: 0; 
        font-size: 28px; 
        font-weight: 800;
        letter-spacing: 3px;
        text-transform: uppercase;
      }
      
      .logo p {
        color: #ffffff;
        margin-top: 5px;
        font-size: 13px;
        letter-spacing: 1.5px;
        font-style: italic;
        opacity: 0.9;
      }
      
      .content { 
        padding: 40px 35px;
        color: #333333;
        line-height: 1.7;
      }
      
      .content h2 {
        color: #2D5A27;
        margin: 0 0 20px 0;
        font-size: 22px;
        font-weight: 700;
      }
      
      .content p {
        font-size: 15px;
        margin-bottom: 20px;
        color: #555555;
      }
      
      .feature-box {
        background: #f9fbf9;
        border-left: 4px solid #EBC06F;
        padding: 20px;
        margin: 25px 0;
        border-radius: 4px;
      }

      .btn-container {
        text-align: center;
        margin: 30px 0;
      }
      
      .btn { 
        display: inline-block;
        background: #2D5A27;
        color: #ffffff !important;
        padding: 14px 35px;
        text-decoration: none;
        border-radius: 6px;
        font-weight: 600;
        transition: background 0.3s ease;
      }
      
      .footer { 
        background: #2D3436;
        padding: 35px 40px;
        text-align: center;
        color: #bdc3c7;
      }
      
      .footer p {
        font-size: 12px;
        line-height: 1.6;
        margin-bottom: 10px;
      }
      
      .footer a {
        color: #EBC06F;
        text-decoration: none;
      }
      
      .social-links {
        margin: 20px 0;
      }
      
      .social-links a {
        color: #ffffff;
        margin: 0 10px;
        font-size: 12px;
        text-decoration: none;
        border: 1px solid #444;
        padding: 5px 10px;
        border-radius: 4px;
      }

      @media only screen and (max-width: 600px) {
        .content { padding: 30px 20px; }
        .logo h1 { font-size: 24px; }
      }
    </style>
  </head>
  <body>
    <div class="email-wrapper">
      <div class="container">
        <div class="header">
          <div class="logo">
            <h1>HISTORIC PATH</h1>
            <p>Khám phá quá khứ - Bước tới tương lai</p>
          </div>
        </div>
        
        <div class="content">
          <h2>${title}</h2>
          
          <div class="main-text">
            ${content}
          </div>

          <div class="feature-box">
            <strong>Mẹo cho chuyến đi:</strong> Bạn có biết rằng mỗi địa điểm lịch sử đều ẩn chứa một câu chuyện chưa kể? Hãy sử dụng tính năng "Smart Scan" trong ứng dụng để tìm hiểu thêm!
          </div>
          
          <div class="btn-container">
            <a href="https://your-app-link.com" class="btn">Mở kế hoạch của bạn</a>
          </div>
        </div>

        <div class="footer">
          <p><strong>Đội ngũ Historic Path</strong></p>
          <p>Bạn nhận được email này vì bạn đã đăng ký khám phá thế giới cùng chúng tôi.</p>
          <p>Câu hỏi về lộ trình? <a href="mailto:support@historicpath.com">Gửi tin nhắn cho chuyên gia</a>.</p>
          
          <div class="social-links">
            <a href="#">Facebook</a>
            <a href="#">Instagram</a>
            <a href="#">Community</a>
          </div>
          
          <p style="margin-top: 25px; opacity: 0.6; font-size: 11px;">
            © 2026 Historic Path Planner. Lưu giữ giá trị lịch sử qua từng bước chân.
          </p>
        </div>
      </div>
    </div>
  </body>
  </html>
  `;
};