package store

import "database/sql"

type Store struct {
	DB *sql.DB
}

func NewDatabase(db *sql.DB) *Store {
	return &Store{DB: db}

}
