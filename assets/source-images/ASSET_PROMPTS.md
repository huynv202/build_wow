# Haven City - Image-to-3D Asset Prompt Catalog

Tài liệu này là danh sách prompt để tạo ảnh nguồn cho pipeline dựng 3D. Không dùng tên, logo, UI hay landmark đặc trưng của game tham khảo. Mục tiêu là cùng thể loại và chất lượng hình ảnh, nhưng có nhận diện riêng cho Haven City.

## 1. Quy chuẩn bắt buộc

Mỗi model 3D cần một ảnh riêng, không ghép nhiều loại công trình vào cùng một scene. Xuất PNG 2048x2048 hoặc lớn hơn. Không crop vật thể, không chữ, không logo, không watermark.

Với công trình, xe, cây và street props, luôn nối khối `GLOBAL 3D ASSET BLOCK` vào cuối prompt:

```text
GLOBAL 3D ASSET BLOCK:
Use case: stylized-concept
Asset type: clean multi-view reference sheet for image-to-3D reconstruction in a commercial city-builder game
Style/medium: polished stylized 3D render, optimistic modern mobile city-builder aesthetic, believable architecture simplified into clean readable forms, premium game art, not photorealistic, not voxel, not clay, not flat illustration
Visual language: strong silhouette, medium detail density, gently beveled edges, modular construction, readable from a distant isometric camera, consistent 1:1 world scale
Color palette: bright coastal city colors, white concrete, cool blue glass, teal accents, warm coral and ochre highlights, fresh green landscaping; controlled saturation, no neon overload
Materials: physically plausible but stylized PBR surfaces, subtle roughness variation, clean glass, painted metal, concrete, wood and asphalt; minimal baked lighting
Composition: one isolated asset shown in five synchronized views: front, back, left side, right side, and elevated three-quarter isometric view; identical geometry and colors in every view; complete object fully visible with generous padding
Camera: orthographic, minimal perspective distortion, consistent scale across views
Lighting: neutral soft studio lighting, ambient occlusion only, no dramatic rim light, no colored light, no hard cast shadow
Background: plain light neutral gray, high contrast against the asset, no environment, no ground clutter
Constraints: construction must be physically coherent; clean separable components; closed surfaces; straight verticals; no people unless requested; no vehicles unless requested; no text; no signs with letters; no logos; no brands; no watermark
Avoid: copying any existing game asset, fisheye perspective, cinematic depth of field, motion blur, excessive micro-detail, floating pieces, warped windows, impossible stairs, random antennas, duplicate objects, cut-off geometry
```

Riêng texture, dùng block này:

```text
GLOBAL TEXTURE BLOCK:
Use case: stylized-concept
Asset type: seamless tileable PBR game texture reference
Style: clean stylized realism for a colorful city-builder, medium scale detail, even surface response
Composition: perfectly top-down orthographic, edge-to-edge material, seamless on all four borders, flat and evenly exposed
Lighting: neutral diffuse lighting with no directional shadow, no perspective
Constraints: no objects, no debris, no text, no logos, no watermark, no baked large-scale shadow, no visible repeating centerpiece
Output intent: source for albedo, normal, roughness and ambient-occlusion texture generation
```

## 2. P0 - Art direction

### `00_style/haven_city_visual_target.png`

```text
Use case: stylized-concept
Asset type: final-quality game environment key art and visual target
Primary request: a dense, joyful coastal metropolis for an original city-building game, showing a compact downtown, residential neighborhoods, parks, civic buildings, trains, bridges and a marina as one coherent living city
Scene/backdrop: green island city surrounded by turquoise water, mountains faintly visible at the horizon
Subject: a varied city with clear road hierarchy, active traffic, tree-lined sidewalks, colorful mid-rise blocks, a small group of elegant skyscrapers, a waterfront promenade and transit infrastructure
Style/medium: premium stylized 3D game render, clean readable architecture, polished mobile/PC city-builder quality, original visual identity
Composition/framing: elevated isometric strategic camera at approximately 35 degrees, wide overview, dense but readable composition, every district connected logically
Lighting/mood: crisp sunny morning, soft shadows, bright optimistic atmosphere, light atmospheric perspective
Color palette: white, aqua, cobalt, coral, terracotta, warm yellow and lush green; turquoise water; controlled saturation
Constraints: original city and original buildings, realistic scale relationships, coherent road network, no UI, no labels, no text, no logos, no watermark
Avoid: direct imitation of any existing game screenshot, photorealism, toy plastic look, cyberpunk, medieval elements, empty terrain, random disconnected buildings
```

