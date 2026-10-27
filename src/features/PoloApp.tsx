"use client";

import {
  useCallback,
  useEffect,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip as ChartTooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  BadgeDollarSign,
  Bell,
  Building2,
  CalendarClock,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  Clock3,
  Command,
  ContactRound,
  CreditCard,
  Download,
  FileCheck2,
  FileText,
  Filter,
  Gauge,
  HandCoins,
  HelpCircle,
  History,
  Home,
  KeyRound,
  LayoutDashboard,
  LayoutGrid,
  List,
  LogOut,
  Mail,
  MapPin,
  Menu,
  MessageSquareText,
  Moon,
  MoreHorizontal,
  Pencil,
  Phone,
  PieChart as PieChartIcon,
  Plus,
  ReceiptText,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  SquareArrowOutUpRight,
  Sun,
  Trash2,
  TrendingDown,
  TrendingUp,
  Upload,
  UserRound,
  UsersRound,
  WalletCards,
  Wrench,
  X,
  Zap,
} from "lucide-react";
import {
  activities as seedActivities,
  contracts as seedContracts,
  documents as seedDocuments,
  expenses as seedExpenses,
  incomeSeries,
  localityIncome,
  maintenance as seedMaintenance,
  notifications as seedNotifications,
  owners,
  payments as seedPayments,
  properties as seedProperties,
  tenants,
} from "@/src/data/mock";
import { usePersistentState } from "@/src/hooks/usePersistentState";
import type {
  AppNotification,
  Contract,
  DocumentRecord,
  Expense,
  MaintenanceTicket,
  RentAdjustment,
  Payment,
  Property,
  PropertyStatus,
  TicketStatus,
} from "@/src/types";
import { formatCurrency, id } from "@/src/utils/format";
import {
  Avatar,
  Badge,
  Button,
  Currency,
  Delta,
  EmptyState,
  Field,
  IconButton,
  Logo,
  Metric,
  Modal,
  PageHeader,
  PropertyVisual,
  SectionCard,
  SelectInput,
  StatCard,
  TextInput,
  Toast,
} from "@/src/components/ui";

import { AdministrationSummary, DebtBadge, PropertyObligations, PropertyDebtSummary, ObligationsPage, RentCalculator, TrainingPage, AdjustmentHistory } from "@/src/features/Administration";
import { administrationAlerts, canApplyAdjustment, dateISO, displayDate, paymentStatus, propertyDebt, propertyTypes, todayISO } from "@/src/utils/administration";

type ModalName = "property" | "contract" | "payment" | "expense" | "ticket" | "document" | "delete" | null;

const navPrimary = [
  { path: "/dashboard", label: "Inicio", icon: LayoutDashboard },
  { path: "/properties", label: "Propiedades", icon: Building2 },
  { path: "/owners", label: "Propietarios", icon: ContactRound },
  { path: "/tenants", label: "Inquilinos", icon: UsersRound },
  { path: "/contracts", label: "Contratos", icon: FileCheck2 },
  { path: "/payments", label: "Pagos", icon: WalletCards },
  { path: "/adjustments", label: "Actualizar alquiler", icon: TrendingUp },
  { path: "/expenses", label: "Gastos y obligaciones", icon: ReceiptText },
  { path: "/maintenance", label: "Mantenimiento", icon: Wrench },
  { path: "/documents", label: "Documentos", icon: FileText },
  { path: "/reports", label: "Reportes", icon: PieChartIcon },
];

const nextTicketStatus: Record<TicketStatus, TicketStatus> = {
  Nuevo: "En proceso",
  "En proceso": "Esperando proveedor",
  "Esperando proveedor": "Resuelto",
  Resuelto: "Nuevo",
};

const appBasePath = (process.env.NEXT_PUBLIC_BASE_PATH ?? "").replace(/\/$/, "");

function fromBrowserPath(pathname: string) {
  if (appBasePath && (pathname === appBasePath || pathname.startsWith(`${appBasePath}/`))) {
    return pathname.slice(appBasePath.length) || "/";
  }
  return pathname || "/";
}

function toBrowserPath(pathname: string) {
  if (!appBasePath) return pathname;
  return pathname === "/" ? `${appBasePath}/` : `${appBasePath}${pathname}`;
}

export default function PoloApp() {
  const [path, setPath] = useState(() => typeof window === "undefined" ? "/" : fromBrowserPath(window.location.pathname));
  const [appReady, setAppReady] = useState(false);
  const [authenticated, setAuthenticated, authHydrated] = usePersistentState("nexo-auth", false);
  const [propertyData, setPropertyData] = usePersistentState<Property[]>("nexo-properties", seedProperties);
  const [contractData, setContractData] = usePersistentState<Contract[]>("nexo-contracts", seedContracts);
  const [paymentData, setPaymentData] = usePersistentState<Payment[]>("nexo-payments", seedPayments);
  const [expenseData, setExpenseData] = usePersistentState<Expense[]>("nexo-expenses", seedExpenses);
  const [ticketData, setTicketData] = usePersistentState<MaintenanceTicket[]>("nexo-maintenance", seedMaintenance);
  const [documentData, setDocumentData] = usePersistentState<DocumentRecord[]>("nexo-documents", seedDocuments);
  const [notificationData, setNotificationData] = usePersistentState<AppNotification[]>("nexo-notifications", seedNotifications);
  const [readAlerts, setReadAlerts] = usePersistentState<string[]>("nexo-read-alerts", []);
  const [today, setToday] = useState(todayISO);
  const [darkMode, setDarkMode] = usePersistentState("nexo-dark-mode", false);
  const [sidebarCollapsed, setSidebarCollapsed] = usePersistentState("nexo-sidebar-collapsed", false);
  const [propertyView, setPropertyView] = usePersistentState<"table" | "cards">("nexo-property-view", "table");
  const [mobileSidebar, setMobileSidebar] = useState(false);
  const [modal, setModal] = useState<ModalName>(null);
  const [editingPropertyId, setEditingPropertyId] = useState<string | null>(null);
  const [deletePropertyId, setDeletePropertyId] = useState<string | null>(null);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [quickOpen, setQuickOpen] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);
  const [toast, setToast] = useState("");

  useEffect(() => {
    const timer = window.setInterval(() => setToday(todayISO()), 60_000);
    const refresh = () => setToday(todayISO());
    window.addEventListener("focus", refresh);
    return () => { window.clearInterval(timer); window.removeEventListener("focus", refresh); };
  }, []);

  useEffect(() => {
    const onPop = () => setPath(fromBrowserPath(window.location.pathname));
    window.addEventListener("popstate", onPop);
    const timer = window.setTimeout(() => setAppReady(true), 650);
    return () => { window.removeEventListener("popstate", onPop); window.clearTimeout(timer); };
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setCommandOpen(true);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = darkMode ? "dark" : "light";
  }, [darkMode]);

  const navigate = useCallback((to: string) => {
    const browserPath = toBrowserPath(to);
    if (window.location.pathname !== browserPath) window.history.pushState({}, "", browserPath);
    setPath(to);
    setMobileSidebar(false);
    setNotificationsOpen(false);
    setQuickOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const showToast = useCallback((message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 2800);
  }, []);

  const openProperty = useCallback((propertyId?: string) => {
    setEditingPropertyId(propertyId ?? null);
    setModal("property");
  }, []);

  if (!appReady || !authHydrated) return <AppSkeleton />;
  if (path === "/") return <LandingPage onNavigate={navigate} />;
  if (path === "/login" || !authenticated) {
    return <LoginPage onLogin={() => { setAuthenticated(true); navigate("/dashboard"); }} />;
  }

  const currentPayments = paymentData.map((item) => ({ ...item, status: paymentStatus(item, today) }));
  const alertItems = administrationAlerts(propertyData, currentPayments, expenseData, contractData, today).map((item) => ({ ...item, read: readAlerts.includes(item.id) }));
  const notifications = [...alertItems, ...notificationData.filter((item) => item.kind === "maintenance")];
  const scheduleAdjustment = (contractId: string, adjustment: RentAdjustment) => {
    setContractData((items) => items.map((item) => item.id === contractId ? { ...item, nextAdjustment: adjustment.effectiveDate, frequency: adjustment.months === 12 ? "Anual" : `Cada ${adjustment.months} meses`, plannedAdjustment: adjustment } : item));
  };
  const applyAdjustment = (contractId: string) => {
    const contract = contractData.find((item) => item.id === contractId);
    const plan = contract?.plannedAdjustment;
    if (!contract || !plan || !canApplyAdjustment(contract, plan, today)) { showToast("El ajuste no puede aplicarse con esta fecha o importe base"); return; }
    setContractData((items) => items.map((item) => item.id === contractId ? { ...item, value: plan.newValue, nextAdjustment: plan.nextDate, adjustmentType: plan.index as Contract["adjustmentType"], plannedAdjustment: undefined, adjustments: [plan, ...(item.adjustments ?? [])] } : item));
    setPropertyData((items) => items.map((item) => item.id === contract.propertyId ? { ...item, price: plan.newValue } : item));
    showToast("Alquiler actualizado en el contrato y la propiedad");
  };
  const screenProps: ScreenProps = {
    navigate,
    scheduleAdjustment,
    applyAdjustment,
    updateExpense: (expenseId, paid) => {
      setExpenseData((items) => items.map((item) => item.id === expenseId ? { ...item, status: paid ? "Pagado" : "Pendiente", dueDate: item.dueDate ?? dateISO(item.date), paidDate: paid ? today : undefined } : item));
      showToast(paid ? "Pago de obligación registrado" : "Obligación marcada pendiente");
    },
    properties: propertyData,
    contracts: contractData,
    payments: currentPayments,
    expenses: expenseData,
    tickets: ticketData,
    documents: documentData,
    propertyView,
    setPropertyView,
    openProperty,
    openModal: setModal,
    editProperty: openProperty,
    requestDelete: (propertyId) => { setDeletePropertyId(propertyId); setModal("delete"); },
    showToast,
    updatePayment: (paymentId, status) => {
      setPaymentData((items) => items.map((item) => item.id === paymentId ? { ...item, status, paidDate: status === "Pagado" ? displayDate(today) : undefined, method: status === "Pagado" ? item.method ?? "Transferencia" : item.method } : item));
      showToast("Estado del pago actualizado");
    },
    cycleTicket: (ticketId) => {
      setTicketData((items) => items.map((item) => item.id === ticketId ? { ...item, status: nextTicketStatus[item.status] } : item));
      showToast("Ticket actualizado correctamente");
    },
  };

  return (
    <div className={`app-shell ${sidebarCollapsed ? "sidebar-is-collapsed" : ""}`}>
      <Sidebar path={path} collapsed={sidebarCollapsed} mobileOpen={mobileSidebar} onNavigate={navigate} onCollapse={() => setSidebarCollapsed((value) => !value)} onLogout={() => { setAuthenticated(false); navigate("/login"); }} />
      {mobileSidebar && <button className="mobile-overlay" aria-label="Cerrar navegación" onClick={() => setMobileSidebar(false)} />}
      <div className="app-main">
        <Header
          onMenu={() => setMobileSidebar(true)}
          onSearch={() => setCommandOpen(true)}
          onQuick={() => setQuickOpen((value) => !value)}
          quickOpen={quickOpen}
          onNotifications={() => setNotificationsOpen((value) => !value)}
          notificationCount={notifications.filter((item) => !item.read).length}
          darkMode={darkMode}
          onTheme={() => setDarkMode((value) => !value)}
          onNavigate={navigate}
          onAction={(name) => { setQuickOpen(false); setModal(name); }}
        />
        {notificationsOpen && <NotificationPanel items={notifications} onClose={() => setNotificationsOpen(false)} onRead={(notificationId) => { setReadAlerts((items) => [...new Set([...items, notificationId])]); setNotificationData((items) => items.map((item) => item.id === notificationId ? { ...item, read: true } : item)); }} />}
        <main className="page-content">{renderScreen(path, screenProps)}</main>
      </div>

      <CommandPalette open={commandOpen} onClose={() => setCommandOpen(false)} onNavigate={(to) => { setCommandOpen(false); navigate(to); }} properties={propertyData} contracts={contractData} />
      <PropertyFormModal open={modal === "property"} property={propertyData.find((item) => item.id === editingPropertyId)} onClose={() => { setModal(null); setEditingPropertyId(null); }} onSave={(property) => {
        setPropertyData((items) => property.id && items.some((item) => item.id === property.id) ? items.map((item) => item.id === property.id ? property : item) : [property, ...items]);
        setModal(null); setEditingPropertyId(null); showToast(property.id === editingPropertyId ? "Propiedad actualizada correctamente" : "Propiedad creada correctamente");
      }} />
      <ContractFormModal open={modal === "contract"} properties={propertyData} onClose={() => setModal(null)} onSave={(contract) => { setContractData((items) => [contract, ...items]); setPropertyData((items) => items.map((item) => item.id === contract.propertyId ? { ...item, contractId: contract.id, tenantId: contract.tenantId, price: contract.value, status: "Alquilada" } : item)); setModal(null); showToast("Contrato creado correctamente"); }} />
      <PaymentFormModal open={modal === "payment"} properties={propertyData} onClose={() => setModal(null)} onSave={(payment) => { setPaymentData((items) => [payment, ...items]); setModal(null); showToast("Pago registrado correctamente"); }} />
      <ExpenseFormModal open={modal === "expense"} properties={propertyData} onClose={() => setModal(null)} onSave={(expense) => { setExpenseData((items) => [expense, ...items]); setModal(null); showToast("Gasto registrado correctamente"); }} />
      <TicketFormModal open={modal === "ticket"} properties={propertyData} onClose={() => setModal(null)} onSave={(ticket) => { setTicketData((items) => [ticket, ...items]); setModal(null); showToast("Ticket creado correctamente"); }} />
      <DocumentFormModal open={modal === "document"} properties={propertyData} onClose={() => setModal(null)} onSave={(document) => { setDocumentData((items) => [document, ...items]); setModal(null); showToast("Documento agregado correctamente"); }} />
      <ConfirmDeleteModal open={modal === "delete"} onClose={() => { setModal(null); setDeletePropertyId(null); }} onConfirm={() => {
        if (deletePropertyId) setPropertyData((items) => items.filter((item) => item.id !== deletePropertyId));
        setModal(null); setDeletePropertyId(null); showToast("Propiedad eliminada"); navigate("/properties");
      }} />
      <Toast message={toast} visible={Boolean(toast)} />
    </div>
  );
}

