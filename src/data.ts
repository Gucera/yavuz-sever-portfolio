export type Tab = {
  /** Big title on the card */
  title: string
  /** Short kind label, top right */
  kind: string
  /** Year / range, top right */
  year: string
  /** Fake address shown in the tab's URL bar */
  url: string
  /** Lead paragraph */
  description: string
  /** Label / value rows under the lead paragraph */
  meta: [label: string, value: string][]
  /** Labels for the media placeholders: [hero, detail, detail] */
  media: [string, string, string]
  /** Tab-specific layout rendered instead of the default body */
  extra?: 'about' | 'education' | 'experience' | 'case' | 'nisa' | 'map' | 'dimark' | 'candy'
  /** Card background / ink colour */
  bg: string
  ink: string
}

/** Project case studies — collected in a folder in the grid view. */
export const isProject = (tab: Tab) =>
  tab.extra === 'case' || tab.extra === 'nisa' || tab.extra === 'map' || tab.extra === 'dimark' || tab.extra === 'candy'

export const PROFILE = {
  name: 'Yavuz Selim Sever',
  role: 'software developer · london',
  email: 'yavuzslm057@gmail.com',
  cv: '/Yavuz_Selim_Sever_CV.pdf',
  socials: [
    ['GitHub', 'https://github.com/Gucera'],
    ['LinkedIn', 'https://www.linkedin.com/in/yavuz-sever-12361b190'],
    ['Instagram', 'https://www.instagram.com/yavuzselimsvr/'],
  ] as [label: string, url: string][],
}

// Reading order: first item sits at the front of the stack,
// each following tab is stacked behind the previous one.
export const TABS: Tab[] = [
  {
    title: 'About me',
    kind: 'Software Developer',
    year: 'London',
    url: 'yavuzselimsever.com/about',
    description:
      'I’m a Software Developer based in London, interested in building software that solves practical problems and makes complex workflows easier to use.',
    meta: [
      ['Based in', 'London, UK'],
      ['Role', 'Software Developer'],
      ['Focus', 'Frontend · Automation · Internal tools · Ecommerce'],
      ['Contact', PROFILE.email],
    ],
    media: ['portrait', 'detail', 'detail'],
    extra: 'about',
    bg: '#f2f2f2',
    ink: '#111111',
  },
  {
    title: 'Education',
    kind: 'BSc (Hons)',
    year: '2023 — 2026',
    url: 'uel.ac.uk/computer-science',
    description:
      'Completed a BSc (Hons) in Computer Science with First Class Honours, building a strong foundation across software engineering, web development, databases, networking, formal methods and real-time systems.',
    meta: [
      ['University', 'University of East London'],
      ['Degree', 'BSc (Hons) Computer Science'],
      ['Classification', 'First Class Honours'],
      ['Period', '2023 — 2026'],
      ['Location', 'London, UK'],
    ],
    media: ['campus photo', 'detail', 'detail'],
    extra: 'education',
    bg: '#5b2bff',
    ink: '#ffd6f2',
  },
  {
    title: 'Experience',
    kind: 'Software Developer',
    year: 'May 2026 — now',
    url: 'yavuzselimsever.com/experience',
    description: 'I build software around real operational problems.',
    meta: [
      ['Role', 'Software Developer'],
      ['Company', 'Dimark Limited'],
      ['Location', 'London, UK'],
      ['Period', 'May 2026 — Present'],
    ],
    media: ['workplace photo', 'detail', 'detail'],
    extra: 'experience',
    bg: '#e8e6df',
    ink: '#111111',
  },
  {
    title: 'Quick Label',
    kind: 'Internal operational software',
    year: '2026',
    url: 'quicklabel.dimark.internal',
    description:
      'An internal warehouse system that automates label-required order detection, product matching, print preparation, mobile barcode-triggered printing and pallet traceability.',
    meta: [
      ['Role', 'Software Developer'],
      ['Company', 'Dimark Limited'],
      ['Type', 'Internal Operational Software'],
      ['Stack', 'Python · FastAPI · Next.js · PostgreSQL · JavaScript · PowerShell'],
    ],
    media: ['project image', 'detail', 'detail'],
    extra: 'case',
    bg: '#ff4d1a',
    ink: '#111111',
  },
  {
    title: 'Nisa Automation',
    kind: 'Order & invoice automation',
    year: '2026',
    url: 'nisa-automation.internal',
    description:
      'A browser-automation system that reads wholesale orders from a supplier portal, validates every line, creates verified internal orders and reconciles invoices, with an operator approving every committing step.',
    meta: [
      ['Role', 'Software Developer'],
      ['Company', 'Dimark Limited'],
      ['Type', 'Internal Automation'],
      ['Stack', 'Python · Playwright · FastAPI · Next.js · PostgreSQL · SQL Server'],
    ],
    media: ['project image', 'detail', 'detail'],
    extra: 'nisa',
    bg: '#1a1a1a',
    ink: '#c6ff3d',
  },
  {
    title: 'UK Customer Map',
    kind: 'Geospatial full-stack',
    year: '2026',
    url: 'customer-map.internal',
    description:
      'A 2D/3D map of Great Britain inside a wholesale distributor’s internal portal. It puts customer shops on their actual building, overlays about 98,000 independent shops that aren’t customers yet, and turns both into region-by-region sales reports, using only free, open UK data.',
    meta: [
      ['Role', 'Product design · Full-stack development'],
      ['Type', 'Internal tool'],
      ['Stack', 'Next.js · MapLibre GL · FastAPI · PostgreSQL'],
      ['Data cost', '£0 · open data only'],
    ],
    media: ['map', 'detail', 'detail'],
    extra: 'map',
    bg: '#ece6da',
    ink: '#23212b',
  },
  {
    title: 'Dimark Online',
    kind: 'B2B ecommerce redesign',
    year: '2026',
    url: 'dimarkltd.co.uk',
    description:
      'A clearer, more commercially useful B2B storefront for a London wholesale distributor: better product discovery, transparent pack and unit pricing, stronger merchandising and a more capable trade account.',
    meta: [
      ['Company', 'Dimark Limited'],
      ['Platform', 'Shopify'],
      ['Scope', 'UX redesign · Theme development'],
      ['Live site', 'dimarkltd.co.uk'],
    ],
    media: ['storefront', 'detail', 'detail'],
    extra: 'dimark',
    bg: '#13235b',
    ink: '#ffffff',
  },
  {
    title: 'Candy Cargo',
    kind: 'Wholesale store restructure',
    year: '2026',
    url: 'candycargo.co.uk',
    description:
      'Turning a growing Shopify catalogue of international confectionery, snacks and drinks into a structured, energetic wholesale store — clearer categories, intent-led merchandising and product pages built for trade buyers.',
    meta: [
      ['Client', 'Candy Cargo'],
      ['Platform', 'Shopify'],
      ['Scope', 'IA · Navigation · Merchandising · Theme development'],
      ['Live site', 'candycargo.co.uk'],
    ],
    media: ['storefront', 'detail', 'detail'],
    extra: 'candy',
    bg: '#ff4fa3',
    ink: '#1a0b2e',
  },
]

