const customer = {
  name: "customer",
  title: "Customer",
  type: "document",
  fields: [
    {
      name: "firebaseUid",
      title: "Firebase UID",
      type: "string",
      description: "Unique identifier from Firebase Auth",
      readOnly: true,
    },
    {
      name: "email",
      title: "Email",
      type: "string",
    },
    {
      name: "displayName",
      title: "Display Name",
      type: "string",
    },
    {
      name: "photoURL",
      title: "Photo URL",
      type: "url",
    },
    {
      name: "firstName",
      title: "First Name",
      type: "string",
    },
    {
      name: "lastName",
      title: "Last Name",
      type: "string",
    },
    {
      name: "phone",
      title: "Phone",
      type: "string",
    },
    {
      name: "address",
      title: "Address",
      type: "string",
    },
    {
      name: "city",
      title: "City",
      type: "string",
    },
    {
      name: "state",
      title: "State / Province",
      type: "string",
    },
    {
      name: "country",
      title: "Country",
      type: "string",
    },
    {
      name: "wishlist",
      title: "Wishlist",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            { name: "productId", type: "string", title: "Product ID" },
            { name: "name", type: "string", title: "Name" },
            { name: "slug", type: "string", title: "Slug" },
            { name: "price", type: "number", title: "Price" },
            { name: "image", type: "string", title: "Image URL" },
          ],
        },
      ],
    },
  ],
  preview: {
    select: { title: "displayName", subtitle: "email" },
  },
};

export default customer;
