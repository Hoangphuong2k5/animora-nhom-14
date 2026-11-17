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
  WeightLog,
  formatDisplayDate,
  formatWeightNumber,
  offsetDaysIso,
  toLocalIsoDate,
  translateSpecies,
} from '@/data/petProfilesData';

const DEFAULT_SPECIES_PHOTOS: Record<PetSpecies, string> = {
  Chó: '/assets/images/hero_golden_retriever_1793177482877.jpg',
  Mèo: '/assets/images/about_fluffy_cat_1793177483392.jpg',
  Thỏ: '/assets/adoption/tuyet-nhung-1.jpg',
  Hamster: '/assets/adoption/banh-quy-1.jpg',
  Chim: '/assets/adoption/kiwi-1.jpg',
  'Bò sát': '/assets/images/about_fluffy_cat_1793177483392.jpg',
  Khác: '/assets/images/about_fluffy_cat_1793177483392.jpg',
};

interface AddPetModalProps {
  open: boolean;
  lang: Language;
  onOpenChange: (open: boolean) => void;
  onAddNewPet: (created: PetProfileEntity, initialWeightLog: WeightLog) => void;
}

function AddPetFormInner({
  lang,
  onCancel,
  onAddNewPet,
}: {
  lang: Language;
  onCancel: () => void;
  onAddNewPet: (created: PetProfileEntity, initialWeightLog: WeightLog) => void;
}) {
  const [newPetName, setNewPetName] = useState('');
  const [newPetSpecies, setNewPetSpecies] = useState<PetSpecies>('Mèo');
  const [newPetBreed, setNewPetBreed] = useState('');
  const [newPetGender, setNewPetGender] = useState<Gender>('Cái');
  const [newPetBirthDate, setNewPetBirthDate] = useState('2025-04-10');
  const [newPetWeight, setNewPetWeight] = useState('3.2');
  const [newPetAllergies, setNewPetAllergies] = useState('');
  const [newPetMicrochip, setNewPetMicrochip] = useState('');
  const [newPetNote, setNewPetNote] = useState('');
  const [newPetNeutered, setNewPetNeutered] = useState(false);
  const birthDateInputRef = useRef<HTMLInputElement | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPetName.trim()) return;

    const newId = 'pet-' + Date.now();
    const kgNum = parseFloat(newPetWeight.replace(',', '.')) || 2.5;
    const formattedW = `${formatWeightNumber(kgNum, lang)} kg`;
    const now = new Date();

    const created: PetProfileEntity = {
      id: newId,
      name: newPetName.trim(),
      species: newPetSpecies,
      breed: newPetBreed.trim() || newPetSpecies,
      breedEn: newPetBreed.trim() || translateSpecies(newPetSpecies, 'en'),
      gender: newPetGender,
      birthDate: newPetBirthDate || toLocalIsoDate(now),
      age: '1 tuổi',
      ageEn: '1 year old',
      weight: formattedW,
      coatColor: '',
      coatColorEn: '',
      allergies: newPetAllergies.trim() || 'Không có',
      allergiesEn: newPetAllergies.trim() || 'None',
      microchip: newPetMicrochip.trim() || 'Chưa gắn vi mạch',
      note: newPetNote.trim() || undefined,
      photo: DEFAULT_SPECIES_PHOTOS[newPetSpecies],
      neutered: newPetNeutered,
      vaccinated: false,
      nextCheckupDate: offsetDaysIso(30, now),
      owner: 'Chủ nuôi Animora',
    };

    const initialLog: WeightLog = {
      id: 'w-' + Date.now(),
      pet: newId,
      date: toLocalIsoDate(now),
      kg: kgNum,
    };

    onAddNewPet(created, initialLog);
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
            data-testid="add-pet-name-input"
            value={newPetName}
            onChange={(e) => setNewPetName(e.target.value)}
            placeholder="e.g. Bún, Kiki"
            className="form-input w-full"
          />
        </div>

        <div className="space-y-1">
          <label
            className="text-[13px] font-bold block"
            style={{ color: 'var(--text)' }}
          >
            {lang === 'vi' ? 'Loài' : 'Species'}
          </label>
          <Select
            value={newPetSpecies}
            onValueChange={(val) => {
              if (val !== null) setNewPetSpecies(val as PetSpecies);
            }}
            items={{
              Mèo: lang === 'vi' ? 'Mèo' : 'Cat',
              Chó: lang === 'vi' ? 'Chó' : 'Dog',
              Thỏ: lang === 'vi' ? 'Thỏ' : 'Rabbit',
              Hamster: 'Hamster',
              Chim: lang === 'vi' ? 'Chim / Vẹt' : 'Bird',
            }}
          >
            <SelectTrigger className="form-input w-full h-11! cursor-pointer">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-(--surface) border-(--border) text-(--text)">
              <SelectItem value="Mèo">{lang === 'vi' ? 'Mèo' : 'Cat'}</SelectItem>
              <SelectItem value="Chó">{lang === 'vi' ? 'Chó' : 'Dog'}</SelectItem>
              <SelectItem value="Thỏ">
                {lang === 'vi' ? 'Thỏ' : 'Rabbit'}
              </SelectItem>
              <SelectItem value="Hamster">Hamster</SelectItem>
              <SelectItem value="Chim">
                {lang === 'vi' ? 'Chim / Vẹt' : 'Bird'}
              </SelectItem>
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
            {lang === 'vi' ? 'Giống / loài' : 'Breed'}
          </label>
          <input
            type="text"
            value={newPetBreed}
            onChange={(e) => setNewPetBreed(e.target.value)}
            placeholder="e.g. Corgi, British Shorthair"
            className="form-input w-full"
          />
        </div>

        <div className="space-y-1">
          <label
            className="text-[13px] font-bold block"
            style={{ color: 'var(--text)' }}
          >
            {lang === 'vi' ? 'Giới tính' : 'Gender'}
          </label>
          <Select
            value={newPetGender}
            onValueChange={(val) => {
              if (val !== null) setNewPetGender(val as Gender);
            }}
            items={{
              Cái: lang === 'vi' ? 'Cái' : 'Female',
              Đực: lang === 'vi' ? 'Đực' : 'Male',
            }}
          >
            <SelectTrigger className="form-input w-full h-11! cursor-pointer">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-(--surface) border-(--border) text-(--text)">
              <SelectItem value="Cái">
                {lang === 'vi' ? 'Cái' : 'Female'}
              </SelectItem>
              <SelectItem value="Đực">
                {lang === 'vi' ? 'Đực' : 'Male'}
              </SelectItem>
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
                {newPetBirthDate
                  ? formatDisplayDate(newPetBirthDate, lang)
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
              value={newPetBirthDate}
              onChange={(e) => setNewPetBirthDate(e.target.value)}
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
              value={newPetWeight}
              onChange={(e) => setNewPetWeight(e.target.value.replace(/\s*kg$/i, ''))}
              placeholder="3.2"
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
            value={newPetMicrochip}
            onChange={(e) => setNewPetMicrochip(e.target.value)}
            placeholder="VN-900..."
            className="form-input w-full"
          />
        </div>

        <div className="space-y-1">
          <label
            className="text-[13px] font-bold block"
            style={{ color: 'var(--text)' }}
          >
            {lang === 'vi' ? 'Dị ứng (nếu có)' : 'Allergies (if any)'}
          </label>
          <input
            type="text"
            value={newPetAllergies}
            onChange={(e) => setNewPetAllergies(e.target.value)}
            placeholder={lang === 'vi' ? 'Không có' : 'None'}
            className="form-input w-full"
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
            {newPetNote.length}/300
          </span>
        </div>
        <Textarea
          rows={3}
          value={newPetNote}
          onChange={(e) => setNewPetNote(e.target.value.slice(0, 300))}
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
          checked={newPetNeutered}
          onCheckedChange={(checked) => setNewPetNeutered(Boolean(checked))}
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
          data-testid="add-pet-submit-btn"
          className="btn-primary px-6 py-2.5 text-[14px] font-bold shadow-md cursor-pointer"
        >
          {lang === 'vi' ? 'Thêm bé mới' : 'Add new pet'}
        </button>
      </div>
    </form>
  );
}

export const AddPetModal = ({
  open,
  lang,
  onOpenChange,
  onAddNewPet,
}: AddPetModalProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        aria-label={lang === 'vi' ? 'Thêm bé mới' : 'Add new pet'}
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
          {lang === 'vi' ? 'Thêm hồ sơ thú cưng mới' : 'Add new pet profile'}
        </DialogTitle>

        {open && (
          <AddPetFormInner
            lang={lang}
            onCancel={() => onOpenChange(false)}
            onAddNewPet={onAddNewPet}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};