export const EDUCATION = {
  highlight: { value: '79%', label: 'First Class Honours', note: 'Overall grade' },
  // Selected from the diploma supplement — only modules tied to the work I do now.
  marks: [
    ['Data Communications & Networks', 94],
    ['Web & Mobile App Development', 89],
    ['Software Development', 81],
    ['Database Systems', 81],
    ['Artificial Intelligence', 80],
  ] as [string, number][],
  areas: [
    'Software Development',
    'Data Structures & Algorithms',
    'Databases',
    'Computer Networks',
    'Web Development',
    'Mobile Development',
    'Formal Methods',
    'Blockchain / Distributed Applications',
    'Final Year Project',
  ],
}

export const EXPERIENCE = {
  story: [
    'At Dimark, my work sits between software engineering, warehouse operations, automation and ecommerce. Rather than working on one narrow part of the stack, I often follow a problem from the way it happens in the real world through to the software that eventually solves it.',
    'That can mean understanding how an order moves through the business, how warehouse staff interact with products, where repetitive manual work happens, or why an existing workflow becomes unreliable at scale. From there, I design and build tools that make those processes simpler, faster and easier to trust.',
  ],
  focus: [
    ['Operational software', 'Building tools around real warehouse and business workflows rather than isolated technical exercises.'],
    ['Automation with safeguards', 'Reducing repetitive work while keeping validation, visibility and human control where mistakes would matter.'],
    ['Frontend & product experience', 'Designing interfaces that make complex internal systems easier to understand and customer-facing experiences easier to use.'],
    ['Backend & data', 'Working with application logic, databases and integrations to connect systems and move information reliably.'],
    ['Ecommerce', 'Improving B2B storefronts around product discovery, usability and the way real customers browse and purchase.'],
  ] as [string, string][],
  stack: ['React', 'JavaScript', 'Python', 'FastAPI', 'Playwright', 'PostgreSQL', 'SQL Server', 'Next.js', 'Shopify', 'PowerShell', 'Git'],
  spans:
    'My work spans frontend interfaces, backend services, databases, browser automation, printing systems and B2B ecommerce, with a strong focus on software that is actually used day to day.',
  work: [
    'During my time at Dimark, I’ve worked on systems across warehouse automation, labelling, supplier-order processing, ecommerce and product discovery.',
    'I keep the technical detail, architecture and engineering decisions inside the individual project case studies.',
  ],
}

