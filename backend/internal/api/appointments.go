package api

import (
	"fmt"
	"net/http"
	"strconv"

	"github.com/EyeMart07/scheduler/internal/store"
	"github.com/gin-gonic/gin"
)

type ChangeAppointmentReqs struct {
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
	Timeslot     string `json:"timeslot"`
	Service      string `json:"service"`
}

type CreateAppointmentReqs struct {
	CustComments string `json:"customer_comments"`
	EmplNotes    string `json:"employee_notes"`
	FirstName    string `json:"first_name"`
	LastName     string `json:"last_name"`
	Email        string `json:"email"`
	Phone        string `json:"phone"`
	Make         string `json:"make"`
	Model        string `json:"model"`
	Year         string `json:"year"`
	Mileage      int    `json:"mileage"`
	Date         string `json:"date"`
	Timeslot     string `json:"timeslot"`
	Service      string `json:"service"`
}

/*
Returns appointments on a given day

accepted queries:
fromDate, toDate : enables queries on a range of dates
*/
func (a *App) GetAppointments(c *gin.Context) {
	toDate := c.Query("to")
	fromDate := c.Query("from")
	app, err := a.Store.GetAppointments(store.AppointmentArguments{
		FromDate: &fromDate,
		ToDate:   &toDate,
	})

	if err != nil {
		fmt.Println(err)
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
	var changes ChangeAppointmentReqs
	// gets the appointment data from the request
	if err := c.BindJSON(&changes); err != nil {
		fmt.Println(err)
		c.IndentedJSON(http.StatusBadRequest, gin.H{"message": "invalid appointment data"})
		return
	}

	email, phone, err := a.Store.ChangeAppointment(id, store.Appointment{
		CustComments: changes.CustComments,
		EmplNotes:    changes.EmplNotes,
		FirstName:    changes.FirstName,
		LastName:     changes.LastName,
		Email:        changes.Email,
		Phone:        changes.Phone,
		Make:         changes.Make,
		Model:        changes.Model,
		Year:         changes.Year,
		Mileage:      changes.Mileage,
		Date:         changes.Date,
		TimeSlot:     changes.Timeslot,
		Service:      changes.Service,
	})

	if err != nil || (email == "" && phone == "") {

		fmt.Println(err)
		c.IndentedJSON(http.StatusBadRequest, gin.H{"message": "error updating appointment"})
		return
	}

	// SEND CONFIRMATION HERE
	c.IndentedJSON(http.StatusOK, gin.H{"message": "successfully updated"})
}

func (a *App) CreateAppointment(c *gin.Context) {
	var newApp CreateAppointmentReqs

	// gets the appointment data from the request
	if err := c.BindJSON(&newApp); err != nil {
		c.IndentedJSON(http.StatusBadRequest, gin.H{"message": "invalid appointment data"})
		fmt.Println(err)
		return
	}

	year, err := strconv.Atoi(newApp.Year)
	if err != nil {
		c.IndentedJSON(http.StatusBadRequest, gin.H{"message": "invalid appointment data"})
		return
	}

	id, err := a.Store.CreateAppointment(store.Appointment{
		CustComments: newApp.CustComments,
		FirstName:    newApp.FirstName,
		LastName:     newApp.LastName,
		Email:        newApp.Email,
		Phone:        newApp.Phone,
		Make:         newApp.Make,
		Model:        newApp.Model,
		Year:         year,
		Mileage:      newApp.Mileage,
		Date:         newApp.Date,
		TimeSlot:     newApp.Timeslot,
		Service:      newApp.Service,
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
