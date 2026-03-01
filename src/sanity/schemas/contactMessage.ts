const contactMessage = {
  name: "contactMessage",
  title: "Contact Message",
  type: "document",
  fields: [
    {
      name: "name",
      title: "Name",
      type: "string",
    },
    {
      name: "email",
      title: "Email",
      type: "string",
    },
    {
      name: "subject",
      title: "Subject",
      type: "string",
    },
    {
      name: "message",
      title: "Message",
      type: "text",
    },
    {
      name: "read",
      title: "Read",
      type: "boolean",
      initialValue: false,
    },
  ],
  preview: {
    select: {
      title: "name",
      subtitle: "subject",
    },
  },
};

export default contactMessage;
