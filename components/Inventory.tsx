import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import useAuth from "../hooks/useAuth";
import { ShopItem } from "../pages/profile";
import CachedImage from "./utils/CachedImage";
import { useTranslation } from "next-i18next";
import {
  Card,
  CardBody,
  Button,
  Input,
  Chip,
  Skeleton,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Tooltip,
} from "@heroui/react";

const endpoint = "/api";

export interface Item {
  iconHash: string;
  item_id: string;
  name: string;
  description: string;
  amount: number;
  price?: number;
  purchasePrice?: number;
  owner?: string;
  showInStore?: boolean;
  deleted?: boolean;
  sellable?: boolean;
  rarity: "very-common" | "common" | "uncommon" | "rare" | "very-rare" | "epic" | "ultra-epic" | "legendary" | "ancient" | "mythic" | "godlike" | "radiant";
  custom_url_link?: string;
  metadata?: { [key: string]: unknown; _unique_id?: string };
}

interface User {
  verified: boolean;
  id: string;
  username: string;
  disabled?: boolean;
  admin?: boolean;
  isStudio?: boolean;
  inventory?: (Item & { amount: number; rarity: string })[];
  ownedItems?: ShopItem[];
}

interface Props {
  profile?: User;
  isMe?: boolean;
  reloadFlag?: number;
  userId?: string;
}

