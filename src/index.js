// Single entry point for the whole library. A consumer can either:
//   import { AppButton, HeroSection } from 'civic-ui'
// or register everything at once with app.use(CivicUI) and use the tags
// globally (<cui-button>, <cui-hero-section>, ...): see the docs for both.
import './styles/tokens.css'
import './styles/base.css'
import './styles/utilities.css'

// Buttons
import AppButton from './components/button/AppButton.vue'
import ButtonGroup from './components/button/ButtonGroup.vue'
import CloseButton from './components/button/CloseButton.vue'
import ColorModeToggle from './components/button/ColorModeToggle.vue'

// Feedback
import Alert from './components/feedback/Alert.vue'
import Badge from './components/feedback/Badge.vue'
import StatusDot from './components/feedback/StatusDot.vue'
import Toast from './components/feedback/Toast.vue'
import ToastContainer from './components/feedback/ToastContainer.vue'
import Spinner from './components/feedback/Spinner.vue'
import Placeholder from './components/feedback/Placeholder.vue'
import ProgressBar from './components/feedback/ProgressBar.vue'

// Navigation
import Navbar from './components/navigation/Navbar.vue'
import Breadcrumb from './components/navigation/Breadcrumb.vue'
import Pagination from './components/navigation/Pagination.vue'
import Tabs from './components/navigation/Tabs.vue'
import Dropdown from './components/navigation/Dropdown.vue'
import ScrollspyNav from './components/navigation/ScrollspyNav.vue'
import LanguageSwitcher from './components/navigation/LanguageSwitcher.vue'
import BackToTop from './components/navigation/BackToTop.vue'
import NotificationCenter from './components/navigation/NotificationCenter.vue'
import Sidebar from './components/navigation/Sidebar.vue'

// Overlays
import Modal from './components/overlay/Modal.vue'
import Tooltip from './components/overlay/Tooltip.vue'
import Popover from './components/overlay/Popover.vue'
import CookieConsent from './components/overlay/CookieConsent.vue'

// Content
import Card from './components/content/Card.vue'
import Quote from './components/content/Quote.vue'
import DescriptionList from './components/content/DescriptionList.vue'
import ConsentEmbed from './components/content/ConsentEmbed.vue'
import ImageGallery from './components/content/ImageGallery.vue'
import Lightbox from './components/overlay/Lightbox.vue'
import Accordion from './components/content/Accordion.vue'
import AccordionItem from './components/content/AccordionItem.vue'
import Collapse from './components/content/Collapse.vue'
import ListGroup from './components/content/ListGroup.vue'
import Carousel from './components/content/Carousel.vue'
import Avatar from './components/content/Avatar.vue'
import SvgImage from './components/content/SvgImage.vue'
import EmptyState from './components/content/EmptyState.vue'
import Timeline from './components/content/Timeline.vue'
import StatCard from './components/content/StatCard.vue'
import Toolbar from './components/content/Toolbar.vue'
import DataTable from './components/content/DataTable.vue'

// Forms
import TextInput from './components/forms/TextInput.vue'
import InputGroup from './components/forms/InputGroup.vue'
import Select from './components/forms/Select.vue'
import Checkbox from './components/forms/Checkbox.vue'
import Radio from './components/forms/Radio.vue'
import RadioGroup from './components/forms/RadioGroup.vue'
import Switch from './components/forms/Switch.vue'
import RangeSlider from './components/forms/RangeSlider.vue'
import SearchField from './components/forms/SearchField.vue'
import TagInput from './components/forms/TagInput.vue'
import FileUpload from './components/forms/FileUpload.vue'

// Layout (webapp shells)
import AppShell from './layout/AppShell.vue'

