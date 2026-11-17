/**
 * DTOs cho phân hệ Thú cưng (AnimoraDB ver 1.5)
 */
const toPetDTO = (pet) => {
  if (!pet) return null;
  const id = Number(pet.PetID ?? pet.id);
  const name = pet.PetName ?? pet.name ?? '';
  const speciesName = pet.SpeciesName ?? pet.species ?? null;
  const breedName = pet.BreedName ?? pet.breed ?? null;
  const weight =
    pet.WeightKg !== null && pet.WeightKg !== undefined
      ? Number(pet.WeightKg)
      : pet.weight !== null && pet.weight !== undefined
        ? Number(pet.weight)
        : null;

  return Object.freeze({
    id,
    PetID: id,
    species_id: Number(pet.SpeciesID ?? pet.species_id),
    breed_id:
      pet.BreedID !== null && pet.BreedID !== undefined
        ? Number(pet.BreedID)
        : pet.breed_id
          ? Number(pet.breed_id)
          : null,
    customer_id: pet.CustomerID ? Number(pet.CustomerID) : null,
    owner_user_id: pet.OwnerUserID ? Number(pet.OwnerUserID) : pet.owner_id ? Number(pet.owner_id) : null,
    name,
    PetName: name,
    species: speciesName,
    breed: breedName,
    birth_date: pet.BirthDate ?? pet.birth_date ?? null,
    gender: pet.Gender ?? pet.gender ?? 'Unknown',
    color: pet.Color ?? pet.color ?? null,
    weight_kg: weight,
    weight,
    microchip_number: pet.MicrochipNumber ?? pet.microchip_number ?? null,
    general_notes: pet.GeneralNotes ?? pet.general_notes ?? null,
    avatar: pet.PrimaryImageUrl ?? pet.avatar ?? null,
    is_active: pet.IsActive !== undefined ? Boolean(pet.IsActive) : true,
    created_at: pet.CreatedAt ?? pet.created_at ?? null,
    updated_at: pet.UpdatedAt ?? pet.updated_at ?? null,
    images: Array.isArray(pet.images)
      ? pet.images.map((img) => ({
          id: Number(img.PetImageID ?? img.id),
          image_url: img.ImageUrl ?? img.image_url,
          is_primary: Boolean(img.IsPrimary ?? img.is_primary),
        }))
      : undefined,
    vaccinations: Array.isArray(pet.vaccinations) ? pet.vaccinations : undefined,
    dewormings: Array.isArray(pet.dewormings) ? pet.dewormings : undefined,
  });
};

const toSpeciesDTO = (species) =>
  Object.freeze({
    id: Number(species.SpeciesID),
    name: String(species.SpeciesName),
    description: species.Description || null,
    breeds: Array.isArray(species.breeds)
      ? species.breeds.map((b) => ({
          id: Number(b.BreedID),
          species_id: Number(b.SpeciesID),
          name: String(b.BreedName),
          description: b.Description || null,
        }))
      : [],
  });

export { toPetDTO, toSpeciesDTO };
export default { toPetDTO, toSpeciesDTO };

