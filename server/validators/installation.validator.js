import { z } from 'zod';

const locationSchema = z.object({
  districtName: z.string().min(1),
  blockName: z.string().min(1),
  facilityName: z.string().min(1)
});

const installationSchema = z.object({
  tender_number: z.string().min(1).max(100),
  authority_type: z.enum([
    'UPSMC',
    'UKSMC',
    'SGPGIMS',
    'UPMSCL',
    'AMSCL',
    'CMSD',
    'DGME',
    'AIIMS',
    'SGPGI',
    'KGMU',
    'BHU',
    'BMSICL',
    'OSMCL',
    'TRADE',
    'GDMC',
    'AUTONOMOUS'
  ]),
  tender_start_date: z.string().datetime(), // Updated to reflect the new field
  tender_end_date: z.string().datetime(),   // Updated to reflect the new field
  tender_document: z.any().optional(),       // This will be handled by multer
  equipment: z.string().min(1),
  equipment_quantity: z.number().positive(), // New field for equipment quantity
  lead_time_to_deliver: z.number().positive(),
  lead_time_to_install: z.number().positive(),
  remarks: z.string().optional(),
  has_accessories: z.boolean(),
  selected_accessories: z.array(z.string()).optional().nullable(),
  locations: z.array(locationSchema),
  has_consumables: z.boolean(),
  selected_consumables: z.array(z.string()).optional().nullable()
});

export function validateInstallationRequest(data) {
  return installationSchema.parse(data);
}
