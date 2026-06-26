export const SUPPLIERS = [
  {
    id: "F-001", name: "TechComposants SAS", sector: "Électronique", country: "France",
    certifications: ["ISO 9001", "RoHS"], minOrder: 500, leadTime: 7, score: 92,
    revenue: "12M€", employees: 85, founded: 2008,
    tags: ["PCB", "Capteurs", "Microcontrôleurs"], status: "Actif",
    contact: "contact@techcomposants.fr", website: "techcomposants.fr",
    reliability: 94, quality: 91, pricing: 78, flexibility: 88,
  },
  {
    id: "F-002", name: "MetalPro GmbH", sector: "Métallurgie", country: "Allemagne",
    certifications: ["ISO 9001", "ISO 14001"], minOrder: 1000, leadTime: 14, score: 87,
    revenue: "28M€", employees: 210, founded: 1995,
    tags: ["Acier inox", "Aluminium", "Usinage CNC"], status: "Actif",
    contact: "info@metalpro.de", website: "metalpro.de",
    reliability: 90, quality: 93, pricing: 65, flexibility: 72,
  },
  {
    id: "F-003", name: "PlastiForm Italia", sector: "Plastiques", country: "Italie",
    certifications: ["ISO 9001"], minOrder: 200, leadTime: 10, score: 74,
    revenue: "7M€", employees: 42, founded: 2013,
    tags: ["Injection plastique", "ABS", "Polycarbonate"], status: "Actif",
    contact: "info@plastiform.it", website: "plastiform.it",
    reliability: 76, quality: 75, pricing: 88, flexibility: 80,
  },
  {
    id: "F-004", name: "LogiTex Morocco", sector: "Textile industriel", country: "Maroc",
    certifications: ["OEKO-TEX"], minOrder: 300, leadTime: 21, score: 81,
    revenue: "5M€", employees: 130, founded: 2010,
    tags: ["Tissus techniques", "Cordage", "Sangles"], status: "Actif",
    contact: "sourcing@logitex.ma", website: "logitex.ma",
    reliability: 82, quality: 79, pricing: 92, flexibility: 85,
  },
  {
    id: "F-005", name: "ChemBase Poland", sector: "Chimie", country: "Pologne",
    certifications: ["ISO 9001", "REACH"], minOrder: 800, leadTime: 12, score: 68,
    revenue: "9M€", employees: 60, founded: 2016,
    tags: ["Résines", "Adhésifs", "Solvants"], status: "En évaluation",
    contact: "b2b@chembase.pl", website: "chembase.pl",
    reliability: 65, quality: 70, pricing: 85, flexibility: 60,
  },
  {
    id: "F-006", name: "PrecisionParts Taiwan", sector: "Électronique", country: "Taïwan",
    certifications: ["ISO 9001", "UL"], minOrder: 250, leadTime: 28, score: 89,
    revenue: "35M€", employees: 320, founded: 2001,
    tags: ["Connecteurs", "PCB", "Câbles"], status: "Actif",
    contact: "sales@precisionparts.tw", website: "precisionparts.tw",
    reliability: 91, quality: 92, pricing: 80, flexibility: 70,
  },
  {
    id: "F-007", name: "EcoPackage Spain", sector: "Emballage", country: "Espagne",
    certifications: ["FSC", "ISO 14001"], minOrder: 400, leadTime: 8, score: 77,
    revenue: "6M€", employees: 55, founded: 2014,
    tags: ["Carton recyclé", "Bioplastique", "Étiquettes"], status: "Actif",
    contact: "hello@ecopackage.es", website: "ecopackage.es",
    reliability: 79, quality: 76, pricing: 90, flexibility: 82,
  },
  {
    id: "F-008", name: "HydroTech Belgium", sector: "Hydraulique", country: "Belgique",
    certifications: ["ISO 9001", "CE"], minOrder: 600, leadTime: 15, score: 83,
    revenue: "18M€", employees: 95, founded: 2005,
    tags: ["Vannes", "Pompes", "Joints"], status: "Actif",
    contact: "procurement@hydrotech.be", website: "hydrotech.be",
    reliability: 85, quality: 87, pricing: 70, flexibility: 75,
  },
];

export const SECTORS = [
  "Tous", "Électronique", "Métallurgie", "Plastiques",
  "Textile industriel", "Chimie", "Emballage", "Hydraulique",
];

export const COUNTRIES = [
  "Tous", "France", "Allemagne", "Italie", "Maroc",
  "Pologne", "Taïwan", "Espagne", "Belgique",
];

export const SCORE_COLOR = (s) =>
  s >= 85 ? "#00C896" : s >= 70 ? "#C4A35A" : "#E05252";

export const CHART_COLORS = ["#00C896", "#C4A35A", "#5A8AB0", "#E05252"];
