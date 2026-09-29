# Haven City - GLB Performance Budget

GLB là container phù hợp cho Babylon.js và không mặc định gây lag. Hiệu năng phụ thuộc vào số polygon, material, texture, draw call, cách tạo bản sao và thời điểm tải.

## Ngân sách bắt buộc

| Loại asset | LOD0 | LOD1 | LOD2 | Texture tối đa |
|---|---:|---:|---:|---:|
| Nhà dân / props lớn | 8k triangles | 3k | 400 | 1024px |
| Chung cư / thương mại | 16k | 6k | 800 | 1024px |
| Dịch vụ công lớn | 24k | 8k | 1.2k | 2048px |
| Landmark | 40k | 14k | 2k | 2048px |
| Xe cộ | 5k | 1.5k | 250 | 512px |
| Cây | 2k | 500 | billboard | 512px atlas |

Mỗi asset thông thường dùng tối đa hai material. Texture phải đóng gói ORM, nén KTX2/Basis và model dùng Meshopt hoặc Draco.

## Quy tắc runtime

- Mỗi family/level chỉ tải GLB một lần vào cache.
- Các công trình cùng loại dùng instance hoặc thin instance, không clone geometry/material độc lập.
- Chỉ giữ LOD0 ở gần camera; LOD1 ở khoảng trung bình; LOD2 hoặc impostor ở xa.
- Chia thành phố thành chunk và chỉ kích hoạt chunk nằm trong camera/frustum.
- Asset mở khóa sau được tải nền, không chặn màn hình bắt đầu.
- Landmark và animation được tải theo nhu cầu.
- Shadow chỉ dành cho vật thể gần camera; vật thể xa dùng contact/blob shadow.
- Xe và người dùng object pool; simulation xa camera không spawn entity hình ảnh.

## Mục tiêu trải nghiệm

- Desktop trung bình: 60 FPS ở 1080p.
- Laptop tích hợp và mobile tốt: 30 FPS ổn định.
- Không quá 350 draw calls trong camera gameplay thông thường.
- Không quá 1.5 triệu triangle được render sau LOD/culling.
- Initial interactive dưới 5 giây trên mạng phổ thông; tải asset theo tiến trình.
- Tự giảm shadow, particle, render scale và mật độ xe khi FPS giảm.

Các model vượt budget phải được tối ưu trước khi import, không sửa bằng cách giảm chất lượng toàn bộ scene.
