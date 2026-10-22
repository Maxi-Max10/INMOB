"use client";

import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode, SelectHTMLAttributes } from "react";
import { useEffect } from "react";
import { ArrowUpRight, Building2, CheckCircle2, LoaderCircle, X } from "lucide-react";
import { formatCurrency, initials } from "@/src/utils/format";

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`brand ${compact ? "brand-compact" : ""}`} aria-label="POLO Inmobiliario">
      <span className="brand-mark" aria-hidden="true">
        <span />
        <span />
      </span>
      {!compact && (
        <span className="brand-copy">
          <strong>POLO</strong>
          <small>Inmobiliario</small>
        </span>
      )}
    </div>
  );
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  icon?: ReactNode;
  loading?: boolean;
};

export function Button({ variant = "secondary", icon, loading, children, className = "", ...props }: ButtonProps) {
  return (
    <button className={`button button-${variant} ${className}`} {...props} disabled={loading || props.disabled}>
      {loading ? <LoaderCircle size={16} className="spin" /> : icon}
      {children}
    </button>
  );
}

export function IconButton({ label, children, className = "", ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { label: string }) {
  return (
    <button className={`icon-button ${className}`} aria-label={label} title={label} {...props}>
      {children}
    </button>
  );
}

export function Avatar({ name, size = "md" }: { name: string; size?: "sm" | "md" | "lg" }) {
  return <span className={`avatar avatar-${size}`} aria-hidden="true">{initials(name)}</span>;
}

const statusClass: Record<string, string> = {
  Alquilada: "success", Alquilado: "success", Disponible: "info", Mantenimiento: "warning", Archivada: "neutral",
  Activo: "success", Vigente: "success", "Próximo a vencer": "warning", Finalizado: "neutral",
  Pagado: "success", Pendiente: "warning", Vencido: "danger", "Al día": "success",
  Nuevo: "info", "En proceso": "warning", "Esperando proveedor": "neutral", Resuelto: "success",
  Baja: "neutral", Media: "info", Alta: "warning", Urgente: "danger", Próximo: "info", Revisar: "warning",
};

export function Badge({ children, dot = true }: { children: ReactNode; dot?: boolean }) {
  const value = String(children);
  return <span className={`badge badge-${statusClass[value] ?? "neutral"}`}>{dot && <i />}{children}</span>;
}

export function PageHeader({ eyebrow, title, description, actions }: { eyebrow?: string; title: string; description?: string; actions?: ReactNode }) {
  return (
    <div className="page-header">
      <div>
        {eyebrow && <div className="eyebrow">{eyebrow}</div>}
        <h1>{title}</h1>
        {description && <p>{description}</p>}
      </div>
      {actions && <div className="page-actions">{actions}</div>}
    </div>
  );
}

export function SectionCard({ title, description, action, children, className = "" }: { title?: string; description?: string; action?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={`surface ${className}`}>
      {(title || action) && (
        <div className="surface-head">
          <div>{title && <h2>{title}</h2>}{description && <p>{description}</p>}</div>
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

export function StatCard({ label, value, meta, icon, tone = "default", featured = false }: { label: string; value: string | number; meta?: ReactNode; icon?: ReactNode; tone?: "default" | "success" | "warning" | "danger"; featured?: boolean }) {
  return (
    <div className={`stat-card stat-${tone} ${featured ? "stat-featured" : ""}`}>
      <div className="stat-top"><span>{label}</span>{icon && <span className="stat-icon">{icon}</span>}</div>
      <strong>{value}</strong>
      {meta && <div className="stat-meta">{meta}</div>}
    </div>
  );
}

export function Metric({ label, value, icon }: { label: string; value: ReactNode; icon?: ReactNode }) {
  return <div className="metric">{icon && <span>{icon}</span>}<div><small>{label}</small><strong>{value}</strong></div></div>;
}

export function PropertyVisual({ variant, className = "", label }: { variant: number; className?: string; label?: string }) {
  return (
    <div className={`property-visual visual-${((variant - 1) % 8) + 1} ${className}`} role="img" aria-label={label ?? "Vista arquitectónica de la propiedad"}>
      <span className="architecture-lines" aria-hidden="true"><i /><i /><i /><i /></span>
      <span className="visual-label"><Building2 size={14} /> POLO selección</span>
    </div>
  );
}

export function EmptyState({ icon, title, description, action }: { icon?: ReactNode; title: string; description: string; action?: ReactNode }) {
  return <div className="empty-state"><div className="empty-icon">{icon ?? <Building2 />}</div><h3>{title}</h3><p>{description}</p>{action}</div>;
}

export function Modal({ open, title, description, onClose, children, wide = false }: { open: boolean; title: string; description?: string; onClose: () => void; children: ReactNode; wide?: boolean }) {
  useEffect(() => {
    if (!open) return;
    const close = (event: KeyboardEvent) => event.key === "Escape" && onClose();
    document.addEventListener("keydown", close);
    document.body.classList.add("modal-open");
    return () => { document.removeEventListener("keydown", close); document.body.classList.remove("modal-open"); };
  }, [onClose, open]);
  if (!open) return null;
  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <div className={`modal ${wide ? "modal-wide" : ""}`} role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <div className="modal-head"><div><h2 id="modal-title">{title}</h2>{description && <p>{description}</p>}</div><IconButton label="Cerrar" onClick={onClose}><X size={19} /></IconButton></div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
}

export function Field({ label, hint, error, children, className = "" }: { label: string; hint?: string; error?: string; children: ReactNode; className?: string }) {
  return <label className={`field ${className}`}><span>{label}</span>{children}{error ? <small className="field-error">{error}</small> : hint ? <small>{hint}</small> : null}</label>;
}

export function TextInput({ label, hint, error, className = "", ...props }: InputHTMLAttributes<HTMLInputElement> & { label: string; hint?: string; error?: string }) {
  return <Field label={label} hint={hint} error={error} className={className}><input className={error ? "has-error" : ""} {...props} /></Field>;
}

export function SelectInput({ label, children, className = "", ...props }: SelectHTMLAttributes<HTMLSelectElement> & { label: string; children: ReactNode }) {
  return <Field label={label} className={className}><select {...props}>{children}</select></Field>;
}

export function Toast({ message, visible }: { message: string; visible: boolean }) {
  return <div className={`toast ${visible ? "toast-visible" : ""}`} role="status"><CheckCircle2 size={18} />{message}</div>;
}

export function Delta({ children, positive = true }: { children: ReactNode; positive?: boolean }) {
  return <span className={`delta ${positive ? "positive" : "negative"}`}><ArrowUpRight size={13} />{children}</span>;
}

export function Currency({ value }: { value: number }) {
  return <>{formatCurrency(value)}</>;
}
