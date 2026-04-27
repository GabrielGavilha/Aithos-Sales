import { useCallback, useMemo, useState } from "react";
import type { SaleCard, Status } from "../types/kanban";
import { STATUS_ORDER } from "../data/sampleKanban";

const createEmptyColumns = (): Record<Status, SaleCard[]> =>
  STATUS_ORDER.reduce((acc, status) => {
    acc[status] = [];
    return acc;
  }, {} as Record<Status, SaleCard[]>);

const groupByStatus = (cards: SaleCard[]) => {
  const grouped = createEmptyColumns();

  cards.forEach((card) => {
    grouped[card.etapa].push(card);
  });

  return grouped;
};

export const useKanban = (initialCards: SaleCard[]) => {
  const [columns, setColumns] = useState(() => groupByStatus(initialCards));
  const [activeCardId, setActiveCardId] = useState<string | null>(null);
  const [overColumnId, setOverColumnId] = useState<Status | null>(null);

  const moveCard = useCallback(
    (cardId: string, targetStatus: Status) => {
      setColumns((prev) => {
        let movingCard: SaleCard | null = null;
        const next = createEmptyColumns();

        (Object.keys(prev) as Status[]).forEach((status) => {
          next[status] = prev[status].filter((card) => {
            if (card.id === cardId) {
              movingCard = { ...card, etapa: targetStatus };
              return false;
            }
            return true;
          });
        });

        if (movingCard) {
          next[targetStatus] = [...next[targetStatus], movingCard];
        }

        return next;
      });
    },
    [setColumns]
  );

  const addCard = useCallback((card: SaleCard) => {
    setColumns((prev) => ({
      ...prev,
      [card.etapa]: [...prev[card.etapa], card],
    }));
  }, []);

  const handleDragStart = useCallback((cardId: string, status: Status) => {
    setActiveCardId(cardId);
    setOverColumnId(status);
  }, []);

  const handleDragEnd = useCallback(() => {
    setActiveCardId(null);
    setOverColumnId(null);
  }, []);

  const handleDragOverColumn = useCallback((status: Status) => {
    setOverColumnId(status);
  }, []);

  const handleDrop = useCallback(
    (cardId: string, targetStatus: Status) => {
      moveCard(cardId, targetStatus);
      setActiveCardId(null);
      setOverColumnId(null);
    },
    [moveCard]
  );

  const moveRelative = useCallback(
    (cardId: string, currentStatus: Status, direction: "prev" | "next") => {
      const currentIndex = STATUS_ORDER.indexOf(currentStatus);
      const nextIndex = direction === "prev" ? currentIndex - 1 : currentIndex + 1;
      const nextStatus = STATUS_ORDER[nextIndex];

      if (nextStatus) {
        moveCard(cardId, nextStatus);
      }
    },
    [moveCard]
  );

  const columnOrder = useMemo(() => STATUS_ORDER, []);

  return {
    columns,
    activeCardId,
    overColumnId,
    columnOrder,
    moveCard,
    addCard,
    moveRelative,
    handleDragStart,
    handleDragEnd,
    handleDragOverColumn,
    handleDrop,
  };
};
