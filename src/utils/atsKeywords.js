// atsKeywords.js
// PRODUCTION VERSION — cleaned and merged
// Source: Adzuna UK Jobs API (1,856 jobs analysed, 13/03/2026)
// Noise removed: location names, postcodes, brand names, recruiter filler, garbled text
// Next refresh: run adzuna-keyword-research.js monthly

// ─────────────────────────────────────────────────────────
// UK SYNONYM MAP
// Manually maintained — maps abbreviations/variants to canonical terms
// This is what makes us better than pure string matching
// ─────────────────────────────────────────────────────────
export const UK_SYNONYMS = {
  // Warehouse / Logistics
  'forklift': ['flt', 'fork lift', 'fork-lift', 'forklift truck', 'forklift driver', 'forklift operator', 'counterbalance forklift', 'counterbalance', 'reach truck', 'pallet truck', 'flt driver', 'forklift operative'],
  'stock control': ['stock management', 'inventory management', 'inventory control', 'stock replenishment', 'inventory'],
  'picking': ['order picking', 'pick and pack', 'picker packer', 'picker', 'packer', 'goods picking'],
  'packing': ['pack and despatch', 'packing and despatch', 'repacking', 'kitting'],
  'goods in': ['goods inward', 'goods receipt', 'goods receiving', 'inbound logistics', 'loading unloading', 'unloading'],
  'coshh': ['coshh trained', 'coshh awareness', 'chemical handling', 'hazardous substances'],
  'manual handling': ['manual handling trained', 'manual handling certificate', 'lifting operations', 'lifting'],
  'rf scanner': ['handheld scanner', 'barcode scanner', 'rf gun', 'scanning equipment'],
  'despatch': ['dispatch', 'despatching', 'dispatching', 'shipping'],
  'pallet': ['pallets', 'palletising', 'pallet jack', 'powered pallet truck'],
  'yard operative': ['yard-based', 'yard duties'],
  'sortation': ['sorting', 'sort'],

  // Manufacturing / Engineering
  'lean manufacturing': ['lean principles', 'lean methodology', 'lean production', '5s', 'five s', 'kaizen'],
  'six sigma': ['6 sigma', 'sigma methodology', 'process improvement', 'dmaic'],
  'quality control': ['qc', 'quality assurance', 'qa', 'quality inspection', 'quality inspector', 'quality checking', 'quality standards'],
  'assembly': ['assembly operative', 'assembly operatives', 'sub-assembly', 'subassemblies'],
  'production operative': ['production operatives', 'production operator', 'machine operative', 'machine operator'],
  'cad': ['computer aided design', 'autocad', 'solidworks', 'catia', '2d cad', '3d cad', 'mechanical design'],
  'plc': ['programmable logic controller', 'plc programming', 'plc software', 'plc controls', 'siemens plc', 'allen bradley', 'engineer plc'],
  'cnc': ['cnc machining', 'cnc operator', 'computer numerical control'],
  'preventive maintenance': ['planned maintenance', 'ppm', 'preventative maintenance', 'scheduled maintenance', 'maintenance engineer'],
  'control systems': ['control system', 'industrial control', 'automation engineer', 'automation solutions', 'controls engineer'],
  'robotics': ['robotic systems', 'robotic', 'automated', 'automation', 'electromechanical'],
  'batch production': ['batch', 'production environment', 'manufacturing environment'],
  'temp to perm': ['temp perm', 'temporary to permanent', 'temp-to-permanent'],

  // Healthcare / Care Work
  'nvq': ['national vocational qualification', 'nvq level 2', 'nvq level 3', 'qcf', 'diploma in care', 'nvq health social care'],
  'care certificate': ['care cert', 'care standards', 'care quality commission', 'cqc'],
  'medication administration': ['medication management', 'meds administration', 'administering medication', 'medicines'],
  'safeguarding': ['safeguarding adults', 'safeguarding children', 'child protection', 'adult protection'],
  'dementia care': ['dementia awareness', 'dementia training', 'memory care'],
  'personal care': ['personal hygiene', 'activities of daily living', 'adl'],
  'care plan': ['care planning', 'individual care plans', 'person-centred care', 'high-quality care'],
  'domiciliary care': ['domiciliary', 'home care', 'community care', 'surrounding areas'],
  'residential care': ['residential support', 'residential childcare', 'children homes', 'care home'],
  'mental health': ['mental health support', 'mental health worker'],
  'dbs check': ['dbs', 'enhanced dbs', 'disclosure barring service'],
  'manual handling certificate': ['manual handling training', 'people moving and handling'],
  'scrub nurse': ['scrub', 'theatre nurse', 'odp', 'nurse odp', 'operating department'],
  'phlebotomist': ['phlebotomy', 'blood tests', 'venepuncture'],
  'registered nurse': ['staff nurse', 'rn', 'rnld', 'rmn'],
  'healthcare assistant': ['hca', 'healthcare support', 'clinical support worker', 'support workers'],

  // Retail
  'till': ['pos', 'epos', 'point of sale', 'cash register', 'checkout', 'till operation'],
  'cash handling': ['cash management', 'cashing up', 'till reconciliation', 'float management'],
  'merchandising': ['visual merchandising', 'product display', 'planogram', 'shelf management'],
  'stock taking': ['stocktake', 'stock count', 'inventory count', 'cycle counting'],
  'customer service': ['customer care', 'client service', 'customer facing', 'customer relations', 'help customers', 'outstanding service'],
  'sales': ['selling', 'upselling', 'cross-selling', 'retail sales', 'sales targets', 'sales assistant', 'sales associate', 'sales associates'],
  'petrol station': ['forecourt', 'fuel station', 'petrol forecourt'],
  'betting shop': ['betting', 'bookmaker', 'bookmakers'],

  // Hospitality / Food
  'food hygiene': ['food safety', 'food hygiene certificate', 'level 2 food hygiene', 'food standards', 'high standards'],
  'food safety level 2': ['level 2 award in food safety', 'basic food hygiene', 'food hygiene certificate'],
  'allergen awareness': ['allergen training', 'food allergens', '14 allergens', 'allergen management'],
  'barista': ['coffee making', 'coffee preparation', 'espresso', 'barista skills', 'fresh coffee'],
  'cellar management': ['cellar work', 'beer lines', 'cellar duties', 'stock rotation'],
  'haccp': ['hazard analysis', 'food safety management', 'food safety system'],
  'kitchen assistant': ['kitchen staff', 'kitchen operative', 'back of house'],
  'bar staff': ['bar member', 'bar work', 'bartender', 'bar person'],

  // Security
  'sia licence': ['sia door supervisor', 'sia badge', 'security industry authority', 'door supervisor licence', 'sia', 'licence', 'door supervisor'],
  'cctv': ['cctv monitoring', 'cctv operation', 'surveillance', 'camera monitoring'],
  'conflict resolution': ['conflict management', 'de-escalation', 'incident management', 'keeping others safe'],
  'first aid': ['first aid certificate', 'first aid at work', 'emergency first aid', 'efaw', 'faw'],
  'security officer': ['security guard', 'security operative', 'security personnel'],

  // Office / Admin
  'microsoft office': ['ms office', 'office 365', 'microsoft 365', 'word', 'excel', 'powerpoint', 'outlook', 'teams'],
  'data entry': ['data input', 'data processing', 'database entry', 'keying data'],
  'scheduling': ['diary management', 'calendar management', 'appointment booking', 'rota management'],
  'minute taking': ['minutes', 'meeting notes', 'meeting minutes', 'secretarial'],
  'receptionist': ['front desk', 'meet greet', 'greet visitors', 'answer phone'],
  'administration': ['admin', 'administrator', 'administrative', 'admin assistant', 'office administrator', 'administration clerk'],

  // Mechatronics specific
  'mechatronics engineer': ['mechatronics apprentice', 'electromechanical engineer', 'automation engineer', 'controls engineer'],
  'field service engineer': ['field service', 'service engineer', 'field engineer'],
  'systems engineer': ['systems engineering', 'control systems engineer'],

  // Soft Skills (UK phrasing)
  'communication': ['communicator', 'communicating', 'verbal communication', 'written communication'],
  'teamwork': ['team player', 'team working', 'collaborative', 'working as part of a team'],
  'leadership': ['led', 'leading', 'lead a team', 'supervised', 'management experience'],
  'organisation': ['organized', 'organised', 'organisational skills', 'planning and organization'],
  'time management': ['punctual', 'meeting deadlines', 'deadline driven', 'time keeping'],
  'problem solving': ['problem-solving', 'analytical', 'solutions focused', 'troubleshooting'],
  'initiative': ['self-starter', 'proactive', 'self-motivated', 'own initiative', 'use initiative'],
  'attention to detail': ['detail oriented', 'detail-oriented', 'meticulous', 'accurate', 'thoroughness'],
  'adaptable': ['adaptability', 'flexible', 'versatile', 'able to adapt'],
  'reliability': ['reliable', 'dependable', 'trustworthy', 'consistent attendance', 'seeking reliable'],
};

