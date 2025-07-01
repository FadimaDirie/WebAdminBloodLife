import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const donors = pgTable("donors", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  bloodType: text("blood_type").notNull(),
  phone: text("phone"),
  address: text("address"),
  donationCount: integer("donation_count").default(0),
  lastDonation: timestamp("last_donation"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const donations = pgTable("donations", {
  id: serial("id").primaryKey(),
  donorId: integer("donor_id").references(() => donors.id),
  bloodType: text("blood_type").notNull(),
  units: integer("units").notNull(),
  donationDate: timestamp("donation_date").notNull(),
  location: text("location").notNull(),
  status: text("status").notNull().default("pending"), // pending, verified, used
  blockchainTxHash: text("blockchain_tx_hash"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const emergencyRequests = pgTable("emergency_requests", {
  id: serial("id").primaryKey(),
  hospital: text("hospital").notNull(),
  bloodType: text("blood_type").notNull(),
  units: integer("units").notNull(),
  urgency: text("urgency").notNull(), // low, medium, high, critical
  status: text("status").notNull().default("active"), // active, fulfilled, expired
  requestDate: timestamp("request_date").defaultNow(),
  requiredBy: timestamp("required_by"),
  contactInfo: text("contact_info"),
  notes: text("notes"),
});

export const bloodInventory = pgTable("blood_inventory", {
  id: serial("id").primaryKey(),
  bloodType: text("blood_type").notNull().unique(),
  currentUnits: integer("current_units").notNull().default(0),
  minimumUnits: integer("minimum_units").notNull().default(50),
  maximumUnits: integer("maximum_units").notNull().default(500),
  lastUpdated: timestamp("last_updated").defaultNow(),
});

export const blockchainTransactions = pgTable("blockchain_transactions", {
  id: serial("id").primaryKey(),
  txHash: text("tx_hash").notNull().unique(),
  type: text("type").notNull(), // donation, transfer, verification
  fromAddress: text("from_address"),
  toAddress: text("to_address"),
  data: jsonb("data"),
  timestamp: timestamp("timestamp").defaultNow(),
  blockNumber: integer("block_number"),
  gasUsed: integer("gas_used"),
});

export const insertDonorSchema = createInsertSchema(donors).omit({
  id: true,
  createdAt: true,
});

export const insertDonationSchema = createInsertSchema(donations).omit({
  id: true,
  createdAt: true,
});

export const insertEmergencyRequestSchema = createInsertSchema(emergencyRequests).omit({
  id: true,
  requestDate: true,
});

export const insertBloodInventorySchema = createInsertSchema(bloodInventory).omit({
  id: true,
  lastUpdated: true,
});

export const insertBlockchainTransactionSchema = createInsertSchema(blockchainTransactions).omit({
  id: true,
  timestamp: true,
});

export type InsertDonor = z.infer<typeof insertDonorSchema>;
export type InsertDonation = z.infer<typeof insertDonationSchema>;
export type InsertEmergencyRequest = z.infer<typeof insertEmergencyRequestSchema>;
export type InsertBloodInventory = z.infer<typeof insertBloodInventorySchema>;
export type InsertBlockchainTransaction = z.infer<typeof insertBlockchainTransactionSchema>;

export type Donor = typeof donors.$inferSelect;
export type Donation = typeof donations.$inferSelect;
export type EmergencyRequest = typeof emergencyRequests.$inferSelect;
export type BloodInventory = typeof bloodInventory.$inferSelect;
export type BlockchainTransaction = typeof blockchainTransactions.$inferSelect;
