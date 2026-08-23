import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().trim().min(1, "Enter a name").max(100),
  email: z.string().trim().toLowerCase().email("Enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const cardSchema = z.object({
  sport: z.string().trim().min(1, "Sport is required").max(60),
  year: z.coerce.number().int().min(1860, "Enter a valid year").max(2100),
  setName: z.string().trim().min(1, "Set is required").max(120),
  cardNumber: z.string().trim().min(1, "Card number is required").max(40),
  player: z.string().trim().min(1, "Player is required").max(120),
  parallel: z
    .string()
    .trim()
    .max(120)
    .optional()
    .transform((v) => (v ? v : undefined)),
  notes: z
    .string()
    .trim()
    .max(2000)
    .optional()
    .transform((v) => (v ? v : undefined)),
});

export const holdingStatusValues = ["OWNED", "SOLD"] as const;

export const holdingSchema = z.object({
  cardId: z.string().trim().min(1, "Choose a card"),
  grade: z.string().trim().min(1, "Grade is required").max(40),
  serialNumber: z
    .string()
    .trim()
    .max(40)
    .optional()
    .transform((v) => (v ? v : undefined)),
  quantity: z.coerce.number().int().min(1, "Quantity must be at least 1").max(10_000),
  purchasePrice: z.coerce.number().min(0, "Purchase price can't be negative"),
  purchaseDate: z.string().trim().min(1, "Purchase date is required"),
  purchaseSource: z
    .string()
    .trim()
    .max(120)
    .optional()
    .transform((v) => (v ? v : undefined)),
  notes: z
    .string()
    .trim()
    .max(2000)
    .optional()
    .transform((v) => (v ? v : undefined)),
});

export const sellHoldingSchema = z.object({
  soldPrice: z.coerce.number().min(0, "Sold price can't be negative"),
  soldDate: z.string().trim().min(1, "Sold date is required"),
});

const optionalUrl = z
  .string()
  .trim()
  .max(2000)
  .optional()
  .transform((v) => (v ? v : undefined))
  .refine((v) => v === undefined || z.url().safeParse(v).success, "Enter a valid URL");

export const priceSnapshotSchema = z.object({
  cardId: z.string().trim().min(1),
  grade: z.string().trim().min(1, "Grade is required").max(40),
  medianPrice: z.coerce.number().min(0, "Price can't be negative"),
  observedAt: z.string().trim().min(1, "Date is required"),
  listingUrl: optionalUrl,
  imageUrl: optionalUrl,
  notes: z
    .string()
    .trim()
    .max(2000)
    .optional()
    .transform((v) => (v ? v : undefined)),
});

export const comparePhotoSchema = z.object({
  cardId: z.string().trim().min(1),
  imageUrl: z.url("Enter a valid image URL"),
});