// Sections
import HeroSection from './sections/HeroSection.vue'
import PageIntro from './sections/PageIntro.vue'
import TopBar from './sections/TopBar.vue'
import SiteHeader from './sections/SiteHeader.vue'
import SiteFooter from './sections/SiteFooter.vue'
import AlertBanner from './sections/AlertBanner.vue'
import TeaserGrid from './sections/TeaserGrid.vue'
import CtaBanner from './sections/CtaBanner.vue'
import StatsSection from './sections/StatsSection.vue'
import NewsletterSection from './sections/NewsletterSection.vue'
import StepsSection from './sections/StepsSection.vue'
import TopicSlider from './sections/TopicSlider.vue'
import FaqSection from './sections/FaqSection.vue'
import RelatedLinks from './sections/RelatedLinks.vue'
import ListSection from './sections/ListSection.vue'
import MediaTextSection from './sections/MediaTextSection.vue'
import AppointmentSection from './sections/AppointmentSection.vue'
import TestimonialSection from './sections/TestimonialSection.vue'

import { initColorMode } from './composables/useColorMode'

// Composables
export { useToast, configureToast } from './composables/useToast'
export { useClickOutside } from './composables/useClickOutside'
export { useId } from './composables/useId'
export { useScrollspy } from './composables/useScrollspy'
export { useScrollLock } from './composables/useScrollLock'
export { useFocusTrap } from './composables/useFocusTrap'
export { useCookieConsent, revokeEmbedConsent } from './composables/useCookieConsent'
export {
  useColorMode,
  initColorMode,
  setColorMode,
  toggleColorMode,
  getColorMode,
  getResolvedColorMode,
  resetColorMode,
  COLOR_MODES
} from './composables/useColorMode'
export { vReveal } from './composables/useReveal'

// Theme utilities
export { sectionThemes, themeRoles, resolveBackground, deriveContrastText } from './utils/themes'

// Color palette configuration: see docs/theming.md#color-palette-configuration.
// `generatePalette()` fills in whatever roles you don't give (a full preset, one
// primary color, a handful of individual roles, or every role at once) and
// contrast-checks every resulting text/background pairing; `applyPalette()`
// installs the result as CSS custom properties (+ updates `sectionThemes`).
export { generatePalette, applyPalette, resetPalette, presetPalettes, paletteRoles } from './utils/palette'
export { getContrastRatio, checkContrast, ensureContrast, CONTRAST } from './utils/color'

// Security utilities: see src/utils/security.js. `configureSecurity()`
// lets a host app register its own HTML/URL sanitizer (DOMPurify, a
// backend-approved allowlist, ...) once at startup; every v-html/href/CSS
// url() sink in this library already routes through the other exports
// below, so registering a sanitizer retroactively hardens all of them.
export { configureSecurity, sanitizeHtml, sanitizeUrl, sanitizeMediaUrl, sanitizeCssUrl } from './utils/security'

// New-tab links: every link-rendering component accepts `newTab`; this
// localizes the visually hidden "(opens in a new tab)" hint they announce.
export { configureLinks } from './utils/links'
export { configureI18n, resetI18n } from './utils/i18n'

export {
  AppButton,
  ButtonGroup,
  CloseButton,
  ColorModeToggle,
  Alert,
  Badge,
  StatusDot,
  Toast,
  ToastContainer,
  Spinner,
  Placeholder,
  ProgressBar,
  Navbar,
  Breadcrumb,
  Pagination,
  Tabs,
  Dropdown,
  ScrollspyNav,
  LanguageSwitcher,
  BackToTop,
  NotificationCenter,
  Sidebar,
  Modal,
  Tooltip,
  Popover,
  CookieConsent,
  Card,
  Quote,
  DescriptionList,
  ConsentEmbed,
  ImageGallery,
  Lightbox,
  Accordion,
  AccordionItem,
  Collapse,
  ListGroup,
  Carousel,
  Avatar,
  SvgImage,
  EmptyState,
  Timeline,
  StatCard,
  Toolbar,
  DataTable,
  TextInput,
  InputGroup,
  Select,
  Checkbox,
  Radio,
  RadioGroup,
  Switch,
  RangeSlider,
  SearchField,
  TagInput,
  FileUpload,
  AppShell,
  HeroSection,
  PageIntro,
  TopBar,
  SiteHeader,
  SiteFooter,
  AlertBanner,
  TeaserGrid,
  CtaBanner,
  StatsSection,
  NewsletterSection,
  StepsSection,
  TopicSlider,
  FaqSection,
  RelatedLinks,
  ListSection,
  MediaTextSection,
  AppointmentSection,
  TestimonialSection
}

