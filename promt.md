# MASTER PROMPT — NEXT-GEN CO-OP SURVIVAL CITY BUILDER

## 1. VAI TRÒ

Bạn là một **Senior Game Director + Survival Economy Designer + Systems Designer + Gameplay Engineer + UI/UX Designer + 3D Technical Artist + Multiplayer Architect + Product Architect**.

Nhiệm vụ của bạn là thiết kế và phát triển một game **Co-op City Builder / Urban Management / Disaster Survival Simulation** có chất lượng sản phẩm hoàn chỉnh.

Đây không phải prototype vài màn hình.

Hãy xây dựng một nền tảng game có kiến trúc đủ tốt để phát triển thành một game thương mại lâu dài, với gameplay sâu dần theo thời gian, hệ thống modular, UI/UX hiện đại và multiplayer co-op thực sự.

AI không được chỉ diễn đạt lại các ví dụ người dùng đã nêu. Với mỗi nhóm hệ thống, phải chủ động đề xuất thêm cơ chế mới có giá trị gameplay rõ ràng, giải thích vòng lặp, điều kiện thất bại, cách người chơi phản ứng và mối liên hệ với các hệ thống khác.

---

# 2. Ý TƯỞNG CỐT LÕI

Người chơi cùng bạn bè bắt đầu với một khu định cư nhỏ, ngân sách hạn chế, một nhóm cư dân và bản đồ có tài nguyên hữu hạn. Họ phải biến tài nguyên tự nhiên thành việc làm, hàng hóa, thương mại và nguồn thu trước khi có thể phát triển thành đô thị hiện đại.

Người chơi không chỉ đặt các tòa nhà lớn.

Họ phải có cảm giác đang **thực sự xây dựng một thành phố sống**.

Thành phố phải vận hành như một chuỗi quan hệ có nguyên nhân và kết quả:

TÀI NGUYÊN TỰ NHIÊN
→ KHAI THÁC
→ VẬN CHUYỂN
→ CHẾ BIẾN
→ PHÂN PHỐI
→ VIỆC LÀM
→ TIỀN LƯƠNG
→ NHU CẦU DÂN CƯ
→ DOANH THU DOANH NGHIỆP
→ THUẾ / XUẤT KHẨU
→ NGÂN SÁCH THÀNH PHỐ
→ ĐẦU TƯ VÀO HẠ TẦNG
→ NĂNG SUẤT VÀ KHẢ NĂNG SINH TỒN CAO HƠN

Thành phố bao gồm:

* Nhà dân
* Chung cư
* Biệt thự
* Cửa hàng
* Siêu thị
* Nhà hàng
* Khách sạn
* Văn phòng
* Công ty
* Nhà máy
* Trại khai thác gỗ
* Xưởng cưa
* Trang trại
* Mỏ đá
* Mỏ khoáng sản
* Cảng cá
* Kho lạnh
* Nhà máy chế biến thực phẩm
* Kho hàng
* Trung tâm logistics
* Trường học
* Bệnh viện
* Trạm cứu hỏa
* Đồn cảnh sát
* Công viên
* Quảng trường
* Bến xe bus
* Trạm tàu điện
* Ga tàu hỏa
* Sân bay
* Cảng
* Đường bộ
* Cầu
* Hầm
* Đèn giao thông
* Trạm điện
* Nhà máy điện
* Trạm biến áp
* Đường ống nước
* Hệ thống xử lý nước
* Hệ thống rác thải
* Hệ thống viễn thông
* Hệ thống cứu hộ
* Và rất nhiều công trình khác.

Điểm quan trọng:

> Mỗi công trình không chỉ là một object để trang trí.

Nó phải có vai trò trong hệ thống thành phố.

Ví dụ:

Bệnh viện → sức khỏe dân cư → năng suất lao động → kinh tế.

Trường học → giáo dục → chất lượng lao động → công nghệ.

Sân bay → du lịch + thương mại + kết nối thành phố.

Ga tàu → vận chuyển hàng hóa + hành khách.

Nhà máy điện → cung cấp điện nhưng có thể gây ô nhiễm.

Công viên → giảm ô nhiễm + tăng chất lượng sống.

Đường giao thông → kết nối khu dân cư + công nghiệp + thương mại.

Một công trình tạo việc làm không được tự động tạo tiền. Nó chỉ hoạt động khi có đủ lao động phù hợp, nguyên liệu đầu vào, điện/nước, kho chứa, tuyến vận chuyển và đầu ra có người mua.

---

# 3. CORE GAMEPLAY LOOP

Gameplay chính:

SURVEY MAP
↓
SECURE FOOD, WATER AND SHELTER
↓
HARVEST RESOURCES
↓
CREATE JOBS AND PRODUCTION CHAINS
↓
MOVE AND SELL GOODS
↓
EARN MONEY AND REINVEST
↓
GROW POPULATION AND SPECIALIZE DISTRICTS
↓
PREPARE FOR SHORTAGE / DISASTER / MARKET SHOCK
↓
SURVIVE AND RECOVER
↓
EXPAND TO NEW REGIONS
↓
BUILD A MORE RESILIENT ECONOMY

Người chơi phải liên tục:

1. Xây dựng
2. Quản lý tài nguyên
3. Phát triển dân số
4. Phát triển kinh tế
5. Mở khóa công nghệ
6. Nâng cấp cơ sở hạ tầng
7. Chuẩn bị chống thiên tai
8. Ứng phó sự cố
9. Khôi phục thành phố
10. Mở rộng lãnh thổ
11. Theo dõi chuỗi cung ứng và tồn kho
12. Điều phối lao động giữa nhu cầu sống còn và sản xuất lợi nhuận
13. Ký hợp đồng, xuất nhập khẩu và phản ứng với giá thị trường
14. Bảo vệ tài nguyên tái tạo khỏi khai thác quá mức
15. Thích nghi chiến lược theo bản đồ, mùa và biến cố

Mỗi phiên chơi phải liên tục tạo ra các câu hỏi thú vị:

* Chặt rừng nhanh để có tiền hay giữ rừng để giảm lũ và duy trì nguồn gỗ lâu dài?
* Bán cá ngay để trả nợ hay dự trữ thực phẩm cho mùa bão?
* Tăng lương để thu hút lao động hay giữ chi phí sản xuất thấp?
* Nhập hàng đắt để cứu chuỗi sản xuất hay tạm đóng nhà máy?
* Đầu tư vào công nghiệp nặng sinh lời nhanh hay kinh tế xanh ổn định lâu dài?

---

# 4. CO-OP LÀ TRỌNG TÂM

Game phải được thiết kế ngay từ đầu cho Multiplayer Co-op.

Không phải single-player rồi thêm multiplayer sau.

Một thành phố có thể được nhiều người cùng quản lý.

Ví dụ:

Player A:

* Quy hoạch
* Đường xá
* Giao thông

Player B:

* Kinh tế
* Công ty
* Thương mại

Player C:

* Điện
* Nước
* Hạ tầng

Player D:

* Phòng chống thiên tai
* Cứu hộ
* Dịch vụ công

Tuy nhiên:

Tất cả đều có thể tương tác với toàn bộ thành phố.

Co-op phải tạo ra phối hợp gameplay thật:

* Người quy hoạch mở đường tới rừng nhưng phải thống nhất với người môi trường về hạn ngạch
* Người kinh tế ký hợp đồng nhưng phải hỏi logistics về năng lực giao hàng
* Người hạ tầng phân bổ điện giữa bệnh viện, kho lạnh và nhà máy
* Người khẩn cấp có thể yêu cầu tạm dừng xuất khẩu để giữ dự trữ
* Dự án lớn cần tiền, vật liệu, lao động và thời gian từ nhiều người

