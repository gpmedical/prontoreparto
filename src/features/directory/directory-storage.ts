import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

import type { DirectoryPreferences } from "./types";

const STORAGE_KEY_PREFIX = "pronto-reparto.directory.v1";

export function getDirectoryStorageKey(userId: string): string {
  if (!/^[\w.-]+$/.test(userId)) {
    throw new Error("The Clerk user ID cannot be used as a SecureStore key.");
  }

  return `${STORAGE_KEY_PREFIX}.${userId}`;
}

function getWebStorage(): Storage | null {
  if (Platform.OS !== "web" || typeof globalThis.localStorage === "undefined") {
    return null;
  }

  return globalThis.localStorage;
}

async function readStorageValue(key: string): Promise<string | null> {
  if (await SecureStore.isAvailableAsync()) {
    return SecureStore.getItemAsync(key);
  }

  return getWebStorage()?.getItem(key) ?? null;
}

async function writeStorageValue(key: string, value: string): Promise<void> {
  if (await SecureStore.isAvailableAsync()) {
    await SecureStore.setItemAsync(key, value);
    return;
  }

  const webStorage = getWebStorage();
  if (!webStorage) {
    throw new Error("Persistent storage is not available on this platform.");
  }

  webStorage.setItem(key, value);
}

async function deleteStorageValue(key: string): Promise<void> {
  if (await SecureStore.isAvailableAsync()) {
    await SecureStore.deleteItemAsync(key);
    return;
  }

  const webStorage = getWebStorage();
  if (!webStorage) {
    throw new Error("Persistent storage is not available on this platform.");
  }

  webStorage.removeItem(key);
}

function isDirectoryPreferences(value: unknown): value is DirectoryPreferences {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const preferences = value as Record<string, unknown>;

  return (
    preferences.version === 1 &&
    typeof preferences.selectedHospitalId === "string" &&
    Array.isArray(preferences.favoriteContactIds) &&
    preferences.favoriteContactIds.every((contactId) => typeof contactId === "string")
  );
}

export async function loadDirectoryPreferences(
  userId: string,
): Promise<DirectoryPreferences | null> {
  const storedValue = await readStorageValue(getDirectoryStorageKey(userId));

  if (!storedValue) {
    return null;
  }

  try {
    const parsedValue: unknown = JSON.parse(storedValue);
    return isDirectoryPreferences(parsedValue) ? parsedValue : null;
  } catch {
    return null;
  }
}

export async function saveDirectoryPreferences(
  userId: string,
  preferences: DirectoryPreferences,
): Promise<void> {
  await writeStorageValue(
    getDirectoryStorageKey(userId),
    JSON.stringify(preferences),
  );
}

export async function deleteDirectoryPreferences(userId: string): Promise<void> {
  await deleteStorageValue(getDirectoryStorageKey(userId));
}