interface ScreenProps {
  navigate: (path: string) => void;
  properties: Property[];
  contracts: Contract[];
  payments: Payment[];
  expenses: Expense[];
  tickets: MaintenanceTicket[];
  documents: DocumentRecord[];
  propertyView: "table" | "cards";
  setPropertyView: (value: "table" | "cards") => void;
  openProperty: (id?: string) => void;
  openModal: (name: ModalName) => void;
  editProperty: (id: string) => void;
  requestDelete: (id: string) => void;
  showToast: (message: string) => void;
  updatePayment: (id: string, status: Payment["status"]) => void;
  cycleTicket: (id: string) => void;
  updateExpense: (id: string, paid: boolean) => void;
  scheduleAdjustment: (id: string, plan: RentAdjustment) => void;
  applyAdjustment: (id: string) => void;
}

function renderScreen(path: string, props: ScreenProps) {
  const segments = path.split("/").filter(Boolean);
  if (path === "/dashboard") return <DashboardPage {...props} />;
  if (path === "/properties") return <PropertiesPage {...props} />;
  if (segments[0] === "properties" && segments[1]) return <PropertyDetailPage {...props} propertyId={segments[1]} />;
  if (path === "/owners") return <OwnersPage {...props} />;
  if (segments[0] === "owners" && segments[1]) return <OwnerDetailPage {...props} ownerId={segments[1]} />;
  if (path === "/tenants") return <TenantsPage {...props} />;
  if (segments[0] === "tenants" && segments[1]) return <TenantDetailPage {...props} tenantId={segments[1]} />;
  if (path === "/contracts") return <ContractsPage {...props} />;
  if (segments[0] === "contracts" && segments[1]) return <ContractDetailPage {...props} contractId={segments[1]} />;
  if (path === "/payments") return <PaymentsPage {...props} />;
  if (path === "/expenses") return <ObligationsPage {...props} openExpense={() => props.openModal("expense")} />;
  if (path === "/adjustments") return <RentCalculator key={path} {...props} onSchedule={props.scheduleAdjustment} onApply={props.applyAdjustment} />;
  if (path === "/maintenance") return <MaintenancePage {...props} />;
  if (path === "/documents") return <DocumentsPage {...props} />;
  if (path === "/reports") return <ReportsPage {...props} />;
  if (path === "/settings") return <SettingsPage {...props} />;
  if (path === "/help") return <TrainingPage {...props} />;
  if (path === "/profile") return <ProfilePage {...props} />;
  return <NotFoundPage onNavigate={props.navigate} />;
}

function AppSkeleton() {
  return <div className="app-skeleton"><aside><span className="skeleton logo-skeleton" />{Array.from({ length: 8 }, (_, index) => <span className="skeleton nav-skeleton" key={index} />)}</aside><div><header><span className="skeleton search-skeleton" /><span className="skeleton circle-skeleton" /></header><main><span className="skeleton title-skeleton" /><div className="skeleton-grid">{Array.from({ length: 4 }, (_, index) => <span className="skeleton card-skeleton" key={index} />)}</div><span className="skeleton chart-skeleton" /></main></div></div>;
}

function LandingPage({ onNavigate }: { onNavigate: (path: string) => void }) {
  return (
    <div className="landing">
      <nav><Logo /><div><Button variant="ghost" onClick={() => onNavigate("/login")}>Ingresar</Button><Button variant="primary" onClick={() => onNavigate("/login")} icon={<ArrowRight size={16} />}>Probar demo</Button></div></nav>
      <section className="landing-hero">
        <div className="landing-copy"><span className="pill"><Sparkles size={14} /> Gestión inmobiliaria, finalmente simple</span><h1>Tu inmobiliaria.<br /><em>Más simple.</em></h1><p>Propiedades, contratos, pagos y clientes organizados en un solo lugar. Menos planillas. Más claridad para decidir.</p><div className="landing-actions"><Button variant="primary" onClick={() => onNavigate("/login")} icon={<ArrowRight size={17} />}>Explorar la plataforma</Button><button className="text-link" onClick={() => onNavigate("/login")}>Ingresar a mi cuenta</button></div><div className="trust-row"><span><Check size={15} /> Sin instalación</span><span><Check size={15} /> Demo con datos reales</span><span><Check size={15} /> Hecho para Argentina</span></div></div>
        <div className="landing-product"><div className="mini-window"><div className="mini-top"><Logo compact /><span /><span /><span /></div><div className="mini-body"><aside>{Array.from({ length: 6 }, (_, i) => <i key={i} />)}</aside><main><div className="mini-greeting"><span /><small /></div><div className="mini-stats"><i /><i /><i /></div><div className="mini-chart"><b /><b /><b /><b /><b /><b /></div></main></div></div><div className="floating-proof proof-one"><span><TrendingUp size={16} /></span><div><small>Ingresos del mes</small><strong>$ 18,45 M</strong></div></div><div className="floating-proof proof-two"><span><CheckCircle2 size={16} /></span><div><small>Ocupación</small><strong>84%</strong></div></div></div>
      </section>
      <footer><span>Diseñado para inmobiliarias que quieren crecer con orden.</span><span>Mendoza, Argentina · 2026</span></footer>
    </div>
  );
}

function LoginPage({ onLogin }: { onLogin: () => void }) {
  const [email, setEmail] = useState("admin@poloinmobiliario.com");
  const [password, setPassword] = useState("123456");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!email.includes("@") || password.length < 6) { setError("Ingresá un email válido y una contraseña de al menos 6 caracteres."); return; }
    setError(""); setLoading(true); window.setTimeout(onLogin, 700);
  };
  return (
    <div className="login-page">
      <section className="login-brand-panel"><div className="login-brand-top"><Logo /></div><div className="login-message"><span className="pill pill-dark"><Zap size={14} /> Todo bajo control</span><h1>Toda tu inmobiliaria,<br />en un solo lugar.</h1><p>Gestioná propiedades, contratos, pagos e inquilinos desde una plataforma simple y organizada.</p><div className="login-preview"><div><span><Building2 size={17} /></span><p><strong>86 propiedades</strong><small>84% de ocupación</small></p></div><div><span><WalletCards size={17} /></span><p><strong>$ 18,45 M</strong><small>cobrados este mes</small></p></div><div><span><ShieldCheck size={17} /></span><p><strong>Visión completa</strong><small>sin planillas dispersas</small></p></div></div></div><small className="login-location"><MapPin size={14} /> Mendoza, Argentina</small></section>
      <section className="login-form-panel"><form onSubmit={submit}><div className="mobile-login-logo"><Logo /></div><div className="login-form-head"><span className="eyebrow">Bienvenido de nuevo</span><h2>Ingresá a tu cuenta</h2><p>Usá el acceso de demostración para explorar la plataforma.</p></div><TextInput label="Email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" /><TextInput label="Contraseña" type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" />{error && <div className="form-alert"><AlertCircle size={16} />{error}</div>}<div className="login-options"><label><input type="checkbox" defaultChecked /> Recordarme</label><button type="button" onClick={() => setError("En la demo no necesitás recuperar la contraseña.")}>¿Olvidaste tu contraseña?</button></div><Button variant="primary" type="submit" loading={loading}>Ingresar</Button><div className="demo-credentials"><span><Command size={15} /></span><div><strong>Acceso demo</strong><small>admin@poloinmobiliario.com · 123456</small></div></div><p className="security-note"><ShieldCheck size={14} /> Entorno de demostración. No se procesan datos reales.</p></form></section>
    </div>
  );
}

function Sidebar({ path, collapsed, mobileOpen, onNavigate, onCollapse, onLogout }: { path: string; collapsed: boolean; mobileOpen: boolean; onNavigate: (path: string) => void; onCollapse: () => void; onLogout: () => void }) {
  return (
    <aside className={`sidebar ${mobileOpen ? "sidebar-mobile-open" : ""}`}>
      <div className="sidebar-brand"><button onClick={() => onNavigate("/dashboard")} aria-label="Ir al inicio"><Logo compact={collapsed} /></button><IconButton label={collapsed ? "Expandir menú" : "Contraer menú"} onClick={onCollapse} className="collapse-button">{collapsed ? <ChevronRight size={17} /> : <ChevronLeft size={17} />}</IconButton></div>
      <nav className="sidebar-nav" aria-label="Navegación principal"><small>GESTIÓN</small>{navPrimary.map(({ path: itemPath, label, icon: Icon }) => { const active = path === itemPath || (itemPath !== "/dashboard" && path.startsWith(`${itemPath}/`)); return <button key={itemPath} className={active ? "active" : ""} onClick={() => onNavigate(itemPath)} title={collapsed ? label : undefined}><Icon size={18} /><span>{label}</span>{label === "Pagos" && <i className="nav-count">7</i>}</button>; })}</nav>
      <div className="sidebar-secondary"><button className={path === "/settings" ? "active" : ""} onClick={() => onNavigate("/settings")}><Settings size={18} /><span>Configuración</span></button><button className={path === "/help" ? "active" : ""} onClick={() => onNavigate("/help")}><HelpCircle size={18} /><span>Ayuda</span></button></div>
      <div className="sidebar-profile"><button onClick={() => onNavigate("/profile")}><Avatar name="Equipo inmobiliario" /><span><strong>Equipo inmobiliario</strong><small>Administrador</small></span></button><IconButton label="Cerrar sesión" onClick={onLogout}><LogOut size={17} /></IconButton></div>
    </aside>
  );
}

function Header({ onMenu, onSearch, onQuick, quickOpen, onNotifications, notificationCount, darkMode, onTheme, onNavigate, onAction }: { onMenu: () => void; onSearch: () => void; onQuick: () => void; quickOpen: boolean; onNotifications: () => void; notificationCount: number; darkMode: boolean; onTheme: () => void; onNavigate: (path: string) => void; onAction: (name: Exclude<ModalName, "delete" | null>) => void }) {
  return (
    <header className="topbar"><IconButton label="Abrir navegación" onClick={onMenu} className="mobile-menu"><Menu size={19} /></IconButton><button className="global-search" onClick={onSearch}><Search size={17} /><span>Buscar propiedad, cliente o contrato…</span><kbd>Ctrl K</kbd></button><div className="topbar-actions"><div className="quick-wrap"><IconButton label="Crear nuevo" onClick={onQuick} className="quick-button"><Plus size={19} /></IconButton>{quickOpen && <div className="quick-menu"><span>Crear nuevo</span><button onClick={() => onAction("property")}><Building2 size={17} />Nueva propiedad</button><button onClick={() => onAction("contract")}><FileCheck2 size={17} />Nuevo contrato</button><button onClick={() => onAction("payment")}><CreditCard size={17} />Registrar pago</button><button onClick={() => onAction("ticket")}><Wrench size={17} />Nuevo mantenimiento</button></div>}</div><IconButton label={darkMode ? "Usar modo claro" : "Usar modo oscuro"} onClick={onTheme}>{darkMode ? <Sun size={18} /> : <Moon size={18} />}</IconButton><button className="notification-button" aria-label="Notificaciones" onClick={onNotifications}><Bell size={18} />{notificationCount > 0 && <i>{notificationCount}</i>}</button><button className="topbar-profile" onClick={() => onNavigate("/profile")} aria-label="Abrir perfil"><Avatar name="Equipo inmobiliario" size="sm" /><ChevronDown size={14} /></button></div></header>
  );
}

function NotificationPanel({ items, onClose, onRead }: { items: AppNotification[]; onClose: () => void; onRead: (id: string) => void }) {
  const iconMap = { contract: CalendarClock, payment: BadgeDollarSign, maintenance: Wrench, update: TrendingUp };
  return <aside className="notification-panel"><div className="panel-head"><div><h2>Notificaciones</h2><p>{items.filter((item) => !item.read).length} sin leer</p></div><IconButton label="Cerrar" onClick={onClose}><X size={18} /></IconButton></div><div className="notification-list">{items.map((item) => { const Icon = iconMap[item.kind]; return <button key={item.id} className={item.read ? "is-read" : ""} onClick={() => onRead(item.id)}><span className={`notification-icon notification-${item.kind}`}><Icon size={17} /></span><span><strong>{item.title}</strong><p>{item.description}</p><small>{item.time}</small></span>{!item.read && <i />}</button>; })}</div><button className="panel-footer" onClick={() => items.forEach((item) => onRead(item.id))}>Marcar todas como leídas</button></aside>;
}

