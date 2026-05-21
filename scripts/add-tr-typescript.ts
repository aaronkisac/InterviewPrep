/**
 * One-off: injects answerGeneralTr + answerPersonalTr into data/seed-typescript.json.
 *
 * Run:  pnpm tsx scripts/add-tr-typescript.ts
 * Then: pnpm seed
 */

import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

type Tr = { general: string; personal?: string };

const TR: Record<number, Tr> = {
  1: {
    general:
      ".ts düz TypeScript dosyaları için. .tsx ise compiler'a dosyanın JSX içerebileceğini söylüyor, böylece < ve > karakterlerini comparison değil element delimiter olarak parse ediyor. React markup döndüren her dosya için .tsx, geri kalan her şey için (utility'ler, JSX'siz hook'lar, type'lar) .ts kullan.",
  },
  2: {
    general:
      "Evet — tarayıcılar ve Node JavaScript çalıştırıyor, TypeScript değil. tsc, esbuild veya swc gibi bir bundler (Next.js'in kullandığı), ya da ts-node type'ları sıyırıp belirttiğin target sürümünde JS üretiyor. Type'lar sadece compile zamanında var; runtime'a hiçbir şey gitmiyor.",
  },
  3: {
    general:
      "Bir bug sınıfını editör seviyesinde yakalıyorsun — yazım hataları, eksik property'ler, yanlış argümanlar — hiç çalışmadan. IDE kullanışlı hale geliyor: autocomplete, jump-to-definition, güvenli refactor. Type'lar aynı zamanda zamanla bayatlamayan dokümantasyon — başkalarının kodunu okuduğunda en çok bunun değeri çıkıyor.",
  },
  4: {
    general:
      "TypeScript, JavaScript'in üzerine static type sistemi eklenmiş hali — aynı runtime davranışı, artı compile-time check. Belirli bir büyüklüğün üzerindeki her codebase'de type'lar refactor hatalarını yakalıyor ve comment'lerin asla yapamayacağı şekilde niyeti belgeliyor. Bir takım TS'e geçtikten sonra düz JS'e dönmek ışıkları kapalı yazmaya benziyor.",
    personal:
      "Butlin's migration'ında büyük bir legacy codebase'i sökerken TS strict mode büyük sweep'leri güvenli kılan şeydi — compiler atladığımız her yeri işaretliyordu. O olmadan App Router taşımasını zamanında bitirebileceğimizi sanmıyorum.",
  },
  5: {
    general:
      "Optional chaining (?.) bir property erişimini veya çağrıyı receiver null ya da undefined'sa kısa devre yapıyor, throw etmek yerine undefined döndürüyor. Yani user?.address?.city, user'da address olmasa bile güvenli. Bir fallback için nullish coalescing (??) ile doğal eşleşiyor ve compiler sonucu daraltıyor, downstream kod any-typed kalmıyor.",
  },
  6: {
    general:
      "?? sadece sol taraf null veya undefined olduğunda sağ taraftaki değeri döndürüyor — ||'dan farkı 0, boş string veya false için tetiklenmemesi. Bu ayrım falsy-ama-geçerli bir değerin anlamlı olduğu her yerde önemli (count ?? 10, 0'ı korur; count || 10 korumaz).",
  },
  7: {
    general:
      "Interface compile-time bir sözleşme — tamamen yapısal, runtime'da silinmiş. Class ise runtime'da nesne üreten ve aynı zamanda type olarak kullanılabilen bir yapı. Yani interface şekli tarif ediyor; class onu uyguluyor. Modern TS / React frontend'lerinde type işinin çoğunu interface (veya type alias) yapıyor, class neredeyse görünmüyor.",
  },
  8: {
    general:
      "TypeScript, JavaScript'in superset'i — static type sistemi ve enum, access modifier gibi birkaç ek yapı ekliyor. Compile adımı gerekiyor ama çıkan output JavaScript — aynı engine, aynı runtime semantiği. Pratik olarak: TS sana güvenlik ve tooling veriyor; JS daha az araç ve küçük script'lerde daha hızlı iterasyon.",
  },
  9: {
    general:
      "Interface bir objenin şeklini deklare ediyor — hangi property'lere sahip, type'ları ne, hangi metotları destekliyor. Compiler bunu yapısal tip kontrolü için kullanıyor ama runtime'da hiçbir şey hayatta kalmıyor. Prop'ları, API response'larını ve config objelerini tiplemenin en doğal yolu.",
  },
  10: {
    general:
      "Data olan her şey için interface (veya type alias) kullan — prop'lar, fonksiyon argümanları, API payload'ları. Class'a sadece gerçekten state ve davranışı olan bir instance lazım olduğunda uzan: feature flag client, Stripe wrapper, in-memory cache gibi. Tipik bir React/Next codebase'inde bunların dosya sayısı küçük.",
  },
  11: {
    general:
      "as const, compiler'a mümkün olan en dar tipi inferring etmesini söylüyor — string literal'lar literal kalıyor, dizi readonly tuple oluyor, obje property'leri readonly oluyor. Type-safe seçenek listelerinin, data'dan türetilen discriminated union'ların ve useReducer action tiplerini yeniden yazmadan doğru almanın arkasındaki numara.",
  },
  12: {
    general:
      "unknown güvenli top type — her şey ona atanabilir ama daraltmadan kullanamazsın. any tip kontrolünü tamamen kapatıyor; son çare olarak uzan. never empty bottom type — var olamayan bir değeri temsil ediyor, exhaustive switch check'leri için iş görüyor. Pratik kural: any yerine unknown tercih et ve atlanan case'leri never'a yakalatm.",
  },
  13: {
    general:
      "Interface obje şekillerini deklare ediyor ve declaration'lar arasında merge oluyor; type alias her şeyi (union'lar, tuple'lar, mapped type'lar, primitive'ler) isimlendirebiliyor ama merge olmuyor. Component prop'ları için her ikisi de iş görüyor. Benim kullandığım pragmatik ayrım: extend edebileceğin obje şekilleri için interface, union ve intersection için type — codebase içinde tutarlı ol, ikisini karıştırma.",
    personal:
      "Heyman Al shared component library'sinde her şeyi type olarak standardize ettik çünkü public API surface'in çoğu variant'lar için discriminated union'dı. interface ve type karışımı IDE preview'da public type'ları tutarsız gösteriyordu, tek yöne gittik ve bunu belgeledik.",
  },
  14: {
    general:
      "Evet ama sadece type seviyesinde — birden fazla signature yazıyorsun ve altta tüm input'ların union'unu kabul edip tüm output'ların union'unu döndüren tek bir implementation'a satisfy ediyor. Compiler call site'da uygun overload'u seçiyor. En çok return type'ın argüman şekline bağlı olduğu durumlarda iş görüyor; basit durumlar için generic veya discriminated union genelde daha temiz.",
  },
  15: {
    general:
      "TypeScript type'ları isimden değil şekilden eşleştiriyor — iki type aynı property'lere sahipse uyumlu, biri diğerini implement etmeye deklare edilmemiş bile olsa. Düz bir obje literal'ının resmi ilişkisi olmayan bir interface'i satisfy edebilmesi bundan. Mental model: compiler yardımıyla duck typing.",
  },
  16: {
    general:
      "Düz enum runtime'da gerçek bir JS objesine derleniyor, bu da birkaç byte maliyeti ve reverse lookup desteği demek. const enum compile zamanında inlining yapıyor — referanslar literal değerle değiştiriliyor, runtime'a hiçbir şey gitmiyor. Modern TS'te ikisini de genelde atlayıp as const obje + türetilmiş union kullanıyorum — tree-shaking ve isolated modules ile daha iyi çalışıyor.",
  },
  17: {
    general:
      "Currying, N argümanlı bir fonksiyonu N tane tek argümanlı fonksiyon zincirine çeviriyor: add(a, b), add(a)(b) oluyor. TS'te değeri, bir argümanı sabitleyip kısmen uygulanmış fonksiyonu doğru inferred type ile etrafta dolaştırmak. Generic curried helper'ları inference kaybetmeden type'lamak zor olabiliyor — bu yüzden çoğu takım az kullanıyor.",
  },
  18: {
    general:
      "İkisi de herhangi bir değer tutabilir, ama unknown seni daraltmaya zorluyor (typeof, instanceof, type guard ile) kullanmadan önce; any ise type checking'i sessizce kapatıyor. unknown, JSON.parse, fetch response'ları veya type'sız üçüncü parti API'lar gibi şeyler için güvenli sınır — any ise bug'ları gizleyen escape hatch.",
  },
  19: {
    general:
      "infer, conditional bir type'ın compiler'ın çıkardığı bir type'ı yakalayıp isimlendirmesini sağlıyor. Klasik örnek ReturnType<T> — T extends (...args: any[]) => infer R ? R : never içinde infer R kullanıyor, fonksiyonun döndürdüğü her ne ise onu çıkarmak için. infer olmadan şekilleri eşleştirebilirsin ama içlerinden parça çekemezsin, dolayısıyla standart library'deki utility type'ların çoğu buna dayanıyor.",
    personal:
      "Heyman Al component library'sinde variant map'lerinden prop tip türetmek için bunu çok kullandım — variants objesini as const tanımla, key'leri infer et, consumer her zaman canlı union'ı alıyor. Yeniden yazma yok, drift yok.",
  },
  20: {
    general:
      "never var olamayan bir değerin tipi — hep throw eden veya sonsuz dönen bir fonksiyonun return tipi ve tüm case'ler tüketildiğinde compiler'ın daralttığı tip. En faydalı rolü exhaustive switch'leri zorunlu kılmak: default case'te discriminant'ı never-typed bir değişkene atamak, 'bir case atladım'ı runtime bug'ından compile error'a çeviriyor.",
  },
};

async function main() {
  const file = path.join(process.cwd(), "data", "seed-typescript.json");
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
  console.log(`seed-typescript.json — TR added/updated on ${added} questions.`);
}

main().catch((err: unknown) => {
  console.error("Failed:", err instanceof Error ? err.message : err);
  process.exit(1);
});
