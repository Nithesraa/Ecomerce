import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema(
  {
    actor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    action: { type: String, required: true },
    entityType: { type: String, required: true }, // Model name (e.g. 'SellerProfile')
    entityId: { type: String, required: true }, 
    details: { type: mongoose.Schema.Types.Mixed }, // Arbitrary object data
    ipAddress: { type: String },
  },
  { timestamps: true }
);

export const AuditLog = mongoose.model('AuditLog', auditLogSchema);
