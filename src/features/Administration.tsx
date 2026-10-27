"use client";

import { useState, type FormEvent } from "react";
import { AlertCircle, ArrowRight, Calculator, CheckCircle2, Plus } from "lucide-react";
import { Badge, Button, EmptyState, PageHeader, SectionCard, SelectInput, StatCard, TextInput } from "@/src/components/ui";
import { CollegeRentCalculator } from "@/src/features/CollegeRentCalculator";
import { usePersistentState } from "@/src/hooks/usePersistentState";
import type { Contract, Expense, Payment, Property, RentAdjustment } from "@/src/types";
import { formatCurrency, id } from "@/src/utils/format";
import { addMonths, calculatorReference, calculateRent, canApplyAdjustment, dateISO, displayDate, expenseCategories, expenseStatus, propertyDebt, todayISO } from "@/src/utils/administration";

interface AdministrationProps {
  properties: Property[];
  expenses: Expense[];
  payments: Payment[];
  navigate: (path: string) => void;
  updateExpense: (id: string, paid: boolean) => void;
  openExpense: () => void;
}

export function DebtBadge({ propertyId, payments, expenses }: Pick<AdministrationProps, "payments" | "expenses"> & { propertyId: string }) {
  const debt = propertyDebt(propertyId, payments, expenses);
  return <span className="debt-indicator"><Badge>{debt.total > 0 ? "Vencido" : "Al día"}</Badge>{debt.total > 0 && <strong>{formatCurrency(debt.total)}</strong>}</span>;
}

export function PropertyDebtSummary(props: Pick<AdministrationProps, "payments" | "expenses"> & { propertyId: string }) {
  const debt = propertyDebt(props.propertyId, props.payments, props.expenses);
  return <div className="kpi-grid kpi-grid-four"><StatCard label="Mora total registrada" value={formatCurrency(debt.total)} tone={debt.total ? "danger" : "success"} /><StatCard label="Alquileres vencidos" value={formatCurrency(debt.rent)} /><StatCard label="Obligaciones vencidas" value={formatCurrency(debt.obligations)} /><StatCard label="Obligaciones por vencer" value={formatCurrency(debt.pending)} /></div>;
}

export function PropertyObligations(props: AdministrationProps & { propertyId: string }) {
  return <div className="administration-section"><ObligationTable {...props} expenses={props.expenses.filter((item) => item.propertyId === props.propertyId)} /></div>;
}

export function AdministrationSummary(props: AdministrationProps) {
  const debts = props.properties.map((property) => ({ property, debt: propertyDebt(property.id, props.payments, props.expenses) }));
  const overdue = debts.filter((item) => item.debt.total > 0).sort((a, b) => b.debt.total - a.debt.total);
  return <SectionCard title="Mora por propiedad" description="Alquileres, servicios, tasas y expensas vencidos registrados." action={<Button onClick={() => props.navigate("/expenses")}>Ver obligaciones <ArrowRight size={14} /></Button>}><div className="administration-copy"><strong className="debt-total">{formatCurrency(overdue.reduce((sum, item) => sum + item.debt.total, 0))}</strong><p>{overdue.length} propiedades con deuda vencida. Los saldos se actualizan al registrar el pago.</p></div>{overdue.length ? <div className="table-scroll"><table><thead><tr><th>Propiedad</th><th>Alquileres</th><th>Obligaciones</th><th>Total en mora</th></tr></thead><tbody>{overdue.map(({ property, debt }) => <tr key={property.id}><td><button className="table-primary" onClick={() => props.navigate(`/properties/${property.id}`)}>{property.address}</button></td><td>{formatCurrency(debt.rent)}</td><td>{formatCurrency(debt.obligations)}</td><td><strong className="debt-amount">{formatCurrency(debt.total)}</strong></td></tr>)}</tbody></table></div> : <p className="administration-copy">No hay deuda vencida registrada.</p>}</SectionCard>;
}

