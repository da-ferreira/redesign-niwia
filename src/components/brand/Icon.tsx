import * as L from 'lucide-react'
import * as P from '@phosphor-icons/react'
import * as T from '@tabler/icons-react'
import * as H from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import * as R from '@remixicon/react'
import * as I from 'iconoir-react'
import * as HO from '@heroicons/react/24/outline'
import { cn } from '@/lib/utils'
import { usePrefs, type IconSet } from '@/lib/prefs'

// Nomes nossos → ícone de cada biblioteca. Trocar de biblioteca é trocar a coluna, não as telas.
const MAP = {
  home: [L.House, P.House, T.IconHome, H.Home05Icon, R.RiHome5Line, I.Home, HO.HomeIcon],
  agent: [L.AudioLines, P.Waveform, T.IconWaveSine, H.AudioWave01Icon, R.RiVoiceprintLine, I.SoundHigh, HO.SpeakerWaveIcon],
  builder: [L.Boxes, P.Cube, T.IconBoxMultiple, H.CubeIcon, R.RiBox3Line, I.Box3dPoint, HO.CubeIcon],
  bolt: [L.Zap, P.Lightning, T.IconBolt, H.FlashIcon, R.RiFlashlightLine, I.Flash, HO.BoltIcon],
  help: [L.LifeBuoy, P.Lifebuoy, T.IconLifebuoy, H.CustomerSupportIcon, R.RiLifebuoyLine, I.Lifebelt, HO.LifebuoyIcon],
  system: [L.ShieldCheck, P.ShieldCheck, T.IconShieldCheck, H.SecurityCheckIcon, R.RiShieldCheckLine, I.ShieldCheck, HO.ShieldCheckIcon],
  knowledge: [L.BookOpen, P.BookOpen, T.IconBook, H.BookOpen01Icon, R.RiBookOpenLine, I.BookStack, HO.BookOpenIcon],
  guard: [L.ShieldCheck, P.ShieldCheck, T.IconShieldCheck, H.Shield01Icon, R.RiShieldLine, I.Shield, HO.ShieldCheckIcon],
  tag: [L.Tag, P.Tag, T.IconTag, H.Tag01Icon, R.RiPriceTag3Line, I.Label, HO.TagIcon],
  workflow: [L.Workflow, P.FlowArrow, T.IconSitemap, H.WorkflowSquare03Icon, R.RiFlowChart, I.Network, HO.ShareIcon],
  history: [L.History, P.ClockCounterClockwise, T.IconHistory, H.WorkHistoryIcon, R.RiHistoryLine, I.Clock, HO.ClockIcon],
  conversations: [L.MessagesSquare, P.ChatsCircle, T.IconMessages, H.BubbleChatIcon, R.RiChat3Line, I.ChatLines, HO.ChatBubbleLeftRightIcon],
  audio: [L.FileAudio, P.FileAudio, T.IconFileMusic, H.FileAudioIcon, R.RiFileMusicLine, I.MusicDoubleNote, HO.MusicalNoteIcon],
  chart: [L.ChartNoAxesColumn, P.ChartBar, T.IconChartBar, H.ChartColumnIcon, R.RiBarChart2Line, I.StatsReport, HO.ChartBarIcon],
  search: [L.Search, P.MagnifyingGlass, T.IconSearch, H.Search01Icon, R.RiSearchLine, I.Search, HO.MagnifyingGlassIcon],
  branch: [L.GitBranch, P.GitBranch, T.IconGitBranch, H.GitBranchIcon, R.RiGitBranchLine, I.GitBranch, HO.ShareIcon],
  news: [L.Megaphone, P.Megaphone, T.IconSpeakerphone, H.Megaphone01Icon, R.RiMegaphoneLine, I.Megaphone, HO.MegaphoneIcon],
  logout: [L.LogOut, P.SignOut, T.IconLogout, H.Logout03Icon, R.RiLogoutBoxRLine, I.LogOut, HO.ArrowRightStartOnRectangleIcon],
  sidebar: [L.PanelLeft, P.SidebarSimple, T.IconLayoutSidebar, H.SidebarLeftIcon, R.RiSideBarLine, I.SidebarCollapse, HO.Bars3BottomLeftIcon],
  phone: [L.Phone, P.Phone, T.IconPhone, H.Call02Icon, R.RiPhoneLine, I.Phone, HO.PhoneIcon],
  whatsapp: [L.MessageCircle, P.WhatsappLogo, T.IconBrandWhatsapp, H.WhatsappIcon, R.RiWhatsappLine, I.Whatsapp, HO.ChatBubbleOvalLeftIcon],
  chat: [L.MessageCircleMore, P.ChatCircleDots, T.IconMessageDots, H.Message01Icon, R.RiChatSmile2Line, I.ChatBubble, HO.ChatBubbleOvalLeftEllipsisIcon],
  refresh: [L.RefreshCw, P.ArrowClockwise, T.IconRefresh, H.Refresh01Icon, R.RiRefreshLine, I.Refresh, HO.ArrowPathIcon],
  filter: [L.ListFilter, P.FunnelSimple, T.IconFilter, H.FilterHorizontalIcon, R.RiFilter3Line, I.Filter, HO.FunnelIcon],
  plus: [L.Plus, P.Plus, T.IconPlus, H.PlusSignIcon, R.RiAddLine, I.Plus, HO.PlusIcon],
  download: [L.Download, P.DownloadSimple, T.IconDownload, H.Download04Icon, R.RiDownloadLine, I.Download, HO.ArrowDownTrayIcon],
  columns: [L.Columns3, P.Columns, T.IconColumns, H.LayoutTwoColumnIcon, R.RiLayoutColumnLine, I.ViewColumns3, HO.ViewColumnsIcon],
  tool: [L.Wrench, P.Wrench, T.IconTool, H.Wrench01Icon, R.RiToolsLine, I.Tools, HO.WrenchIcon],
  calendar: [L.Calendar, P.CalendarBlank, T.IconCalendar, H.Calendar03Icon, R.RiCalendarLine, I.Calendar, HO.CalendarIcon],
  up: [L.ChevronUp, P.CaretUp, T.IconChevronUp, H.ArrowUp01Icon, R.RiArrowUpSLine, I.NavArrowUp, HO.ChevronUpIcon],
  down: [L.ChevronDown, P.CaretDown, T.IconChevronDown, H.ArrowDown01Icon, R.RiArrowDownSLine, I.NavArrowDown, HO.ChevronDownIcon],
  close: [L.X, P.X, T.IconX, H.Cancel01Icon, R.RiCloseLine, I.Xmark, HO.XMarkIcon],
  copy: [L.Copy, P.Copy, T.IconCopy, H.Copy01Icon, R.RiFileCopyLine, I.Copy, HO.DocumentDuplicateIcon],
  sparkle: [L.Sparkles, P.Sparkle, T.IconSparkles, H.SparklesIcon, R.RiSparkling2Line, I.Sparks, HO.SparklesIcon],
  clock: [L.Clock, P.Clock, T.IconClock, H.Clock01Icon, R.RiTimeLine, I.Clock, HO.ClockIcon],
  user: [L.User, P.User, T.IconUser, H.UserIcon, R.RiUserLine, I.User, HO.UserIcon],
  play: [L.Play, P.Play, T.IconPlayerPlay, H.PlayIcon, R.RiPlayLine, I.Play, HO.PlayIcon],
  settings: [L.SlidersHorizontal, P.SlidersHorizontal, T.IconAdjustmentsHorizontal, H.SlidersHorizontalIcon, R.RiEqualizerLine, I.Settings, HO.AdjustmentsHorizontalIcon],
  mood: [L.Smile, P.Smiley, T.IconMoodSmile, H.SmileIcon, R.RiEmotionHappyLine, I.EmojiTalkingHappy, HO.FaceSmileIcon],
  pause: [L.Pause, P.Pause, T.IconPlayerPause, H.PauseIcon, R.RiPauseLine, I.Pause, HO.PauseIcon],
  stop: [L.Square, P.Stop, T.IconPlayerStop, H.StopIcon, R.RiStopLine, I.Square, HO.StopIcon],
  trash: [L.Trash2, P.Trash, T.IconTrash, H.Delete02Icon, R.RiDeleteBinLine, I.Trash, HO.TrashIcon],
  terminal: [L.SquareTerminal, P.TerminalWindow, T.IconTerminal2, H.ComputerTerminal01Icon, R.RiTerminalBoxLine, I.Terminal, HO.CommandLineIcon],
  panel: [L.PanelRight, P.SidebarSimple, T.IconLayoutSidebarRight, H.SidebarRightIcon, R.RiLayoutRightLine, I.SidebarExpand, HO.ViewColumnsIcon],
  volume: [L.Volume2, P.SpeakerHigh, T.IconVolume, H.VolumeHighIcon, R.RiVolumeUpLine, I.SoundHigh, HO.SpeakerWaveIcon],
  mute: [L.VolumeX, P.SpeakerX, T.IconVolumeOff, H.VolumeOffIcon, R.RiVolumeMuteLine, I.SoundOff, HO.SpeakerXMarkIcon],
  link: [L.Link, P.Link, T.IconLink, H.Link01Icon, R.RiLinkM, I.Link, HO.LinkIcon],
  file: [L.FileText, P.FileText, T.IconFileText, H.File01Icon, R.RiFileTextLine, I.Page, HO.DocumentTextIcon],
  globe: [L.Globe, P.Globe, T.IconWorld, H.Globe02Icon, R.RiGlobalLine, I.Globe, HO.GlobeAltIcon],
  keyboard: [L.Keyboard, P.Keyboard, T.IconKeyboard, H.KeyboardIcon, R.RiKeyboardLine, I.Dialpad, HO.CommandLineIcon],
  sort: [L.ArrowUpDown, P.ArrowsDownUp, T.IconArrowsSort, H.ArrowUpDownIcon, R.RiArrowUpDownLine, I.DataTransferBoth, HO.ArrowsUpDownIcon],
  more: [L.Ellipsis, P.DotsThree, T.IconDots, H.MoreHorizontalIcon, R.RiMoreLine, I.MoreHoriz, HO.EllipsisHorizontalIcon],
  expand: [L.Maximize2, P.ArrowsOutSimple, T.IconArrowsDiagonal, H.Maximize01Icon, R.RiExpandDiagonalLine, I.Expand, HO.ArrowsPointingOutIcon],
} as const

export type IconName = keyof typeof MAP
const COL: Record<IconSet, number> = { lucide: 0, phosphor: 1, tabler: 2, hugeicons: 3, remix: 4, iconoir: 5, heroicons: 6 }

type Props = { name: IconName; className?: string; active?: boolean; stroke?: number }

export function Icon({ name, className, active, stroke = 1.5 }: Props) {
  const { iconSet } = usePrefs()
  const cls = cn('size-4 shrink-0', className)
  const C = MAP[name][COL[iconSet]] as React.ComponentType<Record<string, unknown>>
  if (iconSet === 'hugeicons') return <HugeiconsIcon icon={C as never} className={cls} strokeWidth={stroke} />
  // O Phosphor tem versão preenchida: usamos no item ativo do menu, como a Stripe.
  if (iconSet === 'phosphor') return <C className={cls} weight={active ? 'fill' : 'regular'} />
  if (iconSet === 'tabler') return <C className={cls} stroke={stroke} />
  // Remix é desenhado em preenchimento: não tem espessura de traço.
  if (iconSet === 'remix') return <C className={cls} />
  return <C className={cls} strokeWidth={stroke} />
}