// ─────────────────────────────────────────────────────────
// SECTOR KEYWORDS
// Cleaned from Adzuna data — noise removed:
//   ✗ recruiter filler: join, busy, leading, recruiting, location, client, key
//   ✗ company/brand names: gail, barchester, ramsay, stonegate, parkdean
//   ✗ location names: barrow-in-furness, se1, london
//   ✗ marketing copy: celebrate life, awakens senses, slug lettuce
//   ✗ postcodes and garbled text
// ─────────────────────────────────────────────────────────
export const SECTOR_KEYWORDS = {

  // 152 jobs analysed
  warehouse: [
    // Core role terms
    'warehouse operative', 'warehouse assistant', 'warehouse operator', 'yard operative',
    // Equipment
    'forklift', 'flt', 'counterbalance', 'forklift truck', 'reach truck',
    'powered pallet truck', 'pallet truck', 'rf scanner', 'barcode scanner',
    // Tasks
    'picking', 'packing', 'picker packer', 'goods in', 'goods out',
    'loading unloading', 'stock replenishment', 'sortation', 'kitting',
    'stock control', 'inventory', 'despatch', 'pallet', 'pallets',
    // Compliance
    'coshh', 'manual handling', 'health and safety', 'ppe',
    // Environment
    'immediate start', 'night shifts', 'rotating shifts', 'overtime available',
    'warehouse management system', 'wms', 'production operative',
  ],

  // 177 jobs analysed
  retail: [
    // Core role terms
    'sales assistant', 'shop assistant', 'retail assistant', 'sales associate',
    'store assistant', 'checkout operator',
    // Skills
    'customer service', 'cash handling', 'till', 'pos', 'epos',
    'stock taking', 'stock replenishment', 'merchandising', 'planogram',
    'sales targets', 'upselling', 'product knowledge',
    // Specific retail contexts
    'petrol station', 'forecourt', 'betting', 'bookmaker',
    'loss prevention', 'click and collect', 'fitting room',
    // Soft skills specific to retail
    'fast-paced', 'customer-facing', 'people skills',
  ],

  // 200 jobs analysed
  hospitality: [
    // Core role terms
    'kitchen assistant', 'bar staff', 'barista', 'bar member',
    'restaurant staff', 'front of house', 'back of house',
    // Skills and certifications
    'food hygiene', 'food safety', 'level 2 food hygiene', 'allergen awareness',
    'haccp', 'barista skills', 'table service', 'cellar management',
    // Tasks
    'cash handling', 'reservation systems', 'end of day', 'opening closing',
    'cleaning rota', 'mise en place', 'stock rotation',
    // Environment
    'high standards', 'fast-paced environment', 'flexible hours',
  ],

  // 174 jobs analysed
  careWork: [
    // Core role terms
    'care assistant', 'support worker', 'healthcare assistant',
    'domiciliary care', 'residential support', 'residential childcare',
    'childcare support',
    // Qualifications
    'nvq', 'care certificate', 'nvq level 2', 'nvq level 3', 'nvq health social care',
    'dbs', 'enhanced dbs',
    // Skills and tasks
    'personal care', 'care plan', 'medication administration',
    'safeguarding', 'mental health', 'manual handling',
    'dementia care', 'learning disabilities', 'challenging behaviour',
    // Context
    'domiciliary', 'residential', 'community care', 'young people',
    'children homes', 'adults', 'high-quality care',
    // Values
    'compassionate', 'person-centred', 'make a difference',
  ],

  // 14 jobs only — flagged as low confidence, needs more data next refresh
  security: [
    // Core role terms
    'security officer', 'door supervisor', 'security guard',
    // Essential qualifications
    'sia licence', 'sia', 'door supervisor licence',
    // Skills
    'cctv', 'cctv monitoring', 'access control', 'patrol',
    'conflict resolution', 'de-escalation', 'first aid',
    'incident reporting', 'radio communication', 'search procedures',
    // Context
    'risk assessment', 'lone working', 'night shifts', 'key holding',
    'fire safety', 'evacuation', 'keeping others safe',
  ],

  // 197 jobs analysed
  office: [
    // Core role terms
    'office administrator', 'admin assistant', 'receptionist',
    'administrative assistant', 'administration clerk',
    'front desk', 'data entry clerk',
    // Skills
    'microsoft office', 'excel', 'word', 'outlook', 'teams',
    'data entry', 'typing', 'scheduling', 'diary management',
    'minute taking', 'filing', 'greet visitors', 'answer phone',
    'meet greet', 'administrative support',
    // Systems
    'crm', 'sage', 'quickbooks', 'invoicing', 'purchase orders',
    // Compliance
    'data protection', 'gdpr', 'confidentiality',
    // Context
    'customer service', 'professional', 'organised',
  ],

  // 200 jobs analysed
  manufacturing: [
    // Core role terms
    'production operative', 'assembly operative', 'machine operator',
    'quality inspector', 'manufacturing operative',
    // Skills
    'quality control', 'quality assurance', 'quality standards',
    'assembly', 'machine operation', 'production line',
    // Standards and methodology
    'lean manufacturing', 'five s', 'kaizen', 'iso 9001',
    'batch production', 'continuous improvement', 'root cause analysis',
    // Environment
    'manufacturing environment', 'production environment',
    'night shifts', 'rotating shifts', 'temp to perm', 'overtime available',
    // Tools
    'components', 'machinery', 'tooling', 'blueprint reading',
  ],

  // 200 jobs analysed
  engineering: [
    // Core role terms
    'maintenance engineer', 'mechanical engineer', 'electrical engineer',
    'field service engineer', 'service engineer', 'design engineer',
    'senior engineer', 'lead engineer',
    // Disciplines
    'mechanical', 'electrical', 'electronic', 'control systems',
    'control instrumentation', 'hydraulics', 'pneumatics',
    // Tools and skills
    'cad', 'autocad', 'solidworks', 'plc', 'fault diagnosis',
    'commissioning', 'installation', 'technical drawings',
    // Certifications
    '18th edition', 'pat testing', 'first aid',
    // Methodology
    'preventive maintenance', 'project management', 'prince2',
    'health and safety', 'risk assessment',
  ],

  // 200 jobs analysed
  healthcare: [
    // Core role terms
    'healthcare assistant', 'staff nurse', 'registered nurse',
    'scrub nurse', 'theatre nurse', 'ward nurse',
    'phlebotomist', 'clinical support worker',
    // Qualifications
    'nmc registered', 'rn', 'nvq', 'care certificate',
    // Clinical skills
    'patient care', 'clinical', 'theatre', 'hospital',
    'ward', 'phlebotomy', 'medication administration',
    'infection control', 'ppe', 'safeguarding',
    // Context
    'nhs', 'private hospital', 'complex care', 'mental health',
    'high standard', 'patient-centred',
  ],

  // 342 jobs analysed — best dataset we have
  mechatronics: [
    // Core role terms
    'mechatronics engineer', 'automation engineer', 'controls engineer',
    'electromechanical engineer', 'systems engineer',
    'field service engineer', 'maintenance engineer',
    'mechatronics apprentice', 'technician',
    // Core technical skills
    'plc', 'plc programming', 'plc software', 'plc controls',
    'control systems', 'industrial control', 'automation',
    'robotics', 'robotic systems', 'automated systems',
    // Engineering disciplines
    'electrical', 'mechanical', 'electromechanical',
    'design', 'manufacturing', 'systems engineering',
    // Tools and software
    'cad', 'solidworks', 'software engineer',
    // Context
    'field service', 'commissioning', 'fault diagnosis',
    'maintenance', 'installation', 'projects', 'technical',
    'industrial', 'equipment', 'solutions',
  ],
};

