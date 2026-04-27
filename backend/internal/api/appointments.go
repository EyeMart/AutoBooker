package api

import (
	"fmt"
	"net/http"
	"strconv"
	"strings"

	"github.com/EyeMart07/scheduler/internal/store"
	"github.com/gin-gonic/gin"
)

type AppointmentReqs struct {
	Notes     string `json:"notes"`
	FirstName string `json:"first_name"`
	LastName  string `json:"last_name"`
	Email     string `json:"email"`
	Phone     string `json:"phone"`
	Make      string `json:"make"`
	Model     string `json:"model"`
	Year      string `json:"year"`
	Mileage   int    `json:"mileage"`
	Date      string `json:"date"`
	Timeslot  string `json:"timeslot"`
	Service   string `json:"service"`
}

/*
Returns appointments on a given day

accepted queries:
fromDate, toDate : enables queries on a range of dates
*/
func (a *App) GetAppointments(c *gin.Context) {
	toDate := c.Query("to_date")
	fromDate := c.Query("to")
	app, err := a.Store.GetAppointments(store.AppointmentArguments{
		FromDate: &fromDate,
		ToDate:   &toDate,
	})

	if err != nil {
		c.IndentedJSON(http.StatusNotFound, gin.H{"error": "not found"})
		return
	}

	c.IndentedJSON(http.StatusOK, app)

}

func (a *App) DeleteAppointment(c *gin.Context) {
	id := c.Param("id")

	email, phone, err := a.Store.DeleteAppointment(id)

	if err != nil {
		c.IndentedJSON(http.StatusBadRequest, gin.H{"message": "error deleting appointment"})
		return
	}
	if email == "" && phone == "" {
		c.IndentedJSON(http.StatusNotFound, gin.H{"message": "appointment doesn't exist"})
		return
	}

	// SEND CONFIRMATION HERE
	c.IndentedJSON(http.StatusOK, gin.H{"message": "successfully deleted"})
}

func (a *App) ChangeAppointment(c *gin.Context) {
	id := c.Param("id")
	var changes AppointmentReqs
	// gets the appointment data from the request
	if err := c.BindJSON(&changes); err != nil {
		c.IndentedJSON(http.StatusBadRequest, gin.H{"message": "invalid appointment data"})
		return
	}

	start := strings.Split(changes.Timeslot, " - ")[0][:5] + ":00"
	end := strings.Split(changes.Timeslot, " - ")[1][:5] + ":00"
	year, _ := strconv.Atoi(changes.Year)

	email, phone, err := a.Store.ChangeAppointment(id, store.Appointment{
		Notes:     changes.Notes,
		FirstName: changes.FirstName,
		LastName:  changes.LastName,
		Email:     changes.Email,
		Phone:     changes.Phone,
		Make:      changes.Make,
		Model:     changes.Model,
		Year:      year,
		Mileage:   changes.Mileage,
		Date:      changes.Date,
		Start:     start,
		End:       end,
	})

	if err != nil || (email == "" && phone == "") {
		c.IndentedJSON(http.StatusBadRequest, gin.H{"message": "error updating appointment"})
		return
	}

	// SEND CONFIRMATION HERE
	c.IndentedJSON(http.StatusOK, gin.H{"message": "successfully updated"})
}

func (a *App) CreateAppointment(c *gin.Context) {
	var newApp AppointmentReqs

	// gets the appointment data from the request
	if err := c.BindJSON(&newApp); err != nil {
		c.IndentedJSON(http.StatusBadRequest, gin.H{"message": "invalid appointment data"})
		fmt.Println(err)
		return
	}

	start := strings.Split(newApp.Timeslot, " - ")[0][:5] + ":00"
	end := strings.Split(newApp.Timeslot, " - ")[1][:5] + ":00"
	year, _ := strconv.Atoi(newApp.Year)

	id, err := a.Store.CreateAppointment(store.Appointment{
		Notes:     newApp.Notes,
		FirstName: newApp.FirstName,
		LastName:  newApp.LastName,
		Email:     newApp.Email,
		Phone:     newApp.Phone,
		Make:      newApp.Make,
		Model:     newApp.Model,
		Year:      year,
		Mileage:   newApp.Mileage,
		Date:      newApp.Date,
		Start:     start,
		End:       end,
	})

	if id == "" || err != nil {
		c.IndentedJSON(http.StatusBadRequest, gin.H{"message": "error creating appointment"})
		fmt.Println(err)

		return
	}
	// return the created status
	SendConfirmation(newApp.Email, newApp.FirstName)
	c.IndentedJSON(http.StatusCreated, newApp)
}
