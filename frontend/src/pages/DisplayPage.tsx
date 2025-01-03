import { ArrowPathIcon } from "@heroicons/react/24/outline";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { formatTimestamp } from "../lib/utils";
import { useOrdersService } from "../services/orders";
import { Order, OrderStatus } from "../types";

// Public display page for showing order status to customers
export default function DisplayPage() {
  const { storeId } = useParams<{ storeId: string }>();
  const { getOrders } = useOrdersService();

  // Fetch orders with auto-refresh every 5 seconds
  const { data: orders = [], dataUpdatedAt } = useQuery({
    queryKey: ["orders", storeId],
    queryFn: () => (storeId ? getOrders(storeId) : Promise.resolve([])),
    enabled: !!storeId,
    refetchInterval: 5000,
  });

  // Filter and sort orders in preparation
  const preparingOrders = orders
    .filter((order: Order) => order.status === OrderStatus.PREPARING)
    .sort(
      (a: Order, b: Order) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );

  // Filter and sort completed orders
  const completedOrders = orders
    .filter((order: Order) => order.status === OrderStatus.COMPLETED)
    .sort(
      (a: Order, b: Order) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );

  // Check if data is stale (over 30 seconds old)
  const timeSinceLastUpdate = Math.floor((Date.now() - dataUpdatedAt) / 1000);
  const isStale = timeSinceLastUpdate > 30;

  // Reusable order card component with status-based styling
  const OrderCard = ({ order, variant }: { order: Order; variant: "preparing" | "completed" }) => (
    <div
      className={`rounded-xl p-4 shadow-sm sm:p-6 ${
        variant === "preparing" ? "bg-brand-500" : "bg-green-500"
      }`}
    >
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-baseline text-2xl font-bold tracking-tight text-white sm:text-4xl">
            <span>F-</span>
            <span className="font-normal text-white/75">xxxx</span>
            <span>{order.orderId}</span>
          </div>
          <div className="flex items-center gap-2">
            <div
              className={`rounded-full px-3 py-1 text-xs font-medium sm:px-4 sm:py-2 sm:text-base ${
                variant === "preparing"
                  ? "text-brand-950 bg-brand-300"
                  : "bg-green-300 text-green-950"
              }`}
            >
              {variant === "preparing" ? "Sedang di Masak" : "Selesai"}
            </div>
            {variant === "preparing" && (
              <div className="relative flex h-[22px] w-[22px] sm:h-[34px] sm:w-[34px]">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75"></span>
                <span className="relative inline-flex h-full w-full items-center justify-center rounded-full bg-white">
                  <ArrowPathIcon className="h-3 w-3 animate-spin stroke-2 text-brand-500 sm:h-5 sm:w-5" />
                </span>
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div className="text-lg text-white sm:text-xl">{order.name}</div>
          <div className="text-xs text-white/90 sm:text-sm">{formatTimestamp(order.updatedAt)}</div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-[100svh] flex-col bg-[#FFDFB5]">
      {/* Mobile View (Tabs) */}
      <div className="flex-1 overflow-hidden sm:hidden">
        <div className="flex h-full flex-col p-3 pb-0">
          <Tabs defaultValue="preparing" className="flex h-full flex-col">
            <TabsList className="flex w-full rounded-lg bg-white/80 backdrop-blur">
              <TabsTrigger
                value="preparing"
                className="flex-1 data-[state=active]:bg-brand-500 data-[state=active]:text-white"
              >
                Dimasak ({preparingOrders.length})
              </TabsTrigger>
              <TabsTrigger
                value="completed"
                className="flex-1 data-[state=active]:bg-green-500 data-[state=active]:text-white"
              >
                Selesai ({completedOrders.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="preparing" className="flex-1 overflow-y-auto py-3 pt-2">
              <div className="space-y-3">
                {preparingOrders.map((order: Order) => (
                  <OrderCard key={order.id} order={order} variant="preparing" />
                ))}
                {preparingOrders.length === 0 && (
                  <div className="py-12 text-center text-sm text-neutral-500">
                    Tidak ada pesanan yang sedang dimasak
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="completed" className="flex-1 overflow-y-auto py-3 pt-2">
              <div className="space-y-3">
                {completedOrders.map((order: Order) => (
                  <OrderCard key={order.id} order={order} variant="completed" />
                ))}
                {completedOrders.length === 0 && (
                  <div className="py-12 text-center text-sm text-neutral-500">
                    Tidak ada pesanan yang selesai
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Desktop/Tablet View (Split Screen) */}
      <div className="hidden flex-1 overflow-hidden sm:flex">
        {/* Preparing Orders Column */}
        <div className="flex flex-1 flex-col overflow-hidden">
          <div className="p-6 pb-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-brand-500">Sedang di Masak</h2>
              <span className="rounded-full bg-brand-500 px-4 py-1 text-lg text-white">
                {preparingOrders.length} Pesanan
              </span>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-6">
            <div className="space-y-6 pb-6">
              {preparingOrders.map((order: Order) => (
                <OrderCard key={order.id} order={order} variant="preparing" />
              ))}
              {preparingOrders.length === 0 && (
                <div className="py-12 text-center text-lg text-neutral-500">
                  Tidak ada pesanan yang sedang dimasak
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Completed Orders Column */}
        <div className="flex flex-1 flex-col overflow-hidden">
          <div className="p-6 pb-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-green-600">Selesai</h2>
              <span className="rounded-full bg-green-500 px-4 py-1 text-lg text-white">
                {completedOrders.length} Pesanan
              </span>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-6">
            <div className="space-y-6 pb-6">
              {completedOrders.map((order: Order) => (
                <OrderCard key={order.id} order={order} variant="completed" />
              ))}
              {completedOrders.length === 0 && (
                <div className="py-12 text-center text-lg text-neutral-500">
                  Tidak ada pesanan yang selesai
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Footer - Always visible */}
      <div className="bg-neutral-800 px-3 py-1.5 sm:px-4 sm:py-2">
        <div className="mx-1 flex items-center justify-between sm:mx-2">
          <div className="flex-1">
            <h1 className="text-[10px] text-brand-100 sm:text-xs">
              <span className="hidden sm:inline">Made by </span>
              <span className="inline sm:hidden">By </span>
              <a
                href="https://github.com/faqihxdev"
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand-300 transition-colors hover:text-brand-200"
              >
                @faqihxdev
              </a>
            </h1>
          </div>
          <div
            className={`flex items-center gap-1 sm:gap-2 ${isStale ? "text-red-500" : "text-green-500"}`}
          >
            <div
              className={`h-1 w-1 animate-pulse rounded-full sm:h-1.5 sm:w-1.5 ${
                isStale ? "bg-red-500" : "bg-green-500"
              }`}
            />
            <span className="text-[10px] sm:text-xs">
              {formatTimestamp(new Date(), dataUpdatedAt)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
