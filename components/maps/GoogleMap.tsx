"use client"

import { useEffect, useRef, useState } from "react"

interface GoogleMapProps {
  lat: number
  lng: number
  label?: string
  height?: string
  zoom?: number
}

// Custom Premium Dark Slate Styling for Google Maps
const darkMapStyles = [
  { elementType: "geometry", stylers: [{ color: "#0b0f19" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#8e9bb0" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#0b0f19" }] },
  {
    featureType: "administrative",
    elementType: "geometry.stroke",
    stylers: [{ color: "#1f293d" }]
  },
  {
    featureType: "landscape.natural",
    elementType: "geometry",
    stylers: [{ color: "#111827" }]
  },
  {
    featureType: "poi",
    elementType: "geometry",
    stylers: [{ visibility: "off" }]
  },
  {
    featureType: "poi",
    elementType: "labels.text",
    stylers: [{ visibility: "off" }]
  },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#1e293b" }]
  },
  {
    featureType: "road",
    elementType: "geometry.stroke",
    stylers: [{ color: "#0f172a" }]
  },
  {
    featureType: "road.highway",
    elementType: "geometry",
    stylers: [{ color: "#334155" }]
  },
  {
    featureType: "road.highway",
    elementType: "geometry.stroke",
    stylers: [{ color: "#1e293b" }]
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#030712" }]
  },
  {
    featureType: "water",
    elementType: "labels.text.fill",
    stylers: [{ color: "#4b5563" }]
  }
]

export default function GoogleMap({
  lat,
  lng,
  label = "Location",
  height = "300px",
  zoom = 13
}: GoogleMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<any>(null)
  const markerRef = useRef<any>(null)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    if (typeof window === "undefined") return

    if ((window as any).google && (window as any).google.maps) {
      setLoaded(true)
      return
    }

    const existingScript = document.getElementById("google-maps-api-script")
    if (existingScript) {
      const checkLoaded = setInterval(() => {
        if ((window as any).google?.maps) {
          clearInterval(checkLoaded)
          setLoaded(true)
        }
      }, 100)
      return
    }

    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
    if (!apiKey) {
      console.error("Missing Google Maps API Key")
      return
    }

    const script = document.createElement("script")
    script.id = "google-maps-api-script"
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}`
    script.async = true
    script.defer = true
    script.onload = () => setLoaded(true)
    document.head.appendChild(script)
  }, [])

  useEffect(() => {
    if (!loaded || !mapContainerRef.current || typeof window === "undefined") return

    const google = (window as any).google
    const centerPosition = { lat, lng }

    // Initialize Map with custom dark theme styling
    if (!mapRef.current) {
      mapRef.current = new google.maps.Map(mapContainerRef.current, {
        center: centerPosition,
        zoom,
        styles: darkMapStyles,
        disableDefaultUI: false,
        zoomControl: true,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: true
      })
    } else {
      mapRef.current.setCenter(centerPosition)
    }

    // Place or Move Marker
    if (markerRef.current) {
      markerRef.current.setPosition(centerPosition)
    } else {
      markerRef.current = new google.maps.Marker({
        position: centerPosition,
        map: mapRef.current,
        title: label,
        animation: google.maps.Animation.DROP
      })
    }
  }, [loaded, lat, lng, zoom, label])

  return (
    <div className="relative rounded-xl overflow-hidden border border-border/40 shadow-inner">
      <div ref={mapContainerRef} style={{ width: "100%", height }} />
      <div className="absolute bottom-2 left-2 bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-border/30 text-white text-xs font-semibold">
        📍 {label}: {lat.toFixed(4)}, {lng.toFixed(4)}
      </div>
    </div>
  )
}