Khi hai kế hoạch xung đột, game cung cấp forecast, ping, proposal và vote thay vì buộc người chơi tranh luận ngoài game.

---

# 5. HỆ THỐNG QUYỀN TRONG CO-OP

Thiết kế hệ thống permission:

* Owner
* Mayor
* Administrator
* Planner
* Infrastructure Manager
* Economy Manager
* Emergency Manager
* Citizen / Guest

Cho phép server host tùy chỉnh quyền.

Ví dụ:

Một người không thể tự ý phá sân bay nếu không có permission.

Có hệ thống:

* Request
* Vote
* Approve
* Reject
* Shared Budget
* Personal Contribution

---

# 6. CITY SIMULATION

Thành phố phải có simulation system.

Các yếu tố:

## Population

* Population
* Age groups
* Employment
* Education
* Happiness
* Health
* Wealth
* Housing demand

## Economy

Kinh tế phải là một simulation có dòng tiền rõ ràng, không phải bộ đếm tiền tăng tự động.

Nguồn tiền hợp lệ:

* Thuế thu nhập từ cư dân đang có việc làm
* Thuế lợi nhuận từ doanh nghiệp đang hoạt động
* Thuế bán hàng từ nhu cầu và tiêu dùng thật
* Xuất khẩu hàng hóa dư thừa
* Hợp đồng cung ứng theo thời hạn
* Du lịch, khách sạn, giải trí và sự kiện
* Phí cảng, logistics và vận tải
* Bằng sáng chế, nghiên cứu và dịch vụ công nghệ ở giai đoạn sau
* Viện trợ khẩn cấp hoặc khoản vay, nhưng luôn có điều kiện và hậu quả

Chi phí bắt buộc:

* Lương dịch vụ công
* Bảo trì công trình và phương tiện
* Điện, nước và nhiên liệu
* Nhập khẩu hàng hóa thiếu hụt
* Chi phí logistics
* Lãi vay
* Chi phí cứu trợ, sửa chữa và tái thiết
* Trợ cấp xã hội hoặc chính sách do người chơi lựa chọn

Mọi khoản thu và chi phải xuất hiện trong sổ ngân sách có thể truy nguyên đến công trình, khu vực hoặc chính sách tạo ra nó.

## Economic Survival Loop

Thiết kế vòng lặp kinh tế sống còn theo ba giai đoạn:

### Early Game — Survive

* Bảo đảm gỗ, thực phẩm, nước và chỗ ở
* Tạo những việc làm đầu tiên
* Bán tài nguyên thô để có dòng tiền khẩn cấp
* Xây kho và tuyến vận chuyển ngắn
* Tránh mở rộng nhanh hơn năng lực cung ứng

### Mid Game — Process And Specialize

* Chuyển từ bán nguyên liệu thô sang hàng chế biến có giá trị cao
* Xây chuỗi sản xuất nhiều bước
* Đào tạo lao động chuyên môn
* Mở cảng, chợ đầu mối và hợp đồng thương mại
* Chọn hướng chuyên môn hóa phù hợp với bản đồ

### Late Game — Optimize And Protect

* Tự động hóa và tối ưu logistics
* Quản lý tài nguyên cạn kiệt
* Đa dạng hóa kinh tế để không phụ thuộc một ngành
* Xây quỹ dự phòng và chuỗi cung ứng thay thế
* Duy trì tăng trưởng trong biến đổi khí hậu, khủng hoảng và thị trường biến động

## Natural Resource Map

Mỗi bản đồ phải có phân bố tài nguyên khác nhau:

* Rừng: mật độ, tuổi cây, tốc độ tái sinh, nguy cơ cháy
* Biển và sông: trữ lượng cá, mùa sinh sản, ô nhiễm nước, luồng tàu
* Đất nông nghiệp: độ màu mỡ, độ ẩm, loại cây phù hợp
* Đá, cát, đất sét: vật liệu xây dựng
* Quặng kim loại: công nghiệp và công nghệ
* Nước ngọt: lưu lượng, độ sạch, khả năng tái tạo
* Nắng và gió: tiềm năng năng lượng thay đổi theo vùng và mùa
* Cảnh quan đẹp: du lịch và giá trị đất
* Phế tích hoặc tàu đắm: tài nguyên hiếm, câu chuyện và rủi ro thám hiểm

Mỗi mỏ tài nguyên có:

* Trữ lượng
* Chất lượng
* Tốc độ khai thác
* Khả năng tái tạo
* Chi phí tiếp cận
* Tác động môi trường
* Rủi ro theo mùa và thiên tai

Không cho phép khai thác vô hạn. Tài nguyên tái tạo cần quota, thời gian phục hồi và vùng bảo tồn. Tài nguyên không tái tạo buộc người chơi chuẩn bị ngành kinh tế thay thế.

## Production Chains

Mỗi chuỗi phải có đầu vào, công suất, lao động, kho, thời gian xử lý, đầu ra và thị trường tiêu thụ.

Ví dụ chuỗi gỗ:

Rừng
→ Trại lâm nghiệp
→ Gỗ tròn
→ Xưởng cưa
→ Ván gỗ
→ Xưởng nội thất / cấu kiện nhà
→ Xây dựng nội địa hoặc xuất khẩu

Ví dụ chuỗi biển:

Ngư trường
→ Cảng cá
→ Cá tươi
→ Kho lạnh
→ Chợ / nhà hàng / nhà máy đóng hộp
→ Thực phẩm cho dân hoặc xuất khẩu

Ví dụ chuỗi nông nghiệp:

Đất màu mỡ
→ Nông trại
→ Ngũ cốc / rau / chăn nuôi
→ Nhà máy xay / lò bánh / chế biến
→ Cửa hàng và hộ gia đình

Ví dụ chuỗi xây dựng:

Mỏ đá + đất sét + gỗ
→ Vật liệu xây dựng
→ Kho công trình
→ Nhà ở, cầu, kè và công trình công cộng

Ví dụ chuỗi công nghiệp tuần hoàn:

Rác thải
→ Phân loại
→ Tái chế kim loại / nhựa / vật liệu
→ Giảm nhập khẩu và tạo nguyên liệu thứ cấp

Mỗi ngành phải có ít nhất một lựa chọn nâng cấp theo chiều sâu, một lựa chọn mở rộng công suất và một lựa chọn xanh hóa.

## Workforce And Employment

Dân số phải là nguồn lao động thật, không chỉ là điều kiện mở khóa.

Phân loại lao động:

* Lao động phổ thông
* Lao động kỹ thuật
* Chuyên gia
* Nhân viên dịch vụ
* Nhân lực khẩn cấp
* Chủ doanh nghiệp

Một công việc chỉ được lấp đầy khi:

* Có cư dân trong độ tuổi lao động
* Trình độ phù hợp
* Có thể đi tới nơi làm việc
* Mức lương và chất lượng sống đủ hấp dẫn
* Người lao động khỏe mạnh
* Ca làm việc không xung đột với tình trạng khẩn cấp

Thiếu lao động phải làm giảm công suất theo tỷ lệ, không chỉ hiện cảnh báo. Thất nghiệp kéo dài làm giảm thu nhập hộ gia đình, nhu cầu mua sắm, thuế và hạnh phúc.

Cho phép người chơi:

* Điều chỉnh ưu tiên lao động theo ngành
* Tăng hoặc giảm lương công
* Mở chương trình đào tạo nghề
* Hỗ trợ di chuyển đến nơi làm việc
* Gọi lao động nhập cư có kiểm soát
* Tự động hóa nhưng phải đánh đổi điện năng, vốn và thất nghiệp

