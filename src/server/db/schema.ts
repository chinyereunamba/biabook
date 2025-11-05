import { relations, sql } from "drizzle-orm";
import { index, primaryKey, sqliteTableCreator } from "drizzle-orm/sqlite-core";

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const createTable = sqliteTableCreator((name) => `biabook_${name}`);

export const posts = createTable(
  "post",
  (d) => ({
    id: d.integer({ mode: "number" }).primaryKey({ autoIncrement: true }),
    name: d.text({ length: 256 }),
    createdById: d
      .text({ length: 255 })
      .notNull()
      .references(() => users.id),
    createdAt: d
      .integer({ mode: "timestamp" })
      .default(sql`(unixepoch())`)
      .notNull(),
    updatedAt: d.integer({ mode: "timestamp" }).$onUpdate(() => new Date()),
  }),
  (t) => [
    index("created_by_idx").on(t.createdById),
    index("name_idx").on(t.name),
  ],
);

export const users = createTable("user", (d) => ({
  id: d
    .text({ length: 255 })
    .notNull()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: d.text({ length: 255 }),
  email: d.text({ length: 255 }).notNull(),
  emailVerified: d.integer({ mode: "timestamp" }).default(sql`(unixepoch())`),
  image: d.text({ length: 255 }),
  password: d.text({ length: 255 }), // For credentials authentication
  role: d
    .text("role", { enum: ["user", "admin"] })
    .default("user")
    .notNull(),
  isOnboarded: d
    .integer("is_onboarded", { mode: "boolean" })
    .default(false)
    .notNull(),
  onboardedAt: d.integer("onboarded_at", { mode: "timestamp" }),
}));

export const usersRelations = relations(users, ({ many }) => ({
  accounts: many(accounts),
}));

export const accounts = createTable(
  "account",
  (d) => ({
    userId: d
      .text({ length: 255 })
      .notNull()
      .references(() => users.id),
    type: d.text({ length: 255 }).$type<string>().notNull(),
    provider: d.text({ length: 255 }).notNull(),
    providerAccountId: d.text({ length: 255 }).notNull(),
    refresh_token: d.text(),
    access_token: d.text(),
    expires_at: d.integer(),
    token_type: d.text({ length: 255 }),
    scope: d.text({ length: 255 }),
    id_token: d.text(),
    session_state: d.text({ length: 255 }),
  }),
  (t) => [
    primaryKey({
      columns: [t.provider, t.providerAccountId],
    }),
    index("account_user_id_idx").on(t.userId),
  ],
);

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, { fields: [accounts.userId], references: [users.id] }),
}));

export const sessions = createTable(
  "session",
  (d) => ({
    sessionToken: d.text({ length: 255 }).notNull().primaryKey(),
    userId: d
      .text({ length: 255 })
      .notNull()
      .references(() => users.id),
    expires: d.integer({ mode: "timestamp" }).notNull(),
  }),
  (t) => [index("session_userId_idx").on(t.userId)],
);

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, { fields: [sessions.userId], references: [users.id] }),
}));

export const verificationTokens = createTable(
  "verification_token",
  (d) => ({
    identifier: d.text({ length: 255 }).notNull(),
    token: d.text({ length: 255 }).notNull(),
    expires: d.integer({ mode: "timestamp" }).notNull(),
  }),
  (t) => [primaryKey({ columns: [t.identifier, t.token] })],
);

export const authenticators = createTable(
  "authenticator",
  (d) => ({
    credentialID: d.text("credentialID").notNull().unique(),
    userId: d
      .text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    providerAccountId: d.text("providerAccountId").notNull(),
    credentialPublicKey: d.text("credentialPublicKey").notNull(),
    counter: d.integer("counter").notNull(),
    credentialDeviceType: d.text("credentialDeviceType").notNull(),
    credentialBackedUp: d
      .integer("credentialBackedUp", {
        mode: "boolean",
      })
      .notNull(),
    transports: d.text("transports"),
  }),
  (authenticator) => [
    primaryKey({
      columns: [authenticator.userId, authenticator.credentialID],
    }),
  ],
);

export const categories = createTable("categories", (d) => ({
  id: d.text("id").primaryKey(), // e.g. 'salon', 'fitness'
  name: d.text("name").notNull(),
}));

