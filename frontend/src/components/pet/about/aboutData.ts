import {
  Heart,
  HeartHandshake,
  ShieldCheck,
  Leaf,
  Sparkles,
  Home as HomeIcon,
  Activity,
  PawPrint,
  Droplets,
  Wind,
  LucideIcon,
} from 'lucide-react';

export interface SpeciesApproachItem {
  id: string;
  speciesVi: string;
  speciesEn: string;
  focusVi: string;
  focusEn: string;
  badgeVi: string;
  badgeEn: string;
  image: string;
  icon: LucideIcon;
  pointsVi: string[];
  pointsEn: string[];
}

export interface MilestoneItem {
  year: string;
  titleVi: string;
  titleEn: string;
  subtitleVi: string;
  subtitleEn: string;
  descVi: string;
  descEn: string;
  icon: LucideIcon;
}

export interface CoreValueItem {
  icon: LucideIcon;
  titleVi: string;
  titleEn: string;
  subVi: string;
  subEn: string;
  descVi: string;
  descEn: string;
  badgeVi: string;
  badgeEn: string;
}

export interface StatItem {
  val: string;
  labelVi: string;
  labelEn: string;
  subVi: string;
  subEn: string;
}

export interface ClinicZoneItem {
  id: string;
  titleVi: string;
  titleEn: string;
  descVi: string;
  descEn: string;
  image: string;
  highlightsVi: string[];
  highlightsEn: string[];
}

export interface FaqItem {
  qVi: string;
  qEn: string;
  aVi: string;
  aEn: string;
}

