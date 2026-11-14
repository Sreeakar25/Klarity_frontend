import { useMemo, useState } from 'react'
import {
  ArrowUpRight,
  Check,
  Copy,
  Download,
  Image,
  Images,
  Layers,
  Palette,
  Plus,
  Sparkles,
  Type,
  Upload,
} from 'lucide-react'
import { useApp } from '../context/AppContext'
import { BrandMark } from '../components/BrandMark'
import { Button, Drawer, EmptyState, Panel, Segmented } from '../components/UI'
import { cx } from '../lib/utils'

const swatches = [
  { name: 'Cream', hex: '#F6F1E6' },
  { name: 'Brown / Ink', hex: '#3B2418' },
  { name: 'Klarity Blue', hex: '#298EE4' },
  { name: 'Clay', hex: '#A97A32' },
  { name: 'Paper', hex: '#FBF8F1' },
  { name: 'Blue wash', hex: '#D7EAFB' },
]

function LogoPlate({ dark = false }) {
  return (
    <svg viewBox="0 0 320 200" className="asset-svg" role="img" aria-label="Aster & Oak logo lockup">
      <rect width="320" height="200" fill={dark ? '#3B2418' : '#F6F1E6'} />
      <g transform="translate(24 58)">
        <path
          d="M24 0c9.1 0 16.5 8.7 16.5 19.3C40.5 32.7 33 41 24 41S7.5 32.7 7.5 19.3C7.5 8.7 14.9 0 24 0Z"
          fill="#298EE4"
        />
        <path d="M19 10h4.1v21H19V10Zm3.8 9.7 6.6-9.7h5.2l-8.1 10.3 8.8 10.7h-5.4L23 20.6v-.9Z" fill="#F6F1E6" />
      </g>
      <text x="76" y="102" fill={dark ? '#F6F1E6' : '#3B2418'} className="asset-svg__wordmark">
        Aster &amp; Oak
      </text>
      <text x="24" y="168" fill={dark ? '#B9C3B4' : '#5F675C'} className="asset-svg__caption">
        PRIMARY LOCKUP · HORIZONTAL
      </text>
    </svg>
  )
}

function MonogramPlate() {
  return (
    <svg viewBox="0 0 320 200" className="asset-svg" role="img" aria-label="Aster and Oak monogram">
      <rect width="320" height="200" fill="#FBF8F1" />
      <circle cx="160" cy="88" r="54" fill="#3B2418" />
      <text x="160" y="101" textAnchor="middle" fill="#F6F1E6" className="asset-svg__monogram">
        A&amp;O
      </text>
      <text x="160" y="170" textAnchor="middle" fill="#5F675C" className="asset-svg__caption">
        MONOGRAM · DIGITAL ONLY
      </text>
    </svg>
  )
}

function PalettePlate() {
  return (
    <svg viewBox="0 0 320 200" className="asset-svg" role="img" aria-label="Aster and Oak colour palette">
      <rect width="320" height="200" fill="#FBF8F1" />
      {swatches.slice(0, 4).map((swatch, index) => (
        <g key={swatch.hex}>
          <rect x={20 + index * 71} y="36" width="58" height="88" rx="6" fill={swatch.hex} />
          <text x={20 + index * 71} y="145" fill="#5F675C" className="asset-svg__caption">
            {swatch.name}
          </text>
          <text x={20 + index * 71} y="160" fill="#3B2418" className="asset-svg__hex">
            {swatch.hex}
          </text>
        </g>
      ))}
      <text x="20" y="186" fill="#5F675C" className="asset-svg__caption">
        CORE PALETTE · V2.1
      </text>
    </svg>
  )
}

function TypePlate() {
  return (
    <svg viewBox="0 0 320 200" className="asset-svg" role="img" aria-label="Aster and Oak typography">
      <rect width="320" height="200" fill="#F6F1E6" />
      <text x="22" y="112" fill="#3B2418" className="asset-svg__aa">
        Aa
      </text>
      <text x="150" y="58" fill="#3B2418" className="asset-svg__type-name">
        Bricolage Grotesque
      </text>
      <text x="150" y="78" fill="#5F675C" className="asset-svg__caption">
        DISPLAY · 700 / 800
      </text>
      <text x="150" y="112" fill="#3B2418" className="asset-svg__type-name asset-svg__type-name--body">
        Manrope
      </text>
      <text x="150" y="132" fill="#5F675C" className="asset-svg__caption">
        UI &amp; BODY · 400–700
      </text>
      <text x="22" y="176" fill="#3B2418" className="asset-svg__sentence">
        Fewer pieces. Kept longer.
      </text>
    </svg>
  )
}

