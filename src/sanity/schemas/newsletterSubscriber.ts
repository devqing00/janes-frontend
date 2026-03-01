const newsletterSubscriber = {
  name: "newsletterSubscriber",
  title: "Newsletter Subscriber",
  type: "document",
  fields: [
    {
      name: "email",
      title: "Email",
      type: "string",
      validation: (Rule: { required: () => unknown }) => Rule.required(),
    },
    {
      name: "subscribedAt",
      title: "Subscribed At",
      type: "datetime",
    },
  ],
};

export default newsletterSubscriber;
