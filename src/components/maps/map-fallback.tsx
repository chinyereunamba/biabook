/**
 * Fallback component when maps fail to load
 */

"use client";

import { useState } from "react";
import type { Coordinates } from "@/types/location";

export interface MapFallbackProps {
  address?: string;
  coordinates?: Coordinates;
  className?: string;
  showDirections?: boolean;
}

/**
 * Map fallback component with address display and directions
 */
export function MapFallback({
  address,
  coordinates,
  className = "",
  showDirections = true,
}: MapFallbackProps) {
  const [isGettingDirections, setIsGettingDirections] = useState(false);

  const handleGetDirections = () => {
    if (!coordinates && !address) return;

    setIsGettingDirections(true);

    // Create directions URL
    let directionsUrl = "";

    if (coordinates) {
      directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${coordinates.latitude},${coordinates.longitude}`;
    } else if (address) {
      directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`;
    }

    // Open in new tab
    window.open(directionsUrl, "_blank", "noopener,noreferrer");

    setTimeout(() => setIsGettingDirections(false), 1000);
  };

  const handleCopyAddress = async () => {
    if (!address) return;

    try {
      await navigator.clipboard.writeText(address);
      // Could show a toast notification here
    } catch (error) {
      console.error("Failed to copy address:", error);
    }
  };

  return (
    <div
      className={`rounded-lg border border-gray-200 bg-gray-50 p-6 ${className}`}
    >
      <div className="mb-4 flex items-center">
        <svg
          className="mr-2 h-6 w-6 text-gray-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
        <h3 className="text-lg font-medium text-gray-800">
          Location Information
        </h3>
      </div>

      {address && (
        <div className="mb-4">
          <p className="mb-2 text-gray-700">Address:</p>
          <div className="flex items-center justify-between rounded-md border border-gray-200 bg-white p-3">
            <span className="text-gray-900">{address}</span>
            <button
              onClick={handleCopyAddress}
              className="ml-2 p-1 text-gray-500 transition-colors hover:text-gray-700"
              title="Copy address"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
            </button>
          </div>
        </div>
      )}

      {coordinates && (
        <div className="mb-4">
          <p className="mb-2 text-gray-700">Coordinates:</p>
          <div className="rounded-md border border-gray-200 bg-white p-3">
            <span className="font-mono text-sm text-gray-900">
              {coordinates.latitude.toFixed(6)},{" "}
              {coordinates.longitude.toFixed(6)}
            </span>
          </div>
        </div>
      )}

      {showDirections && (coordinates || address) && (
        <div className="flex space-x-3">
          <button
            onClick={handleGetDirections}
            disabled={isGettingDirections}
            className="flex items-center rounded-md bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isGettingDirections ? (
              <svg
                className="mr-2 h-4 w-4 animate-spin"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            ) : (
              <svg
                className="mr-2 h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                />
              </svg>
            )}
            Get Directions
          </button>

          <button
            onClick={() =>
              window.open(
                `https://www.google.com/maps/search/?api=1&query=${coordinates?.latitude || address}`,
                "_blank",
              )
            }
            className="flex items-center rounded-md bg-gray-600 px-4 py-2 text-white transition-colors hover:bg-gray-700"
          >
            <svg
              className="mr-2 h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
              />
            </svg>
            Open in Maps
          </button>
        </div>
      )}

      <div className="mt-4 rounded-md border border-blue-200 bg-blue-50 p-3">
        <p className="text-sm text-blue-800">
          <svg
            className="mr-1 inline h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          Maps are temporarily unavailable. You can still get directions using
          the buttons above.
        </p>
      </div>
    </div>
  );
}