function CampaignPlate({ variant = 1 }) {
  if (variant === 2) {
    return (
      <svg viewBox="0 0 320 200" className="asset-svg" role="img" aria-label="The washed edge campaign plate">
        <rect width="320" height="200" fill="#3B2418" />
        <path d="M206 0h114v200H182c22-31 27-62 22-96-3-24 3-59 2-104Z" fill="#298EE4" opacity=".65" />
        <path d="M218 0v200M236 0v200M254 0v200M272 0v200" stroke="#F6F1E6" strokeOpacity=".14" />
        <text x="22" y="70" fill="#F6F1E6" className="asset-svg__campaign">
          The washed
        </text>
        <text x="22" y="98" fill="#F6F1E6" className="asset-svg__campaign">
          edge.
        </text>
        <text x="22" y="174" fill="#B9C3B4" className="asset-svg__caption">
          AUTUMN CAMPAIGN · 2026
        </text>
      </svg>
    )
  }
  if (variant === 3) {
    return (
      <svg viewBox="0 0 320 200" className="asset-svg" role="img" aria-label="Oak and linen campaign plate">
        <rect width="320" height="200" fill="#FBF8F1" />
        <path d="M38 172V83c0-28 22-50 50-50h36v139H38Z" fill="#DDE5D6" />
        <path d="M124 172V70h74v102h-74Z" fill="#A97A32" opacity=".84" />
        <circle cx="240" cy="98" r="46" fill="#298EE4" />
        <path d="M80 96h52M80 116h34" stroke="#3B2418" strokeWidth="1.4" />
        <text x="22" y="188" fill="#3B2418" className="asset-svg__campaign asset-svg__campaign--small">
          Oak &amp; linen
        </text>
      </svg>
    )
  }
  return (
    <svg viewBox="0 0 320 200" className="asset-svg" role="img" aria-label="A slower morning campaign plate">
      <rect width="320" height="200" fill="#F6F1E6" />
      <path
        d="M186 14c40-5 76 14 92 43 17 31 11 69-15 93-27 25-67 31-101 17-34-14-55-44-51-78 3-30 24-56 49-68 9-4 18-6 26-7Z"
        fill="#298EE4"
      />
      <path d="M62 58h68M62 72h44M62 86h58" stroke="#3B2418" strokeWidth="1.4" />
      <text x="22" y="138" fill="#3B2418" className="asset-svg__campaign">
        A slower
      </text>
      <text x="22" y="164" fill="#3B2418" className="asset-svg__campaign">
        morning.
      </text>
      <text x="224" y="178" fill="#F6F1E6" className="asset-svg__caption asset-svg__caption--light">
        SPRING / 26
      </text>
    </svg>
  )
}

function SocialPlate() {
  return (
    <svg viewBox="0 0 240 300" className="asset-svg" role="img" aria-label="Social template">
      <rect width="240" height="300" fill="#3B2418" />
      <circle cx="168" cy="100" r="74" fill="#298EE4" />
      <path d="M0 232c48-38 91-48 128-30 32 16 68 19 112 6v92H0v-68Z" fill="#F6F1E6" />
      <text x="22" y="52" fill="#F6F1E6" className="asset-svg__caption asset-svg__caption--light">
        @ASTERANDOAK
      </text>
      <text x="22" y="196" fill="#F6F1E6" className="asset-svg__campaign asset-svg__campaign--social">
        Keep
      </text>
      <text x="22" y="220" fill="#F6F1E6" className="asset-svg__campaign asset-svg__campaign--social">
        the good
      </text>
      <text x="22" y="244" fill="#F6F1E6" className="asset-svg__campaign asset-svg__campaign--social">
        things.
      </text>
      <text x="22" y="282" fill="#3B2418" className="asset-svg__caption">
        4:5 · STORY TEMPLATE
      </text>
    </svg>
  )
}

