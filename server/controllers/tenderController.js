import { Parser } from 'json2csv';
import { Op } from 'sequelize';
import logger from '../config/logger.js';
import { Consignee, sequelize, Tender } from '../models/index.js';

export const searchTenders = async (req, res) => {
  try {
    const {
      startDate,
      endDate,
      tenderNumber,
      district,
      block,
      status,
      accessoriesPending,
      installationPending,
      invoicePending,
      page = 1,
      limit = 50
    } = req.query;

    const where = {};

    if (startDate && endDate) {
      where.createdAt = {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      };
    }

    if (tenderNumber) {
      where.tenderNumber = {
        [Op.iLike]: `%${tenderNumber}%`
      };
    }

    if (status) {
      where.status = status;
    }

    if (accessoriesPending) {
      where.accessoriesPending = accessoriesPending === 'Yes';
    }

    if (installationPending) {
      where.installationPending = installationPending === 'Yes';
    }

    if (invoicePending) {
      where.invoicePending = invoicePending === 'Yes';
    }

    const offset = (page - 1) * limit;

    const { count, rows } = await Tender.findAndCountAll({
      where,
      include: [{
        model: Consignee,
        as: 'consignees',
        where: district || block ? {
          [Op.and]: [
            district ? { districtName: district } : null,
            block ? { blockName: block } : null
          ].filter(Boolean)
        } : undefined,
        required: !!(district || block)
      }],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
    });

    logger.info(`Tenders searched with filters: ${JSON.stringify(req.query)}`);

    res.json({
      tenders: rows,
      total: count,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page)
    });
  } catch (error) {
    logger.error('Error searching tenders:', error);
    res.status(500).json({ error: error.message });
  }
};

export const getDistricts = async (req, res) => {
  try {
    const districts = await Consignee.findAll({
      attributes: [[sequelize.fn('DISTINCT', sequelize.col('district_name')), 'district']],
      raw: true
    });

    res.json(districts.map(d => d.district).filter(Boolean));
  } catch (error) {
    logger.error('Error fetching districts:', error);
    res.status(500).json({ error: error.message });
  }
};

export const getBlocks = async (req, res) => {
  try {
    const blocks = await Consignee.findAll({
      attributes: [[sequelize.fn('DISTINCT', sequelize.col('block_name')), 'block']],
      raw: true
    });

    res.json(blocks.map(b => b.block).filter(Boolean));
  } catch (error) {
    logger.error('Error fetching blocks:', error);
    res.status(500).json({ error: error.message });
  }
};

export const getTenderById = async (req, res) => {
  try {
    const tender = await Tender.findByPk(req.params.id, {
      include: [{
        model: Consignee,
        as: 'consignees',
        include: ['logisticsDetails', 'challanReceipt', 'installationReport', 'invoice']
      }]
    });

    if (!tender) {
      return res.status(404).json({ error: 'Tender not found' });
    }

    res.json(tender);
  } catch (error) {
    logger.error('Error fetching tender:', error);
    res.status(500).json({ error: error.message });
  }
};
// server/controllers/tenderController.js

export const createTender = async (req, res) => {
  try {
    const {
      tender_number,
      authority_type,
      // contract_date,
      equipment_name,
      lead_time_to_deliver,
      lead_time_to_install,
      remarks,
      has_accessories,
      accessories,
      locations
    } = req.body;

    const tender = await Tender.create({
      tenderNumber: tender_number,
      authorityType: authority_type,
      // contractDate: contract_date,
      equipmentName: equipment_name,
      leadTimeToDeliver: lead_time_to_deliver,
      leadTimeToInstall: lead_time_to_install,
      remarks,
      hasAccessories: has_accessories,
      accessories,
      accessoriesPending: has_accessories && accessories && accessories.length > 0,
      status: 'Draft',
      createdBy: req.user.id
    });

    if (locations?.length > 0) {
      await Consignee.bulkCreate(
        locations.map((loc, index) => ({
          tenderId: tender.id,
          srNo: (index + 1).toString(),
          districtName: loc.districtName,
          blockName: loc.blockName,
          facilityName: loc.facilityName,
          consignmentStatus: 'Processing'
        }))
      );
    }

    res.status(201).json(tender);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
export const exportTenderData = async (req, res) => {
  try {
    const { tenderId } = req.params;

    const tender = await Tender.findByPk(tenderId, {
      include: [{
        model: Consignee,
        as: 'consignees',
        include: [
          'logisticsDetails',
          'challanReceipt',
          'installationReport',
          'invoice'
        ]
      }]
    });

    if (!tender) {
      return res.status(404).json({ error: 'Tender not found' });
    }

    // Define fields based on your current model structure
    const fields = [
      // Tender Details
      'Tender Number',
      'Authority Type',
      'Equipment Name',
      'Lead Time (Delivery)',
      'Lead Time (Installation)',
      'Status',
      'Has Accessories',
      'Accessories List',
      'Remarks',
      
      // Location Details
      'SR No',
      'District',
      'Block',
      'Facility',
      'Consignment Status',
      
      // Logistics Details
      'Logistics Date',
      'Courier Name',
      'Docket Number',
      
      // Challan Details
      'Challan Date',
      
      // Installation Details
      'Installation Date',
      
      // Invoice Details
      'Invoice Date',
      
      // Additional Details
      'Created At',
      'Updated At'
    ];

    const data = tender.consignees.map(consignee => ({
      // Tender Details
      'Tender Number': tender.tenderNumber,
      'Authority Type': tender.authorityType,
      'Equipment Name': tender.equipmentName,
      'Lead Time (Delivery)': tender.leadTimeToDeliver,
      'Lead Time (Installation)': tender.leadTimeToInstall,
      'Status': tender.status,
      'Has Accessories': tender.hasAccessories ? 'Yes' : 'No',
      'Accessories List': tender.accessories?.join(', ') || '',
      'Remarks': tender.remarks,
      
      // Location Details
      'SR No': consignee.srNo,
      'District': consignee.districtName,
      'Block': consignee.blockName,
      'Facility': consignee.facilityName,
      'Consignment Status': consignee.consignmentStatus,
      
      // Logistics Details
      'Logistics Date': formatDate(consignee.logisticsDetails?.date),
      'Courier Name': consignee.logisticsDetails?.courierName,
      'Docket Number': consignee.logisticsDetails?.docketNumber,
      
      // Challan Details
      'Challan Date': formatDate(consignee.challanReceipt?.date),
      
      // Installation Details
      'Installation Date': formatDate(consignee.installationReport?.date),
      
      // Invoice Details
      'Invoice Date': formatDate(consignee.invoice?.date),
      
      // Additional Details
      'Created At': formatDate(tender.createdAt),
      'Updated At': formatDate(tender.updatedAt)
    }));

    // Helper function to format dates
    function formatDate(date) {
      if (!date) return '';
      return new Date(date).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    }

    // Generate CSV
    const json2csvParser = new Parser({ 
      fields,
      excelStrings: true,
      header: true
    });
    
    const csv = json2csvParser.parse(data);

    // Set response headers
    res.header('Content-Type', 'text/csv');
    res.header('Content-Disposition', `attachment; filename=tender_${tender.tenderNumber}_report_${new Date().toISOString().split('T')[0]}.csv`);
    
    // Send the CSV file
    res.send(csv);

    logger.info(`Tender data exported for tender ID: ${tenderId}`);

  } catch (error) {
    logger.error('Error exporting tender data:', error);
    res.status(500).json({ error: error.message });
  }
};
