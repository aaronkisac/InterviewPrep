/**
 * One-off: injects answerGeneralTr + answerPersonalTr into data/seed-react.json.
 *
 * Run:  pnpm tsx scripts/add-tr-react.ts
 * Then: pnpm seed
 */

import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

type Tr = { general: string; personal?: string };

const TR: Record<number, Tr> = {
  1: {
    general:
      "React, küçük ve yeniden kullanılabilir bileşenlerden arayüz inşa etmek için kullanılan bir JavaScript kütüphanesi. Belirli bir state için UI'nin nasıl görünmesi gerektiğini sen tanımlıyorsun, React de bunu DOM'a en az değişiklikle yansıtıyor. Model baştan sona declarative — adımları değil, varış noktasını yazıyorsun.",
  },
  2: {
    general:
      "React'ta inline stil için style prop'una bir JS objesi veriyorsun, CSS özellikleri camelCase, değerler string veya sayı: <div style={{ backgroundColor: \"tomato\", marginTop: 8 }} />. Birimsiz sayılar piksel olarak yorumlanıyor. Tek seferlik dinamik stiller için yeterli, ama tekrar kullanılacak şeyler için CSS class veya Tailwind utility daha temiz.",
  },
  3: {
    general:
      "Jest, Meta'nın çıkardığı bir JavaScript test runner'ı. Genelde component testleri için React Testing Library ile birlikte kullanılıyor. Assertion, mocking, snapshot — hepsi tek pakette geliyor, dolayısıyla test suite'i kurmak için dört ayrı kütüphane bağlamana gerek kalmıyor.",
    personal:
      "Keypoint Solutions'da Jest + RTL suite'ini frontend tarafında %85 coverage'a kadar çıkardım — yaklaşık %60'ı geçtikten sonra PR'larda regression bug'ları gözle görülür şekilde azaldı ve refactor'leri korkmadan yapabildiğimiz güvenlik ağına dönüştü.",
  },
  4: {
    general:
      "Bileşen modeli UI'yi kompoze edilebilir ve yeniden kullanılabilir hale getiriyor — aynı Button'ı bir kere yazıp her yerde kullanıyorsun. Virtual DOM sayesinde her değişiklikte tüm UI yeniden render oluyormuş gibi kod yazabiliyorsun, React verimli diff'i hallediyor. Ekosistemi çok geniş: Next.js, React Native ve çoğu meta-framework React'i hedef alıyor, dolayısıyla yetkinlik taşınabilir.",
  },
  5: {
    general:
      "Flux, Meta'nın 2014'te React ile birlikte önerdiği tek yönlü veri akışı pattern'i — action'lar dispatcher üzerinden store'lara gidiyor, oradan view'lara dönüyor ve döngü tekrarlanıyor. Modern uygulamalarda Flux'u direkt kullanan yok, ama fikirleri Redux'ta, Zustand'da ve mutation'ların tek bir kanaldan geçtiği her state library'sinde yaşıyor. Kavramsal ata olarak bilmeye değer.",
  },
  6: {
    general:
      "React 16 öncesinde error boundary yoktu — herhangi bir component'te exception fırlatınca tüm tree unmount oluyor, ekranda beyaz sayfa görüyordun. React 16 componentDidCatch lifecycle'ını ve static getDerivedStateFromError metodunu ekledi; bir class component artık çocuklarındaki hataları yakalayıp fallback UI render edebiliyor. Bugün tipik olarak uygulamanın parçalarını ErrorBoundary ile sarıyorsun, tek bir bozulan widget tüm sayfayı götürmüyor.",
  },
  7: {
    general:
      "React bir view library, framework değil — routing, data fetching, form'lar hep getir-kendi-getir. Bu da daha fazla karar ve daha fazla yanlış yapma yolu demek. JSX ve build adımı öğrenme maliyetini artırıyor. Değişim hızı yüksek (hooks, Suspense, Server Components) — iki yıl önceki pattern'lar bile bugün eski hissettiriyor.",
  },
  8: {
    general:
      "Element, JSX yazdığında React'in oluşturduğu sade obje — ekranda ne olması gerektiğini tarif ediyor (type, props, children) ama kendi başına bir şey yapmıyor. Component ise bu Element'leri döndüren fonksiyon veya class. Component'ler fabrika; Element'ler çıktı.",
  },
  9: {
    general:
      "Stateful bir component kendi state'ine sahip ve onu yönetir — kullanıcı etkileşimine veya başka iç verilere göre ne render ettiği değişir. Modern React'ta bu genelde useState veya useReducer kullanan bir function component demek. Davranış parent'a kaldırılmak yerine component'in kendisinde yaşıyorsa (bir toggle, bir form alanı) doğru araç.",
  },
  10: {
    general:
      "Stateless bir component prop alıp JSX döndürür — iç state yok, side effect yok, sadece input'tan UI'ye saf bir mapping. Akıl yürütmesi ve test etmesi daha kolay; design system'lerin yapı taşları olarak da çok iş görüyorlar. Stateful'a sadece component'in gerçekten bir şey hatırlaması gerektiğinde uzan.",
  },
  11: {
    general:
      "createElement sıfırdan yeni bir React Element kuruyor (type, props, children'dan) — JSX zaten buna derleniyor. cloneElement ise var olan bir Element'i alıp prop'ları merge veya override ederek kopyasını üretiyor. cloneElement bugün niş bir araç; yaygın kullanım, sahip olmadığı çocuklara ek prop enjekte etmesi gereken compound component kütüphanelerinde.",
  },
  12: {
    general:
      "En basit cevap: function component yaz — bind edilecek this yok. Class'la çalışmak zorundaysan, metodu class field arrow function olarak tanımlamak (handleClick = () => { ... }) onu instance'a otomatik bind ediyor. İki yöntem de constructor'daki bind boilerplate'ini ortadan kaldırıyor.",
  },
  13: {
    general:
      "Render, prop'lar ve state'in saf bir fonksiyonu olmalı — side effect yok, fetching yok, subscription yok, state mutation yok. Render içinde setState çağırırsan sonsuz döngüye girersin. Side effect'ler useEffect'e (veya class'larda componentDidMount / componentDidUpdate'e) ait, böylece render predictable ve idempotent kalıyor.",
  },
  14: {
    general:
      "Key'ler listedeki her item'a stabil bir kimlik veriyor; dizi yeniden sıralandığında React DOM node'ları yok edip yeniden kurmak yerine yer değiştirebiliyor. Key olmadan (veya yeniden sıralanan bir listede array index'ini key olarak kullanırsan) çok ince bug'lar çıkıyor — focus atlıyor, animasyonlar yeniden başlıyor, controlled input'lar değerini kaybediyor.",
    personal:
      "Heyman Al'da sıralanabilir bir kart listesi her reorder'da formdaki canlı state'ini siliyordu; index key'den row id'ye geçince sorun anında çözüldü. Şimdi code review'larda değişebilir bir listede index'i key olarak görürsem otomatik yorum bırakıyorum.",
  },
  15: {
    general:
      "Diziyi JSX'e map'liyorsun ve her elemana stabil bir key veriyorsun — genelde index değil row'un id'si: items.map(item => <Row key={item.id} {...item} />). map'i render'ın dışına useMemo ile çıkarmak gerçekten ölçtüğünde fark ediyorsa anlamlı. Senior seviyedeki ilginç kısımlar key seçimi, çok uzun listeler için virtualization ve downstream memoisation'ı kırmamak için stabil referanslar.",
  },
  16: {
    general:
      "Class component'te render, React'in mevcut prop ve state için ekrana ne çizilmesi gerektiğini sorduğu fonksiyon — Element'leri döndürüyor. Sözleşmesi şu: saf olmak zorunda, aynı input'la aynı output, side effect yok. Function component'ler aslında sadece render metodu — hook'lar lifecycle'ın yaptığı her şeyi üstleniyor.",
  },
  17: {
    general:
      "JavaScript class metotları this context'ini yanlarında taşımıyor — bir callback olarak geçirdiğinde this onu kim çağırırsa o oluyor (strict mode'da genelde undefined). React otomatik bind yapmıyor, dolayısıyla constructor'da bind ediyorsun, class field arrow function kullanıyorsun ya da hook'lu function component yazıp sorunu tamamen atlıyorsun.",
  },
  18: {
    general:
      "Reconciliation, React'in önceki tree'yi yenisine dönüştürmek için gereken minimum DOM operasyonunu hesaplayan algoritması. İki tree'yi element type ve key üzerinden karşılaştırıyor — type eşleşirse prop'ları update ediyor, eşleşmezse yıkıp yeniden kuruyor. Bunu anlamak key'leri ve stabil component identity'sini yerine oturtuyor — bir subtree'yi farklı bir parent altına taşımanın neden remount tetiklediği de bu yüzden.",
    personal:
      "Butlin's App Router migration'ında bir in-app booking flow adım ortasında form state'ini kaybetmeye başlamıştı. Yeni layout boundary form'un tree'deki yerini değiştiriyor ve reconciliation onu unmount ediyordu; form'u stabil bir layout'a almak state-management'a dokunmadan sorunu çözdü.",
  },
  19: {
    general:
      "Element'ler immutable sade obje, UI'yi tarif ediyor — { type, props, children }. Component'ler Element döndüren fonksiyon veya class. Expert seviyede ilginç olan kısım, type'ın ne olabileceği: string (host element, 'div' gibi), function veya class component, React.Fragment gibi bir symbol, ya da lazy / forwardRef / memo wrapper — her birini reconciliation farklı şekilde ele alıyor.",
  },
  20: {
    general:
      "StrictMode, sorunları yüzeye çıkarmak için tasarlanmış dev-only bir wrapper — effect'leri, state initialiser'ları ve reducer'ları bilinçli olarak iki kez çalıştırıyor ve deprecated API'leri işaretliyor. Production'da no-op. Amacı, idempotent olmayan effect'leri veya mount'un yalnızca bir kez olacağını varsayan component'leri yakalamak — ikisi de Concurrent Rendering altında bozuluyor.",
    personal:
      "Eleven Eleven Academy'de mentorluk yaparken öğrencilerin projelerinde ilk açtığım şeylerden biri bu — double-effect davranışı, useEffect cleanup'ının neden önemli olduğunu öğretmenin en hızlı yolu.",
  },
};

async function main() {
  const file = path.join(process.cwd(), "data", "seed-react.json");
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
  console.log(`seed-react.json — TR added/updated on ${added} questions.`);
}

main().catch((err: unknown) => {
  console.error("Failed:", err instanceof Error ? err.message : err);
  process.exit(1);
});
