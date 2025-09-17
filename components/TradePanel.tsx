// TradePanel.tsx
import React, { useEffect, useState, useRef } from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Chip,
  Tooltip,
  Divider,
  Avatar,
  Badge,
  ScrollShadow,
  Skeleton
} from "@heroui/react";
import { X, Check, XCircle, Package, ArrowLeftRight } from "lucide-react";
import type { Item } from "./Inventory";
import CachedImage from "./utils/CachedImage";

type TradeStatus = "pending" | "approved" | "completed" | "canceled";

interface TradeItem extends Item {
  itemId: string;
  amount: number;
  metadata?: { [key: string]: unknown; _unique_id?: string };
  purchasePrice?: number;
}

interface Trade {
  id: string;
  fromUserId: string;
  toUserId: string;
  fromUserItems: TradeItem[];
  toUserItems: TradeItem[];
  approvedFromUser: boolean;
  approvedToUser: boolean;
  status: TradeStatus;
  createdAt: string;
  updatedAt: string;
}

interface TradePanelProps {
  tradeId: string;
  userId: string;
  token: string;
  inventory: Item[];
  reloadInventory: () => void;
  onClose: () => void;
  profile?: {
    username: string;
  };
  apiBase?: string;
}

const formatMetadata = (metadata?: { [key: string]: unknown }) => {
  if (!metadata) return null;

  const displayMetadata = Object.entries(metadata)
    .filter(([key]) => key !== "_unique_id")
    .map(([key, value]) => `${key}: ${value}`)
    .join(", ");

  return displayMetadata || null;
};

const getRarityColor = (rarity: string) => {
  const rarityColors = {
    "very-common": "#9ca3af",
    "common": "#ffffff",
    "uncommon": "#22c55e",
    "rare": "#3b82f6",
    "very-rare": "#8b5cf6",
    "epic": "#a855f7",
    "ultra-epic": "#ec4899",
    "legendary": "#f59e0b",
    "ancient": "#f97316",
    "mythic": "#ef4444",
    "godlike": "#dc2626",
    "radiant": "#fbbf24"
  };
  return rarityColors[rarity as keyof typeof rarityColors] || "#9ca3af";
};

