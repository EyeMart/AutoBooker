package api

import (
	"crypto/rand"
	"crypto/sha256"
	"encoding/base64"
	"fmt"
	"net/http"
	"strings"
	"time"

	"github.com/EyeMart07/scheduler/internal/store"
	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"
)

// requirements to sign in
type SignUpReq struct {
	FirstName string `json:"first_name"`
	LastName  string `json:"last_name"`
	Email     string `json:"email"`
	Password  string `json:"password"`
}

// requirements to sign in
type AuthReq struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

// creates a session cookie, adds it to the database and adds it to your cookies
func (a *App) setSessionCookie(c *gin.Context, customerId string) (string, error) {
	// generate a random byte array
	b := make([]byte, 32) // 256-bit
	if _, err := rand.Read(b); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "error signing in"})
		return "", err
	}

	// encode that byte array to it is cookie safe
	raw := base64.RawURLEncoding.EncodeToString(b)
	// hash that cookie for added security in the database
	hash := sha256.Sum256([]byte(raw))

	// create a session entry in the database
	if err := a.Store.CreateSession(store.Session{
		Customer:    customerId,
		SessionHash: hash,
	}); err != nil {
		return "", err
	}

	// sets the cookie with your session id
	http.SetCookie(c.Writer, &http.Cookie{
		Name:     "session",
		Value:    raw,
		Path:     "/",
		HttpOnly: true,
		Secure:   false, //SET TO TRUE IN PROD
		SameSite: http.SameSiteLaxMode,
		Expires:  time.Now().Add(7 * 24 * time.Hour),
	})

	return a.Store.GetRole(customerId), nil
}

func (a *App) GetRole(c *gin.Context) {
	user, exists := c.Get("user")
	fmt.Println(user)
	if !exists {
		c.IndentedJSON(http.StatusUnauthorized, gin.H{"error": "not logged in"})
		return
	}

	role := a.Store.GetRole(fmt.Sprintf("%v", user))
	fmt.Println(role)
	c.IndentedJSON(http.StatusOK, gin.H{"role": role})

}

// checks if the use associated in context is of admin role
func (a *App) CheckAdmin(c *gin.Context) {
	user, exists := c.Get("user")
	if !exists {
		c.AbortWithStatus(http.StatusUnauthorized) //user doesn't exist
		return
	}

	if role := a.Store.GetRole(fmt.Sprintf("%v", user)); role != "admin" {
		c.AbortWithStatus(http.StatusUnauthorized) //user doesn't exist
		return
	}

	c.Next()
}

// checks if the user has a valid session id
func (a *App) CheckAuth(c *gin.Context) {
	token, err := c.Cookie("session")
	fmt.Println(token)
	if err != nil {
		c.AbortWithStatus(http.StatusUnauthorized) //user is not authorized
		return
	}

	// hash the session id in the cookies
	hash := sha256.Sum256([]byte(token))

	// if there exists a valid session entry, set the user id in context
	if userid := a.Store.CheckAuth(hash); userid != "" {
		fmt.Println(userid)
		c.Set("user", userid)
		c.Next()
		return
	}
	c.AbortWithStatus(http.StatusUnauthorized) //user is not authorized
}

// creates a new user and then automatically signs that user in
func (a *App) SignUp(c *gin.Context) {
	var req SignUpReq

	if err := c.BindJSON(&req); err != nil {
		c.IndentedJSON(http.StatusBadRequest, gin.H{"error": "invalid request"})
		return
	}

	// normalize email and password
	email := strings.TrimSpace(strings.ToLower(req.Email))
	password := req.Password

	if len(email) == 0 || !strings.Contains(email, "@") {
		c.JSON(400, gin.H{"error": "invalid email"})
		return
	}
	if len(password) < 12 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "password must be at least 12 characters"})
		return
	}

	// hash password
	bytes, err := bcrypt.GenerateFromPassword([]byte(password), 14)

	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "error hashing password"})
		return
	}

	// creates a new user in the table
	var customerId string
	customerId, err = a.Store.CreateUser(store.User{
		FirstName: req.FirstName,
		LastName:  req.LastName,
		Email:     email,
		Password:  string(bytes), //passes the hashed password
	})

	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "error creating account"})
		return
	}

	// logs in the user by creating a new session
	role, err := a.setSessionCookie(c, customerId)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "error creating session"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "account successfully created",
		"role":    role,
	})
}

// signs in an existing user
func (a *App) SignIn(c *gin.Context) {
	var credentials AuthReq

	if err := c.BindJSON(&credentials); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "error signing in"})
		fmt.Println(err)
		return
	}

	// authorize the credentials
	customerId := a.Store.Authorize(store.AuthReq{
		Email:    credentials.Email,
		Password: credentials.Password,
	})

	// if no the credentials do not match any users return an error
	if customerId == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid credentials"})
		return
	}

	// set a new session cookie
	role, err := a.setSessionCookie(c, customerId)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "error creating session"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "successfully logged in",
		"role":    role,
	})

	//otherwise set cookies and add to session
}