export const SPECIES_APPROACHES: SpeciesApproachItem[] = [
  {
    id: 'dog',
    speciesVi: 'Chó cảnh',
    speciesEn: 'Canine Care',
    focusVi: 'Thể chất, Dinh dưỡng & Vận động',
    focusEn: 'Physicality, Nutrition & Active Play',
    badgeVi: 'Năng động & Gắn kết',
    badgeEn: 'Energetic & Social',
    image: '/assets/images/hero_golden_retriever_1793177482877.jpg',
    icon: PawPrint,
    pointsVi: [
      'Khẩu phần giàu protein sạch, cân đối canxi & glucosamine bảo vệ sụn khớp theo từng giai đoạn phát triển.',
      'Thời gian vận động ngoài trời tối thiểu 45–60 phút mỗi ngày giúp giải phóng năng lượng và giữ tâm lý vui tươi.',
      'Chăm sóc nha khoa phòng ngừa cao răng, khám cơ xương khớp định kỳ cho các giống chó hiếu động.',
    ],
    pointsEn: [
      'Clean protein-rich nutrition balanced with glucosamine to protect joints across all life stages.',
      'At least 45–60 minutes of daily outdoor enrichment to relieve stress and sustain vitality.',
      'Preventive dental prophylaxis and routine musculoskeletal screenings for active breeds.',
    ],
  },
  {
    id: 'cat',
    speciesVi: 'Mèo cảnh',
    speciesEn: 'Feline Care',
    focusVi: 'Sức khỏe Thận, Vệ sinh & Môi trường sống',
    focusEn: 'Renal Wellness, Cleanliness & Low Stress',
    badgeVi: 'Tinh tế & Tĩnh lặng',
    badgeEn: 'Gentle & Tranquil',
    image: '/assets/images/about_fluffy_cat_1793177483392.jpg',
    icon: Droplets,
    pointsVi: [
      'Theo dõi sát chức năng thận và đường tiết niệu; khuyến khích uống nước qua hệ thống thác nước lọc ion luân phiên.',
      'Thiết kế không gian thẳng đứng (cat tree, bậc leo tường) tạo vùng an toàn riêng, hạn chế tối đa căng thẳng.',
      'Sử dụng cát vệ sinh hữu cơ tự nhiên không bụi nhằm ngăn ngừa bệnh viêm hô hấp và kích ứng da mẫn cảm.',
    ],
    pointsEn: [
      'Close renal and urinary monitoring with running filtered fountains to encourage optimal hydration.',
      'Vertical enrichment with climbing perches to provide private safe zones that reduce feline stress.',
      'Dust-free natural organic litter to prevent chronic respiratory issues and sensitive paw irritation.',
    ],
  },
  {
    id: 'rabbit',
    speciesVi: 'Thỏ cảnh',
    speciesEn: 'Rabbit Care',
    focusVi: 'Tiêu hóa Dạ dày đơn, Dinh dưỡng Chất xơ & Yên tĩnh',
    focusEn: 'Gut Motility, High Fiber & Calm Surroundings',
    badgeVi: 'Thảo mộc & Nhạy cảm',
    badgeEn: 'Herbivorous & Fragile',
    image: '/assets/aistudio/shop_promo_bunny.jpg',
    icon: Leaf,
    pointsVi: [
      'Khẩu phần 80% cỏ khô Timothy liên tục nhằm duy trì nhu động ruột và mài mòn răng cửa tự nhiên.',
      'Quy trình vệ sinh khô dịu nhẹ, tuyệt đối không tắm nước lạnh để bảo vệ lớp dầu tự nhiên và chống hạ thân nhiệt.',
      'Phòng khám cách âm hoàn toàn, bổ sung men vi sinh chuyên biệt phòng ngừa hội chứng liệt ruột (GI Stasis).',
    ],
    pointsEn: [
      '80% continuous Timothy hay diet to support delicate cecal fermentation and natural tooth wear.',
      'Gentle dry-clean grooming routines; strictly avoid water immersion to prevent shock and hypothermia.',
      'Sound-insulated exam suites with exotic probiotics to prevent life-threatening gastrointestinal stasis.',
    ],
  },
  {
    id: 'hamster',
    speciesVi: 'Hamster & Chuột lang',
    speciesEn: 'Hamsters & Guinea Pigs',
    focusVi: 'Chu kỳ Sinh học, Không gian Sống & Vận động',
    focusEn: 'Circadian Cycles, Habitat & Spinal Safety',
    badgeVi: 'Tí hon & Nhộn nhịp',
    badgeEn: 'Tiny & Nocturnal',
    image: '/assets/aistudio/shop_promo_hamster_centered.jpg',
    icon: Activity,
    pointsVi: [
      'Tôn trọng tuyệt đối tập tính hoạt động ban đêm, tránh đánh thức đột ngột làm rối loạn nhịp tim bé.',
      'Trang bị bánh xe chạy đường kính chuẩn (21–28cm) với mặt phẳng liền, bảo vệ cột sống không bị uốn cong.',
      'Lót chuồng giấy nén không bụi, không hương liệu nhân tạo kết hợp cát tắm sa mạc tự nhiên diệt khuẩn.',
    ],
    pointsEn: [
      'Full respect for nocturnal biological rhythms without disruptive daytime handling.',
      'Spacious, continuous-surface running wheels (21–28cm) ensuring zero spinal curvature.',
      'Dust-free fragrance-free paper bedding paired with natural desert bathing sand.',
    ],
  },
  {
    id: 'bird',
    speciesVi: 'Chim cảnh & Vẹt',
    speciesEn: 'Avian & Parrots',
    focusVi: 'Hô hấp Túi khí, Dinh dưỡng Đa dạng & Bay lượn',
    focusEn: 'Air-Sac Respiratory, Diverse Diet & Safe Flight',
    badgeVi: 'Thông minh & Tự do',
    badgeEn: 'Intelligent & Free',
    image: '/assets/aistudio/shop_promo_parrot.jpg',
    icon: Wind,
    pointsVi: [
      'Chế độ hạt hữu cơ phối trộn ngũ cốc nảy mầm và rau củ tươi giàu Vitamin A tăng cường đề kháng.',
      'Bảo vệ hệ hô hấp túi khí siêu nhạy cảm: tuyệt đối không khói bếp, khói thuốc lá hay hơi nóng chảo chống dính PTFE.',
      'Tắm nắng sớm 15 phút mỗi ngày kích hoạt hấp thụ Vitamin D3 tự nhiên, kèm đồ chơi gỗ mộc mài mỏ.',
    ],
    pointsEn: [
      'Organic seed blends enriched with sprouted grains and fresh vitamin-A rich vegetables.',
      'Strict respiratory safety protocol: zero exposure to kitchen smoke, aerosol sprays, or PTFE fumes.',
      '15 minutes of gentle morning sunshine for natural Vitamin D3 synthesis plus untreated wooden toys.',
    ],
  },
];

