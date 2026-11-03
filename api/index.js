var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// server/data/mockData.ts
var MOCK_SETTINGS, MOCK_LEADS, MOCK_TEMPLATES;
var init_mockData = __esm({
  "server/data/mockData.ts"() {
    MOCK_SETTINGS = {
      userName: "Creator",
      userRole: "Software Engineer & Creator",
      userEmail: "",
      userPhone: "",
      userBio: "Building and shipping projects.",
      userSignature: "Best regards,\nCreator",
      instagramHandle: "",
      tiktokHandle: "",
      youtubeHandle: "",
      websiteUrl: "",
      defaultCountryCode: "US",
      defaultCurrency: "USD",
      defaultFollowUpTime: "10:00",
      cadenceDays: [2, 5, 10],
      goingColdDays: 7,
      theme: "light",
      reducedMotion: false
    };
    MOCK_LEADS = [];
    MOCK_TEMPLATES = [];
  }
});

// server/modules/templates/template.model.ts
var template_model_exports = {};
__export(template_model_exports, {
  TemplateModel: () => TemplateModel,
  TemplateRepository: () => TemplateRepository,
  templateMongooseSchema: () => templateMongooseSchema
});
import mongoose, { Schema } from "mongoose";
var templateMongooseSchema, TemplateModel, inMemoryTemplates, TemplateRepository;
var init_template_model = __esm({
  "server/modules/templates/template.model.ts"() {
    init_db();
    init_mockData();
    templateMongooseSchema = new Schema(
      {
        id: { type: String, required: true, unique: true, index: true },
        title: { type: String, required: true },
        category: {
          type: String,
          enum: ["first_reply", "follow_up", "proposal", "nudge", "thank_you", "close"],
          required: true
        },
        channel: {
          type: String,
          enum: ["WhatsApp", "Email"],
          default: "WhatsApp"
        },
        subject: { type: String },
        body: { type: String, required: true }
      },
      {
        timestamps: true,
        toJSON: {
          virtuals: true,
          transform: (_, ret) => {
            delete ret._id;
            delete ret.__v;
            return ret;
          }
        }
      }
    );
    TemplateModel = mongoose.models.Template || mongoose.model("Template", templateMongooseSchema);
    inMemoryTemplates = JSON.parse(JSON.stringify(MOCK_TEMPLATES));
    TemplateRepository = class {
      static async getAll() {
        if (isMongoConnected()) {
          const docs = await TemplateModel.find().lean();
          return docs.map((d) => ({ ...d, id: d.id || d._id?.toString() }));
        }
        return [...inMemoryTemplates];
      }
      static async getById(id) {
        if (isMongoConnected()) {
          const doc = await TemplateModel.findOne({ id }).lean();
          if (!doc) return null;
          return { ...doc, id: doc.id || doc._id?.toString() };
        }
        const found = inMemoryTemplates.find((t) => t.id === id);
        return found ? { ...found } : null;
      }
      static async create(templateData) {
        const id = templateData.id || `tpl-${Date.now()}`;
        const newTemplate = {
          id,
          title: templateData.title,
          category: templateData.category,
          channel: templateData.channel,
          subject: templateData.subject,
          body: templateData.body
        };
        if (isMongoConnected()) {
          await TemplateModel.create(newTemplate);
        } else {
          inMemoryTemplates.push(newTemplate);
        }
        return newTemplate;
      }
      static async update(id, updates) {
        if (isMongoConnected()) {
          const updated = await TemplateModel.findOneAndUpdate(
            { id },
            { $set: updates },
            { new: true }
          ).lean();
          if (!updated) return null;
          return { ...updated, id: updated.id || updated._id?.toString() };
        }
        const idx = inMemoryTemplates.findIndex((t) => t.id === id);
        if (idx === -1) return null;
        inMemoryTemplates[idx] = { ...inMemoryTemplates[idx], ...updates };
        return { ...inMemoryTemplates[idx] };
      }
      static async delete(id) {
        if (isMongoConnected()) {
          const res = await TemplateModel.deleteOne({ id });
          return res.deletedCount > 0;
        }
        const lenBefore = inMemoryTemplates.length;
        inMemoryTemplates = inMemoryTemplates.filter((t) => t.id !== id);
        return inMemoryTemplates.length < lenBefore;
      }
    };
  }
});