const assets = [
  {
    id: 'logo-primary',
    title: 'Primary lockup',
    kind: 'logos',
    type: 'SVG',
    size: '18 KB',
    updated: '12 Nov 2026',
    description: 'The default horizontal lockup. Cream and ink versions are approved for digital and print.',
    render: (large) => <LogoPlate dark={large} />,
  },
  {
    id: 'logo-mono',
    title: 'Monogram',
    kind: 'logos',
    type: 'SVG',
    size: '9 KB',
    updated: '08 Nov 2026',
    description: 'Reserved for the mark, social avatars, and small placements. Never use it to replace the wordmark in copy.',
    render: () => <MonogramPlate />,
  },
  {
    id: 'palette',
    title: 'Core palette',
    kind: 'colour',
    type: 'ASE · CSS',
    size: '4 KB',
    updated: '04 Nov 2026',
    description: 'Cream, ink, sage, and clay. Sage carries action and selection; it is never decorative.',
    render: () => <PalettePlate />,
  },
  {
    id: 'type',
    title: 'Type pairing',
    kind: 'typography',
    type: 'Specimen',
    size: '28 KB',
    updated: '01 Nov 2026',
    description: 'Bricolage Grotesque for display, Manrope for interface and body. One display moment per screen.',
    render: () => <TypePlate />,
  },
  {
    id: 'campaign-slower',
    title: 'A slower morning',
    kind: 'campaign',
    type: 'SVG plate',
    size: '64 KB',
    updated: '10 Nov 2026',
    description: 'Spring campaign plate. Organic sage field, quiet type, generous cream. Synthetic demonstration artwork.',
    render: () => <CampaignPlate variant={1} />,
  },
  {
    id: 'campaign-washed',
    title: 'The washed edge',
    kind: 'campaign',
    type: 'SVG plate',
    size: '58 KB',
    updated: '10 Nov 2026',
    description: 'Autumn campaign plate. Ink ground with sage depth and a linen-rule detail. Synthetic demonstration artwork.',
    render: () => <CampaignPlate variant={2} />,
  },
  {
    id: 'campaign-oak',
    title: 'Oak & linen',
    kind: 'campaign',
    type: 'SVG plate',
    size: '52 KB',
    updated: '09 Nov 2026',
    description: 'Object-led composition using the core palette. Synthetic demonstration artwork.',
    render: () => <CampaignPlate variant={3} />,
  },
  {
    id: 'social',
    title: 'Social story template',
    kind: 'campaign',
    type: 'SVG template',
    size: '36 KB',
    updated: '07 Nov 2026',
    description: 'A 4:5 story frame with the mark and a three-line close. Keep captions under 90 words.',
    render: () => <SocialPlate />,
  },
]

const filters = [
  { value: 'all', label: 'All' },
  { value: 'logos', label: 'Logos' },
  { value: 'colour', label: 'Colour' },
  { value: 'typography', label: 'Typography' },
  { value: 'campaign', label: 'Campaign' },
]

