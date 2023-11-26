import { Op } from "sequelize";
import { v4 as uuidv4 } from "uuid";
import { createObjectCsvWriter } from "csv-writer";
import fs from "fs";
import path from "path";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

import {
  Order,
  OrderDetail,
  Payment,
  Product,
  ProductLine,
  Customer,
  Office,
  Employee,
} from "./models/productLine.js";

function formatOrderDetails(orderDetails) {
  return orderDetails.map((order) => {
    const formattedOrder = {
      orderNumber: order.orderdetails[0].orderNumber,
      orderDate: order.orderDate,
      shippedDate: order.shippedDate,
      status: order.status,
      customerName: order.customer.customerName,
      creditLimit: order.customer.creditLimit,
      orderDetails: order.orderdetails.map((orderDetail) => ({
        quantityOrdered: orderDetail.quantityOrdered,
        priceEach: orderDetail.priceEach,
        productName: orderDetail.product.productName,
        productLine: orderDetail.product.productLine,
      })),

      EmployeeName:
        order.customer.employee.firstName +
        " " +
        order.customer.employee.lastName,

      officeCode: order.customer.employee.office.officeCode,
      officeAddress: order.customer.employee.office.addressLine1,
      city: order.customer.employee.office.city,
      country: order.customer.employee.office.country, // Note: Corrected case
    };

    return formattedOrder;
  });
}

async function createOrderPDF(Data) {
  const orderData = Data[0];
  console.log(orderData);
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([1300, 1600]);
  const { width, height } = page.getSize();

  // Add content to the PDF
  page.drawText("Order Details", {
    x: width / 2.4,
    y: height - 100,
    color: rgb(0, 0, 0),
    size: 50,
    font: await pdfDoc.embedFont(StandardFonts.HelveticaBold),
  });

  // Add order information
  page.drawText(`Order Number: ${orderData.orderNumber}`, {
    x: 50,
    y: height - 150,
    color: rgb(0, 0, 0),
  });
  page.drawText(`Order Date: ${orderData.orderDate}`, {
    x: 700,
    y: height - 150,
    color: rgb(0, 0, 0),
  });

  page.drawText(`Customer Name: ${orderData.customerName}`, {
    x: 50,
    y: height - 190,
    color: rgb(0, 0, 0),
  });
  page.drawText(`Credit Limit: ${orderData.creditLimit}`, {
    x: 700,
    y: height - 190,
    color: rgb(0, 0, 0),
  });

  page.drawText(`Shipped Date: ${orderData.shippedDate}`, {
    x: 50,
    y: height - 230,
    color: rgb(0, 0, 0),
  });
  page.drawText(`Status: ${orderData.status}`, {
    x: 700,
    y: height - 230,
    color: rgb(0, 0, 0),
  });
  page.drawText(`Employee Name: ${orderData.EmployeeName}`, {
    x: 50,
    y: height - 270,
    color: rgb(0, 0, 0),
  });
  page.drawText(`Office Location: ${orderData.officeAddress}`, {
    x: 700,
    y: height - 270,
    color: rgb(0, 0, 0),
  });

  // Add order details

  page.drawText("Order Items:", {
    x: 50,
    y: height - 310,
    color: rgb(0, 0, 0),
    size: 26,
    font: await pdfDoc.embedFont(StandardFonts.HelveticaBold),
  });

  page.drawText(`Product Name`, {
    x: 50,
    y: height - 350,
    color: rgb(0, 0, 0),
  });

  page.drawText(`Number of Quantity`, {
    x: 530,
    y: height - 350,
    color: rgb(0, 0, 0),
  });
  page.drawText(`Price`, {
    x: 850,
    y: height - 350,
    color: rgb(0, 0, 0),
  });
  page.drawText(`Total`, {
    x: 1050,
    y: height - 350,
    color: rgb(0, 0, 0),
  });

  let total = 0;
  let yOffset = height - 350;
  // Check if orderDetails is defined and is an array
  if (Array.isArray(orderData.orderDetails)) {
    orderData.orderDetails.forEach((item) => {
      total += item.priceEach * item.quantityOrdered;
      yOffset -= 40;
      page.drawText(`${item.productName}`, {
        x: 50,
        y: yOffset,
        color: rgb(0, 0, 0),
      });
      page.drawText(`${item.quantityOrdered}`, {
        x: 600,
        y: yOffset,
        color: rgb(0, 0, 0),
      });
      page.drawText(`${item.priceEach}`, {
        x: 850,
        y: yOffset,
        color: rgb(0, 0, 0),
      });
      page.drawText(`${(item.priceEach * item.quantityOrdered).toFixed(2)}`, {
        x: 1050,
        y: yOffset,
        color: rgb(0, 0, 0),
      });
    });
    page.drawText(`________`, {
      x: 1050,
      y: yOffset - 10,
      color: rgb(0, 0, 0),
    });

    page.drawText(`$${total}`, {
      x: 1050,
      y: yOffset - 40,
      color: rgb(0, 0, 0),
    });
    page.drawText(`________`, {
      x: 1050,
      y: yOffset - 40,
      color: rgb(0, 0, 0),
    });
  } else {
    console.error("orderDetails is not defined or not an array");
  }

  // Save the PDF to a file
  const pdfBytes = await pdfDoc.save();
  const fileName = `Orders/Order_${orderData.orderNumber}.pdf`;
  fs.writeFileSync(fileName, pdfBytes);

  console.log(`PDF created successfully: ${fileName}`);
  return fileName;
}