// server/modules/settings/settings.model.ts
var settings_model_exports = {};
__export(settings_model_exports, {
  SettingsModel: () => SettingsModel,
  SettingsRepository: () => SettingsRepository,
  settingsMongooseSchema: () => settingsMongooseSchema
});
import mongoose2, { Schema as Schema2 } from "mongoose";
var settingsMongooseSchema, SettingsModel, inMemorySettings, SettingsRepository;
var init_settings_model = __esm({
  "server/modules/settings/settings.model.ts"() {
    init_db();
    init_mockData();
    settingsMongooseSchema = new Schema2(
      {
        id: { type: String, default: "app_settings", unique: true },
        userName: { type: String, default: "Creator" },
        userRole: { type: String, default: "Software Engineer & Creator" },
        userEmail: { type: String, default: "" },
        userPhone: { type: String, default: "" },
        userBio: { type: String, default: "Building and shipping projects." },
        userSignature: { type: String, default: "Best regards,\nCreator" },
        instagramHandle: { type: String, default: "" },
        tiktokHandle: { type: String, default: "" },
        youtubeHandle: { type: String, default: "" },
        websiteUrl: { type: String, default: "" },
        defaultCountryCode: { type: String, default: "US" },
        defaultCurrency: { type: String, default: "USD" },
        defaultFollowUpTime: { type: String, default: "10:00" },
        cadenceDays: { type: [Number], default: [2, 5, 10] },
        goingColdDays: { type: Number, default: 7 },
        theme: { type: String, enum: ["light", "dark"], default: "light" },
        reducedMotion: { type: Boolean, default: false }
      },
      {
        timestamps: true,
        toJSON: {
          virtuals: true,
          transform: (_, ret) => {
            delete ret._id;
            delete ret.__v;
            return ret;
          }
        }
      }
    );
    SettingsModel = mongoose2.models.Settings || mongoose2.model("Settings", settingsMongooseSchema);
    inMemorySettings = { ...MOCK_SETTINGS };
    SettingsRepository = class {
      static async get() {
        if (isMongoConnected()) {
          const doc = await SettingsModel.findOne({ id: "app_settings" }).lean();
          if (doc) {
            return {
              userName: doc.userName || "Creator",
              userRole: doc.userRole || "",
              userEmail: doc.userEmail || "",
              userPhone: doc.userPhone || "",
              userBio: doc.userBio || "",
              userSignature: doc.userSignature || "",
              instagramHandle: doc.instagramHandle || "",
              tiktokHandle: doc.tiktokHandle || "",
              youtubeHandle: doc.youtubeHandle || "",
              websiteUrl: doc.websiteUrl || "",
              defaultCountryCode: doc.defaultCountryCode || "US",
              defaultCurrency: doc.defaultCurrency || "USD",
              defaultFollowUpTime: doc.defaultFollowUpTime || "10:00",
              cadenceDays: doc.cadenceDays || [2, 5, 10],
              goingColdDays: doc.goingColdDays || 7,
              theme: doc.theme || "light",
              reducedMotion: doc.reducedMotion || false
            };
          }
        }
        return { ...inMemorySettings };
      }
      static async update(updates) {
        if (isMongoConnected()) {
          const updated = await SettingsModel.findOneAndUpdate(
            { id: "app_settings" },
            { $set: updates },
            { new: true, upsert: true }
          ).lean();
          return {
            userName: updated.userName || "Creator",
            userRole: updated.userRole || "",
            userEmail: updated.userEmail || "",
            userPhone: updated.userPhone || "",
            userBio: updated.userBio || "",
            userSignature: updated.userSignature || "",
            instagramHandle: updated.instagramHandle || "",
            tiktokHandle: updated.tiktokHandle || "",
            youtubeHandle: updated.youtubeHandle || "",
            websiteUrl: updated.websiteUrl || "",
            defaultCountryCode: updated.defaultCountryCode || "US",
            defaultCurrency: updated.defaultCurrency || "USD",
            defaultFollowUpTime: updated.defaultFollowUpTime || "10:00",
            cadenceDays: updated.cadenceDays || [2, 5, 10],
            goingColdDays: updated.goingColdDays || 7,
            theme: updated.theme || "light",
            reducedMotion: updated.reducedMotion || false
          };
        }
        inMemorySettings = { ...inMemorySettings, ...updates };
        return { ...inMemorySettings };
      }
    };
  }
});

