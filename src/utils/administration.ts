import type { AppNotification, Contract, Expense, Payment, PaymentStatus, Property, RentAdjustment } from "../types/index.ts";

export const propertyTypes = ["Departamento", "Casa", "Vivienda", "Dúplex", "Local comercial", "Oficina", "Terreno", "Galpón", "Predio", "Finca", "Inmueble industrial", "Inmueble agrícola"];
export const expenseCategories = ["Servicios", "Tasas municipales", "Expensas", "Impuestos", "Reparación", "Mantenimiento", "Honorarios", "Otros"] as const;
export const calculatorReference = "https://www.ccpim.com.ar/interna/calculadora-alquileres/309";
export const collegeCalculatorEmbed = "https://arquiler.com/mini";
export const collegeIndices = {
  ICL: "icl", IPC: "ipc", "Casa Propia": "casa_propia", CAC: "cac", CER: "cer", IS: "is", IPIM: "ipim", UVA: "uva",
} as const;
export type CollegeIndex = keyof typeof collegeIndices;

// ARquiler's public mini widget accepts these query parameters. Its amount parser
// accepts whole pesos only; callers must make any rounding visible to the user.
export function collegeCalculatorUrl({ amount, date, months, index }: { amount: number; date: string; months: number; index: string }) {
  if (!Number.isSafeInteger(amount) || amount <= 0) throw new Error("La consulta de ARquiler requiere un importe en pesos enteros mayor a cero.");
  if (!dateISO(date)) throw new Error("Ingresá una fecha base válida para la consulta.");
  if (!Number.isInteger(months) || months < 1 || months > 12) throw new Error("La frecuencia debe estar entre 1 y 12 meses.");
  const rate = Object.hasOwn(collegeIndices, index) ? collegeIndices[index as CollegeIndex] : undefined;
  if (!rate) throw new Error("Este índice requiere el cálculo manual acordado en el contrato.");
  const url = new URL(collegeCalculatorEmbed);
  url.search = new URLSearchParams({ theme: "light", backgroundColor: "ffffff", amount: String(amount), date: dateISO(date), months: String(months), rate }).toString();
  return url.toString();
}

export function todayISO(now = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Argentina/Buenos_Aires", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(now);
  return ["year", "month", "day"].map((type) => parts.find((part) => part.type === type)?.value).join("-");
}

export function dateISO(value: string) {
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value);
  const iso = match ? `${match[3]}-${match[2]}-${match[1]}` : value;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return "";
  const parsed = new Date(`${iso}T12:00:00Z`);
  return Number.isFinite(parsed.getTime()) && parsed.toISOString().slice(0, 10) === iso ? iso : "";
}

export function displayDate(value: string) {
  const iso = dateISO(value);
  return iso ? iso.split("-").reverse().join("/") : "Sin fecha";
}

export function addMonths(value: string, months: number) {
  const iso = dateISO(value);
  if (!iso || !Number.isInteger(months) || months < 1) return "";
  const [year, month, day] = iso.split("-").map(Number);
  const target = new Date(Date.UTC(year, month - 1 + months, 1, 12));
  const lastDay = new Date(Date.UTC(target.getUTCFullYear(), target.getUTCMonth() + 1, 0)).getUTCDate();
  target.setUTCDate(Math.min(day, lastDay));
  return target.toISOString().slice(0, 10);
}

export function paymentStatus(item: Pick<Payment, "status" | "dueDate">, today = todayISO()): PaymentStatus {
  if (item.status === "Pagado") return "Pagado";
  const due = dateISO(item.dueDate);
  return due ? (due < today ? "Vencido" : "Pendiente") : item.status;
}

// Existing expense records represent registered expenses, with no unpaid balance.
export function expenseStatus(item: Expense, today = todayISO()): PaymentStatus {
  return paymentStatus({ status: item.status ?? "Pagado", dueDate: item.dueDate ?? "" }, today);
}

