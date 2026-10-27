import assert from "node:assert/strict";
import test from "node:test";
import { addMonths, administrationAlerts, calculateRent, canApplyAdjustment, collegeCalculatorUrl, dateISO, expenseStatus, paymentStatus, propertyDebt, todayISO } from "../src/utils/administration.ts";

const today = "2026-10-26";
const property = { id: "p1", address: "Propiedad de prueba" };
const rent = { id: "pay1", propertyId: "p1", amount: 100000, status: "Pendiente", dueDate: "25/10/2026" };
const expense = { id: "e1", propertyId: "p1", concept: "Tasa municipal", category: "Tasas municipales", amount: 15000, date: "2026-10-01", dueDate: "2026-10-25", status: "Pendiente" };
const contract = { id: "c1", propertyId: "p1", status: "Vigente", start: "01/01/2026", end: "31/12/2027", value: 100000, nextAdjustment: "26/10/2026", adjustmentType: "ICL" };
const plan = { baseValue: 100000, coefficient: 1.2, newValue: 120000, effectiveDate: "2026-10-26" };

test("dates validate legacy and ISO records and use the Argentina calendar", () => {
  assert.equal(dateISO("26/10/2026"), today);
  assert.equal(dateISO("2026-10-26"), today);
  assert.equal(dateISO("31/02/2026"), "");
  assert.equal(dateISO("not a date"), "");
  assert.equal(todayISO(new Date("2026-10-27T01:00:00Z")), today);
});

test("unpaid items become overdue only after the due date and paid items remain settled", () => {
  assert.equal(paymentStatus(rent, today), "Vencido");
  assert.equal(paymentStatus({ ...rent, dueDate: today }, today), "Pendiente");
  assert.equal(paymentStatus({ ...rent, status: "Vencido", dueDate: "2026-11-01" }, today), "Pendiente");
  assert.equal(paymentStatus({ ...rent, status: "Pagado" }, today), "Pagado");
  assert.equal(expenseStatus({ ...expense, status: undefined }, today), "Pagado");
});

test("property arrears separate rent, overdue obligations and future charges without counting other properties", () => {
  const expenses = [expense, { ...expense, id: "future", amount: 5000, dueDate: "2026-11-01" }, { ...expense, propertyId: "other", amount: 999999 }, { ...expense, id: "paid", amount: 999999, status: "Pagado" }];
  assert.deepEqual(propertyDebt("p1", [rent], expenses, today), { rent: 100000, obligations: 15000, pending: 5000, total: 115000 });
  assert.deepEqual(propertyDebt("p1", [{ ...rent, status: "Pagado" }], [{ ...expense, status: "Pagado" }], today), { rent: 0, obligations: 0, pending: 0, total: 0 });
});

test("obligations work for administration without tenants or contracts and alerts disappear after payment", () => {
  assert.equal(administrationAlerts([property], [], [expense], [], today).length, 1);
  assert.equal(administrationAlerts([property], [], [{ ...expense, status: "Pagado" }], [], today).length, 0);
  assert.equal(administrationAlerts([], [rent], [expense], [contract], today).length, 0);
  const alerts = administrationAlerts([property], [rent], [expense], [contract], today);
  assert.equal(alerts.length, 3);
  assert.match(alerts.find((item) => item.kind === "update").title, /Corresponde actualizar/);
  assert.equal(administrationAlerts([property], [], [], [{ ...contract, end: "2026-10-01" }], today).length, 0);
});

test("coefficient, index ratio and cumulative percentage produce the same rent", () => {
  for (const result of [calculateRent(850000, "Coeficiente", 1.15), calculateRent(850000, "Índices", 100, 115), calculateRent(850000, "Porcentaje", 15)]) {
    assert.equal(result.newValue, 977500);
    assert.ok(Math.abs(result.coefficient - 1.15) < 0.000001);
  }
  assert.equal(calculateRent(100, "Coeficiente", 1.23456).newValue, 123.46);
  for (const args of [[0, "Coeficiente", 1.2], [100, "Índices", 0, 2], [100, "Porcentaje", -100], [100, "Coeficiente", NaN], [100, "Índices", 1, Infinity]]) assert.throws(() => calculateRent(...args));
});

test("adjustments cannot apply early, after contract end, twice or against a changed base", () => {
  assert.equal(canApplyAdjustment(contract, plan, today), true);
  assert.equal(canApplyAdjustment(contract, plan, "2026-10-25"), false);
  assert.equal(canApplyAdjustment(contract, plan, "2028-01-01"), false);
  assert.equal(canApplyAdjustment({ ...contract, status: "Finalizado" }, plan, today), false);
  assert.equal(canApplyAdjustment({ ...contract, value: 120000 }, plan, today), false);
  assert.equal(canApplyAdjustment({ ...contract, nextAdjustment: "2027-02-26" }, plan, today), false);
});

test("monthly schedules preserve the agreed day and clamp to the last day of shorter months", () => {
  assert.equal(addMonths("2026-10-26", 4), "2027-02-26");
  assert.equal(addMonths("2026-01-31", 1), "2026-02-28");
  assert.equal(addMonths("2027-12-31", 2), "2028-02-29");
  assert.equal(addMonths("2026-10-26", 0), "");
});

test("ARquiler receives a valid period and whole-peso amount without personal or property data", () => {
  const url = new URL(collegeCalculatorUrl({ amount: 850000, date: "01/06/2026", months: 4, index: "Casa Propia", tenantId: "private", address: "private" }));
  assert.equal(url.origin, "https://arquiler.com");
  assert.equal(url.pathname, "/mini");
  assert.equal(url.searchParams.get("amount"), "850000");
  assert.equal(url.searchParams.get("date"), "2026-06-01");
  assert.equal(url.searchParams.get("months"), "4");
  assert.equal(url.searchParams.get("rate"), "casa_propia");
  assert.equal(url.searchParams.has("tenantId"), false);
  assert.equal(url.searchParams.has("address"), false);
  for (const overrides of [{ amount: 850000.5 }, { amount: 0 }, { amount: Infinity }, { date: "31/02/2026" }, { months: 13 }, { months: 0 }, { index: "Porcentaje fijo" }, { index: "toString" }]) {
    assert.throws(() => collegeCalculatorUrl({ amount: 850000, date: "2026-06-01", months: 4, index: "ICL", ...overrides }));
  }
});

test("recording an external result preserves its exact amount and derives the contractual coefficient", () => {
  const result = calculateRent(850000, "Importe calculado", 977500.25);
  assert.equal(result.newValue, 977500.25);
  assert.ok(Math.abs(result.coefficient - 977500.25 / 850000) < 0.0000000001);
  for (const amount of [0, -1, NaN, Infinity]) assert.throws(() => calculateRent(850000, "Importe calculado", amount));
});
