import Link from "next/link";
import { FileQuestion } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-cream-100 p-6 text-center dark:bg-charcoal-950">
      <FileQuestion className="h-10 w-10 text-navy-500" />
      <h1 className="font-display text-2xl font-bold">Página não encontrada</h1>
      <p className="max-w-sm text-sm text-muted">
        O protocolo ou recurso que você procura não existe ou foi removido.
      </p>
      <Link
        href="/dashboard"
        className="focus-ring rounded-xl bg-navy-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-navy-800 dark:bg-navy-600"
      >
        Voltar ao dashboard
      </Link>
    </div>
  );
}
