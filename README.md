# Haven City

Một vertical slice 3D có thể chơi của game xây dựng thành phố, phát triển từ đặc tả trong `promt.md`. Phần thế giới được render thời gian thực bằng Babylon.js/WebGL.

## Chạy dự án

```bash
npm install
npm run dev
```

Build production và kiểm tra mã nguồn:

```bash
npm run build
npm run lint
```

## Gameplay hiện có

- Xây đường, nhà ở, khu thương mại, dịch vụ, điện, nước và cảnh quan.
- Mô phỏng ngân sách, dân số, việc làm, hạnh phúc, điện và nước.
- Nâng cấp công trình, phá dỡ có hoàn tiền và kiểm tra ngân sách.
- Chu kỳ ngày/đêm, thời tiết và tốc độ mô phỏng.
- Overlay điện, nước, hạnh phúc và rủi ro ngập.
- Framework thiên tai gồm cảnh báo, khẩn cấp, thiệt hại và phục hồi.
- Nhà dân có 6 cấp phát triển; chung cư có 5 cấp; tất cả công trình xây dựng còn lại có tối thiểu 4 cấp.
- Thiên tai theo vùng gồm lũ, UV cực đoan, siêu bão và sóng lớn; hệ thống phòng vệ gồm thoát nước, trạm lọc UV và kè chắn sóng.
- Autosave cùng lưu/tải thủ công qua local storage.
- Camera chiến thuật 3D xoay/pan/zoom và giao diện desktop/mobile.
- Ánh sáng động, bóng đổ, cửa sổ phát sáng, xe chuyển động, mặt nước và particle mưa.
- Màn hình title game toàn màn hình sử dụng key art, menu Continue/New City và trạng thái game.
- Renderer tái sử dụng material, dọn scene theo lifecycle, đóng băng world matrix tĩnh và tự hạ render scale khi FPS thấp.
- Asset concept từ `00_style` đến `03_services` đã được đăng ký theo từng level và hiển thị trực tiếp trong build/upgrade UI.

## Kiến trúc

- `src/data`: định nghĩa công trình theo hướng data-driven.
- `src/game`: mô phỏng thuần và persistence, độc lập với UI.
- `src/components`: renderer Babylon.js, cache GLB và tối ưu chất lượng động theo FPS.
- `scripts/generate-models.mjs`: dựng 105 GLB low-poly từ các concept sheet trong `assets/source-images`.
- `src/App.tsx`: orchestration gameplay và UI.

State hiện được lưu bằng một object có version key. Khi phát triển multiplayer, simulation có thể chuyển sang authoritative server trong khi client giữ nguyên renderer và command UI. Bước sản phẩm tiếp theo nên là road connectivity/pathfinding, district zoning, backend phòng co-op và test cho simulation.
