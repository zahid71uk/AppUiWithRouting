import { z } from "zod";

const requiredNumber = (label: string) =>
  z
    .string()
    .trim()
    .min(1, `${label} is required.`)
    .refine((value) => Number.isFinite(Number(value)), `${label} must be a number.`)
    .transform(Number);

const squareFootageValue = z.number().finite().gt(0, "Square footage must be greater than 0.");
const bedroomsValue = z.number().finite().int("Bedrooms must be a whole number.").min(0, "Bedrooms cannot be negative.");
const bathroomsValue = z.number().finite().min(0, "Bathrooms cannot be negative.");
const yearBuiltValue = z.number().finite().int("Year built must be a whole number.").min(1800, "Year built must be 1800 or later.").max(2100, "Year built must be 2100 or earlier.");
const lotSizeValue = z.number().finite().gt(0, "Lot size must be greater than 0.");
const distanceValue = z.number().finite().min(0, "Distance cannot be negative.");
const schoolRatingValue = z.number().finite().min(0, "School rating must be from 0 to 10.").max(10, "School rating must be from 0 to 10.");

export const propertySchema = z.object({
  square_footage: squareFootageValue,
  bedrooms: bedroomsValue,
  bathrooms: bathroomsValue,
  year_built: yearBuiltValue,
  lot_size: lotSizeValue,
  distance_to_city_center: distanceValue,
  school_rating: schoolRatingValue,
}).strict();

export const propertyFormSchema = propertySchema
  .omit({
    square_footage: true,
    bedrooms: true,
    bathrooms: true,
    year_built: true,
    lot_size: true,
    distance_to_city_center: true,
    school_rating: true,
  })
  .extend({
    square_footage: requiredNumber("Square footage").pipe(squareFootageValue),
    bedrooms: requiredNumber("Bedrooms").pipe(bedroomsValue),
    bathrooms: requiredNumber("Bathrooms").pipe(bathroomsValue),
    year_built: requiredNumber("Year built").pipe(yearBuiltValue),
    lot_size: requiredNumber("Lot size").pipe(lotSizeValue),
    distance_to_city_center: requiredNumber("Distance to city center").pipe(distanceValue),
    school_rating: requiredNumber("School rating").pipe(schoolRatingValue),
    label: z.string().trim().max(48, "Use 48 characters or fewer.").optional(),
  })
  .strict();

export const estimateRequestSchema = z
  .object({ house: propertySchema })
  .strict();

export type PropertyInput = z.output<typeof propertySchema>;
export type PropertyFormInput = z.input<typeof propertyFormSchema>;

export const estimateRecordSchema = z
  .object({
    id: z.string(),
    label: z.string(),
    property: propertySchema,
    predictedPrice: z.number().finite(),
    createdAt: z.string().datetime(),
  })
  .strict();

export type EstimateRecord = z.infer<typeof estimateRecordSchema>;