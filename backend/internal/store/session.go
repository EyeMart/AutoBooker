package store

import (
	"fmt"
)

type Session struct {
	Customer    string   `json:"customer"`
	SessionHash [32]byte `json:"session_hash"`
}

func (s *Store) CheckAuth(token [32]byte) string {

	row := s.DB.QueryRow("SELECT customer FROM sessions WHERE session_hash=$1", token[:])
	var customer string
	if err := row.Scan(&customer); err != nil {
		fmt.Println(err)
		return ""
	}
	return customer
}

func (s *Store) CreateSession(session Session) error {

	// begins a transaction
	tx, err := s.DB.Begin()
	if err != nil {
		tx.Rollback()
		return err
	}

	// attempts to execute the query
	_, err = tx.Exec("INSERT INTO sessions(customer, session_hash) VALUES($1, $2)", session.Customer, session.SessionHash[:])

	if err != nil {
		tx.Rollback()
		return err
	}

	// attempts to commit the transaction if the query succeeds
	err = tx.Commit()

	if err != nil {
		return err
	}
	return nil

}
