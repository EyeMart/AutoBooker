package api

import (
	"net/http"
	"os"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func (a *App) RegisterEndpoints(router *gin.Engine) {
	router.Use(cors.New(cors.Config{
		AllowOrigins: []string{"http://localhost:5173",
			os.Getenv("FRONTEND_URL"),
		},
		AllowMethods:     []string{"GET", "POST", "OPTIONS", "PUT", "DELETE"},
		AllowHeaders:     []string{"Content-Type"},
		AllowCredentials: true,
	}))

	router.POST("/api/appointments", a.CreateAppointment)
	router.DELETE("/api/appointments/:id", a.DeleteAppointment)
	router.PUT("/api/appointments/:id", a.ChangeAppointment)
	router.GET("/api/appointments/:id", a.GetSpecificAppointment)
	router.GET("/api/admin/appointments", a.CheckAuth, a.CheckAdmin, a.GetAppointments)
	router.GET("/api/unavailableslots", a.GetTimeSlots)

	router.POST("/api/register", a.SignUp)
	router.POST("/api/signin", a.SignIn)
	router.GET("/api/role", a.CheckAuth, a.GetRole)

	router.GET("/api/health", func(c *gin.Context) {
		c.IndentedJSON(http.StatusOK, gin.H{"message": "ok"})
	})
}
