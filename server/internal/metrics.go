package internal

import (
	"github.com/prometheus/client_golang/prometheus"
	"github.com/prometheus/client_golang/prometheus/promauto"
)

// Define Prometheus metrics for the Polydraw server
var (
	// HTTP metrics
	HTTPRequestsTotal = promauto.NewCounterVec(
		prometheus.CounterOpts{
			Name: "polydraw_http_requests_total",
			Help: "Total number of HTTP requests",
		},
		[]string{"method", "endpoint", "status_code"},
	)

	HTTPRequestDuration = promauto.NewHistogramVec(
		prometheus.HistogramOpts{
			Name:    "polydraw_http_request_duration_seconds",
			Help:    "Duration of HTTP requests in seconds",
			Buckets: prometheus.DefBuckets,
		},
		[]string{"method", "endpoint"},
	)

	// WebSocket metrics
	WebSocketConnectionsActive = promauto.NewGauge(
		prometheus.GaugeOpts{
			Name: "polydraw_websocket_connections_active",
			Help: "Current number of active WebSocket connections",
		},
	)

	WebSocketConnectionsTotal = promauto.NewCounter(
		prometheus.CounterOpts{
			Name: "polydraw_websocket_connections_total",
			Help: "Total number of WebSocket connections established",
		},
	)

	WebSocketMessagesReceived = promauto.NewCounterVec(
		prometheus.CounterOpts{
			Name: "polydraw_websocket_messages_received_total",
			Help: "Total number of WebSocket messages received",
		},
		[]string{"message_type"},
	)

	WebSocketMessagesSent = promauto.NewCounter(
		prometheus.CounterOpts{
			Name: "polydraw_websocket_messages_sent_total",
			Help: "Total number of WebSocket messages sent (broadcasts)",
		},
	)

	WebSocketErrors = promauto.NewCounterVec(
		prometheus.CounterOpts{
			Name: "polydraw_websocket_errors_total",
			Help: "Total number of WebSocket errors",
		},
		[]string{"error_type"},
	)

	// Player metrics
	PlayersActive = promauto.NewGauge(
		prometheus.GaugeOpts{
			Name: "polydraw_players_active",
			Help: "Current number of active players (completed join process)",
		},
	)

	PlayersJoinedTotal = promauto.NewCounter(
		prometheus.CounterOpts{
			Name: "polydraw_players_joined_total",
			Help: "Total number of players who have joined",
		},
	)

	PlayersLeftTotal = promauto.NewCounter(
		prometheus.CounterOpts{
			Name: "polydraw_players_left_total",
			Help: "Total number of players who have left",
		},
	)

	// Drawing activity metrics
	DrawEventsTotal = promauto.NewCounter(
		prometheus.CounterOpts{
			Name: "polydraw_draw_events_total",
			Help: "Total number of draw events",
		},
	)

	PathEventsTotal = promauto.NewCounter(
		prometheus.CounterOpts{
			Name: "polydraw_path_events_total",
			Help: "Total number of path drawing events",
		},
	)

	ClearEventsTotal = promauto.NewCounter(
		prometheus.CounterOpts{
			Name: "polydraw_clear_events_total",
			Help: "Total number of canvas clear events",
		},
	)

	PathPointsTotal = promauto.NewCounter(
		prometheus.CounterOpts{
			Name: "polydraw_path_points_total",
			Help: "Total number of points drawn in all paths",
		},
	)

	// Hub channel metrics
	HubChannelSize = promauto.NewGaugeVec(
		prometheus.GaugeOpts{
			Name: "polydraw_hub_channel_size",
			Help: "Current size of hub channels",
		},
		[]string{"channel_type"},
	)

	// Log metrics
	LogMessagesTotal = promauto.NewCounterVec(
		prometheus.CounterOpts{
			Name: "polydraw_log_messages_total",
			Help: "Total number of log messages",
		},
		[]string{"level"},
	)
)

// Helper functions to update metrics
func IncrementHTTPRequest(method, endpoint, statusCode string) {
	HTTPRequestsTotal.WithLabelValues(method, endpoint, statusCode).Inc()
}

func ObserveHTTPDuration(method, endpoint string, duration float64) {
	HTTPRequestDuration.WithLabelValues(method, endpoint).Observe(duration)
}

func IncrementWebSocketConnection() {
	WebSocketConnectionsTotal.Inc()
	WebSocketConnectionsActive.Inc()
}

func DecrementWebSocketConnection() {
	WebSocketConnectionsActive.Dec()
}

func IncrementWebSocketMessage(messageType string) {
	WebSocketMessagesReceived.WithLabelValues(messageType).Inc()
}

func IncrementWebSocketMessageSent() {
	WebSocketMessagesSent.Inc()
}

func IncrementWebSocketError(errorType string) {
	WebSocketErrors.WithLabelValues(errorType).Inc()
}

func SetActivePlayersCount(count float64) {
	PlayersActive.Set(count)
}

func IncrementPlayerJoined() {
	PlayersJoinedTotal.Inc()
}

func IncrementPlayerLeft() {
	PlayersLeftTotal.Inc()
}

func IncrementDrawEvent() {
	DrawEventsTotal.Inc()
}

func IncrementPathEvent() {
	PathEventsTotal.Inc()
}

func IncrementClearEvent() {
	ClearEventsTotal.Inc()
}

func AddPathPoints(count float64) {
	PathPointsTotal.Add(count)
}

func SetHubChannelSize(channelType string, size float64) {
	HubChannelSize.WithLabelValues(channelType).Set(size)
}

func IncrementLogMessage(level string) {
	LogMessagesTotal.WithLabelValues(level).Inc()
}
