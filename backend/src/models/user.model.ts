import { DataTypes, Model, Optional, Sequelize } from 'sequelize';

// Define the attributes for our User model
interface UserAttributes {
    id: number;
    username: string;
    // Add other user attributes later, e.g., passwordHash, status, profilePicture
}

// Some attributes are optional when creating a User (e.g., id is auto-generated)
interface UserCreationAttributes extends Optional<UserAttributes, 'id'> {}

// Define the User model class
class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
    public id!: number; // Non-null assertion since it's required in the interface
    public username!: string;

    // Timestamps
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
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

// Export the model class and the initialization function
export { User, initUserModel };