export const MILESTONES: MilestoneItem[] = [
  {
    year: '2012 - 2015',
    titleVi: 'Khởi nguồn',
    titleEn: 'The Inception',
    subtitleVi: 'Nền móng của sự thấu hiểu',
    subtitleEn: 'Foundation of Empathy',
    descVi:
      'Thành lập từ một phòng khám thú y ấm áp tại Sài Gòn, tiên phong chuẩn hóa quy trình khám nhẹ nhàng (Fear-Free) giúp thú cưng không còn nỗi ám ảnh khi đến gặp bác sĩ.',
    descEn:
      'Started as a warm veterinary clinic in Saigon, pioneering Fear-Free clinical protocols so pets feel comforted rather than frightened during medical exams.',
    icon: HeartHandshake,
  },
  {
    year: '2016 - 2020',
    titleVi: 'Phát triển',
    titleEn: 'Multi-Species Expansion',
    subtitleVi: 'Mở rộng hệ sinh thái đa loài',
    subtitleEn: 'Dedicated Care for Every Species',
    descVi:
      'Thành lập các chuyên khoa riêng cho Thỏ, Chuột cảnh và Mèo; đồng thời ra mắt tổ hợp Spa Thảo mộc tĩnh âm chuẩn y tế.',
    descEn:
      'Established dedicated small-pet wings for Rabbits, Hamsters, and Cats alongside a whisper-quiet botanical spa.',
    icon: Sparkles,
  },
  {
    year: '2021 - 2024',
    titleVi: 'Kết nối',
    titleEn: 'Community & Sanctuary',
    subtitleVi: 'Vì cộng đồng & Mái ấm mới',
    subtitleEn: 'Sanctuary & Lifelong Families',
    descVi:
      'Khởi xướng Quỹ cứu trợ & Nhà chung nhận nuôi phi lợi nhuận Animora Sanctuary, đồng hành cùng hơn 1.640 gia đình và kết nối thành công 480+ bé tìm thấy gia đình yêu thương.',
    descEn:
      'Launched the non-profit Animora Sanctuary, partnering with 1,640+ families and helping 480+ rescued companions find their forever loving homes.',
    icon: HomeIcon,
  },
  {
    year: '2025 & Hướng tới',
    titleVi: 'Tương lai',
    titleEn: 'The Sustainable Future',
    subtitleVi: 'Hệ sinh thái số & Bền vững',
    subtitleEn: 'Digital Wellness & Lifelong Welfare',
    descVi:
      'Hoàn thiện Sổ sức khỏe số cá nhân hóa, chuỗi cung ứng dinh dưỡng hữu cơ và lan tỏa lối sống trách nhiệm, văn minh vì phúc lợi trọn đời của thú cưng tại Việt Nam.',
    descEn:
      'Pioneering personalized digital health records, certified organic nutrition, and advocating progressive welfare standards across Vietnam.',
    icon: ShieldCheck,
  },
];