export type CaseStudy = {
  subtitle: string
  /** Repository link printed on the illustrated label (without https://) */
  repo?: string
  problem: string[]
  solution: string[]
  /** Each flow is a chain of steps; the first is the main workflow */
  flows: { label: string; steps: string[] }[]
  features: [title: string, text: string][]
  challenge: string[]
  safety: string[]
  architecture: [layer: string, text: string][]
  stats?: [value: string, label: string][]
  impact: string[]
  learned: string
}

export const CASE_STUDIES: Record<string, CaseStudy> = {
  'Quick Label': {
    subtitle: 'Warehouse Labelling & Product Tracking System',
    repo: 'github.com/Gucera/Quick-Label',
    problem: [
      'Product labelling was a repetitive and error-prone warehouse process. Staff had to identify which orders required labels, find the correct product labels, calculate quantities manually and send them to the right printer.',
      'The process became harder as product data, pack sizes, customer requirements and warehouse workflows became more complex.',
    ],
    solution: [
      'I built Quick Label to turn this manual workflow into a connected operational system.',
      'The system automatically detects orders that require labels, matches order lines to the correct label definitions, calculates the required quantities and flags uncertain cases for operator review before anything is printed.',
      'From there, staff can review and print the complete order through a controlled workflow.',
    ],
    flows: [
      {
        label: 'Order-driven printing',
        steps: ['Order Data', 'Detection', 'Product Matching', 'Validation', 'Print Job', 'Windows Print Agent', 'Label Printer'],
      },
      {
        label: 'Mobile barcode printing',
        steps: ['Phone Barcode Scan', 'Product Lookup', 'Print Request', 'Assigned PC', 'Printer'],
      },
    ],
    features: [
      ['Automatic Order Detection', 'Identifies orders requiring labels from multiple operational data sources.'],
      ['Product Matching', 'Matches order lines against stored label definitions using product and order data.'],
      ['Quantity Calculation', 'Handles pack sizes, unit types and partial quantities before printing.'],
      ['Human Review', 'Flags missing labels, suspicious matches and inconsistent quantities instead of guessing.'],
      ['Mobile Barcode Printing', 'Allows warehouse staff to scan a barcode from a phone and trigger a label on an assigned printing PC.'],
      ['Pallet Tracking', 'Creates QR-based pallet records linked to live product and warehouse information.'],
    ],
    challenge: [
      'The biggest challenge was not printing labels. It was making the system reliable when the underlying operational data was imperfect.',
      'Product descriptions could differ, pack sizes were not always represented consistently, and label instructions could appear in different places. I designed the workflow to fail safely and surface uncertainty rather than silently making assumptions.',
    ],
    safety: [
      'Quick Label was designed around controlled automation rather than blind automation.',
      'Duplicate imports, uncertain product matches and print-state ambiguity are handled explicitly. If the system cannot verify a result confidently, it requires human confirmation rather than automatically repeating the action.',
    ],
    architecture: [
      ['Mobile', 'Barcode scanning workflow for warehouse staff'],
      ['Frontend', 'Browser-based operator interface'],
      ['Backend', 'FastAPI handles order logic, matching, rendering and print jobs'],
      ['Data layer', 'PostgreSQL mirror of operational data'],
      ['Printing', 'Short-lived Windows print agent communicates with the thermal printer'],
    ],
    stats: [
      ['848', 'products'],
      ['106', 'brands'],
    ],
    impact: [
      'Supports a large internal product-label catalogue',
      'Reduced manual product-by-product label preparation',
      'Centralised order-driven label processing',
      'Enabled barcode-triggered warehouse printing',
      'Improved visibility through pallet-linked QR records',
    ],
    learned:
      'Quick Label changed the way I think about automation. A system is not reliable simply because it completes a task quickly. In operational software, reliability also means understanding uncertainty, preventing duplicate actions, exposing failure states and giving users control when the software cannot safely decide on its own.',
  },
}

