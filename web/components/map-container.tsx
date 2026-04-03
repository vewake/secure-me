import React, { useEffect, useRef } from 'react';

interface Location {
  latitude: number;
  longitude: number;
  createdAt: string;
}

interface MapContainerProps {
  locations: Location[];
  className?: string;
  zoom?: number;
  showPath?: boolean;
  mapplsApiKey?: string;
}

export function MapContainer({
  locations,
  className,
  zoom = 12,
  showPath = false,
  mapplsApiKey = process.env.NEXT_PUBLIC_MAPPLS_API_KEY ?? ""
}: MapContainerProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);

  useEffect(() => {
    if (!mapplsApiKey) {
      console.error("MapContainer: NEXT_PUBLIC_MAPPLS_API_KEY is not set. Map will not load.");
      return;
    }
    // Load Mappls script dynamically
    if (!document.getElementById('mappls-script')) {
      const script = document.createElement('script');
      script.id = 'mappls-script';
      script.src = `https://apis.mappls.com/advancedmaps/v1/${mapplsApiKey}/map_sdk?v=3.0&layer=vector`;
      script.async = true;

      script.onload = () => {
        // Add a slight delay to ensure Mappls is fully initialized
        setTimeout(() => {
          initMap();
        }, 100);
      };

      document.body.appendChild(script);
    } else {
      // If script is already loaded, initialize map directly
      initMap();
    }

    function initMap() {
      if (!mapRef.current || !locations.length) return;

      // Make sure Mappls SDK is available
      if (!window.mappls) {
        console.error("Mappls SDK not loaded");
        return;
      }

      try {
        // Create map
        const mapOptions = {
          center: { lat: locations[0].latitude, lng: locations[0].longitude },
          zoom: zoom
        };

        // Create map instance using the documented API
        const mapplsMap = new window.mappls.Map(mapRef.current, mapOptions);
        mapInstanceRef.current = mapplsMap;

        // Wait for map to load completely before adding markers
        mapplsMap.on('load', function () {
          // Create a single info window that will be reused
          let infoWindow = null;

          try {
            // Check if InfoWindow constructor exists
            if (window.mappls.InfoWindow) {
              infoWindow = new window.mappls.InfoWindow();
            }
          } catch (err) {
            console.warn("InfoWindow not available:", err);
          }

          // Add markers for each location
          locations.forEach((location, i) => {
            try {
              const marker = new window.mappls.Marker({
                position: { lat: location.latitude, lng: location.longitude },
                map: mapplsMap,
                title: `Location Point ${i + 1} Location at ${new Date(location.createdAt).toLocaleString()}`

              });

              // Create info content
              const infoContent = `
                <div style="padding: 10px;">
                  <p><strong>Time:</strong> ${new Date(location.createdAt).toLocaleString()}</p>
                  <p><strong>Coordinates:</strong> ${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}</p>
                </div>
              `;

              // Add click event to marker to show info
              if (infoWindow) {
                marker.addListener('click', function () {
                  infoWindow.setContent(infoContent);
                  infoWindow.open(mapplsMap, marker);
                });
              }
            } catch (err) {
              console.error("Error adding marker:", err);
            }
          });

          // Draw path between points if requested
          if (showPath && locations.length > 1) {
            try {
              const pathCoordinates = locations.map(loc => ({
                lat: loc.latitude,
                lng: loc.longitude
              }));

              new window.mappls.Polyline({
                path: pathCoordinates,
                strokeColor: "#FF0000",
                strokeOpacity: 0.8,
                strokeWeight: 3,
                map: mapplsMap
              });
            } catch (err) {
              console.error("Error creating path:", err);
            }
          }
        });
      } catch (err) {
        console.error("Error initializing map:", err);
      }
    }

    // Clean up function
    return () => {
      // Clean up if needed
      mapInstanceRef.current = null;
    };
  }, [locations, zoom, showPath, mapplsApiKey]);

  return (
    <div
      ref={mapRef}
      className={className || "w-full h-96"}
      style={{ width: '100%', height: '400px' }}
      id="map-container"
    />
  );
}

// Type declaration for Mappls SDK
declare global {
  interface Window {
    mappls: any;
  }
}
