# Pronto Reparto - AI Coding Instructions

## Project Overview

Pronto Reparto is a cross-platform React Native mobile app for hospitals in Italy. It acts as an internal switchboard and phonebook: users choose a hospital, search for departments or on-call roles, and quickly call, bleep, or email the right contact.

Core use cases:

- Select a hospital at the top of the app and persist that preference between sessions.
- Search contacts such as `Cardiology`, `Anaesthetist on call`, wards, departments, services, and internal roles.
- Display phone numbers, bleep/pager numbers, extensions, and email addresses.
- For phone contacts, call directly from the device, including the hospital-specific external prefix when needed.
- For email contacts, open the user's email composer.
- Let users save favourite contacts.
- Let users suggest contacts to add or update.

The app is intended for practical internal hospital workflows. Keep interfaces fast, clear, and sparse.

## Required Expo Documentation

Expo has changed. Before writing or changing code, read the exact versioned Expo SDK 57 documentation:

https://docs.expo.dev/versions/v57.0.0/

This project currently uses Expo SDK 57 with React Native 0.86 and React 19.2. Use `npx expo install` for Expo-managed package additions so dependency versions stay compatible with SDK 57.

## Current Stack

- React Native with Expo SDK 57
- Expo Router for navigation
- TypeScript
- Nativewind for styling
- Supabase for database and backend data
- BetterAuth for authentication
- React Native platform APIs or Expo SDK modules where appropriate

Prefer Expo-compatible libraries and check SDK 57 compatibility before adding dependencies.

## Product Model

Treat these as the main domain concepts:

- Hospital: the selected institution. Store the selected hospital between sessions.
- Contact: a searchable entry belonging to a hospital.
- Department or service: clinical or administrative grouping, such as Cardiology, Radiology, ICU, Switchboard.
- Role contact: time-sensitive role entries such as Anaesthetist on call or Bed manager.
- Contact method: phone, extension, bleep/pager, email, or notes.
- Favourite: user-saved contact shortcut.
- Suggestion: user-submitted proposed contact addition or correction.

Italian hospital context matters. Use terms and data shapes that can support wards, departments, internal extensions, on-call roles, bleeps, and multi-site hospital organizations.

## UX and Design Direction

- Primary colour: teal.
- Visual style: minimal, flat, clean, and practical.
- Prioritize search speed, readability, and one-tap actions.
- Keep screens dense enough for clinical use, without decorative marketing layouts.
- Favourites and recent/important contacts should be easy to reach.
- Make hospital selection visible and persistent, but do not let it dominate the screen.
- Phone, bleep, and email actions should be obvious and accessible.
- Avoid heavy gradients, ornamental cards, and playful visuals.

## Data and Privacy Expectations

Hospital contact data may be operationally sensitive even if it is not patient data. Code accordingly:

- Do not hard-code real hospital contact lists, private emails, credentials, or secrets.
- Keep Supabase keys and BetterAuth secrets in environment/configuration files that are not committed.
- Use row-level security and role-aware access patterns when implementing Supabase tables.
- Treat user suggestions as untrusted input that requires validation and moderation.
- Avoid logging contact data, auth tokens, or user-identifying information unnecessarily.

## Implementation Preferences

- Follow the existing Expo Router project structure under `src/app`.
- Keep TypeScript types explicit for domain models and API boundaries.
- Prefer small, composable components over large screen files.
- Use Nativewind utility classes consistently once configured.
- Use Supabase client helpers rather than ad hoc fetch calls for Supabase data.
- Use BetterAuth patterns consistently for session state and protected actions.
- Use platform-safe linking APIs for phone calls and email composition.
- Persist lightweight preferences such as selected hospital locally.
- Keep offline or loading states useful: empty search, no hospital selected, no contacts, and failed network requests should all be handled.

## Commands

Common project commands:

```bash
pnpm install
pnpm start
pnpm android
pnpm ios
pnpm web
```

Use `pnpm` as the preferred package manager. Before changing dependencies, avoid introducing `package-lock.json` churn and keep `pnpm-lock.yaml` as the source of dependency lock state.

Do not run lint commands in this project. Never run `pnpm lint`, `npm run lint`, `npx eslint`, `eslint`, or any Expo lint/eslint wrapper, because lint tooling has repeatedly modified dependencies and created local package-manager problems.

## Testing and Verification

When code changes are made:

- Run the narrowest relevant verification first.
- Do not run lint or eslint. Prefer TypeScript checks or targeted runtime verification instead.
- For UI work, verify at least one mobile-sized viewport/device path.
- For calling and email actions, verify generated URLs and graceful handling when the device cannot open them.
- For persistence, verify selected hospital and favourites survive app restart.

Do not build new features without checking the SDK 57 docs and the existing project patterns first.