### `00_style/building_style_guide.png`

```text
Use case: stylized-concept
Asset type: architecture style bible sheet
Primary request: define the original Haven City architectural language across six buildings: small home, apartment, shop, office, clinic and utility station
Style/medium: polished stylized 3D game asset presentation, cohesive family of designs, clean geometric construction with softly beveled edges
Composition/framing: six buildings in a clean lineup plus a small palette/material swatch row, elevated three-quarter orthographic view, no overlaps
Lighting/mood: neutral studio lighting
Color palette: white concrete, blue glass, teal framing, coral roofs, ochre accent panels, green planters
Constraints: each building must look functionally distinct but clearly belong to the same city; no text; no logos; no watermark; plain light gray background
Avoid: copied assets, fantasy shapes, excessive neon, photorealism, inconsistent scale
```

## 3. P0 - Residential

### `01_residential/house_lv1.png`

```text
Primary request: compact single-family coastal starter house, one floor plus small loft, coral gable roof, white stucco walls, teal window frames, covered front porch, small side garden, rain gutter, rear utility door
Gameplay silhouette: welcoming low-density home, footprint approximately 12 by 14 meters
Upgrade tier: level 1, affordable and modest but carefully maintained
```

### `01_residential/house_lv2.png`

```text
Primary request: upgraded modern family house, two floors, asymmetric coral and flat roof combination, white stucco and warm timber panels, balcony, solar hot-water unit, larger windows, landscaped front path
Gameplay silhouette: visibly taller and wealthier evolution of the starter house, footprint approximately 14 by 16 meters
Upgrade tier: level 2, modern middle-income residence
```

### `01_residential/house_lv3.png`

```text
Primary request: level 3 urban family home evolved from level 2, three compact floors, reinforced white concrete frame, coral roof terrace canopy, larger aqua windows, covered parking bay, storm shutters and integrated rainwater tank
Gameplay role: prosperous house with visibly improved storm and flood resilience, same approximate 14 by 16 meter footprint
```

### `01_residential/house_lv4.png`

```text
Primary request: level 4 climate-resilient smart house evolved from level 3, protected central core, aerodynamic roof edges, impact-resistant windows, retractable exterior shades, rooftop solar panels, raised ground floor and intelligent drainage channels
Gameplay role: first house tier that can withstand a major storm with limited damage
```

### `01_residential/house_lv5.png`

```text
Primary request: level 5 eco house evolved from level 4, elegant four-storey compact residence, vertical garden, broad solar roof, battery enclosure, recycled-water system, deep shade balconies and reinforced coastal materials
Gameplay role: premium low-energy residence with strong climate protection
```

### `01_residential/house_lv6.png`

```text
Primary request: level 6 self-sufficient future home evolved from level 5, refined four-storey residence with rounded wind-resistant corners, adaptive facade louvers, integrated solar skin, compact rooftop greenhouse, water storage and a protected utility core
Gameplay role: maximum-tier house, technologically advanced but believable with near-future real-world engineering
Avoid: science-fiction spaceship appearance, holograms, impossible floating structures
```

### `01_residential/apartment_lv1.png`

```text
Primary request: compact four-storey apartment building, rectangular urban footprint, white concrete frame, coral balcony rails, blue-gray windows, shared entrance canopy, rooftop water tanks and a few planters
Gameplay silhouette: readable mid-density residential block, footprint approximately 18 by 18 meters
Upgrade tier: level 1 apartment, practical rather than luxurious
```

### `01_residential/apartment_lv2.png`

```text
Primary request: eight-storey contemporary apartment tower on a two-storey podium, stepped terraces, white structural bands, aqua glass, coral sun shades, rooftop garden and a small covered drop-off
Gameplay silhouette: slim residential tower with clear podium and roof crown, footprint approximately 22 by 22 meters
Upgrade tier: level 2 high-density residence
```

### `01_residential/apartment_lv3.png`

```text
Primary request: level 3 residential tower evolved from level 2, twelve floors above a mixed community podium, strong white structural grid, aqua glass balconies, coral sun screens, sheltered entrance, shared rooftop garden and reinforced service core
Gameplay role: high-density tower with improved storm resistance
```

### `01_residential/apartment_lv4.png`

```text
Primary request: level 4 smart apartment complex evolved from level 3, eighteen-storey stepped tower, aerodynamic corners, sky gardens every six floors, impact-resistant curtain wall, solar balcony rails, elevated utility rooms and protected emergency refuge floor
Gameplay role: advanced resilient housing for severe modern climate conditions
```

### `01_residential/apartment_lv5.png`