function TradeInventoryItem({
  item,
  onClick,
  removable,
  disabled
}: {
  item: TradeItem;
  onClick?: () => void;
  removable?: boolean;
  disabled?: boolean;
}) {
  const formattedMetadata = formatMetadata(item.metadata);

  return (
    <Tooltip
      content={
        <div className="p-2 max-w-xs">
          <div className="font-bold text-foreground">{item.name}</div>
          <div className="text-sm text-foreground/70 mt-1">{item.description}</div>
          {formattedMetadata && (
            <div className="text-xs text-foreground/50 mt-2 italic">
              {formattedMetadata}
            </div>
          )}
          {item.metadata?._unique_id && (
            <div className="text-xs text-foreground/30 mt-1 font-mono">
              ID: {(item.metadata._unique_id as string).substring(0, 8)}...
            </div>
          )}
        </div>
      }
      placement="top"
    >
      <Card 
        className={`relative cursor-pointer transition-all duration-200 hover:scale-105 min-w-[80px] min-h-[80px] ${
          onClick && !disabled ? 'hover:shadow-lg hover:shadow-primary/25' : ''
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        isPressable={!!onClick && !disabled}
        onPress={onClick}
        style={{
          borderColor: getRarityColor(item.rarity),
          borderWidth: '2px'
        }}
      >
        <CardBody className="p-2 flex flex-col items-center justify-center">
          {/* Indicateur métadonnées */}
          {item.metadata && (
            <div className="absolute top-1 right-1 w-2 h-2 bg-warning rounded-full border border-content1 z-10" />
          )}
          
          <div className="w-12 h-12 flex items-center justify-center mb-1">
            <CachedImage
              src={"/items-icons/" + (item.iconHash || item.itemId)}
              alt={item.name}
              className="w-full h-full object-contain"
            />
          </div>
          
          <Chip
            size="sm"
            variant="flat"
            className="text-xs"
          >
            x{item.amount}
          </Chip>
          
          <div className="text-xs text-center mt-1 line-clamp-2 font-medium">
            {item.name}
          </div>
          
          {removable && (
            <Button
              size="sm"
              color="danger"
              variant="flat"
              className="mt-1 min-w-unit-12 h-unit-6"
              onClick={(e) => {
                e.stopPropagation();
                onClick?.();
              }}
            >
              -1
            </Button>
          )}
        </CardBody>
      </Card>
    </Tooltip>
  );
}

function TradeColumn({
  title,
  items,
  approved,
  removable,
  onRemoveItem,
}: {
  title: string;
  items: TradeItem[];
  approved: boolean;
  removable?: boolean;
  onRemoveItem?: (item: TradeItem) => void;
}) {
  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between w-full">
          <h3 className="text-lg font-semibold">{title}</h3>
          {approved && (
            <Chip
              color="success"
              variant="flat"
              startContent={<Check className="w-3 h-3" />}
              size="sm"
            >
              Approved
            </Chip>
          )}
        </div>
      </CardHeader>
      <Divider />
      <CardBody>
        <ScrollShadow className="h-[200px]">
          <div className="grid grid-cols-3 gap-2">
            {items.length === 0 ? (
              <div className="col-span-3 flex flex-col items-center justify-center py-8 text-foreground/50">
                <Package className="w-8 h-8 mb-2" />
                <p className="text-sm">No items</p>
              </div>
            ) : (
              items.map((item) => (
                <TradeInventoryItem
                  key={
                    item.metadata?._unique_id
                      ? `${item.itemId}-${item.metadata._unique_id}`
                      : item.itemId
                  }
                  item={item}
                  removable={removable}
                  onClick={
                    removable && onRemoveItem
                      ? () =>
                          onRemoveItem({
                            ...item,
                            amount: 1,
                            metadata: item.metadata,
                          })
                      : undefined
                  }
                />
              ))
            )}
          </div>
        </ScrollShadow>
      </CardBody>
    </Card>
  );
}

export default function TradePanel({
  tradeId,
  userId,
  token,
  inventory,
  reloadInventory,
  onClose,
  profile,
  apiBase = "/api",
}: TradePanelProps) {
  const [trade, setTrade] = useState<Trade | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Poll trade state every second
  useEffect(() => {
    let stopped = false;
    const fetchTrade = async () => {
      try {
        const res = await fetch(`${apiBase}/trades/${tradeId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!res.ok) throw new Error("Failed to fetch trade");
        const data = await res.json();
        setTrade(data);
        setError(null);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    fetchTrade();
    intervalRef.current = setInterval(fetchTrade, 1000);
    return () => {
      stopped = true;
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [tradeId, token, apiBase]);

  // Close panel if trade is completed
  useEffect(() => {
    if (trade?.status === "completed" || trade?.status === "canceled") {
      onClose();
    }
  }, [trade?.status, onClose]);

  // Actions
  const approve = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${apiBase}/trades/${tradeId}/approve`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error("Failed to approve trade");
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const cancel = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${apiBase}/trades/${tradeId}/cancel`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error("Failed to cancel trade");
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  async function addItem(item: {
    itemId: string;
    amount: number;
    metadata?: { [key: string]: unknown; _unique_id?: string };
    purchasePrice?: number;
  }) {
    setLoading(true);
    try {
      const res = await fetch(`${apiBase}/trades/${tradeId}/add-item`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          tradeItem: {
            itemId: item.itemId,
            amount: item.amount,
            metadata: item.metadata,
            purchasePrice: item.purchasePrice,
          },
        }),
      });
      if (!res.ok) throw new Error("Failed to add item");
      reloadInventory();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  const removeItem = async (item: TradeItem) => {
    setLoading(true);
    try {
      const res = await fetch(`${apiBase}/trades/${tradeId}/remove-item`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          tradeItem: {
            itemId: item.itemId,
            amount: item.amount,
            metadata: item.metadata,
            purchasePrice: item.purchasePrice,
          },
        }),
      });
      if (!res.ok) throw new Error("Failed to remove item");
      reloadInventory();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  // Helpers
  const isCurrentUserFrom = trade?.fromUserId === userId;
  const userItems = isCurrentUserFrom
    ? trade?.fromUserItems || []
    : trade?.toUserItems || [];
  const otherItems = isCurrentUserFrom
    ? trade?.toUserItems || []
    : trade?.fromUserItems || [];
  const userApproved = isCurrentUserFrom
    ? trade?.approvedFromUser
    : trade?.approvedToUser;
  const otherApproved = isCurrentUserFrom
    ? trade?.approvedToUser
    : trade?.approvedFromUser;

  // Loading state
  if (loading && !trade) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
        <Card className="w-full max-w-6xl max-h-[90vh] mx-4">
          <CardBody className="p-8">
            <div className="space-y-4">
              <Skeleton className="h-8 w-48" />
              <div className="grid grid-cols-2 gap-6">
                <Skeleton className="h-64" />
                <Skeleton className="h-64" />
              </div>
              <Skeleton className="h-32" />
            </div>
          </CardBody>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
        <Card className="w-full max-w-md mx-4">
          <CardBody className="text-center p-8">
            <XCircle className="w-16 h-16 text-danger mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-danger mb-2">Error</h3>
            <p className="text-foreground/70">{error}</p>
            <Button color="primary" onPress={onClose} className="mt-4">
              Close
            </Button>
          </CardBody>
        </Card>
      </div>
    );
  }

  if (!trade) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
        <Card className="w-full max-w-md mx-4">
          <CardBody className="text-center p-8">
            <Package className="w-16 h-16 text-foreground/50 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Trade not found</h3>
            <p className="text-foreground/70 mb-4">The requested trade could not be found.</p>
            <Button color="primary" onPress={onClose}>
              Close
            </Button>
          </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <Card className="w-full max-w-6xl max-h-[90vh] mx-4 overflow-hidden">
        <CardHeader className="flex justify-between items-center pb-4">
          <div className="flex items-center space-x-3">
            <ArrowLeftRight className="w-6 h-6 text-primary" />
            <h2 className="text-2xl font-bold">
              Trade with {profile?.username || "Unknown User"}
            </h2>
          </div>
          <Button
            isIconOnly
            variant="light"
            onPress={onClose}
            className="text-foreground/50 hover:text-foreground"
          >
            <X className="w-5 h-5" />
          </Button>
        </CardHeader>

        <Divider />

        <CardBody className="p-6 overflow-y-auto">
          <div className="space-y-6">
            {/* Trade Status */}
            <div className="flex items-center justify-center space-x-4">
              <Chip
                color={trade.status === "pending" ? "warning" : trade.status === "completed" ? "success" : "danger"}
                variant="flat"
                size="lg"
              >
                Status: {trade.status}
              </Chip>
            </div>

            {/* Trade Columns */}
            <div className="grid grid-cols-2 gap-6">
              <TradeColumn
                title="Your items"
                items={userItems}
                approved={!!userApproved}
                removable={true}
                onRemoveItem={removeItem}
              />
              
              <TradeColumn
                title={`${profile?.username || "Other user"}'s items`}
                items={otherItems}
                approved={!!otherApproved}
              />
            </div>

            {/* Your Inventory */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold">Your inventory</h3>
              </CardHeader>
              <Divider />
              <CardBody>
                <ScrollShadow className="h-[200px]">
                  <div className="grid grid-cols-6 gap-2">
                    {inventory
                      .map((item) => {
                        if (item.metadata?._unique_id) {
                          const isInTrade = userItems.some(
                            (ti) =>
                              ti.itemId === item.item_id &&
                              ti.metadata?._unique_id === item.metadata?._unique_id
                          );
                          return { ...item, available: isInTrade ? 0 : 1 };
                        } else {
                          const inTrade = userItems
                            .filter((ti) => 
                              ti.itemId === item.item_id && 
                              !ti.metadata?._unique_id &&
                              ti.purchasePrice === item.purchasePrice
                            )
                            .reduce((sum, ti) => sum + ti.amount, 0);
                          const available = item.amount - inTrade;
                          return { ...item, available };
                        }
                      })
                      .filter((item) => item.available > 0)
                      .map((item) => (
                        <TradeInventoryItem
                          key={
                            item.metadata?._unique_id
                              ? `${item.item_id}-${item.metadata._unique_id}`
                              : `${item.item_id}-${item.purchasePrice || 'no-price'}`
                          }
                          item={{
                            ...item,
                            itemId: item.item_id,
                            amount: item.available,
                            metadata: item.metadata,
                          }}
                          disabled={trade.status !== "pending" || loading}
                          onClick={() =>
                            addItem({
                              itemId: item.item_id,
                              amount: 1,
                              metadata: item.metadata,
                              purchasePrice: item.purchasePrice,
                            })
                          }
                        />
                      ))}
                  </div>
                  
                  {inventory.filter(item => {
                    if (item.metadata?._unique_id) {
                      const isInTrade = userItems.some(
                        (ti) =>
                          ti.itemId === item.item_id &&
                          ti.metadata?._unique_id === item.metadata?._unique_id
                      );
                      return !isInTrade;
                    } else {
                      const inTrade = userItems
                        .filter((ti) => 
                          ti.itemId === item.item_id && 
                          !ti.metadata?._unique_id &&
                          ti.purchasePrice === item.purchasePrice
                        )
                        .reduce((sum, ti) => sum + ti.amount, 0);
                      return (item.amount - inTrade) > 0;
                    }
                  }).length === 0 && (
                    <div className="flex flex-col items-center justify-center py-8 text-foreground/50">
                      <Package className="w-8 h-8 mb-2" />
                      <p className="text-sm">No available items</p>
                    </div>
                  )}
                </ScrollShadow>
              </CardBody>
            </Card>

            {/* Actions and Status */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Chip
                  color={userApproved ? "success" : "default"}
                  variant={userApproved ? "flat" : "bordered"}
                  startContent={userApproved ? <Check className="w-3 h-3" /> : undefined}
                >
                  {userApproved ? "You approved" : "You haven't approved"}
                </Chip>
                
                <Chip
                  color={otherApproved ? "success" : "default"}
                  variant={otherApproved ? "flat" : "bordered"}
                  startContent={otherApproved ? <Check className="w-3 h-3" /> : undefined}
                >
                  {otherApproved ? "Other user approved" : "Other user hasn't approved"}
                </Chip>
              </div>

              <div className="flex items-center space-x-3">
                <Button
                  color="danger"
                  variant="flat"
                  onPress={cancel}
                  isDisabled={trade.status !== "pending" || loading}
                  isLoading={loading}
                  startContent={<XCircle className="w-4 h-4" />}
                >
                  Cancel Trade
                </Button>
                
                <Button
                  color="success"
                  onPress={approve}
                  isDisabled={trade.status !== "pending" || loading}
                  isLoading={loading}
                  startContent={<Check className="w-4 h-4" />}
                >
                  Approve Trade
                </Button>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
