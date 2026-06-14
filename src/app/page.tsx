import {
  Sparkles,
  ShieldCheck,
  Clock,
  CarFront,
  Droplets,
  Gauge,
  CheckCircle2,
  Star,
  MapPin,
  Phone,
  MessageCircle,
  CalendarCheck,
} from "lucide-react";
import { SiteHeader } from "@/components/site/header";
import { SiteFooter } from "@/components/site/footer";
import { Reveal } from "@/components/ui/reveal";
import { ButtonLink } from "@/components/ui/button";
import { BUSINESS, SERVICE_CATEGORIES } from "@/lib/constants";
import {
  getServices,
  getApprovedReviews,
  getContent,
  getGallery,
  getActivePromotions,
} from "@/lib/data";
import { formatRub } from "@/lib/utils";

export default async function HomePage() {
  const [services, reviews, content, gallery, promotions] = await Promise.all([
    getServices(),
    getApprovedReviews(),
    getContent(),
    getGallery(),
    getActivePromotions(),
  ]);

  const text = (key: string, fallback: string) => content[key]?.trim() || fallback;
  const heroTitle = text("hero.title", BUSINESS.tagline);
  const heroSubtitle = text(
    "hero.subtitle",
    "Детейлинг-студия «Омут» в центре Самары. Полировка, химчистка, керамика и защита кузова — с прозрачными ценами и личным кабинетом.",
  );
  const heroStats = [
    {
      icon: ShieldCheck,
      value: text("hero.stat1.value", "12 мес"),
      label: text("hero.stat1.label", "гарантия на керамику"),
    },
    {
      icon: Droplets,
      value: text("hero.stat2.value", "pH-нейтр."),
      label: text("hero.stat2.label", "безопасная химия"),
    },
    {
      icon: CarFront,
      value: text("hero.stat3.value", "Любой класс"),
      label: text("hero.stat3.label", "от седана до SUV"),
    },
    {
      icon: Clock,
      value: text("hero.stat4.value", "1 день"),
      label: text("hero.stat4.label", "большинство работ"),
    },
  ];
  const aboutFeatures = [
    {
      icon: ShieldCheck,
      title: text("about.feature1.title", "Прозрачные цены"),
      text: text("about.feature1.text", "Стоимость согласуем до начала работ. Никаких сюрпризов на выдаче."),
    },
    {
      icon: Gauge,
      title: text("about.feature2.title", "Личный кабинет"),
      text: text("about.feature2.text", "Вся история обращений, выполненные услуги и суммы — онлайн, в любой момент."),
    },
    {
      icon: Sparkles,
      title: text("about.feature3.title", "Фото- и видеоотчёт"),
      text: text("about.feature3.text", "Показываем результат до и после. Гарантия на покрытия."),
    },
  ];
  const processSteps = [
    {
      n: "01",
      t: text("process.step1.title", "Заявка"),
      d: text("process.step1.text", "Записываетесь онлайн или присылаете фото в мессенджер."),
    },
    {
      n: "02",
      t: text("process.step2.title", "Осмотр и расчёт"),
      d: text("process.step2.text", "Согласуем услуги, срок и точную стоимость."),
    },
    {
      n: "03",
      t: text("process.step3.title", "Работа"),
      d: text("process.step3.text", "Выполняем по технологии, с контролем качества."),
    },
    {
      n: "04",
      t: text("process.step4.title", "Выдача"),
      d: text("process.step4.text", "Показываем результат, фиксируем в вашем кабинете."),
    },
  ];
  const ctaTrust = [
    text("cta.trust1", "Прозрачные цены"),
    text("cta.trust2", "Гарантия на покрытия"),
    text("cta.trust3", "Фотоотчёт"),
  ];

  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        {/* HERO */}
        <section className="bg-abyss-glow relative overflow-hidden pb-12 pt-24 sm:pb-16 sm:pt-28 lg:pb-20">
          <div className="pointer-events-none absolute -top-40 left-1/2 h-72 w-[22rem] -translate-x-1/2 rounded-full bg-aqua/10 blur-3xl sm:h-96 sm:w-[42rem]" />
          <div className="mx-auto max-w-7xl px-4 sm:px-5">
            <div className="mx-auto max-w-3xl text-center">
              <Reveal>
                <span className="inline-flex max-w-full items-center gap-2 rounded-full border border-aqua/30 bg-aqua/5 px-3 py-1.5 text-left text-xs text-aqua sm:px-4">
                  <Sparkles className="h-3.5 w-3.5" />
                  {text("hero.badge", `Детейлинг в центре Самары · ${BUSINESS.address}`)}
                </span>
              </Reveal>
              <Reveal delay={80}>
                <h1 className="mt-5 text-3xl font-semibold leading-tight tracking-tight sm:mt-6 sm:text-5xl lg:text-6xl">
                  <span className="text-gradient">{heroTitle}</span>
                </h1>
              </Reveal>
              <Reveal delay={160}>
                <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-mist sm:mt-6 sm:text-lg">
                  {heroSubtitle}
                </p>
              </Reveal>
              <Reveal delay={240}>
                <div className="mt-7 flex flex-col items-stretch justify-center gap-3 sm:mt-9 sm:flex-row sm:items-center">
                  <ButtonLink href="/book" size="lg" className="w-full sm:w-auto">
                    <CalendarCheck className="h-5 w-5" />
                    Записаться онлайн
                  </ButtonLink>
                  <ButtonLink href="/#services" size="lg" variant="outline" className="w-full sm:w-auto">
                    Услуги и цены
                  </ButtonLink>
                </div>
              </Reveal>
            </div>

            <Reveal delay={320}>
              <div className="mx-auto mt-10 grid max-w-4xl grid-cols-2 gap-3 sm:mt-16 sm:grid-cols-4 sm:gap-4">
                {heroStats.map((s) => (
                  <div key={s.label} className="glass rounded-2xl p-4 text-center sm:p-5">
                    <s.icon className="mx-auto h-6 w-6 text-aqua" />
                    <div className="mt-2 text-lg font-semibold text-foam">{s.value}</div>
                    <div className="text-xs text-mute">{s.label}</div>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </section>

        {/* SERVICES */}
        <section id="services" className="py-12 sm:py-16 lg:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-5">
            <SectionHeading
              eyebrow="Услуги"
              title={text("services.title", "Полный уход за автомобилем")}
              subtitle={text(
                "services.subtitle",
                "Прозрачные цены «от» для класса B. Точную стоимость рассчитаем по фото или на осмотре.",
              )}
            />
            <div className="mt-8 grid gap-4 sm:mt-12 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
              {services.map((s, i) => (
                <Reveal key={s.id} delay={(i % 3) * 80}>
                  <div className="group relative h-full rounded-2xl border border-line bg-surface/60 p-4 transition-all hover:border-aqua/40 hover:bg-surface sm:p-6">
                    {s.popular && (
                      <span className="absolute right-5 top-5 rounded-full bg-aqua/15 px-2.5 py-1 text-[10px] font-medium uppercase tracking-wide text-aqua">
                        Хит
                      </span>
                    )}
                    <div className="text-xs uppercase tracking-wide text-mute">
                      {SERVICE_CATEGORIES[s.category] ?? s.category}
                    </div>
                    <h3 className="mt-2 text-xl font-semibold text-foam">{s.title}</h3>
                    <p className="mt-2 min-h-[3rem] text-sm text-mist">{s.shortDesc}</p>
                    <div className="mt-5 flex flex-col gap-3 border-t border-line pt-4 sm:flex-row sm:items-end sm:justify-between">
                      <div>
                        <div className="text-xs text-mute">от</div>
                        <div className="text-2xl font-semibold text-foam">
                          {formatRub(s.basePrice)}
                        </div>
                      </div>
                      <ButtonLink
                        href={`/book?service=${s.slug}`}
                        size="sm"
                        variant="subtle"
                      >
                        Записаться
                      </ButtonLink>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {promotions.length > 0 && (
          <section id="promotions" className="border-y border-line bg-abyss-2 py-12 sm:py-16 lg:py-20">
            <div className="mx-auto max-w-7xl px-4 sm:px-5">
              <SectionHeading
                eyebrow="Акции"
                title={text("promotions.title", "Выгодные предложения")}
                subtitle={text("promotions.subtitle", "Актуальные скидки и бонусы для клиентов студии")}
              />
              <div className="mt-8 grid gap-4 sm:mt-12 md:grid-cols-3">
                {promotions.map((promo) => (
                  <div
                    key={promo.id}
                    className="rounded-2xl border border-aqua/20 bg-gradient-to-br from-aqua/10 to-surface/70 p-5"
                  >
                    <div className="text-3xl font-semibold text-aqua">
                      -{promo.discountPercent}%
                    </div>
                    <h3 className="mt-3 text-lg font-semibold text-foam">{promo.title}</h3>
                    {promo.description && (
                      <p className="mt-2 text-sm text-mist">{promo.description}</p>
                    )}
                    <ButtonLink href="/book" className="mt-5 w-full sm:w-auto" variant="outline">
                      Записаться по акции
                    </ButtonLink>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* WHY */}
        <section id="why" className="border-y border-line bg-abyss-2 py-12 sm:py-16 lg:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-5">
            <SectionHeading
              eyebrow="Почему «Омут»"
              title={text("about.title", "Забота, которой доверяют")}
              subtitle={text(
                "about.text",
                "Мы относимся к каждому автомобилю как к своему: безопасные технологии, премиальные материалы и контроль качества.",
              )}
            />
            <div className="mt-8 grid gap-4 sm:mt-12 md:grid-cols-3 md:gap-5">
              {aboutFeatures.map((f, i) => (
                <Reveal key={f.title} delay={i * 80}>
                  <div className="h-full rounded-2xl border border-line bg-surface/60 p-5 sm:p-7">
                    <div className="grid h-12 w-12 place-items-center rounded-xl bg-aqua/10">
                      <f.icon className="h-6 w-6 text-aqua" />
                    </div>
                    <h3 className="mt-5 text-lg font-semibold text-foam">{f.title}</h3>
                    <p className="mt-2 text-sm text-mist">{f.text}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* PROCESS */}
        <section id="process" className="py-12 sm:py-16 lg:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-5">
            <SectionHeading
              eyebrow="Как мы работаем"
              title={text("process.title", "Четыре простых шага")}
            />
            <div className="mt-8 grid gap-4 sm:mt-12 sm:grid-cols-2 md:grid-cols-4 md:gap-5">
              {processSteps.map((s, i) => (
                <Reveal key={s.n} delay={i * 70}>
                  <div className="relative h-full rounded-2xl border border-line bg-surface/40 p-6">
                    <div className="text-3xl font-bold text-aqua/30">{s.n}</div>
                    <h3 className="mt-3 text-lg font-semibold text-foam">{s.t}</h3>
                    <p className="mt-2 text-sm text-mist">{s.d}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* GALLERY */}
        <section id="gallery" className="border-y border-line bg-abyss-2 py-12 sm:py-16 lg:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-5">
            <SectionHeading eyebrow="Работы" title={text("gallery.title", "Результат, который видно")} />
            <div className="mt-8 grid grid-cols-2 gap-3 sm:mt-12 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
              {(gallery.length > 0
                ? gallery.map((g) => ({
                    id: g.id,
                    url: g.url,
                    caption: g.caption,
                    mediaType: g.mediaType,
                  }))
                : Array.from({ length: 8 }).map((_, i) => ({
                    id: `ph-${i}`,
                    url: "",
                    caption: null,
                    mediaType: "image",
                  }))
              ).map((g) => (
                <div
                  key={g.id}
                  className="group relative aspect-[4/5] overflow-hidden rounded-2xl border border-line bg-gradient-to-br from-surface to-abyss"
                >
                  {g.url ? (
                    g.mediaType === "video" ? (
                      <video
                        src={g.url}
                        className="h-full w-full object-cover"
                        controls
                        muted
                        playsInline
                      />
                    ) : (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={g.url}
                        alt={g.caption ?? "Работа Омут"}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    )
                  ) : (
                    <div className="flex h-full items-center justify-center text-mute">
                      <Droplets className="h-8 w-8 opacity-40" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* REVIEWS */}
        {reviews.length > 0 && (
          <section id="reviews" className="py-12 sm:py-16 lg:py-20">
            <div className="mx-auto max-w-7xl px-4 sm:px-5">
              <SectionHeading eyebrow="Отзывы" title={text("reviews.title", "Нам доверяют автомобили")} />
              <div className="mt-8 grid gap-4 sm:mt-12 md:grid-cols-3 md:gap-5">
                {reviews.map((r, i) => (
                  <Reveal key={r.id} delay={(i % 3) * 80}>
                    <div className="h-full rounded-2xl border border-line bg-surface/60 p-5 sm:p-6">
                      <div className="flex gap-0.5 text-aqua">
                        {Array.from({ length: r.rating }).map((_, k) => (
                          <Star key={k} className="h-4 w-4 fill-aqua" />
                        ))}
                      </div>
                      <p className="mt-4 text-sm text-mist">{r.text}</p>
                      <p className="mt-4 text-sm font-medium text-foam">{r.authorName}</p>
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* CONTACTS */}
        <section id="contacts" className="border-t border-line bg-abyss-2 py-12 sm:py-16 lg:py-20">
          <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-5 lg:grid-cols-2 lg:gap-10">
            <div>
              <SectionHeading
                align="left"
                eyebrow="Контакты"
                title="Найти нас просто"
              />
              <div className="mt-8 space-y-4 text-mist">
                <p className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-aqua" />
                  {text("contacts.address", BUSINESS.addressFull)}
                </p>
                <p className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-aqua" />
                  {text("contacts.hours", BUSINESS.hours)}
                </p>
                <p className="text-sm text-mute">{text("contacts.landmark", BUSINESS.landmark)}</p>
              </div>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <ButtonLink href={BUSINESS.phoneHref} variant="outline" className="w-full sm:w-auto">
                  <Phone className="h-4 w-4" /> Позвонить
                </ButtonLink>
                <ButtonLink href={BUSINESS.whatsapp} variant="outline" className="w-full sm:w-auto">
                  <MessageCircle className="h-4 w-4" /> WhatsApp
                </ButtonLink>
                <ButtonLink href="/book" className="w-full sm:w-auto">
                  <CalendarCheck className="h-4 w-4" /> Записаться
                </ButtonLink>
              </div>
            </div>
            <div className="overflow-hidden rounded-2xl border border-line">
              <iframe
                title="Карта"
                className="h-72 w-full grayscale sm:h-80"
                loading="lazy"
                src={`https://yandex.ru/map-widget/v1/?text=${encodeURIComponent(
                  text("contacts.address", BUSINESS.addressFull),
                )}&z=16`}
              />
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-12 sm:py-16 lg:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-5">
            <div className="relative overflow-hidden rounded-3xl border border-aqua/20 bg-gradient-to-br from-surface to-abyss-2 p-6 text-center sm:p-10 lg:p-16">
              <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-aqua/10 blur-3xl" />
              <h2 className="text-2xl font-semibold sm:text-4xl">
                {text("cta.title", "Готовы вернуть авто глубину и блеск?")}
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-mist">
                {text(
                  "cta.text",
                  "Запишитесь онлайн — подтвердим время и рассчитаем стоимость. История всех работ будет в вашем личном кабинете.",
                )}
              </p>
              <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row sm:flex-wrap">
                <ButtonLink href="/book" size="lg" className="w-full sm:w-auto">
                  <CalendarCheck className="h-5 w-5" /> Записаться онлайн
                </ButtonLink>
                <ButtonLink href="/login" size="lg" variant="outline" className="w-full sm:w-auto">
                  Личный кабинет
                </ButtonLink>
              </div>
              <div className="mt-8 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-mute">
                {ctaTrust.map((t) => (
                  <span key={t} className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4 text-aqua" /> {t}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}

function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = "center",
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
  align?: "center" | "left";
}) {
  return (
    <div className={align === "center" ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}>
      <span className="text-xs font-medium uppercase tracking-[0.25em] text-aqua">
        {eyebrow}
      </span>
      <h2 className="mt-3 text-2xl font-semibold tracking-tight sm:text-4xl">
        {title}
      </h2>
      {subtitle && <p className="mt-4 text-mist">{subtitle}</p>}
    </div>
  );
}
