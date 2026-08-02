import { createServerFn } from "@tanstack/react-start";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendEnquiryEmail = createServerFn({ method: "POST" })
  .validator(
    (params: { name: string; email: string; phone: string; service: string; message: string }) =>
      params,
  )
  .handler(async ({ data: { name, email, phone, service, message } }) => {
    try {
      const htmlContent = `
        <h2>New Website Enquiry Received</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone}</p>
        <p><strong>Service Requested:</strong> ${service}</p>
        <p><strong>Message:</strong></p>
        <p style="white-space: pre-wrap; background-color: #f5f5f5; padding: 15px; border-radius: 5px;">${message}</p>
        <hr />
        <p style="font-size: 12px; color: #888;">This email was sent automatically from the Studio Young Designs website contact form.</p>
      `;

      // Send to both emails in parallel
      const [res1, res2] = await Promise.all([
        resend.emails.send({
          from: "Studio Young Designs <contact@studioyoungdesigns.com>",
          to: "youngdesigns9@gmail.com",
          subject: `New Enquiry from ${name} — Studio Young Designs`,
          html: htmlContent,
        }),
        resend.emails.send({
          from: "Studio Young Designs <contact@studioyoungdesigns.com>",
          to: "info@studioyoungdesigns.com",
          subject: `New Enquiry from ${name} — Studio Young Designs`,
          html: htmlContent,
        }),
      ]);

      return { success: true, ids: [res1.data?.id, res2.data?.id] };
    } catch (error: any) {
      console.error("Error sending email via Resend:", error);
      return { success: false, error: error.message };
    }
  });
