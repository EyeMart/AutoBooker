package api

import (
	"log"
	"os"

	"github.com/resend/resend-go/v3"
)

func SendConfirmation(custEmail string, custName string) {
	apiKey := os.Getenv("Mail_Key")

	client := resend.NewClient(apiKey)

	params := &resend.SendEmailRequest{
		From:    "onboarding@resend.dev",
		To:      []string{custEmail},
		Subject: "Hello World",
		Text:    "Congrats on sending your first email!",
		Html:    "<p>Congrats on sending your <strong>first email</strong>!</p>",
	}

	sent, err := client.Emails.Send(params)
	if err != nil {
		log.Fatalf("failed to send email: %v", err)
	}

	log.Printf("email sent: %s", sent.Id)
}
