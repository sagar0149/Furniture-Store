
import Link from "next/link";
import { getAllExchangeRates } from "@/repositories/exchange-rate.repository";

export const dynamic = "force-dynamic";

export default async function ExchangeRatesPage() {
  const rates = await getAllExchangeRates();

  return (
    <main className="space-y-6 p-6">
      <div>
        <Link
          href="/admin/settings"
          className="text-sm text-muted-foreground hover:underline"
        >
          ← Back to Settings
        </Link>

        <h1 className="mt-3 text-2xl font-semibold">
          Exchange Rates
        </h1>

        <p className="mt-1 text-sm text-muted-foreground">
          Rates are expressed as target-currency units per NPR 1.
        </p>
      </div>

      <section className="rounded-xl border p-5">
        <h2 className="text-lg font-medium">
          Add or update a rate
        </h2>

        <p className="mt-1 text-sm text-muted-foreground">
          Example: a rate of 0.625 means NPR 1 = INR 0.625.
        </p>

        <form
          action="/admin/settings/exchange-rates"
          method="get"
          className="mt-4 flex flex-wrap gap-3"
        >
          <p className="w-full text-sm text-muted-foreground">
            The save form will be enabled after the admin authorization
            check and server action are connected.
          </p>
        </form>
      </section>

      <section className="overflow-hidden rounded-xl border">
        <div className="border-b px-5 py-4">
          <h2 className="font-medium">Configured rates</h2>
        </div>

        {rates.length === 0 ? (
          <p className="p-5 text-sm text-muted-foreground">
            No exchange rates have been configured yet.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-5 py-3 font-medium">Currency</th>
                  <th className="px-5 py-3 font-medium">Rate per NPR 1</th>
                  <th className="px-5 py-3 font-medium">Last updated</th>
                </tr>
              </thead>

              <tbody>
                {rates.map((item) => (
                  <tr key={item.id} className="border-t">
                    <td className="px-5 py-3 font-medium">
                      {item.currency}
                    </td>
                    <td className="px-5 py-3 tabular-nums">
                      {item.rate}
                    </td>
                    <td className="px-5 py-3 text-muted-foreground">
                      {new Date(item.updatedAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}
