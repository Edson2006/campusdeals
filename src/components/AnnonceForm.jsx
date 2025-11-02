import { useEffect, useState, useMemo } from 'react';

const defaultAnnonce = {
  title: '',
  description: '',
  price: '',
  category: '',
  status: 'active',
  imageUrls: []
};

const statusOptions = [
  { value: 'active', label: 'Active' },
  { value: 'sold', label: 'Vendue' },
  { value: 'archived', label: 'Archivée' }
];

export default function AnnonceForm({
  initialData = defaultAnnonce,
  mode = 'create',
  onSubmit,
  onCancel,
  isSubmitting = false
}) {
  const [formData, setFormData] = useState(defaultAnnonce);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [retainedImages, setRetainedImages] = useState([]);

  useEffect(() => {
    setFormData({
      title: initialData.title || '',
      description: initialData.description || '',
      price: initialData.price !== undefined && initialData.price !== null ? String(initialData.price) : '',
      category: initialData.category || '',
      status: initialData.status || 'active'
    });
    setRetainedImages(initialData.imageUrls || []);
    setSelectedFiles([]);
  }, [initialData, mode]);

  const isEditMode = useMemo(() => mode === 'edit', [mode]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (event) => {
    const files = event.target.files ? Array.from(event.target.files).slice(0, 4) : [];
    setSelectedFiles(files);
  };

  const toggleRetainedImage = (url) => {
    setRetainedImages((prev) =>
      prev.includes(url) ? prev.filter((item) => item !== url) : [...prev, url]
    );
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!onSubmit || isSubmitting) return;

    try {
      await onSubmit({
        ...formData,
        imageFiles: selectedFiles,
        retainImageUrls: retainedImages
      });

      if (!isEditMode) {
        setFormData(defaultAnnonce);
        setRetainedImages([]);
      }
      setSelectedFiles([]);
      event.target.reset();
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('[AnnonceForm] submit error', error);
      }
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 rounded-3xl border border-white/10 bg-white/5 p-8 shadow-xl shadow-indigo-500/15 backdrop-blur-xl"
    >
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-3">
          <label htmlFor="title" className="text-xs font-semibold uppercase tracking-[0.3em] text-white/60">
            Titre
          </label>
          <input
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            placeholder="Ex: Calculatrice Casio fx-92"
            className="w-full rounded-2xl border border-white/20 bg-slate-900/60 px-4 py-3 text-sm text-white shadow-inner shadow-white/10 outline-none transition focus:border-white/40 focus:ring-2 focus:ring-indigo-400/70"
          />
        </div>
        <div className="space-y-3">
          <label htmlFor="category" className="text-xs font-semibold uppercase tracking-[0.3em] text-white/60">
            Catégorie
          </label>
          <input
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            required
            placeholder="Ex: livres"
            className="w-full rounded-2xl border border-white/20 bg-slate-900/60 px-4 py-3 text-sm text-white shadow-inner shadow-white/10 outline-none transition focus:border-white/40 focus:ring-2 focus:ring-indigo-400/70"
          />
        </div>
      </div>

      <div className="space-y-3">
        <label htmlFor="description" className="text-xs font-semibold uppercase tracking-[0.3em] text-white/60">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          rows={4}
          value={formData.description}
          onChange={handleChange}
          required
          placeholder="Détails, état, remise en main propre..."
          className="w-full rounded-2xl border border-white/20 bg-slate-900/60 px-4 py-3 text-sm text-white shadow-inner shadow-white/10 outline-none transition focus:border-white/40 focus:ring-2 focus:ring-indigo-400/70"
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-3">
          <label htmlFor="price" className="text-xs font-semibold uppercase tracking-[0.3em] text-white/60">
            Prix (€)
          </label>
          <input
            id="price"
            name="price"
            type="number"
            min="0"
            step="0.5"
            value={formData.price}
            onChange={handleChange}
            required
            placeholder="Ex: 15"
            className="w-full rounded-2xl border border-white/20 bg-slate-900/60 px-4 py-3 text-sm text-white shadow-inner shadow-white/10 outline-none transition focus:border-white/40 focus:ring-2 focus:ring-indigo-400/70"
          />
        </div>
        {isEditMode ? (
          <div className="space-y-3">
            <label htmlFor="status" className="text-xs font-semibold uppercase tracking-[0.3em] text-white/60">
              Statut
            </label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full rounded-2xl border border-white/20 bg-slate-900/60 px-4 py-3 text-sm text-white shadow-inner shadow-white/10 outline-none transition focus:border-white/40 focus:ring-2 focus:ring-indigo-400/70"
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value} className="bg-slate-900">
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        ) : null}
      </div>

      <div className="space-y-3">
        <label htmlFor="images" className="text-xs font-semibold uppercase tracking-[0.3em] text-white/60">
          Photos (jusqu'à 4)
        </label>
        <input
          id="images"
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileChange}
          className="block w-full text-sm text-white/80 file:mr-4 file:rounded-full file:border-0 file:bg-indigo-500/90 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-indigo-500"
        />
        {selectedFiles.length ? (
          <p className="text-xs text-white/50">
            {selectedFiles.length} nouvelle(s) image(s) sélectionnée(s)
          </p>
        ) : null}
        {isEditMode && initialData.imageUrls?.length ? (
          <div className="flex flex-wrap gap-3 pt-2">
            {initialData.imageUrls.map((url) => {
              const isKept = retainedImages.includes(url);
              return (
                <button
                  type="button"
                  key={url}
                  onClick={() => toggleRetainedImage(url)}
                  className={`group relative h-24 w-24 overflow-hidden rounded-2xl border ${
                    isKept ? 'border-emerald-400/70' : 'border-white/15'
                  }`}
                >
                  <img src={url} alt="annonce" className="h-full w-full object-cover" />
                  <span className="absolute inset-0 flex items-center justify-center bg-slate-900/70 text-[10px] font-semibold uppercase tracking-widest text-white opacity-0 transition group-hover:opacity-100">
                    {isKept ? 'Conservée' : 'Retirée'}
                  </span>
                </button>
              );
            })}
          </div>
        ) : null}
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 px-6 py-3 text-sm font-semibold uppercase tracking-[0.25em] text-white shadow-lg shadow-indigo-500/40 transition hover:shadow-2xl disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSubmitting ? 'En cours...' : isEditMode ? 'Mettre à jour' : 'Publier'}
        </button>
        {onCancel ? (
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex items-center justify-center rounded-2xl border border-white/20 px-6 py-3 text-sm font-semibold uppercase tracking-[0.25em] text-white/80 transition hover:border-white/40 hover:text-white"
          >
            Annuler
          </button>
        ) : null}
      </div>
    </form>
  );
}
