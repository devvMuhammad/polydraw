package internal

import (
	"io"
	"log"
	"os"
	"time"
)

var Logger *log.Logger

// InitLogger initializes the logger with file and console output
func InitLogger() error {
	// Create logs directory if it doesn't exist
	if err := os.MkdirAll("logs", 0755); err != nil {
		return err
	}

	// Create log file with timestamp
	timestamp := time.Now().Format("2006-01-02")
	logFileName := "logs/server-" + timestamp + ".log"

	logFile, err := os.OpenFile(logFileName, os.O_CREATE|os.O_WRONLY|os.O_APPEND, 0666)
	if err != nil {
		return err
	}

	// Set up multi-writer to write to both file and console
	multiWriter := io.MultiWriter(os.Stdout, logFile)
	Logger = log.New(multiWriter, "", log.LstdFlags|log.Lshortfile)

	return nil
}

// LogInfo logs an info message
func LogInfo(format string, v ...interface{}) {
	if Logger != nil {
		Logger.Printf("[INFO] "+format, v...)
		IncrementLogMessage("info")
	}
}

// LogError logs an error message
func LogError(format string, v ...interface{}) {
	if Logger != nil {
		Logger.Printf("[ERROR] "+format, v...)
		IncrementLogMessage("error")
	}
}

// LogWarning logs a warning message
func LogWarning(format string, v ...interface{}) {
	if Logger != nil {
		Logger.Printf("[WARN] "+format, v...)
		IncrementLogMessage("warning")
	}
}

// LogDebug logs a debug message
func LogDebug(format string, v ...interface{}) {
	if Logger != nil {
		Logger.Printf("[DEBUG] "+format, v...)
		IncrementLogMessage("debug")
	}
}