export function ObligationsPage(props: AdministrationProps) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Todas");
  const [status, setStatus] = useState("Todos");
  const [propertyId, setPropertyId] = useState("Todas");
  const filtered = props.expenses.filter((expense) => {
    const property = props.properties.find((item) => item.id === expense.propertyId);
    return `${expense.concept} ${property?.address ?? ""} ${expense.period ?? ""}`.toLowerCase().includes(search.toLowerCase()) && (category === "Todas" || expense.category === category) && (status === "Todos" || expenseStatus(expense) === status) && (propertyId === "Todas" || expense.propertyId === propertyId);
  });
  const amount = (state: string) => props.expenses.filter((item) => expenseStatus(item) === state).reduce((sum, item) => sum + item.amount, 0);
  return <div className="page"><PageHeader title="Gastos y obligaciones" description="Controlá servicios, tasas municipales y expensas, incluso en propiedades sin contrato de alquiler." actions={<Button variant="primary" icon={<Plus size={16} />} onClick={props.openExpense}>Nueva obligación</Button>} /><div className="kpi-grid kpi-grid-four"><StatCard label="Vencido" value={formatCurrency(amount("Vencido"))} tone="danger" /><StatCard label="Por vencer" value={formatCurrency(amount("Pendiente"))} tone="warning" /><StatCard label="Pagado registrado" value={formatCurrency(amount("Pagado"))} tone="success" /><StatCard label="Expensas impagas" value={formatCurrency(props.expenses.filter((item) => item.category === "Expensas" && expenseStatus(item) !== "Pagado").reduce((sum, item) => sum + item.amount, 0))} /></div><div className="list-toolbar"><div className="search-field"><input aria-label="Buscar obligaciones" placeholder="Buscar concepto, propiedad o período…" value={search} onChange={(event) => setSearch(event.target.value)} /></div><div className="filter-row"><select aria-label="Categoría de obligación" value={category} onChange={(event) => setCategory(event.target.value)}><option>Todas</option>{expenseCategories.map((item) => <option key={item}>{item}</option>)}</select><select aria-label="Estado de obligación" value={status} onChange={(event) => setStatus(event.target.value)}><option>Todos</option><option>Pendiente</option><option>Vencido</option><option>Pagado</option></select><select aria-label="Propiedad de obligación" value={propertyId} onChange={(event) => setPropertyId(event.target.value)}><option>Todas</option>{props.properties.map((property) => <option key={property.id} value={property.id}>{property.address}</option>)}</select></div></div><ObligationTable {...props} expenses={filtered} /><p className="administration-note">La mora se calcula por la fecha de vencimiento de cada registro impago. Los gastos anteriores sin estado se conservan como pagados. Las alertas se muestran dentro de la aplicación.</p></div>;
}

function ObligationTable(props: AdministrationProps) {
  return <SectionCard title="Servicios tasas y expensas" action={<Button onClick={props.openExpense}>Agregar</Button>}>{!props.expenses.length ? <EmptyState title="Sin obligaciones registradas" description="Cargá un servicio, una tasa municipal o las expensas y su vencimiento." /> : <div className="table-scroll"><table className="data-table"><thead><tr><th>Concepto y período</th><th>Propiedad</th><th>Categoría</th><th>Responsable</th><th>Importe</th><th>Vencimiento</th><th>Estado</th><th>Fecha de pago</th><th>Acción</th></tr></thead><tbody>{props.expenses.map((expense) => <tr key={expense.id}><td><strong>{expense.concept}</strong><small className="cell-sub">{expense.period || "Sin período"}</small></td><td><button className="table-primary" onClick={() => props.navigate(`/properties/${expense.propertyId}`)}>{props.properties.find((item) => item.id === expense.propertyId)?.address ?? "Propiedad eliminada"}</button></td><td>{expense.category}</td><td>{expense.responsible}</td><td>{formatCurrency(expense.amount)}</td><td>{expense.dueDate ? displayDate(expense.dueDate) : "Sin vencimiento"}</td><td><Badge>{expenseStatus(expense)}</Badge></td><td>{expense.paidDate ? displayDate(expense.paidDate) : "—"}</td><td><Button onClick={() => props.updateExpense(expense.id, expenseStatus(expense) !== "Pagado")}>{expenseStatus(expense) === "Pagado" ? "Marcar pendiente" : "Registrar pago"}</Button></td></tr>)}</tbody></table></div>}</SectionCard>;
}

