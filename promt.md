# MASTER PROMPT — NEXT-GEN CO-OP CITY BUILDER

## 1. VAI TRÒ

Bạn là một **Senior Game Director + Game Designer + Gameplay Engineer + UI/UX Designer + 3D Technical Artist + Multiplayer Architect + Product Architect**.

Nhiệm vụ của bạn là thiết kế và phát triển một game **Co-op City Builder / Urban Management / Disaster Survival Simulation** có chất lượng sản phẩm hoàn chỉnh.

Đây không phải prototype vài màn hình.

Hãy xây dựng một nền tảng game có kiến trúc đủ tốt để phát triển thành một game thương mại lâu dài, với gameplay sâu dần theo thời gian, hệ thống modular, UI/UX hiện đại và multiplayer co-op thực sự.

---

# 2. Ý TƯỞNG CỐT LÕI

Người chơi cùng bạn bè xây dựng một thành phố từ quy mô nhỏ thành một đô thị hiện đại.

Người chơi không chỉ đặt các tòa nhà lớn.

Họ phải có cảm giác đang **thực sự xây dựng một thành phố sống**.

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

---

# 3. CORE GAMEPLAY LOOP

Gameplay chính:

BUILD
↓
CONNECT
↓
MANAGE
↓
GROW
↓
UPGRADE
↓
PREPARE
↓
SURVIVE DISASTER
↓
RECOVER
↓
EXPAND
↓
BUILD BETTER

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

* Tax
* Revenue
* Expenses
* Business
* Tourism
* Trade
* Industry
* Employment
* Unemployment
* Inflation / economic pressure

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

Người chơi có:

City Level

Technology

Money

Population

Reputation

Happiness

Infrastructure Score

Disaster Resilience Score

Mở khóa dần theo progression.

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

Mỗi event có decision.

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

Policy tạo trade-off.

Ví dụ:

Tax thấp
→ Business tăng
→ Revenue giảm

Tax cao
→ Revenue tăng
→ Business attractiveness giảm

---

# 32. CITY SPECIALIZATION

Cho phép mỗi thành phố phát triển khác nhau.

Ví dụ:

Industrial City

Financial City

Tourism City

Green City

Tech City

Transport Hub

Balanced City

Không có một build duy nhất bắt buộc.

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
* Basic resources

## PHASE 2 — SIMULATION

* Population
* Economy
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
* Electricity
* Water
* Population
* Money
* Happiness
* Basic UI
* Save/load

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

---

# 50. ENGINE / TECHNOLOGY

Nếu chưa được chỉ định engine:

Ưu tiên đánh giá:

1. Unity
2. Unreal Engine
3. Godot

Chọn engine dựa trên:

* 3D performance
* Multiplayer
* UI
* Tooling
* Asset pipeline
* Large-scale simulation
* Cross-platform support
* Development speed

Trước khi implementation, hãy giải thích ngắn gọn lý do chọn engine.

---

# 51. CODE ARCHITECTURE

Thiết kế:

Core
├── Game
├── World
├── Buildings
├── Roads
├── Infrastructure
├── Population
├── Economy
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

Traffic

Disaster State

---

# 54. TESTING

Viết test cho:

* Economy
* Resource calculation
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
Đề xuất engine và technology stack.

STEP 3:
Thiết kế architecture.

STEP 4:
Thiết kế folder structure.

STEP 5:
Thiết kế core data models.

STEP 6:
Thiết kế gameplay loop.

STEP 7:
Thiết kế UI/UX system.

STEP 8:
Thiết kế multiplayer architecture.

STEP 9:
Thiết kế roadmap.

STEP 10:
Bắt đầu implementation từ Foundation.

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

---

# 63. START NOW

Không bắt đầu bằng việc tạo hàng trăm asset hoặc hàng nghìn dòng code.

Hãy bắt đầu bằng:

1. Game architecture.
2. Core gameplay prototype.
3. City building foundation.
4. Data-driven system.
5. UI foundation.
6. Sau đó mở rộng từng system.

Mỗi lần implementation phải để lại một nền móng có thể tiếp tục phát triển.

Hãy coi đây là một **long-term commercial game project**, không phải một coding demo.
