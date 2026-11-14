import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import {
  ArrowUpRight,
  Check,
  Copy,
  Download,
  Edit3,
  FileCheck2,
  FileUp,
  Image,
  Images,
  Layers,
  Palette,
  Plus,
  RotateCcw,
  Sparkles,
  Trash2,
  Type,
  Upload,
  UploadCloud,
  X,
} from 'lucide-react'
import { useApp } from '../context/AppContext'
import { Button, Drawer, EmptyState, Field, Panel, Segmented, Select } from '../components/UI'
import { animateAssetGrid } from '../lib/animations'
import { cx } from '../lib/utils'

const STORAGE_KEY = 'klarity_brand_assets_v2'

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
      <text
        x="160"
        y="96"
        textAnchor="middle"
        dominantBaseline="middle"
        fill={dark ? '#F6F1E6' : '#3B2418'}
        className="asset-svg__wordmark"
      >
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

const defaultAssets = [
  {
    id: 'logo-primary',
    title: 'Primary lockup',
    kind: 'logos',
    type: 'SVG',
    size: '18 KB',
    updated: '12 Nov 2026',
    owner: 'Brand team',
    usage: 'Digital and print',
    description: 'The default horizontal lockup. Cream and ink versions are approved for digital and print.',
    plateType: 'logo-primary',
  },
  {
    id: 'logo-mono',
    title: 'Monogram',
    kind: 'logos',
    type: 'SVG',
    size: '9 KB',
    updated: '08 Nov 2026',
    owner: 'Brand team',
    usage: 'Digital only',
    description: 'Reserved for the mark, social avatars, and small placements. Never use it to replace the wordmark in copy.',
    plateType: 'logo-mono',
  },
  {
    id: 'palette',
    title: 'Core palette',
    kind: 'colour',
    type: 'ASE · CSS',
    size: '4 KB',
    updated: '04 Nov 2026',
    owner: 'Design ops',
    usage: 'Tokens & themes',
    description: 'Cream, ink, sage, and clay. Sage carries action and selection; it is never decorative.',
    plateType: 'palette',
  },
  {
    id: 'type',
    title: 'Type pairing',
    kind: 'typography',
    type: 'Specimen',
    size: '28 KB',
    updated: '01 Nov 2026',
    owner: 'Typography lead',
    usage: 'UI and editorial',
    description: 'Bricolage Grotesque for display, Manrope for interface and body. One display moment per screen.',
    plateType: 'type',
  },
  {
    id: 'campaign-slower',
    title: 'A slower morning',
    kind: 'campaign',
    type: 'SVG plate',
    size: '64 KB',
    updated: '10 Nov 2026',
    owner: 'Marketing creative',
    usage: 'Campaign hero',
    description: 'Spring campaign plate. Organic sage field, quiet type, generous cream. Synthetic demonstration artwork.',
    plateType: 'campaign-1',
  },
  {
    id: 'campaign-washed',
    title: 'The washed edge',
    kind: 'campaign',
    type: 'SVG plate',
    size: '58 KB',
    updated: '10 Nov 2026',
    owner: 'Marketing creative',
    usage: 'Editorial placement',
    description: 'Autumn campaign plate. Ink ground with sage depth and a linen-rule detail. Synthetic demonstration artwork.',
    plateType: 'campaign-2',
  },
  {
    id: 'campaign-oak',
    title: 'Oak & linen',
    kind: 'campaign',
    type: 'SVG plate',
    size: '52 KB',
    updated: '09 Nov 2026',
    owner: 'Creative ops',
    usage: 'Packaging & web',
    description: 'Object-led composition using the core palette. Synthetic demonstration artwork.',
    plateType: 'campaign-3',
  },
  {
    id: 'social',
    title: 'Social story template',
    kind: 'campaign',
    type: 'SVG template',
    size: '36 KB',
    updated: '07 Nov 2026',
    owner: 'Social team',
    usage: 'Instagram & TikTok',
    description: 'A 4:5 story frame with the mark and a three-line close. Keep captions under 90 words.',
    plateType: 'social',
  },
]

