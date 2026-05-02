# ---- build stage ----
FROM golang:1.25 AS builder
WORKDIR /src

# Copy only module files first (better caching)
COPY go.mod go.sum ./
RUN go mod download


# Copy the rest of the source
COPY . .


# Build the binary from main.go at repo root
# - CGO_ENABLED=0: static-ish binary, good for distroless
# - GOOS/GOARCH: Linux amd64 for ECS (change to arm64 if using Graviton)
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 \
    go build -trimpath -ldflags="-s -w" -o /out/app .

# ---- runtime stage ----
FROM gcr.io/distroless/static-debian12:nonroot
WORKDIR /

COPY --from=builder /out/app /app

# Default port; your app should read PORT (or ignore if you hardcode 8080)
ENV PORT=8080
EXPOSE 8080

ENTRYPOINT ["/app"]
