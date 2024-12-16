// models/definitions/TenderDocument.js
import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const TenderDocument = sequelize.define('TenderDocument', {
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
    type: {
      type: DataTypes.ENUM('LOA', 'PO'),
      allowNull: false
    },
    documentNumber: {
      type: DataTypes.STRING,
      allowNull: false
    },
    documentDate: {
      type: DataTypes.DATE,
      allowNull: false
    },
    documentPath: {
      type: DataTypes.STRING,
      allowNull: true
    },
    parentId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'tender_documents',
        key: 'id'
      }
    },
    remarks: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    createdBy: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    }
  }, {
    tableName: 'tender_documents',
    underscored: true,
    timestamps: true,
    indexes: [
      {
        fields: ['tender_id']
      },
      {
        fields: ['parent_id']
      },
      {
        fields: ['type']
      }
    ]
  });

  return TenderDocument;
};