```text
Primary request: level 5 metropolitan residential complex evolved from level 4, two elegant connected towers of 24 and 18 floors on a shared podium, rounded wind-resistant profiles, vertical gardens, integrated renewable facade, water recycling equipment and emergency refuge terraces
Gameplay role: maximum-tier high-density housing, iconic yet technically believable
Avoid: fantasy megastructure, floating bridges, excessive neon
```

## 4. P0 - Commercial

Mọi công trình thương mại có tối thiểu 4 level. Prompt level sau phải giữ footprint, màu nhận diện và kết cấu chính của level trước, chỉ thêm các thay đổi được ghi dưới đây.

| Công trình | Level 1 | Level 2 | Level 3 | Level 4 |
|---|---|---|---|---|
| Chợ phố | `street_market_lv1.png`: prompt gốc bên dưới | `street_market_lv2.png`: add permanent covered arcades, organized cold storage and a second entrance | `street_market_lv3.png`: add a two-storey food hall, rooftop dining terrace and solar canopy | `street_market_lv4.png`: evolve into a climate-controlled smart market with automated loading, green roof and storm shutters |
| Văn phòng | `office_lv1.png`: prompt gốc | `office_lv2.png`: prompt gốc | `office_lv3.png`: 24-storey financial tower with reinforced core, sky lobby and transit-connected podium | `office_lv4.png`: 36-storey digital economy tower with aerodynamic crown, vertical gardens and self-powered facade |
| Siêu thị | `supermarket_lv1.png`: prompt gốc bên dưới | `supermarket_lv2.png`: add two retail floors, structured parking and larger loading wing | `supermarket_lv3.png`: evolve into an urban shopping center with cinema volume and rooftop public garden | `supermarket_lv4.png`: smart mixed retail hub with automated logistics, energy facade and emergency shelter level |

### `02_commercial/street_market_lv1.png`

```text
Primary request: lively permanent neighborhood market building, one main floor with a taller central roof, modular colorful awnings, open corner entrances, produce stands integrated under the canopy, rear loading door
Gameplay silhouette: broad welcoming local commerce building, footprint approximately 18 by 16 meters
Constraints: stalls may contain simple fruit color shapes but no people, no readable signage
```

### `02_commercial/office_lv1.png`

```text
Primary request: six-storey small business office, white concrete frame, alternating blue glass bays, teal vertical fins, coral entrance canopy, rooftop mechanical enclosure, planted ground-floor setback
Gameplay silhouette: clean rectangular workplace, footprint approximately 18 by 20 meters
```

### `02_commercial/office_lv2.png`

```text
Primary request: sixteen-storey premium office tower, gently curved blue-glass corners, strong white vertical frame, teal and brass accent fins, two-storey lobby podium, rooftop crown and mechanical screen
Gameplay silhouette: elegant recognizable downtown tower, footprint approximately 24 by 24 meters
```

### `02_commercial/supermarket_lv1.png`

```text
Primary request: modern neighborhood supermarket, large single-storey retail hall, sawtooth roof with skylights, white facade, teal entrance portal, coral canopy, rear loading docks, cart shelter and planted perimeter
Gameplay silhouette: wide low commercial anchor, footprint approximately 30 by 24 meters
Constraints: no parking cars and no readable store name
```

## 5. P0 - Public services

Mỗi dịch vụ công có 4 level. Ảnh level 2–4 dùng prompt level 1 tương ứng, cộng modifier trong bảng.

| Công trình | Level 1 | Level 2 | Level 3 | Level 4 |
|---|---|---|---|---|
| Y tế | `clinic_lv1.png`: phòng khám gốc | `clinic_lv2.png`: district hospital with four floors, emergency wing and diagnostic block | `clinic_lv3.png`: regional hospital with inpatient tower, surgical wing and rooftop helipad | `clinic_lv4.png`: advanced medical center with two resilient towers, research wing and disaster command unit |
| Cứu hỏa | `fire_station_lv1.png`: trạm gốc | `fire_station_lv2.png`: four bays, larger crew wing and training tower | `fire_station_lv3.png`: city rescue center with six bays, hazardous-material unit and drone pad | `fire_station_lv4.png`: metropolitan emergency command with hardened operations center and multi-disaster rescue depot |
| Cảnh sát | `police_station_lv1.png`: đồn gốc | `police_station_lv2.png`: district headquarters with larger secure yard and operations wing | `police_station_lv3.png`: city safety center with forensic block and emergency coordination room | `police_station_lv4.png`: smart public-safety command with hardened data center, drone operations and disaster coordination floor |
| Giáo dục | `school_lv1.png`: trường gốc | `school_lv2.png`: secondary school with science wing and larger sports hall | `school_lv3.png`: college campus with library, laboratories and auditorium | `school_lv4.png`: advanced university center with research tower, innovation labs and emergency shelter facilities |

