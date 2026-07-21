import type { BoardData } from "@/lib/kanban";

export type AiChatResponse = {
  assistantMessage: string;
  boardUpdated: boolean;
};

const readJson = async (response: Response) => {
  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `Request failed with status ${response.status}`);
  }
  return response.json();
};

export const fetchBoard = async (): Promise<BoardData> => {
  const response = await fetch("/api/board", { cache: "no-store" });
  const data = await readJson(response);
  return data.board as BoardData;
};

export const persistBoard = async (board: BoardData): Promise<BoardData> => {
  const response = await fetch("/api/board", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ board }),
  });
  const data = await readJson(response);
  return data.board as BoardData;
};

export const sendAiChat = async (message: string): Promise<AiChatResponse> => {
  const response = await fetch("/api/ai/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message }),
  });
  return (await readJson(response)) as AiChatResponse;
};
