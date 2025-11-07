/**
 * Hook for managing address autocomplete state and validation
 */

import { useState, useCallback } from "react";
import type { AddressDetails } from "@/components/ui/address-autocomplete";
import { LocationSecurityValidator } from "@/lib/location-security-validator";
import { toast } from "sonner";

export interface AddressState {
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  coordinates: { latitude: number; longitude: number } | null;
}

export interface UseAddressAutocompleteOptions {
  initialAddress?: Partial<AddressState>;
  onAddressChange?: (address: AddressState) => void;
  validateOnChange?: boolean;
  showSuccessToast?: boolean;
}

export function useAddressAutocomplete({
  initialAddress = {},
  onAddressChange,
  validateOnChange = true,
  showSuccessToast = true,
}: UseAddressAutocompleteOptions = {}) {
  const [addressState, setAddressState] = useState<AddressState>({
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: "US",
    coordinates: null,
    ...initialAddress,
  });

  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [isValid, setIsValid] = useState(false);

  const validateAddress = useCallback(
    (address: AddressState): boolean => {
      if (!validateOnChange) return true;

      const validation = LocationSecurityValidator.validateLocationInput({
        address: address.address,
        city: address.city,
        state: address.state,
        zipCode: address.zipCode,
        country: address.country,
        coordinates: address.coordinates || undefined,
      });

      const errors = validation.errors
        .filter(
          (error) => error.severity === "high" || error.severity === "medium",
        )
        .map((error) => error.message);

      setValidationErrors(errors);
      setIsValid(validation.isValid && errors.length === 0);

      return validation.isValid && errors.length === 0;
    },
    [validateOnChange],
  );

  const updateAddress = useCallback(
    (updates: Partial<AddressState>) => {
      const newAddress = { ...addressState, ...updates };
      setAddressState(newAddress);

      if (validateOnChange) {
        validateAddress(newAddress);
      }

      onAddressChange?.(newAddress);
    },
    [addressState, onAddressChange, validateAddress, validateOnChange],
  );

  const handleAddressSelect = useCallback(
    (details: AddressDetails) => {
      const newAddress: AddressState = {
        address: details.address,
        city: details.city,
        state: details.state,
        zipCode: details.zipCode,
        country: details.country,
        coordinates: details.coordinates || null,
      };

      setAddressState(newAddress);

      if (validateOnChange) {
        const valid = validateAddress(newAddress);
        if (!valid) {
          toast.error("Selected address has validation issues");
          return;
        }
      }

      if (showSuccessToast) {
        toast.success("Address selected and details filled automatically!");
      }

      onAddressChange?.(newAddress);
    },
    [onAddressChange, validateAddress, validateOnChange, showSuccessToast],
  );

  const handleAddressChange = useCallback(
    (value: string) => {
      updateAddress({ address: value });
    },
    [updateAddress],
  );

  const clearAddress = useCallback(() => {
    const emptyAddress: AddressState = {
      address: "",
      city: "",
      state: "",
      zipCode: "",
      country: "US",
      coordinates: null,
    };

    setAddressState(emptyAddress);
    setValidationErrors([]);
    setIsValid(false);
    onAddressChange?.(emptyAddress);
  }, [onAddressChange]);

  const hasCompleteAddress = useCallback(() => {
    return !!(
      addressState.address &&
      addressState.city &&
      addressState.state &&
      addressState.zipCode
    );
  }, [addressState]);

  const getFormattedAddress = useCallback(() => {
    const parts = [
      addressState.address,
      addressState.city,
      addressState.state,
      addressState.zipCode,
    ].filter(Boolean);

    return parts.join(", ");
  }, [addressState]);

  return {
    // State
    addressState,
    validationErrors,
    isValid,

    // Actions
    updateAddress,
    handleAddressSelect,
    handleAddressChange,
    clearAddress,

    // Utilities
    hasCompleteAddress,
    getFormattedAddress,
    validateAddress: () => validateAddress(addressState),

    // Individual field handlers for convenience
    setAddress: (address: string) => updateAddress({ address }),
    setCity: (city: string) => updateAddress({ city }),
    setState: (state: string) => updateAddress({ state }),
    setZipCode: (zipCode: string) => updateAddress({ zipCode }),
    setCountry: (country: string) => updateAddress({ country }),
    setCoordinates: (
      coordinates: { latitude: number; longitude: number } | null,
    ) => updateAddress({ coordinates }),
  };
}
