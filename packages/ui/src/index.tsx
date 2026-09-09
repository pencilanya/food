import type { ButtonHTMLAttributes, ReactNode } from "react";

export function PageShell({ children }: { children: ReactNode }) {
  return <main className="page-shell">{children}</main>;
}

export function Badge({ children }: { children: ReactNode }) {
  return <span className="badge">{children}</span>;
}

export function Button({ className = "", ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button className={`button ${className}`} {...props} />;
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <section className={`card ${className}`}>{children}</section>;
}

export function Progress({ value, label }: { value: number; label: string }) {
  return <div className="progress-wrap"><div className="progress-label"><span>{label}</span><strong>{Math.round(value)}%</strong></div><div className="progress" role="progressbar" aria-label={label} aria-valuemin={0} aria-valuemax={100} aria-valuenow={value}><span style={{ width: `${Math.max(0, Math.min(100, value))}%` }} /></div></div>;
}

export function Avatar({ children, label }: { children: ReactNode; label: string }) {
  return <span className="avatar" role="img" aria-label={label}>{children}</span>;
}

export function RewardBadge({ coins }: { coins: number }) {
  return <span className="reward-badge" aria-label={`Монет: ${coins}`}>🪙 {coins}</span>;
}

export function SectionHeader({ eyebrow, title, action }: { eyebrow?: string; title: string; action?: ReactNode }) {
  return <header className="section-header"><div>{eyebrow && <span className="eyebrow">{eyebrow}</span>}<h2>{title}</h2></div>{action}</header>;
}

export function MascotBubble({ message }: { message: string }) {
  return <div className="mascot-bubble"><span className="mini-mascot" aria-hidden="true"><i /><i /></span><strong>{message}</strong></div>;
}

export function FoodCard({ emoji, title, tags, meta, selected, onClick, disabled }: { emoji: string; title: string; tags: string[]; meta: string; selected?: boolean; onClick?: () => void; disabled?: boolean }) {
  return <button type="button" className={`food-card ${selected ? "is-selected" : ""}`} onClick={onClick} disabled={disabled}><span className="food-emoji" aria-hidden="true">{emoji}</span><span className="food-copy"><strong>{title}</strong><small>{tags.slice(0,2).join(" · ")}</small></span><span className="food-meta">{meta}</span></button>;
}

export function LunchboxSlot({ label, icon, food, onRemove, onSelect, invalid = false }: { label: string; icon: string; food?: { title: string; emoji: string }; onRemove?: () => void; onSelect?: () => void; invalid?: boolean }) {
  return <div className={`lunch-slot ${food ? "has-food" : "is-empty"} ${invalid ? "is-invalid" : ""}`}><button type="button" className="slot-main" onClick={onSelect} disabled={!onSelect} aria-label={food ? `${label}: ${food.title}${invalid ? ". Требуется исправить" : onSelect ? ". Выбрать замену" : ""}` : `${label}: добавить продукт`}><span className="slot-label">{label}{invalid&&<i>Исправить</i>}</span><span className="slot-icon" aria-hidden="true">{food?.emoji ?? icon}</span><strong>{food?.title ?? "Добавить"}</strong></button>{food && onRemove && <button type="button" className="slot-remove" onClick={onRemove} aria-label={`Убрать ${food.title}`}>×</button>}</div>;
}

export function EmptyState({ icon, title, text }: { icon: string; title: string; text: string }) {
  return <div className="empty-state"><span aria-hidden="true">{icon}</span><strong>{title}</strong><p>{text}</p></div>;
}