function renderAssetPreview(asset, large = false) {
  if (asset.imageUrl) {
    return (
      <div className={cx('asset-card__image-wrap', large && 'asset-drawer__preview--uploaded')}>
        <img src={asset.imageUrl} alt={asset.title} className="asset-uploaded-img" />
      </div>
    )
  }
  switch (asset.plateType) {
    case 'logo-primary':
      return <LogoPlate dark={large} />
    case 'logo-mono':
      return <MonogramPlate />
    case 'palette':
      return <PalettePlate />
    case 'type':
      return <TypePlate />
    case 'campaign-1':
      return <CampaignPlate variant={1} />
    case 'campaign-2':
      return <CampaignPlate variant={2} />
    case 'campaign-3':
      return <CampaignPlate variant={3} />
    case 'social':
      return <SocialPlate />
    default:
      return (
        <div className="asset-card__image-wrap">
          <FileCheck2 size={36} style={{ color: 'var(--sage)' }} />
        </div>
      )
  }
}

const filters = [
  { value: 'all', label: 'All' },
  { value: 'logos', label: 'Logos' },
  { value: 'colour', label: 'Colour' },
  { value: 'typography', label: 'Typography' },
  { value: 'campaign', label: 'Campaign' },
]

const categoryOptions = [
  { value: 'logos', label: 'Logos & Wordmarks' },
  { value: 'colour', label: 'Colour & Palettes' },
  { value: 'typography', label: 'Typography & Fonts' },
  { value: 'campaign', label: 'Campaign & Creative' },
]