### `03_services/clinic_lv1.png`

```text
Primary request: small two-storey community health clinic, clean white and pale aqua facade, coral emergency canopy, accessible entrance ramp, shaded windows, compact rear ambulance bay, rooftop ventilation equipment
Gameplay silhouette: calm trustworthy healthcare building, footprint approximately 20 by 18 meters
Constraints: a universal medical cross shape may be used, but no text or branding
```

### `03_services/fire_station_lv1.png`

```text
Primary request: compact fire station with two large vehicle bays, white concrete structure, strong coral-red doors and tower accent, upper crew room, side training yard wall, hose-drying tower and rooftop antenna
Gameplay silhouette: instantly readable emergency service, footprint approximately 24 by 18 meters
Constraints: no fire trucks in the building sheet
```

### `03_services/police_station_lv1.png`

```text
Primary request: three-storey neighborhood police station, civic white stone base, blue-gray upper volume, protected entrance canopy, secure rear vehicle gate, communication mast and restrained teal accents
Gameplay silhouette: solid safe civic building, footprint approximately 22 by 18 meters
Constraints: no weapons, no police vehicles, no text
```

### `03_services/school_lv1.png`

```text
Primary request: welcoming primary school campus building, two floors around a small courtyard, white walls, yellow and teal sun shades, coral roofs, covered walkway, rear sports hall and bicycle shelter
Gameplay silhouette: horizontal education campus, footprint approximately 32 by 26 meters
Constraints: no children, no words or alphabet signage
```

## 6. P0 - Utilities

Hạ tầng có đúng 4 level; mỗi cấp tăng công suất, bán kính bảo vệ và độ bền. Dùng prompt level 1 bên dưới cộng modifier tương ứng.

| Công trình | Level 1 | Level 2 | Level 3 | Level 4 |
|---|---|---|---|---|
| Nước | `water_tower_lv1.png`: tháp nước gốc | `water_tower_lv2.png`: twin tanks and larger pump house | `water_tower_lv3.png`: water-treatment plant with reservoirs and laboratory | `water_tower_lv4.png`: smart closed-loop water campus with storm-resistant storage and recycling wing |
| Điện mặt trời | `solar_station_lv1.png`: trạm gốc | `solar_station_lv2.png`: double panel field and battery hall | `solar_station_lv3.png`: solar farm with tracking panels and grid storage | `solar_station_lv4.png`: smart renewable-energy campus with high-capacity storage and hardened microgrid control |
| Thoát nước | `drainage_station_lv1.png`: trạm gốc | `drainage_station_lv2.png`: twin pumping hall and larger intake | `drainage_station_lv3.png`: district flood-control plant with reservoir gates | `drainage_station_lv4.png`: automated city flood-control hub with smart gates, backup power and emergency overflow basin |
| Trạm điện | `substation_lv1.png`: trạm gốc | `substation_lv2.png`: dual transformers and protected control room | `substation_lv3.png`: district switching station with battery backup | `substation_lv4.png`: hardened smart-grid node with redundant transformers and storm-proof control center |
| Chống UV | `uv_station_lv1.png`: trạm gốc | `uv_station_lv2.png`: larger emitter ring and dual power cabinets | `uv_station_lv3.png`: regional array with four linked emitter masts | `uv_station_lv4.png`: atmospheric protection hub with redundant power core and maximum-area synchronized emitter crown |
| Chắn sóng | `seawall_lv1.png`: kè đá gốc | `seawall_lv2.png`: reinforced concrete wall with wave-return profile | `seawall_lv3.png`: deep-foundation sea dike with energy-dissipation chambers | `seawall_lv4.png`: smart coastal barrier with adjustable gates, sensors and integrated emergency promenade |

### `04_utilities/water_tower_lv1.png`

```text
Primary request: iconic municipal water tower, cylindrical aqua tank with white structural ribs, four reinforced legs, maintenance ladder with safety cage, circular service platform, small pump enclosure at ground level
Gameplay silhouette: tall and instantly readable from distance, total height approximately 28 meters
```

### `04_utilities/solar_station_lv1.png`

```text
Primary request: compact urban solar power station, nine tilted blue photovoltaic panel arrays on white supports, central teal inverter building, perimeter cable conduits, small battery cabinets and safe maintenance paths
Gameplay silhouette: low wide clean-energy facility, footprint approximately 26 by 22 meters
Constraints: no fence and no surrounding landscape
```