export const NISA = {
  subtitle: 'Wholesale Order & Invoice Automation',
  demoRepo: 'github.com/Gucera/retail-order-automation',
  runLog: [
    ['run', '3 orders selected by operator'],
    ['ok', 'order extracted · 53 lines'],
    ['ok', 'codes, quantities and prices validated'],
    ['wait', 'awaiting operator approval'],
    ['ok', 'approved · duplicate check passed'],
    ['ok', 'internal order created'],
    ['ok', 'read-back matches source'],
    ['ok', 'invoice reconciled · Δ £0.00'],
    ['stop', 'send invoice → human action'],
  ] as [kind: 'run' | 'ok' | 'wait' | 'stop', text: string][],
  problem: [
    'Wholesale orders arrived through a supplier portal with no usable API. Staff copied each order by hand, reshaped it in a spreadsheet and retyped it into the internal order system — often 50+ lines per order.',
    'After delivery, every invoice draft had to be corrected line by line to match what actually left the warehouse. Slow, repetitive and easy to get wrong on a large account.',
  ],
  before: [
    'Copy the order out of the supplier portal',
    'Paste into a spreadsheet and split the columns',
    'Retype 50+ lines into the internal system',
    'Fix each invoice draft line by line',
    'Check totals by eye',
  ],
  after: [
    'Operator selects the orders to process',
    'Worker reads and validates every line',
    'Order created, then read back and compared',
    'Invoice draft reconciled to real fulfilment',
    'Final invoice submission stays human',
  ],
  flows: [
    {
      label: 'Order automation',
      steps: ['Supplier Portal', 'Order Extraction', 'Validation', 'Operator Approval', 'Internal Order Creation', 'Read-back Verification'],
    },
    {
      label: 'Invoice reconciliation',
      steps: ['Draft Invoice', 'Actual Fulfilment Data', 'Difference Detection', 'Corrections', 'Validation', 'Human Review'],
    },
  ],
  principles: [
    ['Fail Closed', 'If critical data is missing, ambiguous or inconsistent, the automation stops instead of guessing.'],
    ['Human Authorisation', 'Only explicitly selected and approved orders are allowed to reach committing actions.'],
    ['Duplicate Protection', 'Multiple safeguards prevent the same order from being processed twice.'],
    ['Read-back Verification', 'After order creation, the system re-reads the result and compares it with the original source.'],
    ['Controlled Invoicing', 'The system can prepare and reconcile invoice data, while the final invoice submission remains a human action.'],
  ] as [string, string][],
  architecture: {
    frontend: ['Frontend', 'Next.js interface for order selection, status and review'],
    backend: ['Backend', 'FastAPI service orchestrating automation runs and application logic'],
    worker: ['Automation Worker', 'Python + Playwright controlling the supplier portal in a separate worker process'],
    data: ['Operational Data', 'PostgreSQL for automation records and SQL Server for internal order/invoice data'],
    events: ['Run Events', 'Structured run output used for monitoring, auditing and recovery'],
  } as Record<string, [string, string]>,
  challenge: [
    'The hardest part was making automation trustworthy.',
    'Third-party portals can change, operational data is not always perfectly clean, and a browser action reporting success does not always mean the intended business action actually happened.',
    'I designed the workflow so every important step is validated independently. Instead of trusting the interface, the system verifies the underlying result and blocks the workflow when something cannot be confirmed.',
  ],
  safety: [
    'The system was designed around the assumption that external interfaces, user data and operational state can all be imperfect.',
    'Because of this, important actions are protected through operator approval, duplicate checks, validation rules, controlled write paths and explicit failure states.',
  ],
  safetyLine: 'The goal was not maximum automation. The goal was safe automation.',
  impact: [
    'Reduced repetitive manual order-entry work',
    'Standardised validation of incoming wholesale orders',
    'Added duplicate protection and read-back verification',
    'Reduced manual effort during invoice reconciliation',
    'Improved visibility into automation runs and failure states',
    'Preserved human control over high-risk actions',
  ],
  learned: [
    'This project taught me that automation becomes much more interesting when software is responsible for real operational decisions.',
    'Building the browser automation itself was only one part of the challenge. The harder problem was deciding what the system should trust, what it should verify, and when it should stop.',
    'It reinforced the importance of validation, idempotency, auditability and human oversight when integrating software with real business processes.',
  ],
}