// server/config/db.ts
import mongoose3 from "mongoose";
async function autoSeedDatabase() {
  try {
    const { LeadModel: LeadModel2 } = await Promise.resolve().then(() => (init_lead_model(), lead_model_exports));
    const { TemplateModel: TemplateModel2 } = await Promise.resolve().then(() => (init_template_model(), template_model_exports));
    const { SettingsModel: SettingsModel2 } = await Promise.resolve().then(() => (init_settings_model(), settings_model_exports));
    await LeadModel2.deleteMany({});
    await TemplateModel2.deleteMany({});
    console.log("[Database] Leads and templates cleared. Clean state ready for user.");
    const settingsCount = await SettingsModel2.countDocuments();
    if (settingsCount === 0) {
      console.log("[Database] Initializing profile settings in DB...");
      await SettingsModel2.create({ id: "app_settings", ...MOCK_SETTINGS });
    }
  } catch (err) {
    console.error("[Database] Database initialization issue:", err);
  }
}
var cache, connectDatabase, isMongoConnected;
var init_db = __esm({
  "server/config/db.ts"() {
    init_mockData();
    cache = globalThis.mongooseCache || { conn: null, promise: null };
    globalThis.mongooseCache = cache;
    connectDatabase = async () => {
      if (mongoose3.connection.readyState === 1) {
        return true;
      }
      const mongoUri = process.env.MONGODB_URI;
      if (!mongoUri || mongoUri.trim() === "" || mongoUri.includes("YOUR_MONGODB_URI")) {
        console.log("[Database] No MONGODB_URI provided in environment. Running with unified in-memory mock repository.");
        return false;
      }
      if (cache.promise) {
        return cache.promise;
      }
      cache.promise = (async () => {
        try {
          console.log("[Database] Connecting to MongoDB...");
          await mongoose3.connect(mongoUri, {
            serverSelectionTimeoutMS: 3e3,
            connectTimeoutMS: 4e3,
            autoIndex: false
          });
          cache.conn = mongoose3;
          console.log("[Database] Successfully connected to MongoDB via Mongoose.");
          await autoSeedDatabase();
          return true;
        } catch (error) {
          console.warn("[Database] MongoDB connection failed. Falling back gracefully to unified mock store:", error.message);
          cache.promise = null;
          return false;
        }
      })();
      return cache.promise;
    };
    isMongoConnected = () => mongoose3.connection.readyState === 1;
  }
});