### `04_utilities/drainage_station_lv1.png`

```text
Primary request: flood-control pumping station, low reinforced concrete building, two large aqua outlet pipes, circular pump housings, grated intake channel, yellow safety rails and elevated electrical cabinet
Gameplay silhouette: rugged low infrastructure asset, footprint approximately 22 by 18 meters
```

### `04_utilities/substation_lv1.png`

```text
Primary request: compact electrical substation, neat modular transformers, ceramic insulators, busbars, control cabinet and a small service building arranged on a concrete pad
Gameplay silhouette: readable power infrastructure, footprint approximately 20 by 18 meters
Constraints: safe simplified engineering, no perimeter fence, no text
```

### `04_utilities/uv_station_lv1.png`

```text
Primary request: regional ultraviolet protection and atmospheric monitoring station, tall white-and-aqua mast with a broad circular emitter crown, four directional shield arrays, weather sensors, protected electrical control building, cooling vents and visible high-capacity power conduits
Gameplay silhouette: unmistakable regional protection device with a circular coverage role, approximately 34 meters high
Constraints: plausible near-future civic technology, no magical beam, no purple energy bubble, no text
```

### `04_utilities/seawall_lv1.png`

```text
Primary request: modular coastal wave-defense segment, sloped interlocking gray armor blocks on the sea side, reinforced concrete promenade wall, drainage openings, yellow safety edge and modular end connectors
Gameplay silhouette: heavy low linear coastal defense, one segment approximately 16 meters long
Constraints: no water, no beach, no people, no road; geometry must tile seamlessly end to end
```

## 7. P0 - Roads and transport

Đường và đầu mối giao thông đều có 4 level. Road kit mỗi level phải giữ đúng kích thước nối tile.

| Công trình | Level 1 | Level 2 | Level 3 | Level 4 |
|---|---|---|---|---|
| Đường | `road_kit_lv1.png`: đường hai làn cơ bản | `road_kit_lv2.png`: add sidewalks, drainage, crosswalk modules and street lights | `road_kit_lv3.png`: four-lane smart avenue kit with bus and protected bicycle lanes | `road_kit_lv4.png`: high-capacity automated corridor with adaptive lanes, sensor gantries and emergency priority lane |
| Trạm bus | `bus_stop_lv1.png`: trạm gốc | `bus_stop_lv2.png`: larger shelter, lighting and route display | `bus_stop_lv3.png`: enclosed smart station with ticketing and bicycle dock | `bus_stop_lv4.png`: automated transit hub with weather protection, charging and emergency communication system |
| Ga tàu | `train_station_lv1.png`: ga gốc | `train_station_lv2.png`: four platforms and larger concourse | `train_station_lv3.png`: regional station with retail hall and bus interchange | `train_station_lv4.png`: grand multimodal hub with high-speed platforms, metro interchange and resilient emergency operations wing |
| Cầu | `bridge_lv1.png`: cầu gốc | `bridge_lv2.png`: wider reinforced truss bridge with bicycle paths | `bridge_lv3.png`: long-span cable-supported bridge with transit lanes | `bridge_lv4.png`: smart resilient crossing with storm sensors, emergency lane and adjustable wave barriers at the piers |

### `06_roads/road_kit_lv1.png`

```text
Use case: stylized-concept
Asset type: modular 3D road kit reference sheet for game modeling
Primary request: coherent modular urban road kit containing exactly six isolated pieces: straight two-lane road, 90-degree corner, T-junction, four-way intersection, dead end and small roundabout
Style/medium: polished stylized 3D city-builder assets, dark charcoal asphalt, pale concrete sidewalks, white lane markings, ochre center markings, teal drainage grates
Composition/framing: top-down orthographic parts grid plus one elevated isometric preview; every module uses an identical square tile size and matching edge connections
Lighting: neutral studio lighting, no dramatic shadows
Constraints: no cars, no trees, no street furniture, no text, no arrows, no logos, no watermark; exact seamless road edges
Avoid: perspective distortion, inconsistent road width, baked environment, damaged asphalt
```

### `06_roads/avenue_kit.png`

```text
Primary request: modular four-lane boulevard segment with central planted median, protected bicycle lanes, broad sidewalks, curb ramps, drainage grates and consistent intersection connection points
Gameplay silhouette: premium urban avenue, exact straight modular segment approximately 32 by 16 meters
```

### `05_transport/bus_stop_lv1.png`