export const getProducts = async function (req, res) {
  try {
    const pro = await Product.findAll({
      where: {
        buyPrice: {
          [Op.gt]: 60,
        },
      },
    });

    const filename = `products/products_${uuidv4()}.csv`;
    // Create a CSV writer
    const csvWriter = createObjectCsvWriter({
      path: filename,
      header: [
        { id: "productCode", title: "Product Code" },
        { id: "productName", title: "Product Name" },
        { id: "productScale", title: "Product Scale" },
        { id: "productVendor", title: "Product Vendor" },
        { id: "productDescription", title: "Product Description" },
        { id: "quantityInStock", title: "Quantity In Stock" },
        { id: "buyPrice", title: "Buy Price" },
        { id: "MSRP", title: "MSRP" },
      ],
    });
    // Write the products to the CSV file
    csvWriter
      .writeRecords(pro)
      .then(() => {
        res.send(`CSV file ${filename} has been written successfully`);
      })
      .catch((error) => {
        res.status(500).send("Internal Server Error");
      });
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).send("Internal Server Error");
  }
};

export const getCsv = (req, res) => {
  const { uuid } = req.body;
  console.log(uuid);
  // Get the directory name using import.meta.url
  const currentModuleUrl = new URL(import.meta.url);
  const currentDir = path.dirname(currentModuleUrl.pathname);

  console.log(currentDir);

  // Construct the file path based on the UUID and the directory where the CSV files are stored
  const filePath = path.join(currentDir, "products", `products_${uuid}.csv`);

  console.log(filePath);

  if (fs.existsSync(filePath)) {
    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=products_${uuid}.csv`
    );

    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);

    fileStream.on("end", () => {
      fs.unlinkSync(filePath);
    });
    fileStream.on("error", (error) => {
      console.error("Error streaming CSV file:", error);
      res.status(500).send("Internal Server Error");
    });
  } else {
    res.status(404).send("File not found");
  }
};

export const orderDetail = async (req, res) => {
  const { customerNumber } = req.body;

  const orderDetailOfCustomer = await Order.findAll({
    attributes: ["orderDate", "shippedDate", "status"],
    where: {
      orderNumber: customerNumber,
    },
    include: [
      {
        model: Customer,
        attributes: ["customerNumber", "customerName", "creditLimit"],
        include: [
          {
            model: Payment,
            attributes: ["paymentDate", "amount"],
          },
          {
            model: Employee,
            attributes: ["firstName", "lastName"],
            include: [
              {
                model: Office,
                attributes: ["officeCode", "addressLine1", "city", "country"],
              },
            ],
          },
        ],
      },

      {
        model: OrderDetail,
        attributes: ["orderNumber", "quantityOrdered", "priceEach"],
        include: [
          {
            model: Product,
            attributes: ["productName", "buyPrice", "productLine"],
          },
        ],
      },
    ],
  });

  const formattedOrders = formatOrderDetails(orderDetailOfCustomer);
  const result = await createOrderPDF(formattedOrders);
  const filePath = "/home/raja/JavaScript/Express/csv/" + result;

  res.sendFile(filePath);
};

export const mergePdf = async (req, res) => {
  try {
    const { order1, order2 } = req.files;
    console.log(req.files);
    const pdf1Path = "/home/raja/JavaScript/Express/csv/Orders/Order_10104.pdf";
    const pdf2Path = "/home/raja/JavaScript/Express/csv/Orders/Order_10105.pdf";

    const pdf1Buffer = fs.readFileSync(pdf1Path);
    const pdf2Buffer = fs.readFileSync(pdf2Path);

    const pdfDoc1 = await PDFDocument.load(pdf1Buffer);
    const pdfDoc2 = await PDFDocument.load(pdf2Buffer);

    const mergedPdf = await PDFDocument.create();

    const pages1 = await mergedPdf.copyPages(pdfDoc1, pdfDoc1.getPageIndices());
    for (const page of pages1) {
      mergedPdf.addPage(page);
    }

    const pages2 = await mergedPdf.copyPages(pdfDoc2, pdfDoc2.getPageIndices());
    for (const page of pages2) {
      mergedPdf.addPage(page);
    }

    const mergedPdfBytes = await mergedPdf.save();

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "inline; filename=merged.pdf");
    res.send(Buffer.from(mergedPdfBytes));
  } catch (error) {
    console.error("Error merging PDFs:", error);
    res.status(500).send("Error merging PDFs");
  }
};

export default { getProducts, getCsv, mergePdf, orderDetail };