export default function Inventory({ profile, isMe, reloadFlag, userId }: Props) {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [ownerUser, setOwnerUser] = useState<any | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [promptData, setPromptData] = useState<{
    type: 'sell' | 'drop' | 'auction';
    item: Item;
    dataItemIndex: number;
  } | null>(null);
  const [promptAmount, setPromptAmount] = useState(1);
  const [promptPrice, setPromptPrice] = useState(1);

  const { user } = useAuth();
  const { t } = useTranslation("common");

  // Fix: Gérer le cas où profile est undefined
  const selectedUser = profile?.id === "me" ? user?.id || "me" : (profile?.id || userId || user?.id || "me");

  useEffect(() => {
    if (profile?.inventory) {
      const processedItems = profile.inventory.map((item) => ({
        ...item,
        uniqueId: item.metadata?._unique_id as string | undefined,
        sellable: item.sellable ?? false,
      }));
      setItems(processedItems);
      setLoading(false);
    } else if (selectedUser) {
      refreshInventory();
    }
  }, [profile?.inventory, selectedUser]);

  useEffect(() => {
    if (reloadFlag) refreshInventory();
  }, [reloadFlag]);

  function refreshInventory() {
    if (!selectedUser) return;
    
    setLoading(true);
    fetch(`${endpoint}/inventory/${selectedUser}`, {
      headers: { "Content-Type": "application/json" },
    })
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error("Failed to fetch inventory"))))
      .then((data) => {
        const processedItems = (data.inventory || []).map((item: any) => ({
          ...item,
          uniqueId: item.metadata?._unique_id as string | undefined,
          sellable: item.sellable ?? false,
          iconHash: item.iconHash || item.item_id,
        }));
        setItems(processedItems);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }

  const handleSell = async (item: Item, dataItemIndex: number) => {
    if (!isMe) return;
    if (item.metadata) {
      setError("Items with metadata cannot be sold");
      return;
    }
    if (!item.sellable) {
      setError("This item cannot be sold. Only purchased items or items obtained from trades can be sold.");
      return;
    }

    const requestBody: any = { amount: promptAmount, dataItemIndex };
    if (item.purchasePrice !== undefined) requestBody.purchasePrice = item.purchasePrice;

    fetch(`${endpoint}/items/sell/${item.item_id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody),
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to sell item");
        return data;
      })
      .then(() => {
        refreshInventory();
        setShowPrompt(false);
      })
      .catch((err) => setError(err.message));
  };

  const handleAuction = async (item: Item) => {
    if (!isMe) return;

    fetch("/api/market-listings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        inventoryItem: item,
        sellingPrice: promptPrice,
      }),
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to auction item");
        return data;
      })
      .then(() => {
        refreshInventory();
        setShowPrompt(false);
      })
      .catch((err) => setError(err.message));
  };

  const handleDrop = async (item: Item, dataItemIndex: number) => {
    if (!isMe) return;

    let requestBody: any = { amount: promptAmount, dataItemIndex };
    if (item.purchasePrice !== undefined) requestBody.purchasePrice = item.purchasePrice;
    if (item.metadata && item.metadata._unique_id) requestBody = { uniqueId: item.metadata._unique_id, dataItemIndex };

    fetch(`${endpoint}/items/drop/${item.item_id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody),
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to drop item");
        return data;
      })
      .then(() => {
        refreshInventory();
        setShowPrompt(false);
      })
      .catch((err) => setError(err.message));
  };

  const handleItemClick = async (item: Item) => {
    try {
      const res = await fetch(`${endpoint}/items/${item.item_id}`, {
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) throw new Error("Failed to fetch item details");
      const details = await res.json();
      let ownerUser = null;
      if (details.owner) {
        const userRes = await fetch(`${endpoint}/users/${details.owner}`);
        if (userRes.ok) ownerUser = await userRes.json();
      }
      setSelectedItem({
        ...item,
        ...details,
        amount: item.amount,
        uniqueId: item.metadata?._unique_id,
      });
      setOwnerUser(ownerUser);
    } catch {
      setSelectedItem(item);
      setOwnerUser(null);
    }
  };

  const openPrompt = (type: 'sell' | 'drop' | 'auction', item: Item, dataItemIndex: number) => {
    setPromptData({ type, item, dataItemIndex });
    setPromptAmount(1);
    setPromptPrice(item.purchasePrice || 1);
    setShowPrompt(true);
  };

  const handlePromptConfirm = () => {
    if (!promptData) return;

    switch (promptData.type) {
      case 'sell':
        handleSell(promptData.item, promptData.dataItemIndex);
        break;
      case 'drop':
        handleDrop(promptData.item, promptData.dataItemIndex);
        break;
      case 'auction':
        handleAuction(promptData.item);
        break;
    }
  };

  const formatMetadata = (metadata?: { [key: string]: unknown }) => {
    if (!metadata) return null;
    const displayMetadata = Object.entries(metadata)
      .filter(([key]) => key !== "_unique_id")
      .map(([key, value]) => `${key}: ${value}`)
      .join(", ");
    return displayMetadata || null;
  };

  const rarityColors: Record<string, string> = {
    "very-common": "#B0B0B0",
    common: "#9E9E9E",
    uncommon: "#4CAF50",
    rare: "#2196F3",
    "very-rare": "#1976D2",
    epic: "#7B1FA2",
    "ultra-epic": "#9C27B0",
    legendary: "#FF5722",
    ancient: "#FF9800",
    mythic: "#07f7ff",
    godlike: "#ff0000",
    radiant: "#FFFFFF",
  };

  function getRarityColor(rarity?: string) {
    if (!rarity) return "#9E9E9E";
    return rarityColors[rarity] || "#9E9E9E";
  }

  const columns = 8;
  const minRows = Math.ceil(48 / columns);
  const totalItems = items.length;
  const rows = Math.max(minRows, Math.ceil(totalItems / columns));
  const totalCells = rows * columns;
  const emptyCells = totalCells - totalItems;

  const InventoryItem = React.memo(function InventoryItem({ 
    item, 
    onSelect, 
    isMe, 
    onAction, 
    dataItemIndex 
  }: { 
    item: Item; 
    onSelect: (item: Item) => void; 
    isMe: boolean; 
    onAction: (type: 'sell' | 'drop' | 'auction', item: Item, dataItemIndex: number) => void; 
    dataItemIndex: number;
  }) {
    const iconUrl = "/items-icons/" + (item?.iconHash || item.item_id);
    const formattedMetadata = formatMetadata(item.metadata);

    const tooltipContent = (
      <div className="p-2 max-w-xs">
        <div className="font-semibold text-sm">{item.name}</div>
        <div className="text-xs text-default-600 mt-1">{item.description}</div>
        <div 
          className="text-xs mt-2 font-semibold capitalize"
          style={{ color: getRarityColor(item.rarity) }}
        >
          {t("inventory.rarity")}: {item.rarity?.replace(/-/g, " ")}
        </div>
        {formattedMetadata && (
          <div className="text-xs text-default-500 mt-1 italic">
            {formattedMetadata}
          </div>
        )}
        {item.purchasePrice && (
          <div className="text-xs text-warning mt-1 flex items-center gap-1">
            {t("inventory.price")}: {item.purchasePrice}
            <CachedImage src="/assets/credit.avif" className="w-3 h-3" alt="credits" />
          </div>
        )}
      </div>
    );

    return (
      <div className="relative group">
        <Tooltip content={tooltipContent} placement="right">
          <Card 
            className="w-16 h-16 cursor-pointer hover:scale-105 transition-transform bg-content2/50 backdrop-blur border-2"
            style={{ borderColor: getRarityColor(item.rarity) + '40' }}
            isPressable
            onPress={() => onSelect(item)}
          >
            <CardBody className="p-1 flex items-center justify-center">
              <CachedImage
                src={item.custom_url_link || iconUrl}
                alt={item.name}
                className="w-full h-full object-contain rounded"
              />
              <Chip
                size="sm"
                className="absolute -bottom-1 -right-1 min-w-unit-6 h-unit-5"
                variant="solid"
                color="primary"
              >
                {item.amount}
              </Chip>
              {item.metadata && (
                <div className="absolute top-1 right-1 w-2 h-2 bg-warning rounded-full border border-black" />
              )}
            </CardBody>
          </Card>
        </Tooltip>

        {isMe && (
          <Dropdown>
            <DropdownTrigger>
              <Button
                isIconOnly
                size="sm"
                variant="ghost"
                className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 256 256">
                  <path d="M144,128a16,16,0,1,1-16-16A16,16,0,0,1,144,128ZM60,112a16,16,0,1,0,16,16A16,16,0,0,0,60,112Zm136,0a16,16,0,1,0,16,16A16,16,0,0,0,196,112Z"/>
                </svg>
              </Button>
            </DropdownTrigger>
            <DropdownMenu>
              {!item.metadata && item.sellable && item.purchasePrice != null && (
                <DropdownItem 
                  key="sell" 
                  onPress={() => onAction('sell', item, dataItemIndex)}
                  startContent={
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 256 256">
                      <path d="M244,80a28,28,0,0,0-12.64-23.34c-7.64-5.12-18.18-6.66-32.83-6.66H57.47c-14.65,0-25.19,1.54-32.83,6.66A28,28,0,0,0,12,80v96a28,28,0,0,0,12.64,23.34c7.64,5.12,18.18,6.66,32.83,6.66H198.53c14.65,0,25.19-1.54,32.83-6.66A28,28,0,0,0,244,176V80Z"/>
                    </svg>
                  }
                >
                  Vendre
                </DropdownItem>
              )}
              {item.purchasePrice != null && (
                <DropdownItem 
                  key="auction" 
                  onPress={() => onAction('auction', item, dataItemIndex)}
                  startContent={
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 256 256">
                      <path d="M248,128a56,56,0,0,1-95.6,39.6L92.8,107.2a8,8,0,0,1,11.4-11.2l10.9,10.9a56,56,0,0,1,78.4,78.4l10.9,10.9a8,8,0,0,1-11.2,11.4L132.4,167.6A56,56,0,0,1,192,72a8,8,0,0,1,0,16,40,40,0,0,0-40,40,8,8,0,0,1-16,0,56,56,0,0,1,56-56A56.06,56.06,0,0,1,248,128Z"/>
                    </svg>
                  }
                >
                  Enchère
                </DropdownItem>
              )}
              <DropdownItem 
                key="drop" 
                onPress={() => onAction('drop', item, dataItemIndex)}
                className="text-danger"
                startContent={
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 256 256">
                    <path d="M216,48H176V40a24,24,0,0,0-24-24H104A24,24,0,0,0,80,40v8H40a8,8,0,0,0,0,16h8V208a16,16,0,0,0,16,16H192a16,16,0,0,0,16-16V64h8a8,8,0,0,0,0-16ZM96,40a8,8,0,0,1,8-8h48a8,8,0,0,1,8,8v8H96Zm96,168H64V64H192ZM112,104v64a8,8,0,0,1-16,0V104a8,8,0,0,1,16,0Zm48,0v64a8,8,0,0,1-16,0V104a8,8,0,0,1,16,0Z"/>
                  </svg>
                }
              >
                Jeter
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        )}
      </div>
    );
  });

  if (loading) {
    return (
      <div className="grid grid-cols-8 gap-4 p-4">
        {Array.from({ length: 24 }).map((_, i) => (
          <Skeleton key={i} className="w-16 h-16 rounded-lg" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card className="bg-danger/10 border border-danger/20">
        <CardBody>
          <p className="text-danger text-center">{error}</p>
          <Button 
            color="danger" 
            variant="bordered" 
            className="mt-2"
            onPress={() => {
              setError(null);
              refreshInventory();
            }}
          >
            Réessayer
          </Button>
        </CardBody>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Item Details Modal */}
      <Modal 
        isOpen={!!selectedItem} 
        onClose={() => setSelectedItem(null)}
        size="2xl"
        backdrop="blur"
      >
        <ModalContent>
          {selectedItem && (
            <>
              <ModalHeader className="flex gap-4 items-center">
                <div className="w-16 h-16">
                  <CachedImage
                    src={selectedItem.custom_url_link || "/items-icons/" + (selectedItem.iconHash || selectedItem.item_id)}
                    alt={selectedItem.name}
                    className="w-full h-full object-contain rounded"
                  />
                </div>
                <div>
                  <h3 className="text-xl font-bold">
                    {selectedItem.amount}x {selectedItem.name}
                  </h3>
                  <Chip 
                    size="sm" 
                    style={{ 
                      backgroundColor: getRarityColor(selectedItem.rarity) + '20',
                      color: getRarityColor(selectedItem.rarity)
                    }}
                  >
                    {selectedItem.rarity?.replace(/-/g, " ")}
                  </Chip>
                </div>
              </ModalHeader>
              <ModalBody>
                <p className="text-default-600">{selectedItem.description}</p>
                
                {formatMetadata(selectedItem.metadata) && (
                  <div className="mt-4 p-3 bg-default-100 rounded-lg">
                    <p className="text-sm font-semibold mb-1">Métadonnées:</p>
                    <p className="text-sm text-default-600">{formatMetadata(selectedItem.metadata)}</p>
                  </div>
                )}

                {selectedItem.purchasePrice !== undefined && (
                  <div className="flex items-center gap-2 mt-4">
                    <span className="text-warning font-semibold">Prix d'achat:</span>
                    <span>{selectedItem.purchasePrice}</span>
                    <CachedImage src="/assets/credit.avif" className="w-4 h-4" alt="credits" />
                  </div>
                )}

                {selectedItem.metadata?._unique_id && (
                  <div className="mt-4 p-3 bg-warning/10 rounded-lg">
                    <p className="text-sm font-semibold mb-1">ID Unique:</p>
                    <p className="text-xs font-mono">{selectedItem.metadata._unique_id}</p>
                    <p className="text-xs text-danger mt-1">Cet objet ne peut pas être vendu</p>
                  </div>
                )}
              </ModalBody>
              <ModalFooter>
                <Button onPress={() => setSelectedItem(null)}>
                  Fermer
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Action Prompt Modal */}
      <Modal 
        isOpen={showPrompt} 
        onClose={() => setShowPrompt(false)}
        backdrop="blur"
      >
        <ModalContent>
          {promptData && (
            <>
              <ModalHeader>
                {promptData.type === 'sell' && 'Vendre l\'objet'}
                {promptData.type === 'drop' && 'Jeter l\'objet'}
                {promptData.type === 'auction' && 'Mettre aux enchères'}
              </ModalHeader>
              <ModalBody className="space-y-4">
                <p>
                  {promptData.type === 'sell' && `Vendre combien de "${promptData.item.name}" ?`}
                  {promptData.type === 'drop' && `Jeter combien de "${promptData.item.name}" ?`}
                  {promptData.type === 'auction' && `Mettre "${promptData.item.name}" aux enchères`}
                </p>

                {promptData.type !== 'auction' && (
                  <Input
                    type="number"
                    label="Quantité"
                    min="1"
                    max={promptData.item.amount}
                    value={promptAmount.toString()}
                    onChange={(e) => setPromptAmount(Math.max(1, Math.min(Number(e.target.value), promptData.item.amount)))}
                  />
                )}

                {promptData.type === 'auction' && (
                  <Input
                    type="number"
                    label="Prix de vente"
                    min="1"
                    value={promptPrice.toString()}
                    onChange={(e) => setPromptPrice(Math.max(1, Number(e.target.value)))}
                    endContent={
                      <CachedImage src="/assets/credit.avif" className="w-4 h-4" alt="credits" />
                    }
                  />
                )}
              </ModalBody>
              <ModalFooter>
                <Button 
                  variant="light" 
                  onPress={() => setShowPrompt(false)}
                >
                  Annuler
                </Button>
                <Button 
                  color={promptData.type === 'drop' ? 'danger' : 'primary'}
                  onPress={handlePromptConfirm}
                >
                  Confirmer
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Inventory Grid */}
      <div className="grid grid-cols-8 gap-4 p-4 bg-content1/30 backdrop-blur-sm rounded-xl border border-divider/20">
        {items.map((item, index) => (
          <InventoryItem
            key={item?.metadata?._unique_id ? `${item.item_id}-${item.metadata._unique_id}` : `${item.item_id}-${index}`}
            dataItemIndex={index}
            item={item}
            onSelect={handleItemClick}
            isMe={!!isMe}
            onAction={openPrompt}
          />
        ))}
        
        {Array.from({ length: emptyCells }).map((_, idx) => (
          <div
            key={`empty-${idx}`}
            className="w-16 h-16 border-2 border-dashed border-divider/30 rounded-lg bg-content2/20"
          />
        ))}
      </div>
    </div>
  );
}
