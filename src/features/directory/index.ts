export {
  CONTACT_TYPE_COLORS,
  CONTACT_TYPE_LABELS,
  createDirectorySections,
  createFourDigitExtension,
  formatDialNumber,
  getContactActionUrl,
  getContactDisplayValue,
  getContactsForHospital,
  isEmailContact,
  isFissoContact,
  isFourDigitExtension,
  isValidEmailAddress,
  normalizePhonePrefix,
  sortContactsAlphabetically,
} from "./helpers";
export {
  DEFAULT_HOSPITAL_ID,
  DIRECTORY_CONTACTS,
  HOSPITALS,
} from "./mock-data";
export {
  DirectoryProvider,
  type DirectoryContextValue,
  useDirectory,
} from "./directory-provider";
export type {
  CicalinoContact,
  ContactId,
  ContactType,
  DirectoryContact,
  DirectoryContactBase,
  DirectoryContactKind,
  DirectoryPreferences,
  DirectorySection,
  EmailContact,
  FissoContact,
  FourDigitExtension,
  Hospital,
  HospitalId,
} from "./types";
