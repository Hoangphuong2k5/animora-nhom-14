import React, { useRef, useState } from 'react';
import { Calendar, X } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Gender, Language, PetSpecies } from '@/types';
import {
  PetProfileEntity,
  formatDisplayDate,
  formatWeightNumber,
  translateSpecies,
} from '@/data/petProfilesData';

const EDIT_SPECIES_OPTIONS: PetSpecies[] = [
  'Mèo',
  'Chó',
  'Thỏ',
  'Hamster',
  'Chim',
  'Bò sát',
  'Khác',
];

function toIsoDateValue(raw?: string): string {
  if (!raw) return '';
  const trimmed = raw.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed;
  const dmy = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(trimmed);
  if (dmy) return `${dmy[3]}-${dmy[2]}-${dmy[1]}`;
  return '';
}

function computeAgeLabels(
  birthDateIso: string,
  fallbackVi: string,
  fallbackEn?: string
): { age: string; ageEn: string } {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(birthDateIso)) {
    return { age: fallbackVi, ageEn: fallbackEn || fallbackVi };
  }
  const dob = new Date(`${birthDateIso}T00:00:00`);
  if (Number.isNaN(dob.getTime())) {
    return { age: fallbackVi, ageEn: fallbackEn || fallbackVi };
  }
  const now = new Date();
  const months =
    (now.getFullYear() - dob.getFullYear()) * 12 +
    (now.getMonth() - dob.getMonth());
  if (months < 1) {
    return { age: 'Dưới 1 tháng', ageEn: 'Under 1 month' };
  }
  if (months < 12) {
    return { age: `${months} tháng`, ageEn: `${months} months` };
  }
  const years = Math.floor(months / 12);
  const remMonths = months % 12;
  if (remMonths >= 6 && years < 3) {
    const halfYears = years + 0.5;
    return {
      age: `${halfYears} tuổi`,
      ageEn: `${halfYears} years old`,
    };
  }
  return {
    age: `${years} tuổi`,
    ageEn: years === 1 ? '1 year old' : `${years} years old`,
  };
}

interface EditPetModalProps {
  open: boolean;
  lang: Language;
  activePet: PetProfileEntity;
  onOpenChange: (open: boolean) => void;
  onSaveEditPet: (updatedPet: PetProfileEntity) => void;
}

