module.exports = function baseModel(Sequelize) {
  return {
    id: {
      primaryKey: true,
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      unique: true,
    },
    created_at: {
      allowNull: false,
      type: Sequelize.DATE,
      defaultValue: new Date(),
    },
    updated_at: {
      allowNull: true,
      type: Sequelize.DATE,
      defaultValue: new Date(),
    },
    deleted_at: {
      type: Sequelize.DATE,
      allowNull: true,
    },
  };
};