// ─────────────────────────────────────────────────────────
// PART-TIME DETECTION SIGNALS
// ─────────────────────────────────────────────────────────
export const PART_TIME_SIGNALS = [
  'part-time', 'part time', 'flexible hours', 'flexible working', 'weekend',
  'evenings', 'evening shifts', 'morning shifts', 'shifts', 'rota', 'zero hours',
  'casual', 'temporary', 'seasonal', 'hours per week', 'bank staff',
  'term time', 'school hours', 'variable hours', 'ad hoc', 'as and when',
  'pro rata',
];

export const FULL_TIME_SIGNALS = [
  'full-time', 'full time', 'permanent', 'monday to friday', 'mon-fri',
  '37.5 hours', '40 hours', 'annual leave', 'pension', 'benefits package',
  'career progression', 'professional development', 'salary', 'per annum',
  'pension scheme', 'bank holidays',
];

// ─────────────────────────────────────────────────────────
// FORMAT SECTION DETECTION
// ─────────────────────────────────────────────────────────
export const FORMAT_SECTIONS = [
  { name: 'Contact', patterns: [/email|phone|mobile|tel|linkedin|address/i] },
  { name: 'Profile/Summary', patterns: [/profile|summary|personal statement|objective|about me/i] },
  { name: 'Experience', patterns: [/experience|employment|work history|career history|positions/i] },
  { name: 'Education', patterns: [/education|qualifications|academic|gcse|a-level|degree|university|college/i] },
  { name: 'Skills', patterns: [/skills|competencies|expertise|technical skills|key skills/i] },
];

