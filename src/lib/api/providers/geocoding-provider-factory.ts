/**
 * Factory for creating and managing geocoding providers
 */

import { env } from "@/env.js";
import type {
  GeocodingProvider,
  GeocodingProviderConfig,
} from "./geocoding-provider";
import { GoogleGeocodingProvider } from "./google-geocoding-provider";
import { LocationIQGeocodingProvider } from "./locationiq-geocoding-provider";

/**
 * Provider factory class
 */
export class GeocodingProviderFactory {
  private static providers: Map<string, GeocodingProvider> = new Map();

  /**
   * Get provider configuration from environment variables
   */
  static getConfig(): GeocodingProviderConfig {
    const googleApiKey = env.GOOGLE_MAPS_API_KEY;
    const locationiqApiKey = env.LOCATIONIQ_API_KEY;

    // Determine primary provider based on available API keys
    let primary = "google";
    let fallback: string | undefined;

    if (googleApiKey && locationiqApiKey) {
      // Both available - use Google as primary, LocationIQ as fallback
      primary = "google";
      fallback = "locationiq";
    } else if (locationiqApiKey) {
      // Only LocationIQ available
      primary = "locationiq";
    } else if (googleApiKey) {
      // Only Google available
      primary = "google";
    }

    return {
      primary,
      fallback,
      providers: {
        ...(googleApiKey && { google: { apiKey: googleApiKey } }),
        ...(locationiqApiKey && { locationiq: { apiKey: locationiqApiKey } }),
      },
    };
  }

  /**
   * Create a provider instance
   */
  static createProvider(
    name: string,
    config: GeocodingProviderConfig,
  ): GeocodingProvider | null {
    switch (name) {
      case "google":
        if (config.providers.google?.apiKey) {
          return new GoogleGeocodingProvider(config.providers.google.apiKey);
        }
        break;
      case "locationiq":
        if (config.providers.locationiq?.apiKey) {
          return new LocationIQGeocodingProvider(
            config.providers.locationiq.apiKey,
          );
        }
        break;
      default:
        console.warn(`Unknown geocoding provider: ${name}`);
        return null;
    }
    return null;
  }

  /**
   * Get or create a provider instance (singleton pattern)
   */
  static getProvider(name: string): GeocodingProvider | null {
    if (this.providers.has(name)) {
      return this.providers.get(name)!;
    }

    const config = this.getConfig();
    const provider = this.createProvider(name, config);

    if (provider) {
      this.providers.set(name, provider);
    }

    return provider;
  }

  /**
   * Get the primary provider
   */
  static getPrimaryProvider(): GeocodingProvider | null {
    const config = this.getConfig();
    return this.getProvider(config.primary);
  }

  /**
   * Get the fallback provider
   */
  static getFallbackProvider(): GeocodingProvider | null {
    const config = this.getConfig();
    return config.fallback ? this.getProvider(config.fallback) : null;
  }

  /**
   * Get all available providers
   */
  static getAvailableProviders(): string[] {
    const config = this.getConfig();
    return Object.keys(config.providers);
  }

  /**
   * Check if any provider is configured
   */
  static hasConfiguredProvider(): boolean {
    const config = this.getConfig();
    return Object.keys(config.providers).length > 0;
  }

  /**
   * Clear provider cache (useful for testing)
   */
  static clearCache(): void {
    this.providers.clear();
  }
}