export const CORE_VALUES: CoreValueItem[] = [
  {
    icon: Heart,
    titleVi: 'TẬN TÂM',
    titleEn: 'DEVOTION',
    subVi: 'Chăm sóc bằng trọn vẹn tình thương',
    subEn: 'Care Rooted in Pure Empathy',
    descVi:
      'Mỗi bé thú cưng đều được nâng niu như một thành viên trong gia đình. Bác sĩ và chuyên viên tại Animora luôn giới hạn số lượng ca khám mỗi ngày để dành trọn thời gian lắng nghe, vỗ về và kiên nhẫn thấu hiểu từng cử chỉ nhỏ.',
    descEn:
      'Every pet is treated as cherished family. We consciously cap daily consultations so our veterinarians have ample unhurried time to listen, comfort, and understand.',
    badgeVi: '100% Khám êm dịu, không áp lực',
    badgeEn: '100% Fear-Free, gentle handling',
  },
  {
    icon: ShieldCheck,
    titleVi: 'MINH BẠCH',
    titleEn: 'TRANSPARENCY',
    subVi: 'Rõ ràng trong từng quyết định y khoa',
    subEn: 'Clarity in Every Clinical Step',
    descVi:
      'Mọi chi phí, phác đồ điều trị và kết quả chẩn đoán đều được giải thích cặn kẽ và cập nhật trực tiếp lên Sổ sức khỏe số. Ba mẹ luôn là người đồng hành chủ động, thấu suốt mọi lộ trình chăm sóc của con.',
    descEn:
      'Itemized estimates, detailed diagnostic explanations, and real-time updates to digital pet records. Pet parents always maintain full visibility before any procedure begins.',
    badgeVi: 'Báo giá trước · Không phụ phí ẩn',
    badgeEn: 'Upfront estimates · Zero hidden fees',
  },
  {
    icon: Leaf,
    titleVi: 'BỀN VỮNG',
    titleEn: 'SUSTAINABILITY',
    subVi: 'Vì môi trường & Phúc lợi động vật',
    subEn: 'For the Planet & Animal Welfare',
    descVi:
      'Ưu tiên 100% sữa tắm thảo mộc thuần chay tự nhiên phân hủy sinh học, thực phẩm dinh dưỡng hữu cơ và trích 5% lợi nhuận thường niên đóng góp vào Quỹ cứu trợ & nhận nuôi thú cưng vô gia cư.',
    descEn:
      '100% biodegradable vegan botanical care, certified organic pet food, and 5% of proceeds continuously dedicated to rescuing and rehoming abandoned pets.',
    badgeVi: 'Mỹ phẩm thuần chay · Quỹ cứu trợ 5%',
    badgeEn: 'Vegan botanical care · 5% Rescue fund',
  },
];

export const STATS: StatItem[] = [
  {
    val: '14+',
    labelVi: 'Năm đồng hành tận tụy',
    labelEn: 'Years of Dedicated Care',
    subVi: 'Từ năm 2012 đến nay',
    subEn: 'Since 2012',
  },
  {
    val: '1.640+',
    labelVi: 'Bé được chăm sóc mỗi năm',
    labelEn: 'Pets Cared for Annually',
    subVi: 'Được ba mẹ trao trọn niềm tin',
    subEn: 'Trusted by devoted pet parents',
  },
  {
    val: '480+',
    labelVi: 'Bé tìm thấy mái ấm trọn đời',
    labelEn: 'Rescued Pets Adopted',
    subVi: 'Qua Trạm cứu trợ Animora',
    subEn: 'Via Animora Rescue Sanctuary',
  },
  {
    val: '6',
    labelVi: 'Chuyên khoa chăm sóc đa loài',
    labelEn: 'Multi-Species Care Wings',
    subVi: 'Chó, Mèo, Thỏ, Hamster, Chim...',
    subEn: 'Dogs, Cats, Rabbits, Exotics...',
  },
];