export const businesses = createTable("businesses", (d) => ({
  id: d.text("id").primaryKey(),
  name: d.text("name").notNull(),
  slug: d.text("slug").notNull().unique(),
  description: d.text("description"),
  location: d.text("location"),
  phone: d.text("phone"),
  email: d.text("email"),
  categoryId: d.text("category_id").notNull(),
  ownerId: d
    .text("owner_id")
    .notNull()
    .references(() => users.id),
  createdAt: d
    .integer("created_at", { mode: "timestamp" })
    .default(sql`(unixepoch())`)
    .notNull(),
  updatedAt: d
    .integer("updated_at", { mode: "timestamp" })
    .$onUpdate(() => new Date()),
}));

export const services = createTable(
  "services",
  (d) => ({
    id: d
      .text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    businessId: d
      .text("business_id")
      .notNull()
      .references(() => businesses.id, { onDelete: "cascade" }),
    name: d.text("name").notNull(),
    description: d.text("description"),
    duration: d.integer("duration").notNull(), // minutes
    price: d.integer("price").notNull(), // cents
    isActive: d
      .integer("is_active", { mode: "boolean" })
      .default(true)
      .notNull(),
    category: d.text("category"),
    bufferTime: d.integer("buffer_time").default(0), // minutes between bookings
    createdAt: d
      .integer("created_at", { mode: "timestamp" })
      .default(sql`(unixepoch())`)
      .notNull(),
    updatedAt: d
      .integer("updated_at", { mode: "timestamp" })
      .$onUpdate(() => new Date()),
  }),
  (t) => [
    index("services_business_id_idx").on(t.businessId),
    index("services_active_idx").on(t.isActive),
  ],
);

export const weeklyAvailability = createTable(
  "weekly_availability",
  (d) => ({
    id: d
      .text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    businessId: d
      .text("business_id")
      .notNull()
      .references(() => businesses.id, { onDelete: "cascade" }),
    dayOfWeek: d.integer("day_of_week").notNull(), // 0-6 (Sunday-Saturday)
    startTime: d.text("start_time").notNull(), // HH:MM format
    endTime: d.text("end_time").notNull(), // HH:MM format
    isAvailable: d
      .integer("is_available", { mode: "boolean" })
      .default(true)
      .notNull(),
    createdAt: d
      .integer("created_at", { mode: "timestamp" })
      .default(sql`(unixepoch())`)
      .notNull(),
    updatedAt: d
      .integer("updated_at", { mode: "timestamp" })
      .$onUpdate(() => new Date()),
  }),
  (t) => [
    index("weekly_availability_business_id_idx").on(t.businessId),
    index("weekly_availability_day_idx").on(t.dayOfWeek),
  ],
);

export const availabilityExceptions = createTable(
  "availability_exceptions",
  (d) => ({
    id: d
      .text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    businessId: d
      .text("business_id")
      .notNull()
      .references(() => businesses.id, { onDelete: "cascade" }),
    date: d.text("date").notNull(), // YYYY-MM-DD format
    startTime: d.text("start_time"), // HH:MM format, null if closed all day
    endTime: d.text("end_time"), // HH:MM format, null if closed all day
    isAvailable: d
      .integer("is_available", { mode: "boolean" })
      .default(false)
      .notNull(),
    reason: d.text("reason"),
    createdAt: d
      .integer("created_at", { mode: "timestamp" })
      .default(sql`(unixepoch())`)
      .notNull(),
    updatedAt: d
      .integer("updated_at", { mode: "timestamp" })
      .$onUpdate(() => new Date()),
  }),
  (t) => [
    index("availability_exceptions_business_id_idx").on(t.businessId),
    index("availability_exceptions_date_idx").on(t.date),
  ],
);