function CommandPalette({ open, onClose, onNavigate, properties, contracts }: { open: boolean; onClose: () => void; onNavigate: (path: string) => void; properties: Property[]; contracts: Contract[] }) {
  const [query, setQuery] = useState("");
  const close = () => { setQuery(""); onClose(); };
  const go = (destination: string) => { setQuery(""); onNavigate(destination); };
  const term = query.toLowerCase();
  const propertyResults = properties.filter((item) => `${item.address} ${item.locality}`.toLowerCase().includes(term)).slice(0, 4);
  const ownerResults = owners.filter((item) => item.name.toLowerCase().includes(term)).slice(0, 3);
  const tenantResults = tenants.filter((item) => item.name.toLowerCase().includes(term)).slice(0, 3);
  const contractResults = contracts.filter((item) => item.code.toLowerCase().includes(term)).slice(0, 3);
  if (!open) return null;
  const noResults = query && !propertyResults.length && !ownerResults.length && !tenantResults.length && !contractResults.length;
  return <div className="command-backdrop" onMouseDown={(event) => event.target === event.currentTarget && close()}><div className="command-dialog" role="dialog" aria-modal="true" aria-label="Búsqueda global"><div className="command-input"><Search size={19} /><input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar propiedad, cliente o contrato…" /><kbd>ESC</kbd></div><div className="command-results">{!query && <div className="command-hint"><Command size={22} /><h3>Buscá en toda tu inmobiliaria</h3><p>Probá con “Emilio”, “Martín” o “CTR-2026”.</p></div>}{query && propertyResults.length > 0 && <CommandGroup label="Propiedades">{propertyResults.map((item) => <button key={item.id} onClick={() => go(`/properties/${item.id}`)}><Building2 size={17} /><span><strong>{item.address}</strong><small>{item.locality}</small></span><ArrowRight size={15} /></button>)}</CommandGroup>}{query && ownerResults.length > 0 && <CommandGroup label="Propietarios">{ownerResults.map((item) => <button key={item.id} onClick={() => go(`/owners/${item.id}`)}><ContactRound size={17} /><span><strong>{item.name}</strong><small>{item.email}</small></span><ArrowRight size={15} /></button>)}</CommandGroup>}{query && tenantResults.length > 0 && <CommandGroup label="Inquilinos">{tenantResults.map((item) => <button key={item.id} onClick={() => go(`/tenants/${item.id}`)}><UsersRound size={17} /><span><strong>{item.name}</strong><small>{properties.find((property) => property.id === item.propertyId)?.address}</small></span><ArrowRight size={15} /></button>)}</CommandGroup>}{query && contractResults.length > 0 && <CommandGroup label="Contratos">{contractResults.map((item) => <button key={item.id} onClick={() => go(`/contracts/${item.id}`)}><FileCheck2 size={17} /><span><strong>{item.code}</strong><small>{properties.find((property) => property.id === item.propertyId)?.address}</small></span><ArrowRight size={15} /></button>)}</CommandGroup>}{noResults && <EmptyState icon={<Search />} title="No encontramos resultados" description="Probá con otro nombre, dirección o número de contrato." />}</div><div className="command-footer"><span><kbd>↑</kbd><kbd>↓</kbd> para navegar</span><span><kbd>↵</kbd> para abrir</span><span><kbd>esc</kbd> para cerrar</span></div></div></div>;
}

function CommandGroup({ label, children }: { label: string; children: ReactNode }) { return <div className="command-group"><small>{label}</small>{children}</div>; }

function DashboardPage(props: ScreenProps) {
  const upcoming = [
    { property: "Av. Emilio Civit 850", tenant: "Martín González", date: "10/09/2026", amount: 850000, status: "Próximo" },
    { property: "Arístides Villanueva 432", tenant: "Luciana Pérez", date: "15/09/2026", amount: 720000, status: "Próximo" },
    { property: "Chacras de Coria", tenant: "Federico Gómez", date: "30/09/2026", amount: 1250000, status: "Revisar" },
  ];
  const activityIcons = { payment: CreditCard, contract: FileCheck2, maintenance: Wrench, property: Building2 };
  return <div className="page dashboard-page"><PageHeader eyebrow="Martes, 1 de septiembre" title="Panel de administración" description="Este es el estado actual de tu inmobiliaria." actions={<><select className="month-select" aria-label="Período"><option>Septiembre 2026</option><option>Agosto 2026</option></select><Button variant="primary" icon={<Plus size={16} />} onClick={() => props.openProperty()}>Nueva propiedad</Button></>} /><div className="kpi-grid"><StatCard label="Propiedades" value="86" meta={<Delta>4 este mes</Delta>} icon={<Building2 size={18} />} featured /><StatCard label="Alquiladas" value="72" meta={<span className="muted-meta"><i className="mini-progress"><b style={{ width: "84%" }} /></i>84% ocupación</span>} icon={<KeyRound size={18} />} /><StatCard label="Disponibles" value="14" meta="3 con visitas agendadas" icon={<Home size={18} />} /><StatCard label="Ingresos del mes" value="$ 18,45 M" meta={<Delta>8,4% vs. agosto</Delta>} icon={<TrendingUp size={18} />} tone="success" /><StatCard label="Pagos pendientes" value="7" meta="$ 2.380.000 por cobrar" icon={<Clock3 size={18} />} tone="warning" /><StatCard label="Contratos por vencer" value="5" meta="Próximos 60 días" icon={<CalendarClock size={18} />} tone="warning" /></div><AdministrationSummary {...props} openExpense={() => props.openModal("expense")} /><div className="dashboard-grid"><SectionCard title="Ingresos por alquiler" description="Evolución de los últimos 6 meses" action={<button className="text-link" onClick={() => props.navigate("/reports")}>Ver reporte <ArrowRight size={14} /></button>} className="income-card"><div className="chart-summary"><strong>$ 18.450.000</strong><Delta>+8,4%</Delta></div><div className="chart-large"><ResponsiveContainer width="100%" height="100%"><AreaChart data={incomeSeries} margin={{ top: 12, right: 8, left: -12, bottom: 0 }}><defs><linearGradient id="incomeFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="var(--brand)" stopOpacity={0.24} /><stop offset="100%" stopColor="var(--brand)" stopOpacity={0} /></linearGradient></defs><CartesianGrid strokeDasharray="4 6" vertical={false} stroke="var(--chart-grid)" /><XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "var(--text-muted)", fontSize: 12 }} /><YAxis axisLine={false} tickLine={false} tick={{ fill: "var(--text-muted)", fontSize: 11 }} tickFormatter={(value: number) => `$${value / 1000000}M`} /><ChartTooltip content={<CurrencyTooltip />} /><Area type="monotone" dataKey="income" stroke="var(--brand)" strokeWidth={2.5} fill="url(#incomeFill)" activeDot={{ r: 5, strokeWidth: 3, fill: "var(--surface)" }} /></AreaChart></ResponsiveContainer></div></SectionCard><SectionCard title="Ocupación actual" description="Cartera administrada" className="occupancy-card"><div className="donut-wrap"><ResponsiveContainer width="100%" height={190}><PieChart><Pie data={[{ name: "Alquiladas", value: 72 }, { name: "Disponibles", value: 14 }]} innerRadius={62} outerRadius={79} startAngle={90} endAngle={-270} dataKey="value" stroke="none" cornerRadius={7}><Cell fill="var(--brand)" /><Cell fill="var(--soft-strong)" /></Pie></PieChart></ResponsiveContainer><div className="donut-center"><strong>84%</strong><span>ocupación</span></div></div><div className="occupancy-legend"><span><i className="brand-dot" />72 alquiladas</span><span><i className="soft-dot" />14 disponibles</span></div><Button variant="ghost" onClick={() => props.navigate("/properties")}>Ver propiedades <ArrowRight size={15} /></Button></SectionCard></div><div className="dashboard-bottom"><SectionCard title="Próximos vencimientos" description="Cobros y revisiones que requieren seguimiento" action={<button className="text-link" onClick={() => props.navigate("/payments")}>Ver todos <ArrowRight size={14} /></button>}><div className="table-scroll"><table><thead><tr><th>Propiedad</th><th>Inquilino</th><th>Fecha</th><th>Importe</th><th>Estado</th></tr></thead><tbody>{upcoming.map((item) => <tr key={item.property}><td><button className="table-primary" onClick={() => props.navigate(item.property.includes("Emilio") ? "/properties/p1" : "/properties")}>{item.property}</button></td><td>{item.tenant}</td><td>{item.date}</td><td><strong><Currency value={item.amount} /></strong></td><td><Badge>{item.status}</Badge></td></tr>)}</tbody></table></div></SectionCard><SectionCard title="Actividad reciente" description="Últimos movimientos"><div className="activity-list">{seedActivities.map((item) => { const Icon = activityIcons[item.kind]; return <div className="activity-item" key={item.id}><span><Icon size={16} /></span><div><strong>{item.title}</strong><p>{item.detail}</p><small>{item.time}</small></div></div>; })}</div><button className="full-link">Ver toda la actividad <ArrowRight size={14} /></button></SectionCard></div></div>;
}

function CurrencyTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) {
  if (!active || !payload?.length) return null;
  return <div className="chart-tooltip"><small>{label}</small><strong>{formatCurrency(payload[0].value)}</strong></div>;
}

function PropertiesPage(props: ScreenProps) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("Todas");
  const [type, setType] = useState("Todos");
  const [locality, setLocality] = useState("Todas");
  const [page, setPage] = useState(1);
  const filtered = props.properties.filter((property) => {
    const matchesSearch = `${property.address} ${property.locality}`.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = status === "Todas" || property.status === status;
    return matchesSearch && matchesStatus && (type === "Todos" || property.type === type) && (locality === "Todas" || property.locality === locality);
  });
  const pageCount = Math.max(1, Math.ceil(filtered.length / 10));
  const visible = filtered.slice((page - 1) * 10, page * 10);
  return <div className="page"><PageHeader title="Propiedades" description="Administrá todas las propiedades de tu cartera." actions={<Button variant="primary" icon={<Plus size={16} />} onClick={() => props.openProperty()}>Nueva propiedad</Button>} /><div className="inline-stats"><span><strong>{props.properties.length}</strong> propiedades</span><i /><span><strong>{props.properties.filter((item) => item.status === "Alquilada").length}</strong> alquiladas</span><i /><span><strong>{props.properties.filter((item) => item.status === "Disponible").length}</strong> disponibles</span></div><div className="list-toolbar"><div className="search-field"><Search size={17} /><input value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} placeholder="Buscar por dirección o localidad…" aria-label="Buscar propiedades" />{search && <IconButton label="Limpiar búsqueda" onClick={() => { setSearch(""); setPage(1); }}><X size={15} /></IconButton>}</div><div className="filter-row"><select value={type} onChange={(event) => { setType(event.target.value); setPage(1); }} aria-label="Filtrar por tipo"><option>Todos</option>{Array.from(new Set(props.properties.map((item) => item.type))).map((item) => <option key={item}>{item}</option>)}</select><select value={locality} onChange={(event) => { setLocality(event.target.value); setPage(1); }} aria-label="Filtrar por localidad"><option>Todas</option>{Array.from(new Set(props.properties.map((item) => item.locality))).map((item) => <option key={item}>{item}</option>)}</select><Button variant="ghost" icon={<Filter size={15} />}>Más filtros</Button></div><div className="view-toggle" aria-label="Cambiar vista"><IconButton label="Vista tabla" className={props.propertyView === "table" ? "active" : ""} onClick={() => props.setPropertyView("table")}><List size={17} /></IconButton><IconButton label="Vista tarjetas" className={props.propertyView === "cards" ? "active" : ""} onClick={() => props.setPropertyView("cards")}><LayoutGrid size={17} /></IconButton></div></div><div className="status-tabs">{["Todas", "Alquilada", "Disponible", "Mantenimiento"].map((item) => <button key={item} className={status === item ? "active" : ""} onClick={() => { setStatus(item); setPage(1); }}>{item === "Alquilada" ? "Alquiladas" : item === "Disponible" ? "Disponibles" : item}<span>{item === "Todas" ? props.properties.length : props.properties.filter((property) => property.status === item).length}</span></button>)}</div>{filtered.length === 0 ? <SectionCard><EmptyState icon={<Search />} title="No encontramos propiedades" description="Probá quitando algún filtro o buscá otra dirección." action={<Button onClick={() => { setSearch(""); setStatus("Todas"); setType("Todos"); setLocality("Todas"); setPage(1); }}>Limpiar filtros</Button>} /></SectionCard> : props.propertyView === "table" ? <PropertyTable {...props} properties={visible} /> : <div className="property-grid">{filtered.map((property) => <PropertyCard key={property.id} property={property} {...props} />)}</div>}{props.propertyView === "table" && filtered.length > 0 && <div className="pagination"><span>Mostrando {(page - 1) * 10 + 1}–{Math.min(page * 10, filtered.length)} de {filtered.length}</span><div><IconButton label="Página anterior" disabled={page === 1} onClick={() => setPage((value) => value - 1)}><ChevronLeft size={16} /></IconButton>{Array.from({ length: pageCount }, (_, index) => <button key={index} className={page === index + 1 ? "active" : ""} onClick={() => setPage(index + 1)}>{index + 1}</button>)}<IconButton label="Página siguiente" disabled={page === pageCount} onClick={() => setPage((value) => value + 1)}><ChevronRight size={16} /></IconButton></div></div>}</div>;
}

function PropertyTable({ properties, payments, expenses, navigate, editProperty, requestDelete, showToast }: ScreenProps & { properties: Property[] }) {
  return <SectionCard className="table-card"><div className="table-scroll"><table className="data-table"><thead><tr><th>Propiedad</th><th>Tipo</th><th>Propietario</th><th>Inquilino</th><th>Precio</th><th>Mora registrada</th><th>Estado</th><th><span className="sr-only">Acciones</span></th></tr></thead><tbody>{properties.map((property) => { const owner = owners.find((item) => item.id === property.ownerId); const tenant = tenants.find((item) => item.id === property.tenantId); return <tr key={property.id}><td><button className="property-cell" onClick={() => navigate(`/properties/${property.id}`)}><PropertyVisual variant={property.visual} /><span><strong>{property.address}</strong><small><MapPin size={12} />{property.locality}</small></span></button></td><td>{property.type}<small className="cell-sub">{property.operation ?? "Alquiler y administración"}</small></td><td>{owner?.name}</td><td>{tenant?.name ?? <span className="muted">Sin inquilino</span>}</td><td><strong>{formatCurrency(property.price)}</strong><small className="cell-sub">por mes</small></td><td><DebtBadge propertyId={property.id} payments={payments} expenses={expenses} /></td><td><Badge>{property.status}</Badge></td><td><RowMenu onView={() => navigate(`/properties/${property.id}`)} onEdit={() => editProperty(property.id)} onDuplicate={() => showToast("Propiedad duplicada como borrador")} onArchive={() => showToast("Propiedad archivada")} onDelete={() => requestDelete(property.id)} /></td></tr>; })}</tbody></table></div></SectionCard>;
}