export const DIMARK = {
  subtitle: 'Redesigning a high-volume B2B ecommerce experience',
  site: 'https://dimarkltd.co.uk',
  stats: [
    ['2,000+', 'products'],
    ['850+', 'brands'],
  ] as [string, string][],
  context:
    'Dimark’s catalogue spans thousands of products across international food, drinks, confectionery, household supplies, chilled goods and specialist brands. The site had to serve two very different customer behaviours.',
  behaviours: [
    ['Discovery', 'Customers browsing for trends, promotions and new products.'],
    ['Repeat ordering', 'Returning trade buyers who already know what they need and want to compare prices and build an order quickly.'],
  ] as [string, string][],
  problem: [
    'The old site exposed most categories in one long primary navigation and stacked country, brand and category directories on the homepage — many entry points, little hierarchy.',
    'A huge brand carousel, seasonal links and an intrusive newsletter popup competed with the core task of finding and evaluating products, and collection cards were hard to scan once a buyer was signed in.',
  ],
  goals: [
    'Easier browsing at category, subcategory and brand level',
    'Pack cost and unit economics easier to understand',
    'Shorter path from discovery to add-to-order',
    'Clear merchandising for new, best-selling and promoted products',
    'Consistent product cards, collections and detail pages',
    'A more useful dashboard for returning customers',
    'A responsive experience that stays practical on small screens',
    'Essential wholesale, delivery and service info preserved',
  ],
  before: [
    'Long navigation with seasonal links (October Offer, Halloween, Clearance)',
    'Countries, categories and an exhaustive brand directory as separate rows',
    'Collection cards led with variant selectors and generic actions',
    'Large brand carousel and intrusive newsletter popup',
  ],
  after: [
    'Cohesive navy, blue and orange visual system',
    'Category menus with nested subcategories and brands',
    'Homepage balancing promo hero, quick access and curated sections',
    'Cards with case price, unit price, SKU, stock, wishlist and add-to-cart',
    'A trade account dashboard instead of a plain order history',
  ],
  changes: [
    ['Clearer product economics', 'Cards show the full pack price and the calculated price per item, with pack quantity and SKU for repeat buyers.'],
    ['Faster catalogue browsing', 'Navigation reorganised around core categories; search with relevance sorting, price filters, direct actions and progressive loading.'],
    ['Stronger merchandising', 'New Products, Best Sellers, Promotions, featured brand showcases with previews and item counts, and editorial content.'],
    ['Improved product pages', 'Name, pack price, unit price, quantity, SKU and brand together, plus ingredients, nutrition, delivery and returns.'],
    ['A capable customer account', 'A dashboard for overview, orders and fulfilment states, addresses, company details and saved products.'],
    ['Responsive behaviour', 'Navigation collapses into a dedicated menu, listings become a two-column grid; prices and actions stay visible.'],
  ] as [string, string][],
  decisions: [
    'Pack and unit prices sit together, so buyers see order value and resale economics at once.',
    'Sold-out states stay on product cards, saving unnecessary product-page visits.',
    'Wishlists at catalogue and account level support buyers who research before ordering.',
    'Homepage merchandising is split by intent: discovery vs. a clear purchasing goal.',
    'WhatsApp and customer-service access were kept — the sales model mixes ecommerce with phone, messaging and warehouse support.',
  ],
  shopify: [
    'Collection & submenu navigation',
    'Reusable product cards',
    'Pack & unit pricing',
    'SKU & stock states',
    'Quick-add & wishlist',
    'Search filtering & sorting',
    'Progressive loading',
    'Product info accordions',
    'Related products',
    'Account navigation',
    'Addresses, company & saved items',
    'Promo / new / best-seller collections',
    'Blog & product-recall content',
    'Country & currency localisation',
    'Responsive catalogue & account',
  ],
  challenges: [
    ['Scale vs. usability', 'Presenting 2,000+ products and 850+ brands without overwhelming customers meant prioritising, not exposing every destination at once.'],
    ['Two shopping modes', 'Exploratory shopping and repeat wholesale ordering need different entry points but share the same pricing and stock data.'],
    ['Product-data completeness', 'Ingredients, nutrition, delivery rules and unit pricing only help when they are populated consistently and kept up to date.'],
  ] as [string, string][],
  impactNote: 'No analytics or commercial metrics were used — impact is described through observable changes to the customer experience.',
  impact: [
    'Products comparable by pack and unit price',
    'Fewer page transitions to add products',
    'Clearer visibility for promotions and new arrivals',
    'Stronger pathways into brands and categories',
    'Better support for saved products and repeat customers',
    'Account, address and company info in one dashboard',
    'A consistent visual and responsive system',
  ],
  learned: [
    'A B2B ecommerce redesign is not only a visual exercise. Buyers need commercial clarity, reliable operational information and efficient ways to work through a large catalogue.',
    'Showing unit economics at the point of discovery can be more valuable than adding promotional content — and a well-designed component is only as good as the product and policy data behind it.',
    'The strongest result came from treating navigation, merchandising, product information and account management as one connected customer journey rather than separate Shopify pages.',
  ],
}

export type StoreStudy = typeof DIMARK

