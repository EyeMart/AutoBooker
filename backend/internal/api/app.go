package api

import "github.com/EyeMart07/scheduler/internal/store"

type App struct {
	Store *store.Store
}

func NewApp(st *store.Store) *App {
	return &App{Store: st}
}
