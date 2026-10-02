import * as L from 'lucide-react'
import * as P from '@phosphor-icons/react'
import * as T from '@tabler/icons-react'
import * as H from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { cn } from '@/lib/utils'
import { usePrefs, type IconSet } from '@/lib/prefs'

// Nomes nossos → ícone de cada biblioteca. Trocar de biblioteca é trocar a coluna, não as telas.
const MAP = {
  home: [L.House, P.House, T.IconHome, H.Home05Icon],
  agent: [L.AudioLines, P.Waveform, T.IconWaveSine, H.AudioWave01Icon],
  builder: [L.Boxes, P.Cube, T.IconBoxMultiple, H.CubeIcon],
  bolt: [L.Zap, P.Lightning, T.IconBolt, H.FlashIcon],
  help: [L.LifeBuoy, P.Lifebuoy, T.IconLifebuoy, H.CustomerSupportIcon],
  system: [L.ShieldCheck, P.ShieldCheck, T.IconShieldCheck, H.SecurityCheckIcon],
  knowledge: [L.BookOpen, P.BookOpen, T.IconBook, H.BookOpen01Icon],
  guard: [L.ShieldCheck, P.ShieldCheck, T.IconShieldCheck, H.Shield01Icon],
  tag: [L.Tag, P.Tag, T.IconTag, H.Tag01Icon],
  workflow: [L.Workflow, P.FlowArrow, T.IconSitemap, H.WorkflowSquare03Icon],
  history: [L.History, P.ClockCounterClockwise, T.IconHistory, H.WorkHistoryIcon],
  conversations: [L.MessagesSquare, P.ChatsCircle, T.IconMessages, H.BubbleChatIcon],
  audio: [L.FileAudio, P.FileAudio, T.IconFileMusic, H.FileAudioIcon],
  chart: [L.ChartNoAxesColumn, P.ChartBar, T.IconChartBar, H.ChartColumnIcon],
  search: [L.Search, P.MagnifyingGlass, T.IconSearch, H.Search01Icon],
  branch: [L.GitBranch, P.GitBranch, T.IconGitBranch, H.GitBranchIcon],
  news: [L.Megaphone, P.Megaphone, T.IconSpeakerphone, H.Megaphone01Icon],
  logout: [L.LogOut, P.SignOut, T.IconLogout, H.Logout03Icon],
  sidebar: [L.PanelLeft, P.SidebarSimple, T.IconLayoutSidebar, H.SidebarLeftIcon],
  phone: [L.Phone, P.Phone, T.IconPhone, H.Call02Icon],
  whatsapp: [L.MessageCircle, P.WhatsappLogo, T.IconBrandWhatsapp, H.WhatsappIcon],
  chat: [L.MessageCircleMore, P.ChatCircleDots, T.IconMessageDots, H.Message01Icon],
  refresh: [L.RefreshCw, P.ArrowClockwise, T.IconRefresh, H.Refresh01Icon],
  filter: [L.ListFilter, P.FunnelSimple, T.IconFilter, H.FilterHorizontalIcon],
  plus: [L.Plus, P.Plus, T.IconPlus, H.PlusSignIcon],
  download: [L.Download, P.DownloadSimple, T.IconDownload, H.Download04Icon],
  columns: [L.Columns3, P.Columns, T.IconColumns, H.LayoutTwoColumnIcon],
  tool: [L.Wrench, P.Wrench, T.IconTool, H.Wrench01Icon],
  calendar: [L.Calendar, P.CalendarBlank, T.IconCalendar, H.Calendar03Icon],
  up: [L.ChevronUp, P.CaretUp, T.IconChevronUp, H.ArrowUp01Icon],
  down: [L.ChevronDown, P.CaretDown, T.IconChevronDown, H.ArrowDown01Icon],
  close: [L.X, P.X, T.IconX, H.Cancel01Icon],
  copy: [L.Copy, P.Copy, T.IconCopy, H.Copy01Icon],
  sparkle: [L.Sparkles, P.Sparkle, T.IconSparkles, H.SparklesIcon],
  clock: [L.Clock, P.Clock, T.IconClock, H.Clock01Icon],
  user: [L.User, P.User, T.IconUser, H.UserIcon],
  play: [L.Play, P.Play, T.IconPlayerPlay, H.PlayIcon],
  settings: [L.SlidersHorizontal, P.SlidersHorizontal, T.IconAdjustmentsHorizontal, H.SlidersHorizontalIcon],
  mood: [L.Smile, P.Smiley, T.IconMoodSmile, H.SmileIcon],
  expand: [L.Maximize2, P.ArrowsOutSimple, T.IconArrowsDiagonal, H.Maximize01Icon],
} as const

export type IconName = keyof typeof MAP
const COL: Record<IconSet, number> = { lucide: 0, phosphor: 1, tabler: 2, hugeicons: 3 }

type Props = { name: IconName; className?: string; active?: boolean; stroke?: number }

export function Icon({ name, className, active, stroke = 1.5 }: Props) {
  const { iconSet } = usePrefs()
  const cls = cn('size-4 shrink-0', className)
  const C = MAP[name][COL[iconSet]] as React.ComponentType<Record<string, unknown>>
  if (iconSet === 'hugeicons') return <HugeiconsIcon icon={C as never} className={cls} strokeWidth={stroke} />
  // O Phosphor tem versão preenchida: usamos no item ativo do menu, como a Stripe.
  if (iconSet === 'phosphor') return <C className={cls} weight={active ? 'fill' : 'regular'} />
  if (iconSet === 'tabler') return <C className={cls} stroke={stroke} />
  return <C className={cls} strokeWidth={stroke} />
}
