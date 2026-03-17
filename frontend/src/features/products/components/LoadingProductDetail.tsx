/**
 * Loading state for the product detail page.
 */
export function LoadingProductDetail() {
  return (
    <section className="space-y-5">
      <div className="surface-card p-5">
        <div className="skeleton h-8 w-1/2" />
        <div className="mt-3 skeleton h-4 w-2/3" />
      </div>
      <div className="grid gap-5 lg:grid-cols-12">
        <div className="surface-card p-4 lg:col-span-7">
          <div className="skeleton aspect-[4/3] w-full rounded-2xl" />
        </div>
        <div className="surface-card p-5 lg:col-span-5">
          <div className="space-y-3">
            <div className="skeleton h-4 w-1/3" />
            <div className="skeleton h-8 w-4/5" />
            <div className="skeleton h-4 w-full" />
          </div>
        </div>
      </div>
    </section>
  );
}
