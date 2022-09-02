'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class Member extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
        }
    }

    Member.init({
        id: {
            primaryKey: true,
            type: DataTypes.STRING
        },
        discordId: DataTypes.INTEGER,
        name: DataTypes.STRING,
        steamId: DataTypes.STRING,
        vipStart: DataTypes.DATE,
        vipEnd: DataTypes.DATE

    }, {
        sequelize,
        modelName: 'Member',
    });
    return Member;
};