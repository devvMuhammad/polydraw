package internal

import (
	"net/http"
	"strconv"
	"time"
)

type responseWriter struct {
	http.ResponseWriter
	statusCode int
}

func (rw *responseWriter) WriteHeader(code int) {
	rw.statusCode = code
	rw.ResponseWriter.WriteHeader(code)
}

func InstrumentedHandler(endpoint string, handler http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		start := time.Now()

		// For WebSocket endpoints, don't wrap the response writer to avoid hijacking issues
		if endpoint == "/ws" {
			handler(w, r)
			duration := time.Since(start).Seconds()
			// Use 200 as default status for WebSocket upgrades since we can't easily capture it
			IncrementHTTPRequest(r.Method, endpoint, "200")
			ObserveHTTPDuration(r.Method, endpoint, duration)
			return
		}

		// Create a response writer wrapper to capture status code for non-WebSocket endpoints
		wrapper := &responseWriter{ResponseWriter: w, statusCode: http.StatusOK}

		handler(wrapper, r)

		duration := time.Since(start).Seconds()
		statusCode := wrapper.statusCode

		IncrementHTTPRequest(r.Method, endpoint, strconv.Itoa(statusCode))
		ObserveHTTPDuration(r.Method, endpoint, duration)
	}
}