function EditPetFormInner({
  lang,
  activePet,
  onCancel,
  onSaveEditPet,
}: {
  lang: Language;
  activePet: PetProfileEntity;
  onCancel: () => void;
  onSaveEditPet: (updatedPet: PetProfileEntity) => void;
}) {
  const [editName, setEditName] = useState(activePet.name);
  const [editSpecies, setEditSpecies] = useState<PetSpecies>(activePet.species);
  const [editGender, setEditGender] = useState<Gender>(activePet.gender);
  const [editBreed, setEditBreed] = useState(
    lang === 'en' && activePet.breedEn ? activePet.breedEn : activePet.breed
  );
  const [editBirthDate, setEditBirthDate] = useState(
    toIsoDateValue(activePet.birthDate) || '2024-03-14'
  );
  const [editWeightStr, setEditWeightStr] = useState(() =>
    activePet.weight.replace(/\s*kg$/i, '').trim()
  );
  const [editAllergies, setEditAllergies] = useState(
    lang === 'en' && activePet.allergiesEn
      ? activePet.allergiesEn
      : activePet.allergies
  );
  const [editMicrochip, setEditMicrochip] = useState(activePet.microchip);
  const [editNextCheckupDate, setEditNextCheckupDate] = useState(
    toIsoDateValue(activePet.nextCheckupDate)
  );
  const [editNote, setEditNote] = useState(activePet.note || '');
  const [editNeutered, setEditNeutered] = useState(activePet.neutered);
  const birthDateInputRef = useRef<HTMLInputElement | null>(null);
  const checkupDateInputRef = useRef<HTMLInputElement | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName.trim()) return;

    const birthChanged =
      editBirthDate && editBirthDate !== toIsoDateValue(activePet.birthDate);
    const nextAges = birthChanged
      ? computeAgeLabels(editBirthDate, activePet.age, activePet.ageEn)
      : { age: activePet.age, ageEn: activePet.ageEn };

    const trimmedAllergies = editAllergies.trim();
    const cleanedWeight = editWeightStr.replace(/\s*kg$/i, '').trim();
    const parsedWeight = parseFloat(cleanedWeight.replace(',', '.'));
    const nextWeight = cleanedWeight
      ? Number.isFinite(parsedWeight)
        ? `${formatWeightNumber(parsedWeight, lang)} kg`
        : `${cleanedWeight} kg`
      : activePet.weight;

    const updated: PetProfileEntity = {
      ...activePet,
      name: editName.trim(),
      species: editSpecies,
      gender: editGender,
      breed: editBreed.trim() || activePet.breed,
      breedEn: lang === 'en' ? editBreed.trim() || activePet.breedEn : activePet.breedEn,
      birthDate: editBirthDate || activePet.birthDate,
      age: nextAges.age,
      ageEn: nextAges.ageEn,
      weight: nextWeight,
      allergies:
        lang === 'vi'
          ? trimmedAllergies || 'Không có'
          : activePet.allergies || 'Không có',
      allergiesEn:
        lang === 'en'
          ? trimmedAllergies || 'None'
          : trimmedAllergies || 'None',
      microchip: editMicrochip.trim() || activePet.microchip,
      note: editNote.trim() || undefined,
      nextCheckupDate: editNextCheckupDate || activePet.nextCheckupDate,
      neutered: editNeutered,
    };

    onSaveEditPet(updated);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3.5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1">
          <label
            className="text-[13px] font-bold block"
            style={{ color: 'var(--text)' }}
          >
            {lang === 'vi' ? 'Tên bé *' : 'Pet name *'}
          </label>
          <input
            type="text"
            required
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            className="form-input w-full"
          />
        </div>
        <div className="space-y-1">
          <label
            className="text-[13px] font-bold block"
            style={{ color: 'var(--text)' }}
          >
            {lang === 'vi' ? 'Loài *' : 'Species *'}
          </label>
          <Select
            value={editSpecies}
            onValueChange={(val) => setEditSpecies(val as PetSpecies)}
          >
            <SelectTrigger className="form-input w-full h-[46px] text-[15px] font-normal">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-[var(--surface)] border-[var(--border)] text-[var(--text)]">
              {EDIT_SPECIES_OPTIONS.map((sp) => (
                <SelectItem key={sp} value={sp}>
                  {translateSpecies(sp, lang)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1">
          <label
            className="text-[13px] font-bold block"
            style={{ color: 'var(--text)' }}
          >
            {lang === 'vi' ? 'Giới tính' : 'Gender'}
          </label>
          <Select
            value={editGender}
            onValueChange={(val) => setEditGender(val as Gender)}
          >
            <SelectTrigger className="form-input w-full h-[46px] text-[15px] font-normal">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-[var(--surface)] border-[var(--border)] text-[var(--text)]">
              <SelectItem value="Cái">{lang === 'vi' ? 'Cái' : 'Female'}</SelectItem>
              <SelectItem value="Đực">{lang === 'vi' ? 'Đực' : 'Male'}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <label
            className="text-[13px] font-bold block"
            style={{ color: 'var(--text)' }}
          >
            {lang === 'vi' ? 'Giống' : 'Breed'}
          </label>
          <input
            type="text"
            value={editBreed}
            onChange={(e) => setEditBreed(e.target.value)}
            className="form-input w-full"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1">
          <label
            className="text-[13px] font-bold block"
            style={{ color: 'var(--text)' }}
          >
            {lang === 'vi' ? 'Ngày sinh' : 'Date of birth'}
          </label>
          <div className="relative">
            <div
              onClick={() => {
                const el = birthDateInputRef.current as
                  | (HTMLInputElement & { showPicker?: () => void })
                  | null;
                el?.showPicker?.();
                el?.focus();
              }}
              className="form-input w-full h-[46px] flex items-center justify-between gap-2 cursor-pointer"
            >
              <span className="tabular-nums text-[15px]">
                {editBirthDate
                  ? formatDisplayDate(editBirthDate, lang)
                  : 'dd-mm-yyyy'}
              </span>
              <Calendar
                className="w-4 h-4 shrink-0"
                style={{ color: 'var(--text-muted)' }}
              />
            </div>
            <input
              ref={birthDateInputRef}
              type="date"
              value={editBirthDate}
              onChange={(e) => setEditBirthDate(e.target.value)}
              onClick={(e) => {
                const el = e.currentTarget as HTMLInputElement & {
                  showPicker?: () => void;
                };
                el.showPicker?.();
              }}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
          </div>
        </div>
        <div className="space-y-1">
          <label
            className="text-[13px] font-bold block"
            style={{ color: 'var(--text)' }}
          >
            {lang === 'vi' ? 'Cân nặng' : 'Weight'}
          </label>
          <div className="relative">
            <input
              type="text"
              inputMode="decimal"
              value={editWeightStr}
              onChange={(e) => setEditWeightStr(e.target.value.replace(/\s*kg$/i, ''))}
              placeholder="3.8"
              className="form-input w-full pr-10"
            />
            <span
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[13px] font-semibold pointer-events-none"
              style={{ color: 'var(--text-muted)' }}
            >
              kg
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1">
          <label
            className="text-[13px] font-bold block"
            style={{ color: 'var(--text)' }}
          >
            {lang === 'vi' ? 'Mã vi mạch' : 'Microchip'}
          </label>
          <input
            type="text"
            value={editMicrochip}
            onChange={(e) => setEditMicrochip(e.target.value)}
            className="form-input w-full"
          />
        </div>
        <div className="space-y-1">
          <label
            className="text-[13px] font-bold block"
            style={{ color: 'var(--text)' }}
          >
            {lang === 'vi' ? 'Dị ứng' : 'Allergies'}
          </label>
          <input
            type="text"
            value={editAllergies}
            onChange={(e) => setEditAllergies(e.target.value)}
            className="form-input w-full"
          />
        </div>
      </div>

      <div className="space-y-1">
        <label
          className="text-[13px] font-bold block"
          style={{ color: 'var(--text)' }}
        >
          {lang === 'vi' ? 'Khám định kỳ tiếp theo' : 'Next checkup'}
        </label>
        <div className="relative">
          <div
            onClick={() => {
              const el = checkupDateInputRef.current as
                | (HTMLInputElement & { showPicker?: () => void })
                | null;
              el?.showPicker?.();
              el?.focus();
            }}
            className="form-input w-full h-[46px] flex items-center justify-between gap-2 cursor-pointer"
          >
            <span className="tabular-nums text-[15px]">
              {editNextCheckupDate
                ? formatDisplayDate(editNextCheckupDate, lang)
                : 'dd-mm-yyyy'}
            </span>
            <Calendar
              className="w-4 h-4 shrink-0"
              style={{ color: 'var(--text-muted)' }}
            />
          </div>
          <input
            ref={checkupDateInputRef}
            type="date"
            value={editNextCheckupDate}
            onChange={(e) => setEditNextCheckupDate(e.target.value)}
            onClick={(e) => {
              const el = e.currentTarget as HTMLInputElement & {
                showPicker?: () => void;
              };
              el.showPicker?.();
            }}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between gap-2">
          <label
            className="text-[13px] font-bold block"
            style={{ color: 'var(--text)' }}
          >
            {lang === 'vi' ? 'Ghi chú thêm' : 'Additional notes'}
          </label>
          <span
            className="text-[12px] font-semibold tabular-nums"
            style={{ color: 'var(--text-muted)' }}
          >
            {editNote.length}/300
          </span>
        </div>
        <Textarea
          rows={3}
          value={editNote}
          onChange={(e) => setEditNote(e.target.value.slice(0, 300))}
          placeholder={
            lang === 'vi'
              ? 'Ví dụ: Bé sợ tiếng máy sấy, nhạy cảm ở vùng tai...'
              : 'e.g. Afraid of loud hair dryers, sensitive around ears...'
          }
          className="w-full p-3.5 rounded-[14px] border text-[15px] leading-relaxed focus-visible:outline-2 focus-visible:outline-[#FF7F6B]"
          style={{
            backgroundColor: 'var(--bg)',
            borderColor: 'var(--border)',
            color: 'var(--text)',
          }}
        />
        <p className="text-[12px]" style={{ color: 'var(--text-muted)' }}>
          {lang === 'vi'
            ? 'Chia sẻ thói quen hoặc lưu ý sức khỏe đặc biệt của bé.'
            : 'Share any special habits or health notes for your pet.'}
        </p>
      </div>

      <label className="inline-flex items-center gap-2 pt-1 cursor-pointer select-none">
        <Checkbox
          checked={editNeutered}
          onCheckedChange={(checked) => setEditNeutered(Boolean(checked))}
          className="cursor-pointer data-checked:bg-(--primary) data-checked:border-(--primary) data-checked:text-(--on-primary)"
        />
        <span className="text-[14px] font-bold" style={{ color: 'var(--text)' }}>
          {lang === 'vi' ? 'Đã triệt sản' : 'Neutered'}
        </span>
      </label>

      <div className="pt-3 flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="btn-secondary px-5 py-2.5 text-[14px] font-bold cursor-pointer"
        >
          {lang === 'vi' ? 'Hủy' : 'Cancel'}
        </button>
        <button
          type="submit"
          className="btn-primary px-6 py-2.5 text-[14px] font-bold shadow-md cursor-pointer"
        >
          {lang === 'vi' ? 'Lưu thay đổi' : 'Save changes'}
        </button>
      </div>
    </form>
  );
}

export const EditPetModal = ({
  open,
  lang,
  activePet,
  onOpenChange,
  onSaveEditPet,
}: EditPetModalProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        aria-label={lang === 'vi' ? 'Sửa thông tin thú cưng' : 'Edit pet info'}
        className="animora-card sm:max-w-lg p-6 gap-4 max-h-[92vh] overflow-y-auto scrollbar-thin"
      >
        <button
          type="button"
          onClick={() => onOpenChange(false)}
          aria-label={lang === 'vi' ? 'Đóng' : 'Close'}
          className="absolute top-5 right-5 p-2 rounded-full hover:bg-[var(--surface-2)] cursor-pointer"
          style={{ color: 'var(--text-muted)' }}
        >
          <X className="w-5 h-5" />
        </button>

        <DialogTitle
          className="font-heading text-2xl font-bold leading-snug pr-8"
          style={{ color: 'var(--text)' }}
        >
          {lang === 'vi'
            ? `Sửa thông tin — ${activePet.name}`
            : `Edit info — ${activePet.name}`}
        </DialogTitle>

        {open && (
          <EditPetFormInner
            key={activePet.id}
            lang={lang}
            activePet={activePet}
            onCancel={() => onOpenChange(false)}
            onSaveEditPet={onSaveEditPet}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};