const components = {
  CuiButton: AppButton,
  CuiButtonGroup: ButtonGroup,
  CuiCloseButton: CloseButton,
  CuiColorModeToggle: ColorModeToggle,
  CuiAlert: Alert,
  CuiBadge: Badge,
  CuiStatusDot: StatusDot,
  CuiToast: Toast,
  CuiToastContainer: ToastContainer,
  CuiSpinner: Spinner,
  CuiPlaceholder: Placeholder,
  CuiProgressBar: ProgressBar,
  CuiNavbar: Navbar,
  CuiBreadcrumb: Breadcrumb,
  CuiPagination: Pagination,
  CuiTabs: Tabs,
  CuiDropdown: Dropdown,
  CuiScrollspyNav: ScrollspyNav,
  CuiLanguageSwitcher: LanguageSwitcher,
  CuiBackToTop: BackToTop,
  CuiNotificationCenter: NotificationCenter,
  CuiSidebar: Sidebar,
  CuiModal: Modal,
  CuiTooltip: Tooltip,
  CuiPopover: Popover,
  CuiCookieConsent: CookieConsent,
  CuiCard: Card,
  CuiQuote: Quote,
  CuiDescriptionList: DescriptionList,
  CuiConsentEmbed: ConsentEmbed,
  CuiImageGallery: ImageGallery,
  CuiLightbox: Lightbox,
  CuiAccordion: Accordion,
  CuiAccordionItem: AccordionItem,
  CuiCollapse: Collapse,
  CuiListGroup: ListGroup,
  CuiCarousel: Carousel,
  CuiAvatar: Avatar,
  CuiSvgImage: SvgImage,
  CuiEmptyState: EmptyState,
  CuiTimeline: Timeline,
  CuiStatCard: StatCard,
  CuiToolbar: Toolbar,
  CuiDataTable: DataTable,
  CuiTextInput: TextInput,
  CuiInputGroup: InputGroup,
  CuiSelect: Select,
  CuiCheckbox: Checkbox,
  CuiRadio: Radio,
  CuiRadioGroup: RadioGroup,
  CuiSwitch: Switch,
  CuiRangeSlider: RangeSlider,
  CuiSearchField: SearchField,
  CuiTagInput: TagInput,
  CuiFileUpload: FileUpload,
  CuiAppShell: AppShell,
  CuiHeroSection: HeroSection,
  CuiPageIntro: PageIntro,
  CuiTopBar: TopBar,
  CuiSiteHeader: SiteHeader,
  CuiSiteFooter: SiteFooter,
  CuiAlertBanner: AlertBanner,
  CuiTeaserGrid: TeaserGrid,
  CuiCtaBanner: CtaBanner,
  CuiStatsSection: StatsSection,
  CuiNewsletterSection: NewsletterSection,
  CuiStepsSection: StepsSection,
  CuiTopicSlider: TopicSlider,
  CuiFaqSection: FaqSection,
  CuiRelatedLinks: RelatedLinks,
  CuiListSection: ListSection,
  CuiMediaTextSection: MediaTextSection,
  CuiAppointmentSection: AppointmentSection,
  CuiTestimonialSection: TestimonialSection
}

// Vue plugin install: registers every component globally under its `Cui*`
// tag name so templates can use them without individual imports.
// `options.colorMode` ('light' | 'dark' | 'auto') switches on the page-wide
// dark mode at install time: same as calling initColorMode({ default }).
export default {
  install(app, options = {}) {
    for (const [name, component] of Object.entries(components)) {
      app.component(name, component)
    }
    if (options.colorMode) initColorMode({ default: options.colorMode })
  }
}
