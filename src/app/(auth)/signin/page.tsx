import { redirect } from "next/navigation";

import { auth, signIn } from "@/lib/auth";
import { getLang } from "@/lib/lang";
import { i18nSignIn } from "@/lib/i18n";

export const metadata = {
  title: "Sign in · Interview Prep",
};

export default async function SignInPage() {
  const session = await auth();
  if (session?.user) {
    redirect("/");
  }

  const lang = await getLang();
  const i18n = i18nSignIn[lang];

  return (
    <main className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center gap-6 px-6 py-16">
      <header className="space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">{i18n.title}</h1>
        <p className="text-sm text-muted-foreground">{i18n.sub}</p>
      </header>

      <div className="flex flex-col gap-3">
        <form
          action={async () => {
            "use server";
            await signIn("google", { redirectTo: "/" });
          }}
        >
          <button
            type="submit"
            className="w-full rounded-md border border-border bg-background px-4 py-2.5 text-sm font-medium hover:bg-accent"
          >
            {i18n.google}
          </button>
        </form>

        <form
          action={async () => {
            "use server";
            await signIn("github", { redirectTo: "/" });
          }}
        >
          <button
            type="submit"
            className="w-full rounded-md border border-border bg-background px-4 py-2.5 text-sm font-medium hover:bg-accent"
          >
            {i18n.github}
          </button>
        </form>
      </div>
    </main>
  );
}
