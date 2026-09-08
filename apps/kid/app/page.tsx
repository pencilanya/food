import { Badge, PageShell } from "@food/ui";

export default function KidHome() {
  return (
    <PageShell>
      <Badge>Мой ланчбокс</Badge>
      <h1>Что возьмём с собой?</h1>
      <p>Здесь ребёнок сможет увидеть выбранный ланч и отметить, что нравится, а что хочется заменить.</p>
      <div className="choices" aria-label="Пример выбора">
        <button>👍 Хочу это</button>
        <button>🔁 Давай другое</button>
      </div>
    </PageShell>
  );
}
