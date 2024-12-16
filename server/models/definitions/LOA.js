// server/models/definitions/LOA.js
import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const LOA = sequelize.define('LOA', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    tenderId: {  // Changed from tender_id to tenderId
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'tenders',
        key: 'id'
      }
    },
    loaNumber: {  // Changed from loa_number to loaNumber
      type: DataTypes.STRING,
      allowNull: false
    },
    loaDate: {  // Changed from loa_date to loaDate
      type: DataTypes.DATE,
      allowNull: false
    },
    documentPath: {  // Changed from document_path to documentPath
      type: DataTypes.STRING,
      allowNull: true
    },
    createdBy: {  // Changed from created_by to createdBy
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    }
  }, {
    tableName: 'loas',
    underscored: true,  // This will automatically convert camelCase to snake_case
    timestamps: true
  });

  return LOA;
};