export const CLINIC_ZONES: ClinicZoneItem[] = [
  {
    id: 'zone-exam',
    titleVi: 'Phòng khám Fear-Free Đa loài Cách âm',
    titleEn: 'Sound-Insulated Fear-Free Exam Suites',
    descVi:
      'Lối di chuyển và sảnh chờ tách biệt hoàn toàn giữa Chó, Mèo và Thú nhỏ. Mỗi phòng khám được trang bị hệ thống khuếch tán pheromone tự nhiên làm dịu thần kinh và bàn khám sưởi ấm 37.5°C chống lạnh bụng.',
    descEn:
      'Dedicated species-separated pathways so cats, rabbits, and small pets never cross paths with energetic dogs. Includes soothing natural pheromones and temperature-regulated exam surfaces.',
    image: '/assets/images/about_fluffy_cat_1793177483392.jpg',
    highlightsVi: [
      'Lối đi & sảnh chờ phân luồng Chó - Mèo - Thú nhỏ',
      'Bàn khám sưởi ấm 37.5°C êm ái chống giật mình',
      'Khuếch tán pheromone thảo mộc làm dịu thần kinh',
    ],
    highlightsEn: [
      'Species-separated lounges and private corridors',
      'Warm 37.5°C padded tables to prevent sudden chills',
      'Natural botanical calming pheromones diffused 24/7',
    ],
  },
  {
    id: 'zone-spa',
    titleVi: 'Tổ hợp Thủy trị liệu & Spa Thảo mộc Tĩnh âm',
    titleEn: 'Whisper-Quiet Hydrotherapy & Botanical Spa',
    descVi:
      'Sử dụng bồn sục vi bọt ozone loại bỏ vi khuẩn và tế bào chết mà không gây đau rát da. Kết hợp sữa tắm yến mạch hữu cơ và hệ thống buồng sấy tĩnh âm dưới 45dB, an toàn tuyệt đối cho thính giác nhạy cảm của các bé.',
    descEn:
      'Micro-bubble ozone hydrotherapy gently lifts dirt without friction, accompanied by certified organic oatmeal botanical shampoos and sub-45dB whisper-quiet drying suites.',
    image: '/assets/images/pet_spa_grooming_1793177484004.jpg',
    highlightsVi: [
      'Nước lọc RO ấm chuẩn nhiệt độ sinh học',
      'Tinh chất thảo mộc hữu cơ phân hủy sinh học',
      'Máy sấy lồng tĩnh âm êm dịu dưới 45dB',
    ],
    highlightsEn: [
      'Pure RO water calibrated to precise body temperature',
      '100% biodegradable organic herbal essences',
      'Whisper-quiet drying lounge running below 45dB',
    ],
  },
  {
    id: 'zone-grooming-lounge',
    titleVi: 'Khu Vệ Sinh & Thư Giãn Sau Spa',
    titleEn: 'Post-Spa Relaxation & Care Lounge',
    descVi:
      'Không gian chờ và thư giãn tách biệt theo loài có lọc khí tươi HEPA và kiểm soát độ ẩm, giúp các bé ổn định tâm lý trước và sau khi tắm sấy hoặc thăm khám.',
    descEn:
      'Species-separated relaxation lounges equipped with medical HEPA fresh-air exchange and humidity control to keep pets calm before and after grooming or checkups.',
    image: '/assets/images/hero_golden_retriever_1793177482877.jpg',
    highlightsVi: [
      'Phân khu riêng biệt giảm căng thẳng giữa Chó, Mèo & Thú nhỏ',
      'Khí tươi HEPA vô trùng lọc 12 lần/giờ',
      'Giám sát trực tiếp bởi đội ngũ chăm sóc trong giờ hành chính',
    ],
    highlightsEn: [
      'Species-separated calm zones for Dogs, Cats & Small Pets',
      'HEPA fresh air exchange 12 times per hour',
      'Direct supervision by care staff during clinic hours',
    ],
  },
  {
    id: 'zone-sterile',
    titleVi: 'Khu Chăm sóc Chuyên sâu & Phòng mổ Vô trùng',
    titleEn: 'Sterile Surgical Suites & Intensive Care',
    descVi:
      'Được thiết kế theo tiêu chuẩn phòng mổ áp lực dương của thú y quốc tế. Trang bị máy gây mê hô hấp Isoflurane chuyên dụng cho cả thú nhỏ sơ sinh, máy siêu âm màu 4D và hệ thống tiệt trùng đèn tia cực tím UV-C.',
    descEn:
      'Engineered to international positive-pressure veterinary surgical standards, featuring specialized Isoflurane anesthesia for fragile exotics and continuous UV-C air sterilization.',
    image: '/assets/images/adopt_french_bulldog_1793177483032.jpg',
    highlightsVi: [
      'Phòng mổ áp lực dương đạt chuẩn y khoa',
      'Gây mê hô hấp an toàn cho cả thú nhỏ dưới 500g',
      'Xét nghiệm sinh hóa & huyết học nhanh trong 15 phút',
    ],
    highlightsEn: [
      'Hospital-grade positive pressure operating theater',
      'Safe Isoflurane vaporizers calibrated for tiny exotics',
      'In-house diagnostic blood lab results within 15 mins',
    ],
  },
];

