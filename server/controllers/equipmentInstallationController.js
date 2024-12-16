import { parse } from 'csv-parse/sync';
import logger from '../config/logger.js';
import { Consignee, sequelize, Tender } from '../models/index.js';
import { containers, uploadFile } from '../utils/azureStorage.js'; // Import the uploadFile function
import { validateInstallationRequest } from '../validators/installation.validator.js';

export const createInstallationRequest = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    // Validate the incoming request data
    const validatedData = validateInstallationRequest(req.body);

    // Upload the tender document if provided
    let tenderDocumentPath = null;
    if (req.file) {
      tenderDocumentPath = await uploadFile(req.file, containers.TENDER_DOCUMENTS); // Use the appropriate container
    }
    // Create the tender/installation request
    const tender = await Tender.create({
      tenderNumber: validatedData.tender_number,
      authorityType: validatedData.authority_type,
      tenderStartDate: validatedData.tender_start_date, // Updated field
      tenderEndDate: validatedData.tender_end_date,     // Updated field
      tenderDocumentPath: tenderDocumentPath, // Save the uploaded document path
      equipmentName: validatedData.equipment,
      equipmentQuantity: validatedData.equipment_quantity, // Updated field
      leadTimeToDeliver: validatedData.lead_time_to_deliver,
      leadTimeToInstall: validatedData.lead_time_to_install,
      remarks: validatedData.remarks,
      hasAccessories: validatedData.has_accessories,
      accessories: validatedData.selected_accessories,
      accessoriesPending: validatedData.has_accessories &&
        validatedData.selected_accessories &&
        validatedData.selected_accessories.length > 0,
      status: 'Draft',
      selected_accessories:validatedData.selected_accessories,
      hasConsumables: validatedData.has_consumables, // Fix the typo
      selectedConsumables: validatedData.selected_consumables || [], // Add this field
      consumablesPending: validatedData.has_consumables &&
        validatedData.selected_consumables &&
        validatedData.selected_consumables.length > 0,
      createdBy: req.user.id
    }, { transaction });

    // Create consignees/locations with proper accessoriesPending
    if (validatedData.locations?.length > 0) {
      await Consignee.bulkCreate(
        validatedData.locations.map((loc, index) => ({
          tenderId: tender.id,
          srNo: (index + 1).toString(),
          districtName: loc.districtName,
          blockName: loc.blockName,
          facilityName: loc.facilityName,
          consignmentStatus: 'Processing',
          accessoriesPending: {
            status: validatedData.has_accessories && validatedData.selected_accessories?.length > 0,
            count: validatedData.selected_accessories?.length || 0,
            items: validatedData.selected_accessories || []
          }
        })),
        { transaction }
      );
    }

    await transaction.commit();
    logger.info(`Tender/Installation request created: ${tender.id}`);

    // Fetch complete tender with consignees
    const completeTender = await Tender.findByPk(tender.id, {
      include: [{
        model: Consignee,
        as: 'consignees'
      }]
    });

    res.status(201).json(completeTender);
  } catch (error) {
    await transaction.rollback();
    logger.error('Error creating tender/installation request:', error);
    res.status(400).json({ error: error.message });
  }
};

export const getInstallationRequests = async (req, res) => {
  try {
    const tenders = await Tender.findAll({
      include: [{
        model: Consignee,
        as: 'consignees'
      }],
      order: [['createdAt', 'DESC']]
    });

    res.json(tenders);
  } catch (error) {
    logger.error('Error fetching tenders:', error);
    res.status(500).json({ error: error.message });
  }
};

// Backend API endpoints
// Backend API endpoint
export const uploadConsigneeCSV = async (req, res) => {
  try {
    if (!req.file) {
      throw new Error('No file uploaded');
    }

    const fileContent = req.file.buffer.toString();
    const records = parse(fileContent, {
      columns: true,
      skip_empty_lines: true
    });

    const locations = records.map((record, index) => ({
      srNo: (index + 1).toString(),
      districtName: record.district_name?.trim(),
      blockName: record.block_name?.trim(),
      facilityName: record.facility_name?.trim(),
      contactName: record.contact_name?.trim(),
      contactPhone: record.contact_phone?.trim(),
      contactEmail: record.contact_email?.trim(),
      quantity: parseInt(record.quantity?.trim()) || 1,
    }));

    // Expand locations based on quantity
    const expandedLocations = locations.flatMap(loc => {
      const quantity = parseInt(loc.quantity) || 1;
      return Array(quantity).fill(null).map(() => ({
        ...loc,
        quantity: 1 // Set individual quantity to 1 for each expanded row
      }));
    });

    const warnings = [];
    const seen = new Set();
    expandedLocations.forEach(loc => {
      const key = `${loc.districtName}-${loc.blockName}-${loc.facilityName}`;
      if (seen.has(key)) {
        warnings.push(`Duplicate entry found: ${key}`);
      }
      seen.add(key);
    });

    res.json({
      locations: expandedLocations,
      warnings: warnings.length > 0 ? warnings : null
    });
  } catch (error) {
    logger.error('Error processing CSV:', error);
    res.status(400).json({ error: error.message });
  }
};

export const downloadTemplate = async (req, res) => {
  try {
    // Fix template string format
    const template = 'district_name,block_name,facility_name,contact_name,contact_phone,contact_email,quantity\n';
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=consignee_template.csv');
    res.send(template);
  } catch (error) {
    logger.error('Error downloading template:', error);
    res.status(500).json({ error: 'Error downloading template' });
  }
};