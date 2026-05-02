package db

import (
	"database/sql"
	"log"
	"os"

	"github.com/joho/godotenv"
)

func Connect() (*sql.DB, error) {
	// loads the .env file
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, relying on environment variables")
	}

	// gets the connection string from the .env file and creates a connection to the database
	connectionString := os.Getenv("DATABASE_URL")
	db, err := sql.Open("postgres", connectionString)
	if err != nil {
		return nil, err
	}

	// ensures the connection is successful
	if err := db.Ping(); err != nil {
		return nil, err
	}

	return db, err
}