export function propertyDebt(propertyId: string, payments: Payment[], expenses: Expense[], today = todayISO()) {
  const rent = payments.filter((item) => item.propertyId === propertyId && paymentStatus(item, today) === "Vencido").reduce((sum, item) => sum + item.amount, 0);
  const obligations = expenses.filter((item) => item.propertyId === propertyId && expenseStatus(item, today) === "Vencido").reduce((sum, item) => sum + item.amount, 0);
  const pending = expenses.filter((item) => item.propertyId === propertyId && expenseStatus(item, today) === "Pendiente").reduce((sum, item) => sum + item.amount, 0);
  return { rent, obligations, pending, total: rent + obligations };
}

export function calculateRent(base: number, mode: string, first: number, final?: number) {
  if (!Number.isFinite(base) || base <= 0 || !Number.isFinite(first)) throw new Error("Ingresá importes y valores válidos.");
  if (mode === "Índices" && (!final || !Number.isFinite(final) || final <= 0 || first <= 0)) throw new Error("Los índices inicial y final deben ser mayores a cero.");
  const coefficient = mode === "Importe calculado" ? first / base : mode === "Índices" ? final! / first : mode === "Porcentaje" ? 1 + first / 100 : first;
  if (!Number.isFinite(coefficient) || coefficient <= 0) throw new Error("El coeficiente resultante debe ser mayor a cero.");
  const newValue = Math.round((mode === "Importe calculado" ? first : base * coefficient) * 100) / 100;
  if (!Number.isFinite(newValue) || newValue <= 0) throw new Error("El importe calculado no es válido.");
  return { coefficient, newValue };
}

export function canApplyAdjustment(contract: Contract, plan: RentAdjustment, today = todayISO()) {
  const effective = dateISO(plan.effectiveDate);
  const end = dateISO(contract.end);
  const start = dateISO(contract.start);
  return contract.status !== "Finalizado" && Boolean(effective && end && start && effective >= start && effective <= end && today >= effective && today <= end && dateISO(contract.nextAdjustment) === effective && contract.value === plan.baseValue);
}

export function administrationAlerts(properties: Property[], payments: Payment[], expenses: Expense[], contracts: Contract[], today = todayISO()): AppNotification[] {
  const address = (propertyId: string) => properties.find((item) => item.id === propertyId)?.address ?? "Propiedad";
  const money = (amount: number) => `$ ${amount.toLocaleString("es-AR")}`;
  const alerts: AppNotification[] = [];
  for (const payment of payments) {
    if (!properties.some((property) => property.id === payment.propertyId) || paymentStatus(payment, today) !== "Vencido") continue;
    alerts.push({ id: `rent-${payment.id}-${payment.dueDate}-${payment.amount}`, title: "Alquiler en mora", description: `${address(payment.propertyId)} · ${money(payment.amount)} · venció ${displayDate(payment.dueDate)}`, kind: "payment", time: "Requiere atención", read: false });
  }
  for (const expense of expenses) {
    if (!properties.some((property) => property.id === expense.propertyId) || expenseStatus(expense, today) === "Pagado") continue;
    const overdue = expenseStatus(expense, today) === "Vencido";
    alerts.push({ id: `expense-${expense.id}-${expense.dueDate}-${expense.amount}`, title: overdue ? "Obligación vencida" : "Obligación pendiente", description: `${address(expense.propertyId)} · ${expense.concept} · ${money(expense.amount)} · vence ${displayDate(expense.dueDate ?? "")}`, kind: "payment", time: overdue ? "Requiere atención" : "Pendiente de pago", read: false });
  }
  for (const contract of contracts) {
    const due = dateISO(contract.nextAdjustment);
    const until = addMonths(today, 1);
    if (!properties.some((property) => property.id === contract.propertyId) || contract.status === "Finalizado" || !due || due > until || dateISO(contract.end) < today || due > dateISO(contract.end)) continue;
    alerts.push({ id: `adjust-${contract.id}-${due}`, title: due <= today ? "Corresponde actualizar el alquiler" : "Próxima actualización de alquiler", description: `${address(contract.propertyId)} · ${contract.adjustmentType} · ${displayDate(due)}`, kind: "update", time: due <= today ? "Revisar ajuste" : "Próximo mes", read: false });
  }
  return alerts;
}
