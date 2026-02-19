package api

import (
	"context"
	"os"
	"strconv"
	"strings"
	"sync"
	"time"

	"github.com/EyeMart07/scheduler/internal/store"
	"github.com/mailgun/mailgun-go/v4"
)

type Reminder struct {
	Email     string `json:"email"`
	FirstName string `json:"firstname"`
	LastName  string `json:"lastname"`
	Date      string `json:"date"`
	Start     string `json:"start"`
	End       string `json:"end"`
}

func parseTime(time string) (string, error) {
	timeOfDay := "AM"

	hour, err := strconv.Atoi(time[11:13])
	if err != nil {
		return "", err
	}

	if hour >= 12 {
		timeOfDay = "PM"
	}

	if hour > 12 {
		hour = hour - 12
	}

	min := time[14:16]

	hourString := strconv.Itoa(hour)

	return hourString + ":" + min + " " + timeOfDay, nil
}

func parseDateTime(reminder Reminder) (string, error) {
	data := make([]string, 0)

	monthNum, err := strconv.Atoi(reminder.Date[8:10])

	if err != nil {
		return "", err
	}

	data = append(data, time.Month(monthNum).String())
	data = append(data, reminder.Date[5:7])
	data = append(data, reminder.Date[:4]+",")

	start, err := parseTime(reminder.Start)
	if err != nil {
		return "", err
	}

	end, err := parseTime(reminder.End)
	if err != nil {
		return "", err
	}

	data = append(data, start+" - "+end)

	return strings.Join(data, " "), nil
}

func sendEmail(reminder Reminder, apiKey string) error {
	datetime, err := parseDateTime(reminder)

	if err != nil {
		return err
	}
	domain := "sandbox30085ac1dbf242148d56f8eeac919f29.mailgun.org"

	mg := mailgun.NewMailgun(domain, apiKey)

	m := mg.NewMessage(
		"Motion Auto Body <do-not-reply@"+domain+">",
		"Appointment Reminder",
		"Hello "+reminder.FirstName+",\n\n We are reaching out to remind you of your upcoming appointment on:\n\n"+datetime+"\n\n We look forward to seeing you!\n\nMotion Auto Body",
		reminder.FirstName+" "+reminder.LastName+" <"+reminder.Email+">",
	)

	ctx, cancel := context.WithTimeout(context.Background(), time.Second*30)
	defer cancel()

	_, _, err = mg.Send(ctx, m)
	return err
}

func (a *App) SendReminder(date string) ([]Reminder, error) {
	apps, err := a.Store.GetAppointments(store.AppointmentArguments{
		FromDate: &date,
		ToDate:   nil,
	})

	if err != nil {
		return nil, err
	}

	reminders := make(chan Reminder)
	results := make(chan Reminder, len(apps))
	var wg sync.WaitGroup

	workerCount := 2

	apiKey := os.Getenv("MAIL_API")
	if apiKey == "" {
		apiKey = "MAIL_API"
	}

	// Start workers
	for i := 0; i < workerCount; i++ {
		wg.Add(1)
		go func() {
			defer wg.Done()
			for reminder := range reminders {
				if err := sendEmail(reminder, apiKey); err != nil {
					// if an error occurs add it to the results channel
					results <- reminder
				}
			}
		}()
	}

	// add emails to the channel
	for _, appointment := range apps {
		reminders <- Reminder{
			Email:     appointment.Email,
			FirstName: appointment.FirstName,
			LastName:  appointment.LastName,
			Date:      appointment.Date,
			Start:     appointment.Start,
			End:       appointment.End,
		}
	}

	close(reminders)
	wg.Wait()

	close(results)

	failed := make([]Reminder, 0)
	for r := range results {
		failed = append(failed, r)
	}

	if len(failed) > 0 {
		return failed, nil
	}

	return nil, nil
}
