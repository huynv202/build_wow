# Source Images

Đặt ảnh đã tạo vào đúng thư mục và giữ nguyên tên trong `ASSET_PROMPTS.md`.

Ưu tiên hoàn thành `00_style`, sau đó các asset P0. Khi có ảnh, pipeline tiếp theo sẽ:

1. Duyệt tính nhất quán của concept.
2. Tạo hoặc nhận model GLB từ từng reference sheet.
3. Chuẩn hóa pivot, scale, material và LOD.
4. Import vào Babylon.js và map với `BuildingDefinition`.

Không commit file nguồn PSD hoặc file tạm quá lớn. PNG reference và GLB tối ưu là hai loại artifact chính cần giữ.