```text
Primary request: modern covered bus stop, teal metal frame, curved transparent roof, glass wind screen, timber bench, route display panel without text, solar light and integrated litter bin
Gameplay silhouette: compact recognizable street asset, length approximately 5 meters
```

### `05_transport/train_station_lv1.png`

```text
Primary request: compact metropolitan railway station, two parallel platforms, white arched canopy, aqua glass entrance hall, pedestrian overpass with elevators, coral accent panels and rear service rooms
Gameplay silhouette: long horizontal transit hub, footprint approximately 48 by 24 meters
Constraints: no train, no people, no readable signage
```

### `05_transport/bridge_lv1.png`

```text
Primary request: modern red-orange steel truss road bridge, two traffic lanes with sidewalks, modular central span, concrete piers, clean structural logic and matching road connection decks
Gameplay silhouette: strong iconic crossing, one repeatable span approximately 32 meters long
Constraints: no water or terrain, no vehicles, no text
```

## 8. P0 - Nature and props

Công viên là công trình nâng cấp 4 level: `small_park_lv1.png` dùng prompt gốc; `small_park_lv2.png` thêm sân chơi và rain garden lớn; `small_park_lv3.png` thành công viên sinh thái có hồ điều tiết; `small_park_lv4.png` thành lá phổi đô thị với vườn thực vật, cooling pavilion và hệ thống giữ nước mưa thông minh.

### `07_nature/tree_pack.png`

```text
Use case: stylized-concept
Asset type: game vegetation model reference sheet
Primary request: exactly six isolated city trees sharing one stylized art direction: young street tree, mature round-canopy tree, tall narrow tree, flowering tree, coastal palm and small ornamental tree
Style/medium: polished stylized 3D, clustered leaf volumes rather than individual leaves, believable trunks, clean low-to-medium-poly silhouettes
Composition/framing: each tree shown in front and elevated three-quarter views, consistent scale, fully visible and separated
Background: plain light neutral gray
Constraints: no ground patches, no pots, no benches, no text, no watermark
```

### `07_nature/small_park_lv1.png`

```text
Primary request: square neighborhood pocket park asset with four trees, curving paths, central circular flower bed, two benches, low pedestrian lamps, lawn and a small rain garden
Gameplay silhouette: readable green oasis on one exact square city tile, footprint approximately 18 by 18 meters
Constraints: no people, no surrounding roads, no text
```

### `08_props/street_props_pack.png`

```text
Use case: stylized-concept
Asset type: modular street furniture model reference sheet
Primary request: exactly eight separate original urban props: timber-and-teal bench, pedestrian lamp, traffic light, litter bin, bicycle rack, fire hydrant, bollard and street planter
Style/medium: polished stylized 3D city-builder props, cohesive materials and proportions
Composition/framing: clean labeled-by-position grid without written labels, each prop isolated with front, side and three-quarter view, consistent human scale
Background: plain light neutral gray
Constraints: no text, no logos, no people, no watermark, objects must not overlap
```

## 9. P0 - Vehicles

### `09_vehicles/city_car_pack.png`

```text
Use case: stylized-concept
Asset type: game vehicle model reference sheet
Primary request: three original compact city cars using the same geometry with color variations in coral, ochre and aqua; friendly modern proportions, dark glass, simple wheel design, front and rear lights
Style/medium: polished stylized 3D city-builder vehicle, medium-low-poly, clean beveled body panels
Composition/framing: one car model shown in front, rear, left, right, top and elevated three-quarter views; color swatches displayed separately
Background: plain light neutral gray
Constraints: no driver, no interior detail beyond dark seats, no license text, no logos, no watermark
```

### `09_vehicles/city_bus.png`

```text
Primary request: modern compact electric city bus, rounded white body, teal lower panels, coral accent stripe, large dark windows, two passenger doors, roof battery enclosure and simple accessible proportions
Gameplay silhouette: friendly recognizable public transport vehicle approximately 10 meters long
```

### `09_vehicles/fire_engine.png`

```text
Primary request: compact modern fire engine, coral-red cab and body, white roof, side equipment shutters, roof ladder, hose reels, warning light bar and robust stylized wheels
Gameplay silhouette: highly readable emergency vehicle approximately 8 meters long
Constraints: no text, department names or logos
```

## 10. P1 - Dense city expansion

Mọi công trình trong mục này có tối thiểu 4 level. Tên file dùng hậu tố `_lv1` đến `_lv4`; mỗi level giữ bản sắc gốc và tăng dần quy mô, công suất, tiện ích công cộng, khả năng tự chủ năng lượng và chống chịu thiên tai.

