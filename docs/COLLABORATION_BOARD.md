# Haven City Collaboration Board

Tài liệu này chia phạm vi để Codex và Antigravity không sửa chồng lên nhau.

## Antigravity lane

- Hoàn thiện ảnh nguồn còn thiếu từ `assets/source-images/04_utilities` trở đi.
- Giữ đúng tên file trong `ASSET_PROMPTS.md`.
- Không sửa `src/`, `package.json`, cấu hình build hoặc gameplay logic khi chưa nhận task mới.
- Sau mỗi nhóm asset, kiểm tra đủ level và không ghi đè ảnh đã duyệt.

## Codex lane

- Gameplay simulation, economy, population, services và disaster logic.
- Babylon.js renderer, performance budget, asset registry và UI.
- Build, lint, runtime verification và tích hợp asset hoàn chỉnh.

## Handoff protocol

1. Antigravity hoàn thành trọn một folder asset.
2. Codex kiểm tra filename, resolution, consistency và đủ level.
3. Codex đăng ký asset trong `BuildingDefinition`.
4. Model GLB chỉ được import sau khi đạt `ASSET_PERFORMANCE_BUDGET.md`.
5. Không agent nào xóa hoặc thay thế asset của agent kia khi chưa ghi lý do vào board.

## Current status

- `00_style` đến `03_services`: đã đăng ký vào gameplay UI.
- `04_utilities`: đã đủ ảnh nguồn cho water, solar, drainage, substation, UV và seawall.
- 105 GLB từ nhà ở, thương mại, dịch vụ, hạ tầng, giao thông và cây xanh: đã dựng và tích hợp tải theo nhu cầu.
- `05_transport`: bus stop, train station, bridge, metro và marina đã có 4 cấp trong gameplay.
- `06_roads`: hình học đường thay đổi theo 4 cấp, gồm vỉa hè, làn ưu tiên, giao lộ và gantry cảm biến.
- `07_nature/tree_pack`: 6 giống cây được dùng dưới dạng cached GLB instances.
- Renderer bundle: đã chuyển sang Babylon subpath imports để giảm đáng kể dung lượng tải ban đầu.
- City simulation v2: Codex đang triển khai.