export function RentCalculator({ contracts, properties, onSchedule, onApply, showToast, initialContractId }: { contracts: Contract[]; properties: Property[]; onSchedule: (contractId: string, adjustment: RentAdjustment) => void; onApply: (contractId: string) => void; showToast: (message: string) => void; initialContractId?: string }) {
  const active = contracts.filter((item) => item.status !== "Finalizado" && dateISO(item.end) >= todayISO() && properties.some((property) => property.id === item.propertyId));
  const [selectedId, setSelectedId] = useState(initialContractId ?? active[0]?.id ?? "");
  const contract = active.find((item) => item.id === selectedId);
  return <div className="page"><PageHeader title="Actualización de alquileres" description="Calculá, programá y aplicá el importe acordado en el contrato." /><SectionCard title="Contrato a actualizar"><div className="administration-copy"><SelectInput label="Contrato" value={selectedId} onChange={(event) => setSelectedId(event.target.value)}><option value="">Seleccioná un contrato</option>{active.map((item) => <option key={item.id} value={item.id}>{properties.find((property) => property.id === item.propertyId)?.address} · {item.code}</option>)}</SelectInput></div></SectionCard>{contract ? <CalculatorForm key={`${contract.id}-${contract.value}-${contract.nextAdjustment}`} contract={contract} onSchedule={onSchedule} onApply={onApply} showToast={showToast} /> : <SectionCard><EmptyState icon={<Calculator />} title="Seleccioná un contrato vigente" description="Primero cargá el contrato con su importe y la próxima fecha de actualización." /></SectionCard>}</div>;
}

