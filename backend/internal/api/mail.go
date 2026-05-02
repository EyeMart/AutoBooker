package api

import (
	"log"
	"os"

	"github.com/resend/resend-go/v3"
)

func SendConfirmation(custEmail string, custName string, service string, date string, time string, make string, model string, year string, id string) {
	apiKey := os.Getenv("Mail_Key")

	client := resend.NewClient(apiKey)

	link := os.Getenv("FRONTEND_URL") + id

	email := `<body style="margin:0; padding:0; font-family: Arial, sans-serif; background:#f4f4f4;">
			<div style="max-width:600px; margin:0 auto; background:#ffffff; padding:24px;">
			
			<h2 style="margin-top:0; color:#222;">Appointment Confirmed</h2>

			<p style="font-size:16px; color:#333;">
				Hi ` + custName + `,
			</p>

			<p style="font-size:16px; color:#333;">
				Thank you for scheduling your appointment with Motion Auto Works. Your booking has been confirmed.
			</p>

			<div style="background:#f8f9fa; border:1px solid #ddd; border-radius:8px; padding:16px; margin:24px 0;">
				<h3 style="margin-top:0; color:#222;">Appointment Details</h3>

				<p><strong>Service:</strong> ` + service + `</p>
				<p><strong>Date:</strong> ` + date + `</p>
				<p><strong>Time:</strong> ` + time + `</p>
				<p><strong>Vehicle:</strong> ` + year + ` ` + make + ` ` + model + `</p>
			</div>

			<p style="font-size:14px; color:#555;">
				Need to make a change? You can use the button below.
			</p>
			
			<div style="text-align:center; margin:28px 0;">
				<a href="` + link + `"
				style="background:#2563eb; color:#ffffff; text-decoration:none; padding:12px 20px; border-radius:6px; display:inline-block; font-weight:bold;">
				Manage Appointment
				</a>
			</div>

			<p style="font-size:14px; color:#555;">
				Or copy and paste this link:<br />
				<a href="` + link + `">
					` + link + `
				</a>
			</p>

			<hr style="border:none; border-top:1px solid #ddd; margin:24px 0;" />

			<p style="font-size:14px; color:#777;">
				(661) 437-2419<br />
			</p>
			
			<a href="` + os.Getenv("FRONTEND_URL") + `" target="_blank">
				<img 
					src="https://fdcvaxgfxaufgkyvmwow.supabase.co/storage/v1/object/public/images/motion.png" 
					alt="Motion Auto Works"
					style="width:100%; max-width:600px; height:auto;"
				/>
			</a>
			</div>
		</body>`

	params := &resend.SendEmailRequest{
		From:    "onboarding@resend.dev",
		To:      []string{custEmail},
		Subject: "Appointment Confirmation",
		Text:    "Congrats on sending your first email!",
		Html:    email,
	}

	sent, err := client.Emails.Send(params)
	if err != nil {
		log.Fatalf("failed to send email: %v", err)
	}

	log.Printf("email sent: %s", sent.Id)
}