export function Assets() {
  const { toast } = useApp()
  const [filter, setFilter] = useState('all')
  const [selected, setSelected] = useState(null)

  const visible = useMemo(
    () => assets.filter((asset) => filter === 'all' || asset.kind === filter),
    [filter],
  )

  const copy = async (value, label) => {
    try {
      await navigator.clipboard.writeText(value)
      toast(`${label} copied.`)
    } catch {
      toast('Could not access the clipboard in this browser.', 'warn')
    }
  }

  return (
    <div className="assets-page">
      <section className="page-head">
        <div>
          <h1>Brand assets</h1>
          <p>The approved marks, palette, type, and campaign plates. One library, no stray exports.</p>
        </div>
        <div className="page-head__actions">
          <span className="asset-stat">
            <Layers size={15} /> {assets.length} approved assets
          </span>
          <Button
            icon={Upload}
            variant="secondary"
            onClick={() => toast('Uploads are mocked in this local demo.', 'info')}
          >
            Upload asset
          </Button>
        </div>
      </section>

      <div className="asset-toolbar">
        <Segmented label="Filter assets" value={filter} onChange={setFilter} options={filters} />
        <span className="asset-toolbar__note">
          <Check size={14} /> Every asset is linked to a guideline
        </span>
      </div>

      {visible.length ? (
        <div className="asset-grid">
          {visible.map((asset) => (
            <button
              key={asset.id}
              type="button"
              className={cx('asset-card', asset.kind === 'campaign' && 'asset-card--campaign')}
              onClick={() => setSelected(asset)}
            >
              <span className="asset-card__preview">{asset.render(false)}</span>
              <span className="asset-card__foot">
                <span>
                  <strong>{asset.title}</strong>
                  <small>
                    {asset.type} · {asset.size}
                  </small>
                </span>
                <span className="asset-card__open">
                  <ArrowUpRight size={15} />
                </span>
              </span>
            </button>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Images}
          title="No assets in this view"
          description="Choose another category to browse the library."
          action={
            <Button variant="secondary" onClick={() => setFilter('all')}>
              Show all assets
            </Button>
          }
        />
      )}

      <section className="palette-section">
        <div className="palette-section__head">
          <div>
            <h2>Core palette</h2>
            <p>Click any swatch to copy its hex value.</p>
          </div>
          <span>
            <Palette size={15} /> 6 tokens
          </span>
        </div>
        <div className="swatch-grid">
          {swatches.map((swatch) => (
            <button
              key={swatch.hex}
              type="button"
              className="swatch"
              onClick={() => copy(swatch.hex, swatch.name)}
              aria-label={`Copy ${swatch.name} ${swatch.hex}`}
            >
              <span className="swatch__chip" style={{ background: swatch.hex }} aria-hidden="true" />
              <span className="swatch__meta">
                <strong>{swatch.name}</strong>
                <span>{swatch.hex}</span>
                <Copy size={12} aria-hidden="true" />
              </span>
            </button>
          ))}
        </div>
      </section>

      <section className="asset-guidelines">
        <div>
          <span className="asset-guidelines__icon">
            <Sparkles size={18} />
          </span>
          <h2>One source, one identity.</h2>
          <p>
            Assets stay linked to the guideline that governs them. When a rule changes, the library shows what
            needs to be replaced before an old export reaches a channel.
          </p>
        </div>
        <div className="asset-guidelines__links">
          <button type="button" onClick={() => copy('Aster & Oak primary lockup', 'Asset name')}>
            <Image size={15} /> Copy asset reference
          </button>
          <button type="button" onClick={() => copy('Bricolage Grotesque / Manrope', 'Type pairing')}>
            <Type size={15} /> Copy type pairing
          </button>
          <button type="button" onClick={() => copy('#F6F1E6, #3B2418, #298EE4, #A97A32', 'Palette')}>
            <Palette size={15} /> Copy palette tokens
          </button>
        </div>
      </section>

      <Drawer
        open={Boolean(selected)}
        onClose={() => setSelected(null)}
        title={selected?.title || 'Asset'}
        description={selected?.description}
        width="620px"
        footer={
          selected ? (
            <div className="drawer__actions drawer__actions--between">
              <span className="asset-drawer__meta">
                {selected.type} · {selected.size} · Updated {selected.updated}
              </span>
              <div className="asset-drawer__buttons">
                <Button
                  variant="secondary"
                  icon={Copy}
                  onClick={() => copy(selected.title, 'Asset reference')}
                >
                  Copy reference
                </Button>
                <Button
                  icon={Download}
                  onClick={() => toast('Download is mocked in this local demo.', 'info')}
                >
                  Download
                </Button>
              </div>
            </div>
          ) : null
        }
      >
        {selected ? (
          <div className="asset-drawer">
            <div className={cx('asset-drawer__preview', selected.kind === 'campaign' && 'is-campaign')}>
              {selected.render(true)}
            </div>
            <div className="asset-drawer__facts">
              <div>
                <span>Approved</span>
                <strong>12 Nov 2026</strong>
              </div>
              <div>
                <span>Owner</span>
                <strong>Brand team</strong>
              </div>
              <div>
                <span>Usage</span>
                <strong>Digital + print</strong>
              </div>
            </div>
            <div className="asset-drawer__note">
              <Check size={15} />
              <p>This preview is generated from the live brand tokens. No stale export can drift from the library.</p>
            </div>
          </div>
        ) : null}
      </Drawer>
    </div>
  )
}
