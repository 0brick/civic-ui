// German UI texts, `configureI18n(de)` (see utils/i18n.js and
// docs/accessibility.md → Language and labels).
export default {
  links: { newTab: '(öffnet in neuem Tab)' },
  buttonGroup: { label: 'Schaltflächengruppe' },
  avatar: { status: { neutral: 'Neutral', online: 'Online', offline: 'Offline', busy: 'Beschäftigt', away: 'Abwesend', success: 'Erfolgreich', warning: 'Warnung', danger: 'Fehler' } },
  closeButton: { label: 'Schließen' },
  colorMode: { label: 'Dunkler Modus' },
  alert: { dismiss: 'Hinweis schließen', prefix: { info: 'Information:', success: 'Erfolg:', warning: 'Warnung:', danger: 'Fehler:' } },
  toast: { dismiss: 'Benachrichtigung schließen' },
  spinner: { label: 'Wird geladen …' },
  card: { email: 'E-Mail', phone: 'Telefon' },
  statCard: { progress: '{percent} % von {goal} erreicht', up: 'Gestiegen um', down: 'Gesunken um' },
  lightbox: {
    label: 'Bildansicht',
    previous: 'Vorheriges Bild',
    next: 'Nächstes Bild',
    status: 'Bild {current} von {total}',
    open: 'Bild vergrößern: {alt}',
    openNumber: 'Bild {n} vergrößern'
  },
  consentEmbed: {
    text: 'Dieser Inhalt wird von {provider} bereitgestellt. Beim Laden wird Ihre IP-Adresse an {provider} übertragen.',
    load: 'Inhalt laden',
    loadVideo: 'Video abspielen',
    loadMap: 'Karte laden',
    remember: 'Inhalte von {provider} immer laden',
    revoke: 'Inhalte von {provider} nicht mehr immer laden',
    external: 'Auf {provider} öffnen'
  },
  descriptionList: { copy: '{term} kopieren', copied: '{term} in die Zwischenablage kopiert', copyFailed: '{term} konnte nicht kopiert werden' },
  carousel: {
    previous: 'Vorherige Folie',
    next: 'Nächste Folie',
    play: 'Automatische Wiedergabe starten',
    pause: 'Automatische Wiedergabe anhalten',
    slides: 'Folien',
    dots: 'Folien-Navigation',
    goTo: 'Zu Folie {n}',
    status: 'Folie {current} von {total}'
  },
  dataTable: { selectAll: 'Alle Zeilen auswählen', selectRow: 'Zeile {key} auswählen', empty: 'Keine Daten', loading: 'Wird geladen …', label: 'Tabelle' },
  fileUpload: {
    label: 'Dateien hochladen',
    browse: 'Datei auswählen',
    drop: 'oder hierher ziehen',
    remove: '{name} entfernen',
    rejectedType: '„{name}“ wurde nicht hinzugefügt: Dieser Dateityp ist nicht erlaubt.',
    rejectedSize: '„{name}“ wurde nicht hinzugefügt: Die Datei ist größer als {max}.',
    rejectedCount: '„{name}“ wurde nicht hinzugefügt: höchstens {max} Dateien.'
  },
  tagInput: {
    label: 'Schlagwörter',
    list: 'Hinzugefügte Einträge',
    placeholder: 'Eingeben und Enter drücken …',
    remove: '{tag} entfernen',
    rejectedLength: '„{value}“ wurde nicht hinzugefügt: höchstens {max} Zeichen.',
    rejectedCount: '„{value}“ wurde nicht hinzugefügt: höchstens {max} Einträge.',
    rejectedInvalid: '„{value}“ wurde nicht hinzugefügt: Dieser Eintrag ist ungültig.'
  },
  searchField: { label: 'Suche', placeholder: 'Suchbegriff eingeben …' },
  backToTop: { label: 'Nach oben' },
  breadcrumb: { label: 'Brotkrümelnavigation' },
  languageSwitcher: { label: 'Sprachauswahl' },
  navbar: {
    toggle: 'Navigationsmenü öffnen',
    menu: 'Menü',
    close: 'Menü schließen',
    nav: 'Hauptnavigation',
    mobileNav: 'Hauptnavigation (mobil)'
  },
  notifications: {
    title: 'Benachrichtigungen',
    unread: 'Benachrichtigungen, {count} ungelesen',
    markAllRead: 'Alle als gelesen markieren',
    unreadItem: 'Ungelesen:',
    markRead: 'Als gelesen markieren',
    emptyTitle: 'Keine Benachrichtigungen',
    emptyText: 'Sie sind auf dem neuesten Stand.'
  },
  pagination: { label: 'Seitennavigation', previous: 'Vorherige Seite', next: 'Nächste Seite', page: 'Seite {n}' },
  scrollspy: { label: 'Auf dieser Seite' },
  sidebar: { label: 'Anwendung' },
  modal: { close: 'Dialog schließen', fallbackName: 'Dialog' },
  popover: { trigger: 'Weitere Informationen' },
  cookieConsent: {
    title: 'Cookie-Einstellungen',
    text: 'Wir verwenden Cookies, damit diese Website zuverlässig und sicher funktioniert. Optionale Cookies helfen uns, das Angebot zu verbessern.',
    accept: 'Alle akzeptieren',
    reject: 'Nur notwendige',
    customize: 'Einstellungen',
    expand: 'Cookie-Einstellungen anzeigen'
  },
  appShell: { skip: 'Zum Hauptinhalt springen' },
  siteHeader: { skip: 'Zum Hauptinhalt springen' },
  alertBanner: { dismiss: 'Hinweis schließen' },
  appointment: {
    submit: 'Termin anfragen',
    requiredHint: 'Mit * markierte Felder sind Pflichtfelder.',
    sending: 'Wird gesendet …',
    success: 'Vielen Dank: wir melden uns in Kürze mit einem Terminvorschlag.',
    error: 'Ihre Anfrage konnte nicht gesendet werden. Bitte versuchen Sie es erneut oder kontaktieren Sie uns direkt.',
    privacyText: 'Ich habe die',
    privacyLink: 'Datenschutzerklärung gelesen',
    directTitle: 'Lieber direkt Kontakt aufnehmen?',
    messagePlaceholder: 'Objekt, Anliegen und Wunschtermin',
    name: 'Name',
    phone: 'Telefon (optional)',
    email: 'E-Mail',
    street: 'Straße',
    houseNumber: 'Nr.',
    zip: 'PLZ',
    city: 'Ort',
    message: 'Nachricht'
  },
  hero: { scrollDown: 'Nach unten scrollen', playVideo: 'Hintergrundvideo abspielen', pauseVideo: 'Hintergrundvideo anhalten' },
  listSection: {
    searchLabel: 'Stellen durchsuchen',
    searchPlaceholder: 'Offene Stellen durchsuchen …',
    emptyTitle: 'Keine offenen Stellen gefunden',
    emptyText: 'Passen Sie Ihre Suche an oder schauen Sie später wieder vorbei.'
  },
  newsletter: { title: 'Newsletter', label: 'E-Mail-Adresse', placeholder: 'sie@beispiel.de', submit: 'Abonnieren' },
  relatedLinks: { title: 'Mehr zum Thema' },
  siteFooter: { legal: 'Rechtliches' },
  testimonial: { rating: '{n} von 5 Sternen' },
  topBar: { label: 'Servicenavigation' },
  topicSlider: { more: 'Mehr erfahren' }
}
