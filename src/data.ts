import type { Summary } from './ProjectParts'

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
  extra?: 'about' | 'education' | 'experience' | 'portal' | 'catalogue' | 'dimark' | 'candy'
  /** Card background / ink colour */
  bg: string
  ink: string
}

/** Project case studies — collected in a folder in the grid view. */
export const isProject = (tab: Tab) =>
  tab.extra === 'portal' || tab.extra === 'catalogue' || tab.extra === 'dimark' || tab.extra === 'candy'

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
    title: 'Wholesale Ops Portal',
    kind: 'Internal operations portal',
    year: '2026',
    url: 'ops-portal.internal',
    description:
      'The internal portal a London grocery wholesaler runs its day on: the customer map, label printing, supplier-order automation, order processing, credit control and the syncs that feed them, in one place. These are the modules I built or rebuilt inside it.',
    meta: [
      ['Role', 'Software Developer · full-stack'],
      ['Company', 'Dimark Limited'],
      ['Type', 'Internal operations portal'],
      ['Stack', 'Next.js · React · FastAPI · PostgreSQL · SQL Server · Playwright · MapLibre GL'],
    ],
    media: ['portal', 'detail', 'detail'],
    extra: 'portal',
    bg: '#dcecdf',
    ink: '#10231a',
  },
  {
    title: 'Catalogue Maker',
    kind: 'Print catalogue & PDF tools',
    year: '2026',
    url: 'catalogue-maker.internal',
    description:
      'The tools a London grocery wholesaler uses to turn its product database into a printed A4 catalogue: promotional flyers, product overlays filled from the price list, a page layout rendered in the browser, and a compression step that makes the finished PDF small enough to send.',
    meta: [
      ['Role', 'Software Developer · frontend-focused full-stack'],
      ['Company', 'Dimark Limited'],
      ['Type', 'Internal catalogue tooling'],
      ['Stack', 'Next.js · React · TypeScript · PostgreSQL · Cloudflare R2 · pdf-lib · sharp'],
    ],
    media: ['catalogue', 'detail', 'detail'],
    extra: 'catalogue',
    bg: '#f1e7d6',
    ink: '#2a1a10',
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

export const DIMARK = {
  subtitle: 'Redesigning a high-volume B2B ecommerce experience',
  summary: {
    problem: 'A catalogue of thousands of products behind a long, flat navigation, a cluttered homepage and product cards that were hard to scan for trade buyers.',
    built: 'A Shopify redesign: a clearer category and brand hierarchy, consistent product cards with pack and unit pricing, stronger merchandising and a more useful trade account.',
    result: 'A shorter path from discovery to add-to-order, for both browsing and repeat buyers.',
    stats: [
      ['2,000+', 'products'],
      ['850+', 'brands'],
    ],
  } as Summary,
  site: 'https://dimarkltd.co.uk',
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
    ['Scale vs. usability', 'Presenting the whole catalogue without overwhelming customers meant prioritising, not exposing every destination at once.'],
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
  summary: {
    problem: 'Broad categories with very long dropdowns, generic homepage carousels and product pages missing what wholesale buyers need to decide.',
    built: 'A restructured Shopify store: clear departments, format-led sub-collections, intent-led merchandising and a Quick Facts block on every product page.',
    result: 'Faster discovery for repeat orders and trend-led browsing alike, with stock and pack information visible before login.',
    stats: [
      ['503 → 337', 'products in Candy & Chocolate'],
      ['8', 'clear departments'],
    ],
  },
  context:
    'Candy Cargo supplies international confectionery, snacks, drinks and trending imported brands to convenience stores, supermarkets and independent retailers. Trends, flavours, pack formats and availability change constantly, so the store had to support two ways of buying.',
  behaviours: [
    ['Repeat purchasing', 'Buyers arriving for a specific brand — Takis, Fanta, Mogu Mogu — and wanting to reorder quickly.'],
    ['Trend-led discovery', 'Buyers browsing for new products that could perform well on their shelves.'],
  ],
  problem: [
    'Navigation relied on broad categories with very long dropdowns mixing brands, formats and product types. Candy & Chocolate alone held hundreds of products.',
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
    'One broad Candy & Chocolate collection for everything',
    'Homepage built on generic Featured Products carousels',
    'Linear product pages without a B2B summary',
  ],
  after: [
    'Consistent departments, from Grocery & Pantry to Vending Machine',
    'Candy & Chocolate narrowed down, with format-led sub-destinations',
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

export type PortalModule = {
  /** anchor and art key */
  id: 'map' | 'labels' | 'nisa' | 'orders' | 'credit' | 'sync'
  name: string
  /** my part of this module on the real portal */
  scope: string
  problem: string
  built: string[]
  notes: string[]
  stats?: [value: string, label: string][]
  /** screenshots from the public rebuild: [file in /assets/portal, caption] */
  shots: [file: string, caption: string][]
}

/**
 * Wholesale Ops Portal: one page for the internal portal and the modules inside it (the map,
 * Quick Label and Nisa used to be three separate tabs). Customer names, account codes and
 * amounts from the real system are left out on purpose; the screenshots are of the public
 * rebuild, whose company and data are invented.
 */
export const PORTAL = {
  subtitle: 'One portal for a wholesaler’s day',
  summary: {
    problem:
      'Each step of the business lived in a different tool: storefront orders that didn’t match what was picked, labels made by hand, supplier orders retyped from a portal, credit checked against ledger exports, and no picture of where customers were.',
    built:
      'Six modules inside one internal portal, on the same shared components: a customer and prospect map, label printing, supplier-order and invoice automation, the order processor, credit-control messaging, and the sync studio that feeds them all.',
    result:
      'The day’s operational work in one place, with a named person approving every step that touches stock or a customer’s money.',
    stats: [
      ['6', 'modules in one portal'],
      ['0', 'committing steps without a person approving'],
    ],
  } as Summary,
  rebuild: 'github.com/Gucera/Wholesale-Ops-Portal',
  rebuildNote:
    'The real portal is internal. The screenshots on this page come from Brambleway Ops, my public rebuild of the same modules on the same stack, around a fictional company with entirely generated data.',
  problem: [
    'A food wholesaler sells to hundreds of independent shops: grocers, off-licences, European and world-food stores. Orders come in through an online storefront and a supplier portal, get picked in the warehouse against the ERP, go out on the company’s own vans, and are paid on account, by card or cash on drop.',
    'Each step lived in a different tool, fed by jobs that mirror the ERP. The portal pulls that work into one place, with one look, and keeps a person in charge of every step that touches stock or money.',
  ],
  modules: [
    {
      id: 'map',
      name: 'Customer & prospect map',
      scope: 'Built end to end',
      problem:
        'Thousands of customers existed only as messy free-text addresses. Sales reps planned visits from memory, with no picture of where customers clustered or which nearby shops weren’t buying yet.',
      built: [
        'Every customer geocoded once and placed on its own building, searchable by name, address or postcode',
        'A prospects layer of independent food shops from open data: a heatmap when zoomed out, dots and buildings when zoomed in',
        'A 2D analytic view, a 3D clay model and a first-person street view',
        'Region and sales-rep reports, exported to Excel',
      ],
      notes: [
        'Free, open UK data only: no paid address or places APIs',
        'Terraces are sliced at house-number bisectors, so one click paints one shop',
        'A stable hash-ordered sample keeps dots from flickering while panning',
      ],
      stats: [
        ['22% → 68%', 'of customer shops placed on their exact building'],
        ['5.5 s', 'average lookup per address, down from several minutes'],
      ],
      shots: [
        ['map-3d-dark.webp', '3D mode in the rebuild: columns show where shops that aren’t customers cluster, dots are customers coloured by payment status.'],
        ['map-london.webp', 'Zoomed in, individual prospects appear, coloured by shop type.'],
      ],
    },
    {
      id: 'labels',
      name: 'Quick Label',
      scope: 'Built end to end',
      problem:
        'Some shops ask for their stock to arrive labelled. Staff worked out which orders needed labels, found the right label and quantity by hand, and sent it to the right printer.',
      built: [
        'Orders that need labels detected and matched to the label library, with counts worked out per case',
        'Missing labels, uncertain matches and odd quantities flagged for review before anything prints',
        'Single labels by search, or by scanning a barcode with a phone',
        'A print queue that follows each job to the warehouse PC, plus QR-linked pallet records',
      ],
      notes: [
        'Browsers can’t drive a thermal printer reliably, so a small Windows helper on each PC claims jobs and reports every stage',
        'Printer errors become instructions, like “media out: load a new roll”',
        'When a print result can’t be confirmed, it asks a person instead of printing again',
      ],
      stats: [
        ['848', 'products in the label library'],
        ['106', 'brands'],
      ],
      shots: [
        ['quick-label-printing.webp', 'An order matched to the label library, previewed at real proportions and printed, with the job’s timeline on the warehouse PC.'],
        ['single-label.webp', 'Single labels by search or barcode scan.'],
      ],
    },
    {
      id: 'nisa',
      name: 'Nisa Automation',
      scope: 'Built',
      problem:
        'Orders from a supplier portal with no API were copied out, reshaped in a spreadsheet and retyped into the internal system, often 50+ lines each. Every invoice draft was then corrected line by line to match what actually left the warehouse.',
      built: [
        'A Python and Playwright worker that reads each order the operator selects and validates every line',
        'Internal orders created only after approval, then read back and compared with the source',
        'Invoice drafts reconciled to real fulfilment and saved only when the totals match the ERP',
        'The final “send invoice” step left to a person, on purpose',
      ],
      notes: [
        'Fail closed: missing, ambiguous or inconsistent data stops the run instead of guessing',
        'Duplicate protection on every committing step',
        'A browser reporting success isn’t trusted; the result is re-read and checked',
      ],
      stats: [
        ['50+', 'lines per order, no longer retyped'],
      ],
      shots: [],
    },
    {
      id: 'orders',
      name: 'Order processor',
      scope: 'Frontend redesign · refunds list',
      problem:
        'The warehouse picks what’s on the shelf, not what was ordered. Someone had to edit each storefront order by hand so the customer was charged for what actually left the building.',
      built: [
        'Split a single 1,900-line page into five routed views with a side menu and shared state, keeping the existing API unchanged',
        'A refunds-to-issue list: paid, shipped orders whose lines were removed, with the refund due including VAT',
      ],
      notes: [
        'Each order line is compared between the ERP pick and the storefront, and every edit is planned before it’s applied',
        'One failing order never stops a batch',
        'Refunds are listed, never issued automatically, and what was already refunded is subtracted',
      ],
      shots: [
        ['order-processor.webp', 'The rebuild’s processor: queue, status filters, the selected order’s line-by-line diff and the refunds still to issue.'],
        ['refunds.webp', 'Removed minus already refunded, so a partial refund is never paid twice.'],
      ],
    },
    {
      id: 'credit',
      name: 'Credit Control & approved messages',
      scope: 'Frontend rebuild · customer messaging',
      problem:
        'The credit team’s real question was “who should I call before the van leaves?” Answering it meant cross-checking ledger exports against the day’s delivery sheets.',
      built: [
        'Most of the Credit Control frontend rebuilt on shared cards and design tokens, keeping its data and behaviour',
        'Account-balance WhatsApp messages with a pay-now link, previewed exactly before sending',
        'Today’s deliveries: each van’s drops with balances and alerts',
      ],
      notes: [
        'Nothing is sent until a named person approves it',
        'Accounts in credit are skipped, and an open payment link is reused instead of creating another',
        'Risk is shown as one plain-words label per account (“buying, not paying”), not a score',
      ],
      shots: [
        ['credit-overview.webp', 'Credit Control overview in the rebuild. Every name and amount is generated.'],
        ['message-review.webp', 'The review step: each message exactly as it will arrive, a confirmation tick and the approver’s name.'],
      ],
    },
    {
      id: 'sync',
      name: 'Sync studio',
      scope: 'Moved onto the shared components',
      problem:
        'Every other module reads data mirrored from the ERP. When a mirror job failed, nobody could see which step broke, what it had already written, or whether it was safe to run again.',
      built: [
        'The studio’s pages moved onto the portal’s shared components: each job drawn as a chain of stages, a terminal for the run’s log, and run history with retry',
      ],
      notes: [
        'The sync platform existed before I joined. The public rebuild also implements the engine, so the ideas can be read and run',
        'In the rebuild, one live run per job is enforced by a partial unique index, and a retry resumes from the stage that failed',
      ],
      shots: [
        ['sync-failed.webp', 'A six-stage product job in the rebuild. Stage 3 stopped on bad ERP data; earlier stages are kept, later ones skipped, and the terminal shows why.'],
        ['sync-runs.webp', 'Run history across every job: how far each run got, how long it took and what it wrote.'],
      ],
    },
  ] as PortalModule[],
  shell: {
    text: 'Every module sits on the same shared components and CSS tokens: cards, badges, tables, a dialog, toasts, and the same loading, empty and error states, so dark mode is a token swap and every page fails the same way. A Ctrl K switcher jumps to any page, customer, order or product.',
    shots: [
      ['switcher.webp', 'Ctrl K jumps to any page, customer, order or product.'],
      ['mobile-deliveries.webp', 'Phone width.'],
    ] as [string, string][],
  },
  architecture: [
    ['Frontend', 'Next.js App Router and React: one shell, a side menu per module, MapLibre GL for the map'],
    ['Backend', 'FastAPI with Pydantic: order logic, matching, geocoding, reports and print jobs'],
    ['Data', 'PostgreSQL for the portal’s own tables and the ERP mirror; SQL Server for the ERP itself'],
    ['Automation', 'A Python and Playwright worker for the supplier portal, in its own process'],
    ['Warehouse', 'A Windows print helper on each PC that claims label jobs and drives the thermal printer'],
    ['Integrations', 'Shopify GraphQL, WhatsApp Cloud API, payment links, and open UK geodata'],
  ] as [string, string][],
  decisions: [
    ['A person approves every committing step', 'Orders, invoices, messages and refunds are prepared by software and confirmed by a named person. The goal was safe automation, not maximum automation.'],
    ['Fail closed, and say why', 'When data is missing or ambiguous, the run stops before writing and shows the reason in plain words, rather than guessing.'],
    ['Verify the result, not the click', 'After an order is created, it is read back and compared with the source; invoices are saved only when totals match the ERP.'],
    ['Print through a helper', 'A helper on the warehouse PC claims jobs and reports each stage, and the page turns printer errors into instructions.'],
    ['Open map data, no API keys', 'MapLibre and open UK datasets instead of Google or Mapbox: no per-load billing, and Google’s terms forbid storing the place results a prospect layer needs.'],
    ['Refunds are listed, not issued', 'The processor records what is owed; a person issues it in the payment provider.'],
  ] as [string, string][],
  // ---- deep dives, from the old separate pages ----
  map: {
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
    challenges: [
      ['Most customers stuck at postcode level', 'Rate-limit errors were saved as “tried, not found”, so many addresses were never really searched.', 'Separate transient errors from real misses, retry with back-off, re-queue only what isn’t on a building.'],
      ['Minutes per lookup', 'One overloaded Overpass server, long timeouts, then a global pause.', 'Three servers in rotation, per-server exponential back-off, 20 s timeouts, cached postcodes. Down to 5.5 s.'],
      ['One click painted a neighbourhood', 'Vector tiles merge whole terraces into one feature.', 'Point-in-polygon selection, parcel clipping, house-number slicing and an area/distance guard.'],
      ['Holes in the dots', 'Over the row cap, the query returned rows in load order.', 'A stable hash-ordered sample spread evenly across the viewport.'],
      ['Map froze during bulk loads', 'A schema check waited on a table lock behind the loader.', 'Check the catalogue first, with a 3 s lock timeout before any change.'],
    ] as [string, string, string][],
  },
  labels: {
    repo: 'github.com/Gucera/Quick-Label',
    flows: [
      { label: 'Order-driven printing', steps: ['Order Data', 'Detection', 'Product Matching', 'Validation', 'Print Job', 'Windows Print Agent', 'Label Printer'] },
      { label: 'Mobile barcode printing', steps: ['Phone Barcode Scan', 'Product Lookup', 'Print Request', 'Assigned PC', 'Printer'] },
    ],
  },
  nisa: {
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
    flows: [
      { label: 'Order automation', steps: ['Supplier Portal', 'Order Extraction', 'Validation', 'Operator Approval', 'Internal Order Creation', 'Read-back Verification'] },
      { label: 'Invoice reconciliation', steps: ['Draft Invoice', 'Actual Fulfilment Data', 'Difference Detection', 'Corrections', 'Validation', 'Human Review'] },
    ],
  },
  orderCases: [
    ['Quantity mismatch', 'Picked a different quantity', 'Sets the storefront quantity to what was picked'],
    ['Price drift', 'Same item, different price', 'Sets the storefront price to the ERP price'],
    ['Out of stock', 'Ordered but nothing picked', 'Removes the line and lists it as an edge case; a refund is due on card orders'],
    ['Missing online', 'Picked but not ordered online', 'Adds the line'],
    ['Missing in ERP', 'Paid for online but never picked', 'Removes the line and lists it for a person to check'],
  ] as [string, string, string][],
  before: [
    'Storefront orders edited line by line after picking',
    'Label counts worked out per product, printing with no feedback',
    'Supplier orders retyped line by line, invoices fixed by hand',
    'Ledger exports cross-checked against delivery sheets',
    'Customer locations known only to the reps who visit them',
  ],
  after: [
    'Every order edit planned, a refunds list with what is still due',
    'Labels counted, previewed and tracked to the printer',
    'Supplier orders validated, approved, created and read back',
    'Today’s vans with each shop’s balance, and approved messages',
    'Customers and prospects on one map, with reports per region',
  ],
  role: [
    'I’m a junior full-stack developer in a two-person development team. On the real portal I built the customer map, Quick Label and the Nisa automation, rebuilt most of the Credit Control frontend and added its customer messaging, redesigned the order processor’s frontend and the shared components, and moved the Sync studio onto them.',
    'The platform itself, and parts of each module’s backend, existed before me or were written with my development manager, who reviews my pull requests. I work with an AI coding assistant and treat its output like any other code: I direct it, read it, test it and own the result.',
  ],
  next: [
    'A real spatial index for the map’s viewport queries',
    'Automated browser tests for the main flows: process a batch, print an order, approve a message run',
    'Server-side label rendering, so the preview and the print are the same bytes',
  ],
  learned:
    'Building the automation was the easy half. The harder question in every module was what the software should trust, what it should verify, and when it should stop and hand the decision to a person.',
  privacy:
    'Customer names, account codes, counts and amounts from the real system are left out. The map illustration is made up, and every name and figure in the screenshots is generated.',
}

export type CataloguePart = {
  id: 'flyers' | 'focals' | 'extract' | 'compact'
  name: string
  /** what it does, in a few words */
  tag: string
  text: string
  built: string[]
}

/**
 * Catalogue Maker: the catalogue tools inside the wholesaler's internal portal. Copy follows the
 * full-stack audit (2026-10-17): no measured-speed or hours-saved claims, the ~300 MB → ~30 MB
 * figure is the developer's own, and the October 2026 work is described as AI-assisted.
 */
export const CATALOGUE = {
  subtitle: 'From product database to a printable catalogue',
  summary: {
    problem:
      'A trade catalogue of around 2,500 products runs to 200+ A4 pages, with promotional flyers between the sections. Laying it out took manual work, and the exported PDF came to about 300 MB: too big to email or share.',
    built:
      'Four connected parts of the catalogue maker: Flyers (the promotional posters), Focals (product overlays filled from the price list), PDF Extract (the A4 layout, rendered in the browser) and Compact (server-side PDF compression).',
    result: 'The catalogue is laid out from the database, and Compact takes a typical catalogue PDF from about 300 MB to about 30 MB without touching text or vector graphics.',
    stats: [
      ['~2,500', 'products in one catalogue'],
      ['200+', 'A4 pages'],
      ['~300 → ~30 MB', 'catalogue PDF after Compact'],
      ['4', 'connected tools'],
    ],
  } satisfies Summary,
  context:
    'The wholesaler prints a catalogue for the independent shops it supplies: every product with its photo, pack size and price, grouped by category, with full-page promotional flyers in between. The products and prices already live in PostgreSQL, fed from the ERP, and the images and finished PDFs are kept in Cloudflare R2.',
  parts: [
    {
      id: 'flyers',
      name: 'Flyers',
      tag: 'Promotional posters inside the catalogue',
      text: 'A4 promotional posters that sit between the catalogue’s sections, stored in their own R2 bucket.',
      built: [
        'Upload from the computer with safe file names that never overwrite an existing flyer',
        'A flyer library with soft delete and restore, and a guard that blocks deleting a flyer a catalogue still uses',
        'A warning on flyers that feature products suspended in the ERP, worked out in SQL',
      ],
    },
    {
      id: 'focals',
      name: 'Focals',
      tag: 'Product overlays on a flyer',
      text: 'Staff place product boxes on a flyer: name, units, price, SKU and a QR code, all from database records.',
      built: [
        'Pick a SKU and the overlay fills name, units and prices from the price list',
        'Drag and resize with Pointer Events, snapping guides and layout presets',
        'Positions stored as 0–1 coordinates, so an overlay lands in the same place at any resolution',
        'A 40-step undo and redo history, keyboard shortcuts and an unsaved-changes guard',
      ],
    },
    {
      id: 'extract',
      name: 'PDF Extract',
      tag: 'The A4 catalogue, laid out in the browser',
      text: 'The whole catalogue rendered as A4 pages in the browser and printed to PDF, with a sidebar to configure it.',
      built: [
        'Page geometry in millimetres, with print CSS for an exact A4 result',
        'Page packing that lets small subcategories share a page and continue overleaf',
        'A page sequence for cover, contents, flyers, category covers and inserts, and a contents page numbered from it',
        'Grid, margins, bands, fonts and filters saved as versioned settings with debounced autosave',
        'A queued photo loader with retries, and a report that tells missing photos from failed downloads',
      ],
    },
    {
      id: 'compact',
      name: 'Compact',
      tag: 'Shrinking the finished PDF',
      text: 'A server-side service that recompresses each photo to the size it is actually printed at.',
      built: [
        'Browser upload with progress, to an authenticated route that checks the PDF signature and size',
        'Reads each image’s drawn size from the PDF content streams, then resamples it with pdf-lib and sharp',
        'Leaves text and vector graphics untouched; only photos are re-encoded',
        'A background job the page polls, multipart upload to R2 in 16 MB parts, and a one-time download',
      ],
    },
  ] as CataloguePart[],
  compactFlow: ['Upload with progress', 'Signature & size check', 'Background job', 'Measure drawn size', 'Resample photos', 'R2 multipart upload', 'Download'],
  extractFlow: ['Catalogue tree & prices', 'Pack pages', 'Build sequence', 'Number contents', 'Load photos', 'Print to PDF'],
  before: [
    'Pages arranged by hand around each category',
    'Product names and prices typed onto every flyer',
    'A finished PDF of about 300 MB, too big to send',
  ],
  after: [
    'Pages packed from the database, contents numbered from the final order',
    'Pick a SKU and the overlay fills itself from the price list',
    'Compact in the same portal: upload, wait, download about 30 MB',
  ],
  architecture: [
    ['Frontend', 'Next.js App Router, React and TypeScript (strict), Tailwind CSS, print CSS for the A4 pages'],
    ['Backend', 'Next.js route handlers with JWT cookie authentication and role checks'],
    ['Data', 'PostgreSQL: catalogue tree, products and prices from the ERP mirror, settings as JSONB'],
    ['Storage', 'Cloudflare R2 through the S3 API: images, documents and flyers in separate buckets'],
    ['PDF', 'pdf-lib to read and rewrite the PDF, sharp to resample and re-encode photos'],
  ] as [string, string][],
  decisions: [
    ['Lay out in the browser', 'The catalogue is HTML and CSS sized in millimetres, so what staff see while editing is what prints.'],
    ['Compress to the printed size', 'A photo drawn 4 cm wide doesn’t need a 4,000-pixel source, so Compact works out how big each image is on the page before resampling it.'],
    ['Store overlays as fractions', 'Focal positions are 0–1 of the flyer’s width and height, so the same layout works on screen, in the preview and in print.'],
    ['Never overwrite, soft delete', 'Flyers get unique names and deleted ones move aside, so a mistake can be undone and a catalogue never loses its artwork.'],
  ] as [string, string][],
  role: [
    'I’m a junior full-stack developer in a two-person development team; my development manager reviews my pull requests. The portal itself existed before I joined. Before October 2026 I built Flyers, Focals and the first version of PDF Extract.',
    'In October 2026 I extended PDF Extract and Flyers and built Compact with an AI coding assistant (Claude). I wrote the requirements, reviewed, rejected and accepted designs, and tested the output; the assistant wrote much of that code.',
  ],
  limits: [
    'Compression jobs live in the server’s memory: a restart loses a running job.',
    'Focal prices are captured when a product is placed, not re-read at print time.',
    'The editor and the export page are large single components, with their state kept locally.',
  ],
  next: [
    'Move compression jobs to a durable queue with the file streamed from storage',
    'Automated tests for page packing, contents numbering and compression',
    'Re-read focal prices at print time and save focals in one transaction',
  ],
  learned:
    'Print is unforgiving: a layout that looks right on screen still has to land on the exact millimetre on paper. Most of the work was making the page maths, the photos and the file size hold up for a 200-page document, not one page.',
  privacy:
    'The catalogue in the animation is an illustration: the company, products and prices are made up. The real catalogue and its data are internal.',
}