export const CANDY: StoreStudy = {
  subtitle: 'Restructuring a wholesale confectionery store for faster product discovery',
  site: 'https://candycargo.co.uk',
  stats: [
    ['503 → 337', 'products in Candy & Chocolate'],
    ['8', 'clear departments'],
  ],
  context:
    'Candy Cargo supplies international confectionery, snacks, drinks and trending imported brands to convenience stores, supermarkets and independent retailers. Trends, flavours, pack formats and availability change constantly, so the store had to support two ways of buying.',
  behaviours: [
    ['Repeat purchasing', 'Buyers arriving for a specific brand — Takis, Fanta, Mogu Mogu — and wanting to reorder quickly.'],
    ['Trend-led discovery', 'Buyers browsing for new products that could perform well on their shelves.'],
  ],
  problem: [
    'Navigation relied on broad categories with very long dropdowns mixing brands, formats and product types. Candy & Chocolate alone held 503 products.',
    'The homepage used generic featured carousels that didn’t separate new arrivals, proven sellers and promotions. Product pages had useful data, but VAT, pallet size, barcodes, returns and delivery rules weren’t brought together for B2B buyers — and with prices restricted to registered customers, discovery had to stay useful without them.',
  ],
  goals: [
    'A clearer catalogue hierarchy',
    'Departments, product types and brands separated logically',
    'Trending products and commercial collections easier to find',
    'Product pages that work for wholesale buyers',
    'Clearer stock and pack information before login',
    'Stronger mobile filtering and browsing',
    'Trade-account pricing kept, without an unusable public catalogue',
    'A more distinctive, energetic visual identity',
  ],
  before: [
    'Candy & Chocolate, Drinks, Snacks Foods, Grocery… plus a generic “More Links”',
    'Dropdowns mixing categories with long brand directories',
    '503 products in one broad Candy & Chocolate collection',
    'Homepage built on generic Featured Products carousels',
    'Linear product pages without a B2B summary',
  ],
  after: [
    '8 consistent departments, from Grocery & Pantry to Vending Machine',
    'Candy & Chocolate narrowed to 337, with format-led sub-destinations',
    'New Products, New Tastes for Your Shelves, Best Sellers and Offers',
    'New, Sold Out and Back in Stock Soon states on every card',
    'A Quick Facts block with VAT, pallet, barcodes and returns',
  ],
  changes: [
    ['Rebuilt catalogue architecture', 'Departments separated from formats: Chocolate, Wafers, Gummy & Jelly, Chewy, Gum & Mints, Lollipops & Hard Candy.'],
    ['Intentional merchandising', 'New arrivals for trends, New Tastes for unfamiliar products, Best Sellers for reassurance, Offers for promo stock.'],
    ['Wholesale product information', 'Quick Facts: brand, category, VAT, SKU, units per case, unit weight, pallet size, returns, box and unit barcodes.'],
    ['Improved collection filtering', 'Availability, price, type and brand filters with sorting; Filter and Sort become standalone actions on mobile.'],
    ['Clearer stock communication', 'Cards distinguish new, available, sold-out and back-soon products, saving needless product-page visits.'],
    ['Visible customer actions', 'Search, WhatsApp, discounts, login and registration surfaced in the header; pricing stays trade-only.'],
  ],
  decisions: [
    'Category structure is the foundation: first what type of product, then brand filters for specific suppliers.',
    'Pricing stays behind account access, but public pages show pack quantity, stock, SKU, VAT and logistics so buyers can judge relevance before registering.',
    'Homepage merchandising is organised around purchase intent, not one generic featured block.',
    'Stock status sits directly on cards — availability matters most in a fast-moving imported catalogue.',
  ],
  shopify: [
    'Collections & navigation',
    'Multi-level department menus',
    'Collection landing points',
    'Brand & type filtering',
    'Homepage merchandising',
    'Badges & stock states',
    'New / best-seller / offer collections',
    'Tabbed product info',
    'VAT, pallet, barcode & returns data',
    'Warehouse pickup info',
    'Regional delivery content',
    'Same-brand discovery',
    'Wholesale login & registration',
    'Mobile collection grids',
    'WhatsApp & social integration',
  ],
  challenges: [
    ['Reorganising at scale', 'Hundreds of products per department had to move without making existing products harder to find.'],
    ['Imported product data', 'Pack sizes, barcodes, ingredients, allergens, nutrition, VAT and labels all need to be accurate and consistently structured.'],
    ['Account-only pricing', 'The public store still had to communicate value and availability without showing trade prices.'],
    ['Energy vs. scannability', 'An expressive, trend-aware identity that still keeps a high-volume catalogue easy to scan.'],
  ],
  impactNote: 'No analytics or sales data were supplied — impact is described through observable improvements to the customer experience.',
  impact: [
    'A more understandable product hierarchy',
    'New products, best sellers and offers easier to identify',
    'More useful operational data before login',
    'Filtering by availability, price, type and brand',
    'Stock status visible at catalogue level',
    'Stronger same-brand and related-product discovery',
    'A cleaner two-column catalogue on mobile',
    'A more distinctive, commercially relevant identity',
  ],
  learned: [
    'Wholesale ecommerce depends as much on structured product data as on visual design. A stronger product page cannot compensate for missing ingredients, nutrition or regulatory information.',
    'Separating catalogue architecture from brand directories lets customers browse confidently, while filters keep the flexibility to narrow by brand.',
    'The strongest result came from combining a more expressive identity with practical B2B information: stock, VAT, case quantities, pallet sizes and barcodes.',
  ],
}