function RowMenu({ onView, onEdit, onDuplicate, onArchive, onDelete }: { onView: () => void; onEdit: () => void; onDuplicate: () => void; onArchive: () => void; onDelete: () => void }) {
  return <details className="row-menu"><summary aria-label="Abrir acciones"><MoreHorizontal size={18} /></summary><div><button onClick={onView}><SquareArrowOutUpRight size={15} />Ver detalle</button><button onClick={onEdit}><Pencil size={15} />Editar</button><button onClick={onDuplicate}><ClipboardCheck size={15} />Duplicar</button><button onClick={onArchive}><Download size={15} />Archivar</button><button className="danger" onClick={onDelete}><Trash2 size={15} />Eliminar</button></div></details>;
}

function PropertyCard({ property, payments, expenses, navigate, editProperty }: ScreenProps & { property: Property }) {
  const owner = owners.find((item) => item.id === property.ownerId);
  const tenant = tenants.find((item) => item.id === property.tenantId);
  return <article className="property-card"><button className="property-card-visual" onClick={() => navigate(`/properties/${property.id}`)}><PropertyVisual variant={property.visual} label={property.address} /><Badge>{property.status}</Badge></button><div className="property-card-body"><div className="property-card-top"><span>{property.type} · {property.operation ?? "Alquiler y administración"}</span><IconButton label="Editar propiedad" onClick={() => editProperty(property.id)}><MoreHorizontal size={17} /></IconButton></div><button onClick={() => navigate(`/properties/${property.id}`)}><h3>{property.address}</h3><p><MapPin size={14} />{property.locality}</p></button><strong className="property-price">{formatCurrency(property.price)} <small>/ mes</small></strong><DebtBadge propertyId={property.id} payments={payments} expenses={expenses} /><div className="property-people"><span><small>Propietario</small><strong>{owner?.name}</strong></span><span><small>Inquilino</small><strong>{tenant?.name ?? "Sin inquilino"}</strong></span></div></div></article>;
}

function PropertyDetailPage(props: ScreenProps & { propertyId: string }) {
  const [tab, setTab] = useState("Resumen");
  const property = props.properties.find((item) => item.id === props.propertyId);
  if (!property) return <NotFoundPage onNavigate={() => props.navigate("/properties")} />;
  const owner = owners.find((item) => item.id === property.ownerId);
  const tenant = tenants.find((item) => item.id === property.tenantId);
  const contract = props.contracts.find((item) => item.id === property.contractId || item.propertyId === property.id);
  const propertyPayments = props.payments.filter((item) => item.propertyId === property.id);
  const propertyDocuments = props.documents.filter((item) => item.propertyId === property.id);
  const propertyTickets = props.tickets.filter((item) => item.propertyId === property.id);
  const tabs = ["Resumen", "Contrato", "Inquilino", "Propietario", "Pagos", "Obligaciones", "Documentos", "Mantenimiento"];
  return <div className="page detail-page"><button className="back-link" onClick={() => props.navigate("/properties")}><ArrowLeft size={15} />Volver a propiedades</button><div className="property-detail-hero"><div><div className="detail-title-line"><span className="eyebrow">{property.type}</span><Badge>{property.status}</Badge></div><h1>{property.address}</h1><p><MapPin size={16} />{property.locality}, Mendoza</p><strong>{formatCurrency(property.price)} <small>/ mes</small></strong></div><div className="detail-actions"><Button icon={<Pencil size={15} />} onClick={() => props.editProperty(property.id)}>Editar</Button><Button icon={<CreditCard size={15} />} onClick={() => props.openModal("payment")}>Registrar pago</Button><Button variant="primary" icon={<FileCheck2 size={15} />} onClick={() => props.openModal("contract")}>Nuevo contrato</Button><IconButton label="Más acciones"><MoreHorizontal size={18} /></IconButton></div></div><PropertyDebtSummary {...props} propertyId={property.id} /><PropertyVisual variant={property.visual} className="detail-visual" label={`Fachada de ${property.address}`} /><div className="property-metrics"><Metric label="Superficie" value={`${property.surface} m²`} icon={<Gauge size={18} />} /><Metric label="Dormitorios" value={property.bedrooms || "—"} icon={<Home size={18} />} /><Metric label="Baños" value={property.bathrooms} icon={<Building2 size={18} />} /><Metric label="Cocheras" value={property.garages || "—"} icon={<KeyRound size={18} />} /><Metric label="Expensas" value={formatCurrency(property.expenses)} icon={<ReceiptText size={18} />} /></div><div className="detail-tabs" role="tablist">{tabs.map((item) => <button key={item} role="tab" aria-selected={tab === item} className={tab === item ? "active" : ""} onClick={() => setTab(item)}>{item}{item === "Documentos" && <span>{propertyDocuments.length}</span>}{item === "Mantenimiento" && propertyTickets.length > 0 && <span>{propertyTickets.length}</span>}</button>)}</div>{tab === "Resumen" && <PropertySummary payments={props.payments} expenses={props.expenses} property={property} ownerName={owner?.name} tenantName={tenant?.name} contract={contract} onNavigate={props.navigate} />}{tab === "Contrato" && (contract ? <ContractOverview contract={contract} properties={props.properties} navigate={props.navigate} /> : <SectionCard><EmptyState icon={<FileCheck2 />} title="No hay un contrato activo" description="Creá un contrato para vincular una persona inquilina a esta propiedad." action={<Button variant="primary" onClick={() => props.openModal("contract")}>Nuevo contrato</Button>} /></SectionCard>)}{tab === "Inquilino" && (tenant ? <PersonOverview type="tenant" person={tenant} navigate={props.navigate} /> : <SectionCard><EmptyState icon={<UsersRound />} title="Propiedad sin inquilino" description="Esta propiedad está disponible y todavía no tiene un inquilino asociado." /></SectionCard>)}{tab === "Propietario" && owner && <PersonOverview type="owner" person={owner} navigate={props.navigate} />}{tab === "Obligaciones" && <PropertyObligations {...props} propertyId={property.id} openExpense={() => props.openModal("expense")} />}{tab === "Pagos" && <PaymentsMiniTable payments={propertyPayments} properties={props.properties} />}{tab === "Documentos" && (propertyDocuments.length ? <DocumentsMiniList documents={propertyDocuments} /> : <SectionCard><EmptyState icon={<FileText />} title="No hay documentos todavía" description="Los documentos asociados a esta propiedad aparecerán acá." action={<Button onClick={() => props.openModal("document")}>Subir documento</Button>} /></SectionCard>)}{tab === "Mantenimiento" && <TicketMiniList tickets={propertyTickets} properties={props.properties} onCycle={props.cycleTicket} />}</div>;
}

function PropertySummary({ property, payments, expenses, ownerName, tenantName, contract, onNavigate }: { property: Property; payments: Payment[]; expenses: Expense[]; ownerName?: string; tenantName?: string; contract?: Contract; onNavigate: (path: string) => void }) {
  const debt = propertyDebt(property.id, payments, expenses);
  return <div className="summary-grid"><SectionCard title="Información general"><div className="definition-grid"><span><small>Tipo</small><strong>{property.type}</strong></span><span><small>Estado</small><Badge>{property.status}</Badge></span><span><small>Operación</small><strong>{property.operation ?? "Alquiler y administración"}</strong></span><span><small>Uso permitido</small><strong>{property.permittedUse || "Sin especificar"}</strong></span><span><small>Provincia</small><strong>{property.province}</strong></span><span><small>Localidad</small><strong>{property.locality}</strong></span></div><div className="description-block"><small>Descripción</small><p>{property.description}</p><small>Condiciones específicas</small><p>{property.conditions || "Sin condiciones adicionales registradas."}</p><small>Infraestructura y servicios</small><p>{property.infrastructure || "Sin infraestructura adicional registrada."}</p></div></SectionCard><SectionCard title="Personas vinculadas"><button className="linked-person" onClick={() => onNavigate(`/owners/${property.ownerId}`)}><Avatar name={ownerName ?? "Propietario"} /><span><small>Propietaria</small><strong>{ownerName}</strong><em>Ver perfil <ArrowRight size={13} /></em></span></button>{tenantName ? <button className="linked-person" onClick={() => onNavigate(`/tenants/${property.tenantId}`)}><Avatar name={tenantName} /><span><small>Inquilino actual</small><strong>{tenantName}</strong><em>{debt.total ? "Con mora registrada" : "Sin mora registrada"}</em></span></button> : <div className="linked-person muted-person"><Avatar name="Sin inquilino" /><span><small>Inquilino actual</small><strong>Sin asignar</strong></span></div>}</SectionCard><SectionCard title="Estado financiero"><div className="financial-number"><small>Ingreso mensual</small><strong>{formatCurrency(property.price)}</strong><DebtBadge propertyId={property.id} payments={payments} expenses={expenses} /></div><div className="finance-lines"><span><small>Expensas</small><strong>{formatCurrency(property.expenses)}</strong></span><span><small>Próximo vencimiento</small><strong>{payments.filter((item) => item.propertyId === property.id && item.status !== "Pagado").map((item) => dateISO(item.dueDate)).filter(Boolean).sort().map(displayDate)[0] ?? "Sin pagos pendientes"}</strong></span><span><small>Último pago</small><strong>{payments.filter((item) => item.propertyId === property.id && item.status === "Pagado" && item.paidDate).map((item) => dateISO(item.paidDate!)).filter(Boolean).sort().reverse().map(displayDate)[0] ?? "Sin pagos registrados"}</strong></span></div></SectionCard><SectionCard title="Contrato actual" action={contract && <button className="text-link" onClick={() => onNavigate(`/contracts/${contract.id}`)}>Ver detalle <ArrowRight size={13} /></button>}>{contract ? <div className="contract-summary"><div><span className="document-icon"><FileCheck2 size={20} /></span><span><strong>{contract.code}</strong><small>{contract.start} — {contract.end}</small></span><Badge>{contract.status}</Badge></div><hr /><span><small>Próxima actualización</small><strong>{contract.nextAdjustment}</strong></span><span><small>Tipo de ajuste</small><strong>{contract.adjustmentType}</strong></span></div> : <EmptyState title="Sin contrato" description="No hay contrato asociado." />}</SectionCard><SectionCard title="Actividad reciente" className="summary-wide"><div className="timeline compact"><div><i /><span><strong>Pago de septiembre registrado</strong><small>05/09/2026 · {formatCurrency(property.price)}</small></span></div><div><i /><span><strong>Comprobante adjuntado al contrato</strong><small>05/09/2026 · Equipo inmobiliario</small></span></div><div><i /><span><strong>Valor del alquiler actualizado</strong><small>01/06/2026 · Según índice IPC</small></span></div></div></SectionCard></div>;
}

function OwnersPage(props: ScreenProps) {
  const [search, setSearch] = useState("");
  const filtered = owners.filter((owner) => `${owner.name} ${owner.email}`.toLowerCase().includes(search.toLowerCase()));
  return <div className="page"><PageHeader title="Propietarios" description="Personas propietarias de los inmuebles administrados." actions={<Button variant="primary" icon={<Plus size={16} />} onClick={() => props.showToast("Formulario de propietario listo para la próxima carga")}>Nuevo propietario</Button>} /><div className="list-toolbar compact-toolbar"><div className="search-field"><Search size={17} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar propietario…" /></div><Button variant="ghost" icon={<Download size={15} />} onClick={() => props.showToast("Listado exportado correctamente")}>Exportar</Button></div><SectionCard className="table-card"><div className="table-scroll"><table className="data-table"><thead><tr><th>Nombre</th><th>Contacto</th><th>Propiedades</th><th>Ingreso mensual</th><th>Estado</th><th /></tr></thead><tbody>{filtered.map((owner) => <tr key={owner.id}><td><button className="person-cell" onClick={() => props.navigate(`/owners/${owner.id}`)}><Avatar name={owner.name} /><span><strong>{owner.name}</strong><small>DNI {owner.dni}</small></span></button></td><td><span className="stacked-cell">{owner.email}<small>{owner.phone}</small></span></td><td><strong>{owner.propertyIds.length}</strong> inmuebles</td><td><strong>{formatCurrency(owner.monthlyIncome)}</strong></td><td><Badge>{owner.status}</Badge></td><td><RowMenu onView={() => props.navigate(`/owners/${owner.id}`)} onEdit={() => props.showToast("Edición de propietario habilitada")} onDuplicate={() => props.showToast("Ficha duplicada")} onArchive={() => props.showToast("Propietario archivado")} onDelete={() => props.showToast("No se puede eliminar un propietario con propiedades activas")} /></td></tr>)}</tbody></table></div></SectionCard></div>;
}