## Household Economy

Mỗi nhóm cư dân có:

* Thu nhập
* Tiền thuê nhà
* Chi phí thực phẩm
* Chi phí đi lại
* Mức tiết kiệm
* Nhu cầu hàng hóa
* Khả năng chịu tăng giá

Người có việc làm nhận lương từ doanh nghiệp. Doanh nghiệp nhận tiền từ bán hàng. Thành phố thu một phần qua thuế. Nếu chuỗi này bị đứt, ngân sách không được phép tiếp tục tăng vô lý.

Giá thực phẩm, nhà ở và giao thông ảnh hưởng trực tiếp đến mức sống. Thành phố giàu nhưng cư dân nghèo không được xem là thành phố thành công.

## Economic Calculation Contract

Phân biệt rõ tiền đi vào nền kinh tế, tiền đi ra ngoài và tiền chỉ chuyển giữa các chủ thể nội bộ.

Tiền mới đi vào thành phố qua:

* Xuất khẩu
* Du khách từ bên ngoài
* Đầu tư bên ngoài
* Viện trợ
* Khoản vay

Tiền rời thành phố qua:

* Nhập khẩu
* Lãi vay trả ra ngoài
* Thuê dịch vụ hoặc mua công nghệ từ vùng khác
* Tiền phạt hợp đồng quốc tế

Các giao dịch như lương, mua hàng nội địa, thuế và trợ cấp chỉ chuyển tiền giữa doanh nghiệp, hộ gia đình và ngân sách thành phố. Không được cộng cùng một giao dịch thành nhiều nguồn tiền mới.

Công thức nền tảng phải tương đương:

```text
staffing_ratio = min(filled_jobs / required_jobs, 1)
input_ratio = min(available_input / required_input, 1)
utility_ratio = min(power_ratio, water_ratio, fuel_ratio)
logistics_ratio = delivery_reliability
condition_ratio = building_health

actual_output = base_output
              × staffing_ratio
              × input_ratio
              × utility_ratio
              × logistics_ratio
              × condition_ratio

sales_revenue = sold_quantity × market_price × quality_modifier

business_profit = sales_revenue
                - wages
                - input_cost
                - utility_cost
                - logistics_cost
                - maintenance
                - business_tax

city_net_cashflow = taxes
                  + service_fees
                  + export_fees
                  + contract_rewards
                  - public_wages
                  - maintenance
                  - subsidies
                  - imports
                  - debt_service
                  - emergency_spending
```

Các hệ số và công thức phải data-driven. UI phải hiển thị phiên bản dễ hiểu như “Nhà máy chỉ chạy 42% vì thiếu 8 công nhân và kho đầu vào đang trống”, không bắt người chơi tự đọc công thức.

Không có lao động hoặc không có đầu vào thiết yếu thì sản lượng phải bằng 0 hoặc mức tối thiểu hợp lý; công trình không được tự sinh doanh thu chỉ vì đã được đặt trên bản đồ.

## Business Simulation

Mỗi doanh nghiệp có:

* Vốn vận hành
* Nhân viên
* Hàng tồn kho
* Chi phí đầu vào
* Chi phí vận chuyển
* Giá bán
* Doanh thu
* Lợi nhuận
* Mức độ tin cậy

Doanh nghiệp có thể mở rộng, thu hẹp, chuyển ngành, tuyển thêm lao động, phá sản hoặc nhận đầu tư.

Người chơi không điều khiển trực tiếp mọi doanh nghiệp. Người chơi tác động thông qua hạ tầng, thuế, zoning, hợp đồng, trợ cấp và chất lượng dịch vụ.

## Logistics And Storage

Hàng hóa không được dịch chuyển tức thời.

Cần có:

* Kho nguyên liệu
* Kho thành phẩm
* Kho lạnh
* Xe tải
* Bến hàng
* Cảng biển
* Ga hàng hóa
* Trung tâm phân phối
* Tuyến giao hàng ưu tiên

Kho đầy làm dừng sản xuất. Thiếu xe hoặc tắc đường làm hàng hỏng, cửa hàng thiếu hàng và doanh nghiệp mất hợp đồng.

Ở quy mô lớn, dùng simulation theo lô hàng và tuyến logistics thay vì mô phỏng vật lý mọi kiện hàng.

## Market, Contracts And Trade

Giá hàng hóa thay đổi theo cung/cầu địa phương, mùa vụ, chất lượng, chi phí vận tải, khủng hoảng khu vực và quan hệ thương mại.

Người chơi có thể:

* Bán theo giá thị trường
* Ký hợp đồng giá cố định
* Nhập khẩu để cứu chuỗi sản xuất
* Dự trữ chờ giá tốt
* Chấp nhận đơn hàng khẩn cấp rủi ro cao
* Xây quan hệ lâu dài với các thành phố khác

Hợp đồng phải có số lượng, chất lượng, thời hạn, thưởng, phạt và yêu cầu logistics rõ ràng.

## Ecology And Resource Consequences

Khai thác phải tạo đánh đổi thực tế:

* Chặt rừng quá mức → xói mòn, giảm giữ nước, tăng lũ và giảm du lịch
* Đánh bắt quá mức → quần thể cá suy giảm và ngành biển sụp đổ
* Khai mỏ → việc làm và vật liệu nhưng gây bụi, ô nhiễm và chi phí phục hồi đất
* Nông nghiệp đơn canh → năng suất nhanh nhưng làm đất bạc màu
* Công nghiệp ven biển → logistics tốt nhưng tăng rủi ro ô nhiễm nước

Cho phép phục hồi bằng trồng rừng, luân canh, hạn ngạch đánh bắt, khu bảo tồn, xử lý chất thải và công nghệ sạch.

## Treasury Transparency

UI kinh tế phải trả lời ngay được:

* Tiền hôm nay đến từ đâu?
* Khoản nào đang lỗ?
* Bao nhiêu người đang làm việc và ở đâu?
* Nhà máy nào thiếu người, nguyên liệu hoặc đầu ra?
* Mặt hàng nào đang phải nhập khẩu?
* Nếu xây công trình này, dòng tiền dự kiến thay đổi thế nào?
* Thành phố sống được bao nhiêu ngày nếu cảng hoặc điện bị ngắt?

Cần có cashflow theo ngày/tuần/tháng, ledger theo ngành, biểu đồ doanh thu và tồn kho, tooltip công thức, forecast ngắn hạn, cảnh báo sớm và nút nhảy tới điểm nghẽn.

## Active Economic Gameplay

Không biến kinh tế thành màn hình chờ số tăng. Người chơi phải thường xuyên có việc để làm:

* Khảo sát vùng tài nguyên
* Chọn khu khai thác và giới hạn sản lượng
* Thiết kế tuyến logistics
* Xử lý điểm nghẽn
* Chuyển lao động giữa các ngành
* Chọn hợp đồng
* Dự trữ trước mùa bão
* Ứng phó đình công, tai nạn hoặc thiếu hàng
* Tìm nguồn nhập khẩu thay thế
* Đầu tư công nghệ để nâng giá trị sản phẩm
* Phục hồi môi trường sau khai thác

Mỗi 3–8 phút chơi nên xuất hiện ít nhất một quyết định kinh tế đáng chú ý, nhưng không được biến thành spam cảnh báo.

## Seasonal Planning And Perishable Goods

Mùa và thời tiết phải thay đổi nền kinh tế:

* Mùa mưa tăng thủy điện và cây trồng nhưng gây khó vận chuyển, ngập kho
* Mùa khô giảm nước, giảm nông nghiệp và tăng nguy cơ cháy rừng
* Mùa bão làm cảng đóng cửa, tàu cá không thể ra khơi và hàng nhập bị chậm
* Mùa du lịch tạo nhu cầu lớn nhưng gây quá tải dịch vụ

Thực phẩm tươi có hạn sử dụng. Kho lạnh dùng điện và chi phí bảo trì. Người chơi phải lựa chọn bán nhanh, chế biến, dự trữ hoặc chấp nhận hao hụt.

## Finance, Debt And Risk

Cho phép vay vốn để giải quyết khủng hoảng hoặc đầu tư sớm, nhưng khoản vay có lãi, kỳ hạn và đánh giá tín nhiệm.

Có thể mua bảo hiểm cho cảng, nhà máy, mùa vụ hoặc công trình quan trọng. Phí bảo hiểm tăng theo rủi ro thật của khu vực và lịch sử thiệt hại.

Phá sản không nên lập tức kết thúc game. Tạo cơ chế tái cấu trúc nợ, bán tài sản, nhận cứu trợ có điều kiện hoặc thu hẹp thành phố; người chơi có cơ hội phục hồi nhưng phải chịu hậu quả.

## Regional Expeditions And Salvage

Ngoài khu vực xây dựng chính, cho phép cử đội thám hiểm tới đảo nhỏ, phế tích, tàu đắm hoặc khu định cư khác.

Đội thám hiểm cần phương tiện, nhiên liệu, thực phẩm, kỹ năng và thời gian. Kết quả có thể là tài nguyên hiếm, công nghệ, người sống sót, đối tác mới hoặc sự cố cần cứu hộ.

Hệ thống này tạo lựa chọn đầu tư mạo hiểm và mở rộng câu chuyện mà không cần tăng kích thước bản đồ xây dựng vô hạn.

## Emergency Production Conversion

Trong khủng hoảng, một số công trình có thể đổi chức năng tạm thời:

* Xưởng nội thất chuyển sang làm vật liệu sửa nhà
* Nhà máy thực phẩm ưu tiên khẩu phần cứu trợ
* Sân vận động thành trung tâm sơ tán
* Trường học thành nơi trú bão
* Cảng du lịch thành cảng cứu hộ
* Đội xe thương mại chuyển sang vận chuyển y tế

Chuyển đổi giúp sinh tồn nhưng làm mất doanh thu, gây hao mòn và cần thời gian quay lại sản xuất bình thường.

## Citizen Enterprise And Social Groups

Cư dân có thể tự mở cửa hàng, hợp tác xã hoặc doanh nghiệp nhỏ khi có vốn, mặt bằng, nhu cầu và niềm tin kinh tế.

Các nhóm như ngư dân, công nhân, doanh nghiệp, nhà khoa học, cư dân ven biển và nhà bảo tồn có ưu tiên khác nhau. Chính sách có thể làm một nhóm hài lòng và nhóm khác phản đối.

Không biến thành hệ thống chính trị quá nặng ở đầu game. Dùng các nhóm này để tạo phản hồi, nhiệm vụ và hậu quả xã hội dễ hiểu.

## Replayability And Scenario Modifiers

Mỗi bản đồ nên có seed, phân bố tài nguyên, khí hậu, tuyến thương mại và modifier riêng:

* Đảo nhiều rừng nhưng ít đất nông nghiệp
* Vịnh cá phong phú nhưng thường xuyên bão
* Khu mỏ giàu nhưng thiếu nước
* Thành phố du lịch có đất đắt và lao động theo mùa
* Khu vực bị cô lập, nhập khẩu rất đắt

Scenario có thể thêm mục tiêu đặc biệt như trả nợ trong thời hạn, cứu một hệ sinh thái, tái thiết thành phố đổ nát hoặc sống sót khi tuyến hàng hải bị phong tỏa.

AI phải đánh giá từng hệ thống mở rộng theo bốn tiêu chí: tạo quyết định mới, liên kết được với core loop, giải thích được bằng UI và không làm tăng micromanagement vô ích.

## Infrastructure

* Electricity
* Water
* Sewage
* Garbage
* Internet
* Transportation
* Emergency services

## Environment

* Pollution
* Noise
* Traffic
* Green area
* Air quality
* Water quality

## City Happiness

Happiness phụ thuộc vào:

* Nhà ở
* Việc làm
* Giao thông
* Thu nhập
* Giá cả
* Y tế
* Giáo dục
* Công viên
* An ninh
* Ô nhiễm
* Dịch vụ công
* Thời tiết
* Thiên tai

---

# 7. BUILDING SYSTEM

Xây dựng phải cực kỳ trực quan.

Có nhiều chế độ:

### Road Mode

* Straight road
* Curved road
* Intersection
* Roundabout
* Bridge
* Tunnel

### Building Mode

* Residential
* Commercial
* Industrial
* Government
* Infrastructure
* Entertainment
* Transportation

### Decoration Mode

* Trees
* Benches
* Lamps
* Signs
* Bus stops
* Street furniture
* Parking
* Fences
* Small shops

### Utility Mode

Hiển thị network:

* Electricity
* Water
* Sewage
* Internet
* Heating / cooling nếu cần

---

# 8. MICRO-DETAILS

Một trong những điểm khác biệt của game:

Người chơi phải có thể xây dựng những thứ rất nhỏ.

Ví dụ:

Một con phố có thể có:

* Bus stop
* Bench
* Lamp
* Traffic light
* Crosswalk
* Parking
* Trees
* Garbage bins
* Road signs
* Bike lane
* Sidewalk

Các object nhỏ phải khiến thành phố có cảm giác "được xây dựng bởi con người".

---

# 9. BUILDING UPGRADE

Mỗi công trình có nhiều cấp độ.

Ví dụ:

Bus Stop Lv1
→ Bus Stop Lv2
→ Smart Bus Station
→ Automated Transit Hub

House Lv1
→ Modern House
→ Smart House
→ Eco House

Airport:

Small Airport
→ Regional Airport
→ International Airport
→ Mega Airport

Hospital:

Clinic
→ Hospital
→ Advanced Hospital
→ Medical Center

---

# 10. CITY DEVELOPMENT ERA

Thành phố có progression theo thời đại.

Ví dụ:

### Era 1

Small Town

### Era 2

Developing City

### Era 3

Modern City

### Era 4

Advanced Metropolitan City

### Era 5

Smart City

### Era 6

Future City

Mỗi era mở khóa:

* Buildings
* Technology
* Infrastructure
* Vehicles
* Decorations
* Policies
* Disaster prevention systems

---

# 11. TECHNOLOGY TREE

Tạo Technology Tree lớn.

Các nhánh:

### Transportation

Road
Bus
Rail
Metro
Airport
High-speed rail

### Energy

Coal
Gas
Solar
Wind
Hydro
Nuclear
Fusion / future technology

### Construction

Concrete
Steel
Advanced materials
Smart buildings

### Environment

Recycling
Water treatment
Green energy
Carbon reduction

### Emergency

Fire
Police
Hospital
Disaster prediction
Early warning

### Digital

Internet
Smart city
AI traffic
Automated infrastructure

---

# 12. DISASTER SYSTEM

Đây là một hệ thống gameplay quan trọng.

Thiên tai không chỉ xuất hiện ngẫu nhiên.

Game phải có:

NORMAL
→ WARNING
→ PREPARATION
→ DISASTER
→ EMERGENCY
→ RECOVERY
→ REBUILD

Các loại:

* Storm
* Heavy Rain
* Flood
* Typhoon
* Tornado
* Earthquake
* Wildfire
* Heatwave
* Extreme Cold
* Drought
* Landslide
* Tsunami
* Volcanic eruption
* Power grid failure
* Infrastructure failure

Không cần tất cả ngay phiên bản đầu.

Hãy xây dựng Disaster Framework modular để dễ thêm loại mới.

---

# 13. DISASTER PREPARATION

Người chơi có thể đầu tư trước.

Ví dụ:

Flood:

* Drainage
* Flood barriers
* Pumps
* Reservoir
* River management

Earthquake:

* Reinforced buildings
* Emergency shelters
* Seismic infrastructure

Storm:

* Storm shelters
* Warning towers
* Reinforced power grid

Heatwave:

* Cooling centers
* Trees
* Water reserves
* Energy capacity

Mục tiêu:

> Không phải ngăn thiên tai hoàn toàn.

Mục tiêu là giảm thiệt hại.

---

# 14. DYNAMIC WEATHER

Weather system:

* Sunny
* Cloudy
* Rain
* Heavy Rain
* Storm
* Fog
* Snow
* Heatwave
* Wind

Weather ảnh hưởng trực tiếp đến:

* Traffic
* Energy
* Happiness
* Tourism
* Agriculture
* Transportation
* Emergency services

Có:

Day / Night cycle.

---

# 15. TRAFFIC SYSTEM

Giao thông phải có simulation.

Có:

* Cars
* Buses
* Trucks
* Trains
* Emergency vehicles
* Pedestrians
* Bikes

Traffic ảnh hưởng:

* Travel time
* Pollution
* Happiness
* Economy
* Emergency response

Có Traffic Overlay:

GREEN
YELLOW
ORANGE
RED

Không cần mô phỏng từng chiếc xe ở quy mô vô hạn.

Dùng abstraction khi city scale lớn để đảm bảo performance.

---

# 16. CITIZEN SYSTEM

Citizen không chỉ là số population.

Có thể tạo simulation abstraction:

Citizen Groups:

* Student
* Worker
* Family
* Tourist
* Elderly
* Business owner

Mỗi nhóm có:

* Needs
* Destination
* Spending
* Satisfaction

Ở gần camera có thể spawn citizen thật.

Ở xa camera dùng simulation.

Mục tiêu:

Cân bằng realism và performance.

---

# 17. CITY ZONING

Cho phép người chơi quy hoạch:

* Residential
* Commercial
* Industrial
* Office
* Tourism
* Mixed-use
* Special districts

Có District system.

Ví dụ:

Downtown

Industrial Zone

Airport District

University District

Tourism District

Financial District

Residential District

---

# 18. LANDSCAPE

Terrain system:

* Hills
* Mountains
* Rivers
* Lakes
* Coast
* Forest
* Plains

Người chơi có thể:

* Terraform
* Build roads
* Build bridges
* Build dams
* Build tunnels

Nhưng terraform phải có giới hạn hợp lý để tránh phá toàn bộ bản đồ.

---

# 19. CITY BEAUTIFICATION

Đừng biến game thành bảng Excel.

Thành phố phải đẹp.

Có:

* Parks
* Gardens
* Plazas
* Waterfront
* Street decoration
* Seasonal decorations
* Landmarks
* Statues
* Lighting

Người chơi có thể chụp ảnh thành phố.

Có:

### Photo Mode

* Free camera
* Depth of field
* Time of day
* Weather
* UI hide
* Screenshot

---

# 20. UI / UX

UI là một trong những yếu tố quan trọng nhất.

Phong cách:

* Modern
* Clean
* Premium
* Minimal
* Soft glass / translucent panels
* Clear hierarchy
* Smooth animation

Không làm UI giống dashboard doanh nghiệp.

UI phải có cảm giác:

"Game hiện đại + dễ sử dụng."

---

# 21. MAIN UI

HUD:

Top:

* Money
* Population
* Happiness
* Energy
* Water
* City level

Bottom:

BUILD
ROAD
SERVICES
TRANSPORT
DECORATION
UPGRADE

Side panel:

Selected building information.

---

# 22. BUILDING PANEL

Khi click building:

Hiển thị:

* Name
* Level
* Cost
* Maintenance
* Workers
* Capacity
* Happiness impact
* Electricity
* Water
* Pollution
* Upgrade

Có animation và visualization.

---

# 23. INFORMATION OVERLAYS

Cho phép bật:

* Traffic
* Electricity
* Water
* Pollution
* Happiness
* Crime
* Fire risk
* Flood risk
* Earthquake risk
* Population
* Land value
* Noise
* Public transport

Mỗi overlay có visual riêng.

---

# 24. VISUAL STYLE

Không theo hướng hyper-realistic.

Mục tiêu:

Stylized realistic 3D.

Chi tiết vừa đủ.

Camera:

Isometric / 3D strategic camera.

Cho phép:

* Zoom
* Rotate
* Pan
* Tilt

Buildings có:

* LOD
* Instancing
* Occlusion
* Efficient materials

---

# 25. PERFORMANCE

Phải thiết kế ngay từ đầu cho city scale lớn.

Ưu tiên:

* Object pooling
* GPU instancing
* LOD
* Occlusion culling
* Chunk loading
* Simulation LOD
* Entity abstraction
* Batched updates

Không spawn hàng trăm nghìn entity thực nếu không cần.

---

# 26. MULTIPLAYER ARCHITECTURE

Thiết kế theo:

Server-authoritative architecture.

Server quản lý:

* City state
* Buildings
* Resources
* Economy
* Disaster
* Player permissions

Client quản lý:

* Rendering
* UI
* Input
* Local effects

Không để client tự quyết định resource hoặc city state quan trọng.

---

# 27. SAVE SYSTEM

Có:

Automatic Save

Manual Save

Cloud Save nếu backend hỗ trợ.

City state phải serialize được.

Không lưu toàn bộ object graph một cách nặng nề.

Thiết kế:

City
→ Districts
→ Buildings
→ Infrastructure
→ Simulation state

---

# 28. GAME PROGRESSION

Progression không chỉ dựa trên dân số. Người chơi phải chứng minh thành phố vận hành bền vững.

Người chơi có:

City Level

Technology

Money

Population

Reputation

Happiness

Infrastructure Score

Disaster Resilience Score

Economic Diversity Score

Supply Security

Trade Reputation

Ecological Balance

Mở khóa dần theo progression.

Mỗi cấp thành phố yêu cầu kết hợp nhiều điều kiện:

* Dân số tối thiểu
* Số việc làm thực được lấp đầy
* Dòng tiền dương ổn định trong một khoảng thời gian
* Dự trữ thực phẩm và vật liệu
* Mức phủ dịch vụ
* Khả năng chống chịu
* Không phụ thuộc quá mức vào một ngành duy nhất

Tạo ba tầng mục tiêu cùng lúc:

* Mục tiêu ngắn hạn: đơn hàng, thiếu hụt, sửa điểm nghẽn, yêu cầu cư dân
* Mục tiêu trung hạn: hoàn thiện chuỗi sản xuất, mở khu mới, cân bằng lao động
* Mục tiêu dài hạn: chuyên môn hóa thành phố, dự án lớn, sống sót qua chu kỳ thiên tai

---

# 29. ACHIEVEMENT

Ví dụ:

First 1,000 Citizens

Build First Airport

Survive Major Flood

Zero Traffic City

100% Renewable Energy

Million Population

Perfect Disaster Recovery

Create Smart City

---

# 30. EVENTS

Dynamic events:

* Business investment
* Tourist boom
* Economic recession
* Festival
* Sports event
* Construction project
* Infrastructure failure
* Refugee influx
* Energy shortage
* Water shortage
* Disease outbreak
* Cá di cư hoặc mùa cá thất bát
* Cháy rừng
* Sâu bệnh nông nghiệp
* Mỏ mới được phát hiện
* Mỏ cũ cạn kiệt
* Giá gỗ, thực phẩm hoặc kim loại biến động
* Đối tác thương mại phá hợp đồng
* Đình công do lương thấp hoặc điều kiện làm việc kém
* Tai nạn công nghiệp
* Tàu mắc cạn cần cứu hộ
* Chợ đen xuất hiện khi hàng thiết yếu thiếu kéo dài
* Nhà đầu tư đề nghị dự án có lợi nhuận cao nhưng gây hậu quả môi trường

Mỗi event có decision, thời hạn, thông tin dự báo, hậu quả ngắn hạn và hậu quả dài hạn. Không tạo lựa chọn giả mà một đáp án luôn tốt hơn mọi đáp án khác.

---

# 31. PLAYER DECISIONS

Game không chỉ là đặt building.

Có policy:

* Tax rate
* Public transport subsidy
* Industrial restrictions
* Green policy
* Tourism policy
* Education investment
* Healthcare investment
* Minimum wage
* Work shift limits
* Import tariff
* Export incentive
* Fishing quota
* Forest harvest quota
* Reforestation requirement
* Strategic reserve target
* Food rationing during crisis
* Small-business credit
* Industrial safety regulation
* Pollution fee
* Emergency price control

Policy tạo trade-off.

Ví dụ:

Tax thấp
→ Business tăng
→ Revenue giảm

Tax cao
→ Revenue tăng
→ Business attractiveness giảm

Hạn ngạch khai thác thấp
→ Thu nhập ngắn hạn giảm
→ Tài nguyên phục hồi và sản lượng dài hạn ổn định

Lương tối thiểu cao
→ Sức mua và hạnh phúc tăng
→ Doanh nghiệp lợi nhuận thấp có thể đóng cửa hoặc tăng giá

Dự trữ chiến lược lớn
→ Tốn kho và vốn lưu động
→ Thành phố chịu được bão, phong tỏa hoặc đứt nhập khẩu lâu hơn

---

# 32. CITY SPECIALIZATION

Cho phép mỗi thành phố phát triển khác nhau.

Ví dụ:

Industrial City

Forestry And Furniture City

Fishing And Maritime City

Agricultural Food Hub

Mining And Construction City

Financial City

Tourism City

Green City

Tech City

Transport Hub

Circular Economy City

Research And Automation City

Balanced City

Mỗi specialization phải có lợi thế, nhu cầu lao động, chuỗi cung ứng, tác động môi trường và rủi ro riêng.

Không có một build duy nhất bắt buộc. Bản đồ, tài nguyên, biến cố và lựa chọn chính sách phải khiến chiến lược tốt ở phiên này có thể không phù hợp ở phiên khác.

---

# 33. LANDMARK SYSTEM

Các landmark đặc biệt:

* Stadium
* Central Tower
* Convention Center
* Giant Airport
* Grand Station
* Theme Park
* Museum
* University
* Monument

Landmark có thể tạo identity cho city.

---

# 34. CO-OP PROJECTS

Tạo những project cực lớn cần nhiều người:

Mega Airport

High-speed Rail

Dam

Mega Hospital

International Port

Space Center

Smart City Core

Mỗi player có thể đóng góp:

* Money
* Materials
* Workforce
* Research

Khi hoàn thành:

Tất cả người chơi hưởng lợi.

---

# 35. COMMUNICATION

Trong game có:

* Chat
* Ping
* Building markers
* Shared notifications
* Project notifications

Ví dụ:

Player A ping:

"Xây bệnh viện ở đây?"

Player B:

"Đồng ý."

---

# 36. NOTIFICATION SYSTEM

Không spam.

Thông báo theo priority:

LOW
MEDIUM
HIGH
CRITICAL

Ví dụ:

LOW:
"Population increased."

HIGH:
"Power shortage."

CRITICAL:
"Major flood incoming."

---

# 37. AUDIO

Ambient:

* Cars
* People
* Construction
* Wind
* Rain
* Trains
* Aircraft
* City ambience

Audio thay đổi theo:

* Location
* Time
* Weather
* Density

---

# 38. MUSIC

Dynamic soundtrack.

Nhạc thay đổi theo:

Peaceful city
Growth
Construction
Danger
Disaster
Recovery
Major achievement

---

# 39. ACCESSIBILITY

Có:

* UI scale
* Colorblind mode
* Text size
* Camera sensitivity
* Key remapping
* Reduced effects
* Motion reduction

---

# 40. SAVE / LOAD SAFETY

Không được để crash làm mất city.

Có:

Rolling saves.

Ví dụ:

save_1
save_2
save_3

Nếu save mới lỗi:

Fallback save cũ.

---

# 41. MODULAR ARCHITECTURE

Mọi hệ thống quan trọng phải modular.

Ví dụ:

Building System

Disaster System

Weather System

Traffic System

Economy System

Population System

Technology System

Quest/Event System

Multiplayer System

UI System

Audio System

Không viết toàn bộ game trong một vài class khổng lồ.

---

# 42. DATA-DRIVEN DESIGN

Building data không hard-code.

Ví dụ:

BuildingDefinition:

* id
* name
* category
* cost
* maintenance
* population
* electricity
* water
* pollution
* capacity
* upgrade_id
* unlock_requirement

Tương tự:

DisasterDefinition

WeatherDefinition

TechnologyDefinition

EventDefinition

ResourceDefinition

RecipeDefinition

WorkplaceDefinition

WorkerSkillDefinition

InventoryDefinition

TradeContractDefinition

MarketDefinition

PolicyDefinition

Mọi công thức sản xuất, lương, thuế, giá, tồn kho, tốc độ tái tạo và thời gian vận chuyển phải nằm trong data có thể cân bằng mà không sửa code.

---

# 43. DEVELOPMENT PRIORITY

Không xây tất cả cùng lúc.

Chia thành:

## PHASE 0 — FOUNDATION

* Project setup
* Rendering
* Camera
* Input
* Basic UI
* Data system
* Save system

## PHASE 1 — CITY CORE

* Terrain
* Roads
* Buildings
* Placement
* Bulldoze
* Resource deposits and survey mode
* Forestry, fishing and basic food
* Storage and local delivery

## PHASE 2 — SIMULATION

* Population
* Workforce and job assignment
* Household income and spending
* Production chains
* Business revenue and city tax
* Transparent cashflow ledger
* Electricity
* Water
* Happiness

## PHASE 3 — TRANSPORT

* Cars
* Bus
* Train
* Airport

## PHASE 4 — CO-OP

* Server
* Multiplayer
* Shared city
* Permissions
* Synchronization

## PHASE 5 — WEATHER

* Day/night
* Weather
* Seasonal effects

## PHASE 6 — DISASTER

* Disaster framework
* Flood
* Storm
* Earthquake
* Recovery

## PHASE 7 — PROGRESSION

* Technology
* City level
* Unlocks
* Landmarks

## PHASE 8 — POLISH

* UI animation
* VFX
* Audio
* Optimization
* Photo mode

---

# 44. MVP

MVP đầu tiên chỉ cần:

Một bản đồ nhỏ.

Một người chơi.

Có:

* Camera
* Terrain
* Roads
* Residential buildings
* Commercial buildings
* Forest and fishing resource zones
* Logging camp, sawmill, fishing dock and market
* Warehouse and visible delivery route
* Electricity
* Water
* Population
* Workers with real job assignment
* One complete production chain
* Money generated from wages, sales, tax and export
* Daily income/expense breakdown
* One trade contract
* Happiness
* Basic UI
* Save/load

MVP chỉ được xem là đạt khi người chơi có thể trả lời rõ:

1. Thành phố đang sản xuất gì?
2. Ai đang làm việc ở đâu?
3. Hàng hóa đi theo tuyến nào?
4. Tiền được tạo ra từ giao dịch nào?
5. Vì sao một cơ sở đang có hoặc không có lợi nhuận?
6. Thành phố sẽ sống được bao lâu nếu chuỗi cung ứng bị gián đoạn?

Sau đó mới mở rộng multiplayer.

Tuy nhiên:

Architecture phải được thiết kế ngay từ đầu để Multiplayer có thể được thêm vào mà không phải rewrite toàn bộ game.

---

# 45. QUALITY BAR

Không chấp nhận:

* Placeholder UI quá lâu
* Hard-code toàn bộ logic
* God class
* Spaghetti code
* Duplicate systems
* Magic numbers
* Không có error handling
* Không có logging
* Không có save validation
* Multiplayer state không authoritative
* UI khó sử dụng
* Building placement thiếu feedback
* Performance không được profiling

---

# 46. UX PRINCIPLES

Người chơi phải luôn hiểu:

"Tôi đang làm gì?"

"Tại sao thành phố đang gặp vấn đề?"

"Tôi có thể giải quyết bằng cách nào?"

Ví dụ:

Power shortage.

Không chỉ hiện:

"Power -15."

Mà phải giải thích:

Power demand: 1,250 MW
Production: 1,100 MW
Deficit: 150 MW

Suggested solutions:

* Build Power Plant
* Upgrade Grid
* Reduce consumption

---

# 47. SMART ASSISTANT

Có thể thêm City Advisor.

AI Advisor giải thích tình trạng thành phố:

"Traffic đang tăng ở khu Downtown."

"3 khu dân cư đang thiếu trường học."

"Storm dự kiến sẽ ảnh hưởng khu vực phía Bắc."

"Power reserve hiện tại có thể không đủ trong 2 giờ."

Advisor chỉ đưa thông tin và đề xuất.

Không tự động phá/xây nếu người chơi chưa cho phép.

---

# 48. DYNAMIC CITY STORY

Thành phố phải có cảm giác đang phát triển.

Ví dụ:

Small town
→ Industrial growth
→ Population boom
→ Traffic crisis
→ Infrastructure upgrade
→ Airport construction
→ Tourism boom
→ Major storm
→ Recovery
→ Smart city

Không nhất thiết có storyline cố định.

Story được tạo từ simulation.

Câu chuyện cũng phải xuất hiện từ nền kinh tế:

Khu định cư thiếu thốn
→ Mở trại gỗ và cảng cá
→ Thu hút lao động
→ Xuất khẩu nguyên liệu
→ Xây xưởng chế biến
→ Bùng nổ dân số
→ Thiếu nhà và tắc logistics
→ Khai thác quá mức
→ Khủng hoảng tài nguyên
→ Chuyển sang công nghệ sạch và ngành kinh tế mới

Những câu chuyện này phải được tạo từ số liệu thật của simulation, không phải event được viết sẵn hoàn toàn.

---

# 49. GAME SHOULD FEEL LIKE

Kết hợp cảm giác:

City Builder
+
Co-op Management
+
Simulation
+
Disaster Preparation
+
Urban Planning
+
Relaxing Creative Sandbox

Nhưng không copy trực tiếp bất kỳ game nào.

Tham khảo có chọn lọc các bài học thiết kế đã thành công:

* Anno 1800: chuỗi sản xuất dễ đọc, nâng giá trị hàng hóa và nhiều tầng dân cư
* Banished: tài nguyên, kho, lao động và mùa đông cùng tạo áp lực sinh tồn
* Frostpunk: khủng hoảng có dự báo, quyết định khó và hậu quả xã hội rõ ràng
* Against the Storm: mục tiêu ngắn hạn thay đổi, bản đồ buộc thích nghi và replay cao
* Timberborn: địa hình, nước và mùa khô làm thay đổi quy hoạch
* Surviving Mars: hệ thống sống còn phụ thuộc mạng lưới và dự phòng
* Tropico: xuất khẩu, chính sách và các nhóm lợi ích tạo câu chuyện chính trị
* Workers & Resources: sản xuất và logistics có nguyên nhân vật lý rõ ràng
* Farthest Frontier: đất đai, mùa vụ, bảo quản thực phẩm và vị trí sản xuất quan trọng
* Cities: Skylines: công cụ quy hoạch và overlay giúp vấn đề đô thị dễ đọc

Không sao chép giao diện, asset, tên gọi, cốt truyện hoặc công thức cân bằng. Chỉ học nguyên lý vì sao các vòng lặp đó tạo quyết định thú vị.

Sau khi tham khảo, AI phải đề xuất thêm ít nhất ba cơ chế nguyên bản phù hợp riêng với Haven City. Ví dụ có thể thuộc các nhóm kinh tế biển, thích nghi khí hậu, hợp tác nhiều người, phục hồi hệ sinh thái hoặc cứu trợ liên vùng; không giới hạn ở các ví dụ này.

---

# 50. ENGINE / TECHNOLOGY

Engine hiện tại đã được xác định:

* Babylon.js 9.28
* WebGL 2
* TypeScript
* React
* Vite
* GLB / glTF với PBR materials

Không đề xuất chuyển sang Unity, Unreal hoặc Godot trừ khi người dùng yêu cầu đánh giá lại toàn bộ nền tảng.

Rendering và simulation phải tách biệt. Babylon.js chịu trách nhiệm hiển thị, camera, picking, animation và effects; game state không được phụ thuộc trực tiếp vào mesh.

Yêu cầu kỹ thuật:

* Simulation chạy theo fixed tick độc lập frame rate
* Data-oriented updates cho population, production và logistics
* Web Worker cho tính toán nặng khi cần
* Instancing và thin instances cho object lặp lại
* LOD, distance culling và simulation LOD
* Asset streaming theo nhu cầu
* Object pooling cho xe, người và VFX
* Shared PBR materials và texture atlas/KTX2 nếu phù hợp
* Không tải toàn bộ model khi mở game
* Có chất lượng đồ họa thích nghi theo FPS và thiết bị
* Có fallback WebGL an toàn thay vì crash trắng màn hình

Multiplayer backend phải server-authoritative và giao tiếp với client web qua protocol rõ ràng; không đặt business logic quan trọng trong React component.

---

# 51. CODE ARCHITECTURE

Thiết kế:

Core
├── Game
├── World
├── Resources
├── Buildings
├── Roads
├── Infrastructure
├── Population
├── Workforce
├── Economy
├── Production
├── Inventory
├── Logistics
├── Market
├── Trade
├── Transportation
├── Weather
├── Disaster
├── Technology
├── Events
├── Multiplayer
├── Save
├── UI
├── Audio
└── Tools

Mỗi module có responsibility rõ ràng.

---

# 52. EDITOR TOOLS

Tạo developer tools để dễ phát triển:

Building Editor

Resource Deposit Editor

Production Recipe Editor

Workplace And Skill Editor

Inventory And Warehouse Editor

Market And Contract Editor

Road Editor

Disaster Editor

Weather Editor

Technology Editor

Map Editor

Spawn Tool

Debug Overlay

Simulation Inspector

Network Debugger