export const ABOUT = {
  headline: 'Software that solves practical problems.',
  intro:
    'I enjoy working across frontend development, automation, internal tools and ecommerce, but what interests me most is understanding how a system actually works before deciding how to improve it.',
  howLine: 'I approach development from the problem backwards.',
  how: [
    'Before writing code, I try to understand the people using the system, where the friction is, what can go wrong, and what should remain under human control.',
    'That approach has shaped a lot of my recent work, from warehouse automation and order-processing systems to B2B ecommerce and product-discovery experiences.',
  ],
  values: [
    ['Useful software', 'I like building things that are actually used, not just technically interesting.'],
    ['Good judgement', 'I care about reliability, validation and knowing when software should stop rather than guess.'],
    ['Continuous improvement', 'I’m always trying to improve both my technical skills and the way I think about product and engineering decisions.'],
  ] as [string, string][],
  beyond:
    'Outside of software, I enjoy gaming and playing the drums. I also like exploring new tools, design ideas and technologies, especially when they change the way people interact with software.',
  closing:
    'I’m currently focused on growing as a Software Developer and working on products where I can contribute across engineering, product thinking and real-world problem solving.',
}

/** The surprise tab that shows up in the stack once every other tab has been closed. */
export const INCOGNITO = {
  title: 'Incognito',
  heading: 'Off the record',
  lead: 'You closed every tab, so the CV is out of sight. This private window is the part that doesn’t fit on a CV.',
  facts: [
    ['drum', 'Behind the kit', 'I play the drums. It’s how I switch off from a screen, and it keeps my timing honest.'],
    ['gamepad', 'Player two', 'I game a lot. Good games teach you their rules without a manual, and I try to build software that feels the same way.'],
    ['wrench', 'Side quests', 'I try new tools, design ideas and technology for fun, especially anything that changes how people use software.'],
    ['pin', 'Home base', 'London. I graduated from the University of East London with a First Class BSc (Hons) in Computer Science.'],
  ] as ['drum' | 'gamepad' | 'wrench' | 'pin', string, string][],
  hint: 'Want the tabs back? Press “undo” at the bottom of the screen, or reload the page.',
}

/**
 * UK Customer Map. Customer names, account codes, counts, locations and figures are left out on
 * purpose (internal data); percentages and open-data figures only. The map art is illustrative.
 */