function OwnerDetailPage(props: ScreenProps & { ownerId: string }) {
  const owner = owners.find((item) => item.id === props.ownerId);
  const [tab, setTab] = useState("Propiedades");
  if (!owner) return <NotFoundPage onNavigate={() => props.navigate("/owners")} />;
  const ownerProperties = props.properties.filter((item) => item.ownerId === owner.id);
  return <div className="page detail-page"><button className="back-link" onClick={() => props.navigate("/owners")}><ArrowLeft size={15} />Volver a propietarios</button><div className="person-hero"><Avatar name={owner.name} size="lg" /><div><div><h1>{owner.name}</h1><Badge>{owner.status}</Badge></div><p>Propietario desde abril de 2023</p></div><div className="detail-actions"><Button icon={<Pencil size={15} />} onClick={() => props.showToast("Datos del propietario listos para editar")}>Editar</Button><Button variant="primary" icon={<MessageSquareText size={15} />} onClick={() => props.showToast("Mensaje preparado para enviar")}>Contactar</Button></div></div><div className="profile-kpis"><Metric label="Propiedades" value={owner.propertyIds.length} icon={<Building2 size={18} />} /><Metric label="Ingreso mensual estimado" value={formatCurrency(owner.monthlyIncome)} icon={<TrendingUp size={18} />} /><Metric label="Liquidación" value="Al día" icon={<CheckCircle2 size={18} />} /></div><div className="profile-layout"><SectionCard title="Información de contacto"><div className="contact-list"><span><UserRound size={16} /><div><small>DNI</small><strong>{owner.dni}</strong></div></span><span><Phone size={16} /><div><small>Teléfono</small><strong>{owner.phone}</strong></div></span><span><Mail size={16} /><div><small>Email</small><strong>{owner.email}</strong></div></span><span><BadgeDollarSign size={16} /><div><small>CBU</small><strong>{owner.cbu}</strong></div></span></div></SectionCard><div className="profile-main"><div className="detail-tabs">{["Propiedades", "Liquidaciones", "Gastos", "Documentos", "Actividad"].map((item) => <button key={item} className={tab === item ? "active" : ""} onClick={() => setTab(item)}>{item}</button>)}</div>{tab === "Propiedades" ? <div className="compact-property-list">{ownerProperties.map((property) => <button key={property.id} onClick={() => props.navigate(`/properties/${property.id}`)}><PropertyVisual variant={property.visual} /><span><strong>{property.address}</strong><small>{property.locality} · {property.type}</small></span><span><strong>{formatCurrency(property.price)}</strong><Badge>{property.status}</Badge></span><ChevronRight size={17} /></button>)}</div> : <SectionCard><EmptyState icon={<FileText />} title={`${tab} sin movimientos recientes`} description="La información vinculada se mostrará acá cuando haya nuevos registros." /></SectionCard>}</div></div></div>;
}

function TenantsPage(props: ScreenProps) {
  const [status, setStatus] = useState("Todos");
  const [search, setSearch] = useState("");
  const filtered = tenants.filter((tenant) => (status === "Todos" || tenant.status === status) && `${tenant.name} ${tenant.dni}`.toLowerCase().includes(search.toLowerCase()));
  return <div className="page"><PageHeader title="Inquilinos" description="Seguimiento de personas, contratos y estado de pagos." actions={<Button variant="primary" icon={<Plus size={16} />} onClick={() => props.showToast("Formulario de inquilino habilitado")}>Nuevo inquilino</Button>} /><div className="kpi-grid kpi-grid-four"><StatCard label="Inquilinos activos" value="72" meta="En 72 propiedades" icon={<UsersRound size={18} />} /><StatCard label="Al día" value="65" meta="90% de la cartera" icon={<CheckCircle2 size={18} />} tone="success" /><StatCard label="Pendientes" value="6" meta="$ 2,38 M por cobrar" icon={<Clock3 size={18} />} tone="warning" /><StatCard label="Vencidos" value="1" meta="Requiere seguimiento" icon={<AlertCircle size={18} />} tone="danger" /></div><div className="list-toolbar compact-toolbar"><div className="search-field"><Search size={17} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar por nombre o DNI…" /></div><select value={status} onChange={(event) => setStatus(event.target.value)}><option>Todos</option><option>Al día</option><option>Pendiente</option><option>Vencido</option></select></div><SectionCard className="table-card"><div className="table-scroll"><table className="data-table"><thead><tr><th>Nombre</th><th>Propiedad</th><th>Contacto</th><th>Inicio contrato</th><th>Fin contrato</th><th>Estado</th><th /></tr></thead><tbody>{filtered.map((tenant) => { const property = props.properties.find((item) => item.id === tenant.propertyId); return <tr key={tenant.id}><td><button className="person-cell" onClick={() => props.navigate(`/tenants/${tenant.id}`)}><Avatar name={tenant.name} /><span><strong>{tenant.name}</strong><small>DNI {tenant.dni}</small></span></button></td><td><button className="table-primary" onClick={() => props.navigate(`/properties/${tenant.propertyId}`)}>{property?.address}</button><small className="cell-sub">{property?.locality}</small></td><td><span className="stacked-cell">{tenant.phone}<small>{tenant.email}</small></span></td><td>{tenant.start}</td><td>{tenant.end}</td><td><Badge>{tenant.status}</Badge></td><td><RowMenu onView={() => props.navigate(`/tenants/${tenant.id}`)} onEdit={() => props.showToast("Edición de inquilino habilitada")} onDuplicate={() => props.showToast("Ficha duplicada")} onArchive={() => props.showToast("Inquilino archivado")} onDelete={() => props.showToast("No se puede eliminar una persona con contrato activo")} /></td></tr>; })}</tbody></table></div></SectionCard></div>;
}

function TenantDetailPage(props: ScreenProps & { tenantId: string }) {
  const tenant = tenants.find((item) => item.id === props.tenantId);
  if (!tenant) return <NotFoundPage onNavigate={() => props.navigate("/tenants")} />;
  const property = props.properties.find((item) => item.id === tenant.propertyId);
  const contract = props.contracts.find((item) => item.tenantId === tenant.id);
  const tenantPayments = props.payments.filter((item) => item.tenantId === tenant.id);
  const tenantTickets = props.tickets.filter((item) => item.propertyId === tenant.propertyId);
  return <div className="page detail-page"><button className="back-link" onClick={() => props.navigate("/tenants")}><ArrowLeft size={15} />Volver a inquilinos</button><div className="person-hero"><Avatar name={tenant.name} size="lg" /><div><div><h1>{tenant.name}</h1><Badge>{tenant.status}</Badge></div><p>Inquilino · DNI {tenant.dni}</p></div><div className="detail-actions"><Button icon={<Pencil size={15} />} onClick={() => props.showToast("Datos personales listos para editar")}>Editar</Button><Button variant="primary" icon={<CreditCard size={15} />} onClick={() => props.openModal("payment")}>Registrar pago</Button></div></div><div className="tenant-dashboard"><SectionCard title="Datos personales"><div className="contact-list"><span><Phone size={16} /><div><small>Teléfono</small><strong>{tenant.phone}</strong></div></span><span><Mail size={16} /><div><small>Email</small><strong>{tenant.email}</strong></div></span><span><CalendarClock size={16} /><div><small>Contrato</small><strong>{tenant.start} — {tenant.end}</strong></div></span></div></SectionCard><SectionCard title="Propiedad alquilada" action={<button className="text-link" onClick={() => props.navigate(`/properties/${tenant.propertyId}`)}>Ver propiedad <ArrowRight size={13} /></button>}>{property && <div className="tenant-property"><PropertyVisual variant={property.visual} /><div><strong>{property.address}</strong><p>{property.locality} · {property.type}</p><b>{formatCurrency(property.price)} / mes</b></div></div>}</SectionCard><SectionCard title="Estado financiero"><div className="financial-number"><small>Estado actual</small><strong>{tenant.status}</strong><Badge>{tenant.status}</Badge></div><div className="finance-lines"><span><small>Próximo vencimiento</small><strong>10/09/2026</strong></span><span><small>Importe</small><strong>{formatCurrency(property?.price ?? 0)}</strong></span></div></SectionCard><SectionCard title="Contrato" action={contract && <button className="text-link" onClick={() => props.navigate(`/contracts/${contract.id}`)}>Abrir <ArrowRight size={13} /></button>}>{contract ? <ContractOverview contract={contract} properties={props.properties} navigate={props.navigate} compact /> : <EmptyState title="Sin contrato asociado" description="No hay datos disponibles." />}</SectionCard><SectionCard title="Historial de pagos" className="tenant-wide"><PaymentsMiniTable payments={tenantPayments} properties={props.properties} /></SectionCard><SectionCard title="Documentación y mantenimiento"><div className="split-summary"><span><FileText size={18} /><div><strong>3 documentos</strong><small>DNI, garantía y contrato</small></div></span><span><Wrench size={18} /><div><strong>{tenantTickets.length} solicitudes</strong><small>{tenantTickets.filter((item) => item.status !== "Resuelto").length} en seguimiento</small></div></span></div></SectionCard></div></div>;
}

function ContractsPage(props: ScreenProps) {
  const [search, setSearch] = useState("");
  const filtered = props.contracts.filter((contract) => { const property = props.properties.find((item) => item.id === contract.propertyId); const tenant = tenants.find((item) => item.id === contract.tenantId); return `${contract.code} ${property?.address} ${tenant?.name}`.toLowerCase().includes(search.toLowerCase()); });
  return <div className="page"><PageHeader title="Contratos" description="Vigencias, actualizaciones y documentación contractual." actions={<Button variant="primary" icon={<Plus size={16} />} onClick={() => props.openModal("contract")}>Nuevo contrato</Button>} /><div className="kpi-grid kpi-grid-four"><StatCard label="Activos" value="68" meta="94% de ocupación" icon={<FileCheck2 size={18} />} /><StatCard label="Por vencer" value="5" meta="Próximos 60 días" icon={<CalendarClock size={18} />} tone="warning" /><StatCard label="Finalizados" value="3" meta="Durante 2026" icon={<History size={18} />} /><StatCard label="Actualizaciones próximas" value="8" meta="Este mes" icon={<TrendingUp size={18} />} tone="success" /></div><div className="list-toolbar compact-toolbar"><div className="search-field"><Search size={17} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar contrato, propiedad o inquilino…" /></div><select><option>Todos los estados</option><option>Vigente</option><option>Próximo a vencer</option><option>Finalizado</option></select></div><SectionCard className="table-card"><div className="table-scroll"><table className="data-table"><thead><tr><th>Propiedad</th><th>Inquilino / Propietario</th><th>Inicio</th><th>Fin</th><th>Valor</th><th>Próxima actualización</th><th>Estado</th><th /></tr></thead><tbody>{filtered.map((contract) => { const property = props.properties.find((item) => item.id === contract.propertyId); const owner = owners.find((item) => item.id === contract.ownerId); const tenant = tenants.find((item) => item.id === contract.tenantId); return <tr key={contract.id}><td><button className="contract-cell" onClick={() => props.navigate(`/contracts/${contract.id}`)}><span className="document-icon"><FileCheck2 size={18} /></span><span><strong>{property?.address}</strong><small>{contract.code}</small></span></button></td><td><span className="stacked-cell"><strong>{tenant?.name}</strong><small>{owner?.name}</small></span></td><td>{contract.start}</td><td>{contract.end}</td><td><strong>{formatCurrency(contract.value)}</strong></td><td><span className="stacked-cell"><strong>{contract.nextAdjustment}</strong><small>{contract.adjustmentType}</small></span></td><td><Badge>{contract.status}</Badge></td><td><RowMenu onView={() => props.navigate(`/contracts/${contract.id}`)} onEdit={() => props.showToast("Contrato listo para editar")} onDuplicate={() => props.showToast("Contrato duplicado como borrador")} onArchive={() => props.showToast("Contrato archivado")} onDelete={() => props.showToast("Un contrato vigente no puede eliminarse")} /></td></tr>; })}</tbody></table></div></SectionCard></div>;
}

function ContractDetailPage(props: ScreenProps & { contractId: string }) {
  const contract = props.contracts.find((item) => item.id === props.contractId);
  if (!contract) return <NotFoundPage onNavigate={() => props.navigate("/contracts")} />;
  const property = props.properties.find((item) => item.id === contract.propertyId);
  const owner = owners.find((item) => item.id === contract.ownerId);
  const tenant = tenants.find((item) => item.id === contract.tenantId);
  return <div className="page detail-page"><button className="back-link" onClick={() => props.navigate("/contracts")}><ArrowLeft size={15} />Volver a contratos</button><div className="contract-hero"><div><div className="detail-title-line"><span className="eyebrow">Documento contractual</span><Badge>{contract.status}</Badge></div><h1>Contrato #{contract.code}</h1><p>Creado el {contract.start} · Actualizado hace 3 meses</p></div><div className="detail-actions"><Button icon={<TrendingUp size={15} />} onClick={() => props.navigate("/adjustments")}>Calcular actualización</Button><Button icon={<Download size={15} />} onClick={() => props.showToast("Descarga simulada preparada")}>Descargar</Button><Button icon={<Pencil size={15} />} onClick={() => props.showToast("Contrato listo para editar")}>Editar</Button><Button variant="primary" icon={<CreditCard size={15} />} onClick={() => props.openModal("payment")}>Registrar pago</Button></div></div><div className="contract-detail-grid"><SectionCard title="Partes y propiedad" className="contract-parties">{property && <button onClick={() => props.navigate(`/properties/${property.id}`)}><span className="document-icon"><Building2 size={18} /></span><span><small>Propiedad</small><strong>{property.address}</strong><em>{property.locality}</em></span><ChevronRight size={16} /></button>}<button onClick={() => props.navigate(`/owners/${owner?.id}`)}><Avatar name={owner?.name ?? "Propietario"} /><span><small>Propietaria</small><strong>{owner?.name}</strong><em>{owner?.email}</em></span><ChevronRight size={16} /></button><button onClick={() => props.navigate(`/tenants/${tenant?.id}`)}><Avatar name={tenant?.name ?? "Inquilino"} /><span><small>Inquilino</small><strong>{tenant?.name}</strong><em>{tenant?.email}</em></span><ChevronRight size={16} /></button></SectionCard><SectionCard title="Condiciones económicas"><div className="contract-value"><small>Valor actual</small><strong>{formatCurrency(contract.value)}</strong><span>por mes</span></div><div className="definition-grid"><span><small>Depósito</small><strong>{formatCurrency(contract.deposit)}</strong></span><span><small>Frecuencia</small><strong>{contract.frequency}</strong></span><span><small>Tipo actualización</small><strong>{contract.adjustmentType}</strong></span><span><small>Próxima actualización</small><strong>{contract.nextAdjustment}</strong></span></div></SectionCard><SectionCard title="Fechas y vigencia"><div className="date-range"><div><span><CalendarClock size={16} /></span><small>Inicio</small><strong>{contract.start}</strong></div><i><b style={{ width: "32%" }} /></i><div><span><CalendarClock size={16} /></span><small>Finalización</small><strong>{contract.end}</strong></div></div><div className="contract-progress"><span>Transcurrido</span><strong>32%</strong></div></SectionCard><AdjustmentHistory contract={contract} /><SectionCard title="Documentación" action={<button className="text-link" onClick={() => props.navigate("/documents")}>Ver documentos <ArrowRight size={13} /></button>}><div className="document-summary-row"><span className="document-icon"><FileText size={20} /></span><span><strong>contrato_emilio_civit.pdf</strong><small>1,8 MB · Firmado digitalmente</small></span><Badge>Vigente</Badge></div><div className="document-summary-row"><span className="document-icon"><ClipboardCheck size={20} /></span><span><strong>inventario_ingreso.pdf</strong><small>2,1 MB · 01/02/2026</small></span><IconButton label="Descargar"><Download size={16} /></IconButton></div></SectionCard><SectionCard title="Observaciones"><p className="notes-copy">{contract.notes || "Sin observaciones adicionales para este contrato."}</p><button className="text-link" onClick={() => props.showToast("Nota agregada al contrato")}><Plus size={14} />Agregar nota</button></SectionCard></div></div>;
}