| Họ công trình | Level 2 | Level 3 | Level 4 |
|---|---|---|---|
| Mixed-use | thêm 2 tầng và rooftop garden | tháp 14 tầng trên podium thương mại | tổ hợp hai tháp thông minh có refuge floor |
| Hotel | thêm conference wing | resort tower có sky garden | khách sạn tự chủ năng lượng và trung tâm sơ tán du lịch |
| Hospital | thêm inpatient tower | regional medical campus | advanced resilient medical city |
| University | thêm library và laboratories | research campus | innovation university có emergency research center |
| Wind turbine | turbine công suất lớn | cụm turbine có storage | offshore-grade smart turbine và grid stabilizer |
| Metro station | thêm entrance và elevator | interchange station | automated multimodal metro hub |
| Marina | thêm piers và service hall | passenger ferry terminal | resilient smart harbor có storm refuge |

### `01_residential/mixed_use_block.png`

```text
Primary request: six-storey mixed-use corner block, ground-floor shops with blank awnings, four residential floors with balconies, recessed rooftop apartments, white and terracotta facade modules, rear service access
Gameplay silhouette: L-shaped urban corner building, footprint approximately 26 by 26 meters
```

### `02_commercial/hotel.png`

```text
Primary request: twelve-storey waterfront hotel, slender curved tower, aqua glass balconies, white horizontal bands, warm timber podium, landscaped rooftop terrace and sheltered entrance drop-off
Gameplay silhouette: elegant tourism landmark without extravagant fantasy forms
```

### `03_services/hospital.png`

```text
Primary request: regional hospital campus, six-storey clinical main wing, lower emergency department, connecting glass atrium, rooftop helipad without helicopter, service/loading wing and healing garden terrace
Gameplay silhouette: large civic healthcare anchor, footprint approximately 44 by 36 meters
Constraints: medical cross allowed, no text
```

### `03_services/university.png`

```text
Primary request: modern urban university building, broad five-storey academic block around a green courtyard, central glass library volume, shaded colonnade, rooftop research greenhouse and lecture hall wing
Gameplay silhouette: prestigious horizontal campus landmark
```

### `04_utilities/wind_turbine.png`

```text
Primary request: clean contemporary three-blade wind turbine, tapered white tower, aqua nacelle accent, believable hub and maintenance access, simplified for distant city-builder readability
Gameplay silhouette: tall clean-energy landmark approximately 60 meters high
```

### `05_transport/metro_station.png`

```text
Primary request: compact above-ground metro station entrance, sculptural white canopy, aqua glass walls, twin escalator openings, elevator tower, bicycle parking and coral wayfinding panels without text
Gameplay silhouette: recognizable transit access pavilion, footprint approximately 18 by 12 meters
```

### `05_transport/marina.png`

```text
Primary request: modular urban marina asset, timber piers in a clean comb layout, small white harbor office, fuel dock without branding, safety ladders, mooring posts and one empty boat ramp
Gameplay silhouette: waterfront transport and leisure structure, footprint approximately 40 by 32 meters
Constraints: no boats, no water plane, no people
```

## 11. P1 - Landmark assets

Landmark cũng có 4 level, nhưng level thể hiện các giai đoạn thi công và mở rộng thay vì chỉ phóng to model: `lv1` là công trình nền tảng, `lv2` mở rộng công năng, `lv3` trở thành biểu tượng cấp vùng, `lv4` là phiên bản hoàn chỉnh cấp quốc tế. Tạo đủ bốn file cho từng Civic Tower, Ferris Wheel, Stadium và Airport Terminal ngay tại mục tương ứng.

### `10_landmarks/civic_tower.png`

```text
Primary request: original Haven City civic tower, 32-storey slender skyscraper with a gently tapering silhouette, white structural exoskeleton, aqua glass, coral sky-garden terraces and a glowing circular crown
Gameplay silhouette: memorable but believable city identity landmark, height approximately 140 meters
Constraints: original design, no resemblance to a famous real-world tower, no text or logo
```

### `10_landmarks/ferris_wheel.png`

```text
Primary request: modern waterfront observation wheel, white structural rim, coral support legs, enclosed aqua passenger cabins, compact entrance deck and clean mechanical hub
Gameplay silhouette: joyful leisure landmark approximately 55 meters high
Constraints: no people, no surrounding park, no text
```

### `10_landmarks/stadium.png`

```text
Primary request: medium-sized multi-purpose city stadium, oval white roof ring, teal translucent roof panels, coral structural braces, open corner concourses and a landscaped entrance plaza integrated into the base
Gameplay silhouette: major sports landmark, footprint approximately 90 by 72 meters
Constraints: no team branding, no words, no crowd
```