// ─────────────────────────────────────────────────────────
// SOFT SKILLS
// ─────────────────────────────────────────────────────────
export const SOFT_SKILLS_LIST = [
  'communication', 'teamwork', 'leadership', 'problem solving', 'time management',
  'organisation', 'adaptable', 'initiative', 'attention to detail', 'reliability',
  'customer service', 'multitasking', 'prioritisation', 'resilience',
  'positive attitude', 'professional', 'punctual', 'motivated',
  'fast-paced', 'fast-paced environment', 'high standards', 'high quality',
];

// ─────────────────────────────────────────────────────────
// TRANSFERABLE SKILLS
// Phrases that appear across 3+ sectors — confirmed from Adzuna data
// CLEANED: removed recruiter filler, time formatting artifacts, brand names
// ─────────────────────────────────────────────────────────
export const TRANSFERABLE_SKILLS = [
  // Confirmed valuable across 5-7 sectors
  'customer service',       // 6 sectors
  'training development',   // 7 sectors
  'health safety',          // 5 sectors
  'high standards',         // 5 sectors
  'high quality',           // 6 sectors
  'fast-paced environment', // 5 sectors
  'immediate start',        // 7 sectors
  'overtime available',     // 5 sectors
  'driving licence',        // 5 sectors
  'pension scheme',         // 5 sectors
  'bank holidays',          // 5 sectors
  'training provided',      // 5 sectors
  'make a difference',      // cross-sector care/retail
  'supportive environment', // 5 sectors
  'friendly team',          // 5 sectors
  'young people',           // care/education
  'fixed term',             // employment type signal
  'pro rata',               // part-time pay signal
];