---

# 53. DEBUG MODE

Có debug overlay:

FPS

Draw Calls

Memory

Network Ping

Server Tick

Entity Count

Building Count

Population

Simulation Time

Resource Flow

Worker Assignment

Production Throughput

Warehouse Capacity

Money Flow By Source

Market Prices

Traffic

Disaster State

---

# 54. TESTING

Viết test cho:

* Economy
* Resource calculation
* Internal transfers do not create duplicate money
* Zero workers or missing critical input stops production
* Production capacity scales correctly with staffing and utilities
* Inventory capacity and perishable decay
* Logistics interruption and rerouting
* Market price boundaries
* Contract reward and penalty
* Resource regeneration and depletion
* Deterministic simulation tick
* Building placement
* Upgrade
* Save/load
* Disaster damage
* Recovery
* Multiplayer synchronization

Không chỉ test UI.

---

# 55. DOCUMENTATION

Tạo:

README.md

ARCHITECTURE.md

GAME_DESIGN.md

ECONOMY_DESIGN.md

RESOURCE_AND_PRODUCTION.md

WORKFORCE_AND_HOUSEHOLDS.md

LOGISTICS_AND_TRADE.md

MULTIPLAYER.md

BUILDING_SYSTEM.md

DISASTER_SYSTEM.md

UI_GUIDELINES.md

DEVELOPMENT_ROADMAP.md

CONTRIBUTING.md

---

# 56. IMPLEMENTATION RULE

Trước khi code:

1. Phân tích yêu cầu.
2. Xác định architecture.
3. Xác định core systems.
4. Xác định dependency.
5. Tạo roadmap.
6. Chia task thành milestone.
7. Sau đó mới code.

Không tự ý xây 50 hệ thống cùng lúc.

Mỗi milestone phải:

* Build được.
* Run được.
* Test được.
* Không phá feature cũ.

---

# 57. IMPORTANT AI CODING RULE

Khi phát triển project:

KHÔNG tạo code chỉ để "demo".

Code phải hướng đến production.

Nếu cần prototype:

Prototype phải có khả năng được refactor thành production system.

Không tạo:

TODO vô nghĩa.

Không tạo:

"fake multiplayer".

Không tạo:

"fake simulation".

Nếu chưa implement được một system, hãy tạo interface/architecture đúng trước rồi implement dần.

---

# 58. ART DIRECTION

Visual target:

Stylized realistic 3D.

Không quá cartoon.

Không photorealistic.

Buildings sạch, đẹp, dễ nhận diện.

Màu sắc:

Natural.

Modern.

Readable.

UI:

Premium.

Minimal.

Responsive.

Animations:

Smooth.

Không lạm dụng.

---

# 59. CORE EMOTIONAL EXPERIENCE

Game phải tạo cảm giác:

"Đây là thành phố của tôi."

Sau vài giờ chơi, người chơi phải có cảm giác tự hào khi nhìn toàn bộ thành phố.

Sau khi xảy ra thiên tai:

"May mà mình đã xây hệ thống phòng thủ."

Sau khi thành phố phục hồi:

"Thành phố của mình đã mạnh hơn trước."

Đây là cảm xúc cốt lõi của game.

---

# 60. END GOAL

Mục tiêu cuối cùng không phải chỉ là:

"Xây thật nhiều nhà."

Mà là:

> Xây dựng một thành phố sống, phát triển cùng bạn bè, đối mặt với những vấn đề ngày càng phức tạp và cùng nhau biến một khu đất nhỏ thành một đô thị đáng sống.

Game phải có:

* Chiều sâu
* Tính chiến lược
* Tính sáng tạo
* Co-op
* Khả năng replay
* Progression
* Simulation
* Disaster
* City identity
* Beautiful UI
* Beautiful 3D
* Long-term extensibility

---

# 61. FINAL EXECUTION INSTRUCTION

Bắt đầu dự án theo thứ tự:

STEP 1:
Phân tích toàn bộ game concept.

STEP 2:
Xác nhận Babylon.js 9.28, WebGL 2 và các giới hạn kỹ thuật hiện tại.

STEP 3:
Thiết kế architecture.

STEP 4:
Thiết kế folder structure.

STEP 5:
Thiết kế core data models.

STEP 6:
Thiết kế gameplay loop, resource loop, workforce loop, production loop và money flow.

STEP 7:
Thiết kế UI/UX system.

STEP 8:
Thiết kế multiplayer architecture.

STEP 9:
Thiết kế roadmap.

STEP 10:
Bắt đầu implementation từ Foundation.

Trước khi implementation, bắt buộc xuất ra:

* Sơ đồ dòng tiền hoàn chỉnh
* Danh sách tài nguyên và tính tái tạo
* Ít nhất tám chuỗi sản xuất từ cơ bản đến nâng cao
* Ma trận nghề nghiệp, kỹ năng và công trình tuyển dụng
* Quy tắc logistics và tồn kho
* Công thức doanh thu, lương, thuế, chi phí và lợi nhuận có thể cân bằng bằng data
* Ba kịch bản khủng hoảng kinh tế
* Ba hướng chuyên môn hóa thành phố khả thi từ cùng một bản đồ
* UX cho bảng ngân sách và truy tìm nguyên nhân thiếu tiền

Sau mỗi milestone:

* Kiểm tra build.
* Kiểm tra runtime.
* Kiểm tra lỗi.
* Kiểm tra performance.
* Kiểm tra architecture.
* Cập nhật documentation.

Không chuyển sang milestone tiếp theo nếu milestone hiện tại chưa ổn định.

---

# 62. PRODUCT MINDSET

Hãy suy nghĩ như đang xây dựng một game thật sự phát hành cho người chơi.

Mọi quyết định phải cân bằng:

Fun
+
Depth
+
Performance
+
UX
+
Scalability
+
Multiplayer
+
Maintainability

Không ưu tiên feature count.

Ưu tiên:

**Quality of the core experience.**

Hãy chủ động phát hiện những điểm yếu trong concept và đề xuất cải tiến nếu chúng giúp game:

* Hay hơn
* Dễ chơi hơn
* Có chiều sâu hơn
* Có khả năng chơi lâu dài hơn
* Co-op thú vị hơn
* Có khả năng mở rộng tốt hơn

Nhưng không được thêm feature chỉ để làm game "to hơn".

Mỗi feature mới phải trả lời được:

> Feature này tạo thêm gameplay value gì?

Nếu không tạo giá trị rõ ràng, không thêm.

Với mọi feature kinh tế mới, phải trả lời thêm:

* Người chơi đưa ra quyết định gì?
* Dữ liệu đầu vào và đầu ra là gì?
* Hệ thống nào có thể làm nó thất bại?
* Người chơi nhìn thấy nguyên nhân bằng UI nào?
* Có chiến lược thay thế hay chỉ có một đáp án đúng?
* Nó tạo câu chuyện phát sinh nào trong simulation?

---

# 63. START NOW

Không bắt đầu bằng việc tạo hàng trăm asset hoặc hàng nghìn dòng code.

Hãy bắt đầu bằng:

1. Game architecture.
2. Economic vertical slice: rừng hoặc biển → khai thác → lao động → vận chuyển → bán hàng → thuế.
3. Core gameplay prototype.
4. City building foundation.
5. Data-driven resource, recipe, worker, inventory và contract system.
6. UI foundation với cashflow có thể giải thích.
7. Sau đó mở rộng từng system.

Mỗi lần implementation phải để lại một nền móng có thể tiếp tục phát triển.

Hãy coi đây là một **long-term commercial game project**, không phải một coding demo.
