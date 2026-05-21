/**
 * One-off: injects answerGeneralTr + answerPersonalTr into data/seed-nextjs.json.
 *
 * Run:  pnpm tsx scripts/add-tr-nextjs.ts
 * Then: pnpm seed
 */

import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

type Tr = { general: string; personal?: string };

const TR: Record<number, Tr> = {
  1: {
    general:
      "Next.js, Vercel'in geliştirdiği bir React framework'ü — React'in eksik bıraktığı parçaları ekliyor: routing, data fetching, render stratejileri, image ve font optimizasyonu, ve bir production build pipeline'ı. Çözdüğü problemler düz bir React SPA büyüdüğünde karşılaştığın klasik şeyler: kötü SEO, yavaş first paint, route bazlı code splitting için convention yokluğu, server-side data için opinionated bir story yokluğu. SSR, SSG, ISR ve client rendering hepsi tek uygulamada, mantıklı default'larla.",
    personal:
      "Butlin's booking site'ında Next.js'i custom Webpack setup'tan legacy bir React SPA'yi taşımak için kullandım. Framework bize route-level code splitting ve image optimisation'ı kutudan çıkar çıkmaz verdi — ikisi de LCP'nin 4.8s'den 2.5s'ye inmesinde doğrudan rol oynadı.",
  },
  2: {
    general:
      "CSR (client-side rendering) boş bir shell gönderiyor, tarayıcı data'yı çekip render ediyor — deploy etmesi hızlı, SEO ve first paint için kötü. SSG (static site generation) build zamanında sayfaları HTML'e render ediyor, CDN'den servis edilebiliyor — runtime'da en hızlı ama bir sonraki build'e kadar bayat. SSR (server-side rendering) her request'te render ediyor — taze data, SSG'den yavaş. App Router buna dördüncü bir eksen ekliyor: React Server Components ile seçim sayfa bazlı değil component bazlı oluyor.",
  },
  3: {
    general:
      "App Router, Next.js 13'te tanıtılan ve app/ dizininde yaşayan routing sistemi. React Server Components üzerine kurulu, nested layout'ları destekliyor, Suspense ile streaming yapıyor, parallel ve intercepting route'ları var, page.tsx, layout.tsx, loading.tsx, error.tsx gibi file-system convention'ları kullanıyor. Pages Router'dan kafa değişimi şu: component'ler artık varsayılan olarak server-side render ediliyor ve client davranışına 'use client' ile opt-in oluyorsun.",
    personal:
      "Butlin's migration'ında booking site'ı Pages Router'dan App Router'a taşıdım. Kazanç sadece yeni feature'lar değildi — nested layout'lar her navigation'da global shell'i yeniden render etmeyi durdurdu, bu da LCP iyileşmesinin anlamlı bir kısmıydı.",
  },
  4: {
    general:
      "layout.tsx, bir route segment'i ve onun tüm child'larında paylaşılan UI'yi tanımlıyor — header, footer, navigation, provider'lar. children prop'u alıyor ve sayfayı sarıyor. Layout'lar aynı segment'teki navigation'da hayatta kalıyor, dolayısıyla içindeki her şey (state, scroll pozisyonu, embed'li medya) kullanıcı kardeş route'lar arasında geçerken unmount olmuyor.",
  },
  5: {
    general:
      "app/ (veya pages/) içindeki klasör yapısı URL yapısına dönüşüyor — app/blog/page.tsx /blog'u render ediyor. Özel dosya isimlerinin anlamı var: page.tsx route, layout.tsx onu sarıyor, loading.tsx Suspense fallback'i, error.tsx error boundary'si, route.ts API endpoint'i tanımlıyor. Dynamic segment'ler [slug], catch-all [...slug] kullanıyor, route group'lar URL'i etkilemeden organize etmek için (group).",
  },
  6: {
    general:
      "pages/ orijinal Next.js routing modeli — her dosya bir page, data getServerSideProps / getStaticProps ile fetch ediliyor, layout'lar custom bir _app.tsx pattern'i ile bağlanıyor. app/ ise Server Components üzerine kurulu yeni model — collocated layout'lar, streaming, native fetch'li async server component'ler, API'lar için route handler'lar. İkisi aynı projede migration sırasında çalışabiliyor ama layout paylaşmıyorlar.",
    personal:
      "Butlin's migration'ında iki router'ı birkaç ay paralel çalıştırdık ve route'ları bölüm bölüm taşıdık. Acı verici nokta layout duplikasyonu oldu — shared header'ı son pages route gidene kadar hem _app'te hem root layout'ta tuttuk.",
  },
  7: {
    general:
      "Server Component'ler server'da render ediliyor (build veya request zamanında) ve JS'leri tarayıcıya hiç gitmiyor. Data fetch edebiliyor, dosya okuyabiliyor, database'e direkt vurabiliyor — static veya çoğunlukla okunan UI için ideal. Client Component'ler — dosyanın başında 'use client' ile işaretlenmiş — tarayıcıda çalışıyor ve useState, useEffect, event handler'lar ve interaktiflik gerektiren her şey burada yaşıyor. Sınır tek yönlü: server component bir client component render edebilir, tersi olmaz.",
    personal:
      "Butlin's uygulamasında booking summary'yi server component olarak tuttum ve sadece kullanıcının etkileşime girdiği input'lar için 'use client' kullandım. Algılanan UX'i değiştirmeden o route'taki JS bundle'ını ciddi şekilde küçülttü.",
  },
  8: {
    general:
      "Component'in browser-only API'lara ihtiyacı varsa dosyanın başına 'use client' ekliyorsun — useState, useEffect, useRef, event handler'lar, window, localStorage, DOM'a dokunan üçüncü parti kütüphaneler. Directive sınırı işaretliyor: 'use client' dosyasından import edilen her şey de client sayılıyor. Pratik kural, mümkün olduğunca tree'de aşağıya itmek, böylece UI'nin çoğu server'da kalıyor.",
  },
  9: {
    general:
      "Klasör adındaki köşeli parantezler segment'i dynamic yapıyor — app/blog/[slug]/page.tsx /blog/anything ile eşleşiyor. Eşleşen değer params prop'u (Next 15+ ile Promise) üzerinden geliyor. [[...slug]] parent path'i de eşleştiren optional catch-all. Static export için generateStaticParams ile birleştiriyorsun, Next'e hangi slug'ları build'de pre-render edeceğini söylüyorsun.",
  },
  10: {
    general:
      "next/image, picture / srcset markup'ını elden yazmadan lazy loading, responsive srcset, modern formatlar (WebP / AVIF) ve layout shift'i engelleyen rezerve alan sağlayan dahili image component'i. width, height ve src veriyorsun; Image Optimization API üzerinden talep üzerine optimize edilmiş bir versiyon üretiyor. Image-heavy bir sitede Core Web Vitals için en yüksek leverage'li değişikliklerden biri.",
    personal:
      "Butlin's'te marketing sayfaları image-heavy idi ve LCP probleminin büyük bir kısmıydı. Her hero ve tile'ı düzgün sizes ile next/image'a geçirip above-the-fold image'a priority vermek muhtemelen 4.8 → 2.5s rakamının tek başına en büyük katkıydı.",
  },
  11: {
    general:
      "ISR, statik olarak generate edilmiş bir sayfayı servis edip arka planda bir zaman penceresinden sonra yenilemene izin veriyor — CDN hızında response, eventual freshness, full rebuild gerekmiyor. App Router'da export const revalidate = 60 ile, Pages Router'da getStaticProps içinde revalidate ile opt-in yapıyorsun. revalidatePath veya revalidateTag ile on-demand revalidation, kaynak gerçekten değiştiğinde belirli bir sayfayı veya cache tag'ini flipliyor — tam SSR'a geçmeden anında güncellenmesi gereken CMS-driven content için faydalı.",
    personal:
      "Butlin's product sayfalarında revalidateTag kullandım, CMS publish sadece o route'u invalidate ediyordu — full deploy yok, TTL beklemek yok. İçerik ekibinin sıkıştığı 'düzenle ve bekle' döngüsünü ortadan kaldırdı.",
  },
  12: {
    general:
      "Pages Router üç isimli fonksiyon kullanıyor: getStaticProps, getServerSideProps ve getStaticPaths — hepsi sayfa seviyesinde, hepsi props döndürüyor. App Router bunları tamamen kaldırıyor. async Server Component yazıyorsun ve fetch'i doğrudan await ediyorsun; caching ve revalidation fetch seçenekleri veya revalidate ve dynamic gibi route-segment export'lar üzerinden konfigüre ediliyor. Model framework lifecycle hook'larını bağlamaktan ziyade normal bir backend handler yazmaya yakın.",
  },
  13: {
    general:
      "Route Handler'lar, App Router'ın API route alternatifi — app/ içinde route.ts dosyası GET, POST, PATCH gibi HTTP method fonksiyonları export ediyor. Next'e özgü req/res yerine standart Web Request ve Response objelerini kullanıyorlar, bu da onları portable ve test etmesi daha kolay yapıyor. Webhook'lar, BFF endpoint'leri, file upload'lar ve Server Component'in doğru şekil olmadığı her yer için iyi bir fit.",
  },
  14: {
    general:
      "Next'in birkaç örtüşen cache'i var: Request Memoisation Cache (tek render içinde aynı fetch'leri dedup eden), Data Cache (request'ler arası kalıcı, cache: 'force-cache' / 'no-store' gibi fetch opsiyonları ve next: { revalidate, tags } ile kontrol edilen), Full Route Cache (render edilmiş HTML / RSC payload'ı) ve Router Cache (tarayıcıda). revalidatePath / revalidateTag ile veya route seviyesinde dynamic = 'force-dynamic' ayarlayarak bust ediyorsun.",
    personal:
      "Butlin's'te her fetch'i ilgili kaynakla tag'liyordum (örn. tags: ['hotel:' + id]), böylece booking sisteminden tek bir revalidateTag çağrısı o otelin geçtiği her yeri invalidate edebiliyordu. Hangi route'ların revalidate edileceğini elle takip etmekten çok daha temiz.",
  },
  15: {
    general:
      "Aynı iş, farklı router'lar. getStaticPaths Pages Router için — { paths, fallback } döndürüyor ve dynamic route'ları build'de pre-render etmek için getStaticProps ile eşleşiyor. generateStaticParams App Router karşılığı — async fonksiyon, bir dizi params objesi döndürüyor, Server Component sayfayı render ediyor. App Router versiyonu ayrıca nested dynamic segment'ler arasında otomatik dedup yapıyor, getStaticPaths bunu yapamıyor.",
  },
  16: {
    general:
      "Proje root'una middleware.ts (veya Next 16'da proxy.ts) oluşturuyorsun, NextRequest alıp NextResponse döndüren bir default fonksiyon export ediyorsun ve matcher config ile hangi route'larda çalışacağını konfigüre ediyorsun. Edge'de request route'a vurmadan önce çalışıyor, dolayısıyla auth gate'leri, redirect'ler, A/B testleri, geo-rewrite'lar ve locale negotiation için doğru yer. Küçük tut — eşleşen her request'te çalışıyor.",
  },
  17: {
    general:
      "Parallel route'lar aynı layout'ta aynı anda birden fazla bağımsız sayfa render etmene izin veriyor, her biri kendi slot'unda. @folder convention'ı ile slot'lar oluşturuyorsun — örneğin layout'un yanında @analytics ve @team — layout bunları children'la birlikte adlandırılmış prop'lar olarak alıyor. Bağımsız render edilip stream ediliyorlar, bu da her panelin kendi loading state'i olan dashboard'lar için harika.",
  },
  18: {
    general:
      "Intercepting route'lar tek bir URL'in nereden geldiğine bağlı olarak farklı UI render etmesine izin veriyor. Klasik vaka image preview — feed'deki thumbnail'a tıklamak image'ı feed üzerinde bir modal'da gösteriyor, ama aynı URL'i direkt ziyaret etmek tam sayfayı render ediyor. Intercept'i klasör adındaki (.) / (..) / (...) ile sinyalliyorsun ve modal slot'unu render etmek için parallel route'larla eşleştiriyorsun. Niş bir feature ama route'ları duplicate etmek veya state'i query param'larda saklamak gibi alışılmış hack'leri ortadan kaldırıyor.",
  },
  19: {
    general:
      "LCP: hero'da priority'li next/image, FOIT'i ortadan kaldırmak için next/font, data origin'lerine preconnect, daha az JS hydrate olsun diye pahalı işi Server Component'lere itmek. CLS: image ve embed'ler için yer ayır, geç yüklenip layout shift eden component'lerden kaçın, font-display: swap'i dikkatli kullan. INP: main thread'i serbest tut — fold'un altındaki her şeyi lazy-load yap, analytics'i defer et, ağır client tree'lere göre Server Component'leri tercih et, etkileşim ağırlıklı state update'leri için useTransition kullan. Sadece Lighthouse değil, Web Vitals library ile gerçek kullanıcı alanında ölç.",
    personal:
      "Butlin's'te manşet rakam LCP 4.8s → 2.5s, kabaca %40'lık bir Core Web Vitals iyileşmesi. En büyük katkılar above-the-fold hero'ya priority'li next/image, booking summary'yi Server Component'e taşıyıp client JS'i kısmak ve üçüncü parti round trip'i öldürmek için next/font ile font self-hosting'i oldu.",
  },
  20: {
    general:
      "next build, her route'un nasıl render olduğuna bağlı olarak bir artefact karışımı üretiyor: tamamen static sayfalar için static HTML, dynamic / SSR route'ları için server function, Edge runtime'a opt-in olan route'lar için edge function, ve optimize edilmiş image ve font asset'leri. Bu bölünme nereye deploy edebileceğini belirliyor — tam static export her yerde çalışır, ama dynamic olan her şey Node veya Edge runtime istiyor. Build Output API bunu standartlaştırıyor, böylece Vercel dışındaki platformlar (AWS Amplify, Cloudflare, self-hosted) bir Next uygulamasını doğru servis edebiliyor. Hangi route'ların hangi kovaya düştüğünü bilmek aynı zamanda cold start'ların nerede acıtacağını ve ISR'ın nerede yardımcı olacağını söylüyor.",
  },
};

async function main() {
  const file = path.join(process.cwd(), "data", "seed-nextjs.json");
  const raw = await readFile(file, "utf8");
  const data = JSON.parse(raw) as Array<{
    id: number;
    answerGeneralTr?: string | null;
    answerPersonalTr?: string | null;
    [k: string]: unknown;
  }>;

  let added = 0;
  for (const q of data) {
    const tr = TR[q.id];
    if (!tr) continue;
    q.answerGeneralTr = tr.general;
    q.answerPersonalTr = tr.personal ?? null;
    added += 1;
  }

  await writeFile(file, `${JSON.stringify(data, null, 2)}\n`);
  console.log(`seed-nextjs.json — TR added/updated on ${added} questions.`);
}

main().catch((err: unknown) => {
  console.error("Failed:", err instanceof Error ? err.message : err);
  process.exit(1);
});
