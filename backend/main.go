package main

import (
	"log"
	"os"

	"github.com/EyeMart07/scheduler/internal/api"
	"github.com/EyeMart07/scheduler/internal/db"
	"github.com/EyeMart07/scheduler/internal/store"

	"github.com/gin-gonic/gin"
	_ "github.com/lib/pq"
)

func main() {

	db := db.Connect()

	// closes the connection once the program ends
	defer db.Close()

	st := store.NewDatabase(db)
	app := api.NewApp(st)

	// sets up the server
	router := gin.Default()
	app.RegisterEndpoints(router)

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	log.Println("Starting server on port:", port)

	router.Run("0.0.0.0:" + port)
}