function CalculatorForm({ contract, onSchedule, onApply, showToast }: { contract: Contract; onSchedule: (contractId: string, adjustment: RentAdjustment) => void; onApply: (contractId: string) => void; showToast: (message: string) => void }) {
  const saved = contract.plannedAdjustment;
  const [mode, setMode] = useState("Importe calculado");
  const [first, setFirst] = useState(saved ? String(saved.newValue) : "");
  const [last, setLast] = useState("");
  const [index, setIndex] = useState(saved?.index ?? contract.adjustmentType);
  const [effective, setEffective] = useState(dateISO(saved?.effectiveDate ?? contract.nextAdjustment));
  const [months, setMonths] = useState(saved?.months ?? (contract.frequency === "Anual" ? 12 : Number(contract.frequency.match(/\d+/)?.[0]) || 4));
  const [source, setSource] = useState(saved?.source ?? "");
  const [error, setError] = useState("");
  let result: ReturnType<typeof calculateRent> | undefined;
  let calculationError = "";
  try { if (first !== "" && (mode !== "Índices" || last !== "")) result = calculateRent(contract.value, mode, Number(first), Number(last)); } catch (error) { calculationError = (error as Error).message; }
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const date = dateISO(effective);
    if (!result || !date || date < dateISO(contract.start) || date > dateISO(contract.end) || !source.trim()) { setError("Revisá el cálculo, la fuente y una fecha de actualización dentro de la vigencia del contrato."); return; }
    onSchedule(contract.id, { id: id("adjust"), baseValue: contract.value, coefficient: result.coefficient, newValue: result.newValue, effectiveDate: date, nextDate: addMonths(date, months), months, index, method: mode, source: source.trim() });
    setError(""); showToast("Actualización programada. El importe actual se mantiene hasta aplicarla.");
  };
  return <><CollegeRentCalculator contract={contract} onConsult={(consultation) => {
    setMode("Importe calculado"); setFirst(""); setLast(""); setIndex(consultation.index); setMonths(consultation.months); setEffective(consultation.effectiveDate);
    setSource(`ARquiler · ${displayDate(consultation.baseDate)} a ${displayDate(consultation.effectiveDate)} · base consultada ${formatCurrency(consultation.amount)} · ${consultation.url}`);
    setError("");
  }} /><SectionCard title="Guardar el resultado en el contrato" description="Ingresá el nuevo alquiler obtenido en ARquiler o elegí una forma de cálculo manual."><form className="modal-form" onSubmit={submit}><TextInput label="Alquiler actual" value={formatCurrency(contract.value)} readOnly /><SelectInput label="Índice pactado" value={index} onChange={(event) => setIndex(event.target.value as Contract["adjustmentType"])}>{["IPC", "ICL", "Casa Propia", "CER", "UVA", "CAC", "IS", "IPIM", "Porcentaje fijo", "Manual"].map((item) => <option key={item}>{item}</option>)}</SelectInput><SelectInput label="Forma de cálculo" value={mode} onChange={(event) => { setMode(event.target.value); setFirst(""); setLast(""); }}><option>Importe calculado</option><option>Coeficiente</option><option>Índices</option><option>Porcentaje</option></SelectInput><TextInput label={mode === "Importe calculado" ? "Nuevo alquiler obtenido" : mode === "Índices" ? "Índice inicial" : mode === "Porcentaje" ? "Variación acumulada del período (%)" : "Coeficiente multiplicador"} type="number" step="any" min={mode === "Porcentaje" ? "-99.9999" : "0.000000001"} value={first} onChange={(event) => setFirst(event.target.value)} required hint={mode === "Importe calculado" ? "Ingresá el importe que muestra ARquiler para la fecha de actualización indicada." : mode === "Coeficiente" ? "Ejemplo: 1,15 equivale a un aumento del 15 %." : "Cargá los valores del período completo, según el contrato."} />{mode === "Índices" && <TextInput label="Índice final" type="number" step="any" min="0.000000001" value={last} onChange={(event) => setLast(event.target.value)} required />}<TextInput label="Fecha de actualización" type="date" value={effective} min={dateISO(contract.start)} max={dateISO(contract.end)} onChange={(event) => setEffective(event.target.value)} required /><SelectInput label="Actualizar cada" value={months} onChange={(event) => setMonths(Number(event.target.value))}>{Array.from({ length: 12 }, (_, value) => value + 1).map((value) => <option key={value} value={value}>{value} {value === 1 ? "mes" : "meses"}</option>)}</SelectInput><TextInput label="Fuente y período consultado" className="field-wide" value={source} onChange={(event) => setSource(event.target.value)} placeholder="Ej. ICL BCRA, valores al inicio y fin del período" required /><p className="administration-note field-wide">Referencia: <a className="text-link" href={calculatorReference} target="_blank" rel="noreferrer">calculadora del Colegio de Corredores de Mendoza</a>. ARquiler consulta sus índices al calcular. El importe resultante se ingresa en este formulario para guardarlo. También podés usar índices o coeficientes manuales según lo pactado.</p>{result && <div className="calculation-result field-wide" role="status"><span>Nuevo alquiler calculado</span><strong>{formatCurrency(result.newValue)}</strong><p>{formatCurrency(contract.value)} × {result.coefficient.toLocaleString("es-AR", { maximumFractionDigits: 8 })} · Variación {((result.coefficient - 1) * 100).toLocaleString("es-AR", { maximumFractionDigits: 2 })} %</p><p>Corresponde desde {displayDate(effective)} · Siguiente revisión {displayDate(addMonths(effective, months))}</p></div>}{(error || calculationError) && <p className="form-alert field-wide" role="alert"><AlertCircle size={16} />{error || calculationError}</p>}<div className="form-actions field-wide"><Button type="submit" variant="primary" disabled={!result}>Guardar programación</Button></div></form></SectionCard>{saved && <SectionCard title="Actualización programada"><div className="administration-copy"><p><strong>{formatCurrency(saved.baseValue)} → {formatCurrency(saved.newValue)}</strong> desde {displayDate(saved.effectiveDate)} · {saved.index}</p><p>Fuente: {saved.source}. Próxima revisión: {displayDate(saved.nextDate)}.</p><p>Al aplicar se actualizan el contrato y el precio de la propiedad. Los pagos anteriores conservan su importe.</p><Button variant="primary" disabled={!canApplyAdjustment(contract, saved)} onClick={() => onApply(contract.id)}>Aplicar actualización guardada</Button>{!canApplyAdjustment(contract, saved) && <p className="administration-note">Disponible al llegar la fecha pactada, dentro de un contrato vigente y sin cambios en el importe base.</p>}</div></SectionCard>}<AdjustmentHistory contract={contract} /></>;
}

export function AdjustmentHistory({ contract }: { contract: Contract }) {
  return <SectionCard title="Historial de actualizaciones"><div className="administration-copy">{contract.adjustments?.length ? contract.adjustments.map((item) => <p key={item.id}><strong>{displayDate(item.effectiveDate)} · {item.index}</strong><br />{formatCurrency(item.baseValue)} → {formatCurrency(item.newValue)} · Coeficiente {item.coefficient.toLocaleString("es-AR", { maximumFractionDigits: 8 })}<br />{item.source}</p>) : <p>No hay actualizaciones aplicadas registradas.</p>}</div></SectionCard>;
}