export const UKMAP = {
  subtitle: 'Customer & Prospect Map',
  stats: [
    ['22% → 68%', 'of customer shops placed on their exact building'],
    ['94%', 'of building-level shops matched to a Land Registry parcel'],
    ['~98k', 'independent prospect shops loaded across the UK'],
    ['5.5 s', 'average lookup per address, down from several minutes'],
  ] as [string, string][],
  problem: [
    'The business sells groceries to small independent shops all over the UK. Its customer records only held free-text addresses typed in over many years: shop names mixed into street lines, unit numbers like “2C-1”, misspellings, and postal towns that aren’t the place the shop is actually in.',
    'Sales staff couldn’t see where customers clustered, which areas were under-served, or which shops nearby weren’t buying yet. The goal: a map a rep can open, fly to a street, click a building and see that shop’s account, plus every potential customer we weren’t reaching.',
  ],
  constraints: [
    ['No paid data', 'Royal Mail PAF, OS AddressBase and Google Places were ruled out on cost or licence terms.'],
    ['Core data is read-only', 'Business tables couldn’t change. Everything the map needs lives in its own tables.'],
    ['Development data only', 'All customer data came from a mirrored database, never the live trading system.'],
  ] as [string, string][],
  features: [
    ['2D analytic + 3D clay model', 'A calm 2D basemap for data, and a 3D mode that tilts the camera to 55° and raises buildings as white blocks, like an architect’s model.'],
    ['Customers on their building', 'Every customer is geocoded once and cached. Search by name, address or postcode flies to the shop and paints its building.'],
    ['Prospects layer', '~98,000 independent food shops that aren’t customers, sorted by type. A heatmap at country scale turns into dots and painted buildings as you zoom in.'],
    ['Street view walking mode', 'First person at 1.8 m eye height inside the 3D model: WASD to walk, drag to look, click a spot to walk there.'],
    ['Sales reports by region and rep', 'Customer counts, 30/90-day sales with change, balances and overdue debt, exported as an Excel workbook with native charts.'],
    ['Market-share reports', 'For any region: unserved shops by type, ward and postcode district, and our share of the local market.'],
  ] as [string, string][],
  pipeline: [
    ['Postcode centres first', 'Every postcode is resolved in bulk, so all customers appear on the map at once while slower building lookups run in the background.'],
    ['Parse the address', 'Split out shop name, premise, house number or range (“539–541”), street, locality and postal town; expand abbreviations.'],
    ['Ordered search attempts', 'Up to eight query shapes against Nominatim, from structured street + postcode to street-only, duplicates removed.'],
    ['Validate every hit', 'Within 2.5 km of the postcode, street similarity ≥ 0.85, house number must match. Only then does it count as a building.'],
    ['Fuzzy fallback', 'Nearby streets and numbers from Overpass are fuzzy-matched, which is how “Kingsly Road” becomes “Kingsley Road”.'],
    ['EPC → UPRN → coordinates', 'The government EPC register maps address text to a property’s UPRN, placed with OS Open UPRN coordinates.'],
    ['Parcel assignment', 'Building-level points are matched to their HM Land Registry parcel, which is what lets the map cut a terrace down to one shop.'],
  ] as [string, string][],
  // share of customer addresses at each precision, first run vs. pipeline v2
  precision: [
    ['First run', [22, 21, 55, 2]],
    ['Pipeline v2', [68, 21, 9, 2]],
  ] as [string, [number, number, number, number]][],
  slicing: [
    ['Point-in-polygon', 'Only the one polygon that contains the address point is used, never the whole tile feature.'],
    ['Parcel clipping', 'When the shop has its own Land Registry parcel, the building is clipped to it.'],
    ['House-number slicing', 'Otherwise the terrace is cut at bisectors between house-number labels and only the shop’s slice is painted.'],
    ['Safety guard', 'Too big or too far from the address? Show a pin and a ground ring instead. Wrong paint is worse than no paint.'],
  ] as [string, string][],
  zoom: [
    ['Below z10', 'heatmap from a cached grid count'],
    ['z10+', 'dots for the viewport, a stable sample of up to 8,000'],
    ['z14+', 'prospect shops painted on their building'],
    ['z16+', 'shops on screen queued for building-level lookup'],
  ] as [string, string][],
  architecture: {
    browser: ['Browser', 'Next.js + MapLibre GL: rendering, layers, terrace slicing, street view'],
    api: ['FastAPI backend', 'Address parser, geocoder, background workers, rate limits, reports, Excel export'],
    db: ['PostgreSQL', 'Read-only customer mirror + map-owned tables: geocodes, parcels, prospects'],
    tiles: ['Vector tiles', 'OpenFreeMap: OSM buildings, heights, house numbers · no API key'],
    open: ['Open UK data', 'Nominatim · Overpass · postcodes.io · EPC · OS Open UPRN · HMLR INSPIRE · FSA'],
  } as Record<string, [string, string]>,
  challenges: [
    ['Most customers stuck at postcode level', 'Rate-limit errors were saved as “tried, not found”, so many addresses were never really searched.', 'Separate transient errors from real misses, retry with back-off, re-queue only what isn’t on a building.'],
    ['Minutes per lookup', 'One overloaded Overpass server, long timeouts, then a global pause.', 'Three servers in rotation, per-server exponential back-off, 20 s timeouts, cached postcodes. Down to 5.5 s.'],
    ['One click painted a neighbourhood', 'Vector tiles merge whole terraces into one feature.', 'Point-in-polygon selection, parcel clipping, house-number slicing and an area/distance guard.'],
    ['Borough-shaped holes in the dots', 'Over the 8,000-row cap the query returned rows in load order.', 'A stable hash-ordered sample spread evenly across the viewport.'],
    ['Map froze during bulk loads', 'A schema check waited on a table lock behind the loader.', 'Check the catalogue first, with a 3 s lock timeout before any change.'],
  ] as [string, string, string][],
  data: [
    'A streaming loader scanned 41.7 million OS Open UPRN rows and kept only the ~4 million near customer postcodes, instead of loading the whole country.',
    'Land Registry parcels downloaded only for the councils that have a building-level customer.',
    'Every derived row carries a geocoder or classifier version, so a rule change re-processes only what it affects.',
  ],
  limits: [
    'OSM house numbers are patchy on many UK streets, so about a fifth of customers stay at street level. AddressBase would close most of that gap, but it’s paid.',
    'Land Registry parcels cover England and Wales only; Scottish shops fall back to slicing or a pin.',
    'Next: a monthly OSM refresh, Overture Places as an extra prospect source, and route planning for sales visits.',
  ],
  privacy: 'Customer names, account codes, counts, locations and financial figures are left out. The map here is an illustration, not real data.',
}
