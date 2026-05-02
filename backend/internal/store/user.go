package store

import (
	"fmt"

	"golang.org/x/crypto/bcrypt"
)

type User struct {
	FirstName string `json:"first_name"`
	LastName  string `json:"last_name"`
	Email     string `json:"email"`
	Password  string `json:"password_hash"`
}

type AuthReq struct {
	Email    string `json:"email"`
	Password string `json:"password_hash"`
}

type AuthResp struct {
	Customer string `json:"id"`
	Password string `json:"password_hash"`
}

func (s *Store) GetRole(user string) string {
	var role string
	row := s.DB.QueryRow("SELECT role FROM users WHERE id=$1 AND role='admin'", user)

	if err := row.Scan(&role); err != nil {
		return role
	}

	return role
}

// returns the user id if the log in is successful
func (s *Store) Authorize(credentials AuthReq) string {

	var user AuthResp
	row := s.DB.QueryRow("SELECT id, password_hash FROM users WHERE email=$1", credentials.Email)

	if err := row.Scan(&user.Customer, &user.Password); err != nil {
		return ""
	}

	attempt := []byte(credentials.Password)
	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), attempt); err != nil {
		fmt.Println(err)
		return ""
	}

	return user.Customer
}

// cretes a user and returns the associated id in the table
func (s *Store) CreateUser(user User) (string, error) {

	// begins a transaction
	tx, err := s.DB.Begin()
	if err != nil {
		tx.Rollback()
		return "", err
	}

	// formats the query with the given data
	// attempts to execute the query
	_, err = tx.Exec("INSERT INTO users(first_name, last_name, email, password_hash) VALUES($1, $2, $3, $4)", user.FirstName, user.LastName, user.Email, user.Password)

	if err != nil {
		tx.Rollback()
		return "", err
	}

	// attempts to commit the transaction if the query succeeds
	err = tx.Commit()

	if err != nil {
		return "", err
	}

	row := s.DB.QueryRow("SELECT id from users where email=$1", user.Email)

	var customerId string
	if err := row.Scan(&customerId); err != nil {
		return "", err
	}

	return customerId, nil
}
