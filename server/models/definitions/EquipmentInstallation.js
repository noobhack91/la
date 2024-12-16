import { DataTypes, Model } from 'sequelize';

class EquipmentInstallation extends Model {
  static init(sequelize) {
    super.init({
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      tenderNumber: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
        validate: {
          notEmpty: true,
          len: [1, 100]
        }
      },
      tenderStartDate: {
        type: DataTypes.DATE,
        allowNull: false
      },
      tenderEndDate: {
        type: DataTypes.DATE,
        allowNull: false
      },
      tenderDocumentPath: {
        type: DataTypes.STRING,
        allowNull: true
      },
      authorityType: {
        type: DataTypes.ENUM('UPMSCL', 'AUTONOMOUS', 'CMSD', 'DGME', 'AIIMS', 'SGPGI', 'KGMU', 'BHU',
          'BMSICL', 'OSMCL', 'TRADE', 'GDMC', 'AMSCL'),
        allowNull: false
      },
      equipment: {
        type: DataTypes.STRING,
        allowNull: false
      },
      equipmentQuantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          min: 1
        }
      },
      leadTimeToDeliver: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          min: 1
        }
      },
      leadTimeToInstall: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          min: 1
        }
      },
      remarks: {
        type: DataTypes.TEXT
      },
      hasAccessories: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      },
      accessories: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        defaultValue: []
      },
      status: {
        type: DataTypes.ENUM('Draft', 'Submitted', 'In Progress', 'Completed'),
        defaultValue: 'Draft'
      },
      createdBy: {
        type: DataTypes.UUID,
        allowNull: false
      }
    }, {
      sequelize,
      modelName: 'EquipmentInstallation',
      tableName: 'equipment_installations',
      underscored: true,
      timestamps: true
    });
  }

  static associate(models) {
    this.hasMany(models.EquipmentLocation, {
      foreignKey: 'installationId',
      as: 'locations'
    });
    this.belongsTo(models.User, {
      foreignKey: 'createdBy',
      as: 'creator'
    });
  }
}

export default EquipmentInstallation;
