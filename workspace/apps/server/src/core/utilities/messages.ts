export const compactMessage = (message: string): string => {
  return message.replace(/\s+/g, " ").trim();
};
