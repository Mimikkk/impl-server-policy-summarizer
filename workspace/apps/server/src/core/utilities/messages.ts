export const compactMessage = (message: string): string => {
  return message.replace(/\s+/g, " ").trim();
};

export const upperFirst = (value: string): string => value.charAt(0).toUpperCase() + value.slice(1);
