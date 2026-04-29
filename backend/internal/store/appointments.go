package store

import (
	"database/sql"
	"fmt"
	"strings"
)

type AppointmentArguments struct {
	FromDate *string `json:"from_date"`
	ToDate   *string `json:"to_date"`
}

type Appointment struct {
	Id           string `json:"id"`
	CustComments string `json:"customer_comments"`
	EmplNotes    string `json:"employee_notes"`
	FirstName    string `json:"first_name"`
	LastName     string `json:"last_name"`
	Email        string `json:"email"`
	Phone        string `json:"phone"`
	Make         string `json:"make"`
	Model        string `json:"model"`
	Year         int    `json:"year"`
	Mileage      int    `json:"mileage"`
	Date         string `json:"date"`
	TimeSlot     string `json:"timeslot"`
	Service      string `json:"service"`
}

func parseRows(rows *sql.Rows) ([]Appointment, error) {
	defer rows.Close()

	appointments := []Appointment{}
	for rows.Next() {
		var app Appointment
		if err := rows.Scan(&app.Id, &app.CustComments, &app.EmplNotes, &app.FirstName, &app.LastName, &app.Email, &app.Phone, &app.Make, &app.Model, &app.Year, &app.Mileage, &app.Date, &app.TimeSlot, &app.Service); err != nil {
			return appointments, err
		}
		appointments = append(appointments, app)
	}
	return appointments, nil
}

func buildAppointmentQuery(queried AppointmentArguments) (string, []any) {
	q := `SELECT id, customer_comments, employee_notes, first_name, last_name, email, phone, make, model, year, mileage, date, timeslot, service FROM appointments`

	where := []string{}
	args := []any{}

	add := func(cond string, val any) {
		args = append(args, val)
		where = append(where, fmt.Sprintf(cond, len(args)))
	}

	if *queried.ToDate != "" && *queried.FromDate != "" {
		add("date >= $%d", *queried.FromDate)
		add("date <= $%d", *queried.ToDate)
	} else if *queried.FromDate != "" {
		add("date = $%d", *queried.FromDate)
	}

	if len(where) > 0 {
		q += " WHERE " + strings.Join(where, " AND ")
	}

	q += " ORDER BY timeslot ASC"

	return q, args
}

func (s *Store) GetAppointments(queried AppointmentArguments) ([]Appointment, error) {

	query, args := buildAppointmentQuery(queried)

	fmt.Println(query)
	fmt.Println(args...)

	rows, err := s.DB.Query(query, args...)

	if err != nil {
		fmt.Println(err)
		return nil, err
	}
	defer rows.Close()

	return parseRows(rows)
}

func (s *Store) GetSpecificAppointment(id string) (*Appointment, error) {

	query := `SELECT customer_comments, employee_notes, first_name, last_name, email, phone, make, model, year, mileage, date, timeslot, service FROM appointments where id=$1`

	fmt.Println(query)

	row := s.DB.QueryRow(query, id)

	var app Appointment
	if err := row.Scan(&app.CustComments, &app.EmplNotes, &app.FirstName, &app.LastName, &app.Email, &app.Phone, &app.Make, &app.Model, &app.Year, &app.Mileage, &app.Date, &app.TimeSlot, &app.Service); err != nil {
		return nil, err
	}

	return &app, nil
}

func (s *Store) GetTimeSlots(onDate string) ([]string, error) {

	query := "SELECT timeslot FROM appointments where date=$1"

	rows, err := s.DB.Query(query, onDate)

	if err != nil {
		fmt.Println(err)
		return nil, err
	}
	defer rows.Close()

	timeslots := []string{}
	for rows.Next() {
		var time string
		if err := rows.Scan(&time); err != nil {
			return timeslots, err
		}
		timeslots = append(timeslots, time)
	}
	return timeslots, nil
}

func (s *Store) ChangeAppointment(id string, changes Appointment) (string, string, error) {
	tx, err := s.DB.Begin()
	if err != nil {
		tx.Rollback()
		return "", "", err
	}

	row := s.DB.QueryRow("SELECT email, phone FROM appointments WHERE id=$1", id)

	var email string
	var phone string
	if err := row.Scan(&email, &phone); err != nil {
		return "", "", err
	}

	// formats the query with the given data
	_, err = tx.Exec("UPDATE appointments SET customer_comments=$1, first_name=$2, last_name=$3, email=$4, phone=$5, make=$6, model=$7, year=$8, mileage=$9, date=$10, timeslot=$11, service=$12, employee_notes=$13 WHERE id=$14", changes.CustComments, changes.FirstName, changes.LastName, changes.Email, changes.Phone, changes.Make, changes.Model, changes.Year, changes.Mileage, changes.Date, changes.TimeSlot, changes.Service, changes.EmplNotes, id)

	if err != nil {
		tx.Rollback()
		return "", "", err
	}

	// attempts to commit the transaction if the query succeeds
	err = tx.Commit()

	if err != nil {
		return "", "", err
	}
	return email, phone, nil
}

func (s *Store) DeleteAppointment(id string) (string, string, error) {
	tx, err := s.DB.Begin()
	if err != nil {
		tx.Rollback()
		return "", "", err
	}

	row := s.DB.QueryRow("SELECT email, phone FROM appointments WHERE id=$1", id)

	var email string
	var phone string
	if err := row.Scan(&email, &phone); err != nil {
		return "", "", err
	}

	// formats the query with the given data
	_, err = tx.Exec("DELETE FROM appointments WHERE id=$1", id)

	if err != nil {
		tx.Rollback()
		return "", "", err
	}

	// attempts to commit the transaction if the query succeeds
	err = tx.Commit()

	if err != nil {
		return "", "", err
	}
	return email, phone, nil
}

func (s *Store) CreateAppointment(app Appointment) (string, error) {
	// begins a transaction
	tx, err := s.DB.Begin()
	if err != nil {
		tx.Rollback()
		return "", err
	}

	fmt.Println(app)

	// formats the query with the given data
	_, err = tx.Exec("INSERT INTO appointments(customer_comments, first_name, last_name, email, phone, make, model, year, mileage, date, timeslot, service) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)", app.CustComments, app.FirstName, app.LastName, app.Email, app.Phone, app.Make, app.Model, app.Year, app.Mileage, app.Date, app.TimeSlot, app.Service)

	if err != nil {
		tx.Rollback()
		return "", err
	}

	// attempts to commit the transaction if the query succeeds
	err = tx.Commit()

	if err != nil {
		return "", err
	}

	// gets the appointment id to send a confirmation and allow the user to update or cancel an appointment later
	row := s.DB.QueryRow("SELECT id FROM appointments WHERE email=$1 AND date=$2 AND timeslot=$3", app.Email, app.Date, app.TimeSlot)

	var appId string
	if err := row.Scan(&appId); err != nil {
		return "", err
	}

	return appId, nil
}
