export type HospitalId = string;

export type ContactId = string;

export type ContactType = "fisso" | "cicalino" | "email";

export type DirectoryContactKind = "reparto" | "servizio" | "ruolo";

declare const fourDigitExtensionBrand: unique symbol;

/**
 * A four-digit internal hospital extension.
 *
 * Values enter the domain through `createFourDigitExtension`, which performs
 * the runtime validation that a plain TypeScript string cannot provide.
 */
export type FourDigitExtension = string & {
  readonly [fourDigitExtensionBrand]: "FourDigitExtension";
};

export interface Hospital {
  readonly id: HospitalId;
  readonly name: string;
  readonly city: string;
  /** Prefix dialled before a four-digit internal extension. */
  readonly phonePrefix: string;
}

export interface DirectoryContactBase {
  readonly id: ContactId;
  readonly hospitalId: HospitalId;
  readonly name: string;
  readonly kind: DirectoryContactKind;
  readonly searchTerms?: readonly string[];
}

export interface FissoContact extends DirectoryContactBase {
  readonly type: "fisso";
  readonly value: FourDigitExtension;
}

export interface CicalinoContact extends DirectoryContactBase {
  readonly type: "cicalino";
  readonly value: string;
}

export interface EmailContact extends DirectoryContactBase {
  readonly type: "email";
  readonly value: string;
}

export type DirectoryContact = FissoContact | CicalinoContact | EmailContact;

export interface DirectoryPreferences {
  readonly version: 1;
  readonly selectedHospitalId: HospitalId;
  readonly favoriteContactIds: readonly ContactId[];
}

export interface DirectorySection {
  readonly title: string;
  readonly data: readonly DirectoryContact[];
}