const trainingModules = [
  { id: "properties", title: "Cargar y administrar inmuebles", path: "/properties", text: "Creá la propiedad, elegí el tipo y la operación: alquiler, administración o ambas. Indicá uso permitido, infraestructura y condiciones como habilitación comercial, potencia eléctrica o derecho de riego." },
  { id: "obligations", title: "Controlar servicios tasas y expensas", path: "/expenses", text: "Cargá una obligación por período, con importe, responsable y vencimiento. Registrá su pago cuando se abone; hacerlo elimina esa deuda de la mora y de las alertas." },
  { id: "arrears", title: "Revisar la mora y las alertas", path: "/dashboard", text: "Consultá la mora por propiedad en Inicio y en cada ficha. Los alquileres y obligaciones impagos pasan a vencidos al día siguiente del vencimiento. La campana reúne las alertas dentro de la app." },
  { id: "adjustments", title: "Actualizar un alquiler", path: "/adjustments", text: "Seleccioná el contrato y consultá ARquiler desde la app con el importe, fecha, índice y frecuencia precargados. Ingresá el resultado en el formulario de guardado, revisá la fecha y aplicá el ajuste cuando corresponda. También podés calcular con índices o coeficientes manuales." },
];
interface Trainee { id: string; agency: string; name: string; email: string; role: string; completed: string[] }

export function TrainingPage({ navigate, showToast }: { navigate: (path: string) => void; showToast: (message: string) => void }) {
  const [trainees, setTrainees] = usePersistentState<Trainee[]>("nexo-training", []);
  const add = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); const form = event.currentTarget; const data = new FormData(form);
    const name = String(data.get("name") ?? "").trim(); const agency = String(data.get("agency") ?? "").trim();
    if (!name || !agency) return;
    setTrainees((items) => [...items, { id: id("trainee"), agency, name, email: String(data.get("email") ?? "").trim(), role: String(data.get("role") ?? ""), completed: [] }]); form.reset(); showToast("Persona designada registrada para capacitación");
  };
  return <div className="page"><PageHeader title="Ayuda y capacitación" description="Una guía práctica y seguimiento de las personas designadas por cada inmobiliaria." /><div className="training-grid">{trainingModules.map((module) => <SectionCard key={module.id} title={module.title}><div className="administration-copy"><p>{module.text}</p><Button onClick={() => navigate(module.path)}>Ir a la sección <ArrowRight size={14} /></Button></div></SectionCard>)}</div><SectionCard title="Personas designadas"><form className="modal-form" onSubmit={add}><TextInput name="agency" label="Inmobiliaria" required /><TextInput name="name" label="Nombre y apellido" required /><TextInput name="email" label="Email de contacto" type="email" /><TextInput name="role" label="Función" placeholder="Ej. Administración y cobranzas" /><div className="form-actions field-wide"><Button type="submit" variant="primary" icon={<Plus size={16} />}>Agregar persona</Button></div></form></SectionCard>{trainees.map((person) => <SectionCard key={person.id} title={`${person.name} · ${person.agency}`} description={`${person.role || "Sin función indicada"}${person.email ? ` · ${person.email}` : ""}`} action={<span className="training-progress"><CheckCircle2 size={16} />{person.completed.length}/{trainingModules.length} módulos</span>}><div className="administration-copy training-checklist">{trainingModules.map((module) => <label key={module.id}><input type="checkbox" checked={person.completed.includes(module.id)} onChange={(event) => { const checked = event.target.checked; setTrainees((items) => items.map((item) => item.id === person.id ? { ...item, completed: checked ? [...new Set([...item.completed, module.id])] : item.completed.filter((id) => id !== module.id) } : item)); }} />{module.title}</label>)}</div></SectionCard>)}<p className="administration-note">Marcá los módulos después de repasarlos con la persona designada. Este registro permite organizar la capacitación; no envía invitaciones ni crea cuentas de acceso. La información de esta demo se guarda en este navegador.</p></div>;
}
