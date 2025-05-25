import { DataTypes, Model, Optional, Sequelize } from 'sequelize';

interface UserAttributes {
    id: number;
    username: string;
}

interface UserCreationAttributes extends Optional<UserAttributes, 'id'> {}

class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
    declare id: number; // Non-null assertion since it's required in the interface
    declare username: string;

    declare readonly createdAt: Date;
    declare readonly updatedAt: Date;
}

// Function to initialize the User model
const initUserModel = (sequelize: Sequelize) => {
    User.init(
        {
            id: {
                type: DataTypes.INTEGER.UNSIGNED,
                autoIncrement: true,
                primaryKey: true,
            },
            username: {
                type: DataTypes.STRING,
                allowNull: false,
                unique: true, // Ensure usernames are unique
            },
            // Define other attributes here later
        },
        {
            tableName: 'users', // Explicitly set table name
            sequelize, // Pass the Sequelize instance
            timestamps: true, // Enable createdAt and updatedAt
        }
    );
};

export { User, initUserModel };