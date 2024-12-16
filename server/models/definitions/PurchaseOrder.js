// server/models/definitions/PurchaseOrder.js
import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const PurchaseOrder = sequelize.define('PurchaseOrder', {
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
    poNumber: {
      type: DataTypes.STRING,
      allowNull: false
    },
    poDate: {
      type: DataTypes.DATE,
      allowNull: false
    },
    documentPath: {
      type: DataTypes.STRING,
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
    tableName: 'purchase_orders',
    underscored: true,
    timestamps: true
  });

  return PurchaseOrder;
};