export function Assets() {
  const { toast } = useApp()
  const [filter, setFilter] = useState('all')
  const [selected, setSelected] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState(null)

  // Upload Drawer State
  const [uploadOpen, setUploadOpen] = useState(false)
  const [uploadFile, setUploadFile] = useState(null)
  const [uploadForm, setUploadForm] = useState({
    title: '',
    kind: 'logos',
    type: 'SVG',
    description: '',
    usage: 'Digital + print',
    owner: 'Brand team',
  })

  // Drag and drop states
  const [isDraggingPage, setIsDraggingPage] = useState(false)
  const [isDraggingDropzone, setIsDraggingDropzone] = useState(false)
  const dragCounterRef = useRef(0)
  const fileInputRef = useRef(null)
  const replaceInputRef = useRef(null)
  const drawerPreviewRef = useRef(null)
  const gridRef = useRef(null)

  // Initialize assets from localStorage or defaults
  const [assetsList, setAssetsList] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed
        }
      }
    } catch {}
    return defaultAssets
  })

  // Persist assets to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(assetsList))
    } catch {}
  }, [assetsList])

  useLayoutEffect(() => {
    if (gridRef.current) {
      animateAssetGrid(gridRef.current)
    }
  }, [filter])

  const visible = useMemo(
    () => assetsList.filter((asset) => filter === 'all' || asset.kind === filter),
    [assetsList, filter],
  )

  useLayoutEffect(() => {
    if (gridRef.current) {
      animateAssetGrid(gridRef.current)
    }
  }, [filter])

  const copy = async (value, label) => {
    try {
      await navigator.clipboard.writeText(value)
      toast(`${label} copied.`)
    } catch {
      toast('Could not access the clipboard in this browser.', 'warn')
    }
  }

  // Parse uploaded file
  const processFile = (file, isReplace = false) => {
    if (!file) return
    const isImage = file.type.startsWith('image/')
    const ext = file.name.split('.').pop()?.toUpperCase() || 'FILE'
    const cleanTitle = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]+/g, ' ')
    const formattedSize =
      file.size > 1024 * 1024
        ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
        : `${Math.round(file.size / 1024)} KB`

    const reader = new FileReader()
    reader.onload = (e) => {
      const dataUrl = e.target.result
      if (isReplace) {
        setEditForm((prev) => ({
          ...prev,
          imageUrl: dataUrl,
          type: ext,
          size: formattedSize,
        }))
        toast(`File replaced with ${file.name}.`, 'good')
      } else {
        setUploadFile({
          name: file.name,
          size: formattedSize,
          type: ext,
          dataUrl,
        })
        setUploadForm((prev) => ({
          ...prev,
          title: prev.title || cleanTitle,
          type: ext,
        }))
        setUploadOpen(true)
      }
    }
    reader.readAsDataURL(file)
  }

  // Page-level drag & drop listeners
  useEffect(() => {
    const handleDragEnter = (e) => {
      if (e.dataTransfer?.types?.includes('Files')) {
        dragCounterRef.current += 1
        setIsDraggingPage(true)
      }
    }
    const handleDragLeave = (e) => {
      if (e.dataTransfer?.types?.includes('Files')) {
        dragCounterRef.current -= 1
        if (dragCounterRef.current <= 0) {
          dragCounterRef.current = 0
          setIsDraggingPage(false)
        }
      }
    }
    const handleDragOver = (e) => {
      e.preventDefault()
    }
    const handleDrop = (e) => {
      e.preventDefault()
      dragCounterRef.current = 0
      setIsDraggingPage(false)
      if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
        processFile(e.dataTransfer.files[0])
      }
    }

    window.addEventListener('dragenter', handleDragEnter)
    window.addEventListener('dragleave', handleDragLeave)
    window.addEventListener('dragover', handleDragOver)
    window.addEventListener('drop', handleDrop)

    return () => {
      window.removeEventListener('dragenter', handleDragEnter)
      window.removeEventListener('dragleave', handleDragLeave)
      window.removeEventListener('dragover', handleDragOver)
      window.removeEventListener('drop', handleDrop)
    }
  }, [])

  // Create new asset
  const handleCreateAsset = (e) => {
    e.preventDefault()
    if (!uploadForm.title.trim()) {
      toast('Please provide an asset title.', 'warn')
      return
    }

    const today = new Intl.DateTimeFormat('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(new Date())

    const newAsset = {
      id: `asset-${Date.now()}`,
      title: uploadForm.title.trim(),
      kind: uploadForm.kind,
      type: uploadForm.type || 'SVG',
      size: uploadFile?.size || '12 KB',
      updated: today,
      owner: uploadForm.owner || 'Brand team',
      usage: uploadForm.usage || 'Digital + print',
      description: uploadForm.description.trim() || 'Approved brand asset.',
      imageUrl: uploadFile?.dataUrl || null,
      isCustom: true,
    }

    setAssetsList((prev) => [newAsset, ...prev])
    toast(`Asset "${newAsset.title}" added to library.`, 'good')
    setUploadOpen(false)
    setUploadFile(null)
    setUploadForm({
      title: '',
      kind: 'logos',
      type: 'SVG',
      description: '',
      usage: 'Digital + print',
      owner: 'Brand team',
    })
  }

  // Open asset drawer
  const handleOpenAsset = (asset) => {
    setSelected(asset)
    setIsEditing(false)
    setEditForm({
      title: asset.title,
      kind: asset.kind,
      type: asset.type,
      size: asset.size,
      updated: asset.updated,
      owner: asset.owner || 'Brand team',
      usage: asset.usage || 'Digital and print',
      description: asset.description || '',
      imageUrl: asset.imageUrl || null,
    })
  }

  // Save edited asset
  const handleSaveEdit = (e) => {
    e?.preventDefault?.()
    if (!editForm.title.trim()) {
      toast('Title cannot be empty.', 'warn')
      return
    }

    setAssetsList((prev) =>
      prev.map((item) =>
        item.id === selected.id
          ? {
              ...item,
              ...editForm,
              title: editForm.title.trim(),
              description: editForm.description.trim(),
              updated: 'Today',
            }
          : item,
      ),
    )

    setSelected((prev) => ({
      ...prev,
      ...editForm,
      title: editForm.title.trim(),
      description: editForm.description.trim(),
      updated: 'Today',
    }))

    setIsEditing(false)
    toast('Asset updated successfully.', 'good')
  }

  // Delete asset
  const handleDeleteAsset = (id) => {
    setAssetsList((prev) => prev.filter((item) => item.id !== id))
    setSelected(null)
    toast('Asset removed from library.', 'good')
  }

  // Reset to original default library
  const handleResetDefaults = () => {
    setAssetsList(defaultAssets)
    setSelected(null)
    toast('Asset library reset to defaults.', 'good')
  }

  // Download asset (real file or serialized SVG)
  const handleDownload = (asset) => {
    if (asset.imageUrl) {
      const a = document.createElement('a')
      a.href = asset.imageUrl
      const slug = asset.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')
      const ext = (asset.type || 'png').toLowerCase().replace(/[^a-z0-9]/g, '')
      a.download = `${slug}.${ext || 'png'}`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      toast(`Downloaded ${asset.title}.`, 'good')
      return
    }

    if (drawerPreviewRef.current) {
      const svg = drawerPreviewRef.current.querySelector('svg')
      if (svg) {
        const serializer = new XMLSerializer()
        const source = serializer.serializeToString(svg)
        const blob = new Blob([source], { type: 'image/svg+xml;charset=utf-8' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${asset.id}.svg`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
        toast(`Downloaded ${asset.title} as SVG.`, 'good')
        return
      }
    }

    toast(`Downloaded ${asset.title}.`, 'good')
  }

  return (
    <div className="assets-page">
      {/* Global Drag-and-Drop Overlay */}
      {isDraggingPage && (
        <div className="asset-global-overlay">
          <div className="asset-global-overlay__box">
            <UploadCloud size={48} style={{ color: 'var(--sage)' }} />
            <h3>Drop brand file to upload</h3>
            <p>Release anywhere to add directly to the Aster &amp; Oak asset library</p>
          </div>
        </div>
      )}

      {/* Page Header */}
      <section className="page-head">
        <div>
          <h1>Brand assets</h1>
          <p>The approved marks, palette, type, and campaign plates. One library, no stray exports.</p>
        </div>
        <div className="page-head__actions">
          <div className="asset-stat-group">
            <span className="asset-stat">
              <Layers size={15} /> {assetsList.length} approved assets
            </span>
            {assetsList.length !== defaultAssets.length && (
              <button
                type="button"
                className="asset-reset-btn"
                onClick={handleResetDefaults}
                title="Restore default assets"
              >
                Reset library
              </button>
            )}
          </div>
          <Button icon={Upload} variant="primary" onClick={() => setUploadOpen(true)}>
            Upload asset
          </Button>
        </div>
      </section>

      {/* Category Tabs & Note */}
      <div className="asset-toolbar">
        <Segmented label="Filter assets" value={filter} onChange={setFilter} options={filters} />
        <span className="asset-toolbar__note">
          <Check size={14} /> Every asset is linked to a guideline
        </span>
      </div>

      {/* Asset Cards Grid */}
      {visible.length ? (
        <div ref={gridRef} className="asset-grid">
          {visible.map((asset) => (
            <button
              key={asset.id}
              type="button"
              className={cx('asset-card', asset.kind === 'campaign' && 'asset-card--campaign')}
              onClick={() => handleOpenAsset(asset)}
            >
              <span className="asset-card__preview">{renderAssetPreview(asset, false)}</span>
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
          title="No assets in this category"
          description="Drag and drop brand files or choose another category to browse."
          action={
            <Button variant="secondary" onClick={() => setFilter('all')}>
              Show all assets
            </Button>
          }
        />
      )}

      {/* Core Palette Section */}
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

      {/* Asset Guidelines Link Section */}
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

      {/* Upload New Asset Drawer */}
      <Drawer
        open={uploadOpen}
        onClose={() => {
          setUploadOpen(false)
          setUploadFile(null)
        }}
        title="Upload new brand asset"
        description="Add a logo, campaign plate, typography specimen, or color palette to the workspace library."
        width="560px"
        footer={
          <div className="drawer__actions drawer__actions--between">
            <Button
              variant="ghost"
              onClick={() => {
                setUploadOpen(false)
                setUploadFile(null)
              }}
            >
              Cancel
            </Button>
            <Button variant="primary" icon={Plus} onClick={handleCreateAsset}>
              Add to library
            </Button>
          </div>
        }
      >
        <form className="asset-edit-form" onSubmit={handleCreateAsset}>
          {/* Dropzone */}
          <div
            className={cx('asset-dropzone', isDraggingDropzone && 'is-dragover')}
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault()
              setIsDraggingDropzone(true)
            }}
            onDragLeave={() => setIsDraggingDropzone(false)}
            onDrop={(e) => {
              e.preventDefault()
              setIsDraggingDropzone(false)
              if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
                processFile(e.dataTransfer.files[0])
              }
            }}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,.svg,.pdf,.ase,.woff,.woff2,.ttf"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  processFile(e.target.files[0])
                }
              }}
              style={{ display: 'none' }}
            />

            {uploadFile?.dataUrl ? (
              <div className="asset-dropzone__preview" onClick={(e) => e.stopPropagation()}>
                <img src={uploadFile.dataUrl} alt="Upload preview" />
                <button
                  type="button"
                  className="asset-dropzone__clear-btn"
                  title="Remove file"
                  onClick={() => setUploadFile(null)}
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <>
                <div className="asset-dropzone__icon-wrap">
                  <FileUp size={22} />
                </div>
                <div className="asset-dropzone__title">
                  Drag &amp; drop your file here, or <span style={{ color: 'var(--sage)' }}>browse</span>
                </div>
                <div className="asset-dropzone__hint">Supports SVG, PNG, JPG, WebP, PDF, ASE palettes</div>
              </>
            )}
          </div>

          <Field label="Asset Title" htmlFor="upload-title">
            <input
              id="upload-title"
              type="text"
              className="asset-form-input"
              value={uploadForm.title}
              onChange={(e) => setUploadForm({ ...uploadForm, title: e.target.value })}
              placeholder="e.g. Autumn 2026 Hero Banner"
              required
            />
          </Field>

          <div className="asset-form-grid">
            <Field label="Category / Kind" htmlFor="upload-kind">
              <Select
                id="upload-kind"
                value={uploadForm.kind}
                options={categoryOptions}
                onChange={(val) => setUploadForm({ ...uploadForm, kind: val })}
              />
            </Field>

            <Field label="Format / Type" htmlFor="upload-type">
              <input
                id="upload-type"
                type="text"
                className="asset-form-input"
                value={uploadForm.type}
                onChange={(e) => setUploadForm({ ...uploadForm, type: e.target.value })}
                placeholder="SVG, PNG 2x, etc."
              />
            </Field>
          </div>

          <div className="asset-form-grid">
            <Field label="Approved Usage" htmlFor="upload-usage">
              <input
                id="upload-usage"
                type="text"
                className="asset-form-input"
                value={uploadForm.usage}
                onChange={(e) => setUploadForm({ ...uploadForm, usage: e.target.value })}
                placeholder="e.g. Digital + print"
              />
            </Field>

            <Field label="Owner / Team" htmlFor="upload-owner">
              <input
                id="upload-owner"
                type="text"
                className="asset-form-input"
                value={uploadForm.owner}
                onChange={(e) => setUploadForm({ ...uploadForm, owner: e.target.value })}
                placeholder="e.g. Brand team"
              />
            </Field>
          </div>

          <Field label="Description &amp; Guidelines" htmlFor="upload-desc">
            <textarea
              id="upload-desc"
              className="asset-form-textarea"
              value={uploadForm.description}
              onChange={(e) => setUploadForm({ ...uploadForm, description: e.target.value })}
              placeholder="Provide context or rules on when and how this asset should be used..."
            />
          </Field>
        </form>
      </Drawer>

      {/* Asset Details & Edit Drawer */}
      <Drawer
        open={Boolean(selected)}
        onClose={() => {
          setSelected(null)
          setIsEditing(false)
        }}
        title={isEditing ? `Edit ${selected?.title}` : selected?.title || 'Asset'}
        description={isEditing ? 'Update asset metadata, rules, or replace the artwork.' : selected?.description}
        width="620px"
        footer={
          selected ? (
            <div className="asset-drawer__actions-bar">
              <div className="asset-drawer__left-meta">
                {isEditing ? (
                  <Button
                    variant="ghost"
                    icon={Trash2}
                    onClick={() => handleDeleteAsset(selected.id)}
                    style={{ color: 'var(--danger)' }}
                  >
                    Delete asset
                  </Button>
                ) : (
                  <span>
                    {selected.type} · {selected.size} · Updated {selected.updated}
                  </span>
                )}
              </div>
              <div className="asset-drawer__right-actions">
                {isEditing ? (
                  <>
                    <Button variant="ghost" onClick={() => setIsEditing(false)}>
                      Cancel
                    </Button>
                    <Button variant="primary" icon={Check} onClick={handleSaveEdit}>
                      Save changes
                    </Button>
                  </>
                ) : (
                  <>
                    <Button variant="secondary" icon={Edit3} onClick={() => setIsEditing(true)}>
                      Edit asset
                    </Button>
                    <Button variant="secondary" icon={Copy} onClick={() => copy(selected.title, 'Asset reference')}>
                      Copy reference
                    </Button>
                    <Button variant="primary" icon={Download} onClick={() => handleDownload(selected)}>
                      Download
                    </Button>
                  </>
                )}
              </div>
            </div>
          ) : null
        }
      >
        {selected ? (
          isEditing ? (
            /* Edit Mode */
            <form className="asset-edit-form" onSubmit={handleSaveEdit}>
              {/* Replace file area */}
              <div
                className="asset-dropzone"
                onClick={() => replaceInputRef.current?.click()}
              >
                <input
                  ref={replaceInputRef}
                  type="file"
                  accept="image/*,.svg,.pdf,.ase"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      processFile(e.target.files[0], true)
                    }
                  }}
                  style={{ display: 'none' }}
                />
                <div className="asset-dropzone__icon-wrap">
                  <Upload size={18} />
                </div>
                <div className="asset-dropzone__title">Click or drop to replace asset artwork</div>
                <div className="asset-dropzone__hint">Will update thumbnail and download file</div>
              </div>
              </div>

              <Field label="Title" htmlFor="edit-title">
                <input
                  id="edit-title"
                  type="text"
                  className="asset-form-input"
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  required
                />
              </Field>

              <div className="asset-form-grid">
                <Field label="Category" htmlFor="edit-kind">
                  <Select
                    id="edit-kind"
                    value={editForm.kind}
                    options={categoryOptions}
                    onChange={(val) => setEditForm({ ...editForm, kind: val })}
                  />
                </Field>

                <Field label="Format / Type" htmlFor="edit-type">
                  <input
                    id="edit-type"
                    type="text"
                    className="asset-form-input"
                    value={editForm.type}
                    onChange={(e) => setEditForm({ ...editForm, type: e.target.value })}
                  />
                </Field>
              </div>

              <div className="asset-form-grid">
                <Field label="Usage Scope" htmlFor="edit-usage">
                  <input
                    id="edit-usage"
                    type="text"
                    className="asset-form-input"
                    value={editForm.usage}
                    onChange={(e) => setEditForm({ ...editForm, usage: e.target.value })}
                  />
                </Field>

                <Field label="Owner" htmlFor="edit-owner">
                  <input
                    id="edit-owner"
                    type="text"
                    className="asset-form-input"
                    value={editForm.owner}
                    onChange={(e) => setEditForm({ ...editForm, owner: e.target.value })}
                  />
                </Field>
              </div>

              <Field label="Description &amp; Guidelines" htmlFor="edit-desc">
                <textarea
                  id="edit-desc"
                  className="asset-form-textarea"
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                />
              </Field>
            </form>
          ) : (
            /* View Mode */
            <div key={selected.id} className="asset-drawer asset-drawer--animated">
              <div
                ref={drawerPreviewRef}
                className={cx('asset-drawer__preview', selected.kind === 'campaign' && 'is-campaign')}
              >
                {renderAssetPreview(selected, true)}
              </div>
              <div className="asset-drawer__facts">
                <div>
                  <span>Approved</span>
                  <strong>{selected.updated || '12 Nov 2026'}</strong>
                </div>
                <div>
                  <span>Owner</span>
                  <strong>{selected.owner || 'Brand team'}</strong>
                </div>
                <div>
                  <span>Usage</span>
                  <strong>{selected.usage || 'Digital + print'}</strong>
                </div>
              </div>
              <div className="asset-drawer__note">
                <Check size={15} />
                <p>This asset is verified and governed by active brand guidelines. No stale export can drift.</p>
              </div>
            </div>
          )
        ) : null}
      </Drawer>
    </div>
  )
}