export const appointments = createTable(
  "appointments",
  (d) => ({
    id: d
      .text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    businessId: d
      .text("business_id")
      .notNull()
      .references(() => businesses.id, { onDelete: "cascade" }),
    serviceId: d
      .text("service_id")
      .notNull()
      .references(() => services.id, { onDelete: "cascade" }),
    servicePrice: d.integer("service_price").notNull(),
    customerName: d.text("customer_name").notNull(),
    customerEmail: d.text("customer_email").notNull(),
    customerPhone: d.text("customer_phone").notNull(),
    appointmentDate: d.text("appointment_date").notNull(), // YYYY-MM-DD format
    startTime: d.text("start_time").notNull(), // HH:MM format
    endTime: d.text("end_time").notNull(), // HH:MM format
    status: d
      .text("status", {
        enum: ["pending", "confirmed", "cancelled", "completed"],
      })
      .default("pending")
      .notNull(),
    notes: d.text("notes"),
    confirmationNumber: d
      .text("confirmation_number")
      .notNull()
      .$defaultFn(() =>
        Math.random().toString(36).substring(2, 10).toUpperCase(),
      ),
    version: d.integer("version").default(1).notNull(), // For optimistic locking
    createdAt: d
      .integer("created_at", { mode: "timestamp" })
      .default(sql`(unixepoch())`)
      .notNull(),
    updatedAt: d
      .integer("updated_at", { mode: "timestamp" })
      .$onUpdate(() => new Date()),
  }),
  (t) => [
    index("appointments_business_id_idx").on(t.businessId),
    index("appointments_service_id_idx").on(t.serviceId),
    index("appointments_date_idx").on(t.appointmentDate),
    index("appointments_status_idx").on(t.status),
    index("appointments_confirmation_idx").on(t.confirmationNumber),
    // Prevent double booking - unique constraint on business, date, start time, and active status
    // Only active appointments (not cancelled) should prevent double booking
    index("appointments_unique_active_slot_idx").on(
      t.businessId,
      t.appointmentDate,
      t.startTime,
      t.status,
    ),
  ],
);

export const businessesRelations = relations(businesses, ({ one, many }) => ({
  owner: one(users, { fields: [businesses.ownerId], references: [users.id] }),
  category: one(categories, {
    fields: [businesses.categoryId],
    references: [categories.id],
  }),
  services: many(services),
  weeklyAvailability: many(weeklyAvailability),
  availabilityExceptions: many(availabilityExceptions),
  appointments: many(appointments),
  location: one(businessLocations, {
    fields: [businesses.id],
    references: [businessLocations.businessId],
  }),
}));

export const servicesRelations = relations(services, ({ one, many }) => ({
  business: one(businesses, {
    fields: [services.businessId],
    references: [businesses.id],
  }),
  appointments: many(appointments),
}));

export const weeklyAvailabilityRelations = relations(
  weeklyAvailability,
  ({ one }) => ({
    business: one(businesses, {
      fields: [weeklyAvailability.businessId],
      references: [businesses.id],
    }),
  }),
);

export const availabilityExceptionsRelations = relations(
  availabilityExceptions,
  ({ one }) => ({
    business: one(businesses, {
      fields: [availabilityExceptions.businessId],
      references: [businesses.id],
    }),
  }),
);

export const appointmentsRelations = relations(appointments, ({ one }) => ({
  business: one(businesses, {
    fields: [appointments.businessId],
    references: [businesses.id],
  }),
  service: one(services, {
    fields: [appointments.serviceId],
    references: [services.id],
  }),
  customerLocation: one(customerLocations, {
    fields: [appointments.id],
    references: [customerLocations.appointmentId],
  }),
}));

export const categoriesRelations = relations(categories, ({ many }) => ({
  businesses: many(businesses),
}));

// Location-related tables
export const businessLocations = createTable(
  "business_locations",
  (d) => ({
    id: d
      .text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    businessId: d
      .text("business_id")
      .notNull()
      .references(() => businesses.id, { onDelete: "cascade" }),
    address: d.text("address").notNull(),
    city: d.text("city").notNull(),
    state: d.text("state").notNull(),
    zipCode: d.text("zip_code").notNull(),
    country: d.text("country").default("US").notNull(),
    latitude: d.real("latitude").notNull(),
    longitude: d.real("longitude").notNull(),
    timezone: d.text("timezone").notNull(),
    serviceRadius: d.integer("service_radius"), // in miles, NULL for unlimited
    createdAt: d
      .integer("created_at", { mode: "timestamp" })
      .default(sql`(unixepoch())`)
      .notNull(),
    updatedAt: d
      .integer("updated_at", { mode: "timestamp" })
      .$onUpdate(() => new Date()),
  }),
  (t) => [
    index("business_locations_business_id_idx").on(t.businessId),
    // Spatial indexes for coordinate-based queries
    index("business_locations_lat_idx").on(t.latitude),
    index("business_locations_lng_idx").on(t.longitude),
    index("business_locations_coords_idx").on(t.latitude, t.longitude),
    index("business_locations_zip_idx").on(t.zipCode),
  ],
);

