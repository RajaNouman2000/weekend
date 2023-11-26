import { DataTypes, Sequelize } from "sequelize";

export const sequelize = new Sequelize("classicmodels", "root", "root", {
  host: "localhost",
  dialect: "mysql",
});

export const ProductLine = sequelize.define(
  "productline",
  {
    productLine: {
      type: DataTypes.STRING,
      primaryKey: true,
      allowNull: false,
    },
    textDescription: DataTypes.TEXT,
    htmlDescription: DataTypes.TEXT,
    image: DataTypes.STRING,
  },
  {
    timestamps: false,
  }
);

export const Product = sequelize.define(
  "product",
  {
    productCode: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    productName: DataTypes.STRING,
    productLine: DataTypes.STRING,
    productScale: DataTypes.STRING,
    productVendor: DataTypes.STRING,
    productDescription: DataTypes.STRING,
    quantityInStock: DataTypes.INTEGER,
    buyPrice: DataTypes.FLOAT,
    MSRP: DataTypes.FLOAT,
  },
  {
    timestamps: false,
  }
);

// OrderDetails
export const OrderDetail = sequelize.define(
  "orderdetail",
  {
    orderNumber: {
      type: DataTypes.INTEGER,
      primaryKey: true,
    },
    orderLineNumber: {
      type: DataTypes.INTEGER,
      primaryKey: true,
    },
    quantityOrdered: DataTypes.INTEGER,
    priceEach: DataTypes.FLOAT,
  },
  {
    timestamps: false,
  }
);

// Employee
export const Employee = sequelize.define(
  "employee",
  {
    employeeNumber: {
      type: DataTypes.INTEGER,
      primaryKey: true,
    },
    lastName: DataTypes.STRING,
    firstName: DataTypes.STRING,
    extension: DataTypes.STRING,
    email: DataTypes.STRING,
    officeCode: DataTypes.STRING,
    reportsTo: DataTypes.INTEGER,
    jobTitle: DataTypes.STRING,
  },
  {
    timestamps: false,
  }
);

// Office
export const Office = sequelize.define(
  "office",
  {
    officeCode: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    city: DataTypes.STRING,
    phone: DataTypes.STRING,
    addressLine1: DataTypes.STRING,
    addressLine2: DataTypes.STRING,
    state: DataTypes.STRING,
    country: DataTypes.STRING,
    postalCode: DataTypes.STRING,
    territory: DataTypes.STRING,
  },
  {
    timestamps: false,
  }
);

// Customer
export const Customer = sequelize.define(
  "customer",
  {
    customerNumber: {
      type: DataTypes.INTEGER,
      primaryKey: true,
    },
    customerName: DataTypes.STRING,
    contactLastName: DataTypes.STRING,
    contactFirstName: DataTypes.STRING,
    phone: DataTypes.STRING,
    addressLine1: DataTypes.STRING,
    addressLine2: DataTypes.STRING,
    city: DataTypes.STRING,
    state: DataTypes.STRING,
    postalCode: DataTypes.STRING,
    country: DataTypes.STRING,
    salesRepEmployeeNumber: DataTypes.INTEGER,
    creditLimit: DataTypes.FLOAT,
  },
  {
    timestamps: false,
  }
);

// Order
export const Order = sequelize.define(
  "order",
  {
    orderNumber: {
      type: DataTypes.INTEGER,
      primaryKey: true,
    },
    orderDate: DataTypes.DATE,
    requiredDate: DataTypes.DATE,
    shippedDate: DataTypes.DATE,
    status: DataTypes.STRING,
    comments: DataTypes.TEXT,
    customerNumber: DataTypes.INTEGER,
  },
  {
    timestamps: false,
  }
);

// Payment
export const Payment = sequelize.define(
  "payment",
  {
    customerNumber: DataTypes.INTEGER,
    checkNumber: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    paymentDate: DataTypes.DATE,
    amount: DataTypes.FLOAT,
    customerNumber: DataTypes.INTEGER,
  },
  {
    timestamps: false,
  }
);

ProductLine.hasMany(Product, { foreignKey: "productLine" });
Product.belongsTo(ProductLine, { foreignKey: "productLine" });

// Define associations between models
Product.hasMany(OrderDetail, { foreignKey: "productCode" });
OrderDetail.belongsTo(Product, { foreignKey: "productCode" });

Order.hasMany(OrderDetail, { foreignKey: "orderNumber" });
OrderDetail.belongsTo(Order, { foreignKey: "orderNumber" });

Employee.hasMany(Customer, { foreignKey: "salesRepEmployeeNumber" });
Customer.belongsTo(Employee, { foreignKey: "salesRepEmployeeNumber" });

Office.hasMany(Employee, { foreignKey: "officeCode" });
Employee.belongsTo(Office, { foreignKey: "officeCode" });

Customer.hasMany(Order, { foreignKey: "customerNumber" });
Order.belongsTo(Customer, { foreignKey: "customerNumber" });

Customer.hasMany(Payment, { foreignKey: "customerNumber" });
Payment.belongsTo(Customer, { foreignKey: "customerNumber" });

// Sync the model with the database
sequelize
  .sync()
  .then(() => {
    console.log("Database and tables are in sync");
  })
  .catch((error) => {
    console.error("Error syncing database:", error);
  });

export default {
  Order,
  OrderDetail,
  Payment,
  Product,
  ProductLine,
  Customer,
  Office,
  Employee,
};
