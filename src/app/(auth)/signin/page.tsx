import { redirect } from "next/navigation";

import { auth, signIn } from "@/lib/auth";

export const metadata = {
  title: "Sign in",
  description:
    "Sign in with Google or GitHub to save mock session results, bookmark questions, and track your interview-prep progress.",
};

export default async function SignInPage() {
  const session = await auth();
  if (session?.user) {
    redirect("/");
  }

  return (
    <main className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center gap-6 px-6 py-16">
      <header className="space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Sign in</h1>
        <p className="text-sm text-muted-foreground">
          Use Google or GitHub. No password.
        </p>
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
            Continue with Google
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
            Continue with GitHub
          </button>
        </form>
      </div>
    </main>
  );
}
