export default {
  name: "order",
  title: "Order",
  type: "document",
  fields: [
    {
      name: "reference",
      title: "Order Reference",
      type: "string",
      readOnly: true,
    },
    {
      name: "status",
      title: "Order Status",
      type: "string",
      options: {
        list: ["pending", "awaiting_payment", "success", "failed", "processing", "shipped", "delivered"],
      },
      initialValue: "pending",
    },
    {
      name: "paymentMethod",
      title: "Payment Method",
      type: "string",
      options: {
        list: ["paystack", "bank_transfer"],
      },
    },
    {
      name: "customerName",
      title: "Customer Name",
      type: "string",
    },
    {
      name: "customerEmail",
      title: "Customer Email",
      type: "string",
    },
    {
      name: "items",
      title: "Items",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            { name: "productId", title: "Product ID", type: "string" },
            { name: "name", title: "Product Name", type: "string" },
            { name: "price", title: "Unit Price", type: "number" },
            { name: "quantity", title: "Quantity", type: "number" },
            { name: "size", title: "Size", type: "string" },
            { name: "image", title: "Image URL", type: "string" },
          ],
        },
      ],
    },
    {
      name: "subtotal",
      title: "Subtotal",
      type: "number",
    },
    {
      name: "currency",
      title: "Currency",
      type: "string",
      initialValue: "NGN",
    },
    {
      name: "shippingAddress",
      title: "Shipping Address",
      type: "object",
      fields: [
        { name: "line1", title: "Address Line 1", type: "string" },
        { name: "line2", title: "Address Line 2", type: "string" },
        { name: "city", title: "City", type: "string" },
        { name: "state", title: "State / Province", type: "string" },
        { name: "country", title: "Country", type: "string" },
        { name: "postalCode", title: "Postal Code", type: "string" },
      ],
    },
    {
      name: "paidAt",
      title: "Paid At",
      type: "datetime",
    },
    {
      name: "shippingMethod",
      title: "Shipping Method",
      type: "object",
      fields: [
        { name: "name", title: "Name", type: "string" },
        { name: "price", title: "Price", type: "number" },
        { name: "estimatedDays", title: "Estimated Days", type: "string" },
      ],
    },
    {
      name: "note",
      title: "Customer Note",
      type: "text",
      description: "Optional note from the customer to the merchant",
    },
  ],
  orderings: [
    {
      title: "Newest First",
      name: "createdAtDesc",
      by: [{ field: "_createdAt", direction: "desc" }],
    },
  ],
};