export const customerLocations = createTable(
  "customer_locations",
  (d) => ({
    id: d
      .text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    appointmentId: d
      .text("appointment_id")
      .notNull()
      .references(() => appointments.id, { onDelete: "cascade" }),
    latitude: d.real("latitude"),
    longitude: d.real("longitude"),
    zipCode: d.text("zip_code"),
    distanceToBusiness: d.real("distance_to_business"), // in miles
    createdAt: d
      .integer("created_at", { mode: "timestamp" })
      .default(sql`(unixepoch())`)
      .notNull(),
  }),
  (t) => [
    index("customer_locations_appointment_id_idx").on(t.appointmentId),
    index("customer_locations_zip_idx").on(t.zipCode),
    index("customer_locations_coords_idx").on(t.latitude, t.longitude),
  ],
);

export const locationCache = createTable(
  "location_cache",
  (d) => ({
    id: d
      .text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    addressHash: d.text("address_hash").notNull().unique(),
    latitude: d.real("latitude").notNull(),
    longitude: d.real("longitude").notNull(),
    timezone: d.text("timezone").notNull(),
    expiresAt: d.integer("expires_at", { mode: "timestamp" }).notNull(),
    createdAt: d
      .integer("created_at", { mode: "timestamp" })
      .default(sql`(unixepoch())`)
      .notNull(),
  }),
  (t) => [
    index("location_cache_hash_idx").on(t.addressHash),
    index("location_cache_expires_idx").on(t.expiresAt),
  ],
);

export const notificationQueue = createTable(
  "notification_queue",
  (d) => ({
    id: d
      .text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    type: d.text("type").notNull(), // booking_confirmation, booking_reminder_24h, etc.
    recipientId: d.text("recipient_id").notNull(), // business ID or customer email
    recipientType: d
      .text("recipient_type", { enum: ["business", "customer"] })
      .notNull(),
    recipientEmail: d.text("recipient_email").notNull(),
    recipientPhone: d.text("recipient_phone"),
    payload: d.text("payload").notNull(), // JSON string with notification data
    scheduledFor: d.integer("scheduled_for", { mode: "timestamp" }).notNull(),
    status: d
      .text("status", { enum: ["pending", "processed", "failed"] })
      .default("pending")
      .notNull(),
    attempts: d.integer("attempts").default(0).notNull(),
    lastAttemptAt: d.integer("last_attempt_at", { mode: "timestamp" }),
    error: d.text("error"),
    createdAt: d
      .integer("created_at", { mode: "timestamp" })
      .default(sql`(unixepoch())`)
      .notNull(),
    updatedAt: d
      .integer("updated_at", { mode: "timestamp" })
      .$onUpdate(() => new Date()),
  }),
  (t) => [
    index("notification_queue_status_idx").on(t.status),
    index("notification_queue_scheduled_for_idx").on(t.scheduledFor),
    index("notification_queue_recipient_id_idx").on(t.recipientId),
    index("notification_queue_type_idx").on(t.type),
  ],
);

export const businessNotificationPreferences = createTable(
  "business_notification_preferences",
  (d) => ({
    businessId: d
      .text("business_id")
      .primaryKey()
      .references(() => businesses.id, { onDelete: "cascade" }),
    email: d.integer("email", { mode: "boolean" }).default(true).notNull(),
    whatsapp: d
      .integer("whatsapp", { mode: "boolean" })
      .default(true)
      .notNull(),
    sms: d.integer("sms", { mode: "boolean" }).default(false).notNull(),
    reminderEmail: d
      .integer("reminder_email", { mode: "boolean" })
      .default(true)
      .notNull(),
    reminderWhatsapp: d
      .integer("reminder_whatsapp", { mode: "boolean" })
      .default(true)
      .notNull(),
    reminderSms: d
      .integer("reminder_sms", { mode: "boolean" })
      .default(false)
      .notNull(),
    createdAt: d
      .integer("created_at", { mode: "timestamp" })
      .default(sql`(unixepoch())`)
      .notNull(),
    updatedAt: d
      .integer("updated_at", { mode: "timestamp" })
      .$onUpdate(() => new Date()),
  }),
);
// Location relations
export const businessLocationsRelations = relations(
  businessLocations,
  ({ one }) => ({
    business: one(businesses, {
      fields: [businessLocations.businessId],
      references: [businesses.id],
    }),
  }),
);

export const customerLocationsRelations = relations(
  customerLocations,
  ({ one }) => ({
    appointment: one(appointments, {
      fields: [customerLocations.appointmentId],
      references: [appointments.id],
    }),
  }),
);