function PaymentsPage(props: ScreenProps) {
  const [status, setStatus] = useState("Todos");
  const [search, setSearch] = useState("");
  const filtered = props.payments.filter((payment) => { const tenant = tenants.find((item) => item.id === payment.tenantId); const property = props.properties.find((item) => item.id === payment.propertyId); return (status === "Todos" || payment.status === status) && `${tenant?.name} ${property?.address}`.toLowerCase().includes(search.toLowerCase()); });
  return <div className="page"><PageHeader title="Pagos" description="Controlá los alquileres cobrados y pendientes." actions={<Button variant="primary" icon={<Plus size={16} />} onClick={() => props.openModal("payment")}>Registrar pago</Button>} /><div className="kpi-grid kpi-grid-four"><StatCard label="Cobrado este mes" value="$ 18.450.000" meta={<Delta>8,4% vs. agosto</Delta>} icon={<HandCoins size={18} />} tone="success" featured /><StatCard label="Pendiente" value="$ 2.380.000" meta="7 pagos" icon={<Clock3 size={18} />} tone="warning" /><StatCard label="Vencido" value="$ 850.000" meta="1 pago requiere gestión" icon={<AlertCircle size={18} />} tone="danger" /><StatCard label="Tasa de cobranza" value="91%" meta={<span className="muted-meta"><i className="mini-progress"><b style={{ width: "91%" }} /></i>Meta mensual: 95%</span>} icon={<TrendingUp size={18} />} /></div><div className="list-toolbar"><div className="search-field"><Search size={17} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar inquilino o propiedad…" /></div><div className="filter-row"><select><option>Septiembre 2026</option><option>Agosto 2026</option></select><select value={status} onChange={(event) => setStatus(event.target.value)}><option>Todos</option><option>Pagado</option><option>Pendiente</option><option>Vencido</option></select><select><option>Todas las propiedades</option></select></div><Button variant="ghost" icon={<Download size={15} />} onClick={() => props.showToast("Reporte de pagos exportado")}>Exportar</Button></div><SectionCard className="table-card"><div className="table-scroll"><table className="data-table"><thead><tr><th>Inquilino</th><th>Propiedad</th><th>Período</th><th>Importe</th><th>Vencimiento</th><th>Fecha pago</th><th>Método</th><th>Estado</th><th /></tr></thead><tbody>{filtered.map((payment) => { const tenant = tenants.find((item) => item.id === payment.tenantId); const property = props.properties.find((item) => item.id === payment.propertyId); return <tr key={payment.id}><td><button className="person-cell" onClick={() => props.navigate(`/tenants/${tenant?.id}`)}><Avatar name={tenant?.name ?? "Inquilino"} size="sm" /><strong>{tenant?.name}</strong></button></td><td><button className="table-primary" onClick={() => props.navigate(`/properties/${property?.id}`)}>{property?.address}</button></td><td>{payment.period}</td><td><strong>{formatCurrency(payment.amount)}</strong></td><td>{payment.dueDate}</td><td>{payment.paidDate ?? "—"}</td><td>{payment.method ?? "—"}</td><td><Badge>{payment.status}</Badge></td><td><details className="row-menu"><summary aria-label="Acciones"><MoreHorizontal size={18} /></summary><div><button onClick={() => props.updatePayment(payment.id, "Pagado")}><CheckCircle2 size={15} />Marcar pagado</button><button onClick={() => props.updatePayment(payment.id, "Pendiente")}><Clock3 size={15} />Marcar pendiente</button><button onClick={() => props.showToast("Comprobante listo para descargar")}><Download size={15} />Comprobante</button></div></details></td></tr>; })}</tbody></table></div></SectionCard></div>;
}

function MaintenancePage(props: ScreenProps) {
  const [view, setView] = useState<"kanban" | "table">("kanban");
  const columns: TicketStatus[] = ["Nuevo", "En proceso", "Esperando proveedor", "Resuelto"];
  return <div className="page"><PageHeader title="Mantenimiento" description="Organizá incidencias, proveedores y seguimiento de reparaciones." actions={<Button variant="primary" icon={<Plus size={16} />} onClick={() => props.openModal("ticket")}>Nuevo ticket</Button>} /><div className="kpi-grid kpi-grid-four"><StatCard label="Abiertos" value="12" meta="4 creados esta semana" icon={<Wrench size={18} />} /><StatCard label="En proceso" value="6" meta="2 con proveedor asignado" icon={<Clock3 size={18} />} tone="warning" /><StatCard label="Urgentes" value="2" meta="Requieren atención" icon={<AlertCircle size={18} />} tone="danger" /><StatCard label="Resueltos este mes" value="18" meta={<Delta>12% vs. agosto</Delta>} icon={<CheckCircle2 size={18} />} tone="success" /></div><div className="list-toolbar compact-toolbar"><div className="search-field"><Search size={17} /><input placeholder="Buscar ticket o propiedad…" /></div><select><option>Todas las prioridades</option><option>Urgente</option><option>Alta</option><option>Media</option><option>Baja</option></select><div className="view-toggle"><IconButton label="Vista Kanban" className={view === "kanban" ? "active" : ""} onClick={() => setView("kanban")}><LayoutGrid size={17} /></IconButton><IconButton label="Vista tabla" className={view === "table" ? "active" : ""} onClick={() => setView("table")}><List size={17} /></IconButton></div></div>{view === "kanban" ? <div className="kanban-board">{columns.map((column) => <section className="kanban-column" key={column}><div className="kanban-head"><span><i className={`status-dot status-${column.toLowerCase().replaceAll(" ", "-")}`} />{column}</span><strong>{props.tickets.filter((item) => item.status === column).length}</strong></div><div>{props.tickets.filter((item) => item.status === column).map((ticket) => <TicketCard key={ticket.id} ticket={ticket} properties={props.properties} onCycle={props.cycleTicket} />)}{props.tickets.filter((item) => item.status === column).length === 0 && <div className="kanban-empty">Sin tickets</div>}</div></section>)}</div> : <SectionCard className="table-card"><div className="table-scroll"><table className="data-table"><thead><tr><th>Ticket</th><th>Propiedad</th><th>Prioridad</th><th>Creado</th><th>Estado</th><th /></tr></thead><tbody>{props.tickets.map((ticket) => { const property = props.properties.find((item) => item.id === ticket.propertyId); return <tr key={ticket.id}><td><span className="stacked-cell"><strong>{ticket.title}</strong><small>{ticket.code}</small></span></td><td>{property?.address}</td><td><Badge>{ticket.priority}</Badge></td><td>{ticket.createdAt}</td><td><Badge>{ticket.status}</Badge></td><td><Button variant="ghost" onClick={() => props.cycleTicket(ticket.id)}>Avanzar</Button></td></tr>; })}</tbody></table></div></SectionCard>}</div>;
}

function TicketCard({ ticket, properties, onCycle }: { ticket: MaintenanceTicket; properties: Property[]; onCycle: (id: string) => void }) {
  const property = properties.find((item) => item.id === ticket.propertyId);
  return <article className="ticket-card"><div className="ticket-top"><span>{ticket.code}</span><Badge>{ticket.priority}</Badge></div><h3>{ticket.title}</h3><p><MapPin size={13} />{property?.address}</p><div className="ticket-meta"><span><CalendarClock size={13} />{ticket.createdAt}</span><button onClick={() => onCycle(ticket.id)}>{ticket.status === "Resuelto" ? "Reabrir" : "Avanzar"}<ArrowRight size={13} /></button></div></article>;
}

function DocumentsPage(props: ScreenProps) {
  const [search, setSearch] = useState("");
  const filtered = props.documents.filter((document) => `${document.name} ${document.person}`.toLowerCase().includes(search.toLowerCase()));
  const typeIcon: Record<DocumentRecord["type"], ReactNode> = { Contratos: <FileCheck2 />, DNI: <ContactRound />, Garantías: <ShieldCheck />, Escrituras: <Home />, Inventarios: <ClipboardCheck />, Comprobantes: <ReceiptText />, Fotos: <Building2 />, Otros: <FileText /> };
  return <div className="page"><PageHeader title="Documentos" description="Toda la documentación importante, ordenada y disponible." actions={<Button variant="primary" icon={<Upload size={16} />} onClick={() => props.openModal("document")}>Subir documento</Button>} /><div className="document-categories">{["Contratos", "DNI", "Garantías", "Escrituras", "Inventarios", "Comprobantes"].map((type) => <button key={type}><span>{typeIcon[type as DocumentRecord["type"]]}</span><strong>{props.documents.filter((item) => item.type === type).length}</strong><small>{type}</small></button>)}</div><div className="list-toolbar compact-toolbar"><div className="search-field"><Search size={17} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar documento o persona…" /></div><select><option>Todos los tipos</option><option>Contratos</option><option>DNI</option><option>Garantías</option></select></div><SectionCard className="table-card"><div className="table-scroll"><table className="data-table"><thead><tr><th>Nombre</th><th>Tipo</th><th>Propiedad</th><th>Persona</th><th>Fecha</th><th>Tamaño</th><th /></tr></thead><tbody>{filtered.map((document) => { const property = props.properties.find((item) => item.id === document.propertyId); return <tr key={document.id}><td><span className="document-cell"><span>{typeIcon[document.type]}</span><strong>{document.name}</strong></span></td><td><span className="category-chip">{document.type}</span></td><td>{property ? <button className="table-primary" onClick={() => props.navigate(`/properties/${property.id}`)}>{property.address}</button> : "—"}</td><td>{document.person}</td><td>{document.date}</td><td>{document.size}</td><td><div className="inline-actions"><IconButton label="Descargar" onClick={() => props.showToast("Descarga simulada preparada")}><Download size={16} /></IconButton><IconButton label="Más acciones"><MoreHorizontal size={16} /></IconButton></div></td></tr>; })}</tbody></table></div></SectionCard></div>;
}

function ReportsPage(props: ScreenProps) {
  const [range, setRange] = useState("Últimos 6 meses");
  const contractStates = [{ name: "Vigentes", value: 68, color: "var(--brand)" }, { name: "Por vencer", value: 5, color: "var(--warning)" }, { name: "Finalizados", value: 3, color: "var(--soft-strong)" }];
  return <div className="page reports-page"><PageHeader title="Reportes" description="Información clave para entender la salud de tu negocio." actions={<><select className="month-select" value={range} onChange={(event) => setRange(event.target.value)}><option>Este mes</option><option>Últimos 3 meses</option><option>Últimos 6 meses</option><option>Este año</option></select><Button icon={<Download size={15} />} onClick={() => props.showToast("Reporte ejecutivo exportado")}>Exportar reporte</Button></>} /><div className="report-highlight"><div><span className="eyebrow">Resultado neto · {range}</span><strong>$ 15.690.000</strong><p>Ingresos menos gastos operativos</p></div><div><Delta>+10,2% vs. período anterior</Delta><span><TrendingUp size={18} />Rentabilidad 85,1%</span></div></div><div className="report-kpis"><Metric label="Ingresos" value="$ 18,45 M" icon={<TrendingUp size={18} />} /><Metric label="Gastos" value="$ 2,76 M" icon={<TrendingDown size={18} />} /><Metric label="Ocupación" value="84%" icon={<Building2 size={18} />} /><Metric label="Morosidad" value="4,6%" icon={<Clock3 size={18} />} /><Metric label="Contratos activos" value="68" icon={<FileCheck2 size={18} />} /></div><div className="reports-grid"><SectionCard title="Ingresos vs. gastos" description="Evolución mensual" className="report-main"><div className="chart-legend"><span><i className="brand-dot" />Ingresos</span><span><i className="warning-dot" />Gastos</span></div><div className="chart-large"><ResponsiveContainer width="100%" height="100%"><BarChart data={incomeSeries} margin={{ top: 12, right: 8, left: -8, bottom: 0 }}><CartesianGrid strokeDasharray="4 6" vertical={false} stroke="var(--chart-grid)" /><XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "var(--text-muted)", fontSize: 12 }} /><YAxis axisLine={false} tickLine={false} tick={{ fill: "var(--text-muted)", fontSize: 11 }} tickFormatter={(value: number) => `$${value / 1000000}M`} /><ChartTooltip content={<ReportTooltip />} /><Bar dataKey="income" fill="var(--brand)" radius={[5, 5, 0, 0]} maxBarSize={24} /><Bar dataKey="expense" fill="var(--warning)" radius={[5, 5, 0, 0]} maxBarSize={24} /></BarChart></ResponsiveContainer></div></SectionCard><SectionCard title="Estado de contratos" description="Distribución actual"><div className="report-donut"><ResponsiveContainer width="100%" height={200}><PieChart><Pie data={contractStates} innerRadius={58} outerRadius={78} dataKey="value" stroke="none" paddingAngle={3}>{contractStates.map((item) => <Cell key={item.name} fill={item.color} />)}</Pie></PieChart></ResponsiveContainer><div className="report-donut-center"><strong>76</strong><span>contratos</span></div></div><div className="contract-state-legend">{contractStates.map((item) => <span key={item.name}><i style={{ background: item.color }} /><small>{item.name}</small><strong>{item.value}</strong></span>)}</div></SectionCard><SectionCard title="Ingresos por localidad" description="Participación sobre el total"><div className="locality-bars">{localityIncome.map((item) => <div key={item.name}><span><strong>{item.name}</strong><small>{formatCurrency(item.value, true)}</small></span><i><b style={{ width: `${Math.round((item.value / localityIncome[0].value) * 100)}%` }} /></i></div>)}</div></SectionCard><SectionCard title="Morosidad mensual" description="Porcentaje sobre facturación"><div className="chart-medium"><ResponsiveContainer width="100%" height="100%"><LineChart data={[{ m: "Abr", v: 6.8 }, { m: "May", v: 6.2 }, { m: "Jun", v: 5.9 }, { m: "Jul", v: 5.4 }, { m: "Ago", v: 5.1 }, { m: "Sep", v: 4.6 }]}><CartesianGrid strokeDasharray="4 6" vertical={false} stroke="var(--chart-grid)" /><XAxis dataKey="m" axisLine={false} tickLine={false} tick={{ fill: "var(--text-muted)", fontSize: 12 }} /><YAxis axisLine={false} tickLine={false} tick={{ fill: "var(--text-muted)", fontSize: 11 }} tickFormatter={(value: number) => `${value}%`} /><Line type="monotone" dataKey="v" stroke="var(--danger)" strokeWidth={2.5} dot={{ r: 3, fill: "var(--surface)" }} /></LineChart></ResponsiveContainer></div><div className="insight-callout"><TrendingDown size={17} /><span><strong>Mejora sostenida</strong><small>La morosidad bajó 2,2 puntos en 6 meses.</small></span></div></SectionCard></div></div>;
}

function ReportTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ dataKey: string; value: number }>; label?: string }) { if (!active || !payload?.length) return null; return <div className="chart-tooltip"><small>{label}</small>{payload.map((item) => <strong key={item.dataKey}>{item.dataKey === "income" ? "Ingresos" : "Gastos"}: {formatCurrency(item.value)}</strong>)}</div>; }

function SettingsPage(props: ScreenProps) {
  const [saved, setSaved] = useState(false);
  return <div className="page settings-page"><PageHeader title="Configuración" description="Personalizá la información y las preferencias de tu inmobiliaria." /><div className="settings-layout"><nav><button className="active"><Building2 size={17} />Información inmobiliaria</button><button><UsersRound size={17} />Usuarios</button><button><Bell size={17} />Notificaciones</button><button><Settings size={17} />Preferencias</button></nav><div><SectionCard title="Información inmobiliaria" description="Estos datos se muestran en documentos y comunicaciones."><form className="settings-form" onSubmit={(event) => { event.preventDefault(); setSaved(true); props.showToast("Configuración guardada correctamente"); }}><TextInput label="Nombre comercial" defaultValue="POLO Inmobiliario Mendoza" /><TextInput label="Email administrativo" type="email" defaultValue="administracion@poloinmobiliario.com" /><TextInput label="Teléfono" defaultValue="+54 261 555-0147" /><TextInput label="Ubicación" defaultValue="Mendoza, Argentina" /><Field label="Descripción" className="field-wide"><textarea defaultValue="Administración integral de propiedades, contratos y cobranzas." rows={4} /></Field><div className="form-actions field-wide"><Button variant="ghost" type="button">Cancelar</Button><Button variant="primary" type="submit" icon={saved ? <Check size={15} /> : undefined}>{saved ? "Cambios guardados" : "Guardar cambios"}</Button></div></form></SectionCard><SectionCard title="Preferencias de la demo" description="Configuración local de visualización."><div className="preference-list"><span><div><strong>Notificaciones de vencimientos</strong><small>Recibir alertas 30, 15 y 5 días antes.</small></div><label className="switch"><input type="checkbox" defaultChecked /><i /></label></span><span><div><strong>Resumen semanal</strong><small>Actividad, cobros y tareas cada lunes.</small></div><label className="switch"><input type="checkbox" defaultChecked /><i /></label></span><span><div><strong>Confirmación en acciones sensibles</strong><small>Solicitar confirmación antes de eliminar.</small></div><label className="switch"><input type="checkbox" defaultChecked /><i /></label></span></div></SectionCard></div></div></div>;
}

function ProfilePage({ showToast }: ScreenProps) {
  return <div className="page profile-page"><PageHeader title="Mi perfil" description="Administrá tus datos personales y preferencias de acceso." /><div className="profile-layout"><SectionCard><div className="profile-card"><Avatar name="Equipo inmobiliario" size="lg" /><h2>Equipo inmobiliario</h2><p>Administrador</p><Badge>Activo</Badge><hr /><span><Mail size={16} />administracion@poloinmobiliario.com</span><span><MapPin size={16} />Mendoza, Argentina</span></div></SectionCard><SectionCard title="Datos personales"><form className="settings-form" onSubmit={(event) => { event.preventDefault(); showToast("Perfil actualizado correctamente"); }}><TextInput label="Nombre" defaultValue="" placeholder="Nombre" /><TextInput label="Apellido" defaultValue="" placeholder="Apellido" /><TextInput label="Email" defaultValue="administracion@poloinmobiliario.com" /><TextInput label="Teléfono" defaultValue="+54 261 555-0147" /><div className="form-actions field-wide"><Button variant="primary" type="submit">Guardar cambios</Button></div></form></SectionCard></div></div>;
}

function NotFoundPage({ onNavigate }: { onNavigate: (path: string) => void }) {
  return <div className="not-found"><Logo compact /><span>404</span><h1>Esta página no está disponible</h1><p>Es posible que el enlace haya cambiado o que la sección todavía no exista.</p><Button variant="primary" icon={<ArrowLeft size={16} />} onClick={() => onNavigate("/dashboard")}>Volver al inicio</Button></div>;
}

function ContractOverview({ contract, properties, navigate, compact = false }: { contract: Contract; properties: Property[]; navigate: (path: string) => void; compact?: boolean }) {
  const property = properties.find((item) => item.id === contract.propertyId);
  if (compact) return <div className="contract-summary"><div><span className="document-icon"><FileCheck2 size={20} /></span><span><strong>{contract.code}</strong><small>{contract.start} — {contract.end}</small></span><Badge>{contract.status}</Badge></div><hr /><span><small>Valor</small><strong>{formatCurrency(contract.value)}</strong></span><span><small>Próximo ajuste</small><strong>{contract.nextAdjustment}</strong></span></div>;
  return <SectionCard><div className="contract-overview"><div><span className="document-icon"><FileCheck2 size={22} /></span><span><small>Contrato vigente</small><strong>{contract.code}</strong><p>{property?.address}</p></span><Badge>{contract.status}</Badge></div><div className="definition-grid"><span><small>Inicio</small><strong>{contract.start}</strong></span><span><small>Finalización</small><strong>{contract.end}</strong></span><span><small>Valor actual</small><strong>{formatCurrency(contract.value)}</strong></span><span><small>Próxima actualización</small><strong>{contract.nextAdjustment}</strong></span></div><Button onClick={() => navigate(`/contracts/${contract.id}`)}>Ver contrato completo <ArrowRight size={15} /></Button></div></SectionCard>;
}

function PersonOverview({ type, person, navigate }: { type: "tenant" | "owner"; person: (typeof tenants)[number] | (typeof owners)[number]; navigate: (path: string) => void }) {
  return <SectionCard><div className="person-overview"><Avatar name={person.name} size="lg" /><h2>{person.name}</h2><p>{"email" in person ? person.email : ""}</p><div className="contact-list"><span><UserRound size={16} /><div><small>DNI</small><strong>{person.dni}</strong></div></span><span><Phone size={16} /><div><small>Teléfono</small><strong>{person.phone}</strong></div></span><span><Mail size={16} /><div><small>Email</small><strong>{person.email}</strong></div></span></div><Button variant="primary" onClick={() => navigate(`/${type === "tenant" ? "tenants" : "owners"}/${person.id}`)}>Ver perfil completo <ArrowRight size={15} /></Button></div></SectionCard>;
}

function PaymentsMiniTable({ payments, properties }: { payments: Payment[]; properties: Property[] }) {
  if (!payments.length) return <EmptyState icon={<CreditCard />} title="Sin pagos registrados" description="Los pagos asociados aparecerán en este espacio." />;
  return <div className="table-scroll"><table className="data-table mini-table"><thead><tr><th>Período</th><th>Propiedad</th><th>Importe</th><th>Vencimiento</th><th>Estado</th></tr></thead><tbody>{payments.map((payment) => <tr key={payment.id}><td>{payment.period}</td><td>{properties.find((item) => item.id === payment.propertyId)?.address}</td><td><strong>{formatCurrency(payment.amount)}</strong></td><td>{payment.dueDate}</td><td><Badge>{payment.status}</Badge></td></tr>)}</tbody></table></div>;
}

function DocumentsMiniList({ documents }: { documents: DocumentRecord[] }) {
  return <SectionCard><div className="documents-mini-list">{documents.map((document) => <div key={document.id}><span className="document-icon"><FileText size={19} /></span><span><strong>{document.name}</strong><small>{document.type} · {document.size}</small></span><Badge dot={false}>{document.date}</Badge><IconButton label="Descargar"><Download size={16} /></IconButton></div>)}</div></SectionCard>;
}

function TicketMiniList({ tickets, properties, onCycle }: { tickets: MaintenanceTicket[]; properties: Property[]; onCycle: (id: string) => void }) {
  return <SectionCard>{tickets.length ? <div className="ticket-mini-list">{tickets.map((ticket) => <TicketCard key={ticket.id} ticket={ticket} properties={properties} onCycle={onCycle} />)}</div> : <EmptyState icon={<Wrench />} title="Sin mantenimientos activos" description="Los tickets asociados a esta propiedad aparecerán acá." />}</SectionCard>;
}

function PropertyFormModal({ open, property, onClose, onSave }: { open: boolean; property?: Property; onClose: () => void; onSave: (property: Property) => void }) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const address = String(form.get("address") ?? "").trim();
    const price = Number(form.get("price"));
    if (!address || !Number.isFinite(price) || price < 0 || (String(form.get("operation")) !== "Administración" && price <= 0)) { setError("Completá la dirección y un importe válido. En administración el importe puede ser cero."); return; }
    setSubmitting(true);
    const ownerId = String(form.get("ownerId") ?? "o2");
    const saved: Property = {
      id: property?.id ?? id("p"),
      address,
      locality: String(form.get("locality") ?? "Ciudad de Mendoza"),
      province: "Mendoza",
      type: String(form.get("type") ?? "Departamento"),
      ownerId,
      tenantId: property?.tenantId,
      contractId: property?.contractId,
      price,
      expenses: Number(form.get("expenses")) || 0,
      surface: Number(form.get("surface")) || 0,
      bedrooms: Number(form.get("bedrooms")) || 0,
      bathrooms: Number(form.get("bathrooms")) || 0,
      garages: Number(form.get("garages")) || 0,
      status: String(form.get("status") ?? "Disponible") as PropertyStatus,
      description: String(form.get("description") ?? ""),
      operation: String(form.get("operation")) as Property["operation"],
      permittedUse: String(form.get("permittedUse") ?? ""),
      conditions: String(form.get("conditions") ?? ""),
      infrastructure: String(form.get("infrastructure") ?? ""),
      visual: property?.visual ?? Math.floor(Math.random() * 8) + 1,
    };
    window.setTimeout(() => { setSubmitting(false); onSave(saved); }, 550);
  };
  return <Modal open={open} onClose={onClose} title={property ? "Editar propiedad" : "Nueva propiedad"} description="Completá la información principal del inmueble." wide><form className="modal-form" onSubmit={submit}><TextInput name="address" label="Dirección" defaultValue={property?.address} placeholder="Ej. Av. San Martín 1234" required /><SelectInput name="locality" label="Localidad" defaultValue={property?.locality ?? "Ciudad de Mendoza"}><option>Ciudad de Mendoza</option><option>Godoy Cruz</option><option>Guaymallén</option><option>Maipú</option><option>Luján de Cuyo</option><option>Las Heras</option><option>Chacras de Coria</option><option>Carrodilla</option><option>Villa Nueva</option><option>Bombal</option><option>Quinta Sección</option><option>Dalvian</option></SelectInput><TextInput name="province" label="Provincia" value="Mendoza" readOnly /><SelectInput name="type" label="Tipo" defaultValue={property?.type ?? "Departamento"}>{propertyTypes.map((type) => <option key={type}>{type}</option>)}</SelectInput><SelectInput name="ownerId" label="Propietario" defaultValue={property?.ownerId ?? "o2"}>{owners.map((owner) => <option key={owner.id} value={owner.id}>{owner.name}</option>)}</SelectInput><SelectInput name="operation" label="Operación" defaultValue={property?.operation ?? "Alquiler y administración"}><option>Alquiler</option><option>Administración</option><option>Alquiler y administración</option></SelectInput><TextInput name="price" label="Alquiler mensual o importe de referencia" type="number" min="0" defaultValue={property?.price} placeholder="0 para administración sin alquiler" required /><TextInput name="expenses" label="Expensas" type="number" min="0" defaultValue={property?.expenses} placeholder="0" /><TextInput name="surface" label="Superficie (m²)" type="number" min="0" defaultValue={property?.surface} step="any" /><TextInput name="bedrooms" label="Habitaciones" type="number" min="0" defaultValue={property?.bedrooms} /><TextInput name="bathrooms" label="Baños" type="number" min="0" defaultValue={property?.bathrooms} /><TextInput name="garages" label="Cocheras" type="number" min="0" defaultValue={property?.garages} /><SelectInput name="status" label="Estado" defaultValue={property?.status ?? "Disponible"}><option>Disponible</option><option>Alquilada</option><option>Mantenimiento</option><option>Archivada</option></SelectInput><TextInput name="permittedUse" label="Uso permitido" defaultValue={property?.permittedUse} placeholder="Ej. vivienda, comercio, depósito, producción agrícola" className="field-wide" /><Field label="Condiciones específicas" className="field-wide"><textarea name="conditions" defaultValue={property?.conditions} rows={3} placeholder="Habilitación, acceso de camiones, cultivos, derecho de riego, restricciones de uso…" /></Field><Field label="Infraestructura y servicios" className="field-wide"><textarea name="infrastructure" defaultValue={property?.infrastructure} rows={3} placeholder="Potencia eléctrica, gas, agua, riego, altura libre, accesos…" /></Field><Field label="Descripción" className="field-wide"><textarea name="description" defaultValue={property?.description} rows={4} placeholder="Características principales de la propiedad…" /></Field>{error && <div className="form-alert field-wide"><AlertCircle size={16} />{error}</div>}<div className="form-actions field-wide"><Button type="button" variant="ghost" onClick={onClose}>Cancelar</Button><Button type="submit" variant="primary" loading={submitting}>{property ? "Guardar cambios" : "Crear propiedad"}</Button></div></form></Modal>;
}

