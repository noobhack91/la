// models/definitions/Consignee.js
import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const Consignee = sequelize.define('Consignee', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    tenderId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'tenders',
        key: 'id'
      }
    },
    documentId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'tender_documents',
        key: 'id'
      },
      comment: 'References the PO this consignee belongs to'
    },
    facilityName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    districtName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    blockName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    machineCount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1
    },
    contactPerson: {
      type: DataTypes.STRING,
      allowNull: false
    },
    contactPhone: {
      type: DataTypes.STRING,
      allowNull: false
    },
    contactEmail: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        isEmail: true
      }
    },
    status: {
      type: DataTypes.ENUM(
        'Processing',
        'Dispatched',
        'Installation Pending',
        'Installation Done',
        'Invoice Done'
      ),
      defaultValue: 'Processing'
    },
    remarks: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    tableName: 'consignees',
    underscored: true,
    timestamps: true
  });

  return Consignee;
};