// ─────────────────────────────────────────────────────────
// IDF WEIGHTS
// Rebuilt manually using Adzuna frequency data as evidence
// Auto-generated IDF was unusable (full of location names, postcodes, garbled text)
//
// Scale: 3.2 = very rare/specific (FLT licence)
//        2.5 = sector-specific skill
//        2.0 = moderately specific
//        1.5 = common but relevant
//        1.0 = generic skill
//        0.5 = near-universal filler
// ─────────────────────────────────────────────────────────
export const IDF_WEIGHTS = {
  // ── Very high importance (confirmed rare & sector-specific from Adzuna data) ──
  'sia licence': 3.2,
  'flt': 3.2,
  'counterbalance': 3.1,
  'nvq level 3': 3.0,
  'food hygiene certificate': 2.9,
  'level 2 food hygiene': 2.9,
  'haccp': 2.8,
  'coshh': 2.8,
  'plc': 2.9,
  'plc programming': 2.9,
  'plc software': 2.9,
  'plc controls': 2.8,
  'six sigma': 2.8,
  'prince2': 2.7,
  'dbs': 2.6,
  'enhanced dbs': 2.7,
  'wms': 2.6,
  'sortation': 2.8,
  'kitting': 2.6,
  'phlebotomist': 2.9,
  'phlebotomy': 2.9,
  'scrub nurse': 2.8,
  'registered nurse': 2.7,
  'domiciliary care': 2.6,
  'residential childcare': 2.7,
  'mechatronics': 2.9,
  'electromechanical': 2.8,
  'robotic systems': 2.7,
  'control systems': 2.5,
  'allergen awareness': 2.6,
  '18th edition': 2.8,
  'pat testing': 2.5,

  // ── High importance (sector-specific, confirmed by Adzuna frequency) ──
  'forklift': 2.4,
  'forklift truck': 2.3,
  'forklift driver': 2.3,
  'pallet truck': 2.2,
  'reach truck': 2.3,
  'picker packer': 2.4,
  'picking': 2.1,
  'packing': 2.0,
  'stock control': 2.1,
  'inventory': 2.0,
  'care plan': 2.2,
  'personal care': 2.2,
  'manual handling': 2.0,
  'cash handling': 2.1,
  'food safety': 2.0,
  'quality inspector': 2.3,
  'assembly operative': 2.3,
  'quality control': 2.1,
  'quality assurance': 2.0,
  'lean manufacturing': 2.2,
  'maintenance engineer': 2.3,
  'field service engineer': 2.4,
  'automation engineer': 2.4,
  'mechatronics engineer': 2.9,
  'ia licence': 2.8,
  'door supervisor': 2.6,
  'cctv': 2.2,
  'data entry': 1.8,
  'first aid': 1.9,
  'microsoft office': 1.6,
  'nvq': 2.3,
  'care certificate': 2.2,

  // ── Medium importance (relevant but widely used) ──
  'customer service': 1.4,
  'sales assistant': 1.5,
  'kitchen assistant': 1.6,
  'care assistant': 1.7,
  'healthcare assistant': 1.7,
  'warehouse operative': 1.8,
  'production operative': 1.7,
  'barista': 1.9,
  'epos': 1.7,
  'till': 1.5,
  'pos': 1.4,
  'health and safety': 1.4,
  'safeguarding': 2.0,
  'risk assessment': 1.5,

  // ── Low importance (generic — confirmed filler by Adzuna cross-sector data) ──
  'communication': 0.8,
  'teamwork': 0.7,
  'organised': 0.6,
  'motivated': 0.5,
  'hardworking': 0.4,
  'passionate': 0.3,
  'enthusiastic': 0.3,
  'flexible': 0.6,
  'reliable': 0.7,
  'professional': 0.5,
  'fast-paced': 0.7,
  'high standards': 0.6,
  'training provided': 0.4,
};