function ContractFormModal({ open, properties, onClose, onSave }: { open: boolean; properties: Property[]; onClose: () => void; onSave: (contract: Contract) => void }) {
  const [submitting, setSubmitting] = useState(false);
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); const form = new FormData(event.currentTarget); const propertyId = String(form.get("propertyId")); const property = properties.find((item) => item.id === propertyId) ?? properties[0]; const tenantId = String(form.get("tenantId"));
    const contract: Contract = { id: id("c"), code: `CTR-2026-${String(43 + Math.floor(Math.random() * 50)).padStart(4, "0")}`, propertyId: property.id, ownerId: property.ownerId, tenantId, start: String(form.get("start")), end: String(form.get("end")), value: Number(form.get("value")), deposit: Number(form.get("deposit")), frequency: String(form.get("frequency")), adjustmentType: String(form.get("adjustmentType")) as Contract["adjustmentType"], nextAdjustment: String(form.get("nextAdjustment")), notes: String(form.get("notes") ?? ""), status: String(form.get("status")) as Contract["status"] };
    setSubmitting(true); window.setTimeout(() => { setSubmitting(false); onSave(contract); }, 550);
  };
  return <Modal open={open} onClose={onClose} title="Nuevo contrato" description="Vinculá una propiedad, propietario e inquilino." wide><form className="modal-form" onSubmit={submit}><SelectInput name="propertyId" label="Propiedad" defaultValue="p1">{properties.map((property) => <option key={property.id} value={property.id}>{property.address}</option>)}</SelectInput><SelectInput name="tenantId" label="Inquilino" defaultValue="t1">{tenants.map((tenant) => <option key={tenant.id} value={tenant.id}>{tenant.name}</option>)}</SelectInput><TextInput label="Propietario" value="Se completa según la propiedad" readOnly /><TextInput name="start" label="Fecha inicio" placeholder="01/09/2026" defaultValue="01/09/2026" required /><TextInput name="end" label="Fecha fin" placeholder="31/08/2028" defaultValue="31/08/2028" required /><TextInput name="value" label="Valor inicial" type="number" defaultValue="850000" required /><TextInput name="deposit" label="Depósito" type="number" defaultValue="850000" required /><SelectInput name="frequency" label="Frecuencia actualización" defaultValue="Cada 4 meses"><option>Cada 1 meses</option><option>Cada 2 meses</option><option>Cada 3 meses</option><option>Cada 4 meses</option><option>Cada 6 meses</option><option>Anual</option></SelectInput><SelectInput name="adjustmentType" label="Tipo de actualización" defaultValue="IPC"><option>IPC</option><option>ICL</option><option>Casa Propia</option><option>CER</option><option>UVA</option><option>CAC</option><option>IS</option><option>IPIM</option><option>Porcentaje fijo</option><option>Manual</option></SelectInput><TextInput name="nextAdjustment" label="Próxima actualización" defaultValue="01/01/2027" required /><SelectInput name="status" label="Estado" defaultValue="Vigente"><option>Vigente</option><option>Próximo a vencer</option><option>Finalizado</option></SelectInput><Field label="Observaciones" className="field-wide"><textarea name="notes" rows={4} placeholder="Garantías, acuerdos u observaciones…" /></Field><div className="form-actions field-wide"><Button type="button" variant="ghost" onClick={onClose}>Cancelar</Button><Button type="submit" variant="primary" loading={submitting}>Crear contrato</Button></div></form></Modal>;
}

function PaymentFormModal({ open, properties, onClose, onSave }: { open: boolean; properties: Property[]; onClose: () => void; onSave: (payment: Payment) => void }) {
  const [submitting, setSubmitting] = useState(false);
  const submit = (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); const form = new FormData(event.currentTarget); const propertyId = String(form.get("propertyId")); const property = properties.find((item) => item.id === propertyId) ?? properties[0]; const status = String(form.get("status")) as Payment["status"]; const payment: Payment = { id: id("pay"), tenantId: property.tenantId ?? "t1", propertyId, period: String(form.get("period")), amount: Number(form.get("amount")), dueDate: String(form.get("dueDate")), paidDate: status === "Pagado" ? String(form.get("date")) : undefined, method: status === "Pagado" ? String(form.get("method")) as Payment["method"] : undefined, reference: String(form.get("reference") ?? ""), notes: String(form.get("notes") ?? ""), status }; setSubmitting(true); window.setTimeout(() => { setSubmitting(false); onSave(payment); }, 500); };
  return <Modal open={open} onClose={onClose} title="Registrar pago" description="El movimiento se guardará localmente en esta demo."><form className="modal-form" onSubmit={submit}><SelectInput name="propertyId" label="Propiedad / Inquilino" defaultValue="p1" className="field-wide">{properties.filter((item) => item.tenantId).map((property) => <option key={property.id} value={property.id}>{property.address} — {tenants.find((item) => item.id === property.tenantId)?.name}</option>)}</SelectInput><TextInput name="period" label="Período" defaultValue={new Intl.DateTimeFormat("es-AR", { month: "long", year: "numeric", timeZone: "America/Argentina/Buenos_Aires" }).format(new Date())} required /><SelectInput name="status" label="Estado del alquiler" defaultValue="Pagado"><option>Pagado</option><option>Pendiente</option></SelectInput><TextInput name="dueDate" label="Vencimiento del alquiler" type="date" defaultValue={todayISO()} required /><TextInput name="amount" label="Importe" type="number" min="0.01" step="0.01" defaultValue="850000" required /><TextInput name="date" label="Fecha de pago si corresponde" type="date" defaultValue={todayISO()} required /><SelectInput name="method" label="Método" defaultValue="Transferencia"><option>Transferencia</option><option>Efectivo</option><option>Mercado Pago</option><option>Otro</option></SelectInput><TextInput name="reference" label="Referencia" placeholder="Ej. TRX-948521" className="field-wide" /><Field label="Observaciones" className="field-wide"><textarea name="notes" rows={3} /></Field><div className="form-actions field-wide"><Button type="button" variant="ghost" onClick={onClose}>Cancelar</Button><Button type="submit" variant="primary" loading={submitting}>Registrar pago</Button></div></form></Modal>;
}

function ExpenseFormModal({ open, properties, onClose, onSave }: { open: boolean; properties: Property[]; onClose: () => void; onSave: (expense: Expense) => void }) {
  const [submitting, setSubmitting] = useState(false);
  const submit = (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); const form = new FormData(event.currentTarget); const expense: Expense = { id: id("e"), concept: String(form.get("concept")), propertyId: String(form.get("propertyId")), category: String(form.get("category")) as Expense["category"], amount: Number(form.get("amount")), date: String(form.get("date")), responsible: String(form.get("responsible")), dueDate: String(form.get("dueDate")), period: String(form.get("period")), status: String(form.get("status")) as Expense["status"], paidDate: form.get("status") === "Pagado" ? todayISO() : undefined }; setSubmitting(true); window.setTimeout(() => { setSubmitting(false); onSave(expense); }, 500); };
  return <Modal open={open} onClose={onClose} title="Nueva obligación o gasto" description="Registrá el concepto, el vencimiento y quién debe abonarlo."><form className="modal-form" onSubmit={submit}><TextInput name="concept" label="Concepto" placeholder="Ej. Reparación de cañería" className="field-wide" required /><SelectInput name="propertyId" label="Propiedad" defaultValue="p1">{properties.map((property) => <option key={property.id} value={property.id}>{property.address}</option>)}</SelectInput><SelectInput name="category" label="Categoría" defaultValue="Reparación"><option>Reparación</option><option>Expensas</option><option>Tasas municipales</option><option>Impuestos</option><option>Servicios</option><option>Mantenimiento</option><option>Honorarios</option><option>Otros</option></SelectInput><TextInput name="amount" label="Importe" type="number" min="0.01" step="0.01" required /><TextInput name="date" label="Fecha de registro" type="date" defaultValue={todayISO()} required /><TextInput name="dueDate" label="Vencimiento" type="date" defaultValue={todayISO()} required /><TextInput name="period" label="Período o cuota" placeholder="Ej. octubre 2026 / cuota 10" required /><SelectInput name="status" label="Estado" defaultValue="Pendiente"><option>Pendiente</option><option>Pagado</option></SelectInput><SelectInput name="responsible" label="Responsable" defaultValue="Propietario"><option>Propietario</option><option>Inquilino</option><option>Inmobiliaria</option></SelectInput><div className="form-actions field-wide"><Button type="button" variant="ghost" onClick={onClose}>Cancelar</Button><Button type="submit" variant="primary" loading={submitting}>Guardar obligación</Button></div></form></Modal>;
}

function TicketFormModal({ open, properties, onClose, onSave }: { open: boolean; properties: Property[]; onClose: () => void; onSave: (ticket: MaintenanceTicket) => void }) {
  const [submitting, setSubmitting] = useState(false);
  const submit = (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); const form = new FormData(event.currentTarget); const ticket: MaintenanceTicket = { id: id("m"), code: `MAN-${1028 + Math.floor(Math.random() * 100)}`, title: String(form.get("title")), propertyId: String(form.get("propertyId")), priority: String(form.get("priority")) as MaintenanceTicket["priority"], status: "Nuevo", createdAt: "01/09/2026", detail: String(form.get("detail") ?? "") }; setSubmitting(true); window.setTimeout(() => { setSubmitting(false); onSave(ticket); }, 500); };
  return <Modal open={open} onClose={onClose} title="Nuevo mantenimiento" description="Registrá el problema para iniciar su seguimiento."><form className="modal-form" onSubmit={submit}><TextInput name="title" label="Título" placeholder="Ej. Pérdida de agua en cocina" className="field-wide" required /><SelectInput name="propertyId" label="Propiedad" defaultValue="p1">{properties.map((property) => <option key={property.id} value={property.id}>{property.address}</option>)}</SelectInput><SelectInput name="priority" label="Prioridad" defaultValue="Media"><option>Baja</option><option>Media</option><option>Alta</option><option>Urgente</option></SelectInput><Field label="Detalle" className="field-wide"><textarea name="detail" rows={4} placeholder="Describí brevemente el problema…" required /></Field><div className="form-actions field-wide"><Button type="button" variant="ghost" onClick={onClose}>Cancelar</Button><Button type="submit" variant="primary" loading={submitting}>Crear ticket</Button></div></form></Modal>;
}

function DocumentFormModal({ open, properties, onClose, onSave }: { open: boolean; properties: Property[]; onClose: () => void; onSave: (document: DocumentRecord) => void }) {
  const [fileName, setFileName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const submit = (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); const form = new FormData(event.currentTarget); const document: DocumentRecord = { id: id("d"), name: fileName || "documento_demo.pdf", type: String(form.get("type")) as DocumentRecord["type"], propertyId: String(form.get("propertyId")), person: String(form.get("person")), date: "01/09/2026", size: "1,2 MB" }; setSubmitting(true); window.setTimeout(() => { setSubmitting(false); setFileName(""); onSave(document); }, 600); };
  return <Modal open={open} onClose={onClose} title="Subir documento" description="La carga es simulada; no se almacena ningún archivo real."><form className="modal-form" onSubmit={submit}><label className="upload-zone field-wide"><input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(event) => setFileName(event.target.files?.[0]?.name ?? "")} /><span><Upload size={22} /></span><strong>{fileName || "Seleccioná o arrastrá un archivo"}</strong><small>PDF, JPG o PNG · Máximo simulado 10 MB</small></label><SelectInput name="type" label="Tipo" defaultValue="Contratos"><option>Contratos</option><option>DNI</option><option>Garantías</option><option>Escrituras</option><option>Inventarios</option><option>Comprobantes</option><option>Fotos</option><option>Otros</option></SelectInput><SelectInput name="propertyId" label="Propiedad" defaultValue="p1">{properties.map((property) => <option key={property.id} value={property.id}>{property.address}</option>)}</SelectInput><TextInput name="person" label="Persona asociada" defaultValue="Martín González" className="field-wide" /><div className="form-actions field-wide"><Button type="button" variant="ghost" onClick={onClose}>Cancelar</Button><Button type="submit" variant="primary" loading={submitting}>Agregar documento</Button></div></form></Modal>;
}

function ConfirmDeleteModal({ open, onClose, onConfirm }: { open: boolean; onClose: () => void; onConfirm: () => void }) {
  return <Modal open={open} onClose={onClose} title="¿Eliminar esta propiedad?" description="Esta acción no se puede deshacer."><div className="confirm-delete"><span><Trash2 size={22} /></span><p>La propiedad se eliminará de la cartera local de esta demostración. Los datos originales podrán recuperarse limpiando el almacenamiento del navegador.</p><div className="form-actions"><Button variant="ghost" onClick={onClose}>Cancelar</Button><Button variant="danger" onClick={onConfirm}>Eliminar</Button></div></div></Modal>;
}
