"use client";

import { useState, type FormEvent } from "react";
import { Calculator, SquareArrowOutUpRight } from "lucide-react";
import { Button, SectionCard, SelectInput, TextInput } from "@/src/components/ui";
import type { Contract } from "@/src/types";
import { addMonths, calculatorReference, collegeCalculatorUrl, collegeIndices, dateISO, displayDate, type CollegeIndex } from "@/src/utils/administration";
import { formatCurrency } from "@/src/utils/format";

export interface CollegeConsultation {
  index: CollegeIndex;
  months: number;
  baseDate: string;
  effectiveDate: string;
  amount: number;
  url: string;
}

export function CollegeRentCalculator({ contract, onConsult }: { contract: Contract; onConsult: (consultation: CollegeConsultation) => void }) {
  const [baseDate, setBaseDate] = useState(dateISO(contract.adjustments?.[0]?.effectiveDate ?? contract.start));
  const [months, setMonths] = useState(contract.frequency === "Anual" ? 12 : Number(contract.frequency.match(/\d+/)?.[0]) || 4);
  const supported = Object.hasOwn(collegeIndices, contract.adjustmentType);
  const [index, setIndex] = useState<CollegeIndex>(supported ? contract.adjustmentType as CollegeIndex : "ICL");
  const [consultation, setConsultation] = useState<CollegeConsultation | null>(null);
  const [frameLoaded, setFrameLoaded] = useState(false);
  const [frameFailed, setFrameFailed] = useState(false);
  const [frameAttempt, setFrameAttempt] = useState(0);
  const [error, setError] = useState("");
  const queryAmount = Math.round(contract.value);
  const fractionalAmount = queryAmount !== contract.value;
  const consult = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      const effectiveDate = addMonths(baseDate, months);
      if (dateISO(baseDate) < dateISO(contract.start) || !effectiveDate || effectiveDate > dateISO(contract.end)) throw new Error("El período consultado debe estar dentro de la vigencia del contrato.");
      const url = collegeCalculatorUrl({ amount: queryAmount, date: baseDate, months, index });
      const next = { index, months, baseDate, effectiveDate, amount: queryAmount, url };
      setConsultation(next); setFrameLoaded(false); setFrameFailed(false); setFrameAttempt((value) => value + 1); setError(""); onConsult(next);
    } catch (error) { setError((error as Error).message); }
  };
  return <SectionCard title="Calculadora del Colegio de Corredores" description="Consultá ARquiler, la misma calculadora que ofrece el Colegio de Mendoza.">
    <form className="modal-form" onSubmit={consult}>
      <TextInput label="Importe actual del contrato" value={formatCurrency(contract.value)} readOnly />
      <TextInput label="Fecha desde la que rige ese importe" type="date" value={baseDate} min={dateISO(contract.start)} max={dateISO(contract.end)} onChange={(event) => setBaseDate(event.target.value)} hint="Usá la fecha del último ajuste aplicado o el inicio si es el primer ajuste." required />
      <SelectInput label="Índice para consultar en ARquiler" value={index} onChange={(event) => setIndex(event.target.value as CollegeIndex)}>{Object.keys(collegeIndices).map((item) => <option key={item}>{item}</option>)}</SelectInput>
      <SelectInput label="Frecuencia de actualización en ARquiler" value={months} onChange={(event) => setMonths(Number(event.target.value))}>{Array.from({ length: 12 }, (_, value) => value + 1).map((value) => <option key={value} value={value}>{value} {value === 1 ? "mes" : "meses"}</option>)}</SelectInput>
      {!supported && <p className="administration-note field-wide">El contrato tiene un ajuste {contract.adjustmentType.toLowerCase()}. Consultá otro índice solo si corresponde a lo pactado; también podés usar el cálculo manual de abajo.</p>}
      {fractionalAmount && <p className="administration-note field-wide">ARquiler admite pesos enteros. Para esta consulta se precargará {formatCurrency(queryAmount)}; el contrato conserva sus centavos. Revisá ese redondeo antes de registrar el resultado.</p>}
      <p className="administration-note field-wide">Se precargan el importe y el período para consultar los índices en ARquiler. Al terminar, ingresá abajo el nuevo alquiler que muestra para guardarlo con el contrato. <a className="text-link" href={calculatorReference} target="_blank" rel="noopener noreferrer">Ver la referencia del Colegio</a>.</p>
      {error && <p className="form-alert field-wide" role="alert">{error}</p>}
      <div className="form-actions field-wide"><Button type="submit" variant="primary" icon={<Calculator size={16} />}>{consultation ? "Volver a cargar con estos datos" : "Consultar en ARquiler"}</Button></div>
    </form>
    {consultation && <div className="college-calculator">
      <div className="college-calculator-toolbar"><div><strong>Consulta en ARquiler</strong><p>{formatCurrency(consultation.amount)} · {displayDate(consultation.baseDate)} · {consultation.index} · cada {consultation.months} meses</p><p>Primera actualización del período: {displayDate(consultation.effectiveDate)}. Usá ese resultado al guardarlo abajo.</p></div><a className="button button-secondary" href={consultation.url} target="_blank" rel="noopener noreferrer">Abrir en otra pestaña <SquareArrowOutUpRight size={14} /></a></div>
      {!frameLoaded && !frameFailed && <p className="administration-note" role="status">Cargando calculadora de ARquiler…</p>}
      {frameFailed && <p className="form-alert" role="alert">No se pudo cargar la calculadora. Podés abrirla en otra pestaña o usar el cálculo manual.</p>}
      <iframe key={`${consultation.url}-${frameAttempt}`} className="college-calculator-frame" title="Calculadora de alquileres ARquiler utilizada por el Colegio de Mendoza" src={consultation.url} referrerPolicy="strict-origin-when-cross-origin" sandbox="allow-scripts allow-same-origin allow-forms allow-popups" onLoad={() => setFrameLoaded(true)} onError={() => { setFrameFailed(true); setFrameLoaded(false); }} />
      <p className="administration-note">El cálculo se realiza en ARquiler con los datos disponibles en ese servicio. Si modificás el período o el índice dentro de la calculadora, usá los mismos datos al guardar el resultado. Si no se muestra, abrila en otra pestaña.</p>
    </div>}
  </SectionCard>;
}
