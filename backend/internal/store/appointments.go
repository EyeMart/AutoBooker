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
	Notes     string `json:"notes"`
	FirstName string `json:"first_name"`
	LastName  string `json:"last_name"`
	Email     string `json:"email"`
	Phone     string `json:"phone"`
	Address   string `json:"address"`
	Make      string `json:"make"`
	Model     string `json:"model"`
	Year      int    `json:"year"`
	Mileage   int    `json:"mileage"`
	Date      string `json:"date"`
	Start     string `json:"start_time"`
	End       string `json:"end_time"`
}

func parseRows(rows *sql.Rows) ([]Appointment, error) {
	defer rows.Close()

	appointments := []Appointment{}
	for rows.Next() {
		var app Appointment
		if err := rows.Scan(&app.Notes, &app.FirstName, &app.LastName, &app.Email, &app.Phone, &app.Address, &app.Make, &app.Model, &app.Year, &app.Mileage, &app.Date, &app.Start, &app.End); err != nil {
			return appointments, err
		}
		appointments = append(appointments, app)
	}
	return appointments, nil
}

func buildAppointmentQuery(queried AppointmentArguments) (string, []any) {
	q := `SELECT notes, first_name, last_name, email, phone, address, make, model, year, mileage, date, start_time, end_time FROM appointments`

	where := []string{}
	args := []any{}

	add := func(cond string, val any) {
		args = append(args, val)
		where = append(where, fmt.Sprintf(cond, len(args)))
	}

	if queried.ToDate != nil && queried.FromDate != nil {
		add("date >= $%d", *queried.FromDate)
		add("date <= $%d", *queried.ToDate)
	} else if queried.FromDate != nil {
		add("date = $%d", *queried.FromDate)
	}

	if len(where) > 0 {
		q += " WHERE " + strings.Join(where, " AND ")
	}

	q += " ORDER BY start_time ASC"

	return q, args
}

func (s *Store) GetAppointments(queried AppointmentArguments) ([]Appointment, error) {

	query, args := buildAppointmentQuery(queried)

	rows, err := s.DB.Query(query, args...)

	if err != nil {
		return nil, err
	}
	defer rows.Close()

	return parseRows(rows)
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
	_, err = tx.Exec("UPDATE appointments SET notes=$1, first_name=$2, last_name=$3, email=$4, phone=$5, address=$6, make=$7, model=$8, year=$9 mileage=$10, date=$11, start_time=$12, end_time=$13 WHERE id=$14", id, changes.Notes, changes.FirstName, changes.LastName, changes.Email, changes.Phone, changes.Address, changes.Make, changes.Model, changes.Year, changes.Mileage, changes.Date, changes.Start, changes.End, id)

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
	_, err = tx.Exec("INSERT INTO appointments(notes, first_name, last_name, email, phone, address, make, model, year, mileage, date, start_time, end_time) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)", app.Notes, app.FirstName, app.LastName, app.Email, app.Phone, app.Address, app.Make, app.Model, app.Year, app.Mileage, app.Date, app.Start, app.End)

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
	row := s.DB.QueryRow("SELECT id FROM appointments WHERE email=$1 AND date=$2 AND start_time=$3 AND end_time=$4", app.Email, app.Date, app.Start, app.End)

	var appId string
	if err := row.Scan(&appId); err != nil {
		return "", err
	}

	return appId, nil
}