export const FAQS: FaqItem[] = [
  {
    qVi: 'Animora tiếp nhận thăm khám và chăm sóc những loài thú cưng nào?',
    qEn: 'Which species of pets does Animora provide care and treatment for?',
    aVi: 'Animora xây dựng chuyên khoa riêng biệt cho Chó cảnh, Mèo cảnh, Thỏ cảnh (Holland Lop, Mini Rex...), Hamster, Chuột lang (Guinea Pig), Chim cảnh & Vẹt, cũng như Rùa và các loài thú nhỏ đặc biệt.',
    aEn: 'Animora features dedicated care departments for Dogs, Cats, Rabbits, Hamsters, Guinea Pigs, Companion Birds & Parrots, as well as turtles and small exotics.',
  },
  {
    qVi: 'Làm thế nào để các bé thỏ, mèo hay chim không bị hoảng sợ khi gặp chó lớn?',
    qEn: 'How do you keep delicate pets calm and safe from larger dogs?',
    aVi: 'Chúng tôi thiết kế luồng di chuyển và sảnh chờ tách biệt hoàn toàn giữa các loài. Khu vực dành cho mèo và thú nhỏ luôn được cách âm, sử dụng ánh sáng vàng dịu và khuếch tán tinh dầu pheromone làm dịu tâm lý.',
    aEn: 'We engineered completely separate intake pathways and soundproofed lounges. Exotic and feline suites utilize warm ambient lighting and continuous soothing pheromones.',
  },
  {
    qVi: 'Quy trình nhận nuôi tại Animora Sanctuary diễn ra như thế nào?',
    qEn: 'What is the process to adopt a companion from Animora Sanctuary?',
    aVi: 'Tất cả các bé trước khi tìm nhà mới đều được khám sức khỏe tổng quát, tiêm phòng và tẩy giun đầy đủ. Quá trình nhận nuôi hoàn toàn phi lợi nhuận; ba mẹ chỉ cần chia sẻ điều kiện sống và cam kết đồng hành yêu thương.',
    aEn: 'Every rescued pet is fully health-checked, vaccinated, and microchipped. Adoption is strictly non-profit; applicants simply complete a home-readiness consultation and love pledge.',
  },
];

export const getSpeciesApproaches = (): SpeciesApproachItem[] => SPECIES_APPROACHES;
export const getMilestones = (): MilestoneItem[] => MILESTONES;
export const getCoreValues = (): CoreValueItem[] => CORE_VALUES;
export const getStats = (): StatItem[] => STATS;
export const getClinicZones = (): ClinicZoneItem[] => CLINIC_ZONES;
export const getFaqs = (): FaqItem[] => FAQS;