### `10_landmarks/airport_terminal.png`

```text
Primary request: compact regional airport terminal, sweeping white roof, aqua curtain-wall facade, coral wayfinding fins without text, three passenger gates, control tower and covered curbside drop-off
Gameplay silhouette: modular transport megaproject, terminal footprint approximately 90 by 36 meters
Constraints: no aircraft, no vehicles, no airport branding
```

## 12. P1 - Materials

Tạo mỗi prompt dưới đây và nối `GLOBAL TEXTURE BLOCK`.

### `11_materials/asphalt.png`

```text
Primary request: clean dark charcoal urban asphalt, fine aggregate, subtle tire wear and very restrained patch variation, maintained modern city condition
```

### `11_materials/concrete_sidewalk.png`

```text
Primary request: pale warm-gray concrete sidewalk slabs, narrow expansion joints, subtle aggregate and mild edge wear, clean maintained public realm
```

### `11_materials/red_roof_tile.png`

```text
Primary request: stylized coral-red ceramic roof tiles, orderly interlocking rows, gentle color variation, clean coastal architecture finish
```

### `11_materials/white_concrete.png`

```text
Primary request: off-white architectural precast concrete, very fine grain, subtle panel tonal variation, clean modern facade material
```

### `11_materials/blue_glass.png`

```text
Primary request: aqua-blue architectural glass facade panels, subtle roughness and faint cloudy sky tint, regular dark mullion grid; designed as a seamless game material
```

### `11_materials/grass.png`

```text
Primary request: healthy stylized urban lawn, fine short grass, gentle green tonal variation and sparse tiny clover shapes, no long blades or flowers
```

### `11_materials/water.png`

```text
Primary request: turquoise coastal water surface, small broad ripples, subtle depth color variation and sparse soft highlights, readable from an isometric camera
```

## 13. P1 - Weather and VFX reference

### `12_vfx/weather_reference.png`

```text
Use case: stylized-concept
Asset type: game VFX art-direction sheet
Primary request: the exact same small original city block shown in four panels under sunny morning, heavy rain, storm warning and post-flood recovery conditions
Style/medium: premium stylized 3D city-builder render
Composition/framing: identical elevated isometric camera and unchanged geometry in all four panels
Lighting/mood: clear readable gameplay lighting; rain streaks, wet surfaces, puddles, warning lights and receding water used carefully
Constraints: change only weather, lighting and surface effects between panels; no UI, no text, no logos, no watermark
Avoid: cinematic darkness that obscures gameplay, destruction porn, tornadoes, people in danger
```

## 14. P2 - UI artwork

### `13_ui/build_category_icons.png`

```text
Use case: stylized-concept
Asset type: premium city-builder UI icon sheet
Primary request: exactly eight distinct icons for roads, housing, commerce, public services, utilities, transportation, nature and demolition
Style/medium: chunky polished 3D icon renders, friendly readable silhouettes, white edge highlight, cohesive Haven City palette
Composition/framing: regular 4 by 2 grid, one centered icon per cell with generous padding, consistent viewing angle and scale
Background: plain medium gray for easy extraction
Constraints: no text, no letters, no logos, no watermark, no overlap
```

## 15. Cách đặt file và bàn giao

Giữ nguyên đúng tên file trong từng heading. Nếu công cụ tạo ảnh không làm tốt sheet năm góc nhìn, xuất riêng:

```text
house_lv1_front.png
house_lv1_back.png
house_lv1_left.png
house_lv1_right.png
house_lv1_iso.png
```

Khi tách nhiều ảnh, thêm câu này vào mọi prompt để khóa thiết kế:

```text
This is another synchronized view of the exact same asset. Preserve every dimension, opening, color, material, roof shape and accessory from the previous reference. Change only the camera to [VIEW].
```

Thứ tự nên tạo:

1. `00_style` để chốt phong cách.
2. Toàn bộ P0 theo đúng chuỗi level ngay trong từng mục: nhà dân 1–6, chung cư 1–5, mọi công trình còn lại tối thiểu 1–4.
3. P1 khi P0 đã đồng nhất.
4. Texture và UI sau khi model 3D đầu tiên đã được duyệt.

Không đưa ảnh toàn cảnh vào công cụ image-to-3D để tạo cả thành phố trong một model. Mỗi model cần pivot ở giữa đáy, kích thước theo mét, trục Y hướng lên, export `GLB`, texture PBR 2K, không gộp road/terrain vào building.