// server/modules/leads/lead.model.ts
var lead_model_exports = {};
__export(lead_model_exports, {
  LeadModel: () => LeadModel,
  LeadRepository: () => LeadRepository,
  leadMongooseSchema: () => leadMongooseSchema
});
import mongoose4, { Schema as Schema3 } from "mongoose";
var InteractionSchema, leadMongooseSchema, LeadModel, inMemoryLeads, LeadRepository;
var init_lead_model = __esm({
  "server/modules/leads/lead.model.ts"() {
    init_db();
    init_mockData();
    InteractionSchema = new Schema3(
      {
        id: { type: String, required: true },
        type: {
          type: String,
          enum: ["WhatsApp", "Email", "Call", "Meeting", "Note"],
          required: true
        },
        text: { type: String, required: true },
        timestamp: { type: String, required: true },
        channel: { type: String }
      },
      { _id: false }
    );
    leadMongooseSchema = new Schema3(
      {
        id: { type: String, required: true, unique: true, index: true },
        fullName: { type: String, default: "" },
        whatsappNumber: { type: String, required: true, index: true },
        altPhone: { type: String },
        email: { type: String },
        instagramHandle: { type: String },
        tiktokHandle: { type: String },
        company: { type: String },
        city: { type: String },
        country: { type: String },
        source: {
          type: String,
          enum: ["WhatsApp", "TikTok", "Instagram", "YouTube", "LinkedIn", "X", "Facebook", "Email", "Referral", "Website", "Other"],
          default: "WhatsApp",
          index: true
        },
        sourceDetail: { type: String },
        referredBy: { type: String },
        firstContactAt: { type: String, required: true },
        purpose: {
          type: String,
          enum: ["Software project", "Consultation or mentoring", "Course or coaching", "Collaboration or sponsorship", "Job or hiring", "Question or support", "Other"],
          default: "Software project"
        },
        interestedIn: { type: String },
        estimatedValue: { type: Number, default: 0 },
        currency: { type: String, default: "USD" },
        deadline: { type: String },
        summary: { type: String, default: "" },
        interactions: { type: [InteractionSchema], default: [] },
        stage: {
          type: String,
          enum: ["New", "Contacted", "Qualified", "Proposal sent", "Negotiation", "Won", "Lost"],
          default: "New",
          index: true
        },
        temperature: {
          type: String,
          enum: ["Hot", "Warm", "Cold"],
          default: "Warm",
          index: true
        },
        lostReason: { type: String },
        wonValue: { type: Number },
        closedAt: { type: String },
        nextFollowUpAt: { type: String, index: true },
        followUpChannel: {
          type: String,
          enum: ["WhatsApp", "Email", "Call", "DM"],
          default: "WhatsApp"
        },
        followUpNote: { type: String },
        reminder: {
          type: String,
          enum: ["at_time", "1h_before", "1d_before"],
          default: "at_time"
        },
        lastContactedAt: { type: String, required: true },
        followUpCount: { type: Number, default: 0 },
        tags: { type: [String], default: [] },
        createdAt: { type: String, required: true },
        updatedAt: { type: String, required: true },
        archived: { type: Boolean, default: false, index: true },
        avatarColor: { type: String, default: "mint" }
      },
      {
        timestamps: false,
        toJSON: {
          virtuals: true,
          transform: (_, ret) => {
            delete ret._id;
            delete ret.__v;
            return ret;
          }
        }
      }
    );
    leadMongooseSchema.index({ stage: 1, nextFollowUpAt: 1 });
    leadMongooseSchema.index({ archived: 1, temperature: 1 });
    LeadModel = mongoose4.models.Lead || mongoose4.model("Lead", leadMongooseSchema);
    inMemoryLeads = JSON.parse(JSON.stringify(MOCK_LEADS));
    LeadRepository = class {
      static async getAll() {
        if (isMongoConnected()) {
          const docs = await LeadModel.find().lean();
          return docs.map((d) => ({ ...d, id: d.id || d._id?.toString() }));
        }
        return [...inMemoryLeads];
      }
      static async getById(id) {
        if (isMongoConnected()) {
          const doc = await LeadModel.findOne({ id }).lean();
          if (!doc) return null;
          return { ...doc, id: doc.id || doc._id?.toString() };
        }
        const found = inMemoryLeads.find((l) => l.id === id);
        return found ? { ...found } : null;
      }
      static async create(leadData) {
        const now = (/* @__PURE__ */ new Date()).toISOString();
        const id = leadData.id || `lead-${Date.now()}`;
        const newLead = {
          id,
          fullName: leadData.fullName || "",
          whatsappNumber: leadData.whatsappNumber || "",
          altPhone: leadData.altPhone,
          email: leadData.email,
          instagramHandle: leadData.instagramHandle,
          tiktokHandle: leadData.tiktokHandle,
          company: leadData.company,
          city: leadData.city,
          country: leadData.country,
          source: leadData.source || "WhatsApp",
          sourceDetail: leadData.sourceDetail,
          referredBy: leadData.referredBy,
          firstContactAt: leadData.firstContactAt || now,
          purpose: leadData.purpose || "Software project",
          interestedIn: leadData.interestedIn,
          estimatedValue: leadData.estimatedValue || 0,
          currency: leadData.currency || "USD",
          deadline: leadData.deadline,
          summary: leadData.summary || "",
          interactions: leadData.interactions || [],
          stage: leadData.stage || "New",
          temperature: leadData.temperature || "Warm",
          lostReason: leadData.lostReason,
          wonValue: leadData.wonValue,
          closedAt: leadData.closedAt,
          nextFollowUpAt: leadData.nextFollowUpAt,
          followUpChannel: leadData.followUpChannel || "WhatsApp",
          followUpNote: leadData.followUpNote,
          reminder: leadData.reminder || "at_time",
          lastContactedAt: leadData.lastContactedAt || now,
          followUpCount: leadData.followUpCount || 0,
          tags: leadData.tags || [],
          createdAt: leadData.createdAt || now,
          updatedAt: now,
          archived: leadData.archived || false,
          avatarColor: leadData.avatarColor || "mint"
        };
        if (isMongoConnected()) {
          await LeadModel.create(newLead);
        } else {
          inMemoryLeads.unshift(newLead);
        }
        return newLead;
      }
      static async update(id, updates) {
        const updatedAt = (/* @__PURE__ */ new Date()).toISOString();
        const cleanUpdates = { ...updates, updatedAt };
        if (isMongoConnected()) {
          const updated = await LeadModel.findOneAndUpdate(
            { id },
            { $set: cleanUpdates },
            { new: true }
          ).lean();
          if (!updated) return null;
          return { ...updated, id: updated.id || updated._id?.toString() };
        }
        const index = inMemoryLeads.findIndex((l) => l.id === id);
        if (index === -1) return null;
        inMemoryLeads[index] = { ...inMemoryLeads[index], ...cleanUpdates };
        return { ...inMemoryLeads[index] };
      }
      static async delete(id) {
        if (isMongoConnected()) {
          const res = await LeadModel.deleteOne({ id });
          return res.deletedCount > 0;
        }
        const initialLen = inMemoryLeads.length;
        inMemoryLeads = inMemoryLeads.filter((l) => l.id !== id);
        return inMemoryLeads.length < initialLen;
      }
      static async bulkDelete(ids) {
        if (isMongoConnected()) {
          const res = await LeadModel.deleteMany({ id: { $in: ids } });
          return res.deletedCount || 0;
        }
        const countBefore = inMemoryLeads.length;
        inMemoryLeads = inMemoryLeads.filter((l) => !ids.includes(l.id));
        return countBefore - inMemoryLeads.length;
      }
      static async logInteraction(leadId, interaction, nextFollowUpAt) {
        const lead = await this.getById(leadId);
        if (!lead) return null;
        const newInteraction = {
          id: `int-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          type: interaction.type,
          text: interaction.text,
          timestamp: interaction.timestamp || (/* @__PURE__ */ new Date()).toISOString(),
          channel: interaction.channel
        };
        const updates = {
          interactions: [...lead.interactions, newInteraction],
          lastContactedAt: newInteraction.timestamp,
          followUpCount: (lead.followUpCount || 0) + 1
        };
        if (nextFollowUpAt !== void 0) {
          updates.nextFollowUpAt = nextFollowUpAt;
        }
        return this.update(leadId, updates);
      }
      static async resetToMock() {
        if (isMongoConnected()) {
          await LeadModel.deleteMany({});
          await LeadModel.insertMany(MOCK_LEADS);
        }
        inMemoryLeads = JSON.parse(JSON.stringify(MOCK_LEADS));
      }
    };
  }
});

// server/app.ts
import express from "express";

// server/modules/leads/lead.routes.ts
import { Router } from "express";

// server/modules/leads/lead.controller.ts
init_lead_model();
var isDueToday = (dateStr) => {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  const now = /* @__PURE__ */ new Date();
  return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate();
};
var isGoingCold = (lastContactedAt, days = 7) => {
  if (!lastContactedAt) return false;
  const lastTime = new Date(lastContactedAt).getTime();
  const diffDays = (Date.now() - lastTime) / (1e3 * 60 * 60 * 24);
  return diffDays >= days;
};
var getLeads = async (req, res, next) => {
  try {
    const {
      source,
      stage,
      temperature,
      railFilter,
      preset,
      search,
      sortField = "nextFollowUp",
      sortOrder = "asc",
      archived = "false"
    } = req.query;
    let leads = await LeadRepository.getAll();
    const isArchivedFilter = archived === "true";
    leads = leads.filter((l) => Boolean(l.archived) === isArchivedFilter);
    if (railFilter && railFilter !== "ALL") {
      const rf = String(railFilter).toUpperCase();
      leads = leads.filter((l) => {
        if (rf === "DUE_TODAY") return isDueToday(l.nextFollowUpAt);
        if (rf === "HOT") return l.temperature === "Hot";
        if (rf === "WHATSAPP") return l.source === "WhatsApp";
        if (rf === "INSTAGRAM") return l.source === "Instagram";
        if (rf === "TIKTOK") return l.source === "TikTok";
        if (rf === "WON") return l.stage === "Won";
        return true;
      });
    }
    if (preset && preset !== "all") {
      leads = leads.filter((l) => {
        if (preset === "due_today") return isDueToday(l.nextFollowUpAt);
        if (preset === "hot") return l.temperature === "Hot";
        if (preset === "whatsapp") return l.source === "WhatsApp";
        if (preset === "high_ticket") return (l.estimatedValue || 0) >= 3e3;
        if (preset === "going_cold") return isGoingCold(l.lastContactedAt, 7);
        if (preset === "won") return l.stage === "Won";
        return true;
      });
    }
    if (source && source !== "all") {
      leads = leads.filter((l) => l.source === source);
    }
    if (stage && stage !== "all") {
      leads = leads.filter((l) => l.stage === stage);
    }
    if (temperature && temperature !== "all") {
      leads = leads.filter((l) => l.temperature === temperature);
    }
    if (search && typeof search === "string" && search.trim() !== "") {
      const q = search.trim().toLowerCase();
      leads = leads.filter((l) => {
        const matchesName = (l.fullName || "").toLowerCase().includes(q);
        const matchesPhone = (l.whatsappNumber || "").includes(q);
        const matchesCompany = (l.company || "").toLowerCase().includes(q);
        const matchesSummary = (l.summary || "").toLowerCase().includes(q);
        const matchesTags = (l.tags || []).some((t) => t.toLowerCase().includes(q));
        return matchesName || matchesPhone || matchesCompany || matchesSummary || matchesTags;
      });
    }
    leads.sort((a, b) => {
      const orderMultiplier = sortOrder === "desc" ? -1 : 1;
      if (sortField === "value") {
        return ((a.estimatedValue || 0) - (b.estimatedValue || 0)) * orderMultiplier;
      }
      if (sortField === "createdAt") {
        return (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()) * orderMultiplier;
      }
      const timeA = a.nextFollowUpAt ? new Date(a.nextFollowUpAt).getTime() : Infinity;
      const timeB = b.nextFollowUpAt ? new Date(b.nextFollowUpAt).getTime() : Infinity;
      return (timeA - timeB) * orderMultiplier;
    });
    res.json({ success: true, count: leads.length, data: leads });
  } catch (error) {
    next(error);
  }
};
var getLeadById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const lead = await LeadRepository.getById(id);
    if (!lead) {
      res.status(404).json({ success: false, message: `Lead with ID ${id} not found.` });
      return;
    }
    res.json({ success: true, data: lead });
  } catch (error) {
    next(error);
  }
};
var createLead = async (req, res, next) => {
  try {
    const leadData = req.body;
    if (!leadData.whatsappNumber || leadData.whatsappNumber.trim() === "") {
      res.status(400).json({ success: false, message: "WhatsApp number is required." });
      return;
    }
    const created = await LeadRepository.create(leadData);
    res.status(201).json({ success: true, data: created });
  } catch (error) {
    next(error);
  }
};
var updateLead = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const updated = await LeadRepository.update(id, updates);
    if (!updated) {
      res.status(404).json({ success: false, message: `Lead with ID ${id} not found.` });
      return;
    }
    res.json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
};
var deleteLead = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deleted = await LeadRepository.delete(id);
    if (!deleted) {
      res.status(404).json({ success: false, message: `Lead with ID ${id} not found.` });
      return;
    }
    res.json({ success: true, message: `Lead ${id} successfully deleted.` });
  } catch (error) {
    next(error);
  }
};
var bulkDeleteLeads = async (req, res, next) => {
  try {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      res.status(400).json({ success: false, message: "Array of lead IDs is required." });
      return;
    }
    const count = await LeadRepository.bulkDelete(ids);
    res.json({ success: true, count, message: `Deleted ${count} leads.` });
  } catch (error) {
    next(error);
  }
};
var logInteraction = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { interaction, nextFollowUpAt } = req.body;
    if (!interaction || !interaction.text) {
      res.status(400).json({ success: false, message: "Interaction text and details are required." });
      return;
    }
    const updatedLead = await LeadRepository.logInteraction(id, interaction, nextFollowUpAt);
    if (!updatedLead) {
      res.status(404).json({ success: false, message: `Lead with ID ${id} not found.` });
      return;
    }
    res.json({ success: true, data: updatedLead });
  } catch (error) {
    next(error);
  }
};
var resetToMock = async (_req, res, next) => {
  try {
    await LeadRepository.resetToMock();
    const leads = await LeadRepository.getAll();
    res.json({ success: true, count: leads.length, message: "Reset to unified mockData successfully.", data: leads });
  } catch (error) {
    next(error);
  }
};

// server/modules/leads/lead.routes.ts
var router = Router();
router.get("/", getLeads);
router.post("/", createLead);
router.post("/bulk-delete", bulkDeleteLeads);
router.post("/reset", resetToMock);
router.get("/:id", getLeadById);
router.put("/:id", updateLead);
router.delete("/:id", deleteLead);
router.post("/:id/interactions", logInteraction);
var lead_routes_default = router;

// server/modules/templates/template.routes.ts
import { Router as Router2 } from "express";

// server/modules/templates/template.controller.ts
init_template_model();
var getTemplates = async (_req, res, next) => {
  try {
    const templates = await TemplateRepository.getAll();
    res.json({ success: true, count: templates.length, data: templates });
  } catch (error) {
    next(error);
  }
};
var getTemplateById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const template = await TemplateRepository.getById(id);
    if (!template) {
      res.status(404).json({ success: false, message: `Template ${id} not found.` });
      return;
    }
    res.json({ success: true, data: template });
  } catch (error) {
    next(error);
  }
};
var createTemplate = async (req, res, next) => {
  try {
    const { title, category, channel, body, subject } = req.body;
    if (!title || !category || !body) {
      res.status(400).json({ success: false, message: "Title, category, and body are required." });
      return;
    }
    const created = await TemplateRepository.create({
      title,
      category,
      channel: channel || "WhatsApp",
      body,
      subject
    });
    res.status(201).json({ success: true, data: created });
  } catch (error) {
    next(error);
  }
};
var updateTemplate = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const updated = await TemplateRepository.update(id, updates);
    if (!updated) {
      res.status(404).json({ success: false, message: `Template ${id} not found.` });
      return;
    }
    res.json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
};
var deleteTemplate = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deleted = await TemplateRepository.delete(id);
    if (!deleted) {
      res.status(404).json({ success: false, message: `Template ${id} not found.` });
      return;
    }
    res.json({ success: true, message: `Template ${id} deleted.` });
  } catch (error) {
    next(error);
  }
};

// server/modules/templates/template.routes.ts
var router2 = Router2();
router2.get("/", getTemplates);
router2.post("/", createTemplate);
router2.get("/:id", getTemplateById);
router2.put("/:id", updateTemplate);
router2.delete("/:id", deleteTemplate);
var template_routes_default = router2;

// server/modules/settings/settings.routes.ts
import { Router as Router3 } from "express";

// server/modules/settings/settings.controller.ts
init_settings_model();
var getSettings = async (_req, res, next) => {
  try {
    const settings = await SettingsRepository.get();
    res.json({ success: true, data: settings });
  } catch (error) {
    next(error);
  }
};
var updateSettings = async (req, res, next) => {
  try {
    const updates = req.body;
    const updated = await SettingsRepository.update(updates);
    res.json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
};

// server/modules/settings/settings.routes.ts
var router3 = Router3();
router3.get("/", getSettings);
router3.put("/", updateSettings);
var settings_routes_default = router3;

// server/modules/analytics/analytics.routes.ts
import { Router as Router4 } from "express";

// server/modules/analytics/analytics.controller.ts
init_lead_model();
var getAnalyticsSummary = async (_req, res, next) => {
  try {
    const leads = (await LeadRepository.getAll()).filter((l) => !l.archived);
    const now = /* @__PURE__ */ new Date();
    const todayStr = now.toISOString().slice(0, 10);
    let dueTodayCount = 0;
    let overdueCount = 0;
    let totalWonValue = 0;
    let wonCount = 0;
    let lostCount = 0;
    let pipelineValue = 0;
    let hotCount = 0;
    let warmCount = 0;
    let coldCount = 0;
    const sourceCounts = {
      WhatsApp: 0,
      TikTok: 0,
      Instagram: 0,
      YouTube: 0,
      LinkedIn: 0,
      X: 0,
      Facebook: 0,
      Email: 0,
      Referral: 0,
      Website: 0,
      Other: 0
    };
    const contentAttributionMap = {};
    leads.forEach((lead) => {
      if (lead.nextFollowUpAt) {
        const leadDateStr = lead.nextFollowUpAt.slice(0, 10);
        const leadTime = new Date(lead.nextFollowUpAt).getTime();
        if (leadTime < now.getTime() && leadDateStr !== todayStr) {
          overdueCount++;
        } else if (leadDateStr === todayStr) {
          dueTodayCount++;
        }
      }
      if (lead.stage === "Won") {
        wonCount++;
        totalWonValue += lead.wonValue || lead.estimatedValue || 0;
      } else if (lead.stage === "Lost") {
        lostCount++;
      } else {
        pipelineValue += lead.estimatedValue || 0;
      }
      if (lead.temperature === "Hot") hotCount++;
      else if (lead.temperature === "Warm") warmCount++;
      else if (lead.temperature === "Cold") coldCount++;
      if (lead.source in sourceCounts) {
        sourceCounts[lead.source]++;
      }
      if (lead.sourceDetail && lead.sourceDetail.trim() !== "") {
        const key = lead.sourceDetail.trim();
        if (!contentAttributionMap[key]) {
          contentAttributionMap[key] = { count: 0, wonCount: 0, wonValue: 0 };
        }
        contentAttributionMap[key].count++;
        if (lead.stage === "Won") {
          contentAttributionMap[key].wonCount++;
          contentAttributionMap[key].wonValue += lead.wonValue || lead.estimatedValue || 0;
        }
      }
    });
    const closedCount = wonCount + lostCount;
    const conversionRate = closedCount > 0 ? wonCount / closedCount * 100 : wonCount / (leads.length || 1) * 100;
    const topContent = Object.entries(contentAttributionMap).map(([title, data]) => ({ title, ...data })).sort((a, b) => b.count - a.count).slice(0, 5);
    res.json({
      success: true,
      data: {
        totalLeads: leads.length,
        followUpsDue: dueTodayCount + overdueCount,
        dueTodayCount,
        overdueCount,
        wonCount,
        lostCount,
        conversionRate: Math.round(conversionRate * 10) / 10,
        totalWonValue,
        pipelineValue,
        hotCount,
        warmCount,
        coldCount,
        sourceBreakdown: sourceCounts,
        topContent
      }
    });
  } catch (error) {
    next(error);
  }
};

// server/modules/analytics/analytics.routes.ts
var router4 = Router4();
router4.get("/summary", getAnalyticsSummary);
var analytics_routes_default = router4;

// server/middleware/errorHandler.ts
var errorHandler = (err, _req, res, _next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  console.error(`[API Error ${statusCode}]`, err);
  res.status(statusCode).json({
    success: false,
    statusCode,
    message,
    ...process.env.NODE_ENV === "development" && { stack: err.stack }
  });
};

// server/app.ts
init_db();
import cors from "cors";
var createApp = () => {
  const app2 = express();
  app2.use(cors());
  app2.use(express.json({ limit: "10mb" }));
  app2.use(express.urlencoded({ extended: true }));
  app2.get(["/api/health", "/health"], (_req, res) => {
    res.json({
      status: "healthy",
      database: isMongoConnected() ? "mongodb" : "mock_memory",
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    });
  });
  app2.use(["/api/leads", "/leads"], lead_routes_default);
  app2.use(["/api/templates", "/templates"], template_routes_default);
  app2.use(["/api/settings", "/settings"], settings_routes_default);
  app2.use(["/api/analytics", "/analytics"], analytics_routes_default);
  app2.use(errorHandler);
  return app2;
};

// api/index.ts
init_db();
var app = createApp();
var dbPromise = null;
var ensureDb = () => {
  if (!dbPromise) {
    dbPromise = connectDatabase().catch((err) => {
      console.warn("[Vercel Serverless DB Warning]:", err);
      return false;
    });
  }
  return dbPromise;
};
function handler(req, res) {
  return new Promise((resolve, reject) => {
    res.on("finish", () => resolve());
    res.on("close", () => resolve());
    res.on("error", (err) => reject(err));
    ensureDb().then(() => {
      app(req, res, (err) => {
        if (err) {
          console.error("[Vercel Serverless Express Error]:", err);
          if (!res.headersSent) {
            res.status(500).json({ error: err.message || "Server error" });
          }
          return resolve();
        }
        if (!res.headersSent) {
          res.status(404).json({ error: "Endpoint not found" });
          return resolve();
        }
      });
    }).catch((err) => {
      console.error("[Vercel Serverless Handler Error]:", err);
      if (!res.headersSent) {
        res.status(500).json({ error: err.message || "Internal server error" });
      }
      resolve();
    });
  });
}
export {
  handler as default
};
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Vercel Serverless Function entry point
 */
